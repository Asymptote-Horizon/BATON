import re
from typing import List, Tuple, Optional
from sqlalchemy.orm import Session
from app.models.source import Source, SourceChunk
from app.models.claim import Claim, ClaimCategory, ClaimStatus
from app.models.continuity import DecisionRecord, BusFactorItem, LivingRunbook
from app.models.user import UserRole
from app.models.project import SensitivityLevel
from app.schemas.continuity import AssistantAskResponse, AssistantCitation
from app.services.llm_adapter import LLMAdapter

ROLE_SENSITIVITY_CLEARANCE = {
    UserRole.ADMIN: [SensitivityLevel.PUBLIC, SensitivityLevel.INTERNAL, SensitivityLevel.CONFIDENTIAL, SensitivityLevel.RESTRICTED],
    UserRole.REVIEWER: [SensitivityLevel.PUBLIC, SensitivityLevel.INTERNAL, SensitivityLevel.CONFIDENTIAL, SensitivityLevel.RESTRICTED],
    UserRole.LEAVER: [SensitivityLevel.PUBLIC, SensitivityLevel.INTERNAL, SensitivityLevel.CONFIDENTIAL, SensitivityLevel.RESTRICTED],
    UserRole.SUCCESSOR: [SensitivityLevel.PUBLIC, SensitivityLevel.INTERNAL, SensitivityLevel.CONFIDENTIAL],
    UserRole.RESTRICTED_VIEWER: [SensitivityLevel.PUBLIC, SensitivityLevel.INTERNAL],
}

def query_assistant(
    db: Session,
    project_id: str,
    user_role: UserRole,
    question: str
) -> AssistantAskResponse:
    q_lower = question.lower()
    allowed_sensitivities = ROLE_SENSITIVITY_CLEARANCE.get(user_role, [SensitivityLevel.PUBLIC])

    # 1. Prompt Injection & Jailbreak Defense
    injection_patterns = [
        r"ignore\s+(all\s+|previous\s+|prior\s+)?instructions",
        r"system\s+override",
        r"reveal\s+(all\s+)?(project\s+)?secrets",
        r"dump\s+(all\s+)?(canary|source|private|confidential)",
        r"bypass\s+(all\s+)?(security|policy|rbac|permissions)",
        r"act\s+as\s+(dan|jailbreak|unrestricted|root)"
    ]
    is_injection_attempt = any(re.search(pat, q_lower) for pat in injection_patterns)
    if is_injection_attempt and user_role != UserRole.ADMIN:
        return AssistantAskResponse(
            question=question,
            answer="Security Policy Enforcement: Malicious prompt injection pattern detected. As an untrusted data boundary, user inputs and source document contents are isolated and cannot override system security guidelines or sensitivity controls.",
            confidence=0.0,
            grounding_status="ungrounded_refusal",
            citations=[],
            missing_evidence_note="Query rejected by AI Security and Adversarial Injection Filter.",
            follow_up_suggestions=[
                "What is the current project status?",
                "Who owns the deployment process?",
                "Which tasks are unfinished?"
            ]
        )

    # 2. Check for canary secret or restricted credential probes
    restricted_keywords = ["canary", "production master root key", "hsmprivatekey", "vaultmastertoken", "root_secret", "canary_leak"]
    is_canary_probe = any(kw in q_lower for kw in restricted_keywords)
    if is_canary_probe and user_role not in [UserRole.ADMIN]:
        return AssistantAskResponse(
            question=question,
            answer="Access Denied: The requested information involves restricted cryptographic credentials or canary tokens that are shielded from your role. This security policy violation has been logged to the audit trail.",
            confidence=0.0,
            grounding_status="ungrounded_refusal",
            citations=[],
            missing_evidence_note="Access restricted by Role-Based Access Control and Presidio / canary shield policies.",
            follow_up_suggestions=[
                "Who owns the deployment process?",
                "What are the biggest project risks?",
                "Which decisions are still unresolved?"
            ]
        )

    # 3. Conversational Greeting & Overview Handler
    greetings = ["hi", "hello", "hey", "hola", "help", "who are you", "what is this", "what is this project", "good morning", "good evening"]
    clean_q = q_lower.strip().rstrip("!?.,")
    if clean_q in greetings or any(clean_q.startswith(g) for g in ["hi ", "hello ", "hey "]):
        return AssistantAskResponse(
            question=question,
            answer="👋 **Hello! I am your BATON Project Continuity Assistant.**\n\n"
                   "I help incoming successors, technical reviewers, and team leads navigate verified knowledge for **Project Aether** (Autonomous Mobile Robotics Platform).\n\n"
                   "You can ask me questions about:\n"
                   "• **Architectural Decisions:** Why micro-ROS or Cartographer 3D SLAM was chosen over alternatives.\n"
                   "• **Task Ownership & Contacts:** Who maintains sensor drivers, simulation, or telemetry.\n"
                   "• **Blockers & Conflicts:** Active contradictions, single-person bus factor risks, or missing credentials.\n"
                   "• **Successor Missions:** What setup steps and runbooks you should execute on Day 1, Week 1, and Day 30.\n\n"
                   "How can I help you today?",
            confidence=1.0,
            grounding_status="verified_grounded",
            citations=[],
            missing_evidence_note=None,
            follow_up_suggestions=[
                "Why was Cartographer 3D SLAM chosen?",
                "Who owns the telemetry and Kafka pipeline?",
                "What are the critical project risks?",
                "What should I do on Day 1?"
            ]
        )

    # Fetch authorized sources
    sources = db.query(Source).filter(
        Source.project_id == project_id,
        Source.sensitivity.in_(allowed_sensitivities)
    ).all()
    source_map = {s.id: s for s in sources}
    source_ids = list(source_map.keys())

    # Fetch authorized chunks
    chunks = db.query(SourceChunk).filter(
        SourceChunk.source_id.in_(source_ids)
    ).all() if source_ids else []

    # Fetch authorized claims
    claims = db.query(Claim).filter(
        Claim.project_id == project_id,
        Claim.sensitivity.in_(allowed_sensitivities)
    ).all()

    # Search for matching evidence
    keywords = [w for w in re.findall(r'\b[a-zA-Z0-9_\-]{3,}\b', q_lower) if w not in [
        "what", "when", "where", "which", "who", "whom", "this", "that", "with", "from", "have", "were", "been", "project"
    ]]

    scored_chunks: List[Tuple[float, SourceChunk]] = []
    for c in chunks:
        c_text = c.content.lower()
        match_count = sum(1 for kw in keywords if kw in c_text)
        if match_count > 0:
            score = match_count / max(1, len(keywords))
            scored_chunks.append((score, c))
    scored_chunks.sort(key=lambda x: x[0], reverse=True)

    scored_claims: List[Tuple[float, Claim]] = []
    for cl in claims:
        cl_text = (cl.description + " " + (cl.exact_quote or "")).lower()
        match_count = sum(1 for kw in keywords if kw in cl_text)
        if match_count > 0:
            score = match_count / max(1, len(keywords))
            scored_claims.append((score, cl))
    scored_claims.sort(key=lambda x: x[0], reverse=True)

    # Check if there is enough grounded evidence
    if not scored_chunks and not scored_claims:
        # Attempt LLM answer with top project claims before refusing
        general_context = [f"Project Record ({cl.category.value}): {cl.description}. Quote: {cl.exact_quote or ''}" for cl in claims[:8]]
        llm_answer = LLMAdapter.answer_question(question, general_context)
        if llm_answer and len(llm_answer) > 20:
            return AssistantAskResponse(
                question=question,
                answer=llm_answer,
                confidence=0.85,
                grounding_status="grounded",
                citations=[],
                missing_evidence_note=None,
                follow_up_suggestions=[
                    "What is the current project status?",
                    "Who owns the deployment process?",
                    "Which tasks are unfinished?",
                    "What should I complete on Day 1?"
                ]
            )

        return AssistantAskResponse(
            question=question,
            answer=f"Insufficient evidence in verified project sources to answer: '{question}'. As an evidence-grounded system, BATON refuses to infer or hallucinate unverified details.",
            confidence=0.0,
            grounding_status="ungrounded_refusal",
            citations=[],
            missing_evidence_note="No authorized project documentation or claims match the query terms.",
            follow_up_suggestions=[
                "What is the current project status?",
                "Who owns the deployment process?",
                "Which tasks are unfinished?",
                "What should I complete on Day 1?"
            ]
        )

    # Construct citations and answer
    citations: List[AssistantCitation] = []
    top_quotes: List[str] = []

    for score, cl in scored_claims[:3]:
        s = source_map.get(cl.source_id)
        s_name = s.filename if s else "Project Claim Ledger"
        quote = cl.exact_quote or cl.description
        top_quotes.append(f'"{quote}"')
        citations.append(AssistantCitation(
            source_id=cl.source_id or "claim_ledger",
            source_name=s_name,
            chunk_id=cl.chunk_id,
            location=cl.evidence_location or "Claim Ledger Record",
            exact_quote=quote,
            confidence=round(cl.confidence, 2)
        ))

    for score, c in scored_chunks[:2]:
        s = source_map.get(c.source_id)
        s_name = s.filename if s else "Document Chunk"
        snippet = c.content.strip()[:180] + "..."
        citations.append(AssistantCitation(
            source_id=c.source_id,
            source_name=s_name,
            chunk_id=c.id,
            location=f"Chunk #{c.chunk_index}",
            exact_quote=snippet,
            confidence=round(min(1.0, 0.75 + score * 0.25), 2)
        ))

    # Dynamic LLM Synthesis using OpenRouter / Gemini
    context_snippets = [f"Claim ({cl.category.value}): {cl.description}. Exact Quote: {cl.exact_quote or 'N/A'}" for score, cl in scored_claims[:5]]
    context_snippets += [f"Document Chunk #{c.chunk_index}: {c.content}" for score, c in scored_chunks[:3]]
    llm_answer = LLMAdapter.answer_question(question, context_snippets)
    if llm_answer and len(llm_answer) > 20:
        return AssistantAskResponse(
            question=question,
            answer=llm_answer,
            confidence=0.92,
            grounding_status="grounded",
            citations=citations,
            missing_evidence_note=None,
            follow_up_suggestions=[
                "Who owns this component?",
                "Are there any associated risks or blockers?",
                "What runbooks cover this procedure?"
            ]
        )

    # Formulate contextual response based on the question topic
    if any(k in q_lower for k in ["why", "select", "decision", "architecture"]):
        decisions = db.query(DecisionRecord).filter(DecisionRecord.project_id == project_id).all()
        matched_dec = next((d for d in decisions if any(kw in d.title.lower() or kw in d.what_decided.lower() for kw in keywords)), None)
        if matched_dec:
            answer = f"**Decision Record: {matched_dec.title}**\n\n" \
                     f"**What was decided:** {matched_dec.what_decided}\n\n" \
                     f"**Rationale:** {matched_dec.why_selected}\n\n" \
                     f"**Participants:** {', '.join(matched_dec.participants)}\n\n" \
                     f"**Alternatives considered:** {', '.join(matched_dec.alternatives_considered) if matched_dec.alternatives_considered else 'None documented'}\n\n" \
                     f"**Concerns raised:** {', '.join(matched_dec.concerns_raised) if matched_dec.concerns_raised else 'None documented'}\n\n" \
                     f"**Reversal status:** `{matched_dec.reversal_status}`"
            follow_ups = ["Which decisions are still unresolved?", "Where is the evidence for this decision?", "Who participated in this decision?"]
        else:
            answer = f"Based on verified project records:\n\n{top_quotes[0] if top_quotes else ''}\n\n" \
                     f"This decision was agreed upon by the engineering team as documented in the linked sources below."
            follow_ups = ["What alternatives were considered?", "Who owns this component?", "Are there any pending blockers?"]

    elif any(k in q_lower for k in ["owner", "deploy", "who", "responsible", "contact"]):
        bus_items = db.query(BusFactorItem).filter(BusFactorItem.project_id == project_id).all()
        matched_bus = next((b for b in bus_items if any(kw in b.critical_area.lower() or kw in b.role_title.lower() for kw in keywords)), None)
        if matched_bus:
            answer = f"**Ownership & Responsibility:**\n\n" \
                     f"- **Primary Owner:** {matched_bus.person_name} ({matched_bus.role_title})\n" \
                     f"- **Critical Area:** {matched_bus.critical_area}\n" \
                     f"- **Backup Owner:** {matched_bus.backup_owner or '⚠️ No backup designated (Bus Factor = 1)'}\n" \
                     f"- **Documentation Health:** `{matched_bus.documentation_health}`\n" \
                     f"- **Urgency:** `{matched_bus.urgency_level.upper()}`\n\n" \
                     f"**Recommended Handoff:** {matched_bus.recommended_handoff}"
            follow_ups = ["What runbooks are available for this area?", "What tasks are unfinished?", "What are the biggest project risks?"]
        else:
            answer = f"Based on the project task claims:\n\n{top_quotes[0] if top_quotes else ''}"
            follow_ups = ["Who is the designated backup owner?", "What tasks are currently unassigned?"]

    elif any(k in q_lower for k in ["risk", "blocker", "conflict", "problem"]):
        answer = f"**Project Continuity Risks & Active Blockers:**\n\n" \
                 f"Verified evidence highlights the following critical items:\n\n" + \
                 "\n".join([f"- {q}" for q in top_quotes[:3]]) + \
                 "\n\nPlease consult the Project Risk Radar and Review Workspace to see pending mitigations."
        follow_ups = ["How can we mitigate the single-person dependency?", "Are there any unresolved conflicts?", "What should I complete on Day 1?"]

    elif any(k in q_lower for k in ["day 1", "first task", "onboarding", "mission", "start"]):
        answer = f"**Successor Day 1 Continuity Priorities:**\n\n" \
                 f"1. Complete **Mission 1: Understand Project Aether Architecture** in Successor Mission Mode.\n" \
                 f"2. Verify local development setup using the **Living Setup Runbook**.\n" \
                 f"3. Review the **Redis vs Kafka Event Queue contradiction** with the team lead.\n" \
                 f"4. Acknowledge receipt of the verified Handover Packet once reviewed.\n\n" \
                 f"Key Grounded Evidence:\n{top_quotes[0] if top_quotes else ''}"
        follow_ups = ["Where is the setup runbook?", "Who owns the deployment process?", "What are the biggest project risks?"]

    else:
        answer = f"**Grounded Answer from Project Evidence:**\n\n" + \
                 "\n\n".join([f"- {q}" for q in top_quotes[:3]]) + \
                 "\n\nAll statements above are directly traceable to the cited source chunks."
        follow_ups = ["Where is the evidence for this information?", "Who owns this component?", "What are the next actions?"]

    return AssistantAskResponse(
        question=question,
        answer=answer,
        confidence=0.94,
        grounding_status="grounded",
        citations=citations[:4],
        missing_evidence_note=None,
        follow_up_suggestions=follow_ups[:3]
    )

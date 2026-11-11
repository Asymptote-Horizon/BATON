import os
import json
import re
from typing import Dict, List, Any, Optional
import httpx
from app.config import settings

class LLMAdapter:
    """
    Swappable LLM adapter supporting:
    1. Primary: OpenRouter (openrouter/free)
    2. Fallback 1: Gemini (interactions & generateContent)
    3. Fallback 2: Claude (Anthropic)
    4. Fallback 3: Deterministic Structured Extractor (Offline / Zero-Hallucination)
    """

    @classmethod
    def _parse_json_from_response(cls, text: str) -> Optional[List[Dict[str, Any]]]:
        if not text:
            return None
        cleaned = re.sub(r"^```(?:json)?\s*", "", text.strip(), flags=re.MULTILINE)
        cleaned = re.sub(r"```\s*$", "", cleaned.strip(), flags=re.MULTILINE)

        try:
            data = json.loads(cleaned)
            if isinstance(data, list):
                return data
            if isinstance(data, dict):
                for key in ["claims", "data", "items", "results"]:
                    if key in data and isinstance(data[key], list):
                        return data[key]
                return [data]
        except Exception:
            pass

        match = re.search(r"\[\s*\{[\s\S]*\}\s*\]", text)
        if match:
            try:
                data = json.loads(match.group(0))
                if isinstance(data, list):
                    return data
            except Exception:
                pass
        return None

    @classmethod
    def _call_openrouter(cls, prompt: str) -> Optional[str]:
        if not settings.OPENROUTER_API_KEY:
            return None
        headers = {
            "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
            "Content-Type": "application/json"
        }
        model = settings.OPENROUTER_MODEL or "openrouter/free"

        # 1. Try chat/completions (OpenRouter standard)
        try:
            resp = httpx.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers=headers,
                json={
                    "model": model,
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0
                },
                timeout=25.0
            )
            if resp.status_code == 200:
                data = resp.json()
                choices = data.get("choices", [])
                if choices and "message" in choices[0]:
                    content = choices[0]["message"].get("content", "")
                    if content:
                        return content
        except Exception:
            pass

        # 2. Try /responses endpoint (OpenRouter format)
        try:
            resp = httpx.post(
                "https://openrouter.ai/api/v1/responses",
                headers=headers,
                json={
                    "model": model,
                    "input": prompt
                },
                timeout=25.0
            )
            if resp.status_code == 200:
                data = resp.json()
                output = data.get("output", [])
                for block in output:
                    if block.get("type") == "message":
                        for c in block.get("content", []):
                            if c.get("type") == "output_text" and c.get("text"):
                                return c["text"]
                for block in output:
                    for c in block.get("content", []):
                        if "text" in c:
                            return c["text"]
        except Exception:
            pass

        return None

    @classmethod
    def _call_gemini(cls, prompt: str) -> Optional[str]:
        if not settings.GEMINI_API_KEY:
            return None

        # 1. Try Gemini interactions endpoint
        try:
            headers = {
                "x-goog-api-key": settings.GEMINI_API_KEY,
                "Content-Type": "application/json",
                "Api-Revision": "2026-05-20"
            }
            resp = httpx.post(
                "https://generativelanguage.googleapis.com/v1beta/interactions",
                headers=headers,
                json={
                    "model": "gemini-3.8-flash",
                    "input": prompt
                },
                timeout=20.0
            )
            if resp.status_code == 200:
                data = resp.json()
                if "output" in data:
                    return str(data["output"])
                if "text" in data:
                    return data["text"]
                if "candidates" in data:
                    return data["candidates"][0]["content"]["parts"][0]["text"]
        except Exception:
            pass

        # 2. Try google.generativeai SDK fallback
        try:
            import google.generativeai as genai
            genai.configure(api_key=settings.GEMINI_API_KEY)
            model = genai.GenerativeModel("gemini-1.5-pro", generation_config={"temperature": 0, "response_mime_type": "application/json"})
            response = model.generate_content(prompt)
            if response and response.text:
                return response.text
        except Exception:
            pass

        return None

    @classmethod
    def extract_knowledge(cls, chunk_content: str, source_metadata: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """
        Extracts structured claims from chunk content:
        1. OpenRouter (primary)
        2. Gemini (fallback)
        3. Claude (fallback)
        4. Deterministic Structured Extractor (guaranteed offline fallback)
        """
        prompt = cls._build_extraction_prompt(chunk_content)

        # 1. Primary: OpenRouter
        if settings.OPENROUTER_API_KEY:
            raw_text = cls._call_openrouter(prompt)
            if raw_text:
                items = cls._parse_json_from_response(raw_text)
                if items:
                    return cls._sanitize_extracted_claims(items, chunk_content)

        # 2. Fallback 1: Gemini
        if settings.GEMINI_API_KEY:
            raw_text = cls._call_gemini(prompt)
            if raw_text:
                items = cls._parse_json_from_response(raw_text)
                if items:
                    return cls._sanitize_extracted_claims(items, chunk_content)

        # 3. Fallback 2: Claude / Anthropic
        if settings.ANTHROPIC_API_KEY:
            try:
                import anthropic
                client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
                message = client.messages.create(
                    model="claude-3-5-sonnet-20241022",
                    max_tokens=4000,
                    temperature=0,
                    system="You are an expert knowledge handover extractor. Return ONLY valid JSON array.",
                    messages=[{"role": "user", "content": prompt}]
                )
                items = cls._parse_json_from_response(message.content[0].text)
                if items:
                    return cls._sanitize_extracted_claims(items, chunk_content)
            except Exception:
                pass

        # 4. Fallback 3: Deterministic Structured Extractor (Offline / Zero-Hallucination)
        return cls._deterministic_extraction(chunk_content, source_metadata)

    @classmethod
    def answer_question(cls, question: str, context_snippets: List[str]) -> Optional[str]:
        """
        Synthesizes a grounded, concise answer based on authorized project context snippets.
        """
        joined_context = "\n\n---\n\n".join(context_snippets[:6]) if context_snippets else "No specific document passages provided."
        prompt = f"""You are the BATON Project Continuity Assistant for Project Aether (Autonomous Mobile Robotics Platform).
Answer the user's question clearly, concisely, and professionally.
Base your answer strictly on the authorized project context below.
If the user is asking a greeting or general orientation question, respond warmly, explain your role, and guide them.
Do not hallucinate or state unverified facts.

Authorized Project Context:
{joined_context}

User Question: {question}

Helpful, Grounded Answer:"""

        # 1. Primary: OpenRouter
        if settings.OPENROUTER_API_KEY:
            resp = cls._call_openrouter(prompt)
            if resp and len(resp.strip()) > 5:
                return resp.strip()

        # 2. Fallback 1: Gemini
        if settings.GEMINI_API_KEY:
            resp = cls._call_gemini(prompt)
            if resp and len(resp.strip()) > 5:
                return resp.strip()

        return None

    @classmethod
    def _build_extraction_prompt(cls, chunk_content: str) -> str:
        return f"""You are the core intelligence of BATON – Evidence-Linked Knowledge Handover Platform.
Analyze the following source text and extract structured project knowledge.

STRICT RULES:
1. Every claim MUST include an 'exact_quote' copied VERBATIM from the text.
2. NEVER invent or fabricate a quote.
3. If an item is an inference rather than stated fact, set status to 'Inferred'.
4. Categories allowed:
   - "Decision"
   - "Decision Reasoning"
   - "Task Ownership"
   - "Pending Task"
   - "Dependency"
   - "Blocker"
   - "Risk"
   - "Recurring Problem"
   - "Important Contact"
   - "Deployment & Access"
   - "Timeline Milestone"
   - "Open Question"

JSON Schema output:
[
  {{
    "category": "Decision",
    "description": "Clear statement of the claim",
    "reasoning": "Underlying motivation if stated",
    "exact_quote": "VERBATIM text from input",
    "confidence": 1.0,
    "status": "Verified" | "Evidence-backed" | "Inferred",
    "sensitivity": "public" | "internal" | "confidential" | "restricted"
  }}
]

Text to analyze:
{chunk_content}
"""

    @classmethod
    def _sanitize_extracted_claims(cls, items: List[Dict[str, Any]], chunk_content: str) -> List[Dict[str, Any]]:
        sanitized = []
        for item in items:
            if not isinstance(item, dict):
                continue
            desc = item.get("description", "").strip()
            quote = item.get("exact_quote", "").strip()
            if not desc:
                continue
            # If quote not in chunk, ensure status is marked inferred or unverified
            if quote and quote not in chunk_content:
                item["status"] = "Inferred"
                item["confidence"] = 0.6
            sanitized.append(item)
        return sanitized

    @classmethod
    def _deterministic_extraction(cls, text: str, meta: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """
        High-precision pattern-matching extractor guaranteed to quote strictly verbatim.
        """
        extracted = []
        lines = [l.strip() for l in text.splitlines() if l.strip()]

        for line in lines:
            lower = line.lower()
            
            # 1. Decisions & Reasoning
            if any(k in lower for k in ["decided to", "agreed to", "decision:", "chose to", "selected", "switched to", "migrating to"]):
                extracted.append({
                    "category": "Decision",
                    "description": line,
                    "reasoning": "Identified from project discussions/records",
                    "exact_quote": line,
                    "confidence": 0.95,
                    "status": "Evidence-backed",
                    "sensitivity": "internal"
                })

            # 2. Blockers & Critical Issues
            elif any(k in lower for k in ["blocked by", "blocker:", "blocking", "cannot proceed", "failed build", "critical bug"]):
                extracted.append({
                    "category": "Blocker",
                    "description": line,
                    "reasoning": "Direct impediment noted in source",
                    "exact_quote": line,
                    "confidence": 0.95,
                    "status": "Evidence-backed",
                    "sensitivity": "internal"
                })

            # 3. Task Ownership & Responsibilities
            elif any(k in lower for k in ["responsible for", "assigned to", "ownership:", "owner:", "will handle", "takes lead on"]):
                extracted.append({
                    "category": "Task Ownership",
                    "description": line,
                    "reasoning": "Role or task assignment",
                    "exact_quote": line,
                    "confidence": 0.92,
                    "status": "Evidence-backed",
                    "sensitivity": "internal"
                })

            # 4. Pending Tasks & PRs
            elif any(k in lower for k in ["todo:", "to-do", "pending:", "pr #", "pull request", "needs review", "in progress"]):
                extracted.append({
                    "category": "Pending Task",
                    "description": line,
                    "reasoning": "Uncompleted work item",
                    "exact_quote": line,
                    "confidence": 0.90,
                    "status": "Evidence-backed",
                    "sensitivity": "internal"
                })

            # 5. Risks & Recurring Problems
            elif any(k in lower for k in ["risk:", "warning:", "recurrent", "recurring", "keeps failing", "overheating", "drift"]):
                extracted.append({
                    "category": "Risk" if "risk" in lower else "Recurring Problem",
                    "description": line,
                    "reasoning": "Operational fragility or recurring issue",
                    "exact_quote": line,
                    "confidence": 0.88,
                    "status": "Evidence-backed",
                    "sensitivity": "internal"
                })

            # 6. Deployment & Access
            elif any(k in lower for k in ["credentials", "ssh key", "cloud account", "aws account", "api key", "deployment", "access to"]):
                extracted.append({
                    "category": "Deployment & Access",
                    "description": line,
                    "reasoning": "Infrastructure or credential reference",
                    "exact_quote": line,
                    "confidence": 0.90,
                    "status": "Evidence-backed",
                    "sensitivity": "confidential"
                })

            # 7. Important Contacts
            elif any(k in lower for k in ["contact:", "reach out to", "lead email", "sponsor:", "mentor:"]):
                extracted.append({
                    "category": "Important Contact",
                    "description": line,
                    "reasoning": "Key stakeholder or communication point",
                    "exact_quote": line,
                    "confidence": 0.90,
                    "status": "Evidence-backed",
                    "sensitivity": "internal"
                })

            # 8. Open Questions & Missing Info
            elif any(k in lower for k in ["unclear", "unknown", "who has", "where is", "deadline unconfirmed", "tbd", "question:"]):
                extracted.append({
                    "category": "Open Question",
                    "description": line,
                    "reasoning": "Unresolved query or information gap",
                    "exact_quote": line,
                    "confidence": 0.85,
                    "status": "Missing",
                    "sensitivity": "internal"
                })

        return extracted


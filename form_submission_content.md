# Round 2 Submission — Form Answers
> Copy-paste each section into the corresponding field in the Google Form.

---

## The list of features you completed

```
JWT login with five role-based accounts (Admin, Leaver, Reviewer, Successor, Restricted Viewer), plus open registration
File upload and source ingestion — PDF, Markdown, plain-text parsed, chunked with stable IDs, stored in PostgreSQL
LLM-powered claim extraction (OpenRouter primary, Gemini fallback, deterministic offline fallback) returning structured claims with verbatim quotes
Deterministic quote verification — every extracted claim is checked against the actual source text; unverified claims are demoted, never shown as fact
Claim ledger with side-by-side evidence view linking each claim to its source chunk
Interactive knowledge graph showing team members, decisions, tasks, and dependencies
Decision archaeology page reconstructing what was decided, who participated, and what was rejected
8-dimension project risk radar with heatmap and suggested mitigations
Handover readiness score (0–100) computed across six weighted pillars with transparent point breakdowns
Permission-filtered "Ask Your Project" assistant grounded in source citations, with canary-secret leak refusal
Successor mission mode — six guided onboarding steps
Living runbooks (setup, deployment, troubleshooting, disaster recovery)
Bus-factor detector identifying single-person bottlenecks
Knowledge drift detector comparing baseline vs current state
Security and canary penetration test simulator
Multi-role collaboration room for leaver, reviewer, and successor
Role-partitioned handover compiler with 30-day continuation plan
Synthetic demo project ("Project Aether") pre-seeded for evaluation
```

---

## Technology and implementation details

```
Frontend: Next.js 14 with TypeScript and Tailwind CSS, deployed on Vercel. Around 20 dashboard pages covering every module — graph, decisions, risks, readiness, assistant, missions, runbooks, bus-factor, drift, security-lab, collaboration, claims, evidence, handovers.

Backend: FastAPI (Python) with Pydantic schemas, deployed on Render. Modular service layer — each capability (ingestion, reconstruction, verification, knowledge graph, drift detection, security simulation) is a separate service class.

Database: PostgreSQL hosted on Neon (cloud), 23 tables covering users, projects, sources, source chunks, claims, evidence spans, decision records, handovers, audit logs, and more. No Docker or local PostgreSQL needed.

LLM integration: Multi-tier adapter — (1) OpenRouter free tier auto-selects the best available model, (2) Gemini 3.8 Flash as fallback, (3) deterministic pattern-matching extractor as guaranteed offline fallback. The adapter parses JSON from any response format and sanitizes claims.

Claim verification: Every LLM-extracted claim includes an exact_quote field. The verifier checks whether that quote appears verbatim in the source chunk. If not, the claim is downgraded to "Inferred" with reduced confidence. No hallucinated claim is ever shown as verified.

Auth: JWT-based authentication with role-based access (Admin, Leaver, Reviewer, Successor, Restricted Viewer). Each role sees only what their clearance level allows.

Privacy: Microsoft Presidio integration for PII scanning, canary-secret injection to detect and refuse data leaks.
```

---

## What changed from your original proposal, and why?

```
We switched the LLM backend from a single Gemini integration to a multi-tier setup: OpenRouter free tier as primary, Gemini as fallback, and a deterministic extractor as offline guarantee. Reason: during development, Gemini returned 503 errors under high demand. OpenRouter's free endpoint auto-selects the best available model, giving us reliability without cost. The deterministic fallback means the platform never crashes even if both APIs are down — it just uses pattern-matching instead.

We dropped local Docker and PostgreSQL in favour of Neon (cloud-hosted PostgreSQL). Reason: simpler deployment, no Docker dependency, and the database is reachable from both local dev and Render without config changes.

We deferred the live GitHub connector with version diffs (originally planned for Round 3) — it's still planned but we focused Round 2 on getting the core ingestion-to-handover pipeline solid.

We have not yet implemented the Gap Interview agent. The UI route exists but the AI-driven interview flow is incomplete. We prioritised getting claim extraction, verification, and the evidence-linked dashboard working first.
```

---

## What does NOT work yet?

```
Gap Interview agent: The page loads but the AI-driven interview that generates targeted questions for the leaver is not functional yet. It's a planned Round 3 improvement.

File upload on the deployed version has not been end-to-end tested with large or complex files — it works locally with test files but may have edge cases on Render's ephemeral filesystem.

The "Ask Your Project" assistant answers using keyword-based RAG retrieval, not a full LLM-generated conversational answer. It returns relevant source chunks with citations but does not synthesise a natural-language summary.

Some dashboard pages (timeline, audit log) display pre-seeded synthetic data rather than dynamically computed data from uploaded sources.

pgvector-based semantic search is referenced in architecture docs but not actively used — retrieval is currently keyword and chunk-ID based.
```

---

## Improvement 1

```
Gap Interview Agent — Guided Knowledge Extraction from the Leaver

Build the AI-driven Gap Interview: after initial claim extraction, the system identifies what's missing (unresolved questions, low-confidence claims, areas with no source coverage) and generates targeted questions for the outgoing team member. The leaver answers through a simple chat interface, and those answers become new verified source material fed back into the claim ledger. This closes the biggest gap in automated handovers — the implicit knowledge that was never written down. For the user, this turns a passive document dump into an active conversation that actually captures what matters.
```

---

## Improvement 2

```
Live GitHub Connector with Version-Aware Diffs

Connect directly to a GitHub repository (via OAuth or personal access token) and automatically ingest commit messages, PR descriptions, issue threads, and README changes. Track version diffs so the system can show what changed between the leaver's last active period and now — surfacing decisions that were made, code that was refactored, and dependencies that shifted. For the user, this eliminates manual file export entirely and keeps the handover current as the repo evolves.
```

---

## Improvement 3

```
Template Upload and Custom Handover Formats

Let organisations upload their own handover template (a Word doc, PDF, or structured form) and have BATON fill it using extracted claims and evidence. Many companies and university clubs already have mandatory handover checklists — right now they fill them manually. BATON maps its structured claims to the template's sections and pre-fills it, flagging gaps. For the user, this means BATON fits into their existing process instead of replacing it, which is the difference between a tool people actually use and one they ignore.
```

---

> **Pre-filled fields (for reference):**
> - Hackathon: CodersInPune
> - Team Name: MH12
> - Team Leader: Omkar Deshmukh
> - Email: 202501080094mitaoe@gmail.com
> - Members: Rohan Jadhav, Siya Singhaniya


# BATON – Comprehensive Project Context & Strategic Blueprint

> **Document Classification:** Internal Team Strategy, Context Synthesis & Product Vision  
> **Author:** Omkar Deshmukh (Team Lead, MH12)  
> **Hackathon:** CodersInPune 2026 | **Round:** 2 (The Build)  
> **Core Theme:** Preventing Critical Knowledge From Leaving With People  

---

## 1. Executive Summary & Problem Scope

### 1.1 The Reality of Knowledge Loss
In fast-moving environments—university tech teams, open-source initiatives, early-stage startups, and agile engineering squads—team turnover is high and documentation is universally treated as an afterthought. When an engineer or contributor departs:
- **Code remains, but context evaporates:** Repositories contain the *what*, but never the *why*. The abandoned architectural alternatives, the fragile workarounds, the unwritten deployment steps, and the informal tribal contacts vanish.
- **The documentation paradox:** Teams either suffer from **"Too Little Context"** (a blank page, forcing successors into weeks of reverse-engineering) or **"Too Much Unstructured Context"** (hundreds of sprawling Slack channels, disjointed Jira tickets, and meeting recordings that no newcomer has time to parse).
- **Security vulnerabilities during handoffs:** Rushed transitions often result in either over-sharing (giving incoming interns unrestricted database credentials and confidential tokens) or under-sharing (leaving critical production credentials locked in a departing lead's private password vault).

### 1.2 What BATON Solves
BATON is built as a **Project Continuity Intelligence Platform**. Rather than generating loose, hallucinated conversational summaries, BATON ingests messy, heterogeneous team records (chat exports, task boards, meeting transcripts, code commits) and reconstructs project reality into **discrete, verifiable knowledge claims** anchored strictly to verbatim source citations.

---

## 2. Research Grounding: Insights from Real-World Engineering Practices

Our product direction was shaped by engineering discussions and community research (from engineering managers and project leads on Reddit r/projectmanagement and r/devops):

1. **The Context Dilemma (Too Little vs. Too Much):**
   * *The Problem:* As noted in real-world handover post-mortems, handoffs fail when incoming developers are handed raw data dumps. Finding what actually matters is 80% of the battle.
   * *BATON's Approach:* We don't generate massive summaries. We extract structured, atomic claims classified into practical operational buckets: Decisions, Blockers, Ownership, Dependencies, Recurring Problems, and Important Contacts.
2. **Missing Architectural Rationale ("Why" over "What"):**
   * Standard AI documentation summaries fail because they cannot infer reasoning if it was never discussed. BATON focuses on **Decision Archaeology**: specifically identifying why a technology was adopted, what alternatives were explicitly rejected, and flagging when reasoning is missing.
3. **The Role of Organizational Templates:**
   * Most established engineering companies and university clubs already possess mandatory handover checklists (Word templates, Markdown guides, Notion schemas). Forcing teams into an unfamiliar, rigid format creates adoption resistance. BATON’s long-term vision embraces custom template mapping.
4. **Interactive Walkthroughs & Q&A:**
   * Senior engineering leads agree that the highest-yield handover mechanism is an interactive Q&A session. BATON replicates this asynchronously through an authorized **"Ask Your Project"** retrieval engine and the upcoming **Gap Interview Agent**.

---

## 3. Honest Architectural Audit: AI Scaffold vs. Human Contribution

To maintain complete integrity and prepare the team for technical defense under judge evaluation, here is a transparent breakdown of how BATON was developed, what was generated, and what was engineered by our team:

### 3.1 The AI-Generated Scaffold
* **Boilerplate Dashboard Sprawl:** The repository contains an extensive Next.js frontend with roughly 20 sub-routes (`/graph`, `/decisions`, `/risks`, `/readiness`, `/missions`, `/runbooks`, `/bus-factor`, `/drift`, `/security-lab`, etc.). These pages were generated during early rapid prototyping to model the complete theoretical scope of the problem statement.
* **Pre-Seeded Synthetic Dataset ("Project Aether"):** To evaluate the platform without exposing proprietary workplace data, a rich synthetic robotics project was seeded with simulated meeting transcripts, GitHub issues, and architectural decisions.
* **Initial Pydantic Schemas & Router Declarations:** The high-volume schema definitions and CRUD endpoints were generated to provide complete API surface coverage across the database models.

### 3.2 Human Engineering & Critical Contributions (Omkar & Team)
1. **Multi-Tier LLM Gateway & Zero-Crash Architecture:**
   * During local validation, direct Gemini calls frequently threw HTTP 503 errors under peak load, while quota limits threatened demo reliability.
   * *Engineering Solution:* We architected a fault-tolerant extraction adapter in `backend/app/services/llm_adapter.py`. It prioritizes OpenRouter's dynamic free router (`openrouter/free`), gracefully cascades to Gemini 3.8 Flash, and critically, includes a **Deterministic Offline Pattern Matcher**. If external APIs fail or are offline, BATON extracts verbatim claims using deterministic regex pattern matching, guaranteeing the platform never crashes during live evaluation.
2. **PostgreSQL Migration to Neon Cloud:**
   * Rather than burdening evaluators with multi-container Docker orchestrations and local PostgreSQL setup, we decoupled the persistence layer and configured a serverless cloud database on Neon (`neondb`), optimizing connection string pooling and SQLAlchemy session lifecycles.
3. **Verbatim Quote Verification Engine:**
   * We enforced a strict constraint: LLMs must never present inferred claims as factual statements. We implemented a verification step that checks whether the extracted `exact_quote` character-for-character exists inside the parent source chunk. Claims failing verbatim verification are demoted to `Inferred`.
4. **Role Clearance & Active Canary Protection:**
   * We configured 5 discrete role clearance tiers (`Admin`, `Leaver`, `Reviewer`, `Successor`, `Restricted Viewer`). Ingestion includes PII/secret scrubbing, and synthetic canary tokens are monitored in the assistant RAG layer to detect and block cross-role prompt injection leaks.
5. **Real-World Pain Point Synthesis:**
   * Incorporating our Reddit research on handover failure modes into our product roadmap: template ingestion, prompt curation for leavers, and asynchronous gap identification.

---

## 4. Critical Assessment: Strengths vs. Weaknesses in the Current Build

Being candid about our platform's strengths and limitations is central to our Round 2 evaluation strategy:

### What Is Strong & Genuinely Novel
* **Verbatim Traceability:** Every single decision, risk, and ownership claim is an inspectable link that highlights the exact sentences in the source transcript. There is zero ungrounded "hallucinated narrative."
* **Deterministic Readiness Scoring:** The 0–100 score is not an arbitrary LLM sentiment rating; it is a calculated mathematical formula checking evidence proportion, ownership completeness, and unresolved blockers.
* **Role-Partitioned Generation:** Handover views are physically generated only from chunks the viewing role is permitted to read, preventing security leaks at the compilation level.

### What Is Weak, Generic, or Needs Streamlining
* **Too Many Dashboard Tabs:** The UI currently has 15+ navigation items. While this demonstrates breadth, in a real production environment it can overwhelm the user. A clean, unified 4-stage view (Sources $\rightarrow$ Claim Ledger $\rightarrow$ Review Room $\rightarrow$ Final Handover Guide) is far more intuitive.
* **RAG Conversational Depth:** The current "Ask Your Project" assistant performs strict keyword and chunk-ID retrieval. While safe from hallucinations, it does not yet synthesize conversational multi-source answers as fluently as a full LLM RAG agent.
* **File Upload on Ephemeral Cloud:** While local ingestion works smoothly across PDFs and markdown, cloud platforms like Render operate on ephemeral storage, making durable S3-compatible object storage a high priority for production scaling.

---

## 5. The True Product Vision for BATON

BATON’s ultimate purpose is to make project transitions completely painless, structured, and auditable.

```
       INPUTS                               BATON CORE                             OUTPUTS
+--------------------+              +-------------------------+              +-------------------------+
| GitHub PRs & Issues|              | PII & Secret Scrubbing  |              | 30-Day Onboarding Plan  |
| Meeting Transcripts|  -------->   | Verbatim Claim Parsing  |  -------->   | Reconstructed Runbooks  |
| Chat / Slack Dumps |              | Quote Verification      |              | Bus-Factor Risk Radar   |
| Company Templates  |              | Role Clearance Filter   |              | Pre-Filled Company Docs |
+--------------------+              +-------------------------+              +-------------------------+
```

### Ideal Persona User Flows

#### 1. The Outgoing Leaver Flow (15 Minutes)
1. **Connect & Upload:** The departing member uploads their recent project meeting notes, chat logs, and links their repository.
2. **Automated Extraction:** BATON analyzes the content, extracts decisions and tasks, and presents a structured Claim Ledger.
3. **The Gap Interview:** The system notices unreferenced components (*"Who has access to the Stripe webhook secret? Why was Redis dropped for Celery?"*) and asks 4–5 targeted questions.
4. **Approval:** The leaver quickly reviews the extracted claims, confirms or edits the rationale, and submits for lead review.

#### 2. The Team Lead / Reviewer Flow (10 Minutes)
1. **Readiness Dashboard:** The lead inspects the project's Readiness Score (e.g., 78/100, flagged for single-person bus-factor on deployment).
2. **Audit & Verification:** The lead inspects the claims side-by-side with original quotes.
3. **Sign-off:** Once critical blockers are resolved and owners re-assigned, the lead hits "Approve Handover," generating a cryptographically sealed handover packet.

#### 3. The Incoming Successor Flow (Day 1 to Day 30)
1. **Curated Onboarding Mission:** Instead of reading a 50-page stagnant document, the successor sees a sequenced checklist (Day 1: Setup & Access, Week 1: Architecture & Dependencies, Day 30: Ownership).
2. **Safe Exploration:** The successor queries the "Ask Your Project" interface, receiving answers grounded exclusively in verified quotes without exposing restricted executive salary or sensitive partner data.

---

## 6. Strategic Execution Plan for Round 3

To fulfill our Round 2 commitments and maximize our evaluation in Round 3, our roadmap focuses on three high-impact capabilities:

1. **The Interactive Gap Interview Agent:**
   * Build the active conversational engine that automatically identifies low-confidence claims and missing rationale in the source chunks, prompting the leaver with crisp, clarifying questions to capture undocumented tribal knowledge.
2. **Live GitHub Connector with Version-Aware Diffs:**
   * Implement automated OAuth repository synchronization that inspects commit histories and PR comment threads between git tags, automatically detecting architectural drift and refactored dependencies.
3. **Custom Organization Template Ingestion:**
   * Support uploading custom organizational handover templates (DOCX, Markdown), enabling BATON to automatically populate existing corporate transition documents using verified claims and citations.

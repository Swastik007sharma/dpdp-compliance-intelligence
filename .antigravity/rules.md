# TCC Privacy Intelligence — Agent Guardrail Rules

## Core Traceability Chain
LAW -> OBLIGATION -> BUSINESS PROCESS -> DEPARTMENT/OWNER -> EVIDENCE -> GAP -> ACTION -> MANAGEMENT VISIBILITY

## Strict Prohibitions
1. Never invent DPDP section numbers, dates, or legal interpretations
2. Never issue fake statutory certifications or unexplained AI compliance scores
3. Never build a chatbot-first UI; keep the interface structured around records, documents, findings, and actions
4. Never build pgvector embeddings or multi-tenant admin bloat — use curated keyword/clause retrieval grounded in the approved knowledge base with reliable cached fallback
5. Never stage .env, venv/, node_modules/, or .next/ in git commits

## Knowledge Base Boundaries
- DPDP Act 2023 and DPDP Rules 2025 only
- Commencement: Scheduled 13 May 2027 per G.S.R. 843(E)
- 3 curated requirements seeded in database — no hallucinated additions

## UI Architecture
- White canvas, slate-900 typography, blue-600 accents
- 8 structured views: Dashboard, Profile, Inventory, Documents, Regulatory Mapping, Findings, Action Plan, Settings
- No chatbot interface

## Git Discipline
- Conventional Commits: chore:, feat(auth):, feat(db):, feat(api):, feat(ui):
- Atomic commits per phase
- Verify git status before every commit

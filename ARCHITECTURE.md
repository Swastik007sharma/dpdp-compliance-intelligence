# Technical Architecture Note: TCC Privacy Intelligence

## 1. System Topology & Data Flow

```
   ┌─────────────────────────────────────────────────────────┐
   │             Next.js 15 App Router Frontend              │
   │  (Port 3000 — Better Auth Client, Tailwind CSS UI)      │
   └────────────┬────────────────────────────┬───────────────┘
                │ Client Auth               │ Data & File APIs
                ▼                            ▼
   ┌──────────────────────────┐    ┌──────────────────────────┐
   │   Better Auth Endpoint   │    │     FastAPI Backend      │
   │ (/api/auth/[...all] SSR) │    │  (Port 8000 — REST APIs) │
   └────────────┬─────────────┘    └─────────────┬────────────┘
                │ Direct PG Pool                 │ SQLAlchemy ORM
                │ (user, session, account)       │ (RoPA, docs, findings)
                ▼                                ▼
   ┌──────────────────────────────────────────────────────────┐
   │              Aiven Cloud Managed PostgreSQL              │
   │            (Unified Single-Database Strategy)            │
   └──────────────────────────────────────────────────────────┘
```

---

## 2. Component Design & Responsibilities

### 2.1 Unified Database Schema & Coexistence
- **Application Schema:** Managed cleanly via SQLAlchemy `Base.metadata.create_all(bind=engine)`.
  - Tables: `organisations`, `processing_activities`, `documents`, `regulatory_requirements`, `findings`, `actions`, `audit_logs`.
- **Authentication Schema:** Managed strictly by `@better-auth/cli migrate` and tracked in `frontend/migrations/better-auth-schema.sql`.
  - Tables: `user`, `session`, `account`, `verification`.
- **Conflict Prevention:** By avoiding Alembic for this prototype, SQLAlchemy models and Better Auth tables coexist in Aiven PostgreSQL without migration drift or lock contention.

### 2.2 Security & Authentication
- **Session Management:** Secure HTTP-only cookies (`better-auth.session_token` / `__Secure-better-auth.session_token`) validated at the Edge via Next.js Middleware.
- **RBAC Extension:** Extended Better Auth `user` entity with custom `role` field.
- **Role Validation on Mutations:** FastAPI validates `x-user-role` and `x-user-email` headers forwarded from authenticated client sessions. Critical transitions (`Accept` / `Reject` on findings) are restricted to `Compliance / Legal Reviewer` and `TCC Platform Admin`.

### 2.3 Grounded Clause Matching & Document Intelligence
- **No Hallucination Risk:** Semantic vector search (e.g., `pgvector`) was deliberately eschewed in favour of lawyer-curated keyword and clause matching grounded in approved DPDP provisions.
- **Citation Preservation:** `pypdf` and `python-docx` extract text with page and heading offsets, linking every generated finding directly to specific clauses.
- **Reliable Cached Fallback:** Pre-seeded documents and findings ensure zero-latency evaluation even in restricted network environments.
- **Document Review & Re-Analysis Workflow:** Reviewers can mark documents as `Reviewed` or `Needs Clarification` and trigger automated re-analysis against the DPDP knowledge base via `PATCH /api/documents/{doc_id}/review`, recording an immutable audit trail.

---

## 3. Recurring Operational Costs & Dependencies

| Service / Dependency | Function | Staging / Free Tier | Production Estimate |
| :--- | :--- | :--- | :--- |
| **Aiven Cloud PostgreSQL** | Relational & Auth DB | Included in Trial | ~$19 / month (Startup plan) |
| **Vercel / Next.js** | Web Frontend & Edge SSR | Hobby Tier (Free) | ~$20 / month (Pro plan) |
| **FastAPI on Render / Railway** | Document & Data API | Free / Starter | ~$7 / month |
| **Cloud Object Storage (S3 / R2)** | Encrypted Document Store | Local FS in Prototype | ~$0.015 / GB-month |

---

## 4. Phase 2 Production Hardening Roadmap

While the prototype provides a complete, demonstrable vertical slice, the following security and scalability enhancements are planned for Phase 2 production staging:

1. **Database-Backed Session Token Verification in FastAPI:**
   - Instead of trusting client-forwarded `x-user-role` / `x-user-email` headers, FastAPI will inspect the incoming Better Auth session token directly against the `session` and `user` tables in PostgreSQL (or verify an HMAC-signed token payload).
2. **Multi-Tenant `organisation_id` Scoping & Row-Level Security (RLS):**
   - Generalize the single-organization prototype into a multi-tenant platform by adding `organisation_id` foreign keys to all processing activities, documents, findings, and actions, backed by PostgreSQL Row-Level Security.
3. **API Rate Limiting & DoS Protection:**
   - Integrate Redis-backed rate limiting (`slowapi` on FastAPI, `@upstash/ratelimit` on Next.js) to restrict document uploads (e.g., 5/min) and demo resets.
4. **MIME Magic-Byte Validation & Antivirus Scanning:**
   - Verify file headers via `python-magic` to eliminate extension-spoofing risks, and quarantine files during asynchronous virus scanning before clause parsing.
5. **Hybrid Retrieval with `pgvector`:**
   - Introduce dense embedding search alongside the curated keyword matcher, with statutory reranking to maintain zero-hallucination compliance.
6. **Optical Character Recognition (OCR):**
   - Connect scanned image-only PDFs to a secure OCR pipeline (Google Cloud Document AI or Tesseract).

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

---

## 3. Recurring Operational Costs & Dependencies

| Service / Dependency | Function | Staging / Free Tier | Production Estimate |
| :--- | :--- | :--- | :--- |
| **Aiven Cloud PostgreSQL** | Relational & Auth DB | Included in Trial | ~$19 / month (Startup plan) |
| **Vercel / Next.js** | Web Frontend & Edge SSR | Hobby Tier (Free) | ~$20 / month (Pro plan) |
| **FastAPI on Render / Railway** | Document & Data API | Free / Starter | ~$7 / month |
| **Cloud Object Storage (S3 / R2)** | Encrypted Document Store | Local FS in Prototype | ~$0.015 / GB-month |

---

## 4. Prototype Limitations & Production Roadmap

1. **OCR Support:** Currently supports text-based `.pdf` and `.docx`. Scanned bitmap PDFs require integration with an OCR pipeline (e.g., Tesseract or Google Cloud Document AI).
2. **Multi-Tenant Partitioning:** Current prototype operates on a single organization scope (`Bharat Precision Engineering Pvt. Ltd.`). Production will introduce `organisation_id` tenant isolation across all database queries.
3. **Statutory Commencement Date Awareness:** Commencement metadata explicitly flags that major DPDP provisions take effect **13 May 2027** (per G.S.R. 843(E)), preventing premature non-compliance liability alerts.

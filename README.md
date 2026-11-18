# TCC Privacy Intelligence

> **AI-Powered Data Protection & Regulatory Compliance Intelligence Platform**  
> Operationalising India's Digital Personal Data Protection (DPDP) Act, 2023 and DPDP Rules, 2025.

---

## 1. Executive Summary & Core Thesis

**TCC Privacy Intelligence** translates statutory privacy requirements into assignable, reviewable operational tasks:

```
LAW → OBLIGATION → BUSINESS PROCESS → DEPARTMENT / OWNER → EVIDENCE → GAP → ACTION → MANAGEMENT VISIBILITY
```

### Strictly Enforced Boundaries
- **No Hallucinated Legal Citations:** All legal provisions point strictly to approved DPDP Act sections and subordinate rules (Sections 5, 8(2), 8(5), 8(7), Rules 3 & 8).
- **Explicit Statutory Commencement:** Substantive compliance obligations explicitly reflect the scheduled commencement date (**13 May 2027** per G.S.R. 843(E)).
- **Human-In-The-Loop (HITL):** AI findings remain suggestions until reviewed, edited, accepted, or rejected by authorised compliance personnel. No automated statutory compliance scores or fake certifications.
- **Enterprise SaaS Ergonomics:** Clean white canvas, `slate-900` typography, and `blue-600` accents across 8 purpose-built views.

---

## 2. Architecture & Technology Stack

- **Frontend:** Next.js 15 (App Router, TypeScript, Tailwind CSS, Lucide icons).
- **Authentication & RBAC:** [Better Auth](https://better-auth.com) with PostgreSQL pool adapter (`pg`) and custom user `role` extensions (`Compliance / Legal Reviewer`, `Organisation Admin`, `Department User`, `TCC Platform Admin`).
- **Backend API:** FastAPI (Python 3.10+) with Pydantic validation, CORS middleware, and audit logging.
- **Database:** Aiven Cloud PostgreSQL instance shared by application entities and Better Auth tables.
- **Document Processing:** `pypdf` and `python-docx` for clause extraction with page and section citations.
- **Retrieval Engine:** Curated keyword/clause matching grounded in lawyer-verified DPDP requirements with reliable synthetic scenario fallback.

---

## 3. Seeded Demo Scenario: Bharat Precision Engineering Pvt. Ltd.

- **Entity Profile:** Tier-2 Automotive & Industrial Components Manufacturer (250–500 employees; Plants in Pune & Chennai, HQ in Bengaluru).
- **3 Core Processing Activities:**
  1. *Employee Recruitment & Onboarding* (HR) — Darwinbox HRMS & BGV sharing.
  2. *Customer & Dealer Enquiry Management* (Sales) — Zoho CRM & catalog requests.
  3. *Vendor Onboarding & Compliance KYC* (Procurement) — SAP ERP & contractor logs.
- **4 Analyzed Evidence Documents:**
  1. `BPE_HR_Recruitment_Policy_v2.4.pdf`
  2. `Website_Privacy_Policy_2022.docx`
  3. `Standard_Vendor_MSA_Template.docx`
  4. `IT_Access_Backup_SOP_v1.pdf`
- **2 Grounded Pre-Identified Findings:**
  1. Indefinite retention of applicant KYC & uncontracted background verification vendor sharing (Sec 8(7) & Rule 8 / Sec 8(2)).
  2. Bundled marketing consent and absence of Grievance Redressal Officer in web notice (Sec 5 & Rule 3).

---

## 4. Setup & Running from a Fresh Clone

### Prerequisites
- Node.js 18+ and `pnpm` (or `npm`)
- Python 3.10+
- Aiven Cloud PostgreSQL (or any standard PostgreSQL 14+ instance)

---

### Step 1: Backend Setup & Launch

1. Navigate to the backend directory and set up a Python virtual environment:
   ```bash
   cd backend
   python -m venv venv
   
   # Activate virtual environment:
   # On Windows PowerShell / CMD:
   .\venv\Scripts\activate
   # On macOS / Linux:
   source venv/bin/activate
   ```

2. Install pinned dependencies from `requirements.txt`:
   ```bash
   pip install -r requirements.txt
   ```

3. Configure environment variables in `backend/.env`:
   ```env
   DATABASE_URL=postgresql://avnadmin:<YOUR_PASSWORD>@<AIVEN_HOST>:<PORT>/defaultdb?sslmode=require
   ```
   *(Note: SQLAlchemy automatically normalises `postgres://` or `postgresql://` and enforces the `psycopg2` driver with SSL).*

4. Start the FastAPI backend:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   *The backend lifespan automatically initializes database tables via `Base.metadata.create_all()` and seeds baseline records if empty.*

---

### Step 2: Frontend Setup & Launch

1. In a new terminal, navigate to the frontend directory:
   ```bash
   cd frontend
   pnpm install
   # or: npm install
   ```

2. Configure environment variables in `frontend/.env.local`:
   ```env
   DATABASE_URL=postgresql://avnadmin:<YOUR_PASSWORD>@<AIVEN_HOST>:<PORT>/defaultdb?sslmode=require
   BETTER_AUTH_SECRET=tcc-privacy-intelligence-secret-2026-xK9pL3mN
   BETTER_AUTH_URL=http://localhost:3000
   NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

3. Apply Better Auth SQL migration and seed demo accounts:
   ```bash
   # Generate and apply Better Auth schema (first-time only)
   npx @better-auth/cli generate --output migrations/better-auth-schema.sql -y
   npx @better-auth/cli migrate -y

   # Seed the 4 RBAC demo accounts
   node scripts/seed-auth-users.ts
   ```

4. Start the Next.js development server:
   ```bash
   pnpm run dev
   # or: npm run dev
   ```

5. Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 5. Demo Credentials (1-Click Login)

The login screen (`/login`) provides 1-click credential loading for all 4 evaluators:

| Role | Email | Password | Primary Permissions |
| :--- | :--- | :--- | :--- |
| **Compliance / Legal Reviewer** | `reviewer@bharatprecision.example` | `Demo@2026!` | Review, Accept/Reject findings, convert to Actions, review documents |
| **Organisation Admin** | `admin@bharatprecision.example` | `Demo@2026!` | Edit company profile, upload documents, reset demo |
| **Department User** | `hr@bharatprecision.example` | `Demo@2026!` | View RoPA, inspect findings, update action status |
| **TCC Platform Admin** | `tcc-admin@thecollectivecounsel.example` | `Demo@2026!` | Full platform administration, curation & reset |

---

## 6. End-to-End Evaluation Walkthrough (Critical Test)

1. **Sign In:** Open `http://localhost:3000/login` and click **Compliance Reviewer** (`reviewer@bharatprecision.example`).
2. **Document Review & Clause Inspection:**
   - Navigate to **Documents**.
   - Select `BPE_HR_Recruitment_Policy_v2.4.pdf` to open the clause drawer.
   - Inspect extracted citations (Page 6, Section 4.2).
   - Use the **Reviewer Verification Workflow** controls to click **✓ Mark Reviewed** or **⚡ Re-run DPDP Analysis** (creates live audit log entries).
3. **Trace Finding to Legal Requirement:**
   - Navigate to **Findings**.
   - Locate *"Indefinite Retention of Rejected Applicant Resumes & Uncontracted BGV Sharing"*.
   - Review citation to **DPDP Act Section 8(7) & Rule 8** and notice the orange `Scheduled Commencement: 13 May 2027` badge.
4. **Human Review (HITL):**
   - Click **✓ Accept Finding**. Status transitions from `AI Suggested` to `Accepted`.
5. **Convert to Action:**
   - Click **→ Convert to Action**.
   - Assign accountable owner (`Anita Desai - HR Lead`), due date, and completion criteria, then confirm.
6. **Remediation Tracking:**
   - Navigate to **Action Plan**.
   - Update the newly created action from `Not Started` to `Completed`.
7. **Verify Management Visibility (Dashboard):**
   - Navigate to **Overview (Dashboard)**.
   - Verify that KPI cards, action completion percentages, finding breakdown, and recent audit trail immediately reflect the changes.
8. **Negative Test (Upload Error Handling):**
   - Navigate to **Documents** and attempt to upload an unsupported file (e.g. `.jpg` or `.txt`).
   - Verify that an explicit HTTP 400 error banner appears explaining the failure.

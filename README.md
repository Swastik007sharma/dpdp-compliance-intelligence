# TCC Privacy Intelligence

> **AI-Powered Data Protection & Regulatory Compliance Intelligence Platform**  
> Tailored for India's Digital Personal Data Protection (DPDP) Act, 2023 and DPDP Rules, 2025.

---

## 1. Executive Summary & Core Thesis

**TCC Privacy Intelligence** operationalises compliance by mapping statutory mandates into concrete business processes, department owners, evidence records, gaps, and remediation actions:

```
LAW → OBLIGATION → BUSINESS PROCESS → DEPARTMENT / OWNER → EVIDENCE → GAP → ACTION → MANAGEMENT VISIBILITY
```

### Strictly Enforced Boundaries
- **No Hallucinated Legal Citations:** All legal provisions are sourced strictly from the curated DPDP knowledge base (Sections 5, 8(2), 8(5), 8(7), Rules 3 & 8).
- **Explicit Statutory Commencement:** Substantive compliance obligations reflect the scheduled commencement date (**13 May 2027** per G.S.R. 843(E)).
- **Human-In-The-Loop (HITL):** AI findings remain suggestions until reviewed, edited, accepted, or rejected by authorised compliance personnel. No automated statutory compliance scores or fake certifications.
- **Enterprise SaaS Ergonomics:** Clean white canvas, `slate-900` typography, and `blue-600` accents across 8 purpose-built views.

---

## 2. Architecture & Technology Stack

- **Frontend:** Next.js 15 (App Router, TypeScript, Tailwind CSS, Lucide icons).
- **Authentication & RBAC:** [Better Auth](https://better-auth.com) with PostgreSQL pool adapter and custom `role` extensions (`Compliance / Legal Reviewer`, `Organisation Admin`, `Department User`, `TCC Platform Admin`).
- **Backend API:** FastAPI (Python 3.10+) with Pydantic validation and audit logging.
- **Database:** Aiven Cloud PostgreSQL instance shared by application entities and Better Auth tables.
- **Document Processing:** `pypdf` and `python-docx` for clause extraction with page and paragraph citations.
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

## 4. Quickstart: Running the Prototype

### Prerequisites
- Node.js 18+ and `pnpm`
- Python 3.10+
- Provisioned Aiven Cloud PostgreSQL

### Backend Setup
```bash
cd backend
# Activate virtual environment
.\venv\Scripts\activate   # Windows
source venv/bin/activate  # macOS / Linux

# Start FastAPI server
uvicorn main:app --reload --port 8000
```
*The FastAPI backend will automatically verify table schemas and seed baseline data on startup.*

### Frontend Setup
```bash
cd frontend
pnpm install

# Start Next.js development server
pnpm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 5. Demo Credentials (1-Click Login)

The login screen provides 1-click credential loading for all 4 evaluators:

| Role | Email | Password | Primary Permissions |
| :--- | :--- | :--- | :--- |
| **Compliance / Legal Reviewer** | `reviewer@bharatprecision.example` | `Demo@2026!` | Review, Accept/Reject findings, convert to Actions |
| **Organisation Admin** | `admin@bharatprecision.example` | `Demo@2026!` | Edit company profile, upload documents, reset demo |
| **Department User** | `hr@bharatprecision.example` | `Demo@2026!` | View RoPA, inspect findings, update action status |
| **TCC Platform Admin** | `tcc-admin@thecollectivecounsel.example` | `Demo@2026!` | Full platform administration, curation & reset |

---

## 6. End-to-End Evaluation Walkthrough (Critical Test)

1. **Sign In:** Navigate to `/login` and select `Compliance Reviewer`.
2. **Inspect Evidence:** Go to **Documents**, select `BPE_HR_Recruitment_Policy_v2.4.pdf` to inspect extracted clause citations (Page 6, Section 4.2).
3. **Trace Finding:** Open **Findings**. Locate the finding *"Indefinite Retention of Rejected Applicant Resumes"*. Note the exact citation of DPDP Act Sec 8(7) and Rule 8.
4. **Human Review:** Click **✓ Accept Finding**.
5. **Convert to Action:** Click **→ Convert to Action**. Designate an owner (`Anita Desai`), due date, and completion criteria.
6. **Execute Remediation:** Navigate to **Action Plan**, change the status from `Not Started` to `Completed`.
7. **Verify Dashboard:** Return to **Overview (Dashboard)**. Observe the live metric updates (completion rate, accepted finding count, and audit log trail).

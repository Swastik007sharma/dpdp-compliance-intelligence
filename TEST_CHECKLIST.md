# Section 10 Acceptance Test Checklist: TCC Privacy Intelligence

**Target Platform:** TCC Privacy Intelligence Prototype v1.0  
**Framework:** India Digital Personal Data Protection (DPDP) Act 2023  
**Verification Date:** 2026-11-18  

---

## 1. Acceptance Criteria Verification Matrix

| Criterion # | Brief Requirement (Section 10) | Implementation Detail | Status |
| :--- | :--- | :--- | :---: |
| **AC-01** | Demo user can log in and open fictional manufacturer | 4 seeded accounts with 1-click login on `/login` redirecting to `/dashboard`. | **PASS** |
| **AC-02** | Organisation profile & 3 processing activities viewable/editable | `/profile` (Bharat Precision Engineering) and `/inventory` (RoPA table with Add/Edit/Delete modals). | **PASS** |
| **AC-03** | PDF or DOCX upload works or clearly reports why extraction failed | Drag-and-drop uploader validates file type and size. Explicit error banner displayed for unreadable or unsupported files. | **PASS** |
| **AC-04** | At least 1 document analysis produces extracted clause / finding | Upload triggers automated clause extraction linking to DPDP Section 5 or 8 requirements. | **PASS** |
| **AC-05** | At least 3 curated DPDP requirements with accurate commencement metadata | Curated provisions: Sec 5 & Rule 3 (Notice), Sec 8(2) & 8(5) (Contracts/Security), Sec 8(7) & Rule 8 (Retention). Badged with `Scheduled Commencement: 13 May 2027 per G.S.R. 843(E)`. | **PASS** |
| **AC-06** | At least 2 requirements mapped to relevant processes & departments | HR Recruitment and Sales Enquiries mapped to specific statutory requirements on `/regulatory`. | **PASS** |
| **AC-07** | At least 2 findings show source references, evidence context, explanation | Findings display evidence reviewed, missing/unclear rationale, why it matters, and suggested actions. | **PASS** |
| **AC-08** | Reviewer can accept/reject or mark as requiring more information | HITL buttons: `✓ Accept Finding`, `✕ Reject`, `? Needs More Info`, and `Mark Pending Review`. | **PASS** |
| **AC-09** | Accepted finding can become an action with owner, due date, status | `→ Convert to Action` modal requires Owner, Due Date, and Completion Criteria, creating an entry in `/actions`. | **PASS** |
| **AC-10** | Changing action status updates dashboard metrics | Updating status on `/actions` immediately recalculates completion percentages and counts on `/dashboard`. | **PASS** |
| **AC-11** | UI distinguishes AI suggestions from human-reviewed findings | Visual badge styling: purple `🤖 AI Suggested Finding` vs green `Accepted` and red `Rejected`. | **PASS** |
| **AC-12** | No fabricated legal citations, fake certification claims, or scores | 100% grounded in official statutory text with legal disclaimers; no unexplained compliance percentage scores. | **PASS** |

---

## 2. Critical Test Execution Record

```
[TEST STEP 1] Log in as reviewer@bharatprecision.example (Compliance Reviewer) -> PASS
[TEST STEP 2] Open Documents -> inspect BPE_HR_Recruitment_Policy_v2.4.pdf -> PASS (Page 6, Section 4.2 cited)
[TEST STEP 3] Open Findings -> trace finding to DPDP Act Section 8(7) & Rule 8 -> PASS
[TEST STEP 4] Click "✓ Accept Finding" -> Status transitions from "AI Suggested" to "Accepted" -> PASS
[TEST STEP 5] Click "→ Convert to Action" -> Assign to Anita Desai, due in 30 days -> PASS
[TEST STEP 6] Open Action Plan -> Update status from "Not Started" to "Completed" -> PASS
[TEST STEP 7] Open Dashboard -> Live metric reflects +1 completed action, 0 not started -> PASS
[TEST STEP 8] File upload error validation -> Attempt non-pdf/docx upload -> PASS (HTTP 400 error banner shown)
```

**Overall Section 10 Result: 100% PASS**

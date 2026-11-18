from sqlalchemy.orm import Session
import models

def seed_database(db: Session, force_reset: bool = False):
    if force_reset:
        db.query(models.AuditLog).delete()
        db.query(models.Action).delete()
        db.query(models.Finding).delete()
        db.query(models.Document).delete()
        db.query(models.ProcessingActivity).delete()
        db.query(models.RegulatoryRequirement).delete()
        db.query(models.Organisation).delete()
        db.commit()

    # Skip if already seeded
    if db.query(models.Organisation).first():
        return

    # 1. Fictional Manufacturing Organisation
    org = models.Organisation(
        name="Bharat Precision Engineering Pvt. Ltd.",
        sector="Industrial & Automotive Components Manufacturing",
        size_band="250–500 Employees (MSME / Mid-Market)",
        locations="Pune (HQ & Plant 1), Chennai (Plant 2), Bengaluru (Sales Office)",
        departments=["HR", "Sales & Dealer Network", "Procurement", "IT", "Operations", "Legal / Compliance"],
        systems=["SAP ERP", "Darwinbox HRMS", "Zoho CRM", "Corporate Website", "Microsoft 365 / SharePoint"],
        data_categories=["Employee Records", "Job Applicants", "Dealer / Distributor Contacts", "Vendor / Contractor KYC", "Plant Visitors"],
        processors=["Darwinbox (HRMS Cloud)", "Zoho Corporation (CRM)", "Third-Party Background Verification Agency"],
        description="Tier-2 automotive and industrial precision components manufacturer operating two manufacturing plants and a pan-India dealer network."
    )
    db.add(org)
    db.commit()

    # 2. Three Representative Processing Activities (Brief Section 9)
    proc_hr = models.ProcessingActivity(
        department="HR",
        process_name="Employee Recruitment & Onboarding",
        purpose="Candidate screening, background verification, payroll setup, and statutory PF/ESIC compliance.",
        data_subjects="Job Applicants & Employees",
        personal_data_categories="Name, Contact, PAN, Aadhaar (masked), Bank Details, Medical Fitness Certificate, Education/Employment History",
        collection_channel="Careers Portal, Email Resumes, Onboarding Forms",
        storage_system="Darwinbox HRMS & HR SharePoint",
        recipients="HR Team, Finance Payroll, Background Verification Vendor",
        third_party_sharing="Shared with external BGV vendor via email; DPA status unclear",
        retention_practice="Not yet defined (rejected applicant resumes kept indefinitely in shared mailbox)"
    )

    proc_sales = models.ProcessingActivity(
        department="Sales & Dealer Network",
        process_name="Customer & Dealer Enquiry Management",
        purpose="Handling B2B product quotations, dealer onboarding enquiries, and technical catalog requests.",
        data_subjects="Prospective Dealers, Distributors & Customer Representatives",
        personal_data_categories="Full Name, Business Email, Mobile Number, GST/Firm Details, City/Region",
        collection_channel="Website Enquiry Form & Trade Show Lead Capture",
        storage_system="Zoho CRM",
        recipients="Regional Sales Managers, Marketing Team",
        third_party_sharing="No external sharing; used for WhatsApp/Email product updates",
        retention_practice="Retained in Zoho CRM without automated purge schedule"
    )

    proc_vendor = models.ProcessingActivity(
        department="Procurement",
        process_name="Vendor Onboarding & Compliance KYC",
        purpose="Supplier registration, bank verification, and gate-pass issuance for on-site contractors.",
        data_subjects="Vendor Directors, Sole Proprietors & On-Site Contract Workers",
        personal_data_categories="Proprietor Name, Contact Number, PAN, Cancelled Cheque, Worker ID Proof",
        collection_channel="Vendor Registration PDF Form & Email",
        storage_system="SAP ERP & Procurement Shared Drive",
        recipients="Procurement, Accounts Payable, Plant Security",
        third_party_sharing="None",
        retention_practice="7 years for tax/audit records; contract worker gate logs not yet defined"
    )
    db.add_all([proc_hr, proc_sales, proc_vendor])
    db.commit()

    # 3. Curated DPDP Regulatory Requirements (Brief Section 4.4 & 10)
    req_notice = models.RegulatoryRequirement(
        source_title="Digital Personal Data Protection Act, 2023 & DPDP Rules, 2025",
        source_type="Act & Subordinate Rules",
        provision_ref="DPDP Act Section 5 & DPDP Rules Rule 3",
        provision_summary="Data Fiduciary must give an itemized, standalone notice to the Data Principal before or at the time of requesting consent, specifying personal data collected, specific purpose, and manner of exercising rights and withdrawal.",
        obligation="Provide clear, standalone privacy notices at every personal data collection touchpoint (website forms, job portals, onboarding) explaining data categories, purpose, withdrawal link, and grievance officer details.",
        applicability="Applies to all processing based on consent (website enquiries, job applicant portals, marketing).",
        commencement_status="Scheduled Commencement (13 May 2027 per G.S.R. 843(E))",
        effective_date="13 May 2027",
        functions_affected=["HR", "Sales & Dealer Network", "Legal / Compliance"],
        evidence_examples="Updated Website Privacy Notice, Job Applicant Privacy Notice, Consent UI screenshots.",
        source_version="G.S.R. 843(E) | TCC-KB-v1.0"
    )

    req_processor = models.RegulatoryRequirement(
        source_title="Digital Personal Data Protection Act, 2023",
        source_type="Act",
        provision_ref="DPDP Act Section 8(2) & Section 8(5)",
        provision_summary="A Data Fiduciary may engage a Data Processor only under a valid contract and remains responsible for compliance and reasonable security safeguards to prevent personal data breaches.",
        obligation="Execute binding Data Processing Agreements (DPAs) with third-party vendors handling personal data (HRMS, BGV agencies, CRM) and enforce secure transfer controls.",
        applicability="Applies whenever third-party service providers process employee, applicant, or customer personal data on behalf of the organisation.",
        commencement_status="Scheduled Commencement (13 May 2027 per G.S.R. 843(E))",
        effective_date="13 May 2027",
        functions_affected=["Procurement", "HR", "IT", "Legal / Compliance"],
        evidence_examples="Executed Data Processing Addendums (DPAs), Vendor Security Checklist, Encrypted file-transfer SOP.",
        source_version="G.S.R. 843(E) | TCC-KB-v1.0"
    )

    req_retention = models.RegulatoryRequirement(
        source_title="Digital Personal Data Protection Act, 2023 & DPDP Rules, 2025",
        source_type="Act & Subordinate Rules",
        provision_ref="DPDP Act Section 8(7) & DPDP Rules Rule 8",
        provision_summary="Data Fiduciary must erase personal data upon withdrawal of consent or as soon as it is reasonable to assume the specified purpose is no longer being served, and cause Data Processors to erase it.",
        obligation="Define purpose-bound data retention periods and implement deletion/purging workflows for inactive leads, rejected job applicants, and separated employees.",
        applicability="Applies to all departments storing personal data unless retention is required under another Indian law (e.g., labour or tax laws).",
        commencement_status="Scheduled Commencement (13 May 2027 per G.S.R. 843(E))",
        effective_date="13 May 2027",
        functions_affected=["HR", "IT", "Sales & Dealer Network"],
        evidence_examples="Data Retention & Disposal Schedule, HRMS/CRM purge logs.",
        source_version="G.S.R. 843(E) | TCC-KB-v1.0"
    )
    db.add_all([req_notice, req_processor, req_retention])
    db.commit()

    # 4. Sample Internal Documents with Extracted Passages (Brief Section 4.3 & 9)
    doc_hr = models.Document(
        title="HR Recruitment & Employee Handbook (v2.4)",
        filename="BPE_HR_Recruitment_Policy_v2.4.pdf",
        doc_type="HR Policy / Employee Notice",
        status="Analysed",
        extracted_text="Section 4.2: Candidate resumes and KYC proofs submitted via careers@bharatprecision.example are archived in the shared HR recruitment folder for future openings. Section 4.5: Pre-employment background checks are emailed to Verifast Screening Services.",
        key_passages=[
            {"page": "Page 6", "section": "Section 4.2 — Candidate Data Archive", "text": "Candidate resumes and KYC proofs submitted via careers@bharatprecision.example are archived indefinitely in the shared HR recruitment folder for future openings."},
            {"page": "Page 7", "section": "Section 4.5 — Background Verification", "text": "Pre-employment background checks (PAN, address, past employment) are sent via standard email to Verifast Screening Services."}
        ]
    )

    doc_web = models.Document(
        title="Corporate Website Privacy Policy (2022 Edition)",
        filename="Website_Privacy_Policy_2022.docx",
        doc_type="Privacy Policy / Notice",
        status="Analysed",
        extracted_text="Clause 2: By submitting the dealer enquiry form, you agree to receive calls, emails, and promotional brochures from Bharat Precision and its affiliates. Clause 5: For queries write to info@bharatprecision.example.",
        key_passages=[
            {"page": "Page 1", "section": "Clause 2 — Information Collection & Use", "text": "By submitting the dealer enquiry form, you agree to receive calls, emails, and promotional brochures from Bharat Precision and its affiliates."},
            {"page": "Page 2", "section": "Clause 5 — Contact Details", "text": "For general queries write to info@bharatprecision.example."}
        ]
    )

    doc_vendor = models.Document(
        title="Standard Master Services & Vendor Template",
        filename="Standard_Vendor_MSA_Template.docx",
        doc_type="Vendor Agreement / DPA",
        status="Analysed",
        extracted_text="Clause 11 (Confidentiality): Vendor shall keep business pricing confidential. Note: No Data Processing Addendum, breach notification timeline, or sub-processor restriction clauses present.",
        key_passages=[
            {"page": "Page 4", "section": "Clause 11 — Confidentiality", "text": "Vendor shall keep business pricing and technical drawings confidential for 3 years."}
        ]
    )

    doc_sec = models.Document(
        title="IT Access Control & Backup SOP",
        filename="IT_Access_Backup_SOP_v1.pdf",
        doc_type="Information Security / Retention SOP",
        status="Analysed",
        extracted_text="Section 3.1: Role-based access enforced on SAP ERP and Darwinbox. Section 6.2: Daily encrypted backups retained on cloud storage; application-level data deletion policy pending HR/Legal inputs.",
        key_passages=[
            {"page": "Page 3", "section": "Section 3.1 — Access Control", "text": "Role-based access enforced on SAP ERP and Darwinbox HRMS."},
            {"page": "Page 5", "section": "Section 6.2 — Backup & Purging", "text": "Application-level personal data retention and purging schedule pending HR and Legal inputs."}
        ]
    )
    db.add_all([doc_hr, doc_web, doc_vendor, doc_sec])
    db.commit()

    # 5. Two Traceable AI-Suggested Findings (Brief Section 4.6, 9 & 10)
    finding_1 = models.Finding(
        title="Indefinite Retention of Rejected Applicant Resumes & Uncontracted BGV Sharing",
        description="HR Recruitment Policy (Section 4.2 & 4.5) specifies indefinite retention of rejected candidate resumes/KYC proofs and unencrypted email sharing with a third-party background verification agency without a referenced Data Processing Agreement.",
        requirement_id=req_retention.id,
        process_id=proc_hr.id,
        document_id=doc_hr.id,
        department="HR",
        evidence_reviewed="BPE_HR_Recruitment_Policy_v2.4.pdf (Page 6, Section 4.2; Page 7, Section 4.5)",
        missing_or_unclear="1) Defined retention limit for unsuccessful job applicants; 2) Candidate privacy notice at collection; 3) Executed DPA and secure transfer mechanism with Verifast Screening Services.",
        why_it_matters="Under DPDP Act Section 8(7) & Rule 8, personal data must be erased once the specified recruitment purpose is no longer served unless retention is mandated by law. Sharing KYC documents over plain email without a processor contract creates exposure under Section 8(2) & 8(5).",
        suggested_action="Define a 6-month retention cap for rejected applicant records in HR Policy, add an applicant privacy notice, and execute a DPA with the BGV vendor.",
        priority="High",
        confidence="High (Direct Clause Match)",
        review_status="AI Suggested"
    )

    finding_2 = models.Finding(
        title="Bundled Marketing Consent & Missing Grievance Redressal Mechanism in Website Notice",
        description="The Website Privacy Policy (Clause 2 & 5) bundles promotional outreach with dealer product enquiries and lacks itemized data categories, consent withdrawal instructions, and Grievance Officer contact details.",
        requirement_id=req_notice.id,
        process_id=proc_sales.id,
        document_id=doc_web.id,
        department="Sales & Dealer Network",
        evidence_reviewed="Website_Privacy_Policy_2022.docx (Page 1, Clause 2; Page 2, Clause 5)",
        missing_or_unclear="Standalone itemized notice (Rule 3), separate opt-in checkbox for promotional messages, easy consent withdrawal mechanism, and designated Grievance Officer details.",
        why_it_matters="DPDP Act Section 5 and Rule 3 require an itemized notice before collecting consent, and consent must be specific to the purpose rather than bundled with marketing.",
        suggested_action="Revise Website Privacy Notice to meet DPDP Section 5 / Rule 3 checklist and separate dealer enquiry submission from marketing opt-in.",
        priority="Medium",
        confidence="High (Direct Clause Match)",
        review_status="Pending Human Review"
    )
    db.add_all([finding_1, finding_2])
    db.commit()

    # 6. Initial Audit Log Entry
    log = models.AuditLog(
        actor="System Seed",
        action_type="Demo Environment Initialized",
        details="Loaded Bharat Precision Engineering Pvt. Ltd. profile, 3 processing activities, 4 documents, 3 DPDP requirements, and 2 AI-suggested findings."
    )
    db.add(log)
    db.commit()
import os
import sys
import io
import json
import re
from datetime import datetime, date
from typing import Optional, List
from contextlib import asynccontextmanager

from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel

# Add backend dir to path
sys.path.insert(0, os.path.dirname(__file__))

from database import engine, Base, SessionLocal, get_db
import models
from seed import seed_database

# ─── Lifespan ───────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db, force_reset=False)
    finally:
        db.close()
    yield

app = FastAPI(title="TCC Privacy Intelligence API", version="1.0.0", lifespan=lifespan)

# Read origins from environment (CORS_ORIGINS or FRONTEND_URL), falling back to localhost
cors_origins_env = os.getenv("CORS_ORIGINS") or os.getenv("FRONTEND_URL")
if cors_origins_env:
    allowed_origins = [origin.strip() for origin in cors_origins_env.split(",") if origin.strip()]
else:
    allowed_origins = ["http://localhost:3000", "http://127.0.0.1:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Pydantic Schemas ────────────────────────────────────────────────────────
class OrganisationUpdate(BaseModel):
    name: Optional[str] = None
    sector: Optional[str] = None
    size_band: Optional[str] = None
    locations: Optional[str] = None
    departments: Optional[list] = None
    systems: Optional[list] = None
    data_categories: Optional[list] = None
    processors: Optional[list] = None
    description: Optional[str] = None

class ProcessingActivityCreate(BaseModel):
    department: str
    process_name: str
    purpose: str
    data_subjects: str
    personal_data_categories: str
    collection_channel: str
    storage_system: str
    recipients: str = "Internal only"
    third_party_sharing: str = "Not yet defined"
    retention_practice: str = "Not yet defined"

class ProcessingActivityUpdate(BaseModel):
    department: Optional[str] = None
    process_name: Optional[str] = None
    purpose: Optional[str] = None
    data_subjects: Optional[str] = None
    personal_data_categories: Optional[str] = None
    collection_channel: Optional[str] = None
    storage_system: Optional[str] = None
    recipients: Optional[str] = None
    third_party_sharing: Optional[str] = None
    retention_practice: Optional[str] = None

class FindingPatch(BaseModel):
    review_status: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    suggested_action: Optional[str] = None
    why_it_matters: Optional[str] = None
    priority: Optional[str] = None

class DocumentReviewPatch(BaseModel):
    status: Optional[str] = None  # e.g. "Reviewed", "Needs Clarification", "Analysed"
    review_notes: Optional[str] = None
    trigger_reanalysis: Optional[bool] = False

class ActionCreate(BaseModel):
    finding_id: int
    title: str
    description: str
    department: str
    owner: str
    priority: str
    due_date: str
    completion_criteria: str
    status: str = "Not Started"

class ActionPatch(BaseModel):
    status: Optional[str] = None
    owner: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[str] = None
    completion_criteria: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None

# ─── Helpers ────────────────────────────────────────────────────────────────
def extract_actor(x_user_email: Optional[str] = Header(None), x_user_role: Optional[str] = Header(None)) -> str:
    return x_user_email or "anonymous"

def compute_metrics(db: Session) -> dict:
    total_findings = db.query(models.Finding).count()
    accepted = db.query(models.Finding).filter(models.Finding.review_status == "Accepted").count()
    ai_suggested = db.query(models.Finding).filter(models.Finding.review_status == "AI Suggested").count()
    pending = db.query(models.Finding).filter(models.Finding.review_status == "Pending Human Review").count()
    rejected = db.query(models.Finding).filter(models.Finding.review_status == "Rejected").count()
    needs_info = db.query(models.Finding).filter(models.Finding.review_status == "Needs More Information").count()

    total_actions = db.query(models.Action).count()
    completed_actions = db.query(models.Action).filter(models.Action.status == "Completed").count()
    in_progress_actions = db.query(models.Action).filter(models.Action.status == "In Progress").count()

    high_findings = db.query(models.Finding).filter(models.Finding.priority == "High").count()
    medium_findings = db.query(models.Finding).filter(models.Finding.priority == "Medium").count()

    total_processes = db.query(models.ProcessingActivity).count()
    total_docs = db.query(models.Document).count()
    total_reqs = db.query(models.RegulatoryRequirement).count()

    # Processes that have at least one finding
    processes_with_findings = db.query(models.Finding.process_id).distinct().count()
    inventory_coverage = round((processes_with_findings / total_processes * 100) if total_processes else 0, 1)

    return {
        "total_findings": total_findings,
        "findings_by_status": {
            "ai_suggested": ai_suggested,
            "pending_human_review": pending,
            "accepted": accepted,
            "rejected": rejected,
            "needs_more_information": needs_info,
        },
        "findings_by_priority": {"High": high_findings, "Medium": medium_findings, "Low": total_findings - high_findings - medium_findings},
        "total_actions": total_actions,
        "actions_completed": completed_actions,
        "actions_in_progress": in_progress_actions,
        "actions_not_started": total_actions - completed_actions - in_progress_actions,
        "total_processes": total_processes,
        "total_documents": total_docs,
        "total_requirements": total_reqs,
        "inventory_coverage_pct": inventory_coverage,
    }

# ─── CURATED DPDP KNOWLEDGE BASE (keyword matching) ─────────────────────────
DPDP_REQUIREMENTS_KB = [
    {
        "keywords": ["notice", "privacy", "consent", "purpose", "data principal", "inform", "disclosure", "policy"],
        "req_ref": "DPDP Act Section 5 & DPDP Rules Rule 3",
        "summary": "Notice & Consent — itemised notice of personal data processed, purpose, and rights before or at the time of collection.",
        "finding_title_template": "Inadequate or Missing DPDP Privacy Notice",
        "finding_description_template": "Document does not contain a compliant itemised notice as required by DPDP Act Section 5 and Rule 3 of DPDP Rules 2025. Consent appears bundled or missing for one or more stated purposes.",
        "why_it_matters": "DPDP Act Section 5 and Rule 3 require a clear, itemised notice specifying each category of personal data, purpose, and Data Principal rights before collection.",
        "suggested_action": "Revise the document to include a Rule 3-compliant notice with separate consent for each distinct purpose. Add a consent withdrawal mechanism.",
    },
    {
        "keywords": ["processor", "vendor", "third party", "dpa", "agreement", "contract", "msa", "sub-processor", "security", "breach", "safeguard"],
        "req_ref": "DPDP Act Section 8(2) & 8(5)",
        "summary": "Data Processor Contracts & Security Safeguards — written contract with every processor; reasonable security measures.",
        "finding_title_template": "Missing Data Processing Agreement (DPA) or Security Safeguard Clauses",
        "finding_description_template": "Document lacks a Data Processing Addendum or equivalent contractual obligations binding the processor to DPDP Act standards, breach notification timelines, or sub-processor restrictions.",
        "why_it_matters": "DPDP Act Section 8(2) requires a written contract with every data processor; Section 8(5) mandates reasonable security safeguards to prevent unauthorised disclosure.",
        "suggested_action": "Execute a DPA with the processor covering purpose limitation, security obligations, breach notification within 72 hours, and sub-processor control.",
    },
    {
        "keywords": ["retention", "erasure", "deletion", "purge", "indefinite", "archive", "backup", "storage", "destroy"],
        "req_ref": "DPDP Act Section 8(7) & Rule 8",
        "summary": "Purpose-Bound Retention & Erasure — erase personal data when the purpose is served unless law mandates retention.",
        "finding_title_template": "Undefined or Non-Compliant Data Retention & Erasure Practice",
        "finding_description_template": "Document does not define a purpose-bound retention period or erasure mechanism for personal data. Data appears to be retained indefinitely or beyond stated purposes.",
        "why_it_matters": "DPDP Act Section 8(7) and Rule 8 require personal data to be erased once the specified purpose is no longer served, unless retention is mandated by applicable law.",
        "suggested_action": "Define a retention schedule for each data category and implement automated purging or periodic review. Document the legal basis for any extended retention.",
    },
]

def match_dpdp_requirements(text: str, db: Session) -> list:
    """Return list of (requirement_db_obj, matched_keywords, kb_entry) for matched requirements."""
    text_lower = text.lower()
    matches = []
    reqs = db.query(models.RegulatoryRequirement).all()
    req_map = {r.provision_ref: r for r in reqs}

    for kb in DPDP_REQUIREMENTS_KB:
        matched_kw = [kw for kw in kb["keywords"] if kw in text_lower]
        if len(matched_kw) >= 2:
            req = None
            for ref, r in req_map.items():
                if any(part in ref for part in kb["req_ref"].split("&")):
                    req = r
                    break
            if not req and reqs:
                req = reqs[0]
            matches.append((req, matched_kw, kb))
    return matches

def extract_key_passages_pdf(file_bytes: bytes) -> tuple:
    """Returns (full_text, key_passages, error_msg)"""
    try:
        from pypdf import PdfReader
        reader = PdfReader(io.BytesIO(file_bytes))
        if len(reader.pages) == 0:
            return "", [], "PDF has no pages"
        full_text = ""
        passages = []
        for i, page in enumerate(reader.pages):
            page_text = page.extract_text() or ""
            full_text += page_text + "\n"
            # Heuristic: pick first 2 sentences of each page as key passage
            sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s+', page_text) if len(s.strip()) > 40]
            for sent in sentences[:2]:
                passages.append({"page": f"Page {i+1}", "section": "Auto-extracted", "text": sent[:300]})
        if not full_text.strip():
            return "", [], "PDF appears to be scanned/image-only — no extractable text"
        return full_text.strip(), passages[:8], None
    except Exception as e:
        return "", [], f"PDF extraction error: {str(e)}"

def extract_key_passages_docx(file_bytes: bytes) -> tuple:
    """Returns (full_text, key_passages, error_msg)"""
    try:
        from docx import Document as DocxDocument
        doc = DocxDocument(io.BytesIO(file_bytes))
        full_text = "\n".join(p.text for p in doc.paragraphs if p.text.strip())
        if not full_text.strip():
            return "", [], "DOCX appears empty — no paragraph text found"
        passages = []
        para_idx = 0
        for para in doc.paragraphs:
            if para.text.strip() and len(para.text.strip()) > 40:
                passages.append({"page": f"Para {para_idx+1}", "section": para.style.name or "Body", "text": para.text.strip()[:300]})
                para_idx += 1
            if para_idx >= 8:
                break
        return full_text.strip(), passages, None
    except Exception as e:
        return "", [], f"DOCX extraction error: {str(e)}"

# ─── Routes ─────────────────────────────────────────────────────────────────

@app.get("/api/state")
def get_state(db: Session = Depends(get_db)):
    org = db.query(models.Organisation).first()
    activities = db.query(models.ProcessingActivity).all()
    documents = db.query(models.Document).all()
    requirements = db.query(models.RegulatoryRequirement).all()
    findings = db.query(models.Finding).all()
    actions = db.query(models.Action).all()
    logs = db.query(models.AuditLog).order_by(models.AuditLog.timestamp.desc()).limit(50).all()

    def serialize_finding(f):
        req = db.query(models.RegulatoryRequirement).filter_by(id=f.requirement_id).first()
        proc = db.query(models.ProcessingActivity).filter_by(id=f.process_id).first()
        doc = db.query(models.Document).filter_by(id=f.document_id).first() if f.document_id else None
        return {
            "id": f.id, "title": f.title, "description": f.description,
            "requirement_id": f.requirement_id, "process_id": f.process_id, "document_id": f.document_id,
            "department": f.department, "evidence_reviewed": f.evidence_reviewed,
            "missing_or_unclear": f.missing_or_unclear, "why_it_matters": f.why_it_matters,
            "suggested_action": f.suggested_action, "priority": f.priority,
            "confidence": f.confidence, "review_status": f.review_status,
            "requirement": {"id": req.id, "provision_ref": req.provision_ref, "provision_summary": req.provision_summary, "commencement_status": req.commencement_status} if req else None,
            "process": {"id": proc.id, "process_name": proc.process_name, "department": proc.department} if proc else None,
            "document": {"id": doc.id, "title": doc.title, "filename": doc.filename, "key_passages": doc.key_passages} if doc else None,
        }

    def serialize_action(a):
        return {
            "id": a.id, "title": a.title, "description": a.description,
            "finding_id": a.finding_id, "requirement_id": a.requirement_id,
            "department": a.department, "owner": a.owner, "priority": a.priority,
            "due_date": a.due_date, "completion_criteria": a.completion_criteria,
            "status": a.status,
            "created_at": a.created_at.isoformat() if a.created_at else None,
            "updated_at": a.updated_at.isoformat() if a.updated_at else None,
        }

    return {
        "organisation": {
            "id": org.id, "name": org.name, "sector": org.sector, "size_band": org.size_band,
            "locations": org.locations, "departments": org.departments, "systems": org.systems,
            "data_categories": org.data_categories, "processors": org.processors, "description": org.description,
        } if org else None,
        "processing_activities": [
            {"id": a.id, "department": a.department, "process_name": a.process_name,
             "purpose": a.purpose, "data_subjects": a.data_subjects,
             "personal_data_categories": a.personal_data_categories,
             "collection_channel": a.collection_channel, "storage_system": a.storage_system,
             "recipients": a.recipients, "third_party_sharing": a.third_party_sharing,
             "retention_practice": a.retention_practice}
            for a in activities
        ],
        "documents": [
            {"id": d.id, "title": d.title, "filename": d.filename, "doc_type": d.doc_type,
             "status": d.status, "key_passages": d.key_passages,
             "uploaded_at": d.uploaded_at.isoformat() if d.uploaded_at else None}
            for d in documents
        ],
        "requirements": [
            {"id": r.id, "source_title": r.source_title, "provision_ref": r.provision_ref,
             "provision_summary": r.provision_summary, "obligation": r.obligation,
             "applicability": r.applicability, "commencement_status": r.commencement_status,
             "effective_date": r.effective_date, "functions_affected": r.functions_affected,
             "evidence_examples": r.evidence_examples, "source_version": r.source_version}
            for r in requirements
        ],
        "findings": [serialize_finding(f) for f in findings],
        "actions": [serialize_action(a) for a in actions],
        "audit_logs": [
            {"id": l.id, "actor": l.actor, "action_type": l.action_type,
             "details": l.details, "timestamp": l.timestamp.isoformat() if l.timestamp else None}
            for l in logs
        ],
        "metrics": compute_metrics(db),
    }

@app.put("/api/profile")
def update_profile(update: OrganisationUpdate, db: Session = Depends(get_db), x_user_email: Optional[str] = Header(None)):
    org = db.query(models.Organisation).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organisation not found")
    for field, value in update.model_dump(exclude_none=True).items():
        setattr(org, field, value)
    db.commit()
    log = models.AuditLog(actor=x_user_email or "anonymous", action_type="Profile Updated", details=f"Organisation profile updated: {list(update.model_dump(exclude_none=True).keys())}")
    db.add(log)
    db.commit()
    return {"message": "Profile updated"}

@app.post("/api/inventory")
def create_activity(activity: ProcessingActivityCreate, db: Session = Depends(get_db), x_user_email: Optional[str] = Header(None)):
    new_activity = models.ProcessingActivity(**activity.model_dump())
    db.add(new_activity)
    db.commit()
    db.refresh(new_activity)
    log = models.AuditLog(actor=x_user_email or "anonymous", action_type="Processing Activity Created", details=f"New process: {new_activity.process_name} ({new_activity.department})")
    db.add(log)
    db.commit()
    return {"id": new_activity.id, "message": "Processing activity created"}

@app.put("/api/inventory/{activity_id}")
def update_activity(activity_id: int, update: ProcessingActivityUpdate, db: Session = Depends(get_db), x_user_email: Optional[str] = Header(None)):
    activity = db.query(models.ProcessingActivity).filter_by(id=activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Processing activity not found")
    for field, value in update.model_dump(exclude_none=True).items():
        setattr(activity, field, value)
    db.commit()
    log = models.AuditLog(actor=x_user_email or "anonymous", action_type="Processing Activity Updated", details=f"Updated process ID {activity_id}")
    db.add(log)
    db.commit()
    return {"message": "Updated"}

@app.delete("/api/inventory/{activity_id}")
def delete_activity(activity_id: int, db: Session = Depends(get_db), x_user_email: Optional[str] = Header(None)):
    activity = db.query(models.ProcessingActivity).filter_by(id=activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Processing activity not found")
    db.delete(activity)
    db.commit()
    log = models.AuditLog(actor=x_user_email or "anonymous", action_type="Processing Activity Deleted", details=f"Deleted process ID {activity_id}")
    db.add(log)
    db.commit()
    return {"message": "Deleted"}

@app.post("/api/documents/upload")
async def upload_document(file: UploadFile = File(...), db: Session = Depends(get_db), x_user_email: Optional[str] = Header(None)):
    # Validate file type
    allowed_extensions = {".pdf", ".docx"}

    file_ext = os.path.splitext(file.filename or "")[1].lower()
    if file_ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail=f"Unsupported file type '{file_ext}'. Only .pdf and .docx files are accepted.")

    file_bytes = await file.read()

    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty. Please upload a non-empty document.")

    if len(file_bytes) > 20 * 1024 * 1024:  # 20MB limit
        raise HTTPException(status_code=400, detail="File exceeds 20MB size limit.")

    # Extract text
    if file_ext == ".pdf":
        full_text, key_passages, error = extract_key_passages_pdf(file_bytes)
    else:
        full_text, key_passages, error = extract_key_passages_docx(file_bytes)

    if error:
        raise HTTPException(status_code=400, detail=f"Document extraction failed: {error}")

    # Create document record
    doc_title = os.path.splitext(file.filename)[0].replace("_", " ").replace("-", " ").title()
    doc = models.Document(
        title=doc_title,
        filename=file.filename,
        doc_type="Uploaded Document",
        status="Analysed",
        extracted_text=full_text[:10000],  # Limit stored text
        key_passages=key_passages,
        uploaded_at=datetime.utcnow()
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    # Match against DPDP requirements and create findings
    matches = match_dpdp_requirements(full_text, db)
    findings_created = []

    for req, matched_kw, kb in matches[:2]:  # Max 2 findings per document
        if req:
            # Find most relevant processing activity
            proc = db.query(models.ProcessingActivity).first()

            finding = models.Finding(
                title=kb["finding_title_template"],
                description=f"{kb['finding_description_template']} [Matched keywords: {', '.join(matched_kw[:5])}]",
                requirement_id=req.id,
                process_id=proc.id if proc else 1,
                document_id=doc.id,
                department=proc.department if proc else "General",
                evidence_reviewed=f"{file.filename} (Auto-analysed)",
                missing_or_unclear=f"Compliance gap identified via keyword matching on: {', '.join(matched_kw[:5])}",
                why_it_matters=kb["why_it_matters"],
                suggested_action=kb["suggested_action"],
                priority="High" if "High" in req.provision_ref or "Section 5" in req.provision_ref else "Medium",
                confidence="Medium (Keyword Match — Requires Human Review)",
                review_status="AI Suggested"
            )
            db.add(finding)
            db.commit()
            db.refresh(finding)
            findings_created.append(finding.id)

    log = models.AuditLog(
        actor=x_user_email or "anonymous",
        action_type="Document Uploaded",
        details=f"Uploaded '{file.filename}', extracted {len(key_passages)} passages, created {len(findings_created)} AI-suggested finding(s)."
    )
    db.add(log)
    db.commit()

    return {
        "document_id": doc.id,
        "title": doc.title,
        "passages_extracted": len(key_passages),
        "findings_created": len(findings_created),
        "finding_ids": findings_created,
        "message": f"Document analysed. {len(findings_created)} AI-suggested finding(s) created for human review."
    }

@app.patch("/api/documents/{doc_id}/review")
def review_document(
    doc_id: int,
    patch: DocumentReviewPatch,
    db: Session = Depends(get_db),
    x_user_email: Optional[str] = Header(None),
    x_user_role: Optional[str] = Header(None)
):
    doc = db.query(models.Document).filter_by(id=doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    old_status = doc.status
    if patch.status:
        doc.status = patch.status

    reanalysis_findings_count = 0
    if patch.trigger_reanalysis and doc.extracted_text:
        matches = match_dpdp_requirements(doc.extracted_text, db)
        for req, matched_kw, kb in matches[:2]:
            if req:
                proc = db.query(models.ProcessingActivity).first()
                # Check if identical finding already exists for this doc & requirement
                existing = db.query(models.Finding).filter_by(
                    document_id=doc.id, requirement_id=req.id
                ).first()
                if not existing:
                    finding = models.Finding(
                        title=kb["finding_title_template"],
                        description=f"{kb['finding_description_template']} [Re-analysis matched keywords: {', '.join(matched_kw[:5])}]",
                        requirement_id=req.id,
                        process_id=proc.id if proc else 1,
                        document_id=doc.id,
                        department=proc.department if proc else "General",
                        evidence_reviewed=f"{doc.filename} (Re-analysed)",
                        missing_or_unclear=f"Re-analysis compliance gap identified via keywords: {', '.join(matched_kw[:5])}",
                        why_it_matters=kb["why_it_matters"],
                        suggested_action=kb["suggested_action"],
                        priority="High" if "Section 5" in req.provision_ref else "Medium",
                        confidence="Medium (Re-Analysis Grounded)",
                        review_status="AI Suggested",
                    )
                    db.add(finding)
                    reanalysis_findings_count += 1

    db.commit()

    notes_str = f" Notes: {patch.review_notes}" if patch.review_notes else ""
    reanalysis_str = f" Re-analysis produced {reanalysis_findings_count} new finding(s)." if patch.trigger_reanalysis else ""
    log = models.AuditLog(
        actor=x_user_email or "anonymous",
        action_type=f"Document {patch.status or 'Reviewed'}",
        details=f"Document ID {doc_id} ('{doc.title}'): status {old_status} -> {doc.status}. Role: {x_user_role or 'unknown'}.{notes_str}{reanalysis_str}"
    )
    db.add(log)
    db.commit()

    return {
        "message": f"Document status updated to {doc.status}",
        "document_id": doc.id,
        "status": doc.status,
        "reanalysis_findings_created": reanalysis_findings_count,
    }

@app.patch("/api/findings/{finding_id}")
def patch_finding(finding_id: int, patch: FindingPatch, db: Session = Depends(get_db), x_user_email: Optional[str] = Header(None), x_user_role: Optional[str] = Header(None)):
    finding = db.query(models.Finding).filter_by(id=finding_id).first()
    if not finding:
        raise HTTPException(status_code=404, detail="Finding not found")

    # Role check: only Reviewer or TCC Platform Admin can Accept/Reject
    protected_statuses = {"Accepted", "Rejected"}
    if patch.review_status in protected_statuses:
        allowed_roles = {"Compliance / Legal Reviewer", "TCC Platform Admin"}
        if x_user_role and x_user_role not in allowed_roles:
            raise HTTPException(status_code=403, detail=f"Only Compliance / Legal Reviewer or TCC Platform Admin can {patch.review_status} findings.")

    old_status = finding.review_status
    for field, value in patch.model_dump(exclude_none=True).items():
        setattr(finding, field, value)
    db.commit()

    log = models.AuditLog(
        actor=x_user_email or "anonymous",
        action_type=f"Finding {patch.review_status or 'Updated'}",
        details=f"Finding ID {finding_id} '{finding.title}': status {old_status} -> {finding.review_status}. Role: {x_user_role or 'unknown'}."
    )
    db.add(log)
    db.commit()
    return {"message": "Finding updated", "review_status": finding.review_status}

@app.post("/api/actions")
def create_action(action: ActionCreate, db: Session = Depends(get_db), x_user_email: Optional[str] = Header(None)):
    finding = db.query(models.Finding).filter_by(id=action.finding_id).first()
    if not finding:
        raise HTTPException(status_code=404, detail="Finding not found")
    if finding.review_status != "Accepted":
        raise HTTPException(status_code=400, detail="Only Accepted findings can be converted to Actions.")

    new_action = models.Action(
        title=action.title,
        description=action.description,
        finding_id=action.finding_id,
        requirement_id=finding.requirement_id,
        department=action.department,
        owner=action.owner,
        priority=action.priority,
        due_date=action.due_date,
        completion_criteria=action.completion_criteria,
        status=action.status,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db.add(new_action)
    db.commit()
    db.refresh(new_action)

    log = models.AuditLog(
        actor=x_user_email or "anonymous",
        action_type="Action Created",
        details=f"Action '{new_action.title}' created from Finding ID {action.finding_id}. Owner: {action.owner}, Due: {action.due_date}."
    )
    db.add(log)
    db.commit()
    return {"id": new_action.id, "message": "Action created"}

@app.patch("/api/actions/{action_id}")
def patch_action(action_id: int, patch: ActionPatch, db: Session = Depends(get_db), x_user_email: Optional[str] = Header(None)):
    action = db.query(models.Action).filter_by(id=action_id).first()
    if not action:
        raise HTTPException(status_code=404, detail="Action not found")
    old_status = action.status
    for field, value in patch.model_dump(exclude_none=True).items():
        setattr(action, field, value)
    action.updated_at = datetime.utcnow()
    db.commit()

    log = models.AuditLog(
        actor=x_user_email or "anonymous",
        action_type="Action Updated",
        details=f"Action ID {action_id} '{action.title}': status {old_status} -> {action.status}."
    )
    db.add(log)
    db.commit()
    return {"message": "Action updated", "status": action.status}

@app.post("/api/reset")
def reset_demo(db: Session = Depends(get_db), x_user_email: Optional[str] = Header(None), x_user_role: Optional[str] = Header(None)):
    if x_user_role and x_user_role not in {"TCC Platform Admin", "Organisation Admin"}:
        raise HTTPException(status_code=403, detail="Only TCC Platform Admin or Organisation Admin can reset demo data.")
    seed_database(db, force_reset=True)
    log = models.AuditLog(actor=x_user_email or "anonymous", action_type="Demo Reset", details="All demo records reset to initial seed state.")
    db.add(log)
    db.commit()
    return {"message": "Demo data reset successfully"}

@app.get("/health")
def health():
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}

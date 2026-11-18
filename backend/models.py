from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from database import Base

class Organisation(Base):
    __tablename__ = "organisations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    sector = Column(String(100), nullable=False)
    size_band = Column(String(100), nullable=False)
    locations = Column(String(255), nullable=False)
    departments = Column(JSON, default=list)
    systems = Column(JSON, default=list)
    data_categories = Column(JSON, default=list)
    processors = Column(JSON, default=list)
    description = Column(Text)

class ProcessingActivity(Base):
    __tablename__ = "processing_activities"

    id = Column(Integer, primary_key=True, index=True)
    department = Column(String(100), nullable=False)
    process_name = Column(String(255), nullable=False)
    purpose = Column(Text, nullable=False)
    data_subjects = Column(String(255), nullable=False)
    personal_data_categories = Column(String(255), nullable=False)
    collection_channel = Column(String(255), nullable=False)
    storage_system = Column(String(255), nullable=False)
    recipients = Column(String(255), default="Internal only")
    third_party_sharing = Column(String(255), default="Not yet defined")
    retention_practice = Column(String(255), default="Not yet defined")

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    filename = Column(String(255), nullable=False)
    doc_type = Column(String(100), nullable=False)
    status = Column(String(50), default="Analysed")
    extracted_text = Column(Text, nullable=False)
    key_passages = Column(JSON, default=list)  # List of {page, section, text}
    uploaded_at = Column(DateTime, default=datetime.utcnow)

class RegulatoryRequirement(Base):
    __tablename__ = "regulatory_requirements"

    id = Column(Integer, primary_key=True, index=True)
    source_title = Column(String(255), nullable=False)
    source_type = Column(String(50), nullable=False)
    provision_ref = Column(String(100), nullable=False)
    provision_summary = Column(Text, nullable=False)
    obligation = Column(Text, nullable=False)
    applicability = Column(Text, nullable=False)
    commencement_status = Column(String(100), nullable=False)
    effective_date = Column(String(100), nullable=False)
    functions_affected = Column(JSON, default=list)
    evidence_examples = Column(Text, nullable=False)
    source_version = Column(String(100), nullable=False)

class Finding(Base):
    __tablename__ = "findings"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    requirement_id = Column(Integer, ForeignKey("regulatory_requirements.id"), nullable=False)
    process_id = Column(Integer, ForeignKey("processing_activities.id"), nullable=False)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=True)
    department = Column(String(100), nullable=False)
    evidence_reviewed = Column(String(255), nullable=False)
    missing_or_unclear = Column(Text, nullable=False)
    why_it_matters = Column(Text, nullable=False)
    suggested_action = Column(Text, nullable=False)
    priority = Column(String(20), nullable=False)  # High / Medium / Low
    confidence = Column(String(50), default="High (Source-Grounded)")
    review_status = Column(String(50), default="AI Suggested")  # AI Suggested, Pending Human Review, Accepted, Rejected, Needs More Information

    requirement = relationship("RegulatoryRequirement")
    process = relationship("ProcessingActivity")
    document = relationship("Document")

class Action(Base):
    __tablename__ = "actions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    finding_id = Column(Integer, ForeignKey("findings.id"), nullable=False)
    requirement_id = Column(Integer, ForeignKey("regulatory_requirements.id"), nullable=False)
    department = Column(String(100), nullable=False)
    owner = Column(String(100), nullable=False)
    priority = Column(String(20), nullable=False)
    due_date = Column(String(50), nullable=False)
    completion_criteria = Column(Text, nullable=False)
    status = Column(String(50), default="Not Started")  # Not Started, In Progress, Under Review, Completed
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    finding = relationship("Finding")
    requirement = relationship("RegulatoryRequirement")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    actor = Column(String(100), nullable=False)
    action_type = Column(String(100), nullable=False)
    details = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
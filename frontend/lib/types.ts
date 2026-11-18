export interface Organisation {
  id: number; name: string; sector: string; size_band: string;
  locations: string; departments: string[]; systems: string[];
  data_categories: string[]; processors: string[]; description: string;
}
export interface ProcessingActivity {
  id: number; department: string; process_name: string; purpose: string;
  data_subjects: string; personal_data_categories: string;
  collection_channel: string; storage_system: string;
  recipients: string; third_party_sharing: string; retention_practice: string;
}
export interface Document {
  id: number; title: string; filename: string; doc_type: string;
  status: string; key_passages: Array<{ page: string; section: string; text: string }>;
  uploaded_at: string;
}
export interface RegulatoryRequirement {
  id: number; source_title: string; provision_ref: string;
  provision_summary: string; obligation: string; applicability: string;
  commencement_status: string; effective_date: string;
  functions_affected: string[]; evidence_examples: string; source_version: string;
}
export interface Finding {
  id: number; title: string; description: string;
  requirement_id: number; process_id: number; document_id: number | null;
  department: string; evidence_reviewed: string;
  missing_or_unclear: string; why_it_matters: string;
  suggested_action: string; priority: string; confidence: string; review_status: string;
  requirement: { id: number; provision_ref: string; provision_summary: string; commencement_status: string } | null;
  process: { id: number; process_name: string; department: string } | null;
  document: { id: number; title: string; filename: string; key_passages: any[] } | null;
}
export interface Action {
  id: number; title: string; description: string;
  finding_id: number; requirement_id: number; department: string;
  owner: string; priority: string; due_date: string;
  completion_criteria: string; status: string;
  created_at: string; updated_at: string;
}
export interface AuditLog {
  id: number; actor: string; action_type: string; details: string; timestamp: string;
}
export interface AppState {
  organisation: Organisation | null;
  processing_activities: ProcessingActivity[];
  documents: Document[];
  requirements: RegulatoryRequirement[];
  findings: Finding[];
  actions: Action[];
  audit_logs: AuditLog[];
  metrics: {
    total_findings: number;
    findings_by_status: Record<string, number>;
    findings_by_priority: Record<string, number>;
    total_actions: number;
    actions_completed: number;
    actions_in_progress: number;
    actions_not_started: number;
    total_processes: number;
    total_documents: number;
    total_requirements: number;
    inventory_coverage_pct: number;
  };
}

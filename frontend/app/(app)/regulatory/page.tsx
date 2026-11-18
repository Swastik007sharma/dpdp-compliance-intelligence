"use client";
import React from "react";
import { useAppState } from "@/lib/hooks";
import {
  Card,
  PageHeader,
  LoadingSpinner,
  ErrorBanner,
  CommencementBadge,
  StatusBadge,
  PriorityBadge,
} from "@/components/ui";

export default function RegulatoryMappingPage() {
  const { state, loading, error } = useAppState();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorBanner message={error} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Regulatory-to-Organisational Mapping"
        subtitle="End-to-end traceability chain: Law / Provision → Obligation → Business Process → Department → Evidence → Gap / Finding"
      />

      <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/80 text-xs text-blue-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <span className="font-bold">Core Traceability Rule:</span> Every legal obligation is
          grounded in India's DPDP Act 2023 or DPDP Rules 2025. Unenacted provisions display their
          explicit statutory commencement schedule.
        </div>
        <span className="shrink-0 px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-semibold text-[11px]">
          G.S.R. 843(E) Grounded
        </span>
      </div>

      <div className="space-y-6">
        {state?.requirements.map((req) => {
          // Find linked findings
          const linkedFindings = state.findings.filter((f) => f.requirement_id === req.id);
          const linkedProcessIds = [...new Set(linkedFindings.map((f) => f.process_id))];
          const linkedProcesses = state.processing_activities.filter((p) =>
            linkedProcessIds.includes(p.id)
          );
          const linkedDocIds = [...new Set(linkedFindings.map((f) => f.document_id).filter(Boolean))];
          const linkedDocs = state.documents.filter((d) => linkedDocIds.includes(d.id));

          return (
            <Card key={req.id} className="overflow-hidden border-slate-200 shadow-xs">
              <div className="bg-slate-900 text-white p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-blue-400 bg-blue-950/80 px-2.5 py-0.5 rounded border border-blue-800/60">
                      {req.provision_ref}
                    </span>
                    <CommencementBadge status={req.commencement_status} />
                  </div>
                  <h3 className="text-base font-bold text-white pt-1">{req.provision_summary}</h3>
                </div>
                <div className="text-xs text-slate-400 font-mono text-left md:text-right">
                  <div>Source: {req.source_title}</div>
                  <div className="text-[11px] text-slate-500">Effective: {req.effective_date}</div>
                </div>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6 text-xs divide-y md:divide-y-0 md:divide-x divide-slate-100">
                {/* 1. Legal Obligation */}
                <div className="space-y-2 pr-0 md:pr-4">
                  <span className="font-bold text-slate-400 uppercase tracking-wider block">
                    1. Legal Obligation
                  </span>
                  <p className="text-slate-800 leading-relaxed font-medium">{req.obligation}</p>
                  <div className="pt-2">
                    <span className="text-slate-400 font-semibold block mb-1">Applicability:</span>
                    <p className="text-slate-600 text-[11px]">{req.applicability}</p>
                  </div>
                </div>

                {/* 2. Business Process & Dept */}
                <div className="space-y-2 pt-4 md:pt-0 md:px-4">
                  <span className="font-bold text-slate-400 uppercase tracking-wider block">
                    2. Affected Processes
                  </span>
                  {linkedProcesses.length > 0 ? (
                    <div className="space-y-2">
                      {linkedProcesses.map((p) => (
                        <div key={p.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                          <span className="font-bold text-slate-900 block">{p.process_name}</span>
                          <span className="text-[11px] text-blue-700 font-medium">
                            Dept: {p.department}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 italic">No business process mapped yet.</p>
                  )}
                </div>

                {/* 3. Document Evidence */}
                <div className="space-y-2 pt-4 md:pt-0 md:px-4">
                  <span className="font-bold text-slate-400 uppercase tracking-wider block">
                    3. Supporting Evidence
                  </span>
                  {linkedDocs.length > 0 ? (
                    <div className="space-y-2">
                      {linkedDocs.map((doc) => (
                        <div key={doc.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                          <span className="font-bold text-slate-900 block">{doc.title}</span>
                          <span className="text-[11px] text-slate-500 block truncate">
                            {doc.filename}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 italic">No document evidence linked.</p>
                  )}
                  <div className="pt-2">
                    <span className="text-slate-400 font-semibold block mb-1">Required Evidence:</span>
                    <p className="text-slate-600 text-[11px]">{req.evidence_examples}</p>
                  </div>
                </div>

                {/* 4. Identified Findings */}
                <div className="space-y-2 pt-4 md:pt-0 md:pl-4">
                  <span className="font-bold text-slate-400 uppercase tracking-wider block">
                    4. Finding & Gap Status
                  </span>
                  {linkedFindings.length > 0 ? (
                    <div className="space-y-2">
                      {linkedFindings.map((f) => (
                        <div key={f.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <PriorityBadge priority={f.priority} />
                            <StatusBadge status={f.review_status} />
                          </div>
                          <p className="font-semibold text-slate-800 line-clamp-2 mt-1">{f.title}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="inline-block px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 text-[11px] font-medium border border-emerald-200">
                      No active compliance gaps
                    </span>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

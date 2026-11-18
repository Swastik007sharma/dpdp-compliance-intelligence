"use client";
import React, { useState } from "react";
import { useAppState } from "@/lib/hooks";
import {
  Card,
  PageHeader,
  LoadingSpinner,
  ErrorBanner,
  Badge,
  StatusBadge,
  PriorityBadge,
} from "@/components/ui";
import { api } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { Finding } from "@/lib/types";

const REVIEWER_ROLES = ["Compliance / Legal Reviewer", "TCC Platform Admin"];

function ConvertToActionModal({
  finding,
  onClose,
  onCreated,
  session,
}: {
  finding: Finding;
  onClose: () => void;
  onCreated: () => void;
  session: any;
}) {
  const [form, setForm] = useState({
    title: `Remediate: ${finding.title.slice(0, 60)}`,
    description: finding.suggested_action,
    department: finding.department,
    owner: finding.department === "HR" ? "Anita Desai (HR Lead)" : "Rajesh Mehta (Compliance Lead)",
    priority: finding.priority,
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    completion_criteria:
      "Update internal documentation, execute necessary contractual addenda, and upload verified evidence.",
  });
  const [saving, setSaving] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.createAction(
        {
          finding_id: finding.id,
          title: form.title,
          description: form.description,
          department: form.department,
          owner: form.owner,
          priority: form.priority,
          due_date: form.due_date,
          completion_criteria: form.completion_criteria,
          status: "Not Started",
        },
        session?.user?.email
      );
      onCreated();
      onClose();
    } catch (e: any) {
      alert(e.message || "Failed to create action");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full p-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">
            Convert Finding to Remediation Action
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer">
            ✕
          </button>
        </div>

        <form onSubmit={handleCreate} className="space-y-4 pt-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 uppercase mb-1">
              Action Title
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1">
                Accountable Owner
              </label>
              <input
                type="text"
                required
                value={form.owner}
                onChange={(e) => setForm({ ...form, owner: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1">
                Department
              </label>
              <input
                type="text"
                required
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1">Due Date</label>
              <input
                type="date"
                required
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase mb-1">
              Completion Criteria / Required Evidence
            </label>
            <textarea
              rows={2}
              required
              value={form.completion_criteria}
              onChange={(e) => setForm({ ...form, completion_criteria: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg cursor-pointer disabled:opacity-50"
            >
              {saving ? "Creating Action..." : "Confirm & Create Action"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function FindingsPage() {
  const { state, loading, error, refresh } = useAppState();
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role || "";
  const isReviewer = REVIEWER_ROLES.includes(userRole);

  const [convertModalFinding, setConvertModalFinding] = useState<Finding | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorBanner message={error} />;

  const handleStatusChange = async (findingId: number, newStatus: string) => {
    setUpdatingId(findingId);
    try {
      await api.patchFinding(
        findingId,
        { review_status: newStatus },
        session?.user?.email,
        userRole
      );
      await refresh();
    } catch (e: any) {
      alert(e.message || "Failed to update review status");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Compliance Findings & Human-In-The-Loop Review"
        subtitle="Review AI-suggested DPDP compliance gaps, inspect clause citations, verify findings, and escalate to corrective actions"
      />

      {/* Governance & Disclaimers */}
      <div className="p-4 rounded-xl bg-slate-900 text-white text-xs space-y-1 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="font-bold text-blue-400 uppercase tracking-wider">
            Human-In-The-Loop Review Protocol (DPDP Section 8)
          </span>
          <span className="text-[11px] text-slate-400">
            Current User: {session?.user?.email || "Anonymous"} ({userRole || "Department User"})
          </span>
        </div>
        <p className="text-slate-300 leading-relaxed">
          AI findings remain suggestions until validated by an authorised legal or compliance reviewer.
          Findings cannot certify compliance or guarantee non-enforcement.
        </p>
      </div>

      <div className="space-y-4">
        {state?.findings.map((f) => {
          const isAISuggested = f.review_status === "AI Suggested";
          const isAccepted = f.review_status === "Accepted";

          return (
            <Card key={f.id} className="p-6 space-y-4">
              {/* Header: Title, Badges & Citations */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <StatusBadge status={f.review_status} />
                    <PriorityBadge priority={f.priority} />
                    {isAISuggested && (
                      <Badge variant="ai">🤖 AI Suggested Finding</Badge>
                    )}
                    <span className="text-[11px] text-slate-500 font-medium">
                      Confidence: {f.confidence}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">{f.title}</h3>
                </div>

                {f.requirement && (
                  <div className="shrink-0 text-right">
                    <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                      {f.requirement.provision_ref}
                    </span>
                    <span className="block text-[11px] text-slate-500 mt-1">
                      {f.department} Department
                    </span>
                  </div>
                )}
              </div>

              {/* Finding Narrative Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700 bg-slate-50/60 p-4 rounded-xl border border-slate-100">
                <div className="space-y-2">
                  <div>
                    <span className="font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                      Description of Finding:
                    </span>
                    <p className="leading-relaxed">{f.description}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                      Identified Gap / Missing Information:
                    </span>
                    <p className="leading-relaxed text-red-700 font-medium">{f.missing_or_unclear}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <span className="font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                      Why It Matters (DPDP Obligation):
                    </span>
                    <p className="leading-relaxed text-slate-800 font-medium">{f.why_it_matters}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                      Recommended Corrective Action:
                    </span>
                    <p className="leading-relaxed text-blue-800 font-medium">{f.suggested_action}</p>
                  </div>
                </div>
              </div>

              {/* Evidence Review Quote */}
              <div className="text-xs border-l-2 border-l-blue-600 pl-3 py-1 bg-blue-50/20 rounded-r-lg">
                <span className="font-semibold text-slate-700">Evidence Reviewed: </span>
                <span className="text-slate-600 font-mono">{f.evidence_reviewed}</span>
                {f.document && f.document.key_passages && f.document.key_passages.length > 0 && (
                  <div className="mt-1 text-[11px] text-slate-500 italic">
                    Referenced Passage: "{f.document.key_passages[0]?.text?.slice(0, 160)}..."
                  </div>
                )}
              </div>

              {/* Reviewer Action Controls */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2 flex-wrap">
                  {isReviewer ? (
                    <>
                      {f.review_status !== "Accepted" && (
                        <button
                          onClick={() => handleStatusChange(f.id, "Accepted")}
                          disabled={updatingId === f.id}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs cursor-pointer shadow-xs disabled:opacity-50"
                        >
                          ✓ Accept Finding
                        </button>
                      )}
                      {f.review_status !== "Rejected" && (
                        <button
                          onClick={() => handleStatusChange(f.id, "Rejected")}
                          disabled={updatingId === f.id}
                          className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs cursor-pointer shadow-xs disabled:opacity-50"
                        >
                          ✕ Reject
                        </button>
                      )}
                      {f.review_status !== "Needs More Information" && (
                        <button
                          onClick={() => handleStatusChange(f.id, "Needs More Information")}
                          disabled={updatingId === f.id}
                          className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-xs cursor-pointer disabled:opacity-50"
                        >
                          ? Needs More Info
                        </button>
                      )}
                      {f.review_status !== "Pending Human Review" && (
                        <button
                          onClick={() => handleStatusChange(f.id, "Pending Human Review")}
                          disabled={updatingId === f.id}
                          className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-xs cursor-pointer disabled:opacity-50"
                        >
                          Mark Pending Review
                        </button>
                      )}
                    </>
                  ) : (
                    <span className="text-xs text-slate-400 italic">
                      Review controls restricted to Compliance / Legal Reviewer role.
                    </span>
                  )}
                </div>

                {isAccepted && (
                  <button
                    onClick={() => setConvertModalFinding(f)}
                    className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs cursor-pointer shadow-xs"
                  >
                    → Convert to Action
                  </button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {convertModalFinding && (
        <ConvertToActionModal
          finding={convertModalFinding}
          onClose={() => setConvertModalFinding(null)}
          onCreated={refresh}
          session={session}
        />
      )}
    </div>
  );
}

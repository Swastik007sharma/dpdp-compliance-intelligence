"use client";
import React, { useState } from "react";
import { useAppState } from "@/lib/hooks";
import { Card, PageHeader, LoadingSpinner, ErrorBanner } from "@/components/ui";
import { api } from "@/lib/api";
import { useSession } from "@/lib/auth-client";

export default function SettingsPage() {
  const { state, loading, error, refresh } = useAppState();
  const { data: session } = useSession();
  const [resetting, setResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState("");

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorBanner message={error} />;

  const userRole = (session?.user as any)?.role || "User";
  const canReset = ["TCC Platform Admin", "Organisation Admin"].includes(userRole);

  const handleReset = async () => {
    if (
      !confirm(
        "Reset the demo environment? This will re-seed Bharat Precision Engineering's baseline records and clear newly added test entries."
      )
    )
      return;

    setResetting(true);
    setResetMessage("");
    try {
      const res = await api.resetDemo(session?.user?.email, userRole);
      setResetMessage(res.message || "Environment reset successfully");
      await refresh();
    } catch (e: any) {
      alert(e.message || "Failed to reset demo data");
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings & Platform Governance"
        subtitle="Manage session credentials, RBAC permissions, knowledge base boundaries, and demo state"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Active Session & RBAC Info */}
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            Active Session & Access Permissions
          </h3>
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-500 block">Logged-in User</span>
              <p className="font-semibold text-slate-900 mt-0.5">
                {session?.user?.name || "Priya Sharma"} ({session?.user?.email || "reviewer@bharatprecision.example"})
              </p>
            </div>

            <div>
              <span className="text-slate-500 block">Assigned Role</span>
              <span className="inline-block mt-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                {userRole}
              </span>
            </div>

            <div className="pt-2 text-slate-600 leading-relaxed">
              <span className="font-semibold text-slate-700">Role Capabilities:</span>
              <ul className="list-disc list-inside mt-1 space-y-1 text-slate-500">
                <li>Review & Accept/Reject AI-suggested gaps (Reviewer / TCC Admin)</li>
                <li>Convert accepted findings to traceable action items</li>
                <li>Update status and accountability on assigned operational actions</li>
                <li>Upload and run clause extraction on policies & agreements</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Knowledge Base & Legal Boundaries */}
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            DPDP Knowledge Base & Legal Guardrails
          </h3>
          <div className="space-y-2.5 text-xs text-slate-600 leading-relaxed">
            <p>
              <strong className="text-slate-800">Primary Legal Baseline:</strong> Digital Personal
              Data Protection (DPDP) Act, 2023 & Draft DPDP Rules, 2025.
            </p>
            <p>
              <strong className="text-slate-800">Commencement Metadata:</strong> Key substantive
              obligations under Sections 5 and 8 are scheduled for commencement on{" "}
              <strong>13 May 2027</strong> via G.S.R. 843(E).
            </p>
            <p>
              <strong className="text-slate-800">Non-Hallucination Guardrail:</strong> The platform
              strictly enforces clause-level retrieval from lawyer-curated provisions. No section
              numbers, penalty figures, or statutory compliance claims are invented by AI.
            </p>
          </div>
        </Card>

        {/* Demo Reset Facility */}
        <Card className="p-6 space-y-4 md:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Idempotent Demo Data Reset
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Restore the initial baseline scenario for Bharat Precision Engineering Pvt. Ltd. (3
                processing activities, 4 documents, 2 traceable findings).
              </p>
            </div>
            {canReset ? (
              <button
                onClick={handleReset}
                disabled={resetting}
                className="px-4 py-2 text-xs bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50 shrink-0"
              >
                {resetting ? "Resetting Environment..." : "Reset Demo Data"}
              </button>
            ) : (
              <span className="text-xs text-slate-400 italic">
                Reset requires Organisation Admin or TCC Platform Admin role.
              </span>
            )}
          </div>

          {resetMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs">
              {resetMessage}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

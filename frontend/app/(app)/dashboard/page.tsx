"use client";
import React from "react";
import { useAppState } from "@/lib/hooks";
import {
  Card,
  PageHeader,
  StatusBadge,
  PriorityBadge,
  LoadingSpinner,
  ErrorBanner,
} from "@/components/ui";
import Link from "next/link";

export default function DashboardPage() {
  const { state, loading, error } = useAppState();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorBanner message={error} />;
  if (!state) return null;

  const m = state.metrics;
  const org = state.organisation;

  return (
    <div className="space-y-8">
      <PageHeader
        title={org ? `${org.name}` : "Compliance Overview"}
        subtitle={`DPDP Act 2023 Readiness Intelligence · ${org?.sector || "Industrial Manufacturing"}`}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/findings"
              className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium px-3.5 py-2 rounded-lg transition-colors shadow-xs"
            >
              Review Open Findings
            </Link>
            <Link
              href="/actions"
              className="text-xs border border-slate-300 hover:bg-white text-slate-700 font-medium px-3.5 py-2 rounded-lg transition-colors"
            >
              View Action Plan
            </Link>
          </div>
        }
      />

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 border-l-4 border-l-blue-600">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Potential Findings
          </span>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">
            {m.total_findings}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {m.findings_by_status.accepted || 0} accepted · {m.findings_by_status.ai_suggested || 0} AI suggested
          </p>
        </Card>

        <Card className="p-5 border-l-4 border-l-red-500">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            High Priority Gaps
          </span>
          <div className="text-3xl font-extrabold text-red-600 mt-2">
            {m.findings_by_priority.High || 0}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Requiring immediate compliance attention
          </p>
        </Card>

        <Card className="p-5 border-l-4 border-l-emerald-600">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Remediation Actions
          </span>
          <div className="text-3xl font-extrabold text-emerald-600 mt-2">
            {m.actions_completed}
            <span className="text-slate-400 text-lg font-normal"> / {m.total_actions}</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {m.actions_in_progress} in progress · {m.actions_not_started} not started
          </p>
        </Card>

        <Card className="p-5 border-l-4 border-l-amber-500">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Inventory Coverage
          </span>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">
            {m.inventory_coverage_pct}%
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {m.total_processes} processes mapped across {m.total_requirements} obligations
          </p>
        </Card>
      </div>

      {/* Mid Section: Finding Status and Action Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-sm tracking-tight">
              Findings Breakdown by Review Status
            </h3>
            <span className="text-xs text-slate-400">Human-In-The-Loop Governance</span>
          </div>
          <div className="space-y-3">
            {[
              { label: "AI Suggested", count: m.findings_by_status.ai_suggested || 0, color: "bg-indigo-50 text-indigo-700" },
              { label: "Pending Human Review", count: m.findings_by_status.pending_human_review || 0, color: "bg-amber-50 text-amber-700" },
              { label: "Accepted", count: m.findings_by_status.accepted || 0, color: "bg-emerald-50 text-emerald-700" },
              { label: "Rejected", count: m.findings_by_status.rejected || 0, color: "bg-rose-50 text-rose-700" },
              { label: "Needs More Information", count: m.findings_by_status.needs_more_information || 0, color: "bg-sky-50 text-sky-700" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50/50">
                <StatusBadge status={item.label} />
                <span className="text-sm font-bold text-slate-900">{item.count}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-sm tracking-tight">
              Action Execution Progress
            </h3>
            <span className="text-xs text-slate-400">Department Ownership</span>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-600 font-medium">
                <span>Overall Action Completion</span>
                <span>
                  {m.total_actions ? Math.round((m.actions_completed / m.total_actions) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-emerald-600 h-2.5 rounded-full transition-all duration-500"
                  style={{
                    width: m.total_actions
                      ? `${(m.actions_completed / m.total_actions) * 100}%`
                      : "0%",
                  }}
                />
              </div>
            </div>

            <div className="pt-2 grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <div className="text-xs text-slate-500 font-medium">Not Started</div>
                <div className="text-lg font-bold text-slate-800 mt-1">{m.actions_not_started}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-50/60 border border-amber-100">
                <div className="text-xs text-amber-700 font-medium">In Progress</div>
                <div className="text-lg font-bold text-amber-700 mt-1">{m.actions_in_progress}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-100">
                <div className="text-xs text-emerald-700 font-medium">Completed</div>
                <div className="text-lg font-bold text-emerald-700 mt-1">{m.actions_completed}</div>
              </div>
            </div>

            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-blue-900">
              <span className="font-semibold">Statutory Commencement Notice:</span> Key DPDP Act provisions scheduled for commencement on{" "}
              <strong>13 May 2027</strong> per G.S.R. 843(E). Corrective actions address operational gaps well before statutory liability.
            </div>
          </div>
        </Card>
      </div>

      {/* Bottom Section: Recent Audit Log */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-900 text-sm tracking-tight">
            Compliance & Audit Activity Log
          </h3>
          <span className="text-xs text-slate-400">Tamper-evident system trail</span>
        </div>
        <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
          {state.audit_logs.slice(0, 10).map((log) => (
            <div key={log.id} className="py-3 flex items-start gap-4 text-xs">
              <span className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900">{log.action_type}</span>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-500">{log.actor}</span>
                </div>
                <p className="text-slate-600 mt-0.5">{log.details}</p>
              </div>
              <span className="text-slate-400 whitespace-nowrap">
                {new Date(log.timestamp).toLocaleString("en-IN", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

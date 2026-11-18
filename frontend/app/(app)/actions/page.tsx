"use client";
import React, { useState } from "react";
import { useAppState } from "@/lib/hooks";
import {
  Card,
  PageHeader,
  LoadingSpinner,
  ErrorBanner,
  StatusBadge,
  PriorityBadge,
} from "@/components/ui";
import { api } from "@/lib/api";
import { useSession } from "@/lib/auth-client";

const STATUS_OPTIONS = ["Not Started", "In Progress", "Under Review", "Completed"];

export default function ActionsPage() {
  const { state, loading, error, refresh } = useAppState();
  const { data: session } = useSession();
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorBanner message={error} />;

  const handleStatusChange = async (actionId: number, newStatus: string) => {
    setUpdatingId(actionId);
    try {
      await api.patchAction(
        actionId,
        { status: newStatus },
        session?.user?.email
      );
      await refresh();
    } catch (e: any) {
      alert(e.message || "Failed to update action status");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Compliance Action Plan & Remediation"
        subtitle="Operational tasks created from accepted findings with designated owners, completion criteria, and live execution status"
      />

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4">Action Item & Objective</th>
                <th className="py-3.5 px-4">Department & Owner</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Due Date</th>
                <th className="py-3.5 px-4">Completion Criteria</th>
                <th className="py-3.5 px-4">Current Status</th>
                <th className="py-3.5 px-4 text-right">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {state?.actions && state.actions.length > 0 ? (
                state.actions.map((act) => (
                  <tr key={act.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 max-w-xs">
                      <span className="font-bold text-slate-900 block leading-tight">
                        {act.title}
                      </span>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                        {act.description}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">{act.owner}</div>
                      <span className="text-[11px] text-blue-600 font-medium">
                        {act.department}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <PriorityBadge priority={act.priority} />
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-slate-600">
                      {act.due_date}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs text-slate-600 leading-relaxed text-[11px]">
                      {act.completion_criteria}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={act.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <select
                        value={act.status}
                        disabled={updatingId === act.id}
                        onChange={(e) => handleStatusChange(act.id, e.target.value)}
                        className="px-2.5 py-1 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white font-medium cursor-pointer"
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No remediation actions created yet. Accept a finding in the{" "}
                    <strong>Findings</strong> view to convert it into an action item.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

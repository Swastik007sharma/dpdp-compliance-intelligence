"use client";
import React from "react";

export function Badge({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?:
    | "default"
    | "high"
    | "medium"
    | "low"
    | "ai"
    | "accepted"
    | "rejected"
    | "pending"
    | "needs-info"
    | "scheduled"
    | "commenced";
}) {
  const styles: Record<string, string> = {
    default: "bg-slate-100 text-slate-700 border border-slate-200",
    high: "bg-red-50 text-red-700 border border-red-200",
    medium: "bg-amber-50 text-amber-700 border border-amber-200",
    low: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    ai: "bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold",
    accepted: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    rejected: "bg-rose-50 text-rose-700 border border-rose-200",
    pending: "bg-amber-50 text-amber-700 border border-amber-200",
    "needs-info": "bg-sky-50 text-sky-700 border border-sky-200",
    scheduled: "bg-amber-50 text-amber-800 border border-amber-300 font-medium",
    commenced: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${
        styles[variant] || styles.default
      }`}
    >
      {children}
    </span>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-white border border-slate-200/80 rounded-xl shadow-xs ${className}`}>
      {children}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
        {subtitle && <p className="text-slate-500 mt-1 text-sm">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, "ai" | "pending" | "accepted" | "rejected" | "needs-info" | "default"> = {
    "AI Suggested": "ai",
    "Pending Human Review": "pending",
    Accepted: "accepted",
    Rejected: "rejected",
    "Needs More Information": "needs-info",
    "Not Started": "default",
    "In Progress": "pending",
    "Under Review": "needs-info",
    Completed: "accepted",
  };
  return <Badge variant={map[status] || "default"}>{status}</Badge>;
}

export function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, "high" | "medium" | "low"> = {
    High: "high",
    Medium: "medium",
    Low: "low",
  };
  return <Badge variant={map[priority] || "low"}>{priority}</Badge>;
}

export function CommencementBadge({ status }: { status: string }) {
  const isScheduled = status.toLowerCase().includes("scheduled");
  return <Badge variant={isScheduled ? "scheduled" : "commenced"}>{status}</Badge>;
}

export function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-3">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
      <span className="text-xs text-slate-500 font-medium">Loading platform data...</span>
    </div>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm flex items-start gap-3">
      <span className="font-semibold text-red-800">Error:</span>
      <span>{message}</span>
    </div>
  );
}

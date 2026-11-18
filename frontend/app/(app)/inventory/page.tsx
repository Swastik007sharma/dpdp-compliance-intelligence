"use client";
import React, { useState } from "react";
import { useAppState } from "@/lib/hooks";
import { Card, PageHeader, LoadingSpinner, ErrorBanner } from "@/components/ui";
import { api } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { ProcessingActivity } from "@/lib/types";

const INITIAL_FORM: Partial<ProcessingActivity> = {
  department: "HR",
  process_name: "",
  purpose: "",
  data_subjects: "",
  personal_data_categories: "",
  collection_channel: "",
  storage_system: "",
  recipients: "Internal only",
  third_party_sharing: "Not yet defined",
  retention_practice: "Not yet defined",
};

export default function InventoryPage() {
  const { state, loading, error, refresh } = useAppState();
  const { data: session } = useSession();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Partial<ProcessingActivity>>(INITIAL_FORM);
  const [saving, setSaving] = useState(false);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorBanner message={error} />;

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm(INITIAL_FORM);
    setShowModal(true);
  };

  const handleOpenEdit = (act: ProcessingActivity) => {
    setEditingId(act.id);
    setForm(act);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this processing activity?")) return;
    try {
      await api.deleteActivity(id, session?.user?.email);
      await refresh();
    } catch (e: any) {
      alert(e.message || "Failed to delete processing activity");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await api.updateActivity(editingId, form, session?.user?.email);
      } else {
        await api.createActivity(form, session?.user?.email);
      }
      await refresh();
      setShowModal(false);
    } catch (e: any) {
      alert(e.message || "Failed to save processing activity");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Data Processing Inventory (RoPA)"
        subtitle="Catalog business processes collecting personal data, storage locations, sharing, and retention practices"
        actions={
          <button
            onClick={handleOpenAdd}
            className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            + Add Processing Activity
          </button>
        }
      />

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4">Department & Process</th>
                <th className="py-3.5 px-4">Purpose</th>
                <th className="py-3.5 px-4">Data Subjects & Categories</th>
                <th className="py-3.5 px-4">Storage / Channel</th>
                <th className="py-3.5 px-4">Sharing & Recipients</th>
                <th className="py-3.5 px-4">Retention Practice</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {state?.processing_activities.map((act) => {
                const isRetentionUndefined =
                  act.retention_practice.toLowerCase().includes("not yet defined") ||
                  act.retention_practice.toLowerCase().includes("indefinite");

                return (
                  <tr key={act.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-900 block">
                        {act.process_name}
                      </span>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 font-medium">
                        {act.department}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">{act.purpose}</td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-medium text-slate-800">{act.data_subjects}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                        {act.personal_data_categories}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-medium text-slate-800">{act.storage_system}</div>
                      <div className="text-[11px] text-slate-500">{act.collection_channel}</div>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="text-slate-800">{act.recipients}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Sharing: {act.third_party_sharing}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                          isRetentionUndefined
                            ? "bg-amber-50 text-amber-800 border border-amber-200"
                            : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        }`}
                      >
                        {act.retention_practice}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleOpenEdit(act)}
                        className="text-blue-600 hover:text-blue-800 font-medium mr-3 cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(act.id)}
                        className="text-red-600 hover:text-red-800 font-medium cursor-pointer"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingId ? "Edit Processing Activity" : "Record New Processing Activity"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Department
                  </label>
                  <select
                    value={form.department || "HR"}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="HR">HR</option>
                    <option value="Sales & Dealer Network">Sales & Dealer Network</option>
                    <option value="Procurement">Procurement</option>
                    <option value="IT">IT</option>
                    <option value="Operations">Operations</option>
                    <option value="Legal / Compliance">Legal / Compliance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Process Name
                  </label>
                  <input
                    type="text"
                    required
                    value={form.process_name || ""}
                    onChange={(e) => setForm({ ...form, process_name: e.target.value })}
                    placeholder="e.g. Employee Recruitment & Onboarding"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Processing Purpose
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={form.purpose || ""}
                    onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                    placeholder="Describe legal / commercial purpose for collecting data"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Data Subjects
                  </label>
                  <input
                    type="text"
                    required
                    value={form.data_subjects || ""}
                    onChange={(e) => setForm({ ...form, data_subjects: e.target.value })}
                    placeholder="e.g. Job Applicants & Employees"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Personal Data Categories
                  </label>
                  <input
                    type="text"
                    required
                    value={form.personal_data_categories || ""}
                    onChange={(e) =>
                      setForm({ ...form, personal_data_categories: e.target.value })
                    }
                    placeholder="e.g. Name, PAN, Aadhaar, Bank Details"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Collection Channel
                  </label>
                  <input
                    type="text"
                    required
                    value={form.collection_channel || ""}
                    onChange={(e) => setForm({ ...form, collection_channel: e.target.value })}
                    placeholder="e.g. Careers Portal, Web Form, Email"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Storage System
                  </label>
                  <input
                    type="text"
                    required
                    value={form.storage_system || ""}
                    onChange={(e) => setForm({ ...form, storage_system: e.target.value })}
                    placeholder="e.g. Darwinbox HRMS, SAP ERP, Zoho CRM"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Third-Party Sharing Status
                  </label>
                  <input
                    type="text"
                    value={form.third_party_sharing || ""}
                    onChange={(e) => setForm({ ...form, third_party_sharing: e.target.value })}
                    placeholder="e.g. Shared with BGV vendor via email"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Retention / Deletion Practice
                  </label>
                  <input
                    type="text"
                    value={form.retention_practice || ""}
                    onChange={(e) => setForm({ ...form, retention_practice: e.target.value })}
                    placeholder="e.g. 7 years statutory tax or Not yet defined"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg cursor-pointer disabled:opacity-50"
                >
                  {saving ? "Saving..." : editingId ? "Update Activity" : "Create Activity"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

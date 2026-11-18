"use client";
import React, { useState } from "react";
import { useAppState } from "@/lib/hooks";
import { Card, PageHeader, LoadingSpinner, ErrorBanner } from "@/components/ui";
import { api } from "@/lib/api";
import { useSession } from "@/lib/auth-client";

export default function ProfilePage() {
  const { state, loading, error, refresh } = useAppState();
  const { data: session } = useSession();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({});

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorBanner message={error} />;
  if (!state?.organisation) return <ErrorBanner message="No organisation profile found." />;

  const org = state.organisation;

  const startEdit = () => {
    setForm({
      name: org.name,
      sector: org.sector,
      size_band: org.size_band,
      locations: org.locations,
      description: org.description,
    });
    setEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateProfile(
        form,
        session?.user?.email,
        (session?.user as any)?.role
      );
      await refresh();
      setEditing(false);
    } catch (e: any) {
      alert(e.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Organisation Profile"
        subtitle="Manage business structure, operating locations, and systems in DPDP scope"
        actions={
          !editing && (
            <button
              onClick={startEdit}
              className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              Edit Profile
            </button>
          )
        }
      />

      {editing ? (
        <Card className="p-6">
          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Organisation Name
                </label>
                <input
                  type="text"
                  required
                  value={form.name || ""}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Sector / Industry
                </label>
                <input
                  type="text"
                  required
                  value={form.sector || ""}
                  onChange={(e) => setForm({ ...form, sector: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Size / Employee Band
                </label>
                <input
                  type="text"
                  value={form.size_band || ""}
                  onChange={(e) => setForm({ ...form, size_band: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Operating Locations / Plants
                </label>
                <input
                  type="text"
                  value={form.locations || ""}
                  onChange={(e) => setForm({ ...form, locations: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Business Description
                </label>
                <textarea
                  rows={3}
                  value={form.description || ""}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
              <button
                type="submit"
                disabled={saving}
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                {saving ? "Saving Changes..." : "Save Profile"}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="text-xs border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-6 lg:col-span-2 space-y-6">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Entity Details
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">{org.name}</h2>
              <p className="text-sm text-slate-600 mt-2">{org.description}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <div>
                <span className="text-xs font-medium text-slate-500">Industry / Sector</span>
                <p className="text-sm font-semibold text-slate-800 mt-0.5">{org.sector}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-slate-500">Workforce Size</span>
                <p className="text-sm font-semibold text-slate-800 mt-0.5">{org.size_band}</p>
              </div>
              <div className="sm:col-span-2">
                <span className="text-xs font-medium text-slate-500">Operating Locations</span>
                <p className="text-sm font-semibold text-slate-800 mt-0.5">{org.locations}</p>
              </div>
            </div>
          </Card>

          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Functional Departments
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {org.departments?.map((dep: string) => (
                  <span
                    key={dep}
                    className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100"
                  >
                    {dep}
                  </span>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Primary Information Systems
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {org.systems?.map((sys: string) => (
                  <span
                    key={sys}
                    className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200"
                  >
                    {sys}
                  </span>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Identified Third-Party Processors
              </h3>
              <ul className="space-y-2">
                {org.processors?.map((proc: string) => (
                  <li key={proc} className="text-xs text-slate-700 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>{proc}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";
import React, { useState } from "react";
import { signIn } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

const DEMO_ACCOUNTS = [
  {
    email: "reviewer@bharatprecision.example",
    name: "Priya Sharma",
    label: "Compliance Reviewer",
    role: "Compliance / Legal Reviewer",
    desc: "Can review, accept, reject findings and create remediation actions",
  },
  {
    email: "admin@bharatprecision.example",
    name: "Rajesh Mehta",
    label: "Organisation Admin",
    role: "Organisation Admin",
    desc: "Can manage company profile, upload documents and reset demo data",
  },
  {
    email: "hr@bharatprecision.example",
    name: "Anita Desai",
    label: "Department User (HR)",
    role: "Department User",
    desc: "Can view assigned activities, update actions, view read-only findings",
  },
  {
    email: "tcc-admin@thecollectivecounsel.example",
    name: "TCC Platform Admin",
    label: "TCC Platform Admin",
    role: "TCC Platform Admin",
    desc: "Super-admin: regulatory knowledge base curation and demo reset",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("reviewer@bharatprecision.example");
  const [password, setPassword] = useState("Demo@2026!");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signIn.email({
        email,
        password,
        callbackURL: "/dashboard",
      });
      if (result?.error) {
        setError(result.error.message || "Invalid credentials");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please check connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAccount = (acc: (typeof DEMO_ACCOUNTS)[0]) => {
    setEmail(acc.email);
    setPassword("Demo@2026!");
    setError("");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white font-bold text-xl shadow-md mb-4">
          TCC
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          TCC Privacy Intelligence
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          DPDP Act 2023 Readiness & Regulatory Traceability Platform
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200/80 rounded-2xl sm:px-10">
          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@bharatprecision.example"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all cursor-pointer"
            >
              {loading ? "Authenticating..." : "Sign in to Workspace"}
            </button>
          </form>

          <div className="mt-8 border-t border-slate-100 pt-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                1-Click Evaluator Sign-In
              </span>
              <span className="text-[11px] text-slate-400">Password: Demo@2026!</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {DEMO_ACCOUNTS.map((acc) => {
                const isSelected = email === acc.email;
                return (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => handleSelectAccount(acc)}
                    className={`text-left p-3 rounded-xl border transition-all text-xs cursor-pointer ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/60 ring-1 ring-blue-600"
                        : "border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50"
                    }`}
                  >
                    <div className="font-semibold text-slate-900 leading-tight">
                      {acc.label}
                    </div>
                    <div className="text-[11px] text-blue-600 font-medium mt-0.5">
                      {acc.role}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                      {acc.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Grounded in DPDP Act 2023 & DPDP Rules 2025 · Fictional Manufacturing Demonstration
        </p>
      </div>
    </div>
  );
}

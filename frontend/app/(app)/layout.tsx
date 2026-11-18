import { NavBar } from "@/components/NavBar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <NavBar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">{children}</main>
      <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <span>
            TCC Privacy Intelligence — Operational DPDP Compliance Readiness (Bharat Precision Engineering Pvt. Ltd.)
          </span>
          <span className="text-[11px] text-slate-400">
            Source-Grounded Traceability · Not Statutory Certification
          </span>
        </div>
      </footer>
    </div>
  );
}

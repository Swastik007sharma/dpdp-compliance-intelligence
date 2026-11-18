"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "@/lib/auth-client";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview" },
  { href: "/profile", label: "Organisation Profile" },
  { href: "/inventory", label: "Data Inventory" },
  { href: "/documents", label: "Documents" },
  { href: "/regulatory", label: "Regulatory Mapping" },
  { href: "/findings", label: "Findings" },
  { href: "/actions", label: "Action Plan" },
  { href: "/settings", label: "Settings" },
];

export function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (e) {
      console.error("Sign out error", e);
    }
    router.push("/login");
  };

  const userRole = (session?.user as any)?.role || "User";

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                TCC
              </span>
              <div className="flex flex-col">
                <span className="text-slate-900 font-bold text-sm leading-tight tracking-tight">
                  TCC Privacy Intelligence
                </span>
                <span className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">
                  DPDP Framework
                </span>
              </div>
            </Link>

            <div className="hidden lg:flex items-center gap-1">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                      isActive
                        ? "bg-blue-50 text-blue-700 font-semibold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {session ? (
              <div className="flex items-center gap-2">
                <div className="flex flex-col text-right hidden sm:flex">
                  <span className="text-xs font-semibold text-slate-900 leading-tight">
                    {session.user.name || "Authenticated User"}
                  </span>
                  <span className="text-[11px] text-blue-600 font-medium">
                    {userRole}
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="text-xs text-slate-600 hover:text-red-600 border border-slate-200 hover:border-red-200 px-2.5 py-1.5 rounded-lg transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium px-3 py-1.5 rounded-lg transition-colors shadow-xs"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>

        {/* Mobile secondary nav row */}
        <div className="flex lg:hidden overflow-x-auto py-2 gap-1 border-t border-slate-100">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-2.5 py-1 text-xs whitespace-nowrap rounded-md ${
                pathname.startsWith(item.href)
                  ? "bg-blue-50 text-blue-700 font-semibold"
                  : "text-slate-600"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

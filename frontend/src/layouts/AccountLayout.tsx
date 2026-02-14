import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../store/auth";

function combineName(first: string, last: string): string {
  return [first, last].filter(Boolean).join(" ").trim();
}

export default function AccountLayout() {
  const { pathname } = useLocation();
  const user = useAuth((s) => s.user);

  const isActive = (path: string) => pathname === path;

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className="w-80 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hidden lg:flex flex-col">
          <Link to="/" className="p-6 flex items-center gap-3">
            <div className="size-10 bg-[#5211d4] rounded-lg flex items-center justify-center text-white">
              <span className="material-symbols-outlined">domain</span>
            </div>
            <div>
              <h1 className="text-lg font-bold leading-none">PropManage</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">{user?.role || ""} Portal</p>
            </div>
          </Link>

          <nav className="flex-1 px-4 py-4 space-y-1">
            <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 mb-2">Account Settings</div>

            <Link
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold transition-colors ${
                isActive("/account")
                  ? "bg-[#5211d4]/10 text-[#5211d4]"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
              to="/account"
            >
              <span className="material-symbols-outlined text-[22px]">person</span>
              <span className="text-sm">Profile Information</span>
            </Link>

            <Link
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold transition-colors ${
                isActive("/account/security")
                  ? "bg-[#5211d4]/10 text-[#5211d4]"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
              to="/account/security"
            >
              <span className="material-symbols-outlined text-[22px]">shield_lock</span>
              <span className="text-sm">Security</span>
            </Link>

            <Link
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold transition-colors ${
                isActive("/account/notifications")
                  ? "bg-[#5211d4]/10 text-[#5211d4]"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
              to="/account/notifications"
            >
              <span className="material-symbols-outlined text-[22px]">notifications</span>
              <span className="text-sm">Notifications</span>
            </Link>

            <Link
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold transition-colors ${
                isActive("/account/billing")
                  ? "bg-[#5211d4]/10 text-[#5211d4]"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
              to="/account/billing"
            >
              <span className="material-symbols-outlined text-[22px]">credit_card</span>
              <span className="text-sm">Billing</span>
            </Link>

            <div className="pt-8 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 mb-2">Support</div>
            <a
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              href="#"
              onClick={(e) => e.preventDefault()}
            >
              <span className="material-symbols-outlined text-[22px]">help</span>
              <span className="text-sm">Help Center</span>
            </a>
          </nav>

          <div className="p-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <div className="size-10 rounded-full bg-slate-300" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">
                  {user ? combineName(user.first_name || "", user.last_name || "") || user.username : ""}
                </p>
                <p className="text-xs text-slate-500 truncate">{user?.email || ""}</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

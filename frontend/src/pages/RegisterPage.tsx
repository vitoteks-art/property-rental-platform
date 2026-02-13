import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { roleHome } from "../routes/role";
import { useAuth } from "../store/auth";

function splitFullName(fullName: string): { first: string; last: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return { first: parts[0] || "", last: "" };
  return { first: parts.slice(0, -1).join(" "), last: parts.slice(-1).join(" ") };
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const register = useAuth((s) => s.register);

  // Week 1 decision: role defaults to TENANT (backend enforced)
  const [role, setRole] = useState<"tenant" | "landlord">("tenant");

  const [fullName, setFullName] = useState("");
  const name = useMemo(() => splitFullName(fullName), [fullName]);

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // Backend currently ignores role input and defaults to TENANT.
      await register({
        username,
        email,
        password,
        first_name: name.first,
        last_name: name.last,
      });
      const u = useAuth.getState().user;
      if (u) navigate(roleHome(u.role));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen">
      <div className="layout-container flex h-full grow flex-col">
        {/* Top Navigation */}
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-slate-800 px-6 lg:px-40 py-4 bg-white dark:bg-slate-900">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex items-center justify-center size-8 bg-primary rounded-lg text-white">
              <span className="material-symbols-outlined text-xl">domain</span>
            </div>
            <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight">PropTrack</h2>
          </Link>
          <div className="flex items-center gap-6">
            <span className="hidden md:block text-slate-500 dark:text-slate-400 text-sm font-medium">Already have an account?</span>
            <Link
              to="/login"
              className="flex min-w-[84px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-primary/10 hover:bg-primary/20 text-primary text-sm font-bold transition-colors"
            >
              Log In
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex flex-1 items-center justify-center p-6 md:p-12">
          <div className="w-full max-w-[560px] bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-8 md:p-12">
              <div className="text-center mb-10">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-3">Create your account</h1>
                <p className="text-slate-500 dark:text-slate-400">Join thousands of landlords and tenants managing property smarter.</p>
              </div>

              {error && <div className="mb-6 rounded-lg bg-red-50 text-red-700 p-3 text-sm">{error}</div>}

              <form className="space-y-8" onSubmit={onSubmit}>
                {/* Role Selection */}
                <div className="space-y-4">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">I am registering as a...</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Landlord Card (UI only for now) */}
                    <label className="relative cursor-not-allowed group opacity-60" title="Week 1: New accounts default to Tenant. Landlord role will be enabled later.">
                      <input
                        className="peer sr-only"
                        name="role"
                        type="radio"
                        value="landlord"
                        checked={role === "landlord"}
                        onChange={() => setRole("landlord")}
                        disabled
                      />
                      <div className="flex flex-col items-start p-5 rounded-xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 transition-all h-full">
                        <div className="mb-4 size-10 flex items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <span className="material-symbols-outlined">real_estate_agent</span>
                        </div>
                        <p className="font-bold text-slate-900 dark:text-white mb-1">Landlord</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Manage properties, track leases &amp; collect rent</p>
                      </div>
                    </label>

                    {/* Tenant Card */}
                    <label className="relative cursor-pointer group">
                      <input
                        className="peer sr-only"
                        name="role"
                        type="radio"
                        value="tenant"
                        checked={role === "tenant"}
                        onChange={() => setRole("tenant")}
                      />
                      <div className="flex flex-col items-start p-5 rounded-xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 hover:border-primary/50 peer-checked:border-primary peer-checked:bg-primary/5 transition-all h-full">
                        <div className="mb-4 size-10 flex items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                          <span className="material-symbols-outlined">home</span>
                        </div>
                        <p className="font-bold text-slate-900 dark:text-white mb-1">Tenant</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Pay rent, report issues &amp; view your lease</p>
                      </div>
                      <div className="absolute top-3 right-3 opacity-0 peer-checked:opacity-100 text-primary">
                        <span className="material-symbols-outlined text-lg">check_circle</span>
                      </div>
                    </label>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Week 1 note: New accounts default to <b>Tenant</b>. Landlord onboarding will be enabled later.
                  </p>
                </div>

                {/* Registration Inputs */}
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 ml-1" htmlFor="name">
                      Full Name
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">person</span>
                      <input
                        className="w-full pl-12 pr-4 py-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                        id="name"
                        placeholder="John Doe"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 ml-1" htmlFor="username">
                      Username
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">badge</span>
                      <input
                        className="w-full pl-12 pr-4 py-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                        id="username"
                        placeholder="yourname"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 ml-1" htmlFor="email">
                      Email Address
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">mail</span>
                      <input
                        className="w-full pl-12 pr-4 py-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                        id="email"
                        placeholder="name@company.com"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 ml-1" htmlFor="password">
                      Password
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">lock</span>
                      <input
                        className="w-full pl-12 pr-12 py-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                        id="password"
                        placeholder="••••••••"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                      <button
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                      >
                        <span className="material-symbols-outlined">{showPassword ? "visibility_off" : "visibility"}</span>
                      </button>
                    </div>

                    {/* Password Strength Meter (UI-only for now) */}
                    <div className="mt-3 space-y-2">
                      <div className="flex gap-1 h-1.5">
                        <div className="flex-1 bg-emerald-500 rounded-full" />
                        <div className="flex-1 bg-emerald-500 rounded-full" />
                        <div className="flex-1 bg-emerald-500 rounded-full" />
                        <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full" />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-500">Strong Password</span>
                        <span className="text-[10px] text-slate-400">Minimum 8 characters</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    className="w-full py-4 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold text-lg shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                    type="submit"
                    disabled={loading}
                  >
                    <span>{loading ? "Creating…" : "Create Account"}</span>
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </button>
                </div>

                {/* Footer Links */}
                <div className="text-center space-y-4">
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed px-4">
                    By signing up, you agree to our{" "}
                    <a className="text-primary hover:underline font-medium" href="#">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a className="text-primary hover:underline font-medium" href="#">
                      Privacy Policy
                    </a>
                    .
                  </p>
                </div>
              </form>
            </div>

            {/* Trust/Social Proof */}
            <div className="bg-slate-50 dark:bg-slate-800/80 px-8 py-6 border-t border-slate-200 dark:border-slate-800 flex flex-wrap justify-center gap-6 opacity-60 grayscale items-center">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">shield</span>
                <span className="text-xs font-bold uppercase tracking-widest">Secure Data</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">verified</span>
                <span className="text-xs font-bold uppercase tracking-widest">ISO Certified</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">cloud_done</span>
                <span className="text-xs font-bold uppercase tracking-widest">Cloud Backup</span>
              </div>
            </div>
          </div>
        </main>

        {/* Global Footer */}
        <footer className="py-8 px-6 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-500">© 2024 PropTrack SaaS Inc. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}

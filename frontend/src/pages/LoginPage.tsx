import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { roleHome } from "../routes/role";
import { useAuth } from "../store/auth";

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuth((s) => s.login);

  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // Backend Week 1 uses username+password. UI label says email, but we accept either.
      await login({ username: emailOrUsername.trim(), password });

      // Remember checkbox: auth state is persisted already; later we can use session-only storage.
      void remember;

      const u = useAuth.getState().user;
      if (u) navigate(roleHome(u.role));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid credentials");
    } finally {
      setLoading(false);
    }
  }

  const showError = Boolean(error);

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-display">
      {/* Top Navigation */}
      <header className="w-full px-6 lg:px-10 py-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-background-dark">
        <div className="flex items-center gap-2 text-primary">
          <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-xl">domain</span>
          </div>
          <h2 className="text-[#0d101b] dark:text-white text-lg font-bold leading-tight tracking-tight">PropManage</h2>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">Need help?</span>
          <button
            type="button"
            className="flex min-w-[84px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm font-semibold hover:bg-gray-200 transition-colors"
            onClick={() => alert("Support: coming soon")}
          >
            <span className="truncate">Contact Support</span>
          </button>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-[440px] bg-white dark:bg-gray-900 rounded-xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800 p-8">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-[#0d101b] dark:text-white text-3xl font-bold tracking-tight mb-2">Welcome Back</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Sign in to manage your properties and tenants.</p>
          </div>

          {/* Error Alert Box */}
          {showError && (
            <div className="mb-6 @container">
              <div className="flex flex-1 items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:bg-red-900/20 dark:border-red-800/50">
                <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-xl">error</span>
                <div className="flex flex-col gap-1">
                  <p className="text-red-800 dark:text-red-200 text-sm font-bold leading-tight">Invalid email or password</p>
                  <p className="text-red-700/80 dark:text-red-300/80 text-xs font-normal">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form className="space-y-5" onSubmit={onSubmit}>
            {/* Email Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[#0d101b] dark:text-gray-200 text-sm font-semibold" htmlFor="email">
                Email Address / Username
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 text-xl">mail</span>
                <input
                  className="flex w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 py-3 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary dark:text-white transition-all"
                  id="email"
                  placeholder="landlord@example.com"
                  type="text"
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[#0d101b] dark:text-gray-200 text-sm font-semibold" htmlFor="password">
                  Password
                </label>
                <a className="text-xs font-semibold text-primary hover:underline" href="#" onClick={(e) => e.preventDefault()}>
                  Forgot Password?
                </a>
              </div>

              <div className="relative">
                <span
                  className={`absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-xl ${
                    showError ? "text-red-500 dark:text-red-400" : "text-gray-400"
                  }`}
                >
                  lock
                </span>
                <input
                  className={`flex w-full rounded-lg bg-white dark:bg-gray-800 py-3 pl-10 pr-10 text-sm outline-none transition-all dark:text-white focus:ring-2 ${
                    showError
                      ? "border-2 border-red-500 focus:ring-red-500/20 focus:border-red-600"
                      : "border border-gray-300 dark:border-gray-700 focus:ring-primary/20 focus:border-primary"
                  }`}
                  id="password"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                >
                  <span className="material-symbols-outlined text-xl">{showPassword ? "visibility" : "visibility_off"}</span>
                </button>
              </div>

              {showError && (
                <p className="text-red-600 dark:text-red-400 text-[11px] font-medium mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">info</span>
                  Please check your password and try again.
                </p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2">
              <input
                className="size-4 rounded border-gray-300 text-primary focus:ring-primary dark:bg-gray-800 dark:border-gray-700"
                id="remember"
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <label className="text-sm text-gray-600 dark:text-gray-400 font-medium cursor-pointer" htmlFor="remember">
                Remember this device
              </label>
            </div>

            {/* Submit Button */}
            <button
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-lg shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-60"
              type="submit"
              disabled={loading}
            >
              <span>{loading ? "Signing in…" : "Sign In"}</span>
              <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Don&apos;t have an account?{" "}
              <Link className="text-primary font-bold hover:underline" to="/register">
                Start free trial
              </Link>
            </p>
          </div>
        </div>
      </main>

      <footer className="p-6 text-center">
        <p className="text-xs text-gray-400 dark:text-gray-600">
          © 2024 PropManage SaaS Inc. All rights reserved. Professional property management made simple.
        </p>
      </footer>
    </div>
  );
}

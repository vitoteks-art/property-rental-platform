import { useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../store/auth";

export default function AccountSecurityPage() {
  const access = useAuth((s) => s.access);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!access) {
      setError("You must be logged in.");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSaving(true);
    try {
      await api.changePassword(access, { current_password: currentPassword, new_password: newPassword });
      setSuccess("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 lg:px-12">
      <header className="mb-10">
        <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Security</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Update your password and secure your account.</p>
      </header>

      <div className="space-y-6">
        {error && <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 p-4">{error}</div>}
        {success && <div className="rounded-lg border border-green-200 bg-green-50 text-green-800 p-4">{success}</div>}

        <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Change password</h3>
          </div>
          <form className="p-6 space-y-5" onSubmit={changePassword}>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Current password</label>
              <input
                type="password"
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-[#5211d4] focus:border-[#5211d4] transition-all"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">New password</label>
                <input
                  type="password"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-[#5211d4] focus:border-[#5211d4] transition-all"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Confirm new password</label>
                <input
                  type="password"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-[#5211d4] focus:border-[#5211d4] transition-all"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-10 py-3 bg-[#5211d4] text-white font-bold rounded-lg shadow-lg shadow-[#5211d4]/20 hover:bg-[#5211d4]/90 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <span className="material-symbols-outlined text-[20px]">save</span>
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}

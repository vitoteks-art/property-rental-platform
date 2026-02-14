import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../store/auth";

function combineName(first: string, last: string): string {
  return [first, last].filter(Boolean).join(" ").trim();
}

function splitFullName(fullName: string): { first: string; last: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return { first: parts[0] || "", last: "" };
  return { first: parts.slice(0, -1).join(" "), last: parts.slice(-1).join(" ") };
}

export default function AccountProfilePage() {
  const access = useAuth((s) => s.access);
  const user = useAuth((s) => s.user);
  const setUser = useAuth((s) => s.setUser);

  const [fullName, setFullName] = useState("");
  const [phoneCountry, setPhoneCountry] = useState<"NG" | "US" | "GB" | "GH">("NG");
  const [phoneLocal, setPhoneLocal] = useState("");
  const [timezone, setTimezone] = useState("");
  const [bio, setBio] = useState("");

  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const email = user?.email || "";

  const phoneCountries = {
    NG: { flag: "🇳🇬", code: "+234", name: "Nigeria" },
    US: { flag: "🇺🇸", code: "+1", name: "United States" },
    GB: { flag: "🇬🇧", code: "+44", name: "United Kingdom" },
    GH: { flag: "🇬🇭", code: "+233", name: "Ghana" },
  } as const;

  function parsePhone(input: string): { country: keyof typeof phoneCountries; local: string } {
    const s = (input || "").trim();
    if (!s.startsWith("+")) return { country: "NG", local: s };
    const match = (Object.keys(phoneCountries) as Array<keyof typeof phoneCountries>).find((k) => s.startsWith(phoneCountries[k].code));
    if (!match) return { country: "NG", local: s };
    return { country: match, local: s.slice(phoneCountries[match].code.length).trim() };
  }

  function formatPhone(country: keyof typeof phoneCountries, local: string): string {
    const l = (local || "").trim();
    if (!l) return "";
    // naive join; we can improve formatting later
    return `${phoneCountries[country].code} ${l}`.trim();
  }

  useEffect(() => {
    if (!user) return;
    setFullName(combineName(user.first_name || "", user.last_name || ""));

    const parsed = parsePhone(user.phone || "");
    setPhoneCountry(parsed.country);
    setPhoneLocal(parsed.local);

    setTimezone(user.timezone || "");
    setBio(user.bio || "");
    setDirty(false);
  }, [user]);

  const current = useMemo(() => {
    const name = splitFullName(fullName);
    return {
      first_name: name.first,
      last_name: name.last,
      phone: formatPhone(phoneCountry, phoneLocal),
      timezone,
      bio,
    };
  }, [fullName, phoneCountry, phoneLocal, timezone, bio]);

  async function save() {
    if (!access) return;
    setError(null);
    setSaving(true);
    try {
      const updated = await api.updateMe(access, current);
      setUser(updated);
      setDirty(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  function discard() {
    if (!user) return;
    setFullName(combineName(user.first_name || "", user.last_name || ""));
    const parsed = parsePhone(user.phone || "");
    setPhoneCountry(parsed.country);
    setPhoneLocal(parsed.local);
    setTimezone(user.timezone || "");
    setBio(user.bio || "");
    setDirty(false);
    setError(null);
  }

  if (!user) {
    return <div className="p-6">Loading…</div>;
  }

  // UI/UX adapted from your HTML (Profile Information settings)
  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className="w-80 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hidden lg:flex flex-col">
          <div className="p-6 flex items-center gap-3">
            <div className="size-10 bg-[#5211d4] rounded-lg flex items-center justify-center text-white">
              <span className="material-symbols-outlined">domain</span>
            </div>
            <div>
              <h1 className="text-lg font-bold leading-none">PropManage</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">{user.role} Portal</p>
            </div>
          </div>

          <nav className="flex-1 px-4 py-4 space-y-1">
            <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 mb-2">Account Settings</div>
            <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#5211d4]/10 text-[#5211d4] font-semibold" href="#">
              <span className="material-symbols-outlined text-[22px]">person</span>
              <span className="text-sm">Profile Information</span>
            </a>
            <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" href="#">
              <span className="material-symbols-outlined text-[22px]">shield_lock</span>
              <span className="text-sm">Security</span>
            </a>
            <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" href="#">
              <span className="material-symbols-outlined text-[22px]">notifications</span>
              <span className="text-sm">Notifications</span>
            </a>
            <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" href="#">
              <span className="material-symbols-outlined text-[22px]">credit_card</span>
              <span className="text-sm">Billing</span>
            </a>

            <div className="pt-8 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 mb-2">Support</div>
            <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" href="#">
              <span className="material-symbols-outlined text-[22px]">help</span>
              <span className="text-sm">Help Center</span>
            </a>
          </nav>

          <div className="p-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <div className="size-10 rounded-full bg-slate-300" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{combineName(user.first_name || "", user.last_name || "") || user.username}</p>
                <p className="text-xs text-slate-500 truncate">{user.email || ""}</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark relative">
          <div className="max-w-4xl mx-auto px-6 py-10 lg:px-12">
            <header className="mb-10">
              <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Profile Information</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Update your personal details and professional bio used across the platform.</p>
            </header>

            <div className="space-y-8 pb-32">
              {error && <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 p-4">{error}</div>}

              {/* Avatar (UI only for now) */}
              <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row items-center gap-8">
                  <div className="relative group">
                    <div className="size-32 rounded-full border-4 border-white dark:border-slate-800 shadow-lg overflow-hidden bg-slate-100" />
                    <button
                      type="button"
                      className="absolute bottom-0 right-0 bg-[#5211d4] text-white p-2 rounded-full shadow-lg hover:scale-105 transition-transform"
                      onClick={() => alert("Avatar upload: coming soon")}
                    >
                      <span className="material-symbols-outlined text-sm block">photo_camera</span>
                    </button>
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Profile Photo</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Recommended: Square JPG or PNG, at least 400x400px.</p>
                    <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-4">
                      <button
                        type="button"
                        className="px-4 py-2 bg-[#5211d4]/10 text-[#5211d4] text-sm font-semibold rounded-lg hover:bg-[#5211d4]/20 transition-colors"
                        onClick={() => alert("Upload: coming soon")}
                      >
                        Upload New
                      </button>
                      <button
                        type="button"
                        className="px-4 py-2 text-slate-600 dark:text-slate-400 text-sm font-semibold hover:text-red-500 transition-colors"
                        onClick={() => alert("Remove: coming soon")}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* Personal details */}
              <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Personal Details</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Full Name</label>
                      <input
                        className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-[#5211d4] focus:border-[#5211d4] transition-all"
                        type="text"
                        value={fullName}
                        onChange={(e) => {
                          setFullName(e.target.value);
                          setDirty(true);
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
                      <div className="relative">
                        <input
                          className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 cursor-not-allowed"
                          type="email"
                          value={email}
                          disabled
                        />
                        <div className="absolute inset-y-0 right-3 flex items-center text-green-500">
                          <span className="material-symbols-outlined text-[20px]">check_circle</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">Contact support to change your primary email.</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Phone Number</label>
                      <div className="flex">
                        <select
                          className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-medium focus:ring-2 focus:ring-[#5211d4] focus:border-[#5211d4]"
                          value={phoneCountry}
                          onChange={(e) => {
                            setPhoneCountry(e.target.value as "NG" | "US" | "GB" | "GH");
                            setDirty(true);
                          }}
                          aria-label="Phone country"
                        >
                          {(Object.keys(phoneCountries) as Array<keyof typeof phoneCountries>).map((k) => (
                            <option key={k} value={k}>
                              {phoneCountries[k].flag} {phoneCountries[k].code}
                            </option>
                          ))}
                        </select>
                        <input
                          className="w-full px-4 py-3 rounded-r-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-[#5211d4] focus:border-[#5211d4] transition-all"
                          type="tel"
                          placeholder="Phone number"
                          value={phoneLocal}
                          onChange={(e) => {
                            setPhoneLocal(e.target.value);
                            setDirty(true);
                          }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Timezone</label>
                      <select
                        className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-[#5211d4] focus:border-[#5211d4] transition-all"
                        value={timezone}
                        onChange={(e) => {
                          setTimezone(e.target.value);
                          setDirty(true);
                        }}
                      >
                        <option value="">Select timezone</option>
                        <option value="Africa/Lagos">Africa/Lagos</option>
                        <option value="UTC">UTC</option>
                        <option value="Europe/London">Europe/London</option>
                        <option value="America/New_York">America/New_York</option>
                      </select>
                    </div>
                  </div>
                </div>
              </section>

              {/* Bio */}
              <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Professional Bio</h3>
                  <span className="text-xs text-slate-400 font-medium">{(bio || "").length} / 500 characters</span>
                </div>
                <div className="p-6 space-y-4">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    This information will be visible to your tenants and other administrators in the platform network.
                  </p>
                  <textarea
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-[#5211d4] focus:border-[#5211d4] transition-all resize-none"
                    placeholder="Write a short bio about your property management experience..."
                    rows={5}
                    value={bio}
                    onChange={(e) => {
                      setBio(e.target.value);
                      setDirty(true);
                    }}
                  />
                </div>
              </section>
            </div>
          </div>

          {/* Sticky save bar */}
          {dirty && (
            <div className="absolute bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-6 z-10">
              <div className="max-w-4xl mx-auto flex items-center justify-between">
                <p className="text-sm text-slate-500 hidden sm:block">You have unsaved changes in your profile.</p>
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <button
                    type="button"
                    className="flex-1 sm:flex-none px-6 py-3 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    onClick={discard}
                    disabled={saving}
                  >
                    Discard
                  </button>
                  <button
                    type="button"
                    className="flex-1 sm:flex-none px-10 py-3 bg-[#5211d4] text-white font-bold rounded-lg shadow-lg shadow-[#5211d4]/20 hover:bg-[#5211d4]/90 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                    onClick={save}
                    disabled={saving}
                  >
                    <span className="material-symbols-outlined text-[20px]">save</span>
                    {saving ? "Saving…" : "Save Changes"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

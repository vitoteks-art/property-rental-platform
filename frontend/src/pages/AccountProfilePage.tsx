import { useEffect, useMemo, useState } from "react";
import { getCountries, getCountryCallingCode } from "libphonenumber-js";
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
  const [phoneCountry, setPhoneCountry] = useState<string>("NG");
  const [phoneLocal, setPhoneLocal] = useState("");
  const [countryPickerOpen, setCountryPickerOpen] = useState(false);
  const [countryQuery, setCountryQuery] = useState("");
  const [timezone, setTimezone] = useState("");
  const [bio, setBio] = useState("");

  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const email = user?.email || "";

  const regionNames = useMemo(() => {
    try {
      return new Intl.DisplayNames(["en"], { type: "region" });
    } catch {
      return null;
    }
  }, []);

  function flagEmoji(iso2: string): string {
    // Convert ISO2 -> regional indicator symbols
    if (!iso2 || iso2.length !== 2) return "🏳️";
    const A = 0x1f1e6;
    const a = "A".charCodeAt(0);
    const chars = iso2.toUpperCase().split("");
    return String.fromCodePoint(A + (chars[0].charCodeAt(0) - a), A + (chars[1].charCodeAt(0) - a));
  }

  const allCountries = useMemo(() => {
    return getCountries().map((iso2) => {
      const name = regionNames?.of(iso2) || iso2;
      const calling = `+${getCountryCallingCode(iso2 as Parameters<typeof getCountryCallingCode>[0])}`;
      return { iso2, name, calling, flag: flagEmoji(iso2) };
    });
  }, [regionNames]);

  const filteredCountries = useMemo(() => {
    const q = countryQuery.trim().toLowerCase();
    if (!q) return allCountries;
    return allCountries.filter((c) => {
      return (
        c.name.toLowerCase().includes(q) ||
        c.iso2.toLowerCase().includes(q) ||
        c.calling.replace("+", "").includes(q.replace("+", ""))
      );
    });
  }, [allCountries, countryQuery]);

  const parsePhone = useMemo(() => {
    return (input: string): { country: string; local: string } => {
      const s = (input || "").trim();
      if (!s.startsWith("+")) return { country: "NG", local: s };

      // Try to match by calling code (longest first)
      const matches = allCountries
        .filter((c) => s.startsWith(c.calling))
        .sort((a, b) => b.calling.length - a.calling.length);

      if (matches.length === 0) return { country: "NG", local: s };
      const m = matches[0];
      return { country: m.iso2, local: s.slice(m.calling.length).trim() };
    };
  }, [allCountries]);

  const formatPhone = useMemo(() => {
    return (countryIso2: string, local: string): string => {
      const l = (local || "").trim();
      if (!l) return "";
      const iso2 = (countryIso2 || "NG").toUpperCase();
      const calling = `+${getCountryCallingCode(iso2 as Parameters<typeof getCountryCallingCode>[0])}`;
      return `${calling} ${l}`.trim();
    };
  }, []);

  const selectedCountry = useMemo(() => {
    const iso2 = (phoneCountry || "NG").toUpperCase();
    return allCountries.find((c) => c.iso2 === iso2) || allCountries.find((c) => c.iso2 === "NG");
  }, [allCountries, phoneCountry]);

  useEffect(() => {
    if (!user) return;
    setFullName(combineName(user.first_name || "", user.last_name || ""));

    const parsed = parsePhone(user.phone || "");
    setPhoneCountry(parsed.country);
    setPhoneLocal(parsed.local);

    setTimezone(user.timezone || "");
    setBio(user.bio || "");
    setDirty(false);
  }, [user, parsePhone]);

  const current = useMemo(() => {
    const name = splitFullName(fullName);
    return {
      first_name: name.first,
      last_name: name.last,
      phone: formatPhone(phoneCountry, phoneLocal),
      timezone,
      bio,
    };
  }, [fullName, phoneCountry, phoneLocal, timezone, bio, formatPhone]);

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

  // Content only — sidebar is provided by AccountLayout
  return (
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
                        <button
                          type="button"
                          className="inline-flex items-center gap-2 px-3 rounded-l-lg border border-r-0 border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-700"
                          onClick={() => setCountryPickerOpen(true)}
                          aria-label="Choose phone country"
                        >
                          <span>{selectedCountry?.flag}</span>
                          <span>{selectedCountry?.calling}</span>
                          <span className="material-symbols-outlined text-[18px] opacity-70">expand_more</span>
                        </button>
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

                        {/* Country picker modal */}
                        {countryPickerOpen && (
                          <div
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
                            role="dialog"
                            aria-modal="true"
                            onClick={() => setCountryPickerOpen(false)}
                          >
                            <div
                              className="w-full max-w-xl rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                                <div>
                                  <h4 className="font-bold">Select country</h4>
                                  <p className="text-xs text-slate-500">Search by name, code, or calling code</p>
                                </div>
                                <button
                                  type="button"
                                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                                  onClick={() => setCountryPickerOpen(false)}
                                >
                                  <span className="material-symbols-outlined">close</span>
                                </button>
                              </div>

                              <div className="p-4">
                                <input
                                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 outline-none focus:ring-2 focus:ring-[#5211d4]/30"
                                  placeholder="Search…"
                                  value={countryQuery}
                                  onChange={(e) => setCountryQuery(e.target.value)}
                                  autoFocus
                                />

                                <div className="mt-4 max-h-[420px] overflow-auto divide-y divide-slate-100 dark:divide-slate-800">
                                  {filteredCountries.slice(0, 300).map((c) => (
                                    <button
                                      key={c.iso2}
                                      type="button"
                                      className="w-full flex items-center justify-between px-3 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 text-left"
                                      onClick={() => {
                                        setPhoneCountry(c.iso2);
                                        setCountryPickerOpen(false);
                                        setDirty(true);
                                      }}
                                    >
                                      <div className="flex items-center gap-3">
                                        <span className="text-lg">{c.flag}</span>
                                        <div className="flex flex-col">
                                          <span className="text-sm font-semibold">{c.name}</span>
                                          <span className="text-xs text-slate-500">{c.iso2}</span>
                                        </div>
                                      </div>
                                      <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{c.calling}</span>
                                    </button>
                                  ))}

                                  {filteredCountries.length === 0 && (
                                    <div className="p-6 text-sm text-slate-500">No results.</div>
                                  )}
                                </div>

                                <p className="mt-3 text-[11px] text-slate-400">
                                  Showing {Math.min(filteredCountries.length, 300)} results (search to narrow down).
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
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

      {/* Sticky save bar */}
      {dirty && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-6 z-10">
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
    </div>
  );
}

/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Bell, Lock, Save, User, Wallet, Camera, MapPin, Phone,
  MessageCircle, Mail, Briefcase, Shield, ChevronRight,
  Check, Eye, EyeOff, AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { PayoutAccountsSection } from "@/components/organizer/payout-accounts-section";
import { useAuth } from "@/hooks/use-auth";
import {
  defaultProfile, getOrganizerProfile, saveOrganizerProfile,
  type OrganizerProfile,
} from "@/lib/organizer-profile";

/* ── Types ───────────────────────────────────────────────────────── */
type Tab = "profile" | "payouts" | "account" | "notifications";

/* ── Helpers ─────────────────────────────────────────────────────── */
function initials(name: string) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

/* ── Toggle switch ───────────────────────────────────────────────── */
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={e => { e.stopPropagation(); onChange(!checked); }}
      className="relative inline-flex h-[26px] w-[46px] shrink-0 cursor-pointer items-center rounded-full border transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
      style={{
        background: checked ? "linear-gradient(135deg,#6b3f1d,#c4864c)" : "rgba(107,63,29,0.12)",
        borderColor: checked ? "transparent" : "rgba(107,63,29,0.2)",
        outlineColor: "var(--primary)",
      }}
    >
      <span
        className="inline-block h-[20px] w-[20px] rounded-full transition-transform duration-200"
        style={{
          background: "#ffffff",
          transform: checked ? "translateX(22px)" : "translateX(3px)",
          boxShadow: "0 1px 3px rgba(107,63,29,0.25)",
        }}
      />
    </button>
  );
}

/* ── Field wrapper ───────────────────────────────────────────────── */
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p className="text-[12px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
        {label}
      </p>
      {children}
      {hint && <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>{hint}</p>}
    </div>
  );
}

function TextInput({ id, value, onChange, placeholder, readOnly, type = "text" }: {
  id?: string; value: string; onChange?: (v: string) => void;
  placeholder?: string; readOnly?: boolean; type?: string;
}) {
  return (
    <input
      id={id} type={type} value={value} readOnly={readOnly} placeholder={placeholder}
      onChange={e => onChange?.(e.target.value)}
      className="w-full h-10 rounded-[10px] border px-3 text-[13px] outline-none transition-all"
      style={{
        borderColor: "var(--border-strong)",
        background: readOnly ? "var(--bg-secondary)" : "var(--surface)",
        color: readOnly ? "var(--text-tertiary)" : "var(--text)",
      }}
      onFocus={e => !readOnly && (e.currentTarget.style.borderColor = "var(--primary)")}
      onBlur={e => (e.currentTarget.style.borderColor = "var(--border-strong)")}
    />
  );
}

function TextareaInput({ value, onChange, placeholder, rows = 4 }: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <textarea
      value={value} rows={rows} placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
      className="w-full rounded-[10px] border px-3 py-2.5 text-[13px] outline-none transition-all resize-none"
      style={{ borderColor: "var(--border-strong)", background: "var(--surface)", color: "var(--text)" }}
      onFocus={e => (e.currentTarget.style.borderColor = "var(--primary)")}
      onBlur={e => (e.currentTarget.style.borderColor = "var(--border-strong)")}
    />
  );
}

function IconInput({ icon: Icon, value, onChange, placeholder, type = "text", readOnly }: {
  icon: React.ElementType; value: string; onChange?: (v: string) => void;
  placeholder?: string; type?: string; readOnly?: boolean;
}) {
  return (
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none" style={{ color: "var(--text-tertiary)" }} />
      <input
        type={type} value={value} readOnly={readOnly} placeholder={placeholder}
        onChange={e => onChange?.(e.target.value)}
        className="w-full h-10 rounded-[10px] border pl-9 pr-3 text-[13px] outline-none transition-all"
        style={{
          borderColor: "var(--border-strong)",
          background: readOnly ? "var(--bg-secondary)" : "var(--surface)",
          color: readOnly ? "var(--text-tertiary)" : "var(--text)",
        }}
        onFocus={e => !readOnly && (e.currentTarget.style.borderColor = "var(--primary)")}
        onBlur={e => (e.currentTarget.style.borderColor = "var(--border-strong)")}
      />
    </div>
  );
}

function PasswordInput({ id, value, onChange, autoComplete }: {
  id?: string; value: string; onChange: (v: string) => void; autoComplete?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        id={id} type={show ? "text" : "password"} value={value} autoComplete={autoComplete}
        onChange={e => onChange(e.target.value)}
        className="w-full h-10 rounded-[10px] border px-3 pr-10 text-[13px] outline-none transition-all"
        style={{ borderColor: "var(--border-strong)", background: "var(--surface)", color: "var(--text)" }}
        onFocus={e => (e.currentTarget.style.borderColor = "var(--primary)")}
        onBlur={e => (e.currentTarget.style.borderColor = "var(--border-strong)")}
      />
      <button type="button" onClick={() => setShow(s => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }}>
        {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}

function SaveButton({ onClick, label = "Save changes" }: { onClick: () => void; label?: string }) {
  const [saved, setSaved] = useState(false);
  function handle() { onClick(); setSaved(true); setTimeout(() => setSaved(false), 2000); }
  return (
    <button type="button" onClick={handle}
      className="inline-flex items-center gap-2 rounded-[10px] px-5 py-2.5 text-[13px] font-semibold transition-all"
      style={{ background: saved ? "#2e7d52" : "var(--primary)", color: "#fbf7f1" }}>
      {saved ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
      {saved ? "Saved!" : label}
    </button>
  );
}

function Divider() {
  return <div className="border-t" style={{ borderColor: "var(--border)" }} />;
}

/* ── Section wrapper ─────────────────────────────────────────────── */
function Section({ title, desc, icon: Icon, children }: {
  title: string; desc: string; icon: React.ElementType; children: React.ReactNode;
}) {
  return (
    <div className="rounded-[16px] border overflow-hidden" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
      <div className="px-6 py-5 border-b flex items-start gap-3"
        style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] mt-0.5"
          style={{ background: "var(--primary-dim)" }}>
          <Icon className="h-4 w-4" style={{ color: "var(--primary)" }} />
        </div>
        <div>
          <h2 className="text-[14px] font-bold" style={{ color: "var(--text)" }}>{title}</h2>
          <p className="text-[12px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>{desc}</p>
        </div>
      </div>
      <div className="px-6 py-6 space-y-5">{children}</div>
    </div>
  );
}

/* ── Sidebar ─────────────────────────────────────────────────────── */
const NAV_ITEMS: { value: Tab; label: string; desc: string; icon: React.ElementType }[] = [
  { value: "profile",       label: "Profile",       desc: "Public info & photo",   icon: User   },
  { value: "payouts",       label: "Payouts",       desc: "Mobile money accounts", icon: Wallet },
  { value: "account",       label: "Account",       desc: "Password & security",   icon: Lock   },
  { value: "notifications", label: "Notifications", desc: "Email preferences",     icon: Bell   },
];

function SidebarNav({ active, onChange, userName, userEmail, completionPct, profilePicture }: {
  active: Tab; onChange: (t: Tab) => void;
  userName: string; userEmail: string; completionPct: number; profilePicture: string | null;
}) {
  return (
    <aside className="w-full lg:w-[220px] shrink-0 flex flex-col gap-2">
      <div className="rounded-[16px] border p-4 mb-2 flex flex-col items-center text-center"
        style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
        <div className="h-16 w-16 rounded-full overflow-hidden flex items-center justify-center text-xl font-bold mb-3"
          style={{ background: "linear-gradient(135deg,#6b3f1d,#c4864c)", color: "#fbf7f1" }}>
          {profilePicture ? (
            <img src={profilePicture} alt="Profile" className="h-full w-full object-cover" />
          ) : (
            initials(userName || "Organizer")
          )}
        </div>
        <p className="text-[13px] font-bold tracking-tight" style={{ color: "var(--text)" }}>
          {userName || "Organizer"}
        </p>
        <p className="text-[11px] mt-0.5 truncate max-w-full" style={{ color: "var(--text-tertiary)" }}>
          {userEmail}
        </p>
        <div className="w-full mt-4">
          <div className="flex justify-between text-[10px] mb-1" style={{ color: "var(--text-tertiary)" }}>
            <span>Profile complete</span>
            <span className="font-semibold" style={{ color: "var(--primary)" }}>{completionPct}%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-secondary)" }}>
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${completionPct}%`, background: "linear-gradient(90deg,#6b3f1d,#c4864c)" }} />
          </div>
        </div>
      </div>

      {NAV_ITEMS.map(item => {
        const isActive = active === item.value;
        return (
          <button key={item.value} type="button" onClick={() => onChange(item.value)}
            className="flex items-center gap-3 px-3 py-3 rounded-[12px] text-left transition-all w-full"
            style={{
              background: isActive ? "var(--primary-dim)" : "transparent",
              border: isActive ? "1px solid rgba(107,63,29,0.18)" : "1px solid transparent",
            }}>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px]"
              style={{ background: isActive ? "var(--primary)" : "var(--bg-secondary)" }}>
              <item.icon className="h-4 w-4" style={{ color: isActive ? "#fbf7f1" : "var(--text-tertiary)" }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold" style={{ color: isActive ? "var(--primary)" : "var(--text)" }}>
                {item.label}
              </p>
              <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>{item.desc}</p>
            </div>
            {isActive && <ChevronRight className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--primary)" }} />}
          </button>
        );
      })}
    </aside>
  );
}

/* ── Profile tab ─────────────────────────────────────────────────── */
function ProfileTab({ profile, setProfile, name, setName, email, onSave }: {
  profile: OrganizerProfile;
  setProfile: React.Dispatch<React.SetStateAction<OrganizerProfile>>;
  name: string; setName: (v: string) => void;
  email: string; onSave: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  function up<K extends keyof OrganizerProfile>(key: K, value: OrganizerProfile[K]) {
    setProfile(prev => ({ ...prev, [key]: value }));
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError("");

    if (!file.type.startsWith("image/")) {
      setUploadError("Please choose a JPG or PNG image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image must be under 5 MB.");
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      up("profilePicture", reader.result as string);
      setUploading(false);
    };
    reader.onerror = () => {
      setUploadError("Couldn't read that file. Try again.");
      setUploading(false);
    };
    reader.readAsDataURL(file);

    // Allow re-selecting the same file later
    e.target.value = "";
  }

  function handleRemovePhoto() {
    up("profilePicture", "");
    setUploadError("");
  }

  return (
    <div className="space-y-4">
      <Section title="Public profile" desc="Shown on your trip listings and organizer page." icon={User}>
        <div className="flex items-center gap-4">
          {/* Avatar preview — shows uploaded photo or initials fallback */}
          <div
            className="relative h-16 w-16 shrink-0 rounded-full overflow-hidden flex items-center justify-center text-xl font-bold"
            style={{ background: "linear-gradient(135deg,#6b3f1d,#c4864c)", color: "#fbf7f1" }}
          >
            {profile.profilePicture ? (
              <img
                src={profile.profilePicture}
                alt="Profile"
                className="h-full w-full object-cover"
              />
            ) : (
              initials(name || "Organizer")
            )}
            {uploading && (
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ background: "rgba(42,27,15,0.45)" }}
              >
                <div
                  className="h-4 w-4 rounded-full border-2 border-white/40 animate-spin"
                  style={{ borderTopColor: "#fff" }}
                />
              </div>
            )}
          </div>

          <div>
            <p className="text-[13px] font-semibold" style={{ color: "var(--text)" }}>Profile photo</p>
            <p className="text-[11px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>JPG or PNG, max 5 MB</p>

            <div className="flex items-center gap-2 mt-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-1.5 text-[12px] font-semibold rounded-lg px-3 py-1.5 border transition-colors disabled:opacity-60"
                style={{ borderColor: "var(--border-strong)", color: "var(--text-secondary)", background: "var(--bg-secondary)" }}
                onMouseEnter={e => !uploading && (e.currentTarget.style.background = "var(--border)")}
                onMouseLeave={e => (e.currentTarget.style.background = "var(--bg-secondary)")}
              >
                <Camera className="h-3 w-3" />
                {profile.profilePicture ? "Change photo" : "Upload photo"}
              </button>

              {profile.profilePicture && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="text-[12px] font-semibold rounded-lg px-2.5 py-1.5 transition-colors"
                  style={{ color: "var(--coral)" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(181,82,58,0.08)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  Remove
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              onChange={handleFileSelect}
              className="hidden"
            />

            {uploadError && (
              <p className="text-[11px] mt-1.5 flex items-center gap-1" style={{ color: "var(--coral)" }}>
                <AlertCircle className="h-3 w-3" /> {uploadError}
              </p>
            )}
          </div>
        </div>

        <Divider />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name">
            <TextInput value={name} onChange={setName} placeholder="Your name" />
          </Field>
          <Field label="Business or brand name">
            <TextInput value={profile.businessName} onChange={v => up("businessName", v)}
              placeholder="e.g. WanderGhana Tours" />
          </Field>
        </div>

        <Field label="Location">
          <IconInput icon={MapPin} value={profile.location}
            onChange={v => up("location", v)} placeholder="City, Country" />
        </Field>

        <Field label="About you" hint="Tell travelers what makes your trips unique.">
          <TextareaInput value={profile.bio} onChange={v => up("bio", v)}
            placeholder="Describe your experience, passion, and style…" rows={4} />
        </Field>

        <Field label="Trip specialties">
          <TextInput value={profile.specialties} onChange={v => up("specialties", v)}
            placeholder="e.g. Adventure, Cultural tours, Eco travel" />
        </Field>
      </Section>

      <Section title="Contact details" desc="How travelers and our team can reach you." icon={Phone}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Phone number">
            <IconInput icon={Phone} value={profile.phone}
              onChange={v => up("phone", v)} type="tel" placeholder="+233 00 000 0000" />
          </Field>
          <Field label="WhatsApp">
            <IconInput icon={MessageCircle} value={profile.whatsapp}
              onChange={v => up("whatsapp", v)} type="tel" placeholder="+233 00 000 0000" />
          </Field>
        </div>

        <Field label="Email address" hint="Contact support to change your login email.">
          <IconInput icon={Mail} value={email} readOnly />
        </Field>

        <div className="flex justify-end pt-2">
          <SaveButton onClick={onSave} label="Save profile" />
        </div>
      </Section>
    </div>
  );
}

/* ── Account tab ─────────────────────────────────────────────────── */
function AccountTab() {
  const [current, setCurrent] = useState("");
  const [next, setNext]       = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError]     = useState("");

  const strength = next.length === 0 ? 0 : next.length < 6 ? 1 : next.length < 10 ? 2 : 3;
  const strengthLabel = ["", "Weak", "Good", "Strong"][strength];
  const strengthColor = ["", "#b5523a", "#d08a3c", "#2e7d52"][strength];

  function handleSave() {
    setError("");
    if (!current) { setError("Enter your current password."); return; }
    if (next.length < 8) { setError("New password must be at least 8 characters."); return; }
    if (next !== confirm) { setError("Passwords don't match."); return; }
    setCurrent(""); setNext(""); setConfirm("");
    toast.success("Password updated");
  }

  return (
    <div className="space-y-4">
      <Section title="Change password" desc="Use a strong, unique password to protect your account." icon={Lock}>
        <div className="max-w-md space-y-4">
          <Field label="Current password">
            <PasswordInput value={current} onChange={setCurrent} autoComplete="current-password" />
          </Field>

          <Field label="New password">
            <PasswordInput value={next} onChange={setNext} autoComplete="new-password" />
            {next.length > 0 && (
              <div className="mt-2 space-y-1">
                <div className="h-1 rounded-full overflow-hidden flex gap-1">
                  {[1, 2, 3].map(n => (
                    <div key={n} className="flex-1 rounded-full transition-all duration-300"
                      style={{ background: n <= strength ? strengthColor : "var(--bg-secondary)" }} />
                  ))}
                </div>
                <p className="text-[11px] font-medium" style={{ color: strengthColor }}>{strengthLabel}</p>
              </div>
            )}
          </Field>

          <Field label="Confirm new password">
            <PasswordInput value={confirm} onChange={setConfirm} autoComplete="new-password" />
            {confirm.length > 0 && next !== confirm && (
              <p className="text-[11px] mt-1 flex items-center gap-1" style={{ color: "var(--coral)" }}>
                <AlertCircle className="h-3 w-3" /> Passwords don&apos;t match
              </p>
            )}
          </Field>

          {error && (
            <div className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-[12px]"
              style={{ background: "rgba(181,82,58,0.08)", color: "var(--coral)", border: "1px solid rgba(181,82,58,0.2)" }}>
              <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {error}
            </div>
          )}

          <div className="flex justify-end pt-1">
            <SaveButton onClick={handleSave} label="Update password" />
          </div>
        </div>
      </Section>

      <Section title="Account security" desc="Keep your account safe." icon={Shield}>
        <div className="space-y-3">
          {[
            { label: "Two-factor authentication", desc: "Add a second layer of protection to your sign-in." },
            { label: "Active sessions",           desc: "View and revoke devices signed in to your account." },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between gap-4 rounded-[12px] border p-4"
              style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}>
              <div>
                <p className="text-[13px] font-semibold" style={{ color: "var(--text)" }}>{item.label}</p>
                <p className="text-[11px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>{item.desc}</p>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full"
                style={{ background: "var(--primary-dim)", color: "var(--primary)" }}>
                Coming soon
              </span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

/* ── Notifications tab ───────────────────────────────────────────── */
function NotificationsTab({ profile, setProfile, email, onSave }: {
  profile: OrganizerProfile;
  setProfile: React.Dispatch<React.SetStateAction<OrganizerProfile>>;
  email: string; onSave: () => void;
}) {
  function upNotif(key: keyof OrganizerProfile["notifications"], val: boolean) {
    setProfile(prev => ({ ...prev, notifications: { ...prev.notifications, [key]: val } }));
  }

  const notifs: { key: keyof OrganizerProfile["notifications"]; label: string; desc: string; icon: React.ElementType }[] = [
    { key: "bookingAlerts", label: "Booking alerts", desc: "New bookings, cancellations, and payment updates.", icon: Briefcase },
    { key: "payoutAlerts",  label: "Payout alerts",  desc: "Withdrawal confirmations and payout summaries.",   icon: Wallet   },
  ];

  return (
    <div className="space-y-4">
      <Section title="Email notifications" desc={`Sent to ${email || "your email address"}.`} icon={Bell}>
        <div className="space-y-3">
          {notifs.map(n => {
            const checked = profile.notifications[n.key];
            return (
              <div key={n.key}
                className="flex items-center justify-between gap-4 rounded-[14px] border p-4 transition-all"
                style={{
                  borderColor: checked ? "rgba(107,63,29,0.2)" : "var(--border)",
                  background: checked ? "var(--primary-dim)" : "var(--bg-secondary)",
                }}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 items-center justify-center rounded-[9px] shrink-0"
                    style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                    <n.icon className="h-4 w-4" style={{ color: "var(--text-tertiary)" }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold" style={{ color: "var(--text)" }}>{n.label}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>{n.desc}</p>
                  </div>
                </div>
                <Toggle checked={checked} onChange={v => upNotif(n.key, v)} />
              </div>
            );
          })}
        </div>

        <div className="flex justify-end pt-2">
          <SaveButton onClick={onSave} label="Save preferences" />
        </div>
      </Section>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────── */
export default function OrganizerSettingsPage() {
  const { user, login } = useAuth();
  const searchParams    = useSearchParams();

  const tabFromUrl = searchParams.get("tab") as Tab | null;
  const validTabs: Tab[] = ["profile", "payouts", "account", "notifications"];
  const [activeTab, setActiveTab] = useState<Tab>(
    tabFromUrl && validTabs.includes(tabFromUrl) ? tabFromUrl : "profile"
  );

  const [profile, setProfile] = useState<OrganizerProfile>(defaultProfile);
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");

  useEffect(() => {
    setProfile(getOrganizerProfile());
    if (user) { setName(user.name); setEmail(user.email); }
  }, [user]);

  const completionPct = Math.round(
    [name, profile.businessName, profile.location, profile.bio, profile.specialties, profile.phone, profile.profilePicture]
      .filter(Boolean).length / 7 * 100
  );

  function handleSaveProfile() {
    saveOrganizerProfile(profile);
    if (user) login({ ...user, name: name.trim() || user.name });
    toast.success("Profile saved");
  }

  function handleSaveNotifications() {
    saveOrganizerProfile(profile);
    toast.success("Notification preferences saved");
  }

  return (
    <div className="w-full min-h-screen px-4 py-8 sm:px-6 lg:px-10 lg:py-10" style={{ background: "var(--bg)" }}>
      <div className="mb-8 border-b pb-6" style={{ borderColor: "var(--border)" }}>
        <h1 className="font-display text-2xl font-bold tracking-tight" style={{ color: "var(--text)" }}>
          Settings
        </h1>
        <p className="mt-1 text-[13px]" style={{ color: "var(--text-secondary)" }}>
          Manage your profile, payout accounts, and notifications.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <SidebarNav
          active={activeTab} onChange={setActiveTab}
          userName={name} userEmail={email} completionPct={completionPct}
          profilePicture={profile.profilePicture}
        />

        <div className="flex-1 min-w-0">
          {activeTab === "profile" && (
            <ProfileTab
              profile={profile} setProfile={setProfile}
              name={name} setName={setName} email={email} onSave={handleSaveProfile}
            />
          )}
          {activeTab === "payouts" && (
            <Section title="Payout accounts" desc="Mobile money accounts used for withdrawals." icon={Wallet}>
              <PayoutAccountsSection />
            </Section>
          )}
          {activeTab === "account" && <AccountTab />}
          {activeTab === "notifications" && (
            <NotificationsTab
              profile={profile} setProfile={setProfile}
              email={email} onSave={handleSaveNotifications}
            />
          )}
        </div>
      </div>
    </div>
  );
}
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  Camera,
  Check,
  Eye,
  EyeOff,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { PayoutAccountsSection } from "@/components/organizer/payout-accounts-section";
import { OrganizerPortalTabs } from "@/components/organizer/portal-tabs";
import { useAuth } from "@/hooks/use-auth";
import { ApiError } from "@/lib/api/client";
import {
  handleOrganizerKycError,
  ORGANIZER_SETUP_PATH,
} from "@/lib/organizer-kyc";
import {
  mapOrganizerSession,
  updateOrganizerPassword,
} from "@/lib/api/organizer-auth";
import {
  diffOrganizerProfileUpdate,
  emptyOrganizerProfileForm,
  getOrganizerMe,
  getOrganizerProfileOptions,
  hasOrganizerProfileChanges,
  mapOrganizerProfileToForm,
  syncOrganizerProfileCache,
  updateOrganizerProfile,
  type OrganizerProfileFormState,
  type TripSpecialtyOption,
} from "@/lib/api/organizer-profile";
import { DEFAULT_PROFILE_IMAGE } from "@/lib/api/media";
import { getOrganizerProfile } from "@/lib/organizer-profile";
import { TRIP_SPECIALTY_OPTIONS } from "@/lib/trip-specialties";
import { getRootDomain } from "@/lib/tenant";
import { cn } from "@/lib/utils";

type Tab = "profile" | "payouts" | "account";

const TABS: { value: Tab; label: string }[] = [
  { value: "profile", label: "Profile" },
  { value: "payouts", label: "Payouts" },
  { value: "account", label: "Security" },
];

/* ── Primitives ──────────────────────────────────────────────────── */

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label
      className="mb-1.5 block text-[13px] font-medium"
      style={{ color: "var(--text)" }}
    >
      {children}
    </label>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-1.5 text-[12px]" style={{ color: "var(--text-tertiary)" }}>
      {children}
    </p>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  readOnly,
  type = "text",
  className,
}: {
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  type?: string;
  className?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      readOnly={readOnly}
      placeholder={placeholder}
      onChange={(e) => onChange?.(e.target.value)}
      className={cn(
        "h-11 w-full rounded-none border px-3.5 text-sm outline-none transition-colors",
        className
      )}
      style={{
        borderColor: "var(--border)",
        background: readOnly ? "var(--bg-secondary)" : "#fff",
        color: readOnly ? "var(--text-tertiary)" : "var(--text)",
      }}
      onFocus={(e) => {
        if (!readOnly) e.currentTarget.style.borderColor = "var(--primary)";
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = "var(--border)";
      }}
    />
  );
}

function Textarea({
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      rows={rows}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full resize-none rounded-lg border px-3.5 py-3 text-sm outline-none transition-colors"
      style={{
        borderColor: "var(--border)",
        background: "#fff",
        color: "var(--text)",
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = "var(--primary)";
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = "var(--border)";
      }}
    />
  );
}

function PasswordInput({
  value,
  onChange,
  autoComplete,
}: {
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-lg border px-3.5 pr-10 text-sm outline-none transition-colors"
        style={{
          borderColor: "var(--border)",
          background: "#fff",
          color: "var(--text)",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "var(--primary)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "var(--border)";
        }}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2"
        style={{ color: "var(--text-tertiary)" }}
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

function SaveButton({
  onClick,
  label = "Save changes",
  disabled = false,
}: {
  onClick: () => void | Promise<void>;
  label?: string;
  disabled?: boolean;
}) {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handle() {
    if (saving || disabled) return;
    setSaving(true);
    try {
      await onClick();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      /* caller toasts */
    } finally {
      setSaving(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handle}
      disabled={saving || disabled}
      className="inline-flex h-10 items-center gap-2 rounded-none px-4 text-sm font-semibold transition-opacity disabled:opacity-50"
      style={{ background: saved ? "#2e7d52" : "var(--primary)", color: "#fbf7f1" }}
    >
      {saved ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
      {saved ? "Saved" : saving ? "Saving…" : label}
    </button>
  );
}

function Block({
  title,
  description,
  children,
  action,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="border-b py-8 last:border-b-0" style={{ borderColor: "var(--border)" }}>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2
            className="font-display text-base font-semibold tracking-tight"
            style={{ color: "var(--text)" }}
          >
            {title}
          </h2>
          {description && (
            <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
              {description}
            </p>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

/* ── Profile ─────────────────────────────────────────────────────── */

function ProfileTab({
  form,
  setForm,
  specialtyOptions,
  setProfilePhotoFile,
  setBrandLogoFile,
  loading,
  onSave,
}: {
  form: OrganizerProfileFormState;
  setForm: React.Dispatch<React.SetStateAction<OrganizerProfileFormState>>;
  specialtyOptions: TripSpecialtyOption[];
  setProfilePhotoFile: (file: File | null) => void;
  setBrandLogoFile: (file: File | null) => void;
  loading: boolean;
  onSave: () => void | Promise<void>;
}) {
  const photoRef = useRef<HTMLInputElement>(null);
  const logoRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState("");
  const rootDomain = getRootDomain();

  function up<K extends keyof OrganizerProfileFormState>(
    key: K,
    value: OrganizerProfileFormState[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validateImage(file: File): string | null {
    if (!/^image\/(jpeg|jpg|png)$/i.test(file.type)) {
      return "Please choose a JPG or PNG image.";
    }
    if (file.size > 5 * 1024 * 1024) return "Image must be under 5 MB.";
    return null;
  }

  function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const err = validateImage(file);
    if (err) {
      setUploadError(err);
      return;
    }
    setUploadError("");
    setProfilePhotoFile(file);
    up("profilePhotoUrl", URL.createObjectURL(file));
    e.target.value = "";
  }

  function onLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const err = validateImage(file);
    if (err) {
      toast.error(err);
      return;
    }
    setBrandLogoFile(file);
    up("brandLogoUrl", URL.createObjectURL(file));
    e.target.value = "";
  }

  return (
    <div>
      {loading && (
        <p className="mb-4 text-sm" style={{ color: "var(--text-tertiary)" }}>
          Loading profile…
        </p>
      )}

      <Block title="Photos" description="Shown on your public organizer page.">
        <div className="flex flex-wrap gap-10">
          <div className="flex items-center gap-4">
            <div
              className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full"
              style={{ background: "#f5f5f5" }}
            >
              <img
                src={form.profilePhotoUrl || DEFAULT_PROFILE_IMAGE}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--text)" }}>
                Profile photo
              </p>
              <p className="mt-0.5 text-xs" style={{ color: "var(--text-tertiary)" }}>
                JPG or PNG · max 5 MB
              </p>
              <button
                type="button"
                onClick={() => photoRef.current?.click()}
                className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium"
                style={{ color: "var(--primary)" }}
              >
                <Camera className="h-3.5 w-3.5" />
                {form.profilePhotoUrl ? "Change" : "Upload"}
              </button>
              <input
                ref={photoRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                className="hidden"
                onChange={onPhoto}
              />
              {uploadError && (
                <p className="mt-1 text-xs" style={{ color: "var(--coral)" }}>
                  {uploadError}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div
              className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border"
              style={{
                borderColor: "var(--border)",
                background: "var(--bg-secondary)",
              }}
            >
              {form.brandLogoUrl ? (
                <img
                  src={form.brandLogoUrl}
                  alt=""
                  className="h-full w-full object-contain p-2"
                />
              ) : (
                <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                  Logo
                </span>
              )}
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--text)" }}>
                Brand logo
              </p>
              <p className="mt-0.5 text-xs" style={{ color: "var(--text-tertiary)" }}>
                Optional · square preferred
              </p>
              <button
                type="button"
                onClick={() => logoRef.current?.click()}
                className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium"
                style={{ color: "var(--primary)" }}
              >
                <Camera className="h-3.5 w-3.5" />
                {form.brandLogoUrl ? "Change" : "Upload"}
              </button>
              <input
                ref={logoRef}
                type="file"
                accept="image/jpeg,image/png"
                className="hidden"
                onChange={onLogo}
              />
            </div>
          </div>
        </div>
      </Block>

      <Block title="Public details" description="What travelers see about you.">
        <div className="grid max-w-2xl gap-5">
          <div>
            <Label>Full name</Label>
            <Input
              value={form.fullName}
              onChange={(v) => up("fullName", v)}
              placeholder="Your name"
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label>Location</Label>
              <Input
                value={form.location}
                onChange={(v) => up("location", v)}
                placeholder="Accra, Ghana"
              />
            </div>
            <div>
              <Label>WhatsApp</Label>
              <Input
                value={form.whatsapp}
                onChange={(v) => up("whatsapp", v)}
                type="tel"
                placeholder="+233…"
              />
              <Hint>Leave blank to clear.</Hint>
            </div>
          </div>
          <div>
            <Label>About you</Label>
            <Textarea
              value={form.aboutYou}
              onChange={(v) => up("aboutYou", v)}
              placeholder="A short bio for travelers…"
              rows={4}
            />
          </div>
          <div>
            <Label>Trip specialties</Label>
            <div className="mt-1 flex flex-wrap gap-2">
              {specialtyOptions.map((option) => {
                const selected = form.tripSpecialties.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      up(
                        "tripSpecialties",
                        selected
                          ? form.tripSpecialties.filter((s) => s !== option.value)
                          : [...form.tripSpecialties, option.value]
                      )
                    }
                    className="rounded-none px-3.5 py-1.5 text-[13px] font-medium transition-colors"
                    style={{
                      background: selected ? "var(--primary)" : "var(--bg-secondary)",
                      color: selected ? "#fbf7f1" : "var(--text-secondary)",
                    }}
                    aria-pressed={selected}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </Block>

      <Block
        title="Account details"
        description="These were set during signup. Contact support to change them."
      >
        <div className="grid max-w-2xl gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label>Email</Label>
              <Input value={form.email} readOnly />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={form.phone} readOnly />
            </div>
          </div>
          <div>
            <Label>Business name</Label>
            <Input value={form.businessName} readOnly />
          </div>
          <div>
            <Label>Public page</Label>
            <div
              className="flex h-11 overflow-hidden rounded-lg border"
              style={{
                borderColor: "var(--border)",
                background: "var(--bg-secondary)",
              }}
            >
              <span
                className="hidden items-center border-r px-3 text-xs sm:flex"
                style={{
                  borderColor: "var(--border)",
                  color: "var(--text-tertiary)",
                }}
              >
                {rootDomain.includes("localhost") ? "http://" : "https://"}
              </span>
              <input
                value={form.brandSlug}
                readOnly
                className="min-w-0 flex-1 bg-transparent px-3 font-mono text-sm outline-none"
                style={{ color: "var(--text-tertiary)" }}
              />
              <span
                className="hidden items-center border-l px-3 text-xs sm:flex"
                style={{
                  borderColor: "var(--border)",
                  color: "var(--text-tertiary)",
                }}
              >
                .{rootDomain}
              </span>
            </div>
          </div>
          <div>
            <Label>National ID</Label>
            {form.nationalIdPhotoUrl ? (
              <a
                href={form.nationalIdPhotoUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium underline-offset-2 hover:underline"
                style={{ color: "var(--primary)" }}
              >
                View uploaded document
              </a>
            ) : (
              <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                No document on file
              </p>
            )}
          </div>
        </div>
      </Block>

      <div className="flex justify-end pt-6">
        <SaveButton onClick={onSave} label="Save profile" disabled={loading} />
      </div>
    </div>
  );
}

/* ── Security ────────────────────────────────────────────────────── */

type PasswordField = "current" | "next" | "confirm";

function mapPasswordErrorToField(
  message: string
): { field: PasswordField; message: string } | null {
  const lower = message.toLowerCase();
  if (
    lower.includes("do not match") ||
    lower.includes("don't match") ||
    lower.includes("does not match")
  ) {
    return { field: "confirm", message };
  }
  if (
    lower.includes("at least 8") ||
    lower.includes("must be different") ||
    lower.includes("different from")
  ) {
    return { field: "next", message };
  }
  if (
    lower.includes("current password") ||
    lower.includes("incorrect") ||
    lower.includes("wrong password")
  ) {
    return { field: "current", message };
  }
  return null;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p
      className="mt-1.5 flex items-center gap-1.5 text-[12px]"
      style={{ color: "var(--coral)" }}
    >
      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
      {message}
    </p>
  );
}

function AccountTab() {
  const router = useRouter();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<PasswordField, string>>
  >({});
  const [formError, setFormError] = useState("");

  function clearErrors() {
    setFieldErrors({});
    setFormError("");
  }

  async function handleSave() {
    clearErrors();

    if (!current.trim() || !next.trim() || !confirm.trim()) {
      const nextErrors: Partial<Record<PasswordField, string>> = {};
      if (!current.trim()) nextErrors.current = "Enter your current password.";
      if (!next.trim()) nextErrors.next = "Enter a new password.";
      if (!confirm.trim()) nextErrors.confirm = "Confirm your new password.";
      setFieldErrors(nextErrors);
      throw new Error("Validation failed");
    }
    if (next.length < 8) {
      setFieldErrors({ next: "Password must be at least 8 characters." });
      throw new Error("Validation failed");
    }
    if (next !== confirm) {
      setFieldErrors({ confirm: "New passwords do not match." });
      throw new Error("Validation failed");
    }
    if (next === current) {
      setFieldErrors({
        next: "New password must be different from your current password.",
      });
      throw new Error("Validation failed");
    }

    try {
      const response = await updateOrganizerPassword({
        currentPassword: current,
        newPassword: next,
        confirmNewPassword: confirm,
      });
      setCurrent("");
      setNext("");
      setConfirm("");
      toast.success(response.message || "Password updated successfully");
    } catch (error) {
      if (error instanceof ApiError) {
        const message =
          error.message || "Failed to update password. Please try again.";

        if (error.status === 401) {
          const lower = message.toLowerCase();
          if (
            lower.includes("authentication required") ||
            lower.includes("unauthorized") ||
            lower.includes("session") ||
            lower.includes("token")
          ) {
            toast.error("Session expired. Please sign in again.");
            router.push(
              `/organizer/login?redirect=${encodeURIComponent("/organizer/settings?tab=account")}`
            );
            throw error;
          }
          setFieldErrors({ current: message });
          throw error;
        }

        const mapped = mapPasswordErrorToField(message);
        if (mapped) {
          setFieldErrors({ [mapped.field]: mapped.message });
        } else {
          setFormError(message);
        }
        throw error;
      }

      setFormError("Something went wrong. Please try again.");
      throw error instanceof Error ? error : new Error("Failed to update password");
    }
  }

  return (
    <Block title="Password" description="Update the password you use to sign in.">
      <div className="max-w-md space-y-4">
        <div>
          <Label>Current password</Label>
          <PasswordInput
            value={current}
            onChange={(v) => {
              setCurrent(v);
              if (fieldErrors.current || formError) clearErrors();
            }}
            autoComplete="current-password"
          />
          <FieldError message={fieldErrors.current} />
        </div>
        <div>
          <Label>New password</Label>
          <PasswordInput
            value={next}
            onChange={(v) => {
              setNext(v);
              if (fieldErrors.next || formError) clearErrors();
            }}
            autoComplete="new-password"
          />
          <FieldError message={fieldErrors.next} />
        </div>
        <div>
          <Label>Confirm new password</Label>
          <PasswordInput
            value={confirm}
            onChange={(v) => {
              setConfirm(v);
              if (fieldErrors.confirm || formError) clearErrors();
            }}
            autoComplete="new-password"
          />
          <FieldError message={fieldErrors.confirm} />
        </div>
        {formError && (
          <p
            className="flex items-center gap-1.5 text-sm"
            style={{ color: "var(--coral)" }}
          >
            <AlertCircle className="h-3.5 w-3.5" />
            {formError}
          </p>
        )}
        <div className="pt-2">
          <SaveButton onClick={handleSave} label="Update password" />
        </div>
      </div>
    </Block>
  );
}

/* ── Page ────────────────────────────────────────────────────────── */

export default function OrganizerSettingsPage() {
  const { user, login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const tabFromUrl = searchParams.get("tab") as Tab | null;
  const validTabs: Tab[] = ["profile", "payouts", "account"];
  const [activeTab, setActiveTab] = useState<Tab>(
    tabFromUrl && validTabs.includes(tabFromUrl) ? tabFromUrl : "profile"
  );

  const [form, setForm] = useState<OrganizerProfileFormState>(() =>
    emptyOrganizerProfileForm()
  );
  const [baseline, setBaseline] = useState<OrganizerProfileFormState>(() =>
    emptyOrganizerProfileForm()
  );
  const [specialtyOptions, setSpecialtyOptions] =
    useState<TripSpecialtyOption[]>(TRIP_SPECIALTY_OPTIONS);
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [brandLogoFile, setBrandLogoFile] = useState<File | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoadingProfile(true);
    getOrganizerMe()
      .then((response) => {
        if (cancelled) return;
        const mapped = mapOrganizerProfileToForm(response.data, {
          fullName: user?.name ?? "",
          email: user?.email ?? "",
          phone: user?.phone ?? "",
        });
        setForm(mapped);
        setBaseline(mapped);
        syncOrganizerProfileCache(response.data);

        if (response.data) {
          login(mapOrganizerSession({
            id: response.data.id ?? "organizer",
            fullName: response.data.fullName,
            email: response.data.email ?? mapped.email,
            phone: response.data.phone,
            role: response.data.role ?? "organizer",
            isVerified: response.data.isVerified ?? false,
            status: response.data.status,
            rejectionReason: response.data.rejectionReason,
            onboardingCompleted: response.data.onboardingCompleted ?? true,
            brandSlug: response.data.brandSlug,
            businessName: response.data.businessName,
            profilePhoto: response.data.profilePhoto,
            brandLogo: response.data.brandLogo,
            nationalIdPhoto: response.data.nationalIdPhoto,
            aboutYou: response.data.aboutYou,
            tripSpecialties: response.data.tripSpecialties,
            whatsapp: response.data.whatsapp,
            location: response.data.location,
          }));
        }
      })
      .catch((error) => {
        if (cancelled) return;
        if (error instanceof ApiError && error.status === 401) {
          toast.error("Session expired. Please sign in again.");
          router.push("/organizer/login?redirect=/organizer/settings");
          return;
        }
        if (error instanceof ApiError && error.status === 403) {
          toast.error(error.message || "Complete setup to edit your profile.");
          if (!handleOrganizerKycError(error, router)) {
            router.push(ORGANIZER_SETUP_PATH);
          }
          return;
        }
        const local = getOrganizerProfile();
        const fallback = mapOrganizerProfileToForm(undefined, {
          fullName: user?.name ?? "",
          email: user?.email ?? "",
          phone: user?.phone || local.phone,
          whatsapp: local.whatsapp,
          location: local.location,
          aboutYou: local.bio,
          tripSpecialties: local.specialties,
          profilePhotoUrl: local.profilePicture,
          brandLogoUrl: local.brandLogo,
          businessName: local.businessName,
          brandSlug: local.brandSlug,
        });
        setForm(fallback);
        setBaseline(fallback);
      })
      .finally(() => {
        if (!cancelled) setLoadingProfile(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cancelled = false;
    getOrganizerProfileOptions()
      .then((response) => {
        const options = response.data?.tripSpecialties;
        if (!cancelled && options?.length) setSpecialtyOptions(options);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSaveProfile() {
    const patch = diffOrganizerProfileUpdate(form, baseline, {
      profilePhoto: profilePhotoFile,
      brandLogo: brandLogoFile,
    });

    if (!hasOrganizerProfileChanges(patch)) {
      toast.message("No changes to save");
      return;
    }

    try {
      const response = await updateOrganizerProfile(patch);
      const mapped = mapOrganizerProfileToForm(response.data, form);
      setForm(mapped);
      setBaseline(mapped);
      setProfilePhotoFile(null);
      setBrandLogoFile(null);
      syncOrganizerProfileCache(response.data);

      if (response.data) {
        login(
          mapOrganizerSession({
            id: response.data.id ?? "organizer",
            fullName: response.data.fullName ?? mapped.fullName,
            email: response.data.email ?? mapped.email,
            phone: response.data.phone ?? mapped.phone,
            role: response.data.role ?? "organizer",
            isVerified: response.data.isVerified ?? false,
            status: response.data.status,
            rejectionReason: response.data.rejectionReason,
            onboardingCompleted: response.data.onboardingCompleted ?? true,
            brandSlug: response.data.brandSlug ?? mapped.brandSlug,
            businessName: response.data.businessName ?? mapped.businessName,
            profilePhoto: response.data.profilePhoto,
            brandLogo: response.data.brandLogo,
            nationalIdPhoto: response.data.nationalIdPhoto,
            aboutYou: response.data.aboutYou ?? mapped.aboutYou,
            tripSpecialties: response.data.tripSpecialties ?? mapped.tripSpecialties,
            whatsapp: response.data.whatsapp ?? mapped.whatsapp,
            location: response.data.location ?? mapped.location,
          })
        );
      } else {
        login({
          name: mapped.fullName,
          email: mapped.email,
          phone: mapped.phone,
          role: "organizer",
          organizerStatus: "verified",
        });
      }

      toast.success(response.message || "Profile saved");
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 401) {
          toast.error("Session expired. Please sign in again.");
          router.push("/organizer/login?redirect=/organizer/settings");
          throw error;
        }
        if (error.status === 403) {
          toast.error(
            error.message || "Complete verification to update your profile."
          );
          if (!handleOrganizerKycError(error, router)) {
            router.push(ORGANIZER_SETUP_PATH);
          }
          throw error;
        }
        toast.error(error.message || "Could not update profile.");
        throw error;
      }
      toast.error("Something went wrong. Please try again.");
      throw error;
    }
  }

  return (
    <div className="w-full p-6 lg:p-8">
      <div className="max-w-3xl">
      <header className="mb-8">
        <h1
          className="font-display text-2xl font-bold tracking-tight"
          style={{ color: "var(--text)" }}
        >
          Settings
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
          Your profile, payouts, and preferences.
        </p>
      </header>

      <OrganizerPortalTabs
        className="mb-6"
        aria-label="Settings sections"
        tabs={TABS}
        value={activeTab}
        onChange={setActiveTab}
      />

      <div>
        {activeTab === "profile" && (
          <ProfileTab
            form={form}
            setForm={setForm}
            specialtyOptions={specialtyOptions}
            setProfilePhotoFile={setProfilePhotoFile}
            setBrandLogoFile={setBrandLogoFile}
            loading={loadingProfile}
            onSave={handleSaveProfile}
          />
        )}
        {activeTab === "payouts" && (
          <Block
            title="Payout accounts"
            description="Mobile money accounts used for withdrawals."
          >
            <PayoutAccountsSection />
          </Block>
        )}
        {activeTab === "account" && <AccountTab />}
      </div>
      </div>
    </div>
  );
}

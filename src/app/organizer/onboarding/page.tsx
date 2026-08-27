"use client";

import { RequireOrganizerAuth } from "@/components/auth/require-organizer-auth";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Clock,
  Map,
  MapPin,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileUploadZone } from "@/components/organizer/file-upload-zone";
import { BrandLogo } from "@/components/brand-logo";
import { useAuth } from "@/hooks/use-auth";
import { ApiError } from "@/lib/api/client";
import {
  getOrganizerProfileOptions,
  mapOrganizerProfileToForm,
  setupOrganizerProfile,
  syncOrganizerProfileCache,
  type TripSpecialtyOption,
} from "@/lib/api/organizer-profile";
import { getOrganizerMe, mapOrganizerSession } from "@/lib/api/organizer-auth";
import {
  handleOrganizerKycError,
  kycFromAuthUser,
  ORGANIZER_DASHBOARD_PATH,
  ORGANIZER_KYC_CODES,
  ORGANIZER_SETTINGS_PATH,
  ORGANIZER_VERIFICATION_PATH,
} from "@/lib/organizer-kyc";
import { DEFAULT_PROFILE_IMAGE } from "@/lib/api/media";
import { TRIP_SPECIALTY_OPTIONS } from "@/lib/trip-specialties";
import {
  getOrganizerProfile,
  saveOrganizerProfile,
} from "@/lib/organizer-profile";
import {
  getRootDomain,
  sanitizeSlugInput,
  tripPathSlug,
  validateBrandSlug,
} from "@/lib/tenant";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import gsap from "gsap";

const STEPS = [
  {
    id: "photo",
    title: "Profile photo",
    subtitle: "Put a face to your name",
    icon: User,
    hint: "Upload a clear headshot so travelers recognize you on trip listings.",
  },
  {
    id: "personal",
    title: "Personal details",
    subtitle: "Your name & location",
    icon: MapPin,
    hint: "Use the name and city you want shown on your public organizer profile.",
  },
  {
    id: "contact",
    title: "Contact",
    subtitle: "How travelers reach you",
    icon: Phone,
    hint: "We use your phone for booking confirmations and trip updates via SMS.",
  },
  {
    id: "about",
    title: "Your trips",
    subtitle: "Brand & experience",
    icon: Map,
    hint: "Help travelers understand your style — adventure, culture, beach, or all three.",
  },
  {
    id: "verify",
    title: "Verification",
    subtitle: "Identity check",
    icon: ShieldCheck,
    hint: "One-time ID check. Your document is never shared with travelers.",
  },
] as const;

type StepId = (typeof STEPS)[number]["id"];
const BIO_MAX = 500;

function stepValid(
  id: StepId,
  form: Record<string, string>,
  profilePicture: string | null,
  nationalId: string | null
): boolean {
  switch (id) {
    case "photo":
      return !!profilePicture;
    case "personal":
      return !!form.name?.trim() && !!form.location?.trim();
    case "contact":
      return !!form.phone?.trim();
    case "about":
      return (
        !!form.businessName?.trim() &&
        validateBrandSlug(form.brandSlug ?? "").ok &&
        !!form.bio?.trim()
      );
    case "verify":
      return !!nationalId;
  }
}

function stepHint(id: StepId): string {
  switch (id) {
    case "photo":
      return "Upload a profile photo to continue";
    case "personal":
      return "Enter your full name and location to continue";
    case "contact":
      return "Enter a phone number to continue";
    case "about":
      return "Add your business name, public link, and bio to continue";
    case "verify":
      return "Upload your ID to submit";
  }
}

function OnboardingFlow() {
  const router = useRouter();
  const { user, login, setKyc } = useAuth();
  const kyc = kycFromAuthUser(user);
  const isResubmit = kyc.status === "rejected";
  const [current, setCurrent] = useState(0);
  const [prefillReady, setPrefillReady] = useState(!isResubmit);
  const panelRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    whatsapp: "",
    location: "",
    businessName: "",
    brandSlug: "",
    bio: "",
  });
  const [brandSlugTouched, setBrandSlugTouched] = useState(false);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [specialtyOptions, setSpecialtyOptions] =
    useState<TripSpecialtyOption[]>(TRIP_SPECIALTY_OPTIONS);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [brandLogo, setBrandLogo] = useState<string | null>(null);
  const [brandLogoFile, setBrandLogoFile] = useState<File | null>(null);
  const [nationalId, setNationalId] = useState<string | null>(null);
  const [nationalIdFile, setNationalIdFile] = useState<File | null>(null);
  const [whatsappSameAsPhone, setWhatsappSameAsPhone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const toggleSpecialty = (value: string) => {
    setSpecialties((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]
    );
  };

  useEffect(() => {
    if (!user) return;
    const nextKyc = kycFromAuthUser(user);
    if (nextKyc.status === "approved" || nextKyc.canPublish) {
      router.replace(ORGANIZER_DASHBOARD_PATH);
      return;
    }
    if (nextKyc.status === "pending" && nextKyc.onboardingCompleted) {
      router.replace(ORGANIZER_VERIFICATION_PATH);
    }
  }, [user, router]);

  useEffect(() => {
    let cancelled = false;
    async function prefill() {
      try {
        const response = await getOrganizerMe();
        const me = response.data;
        if (cancelled || !me) {
          if (!cancelled) setPrefillReady(true);
          return;
        }
        login(mapOrganizerSession(me));
        syncOrganizerProfileCache(me);
        const mapped = mapOrganizerProfileToForm(me);
        if (cancelled) return;
        setForm((prev) => ({
          ...prev,
          name: mapped.fullName || user?.name || prev.name,
          email: mapped.email || user?.email || prev.email,
          phone: mapped.phone || prev.phone,
          whatsapp: mapped.whatsapp || prev.whatsapp,
          location: mapped.location || prev.location,
          businessName: mapped.businessName || prev.businessName,
          brandSlug: mapped.brandSlug || prev.brandSlug,
          bio: mapped.aboutYou || prev.bio,
        }));
        if (mapped.tripSpecialties.length) setSpecialties(mapped.tripSpecialties);
        if (mapped.profilePhotoUrl) setProfilePicture(mapped.profilePhotoUrl);
        if (mapped.brandLogoUrl) setBrandLogo(mapped.brandLogoUrl);
        if (mapped.brandSlug) setBrandSlugTouched(true);
      } catch (error) {
        if (handleOrganizerKycError(error, router, { replace: true })) {
          return;
        }
        if (user) {
          setForm((prev) => ({
            ...prev,
            name: prev.name || user.name || "",
            email: prev.email || user.email || "",
          }));
        }
      } finally {
        if (!cancelled) setPrefillReady(true);
      }
    }
    void prefill();
    return () => {
      cancelled = true;
    };
    // Prefill once from /me so rejected organizers see their last profile.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cancelled = false;
    getOrganizerProfileOptions()
      .then((response) => {
        const options = response.data?.tripSpecialties;
        if (!cancelled && options?.length) setSpecialtyOptions(options);
      })
      .catch(() => {
        /* keep hardcoded fallback */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (whatsappSameAsPhone && form.phone) {
      setForm((f) => ({ ...f, whatsapp: form.phone }));
    }
  }, [whatsappSameAsPhone, form.phone]);

  const update = (field: string, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const completedCount = STEPS.filter((s) =>
    stepValid(s.id, form, profilePicture, nationalId)
  ).length;
  const flowProgressPct = Math.round(((current + 1) / STEPS.length) * 100);
  const completionPct = Math.round((completedCount / STEPS.length) * 100);
  const verifyReady = isResubmit ? !!nationalIdFile : !!nationalId;
  const currentStepValid =
    STEPS[current].id === "verify"
      ? verifyReady
      : stepValid(STEPS[current].id, form, profilePicture, nationalId);
  const allComplete =
    STEPS.filter((s) =>
      s.id === "verify"
        ? verifyReady
        : stepValid(s.id, form, profilePicture, nationalId)
    ).length === STEPS.length;
  const isLast = current === STEPS.length - 1;

  const animateTo = (nextIdx: number) => {
    const el = panelRef.current;
    if (!el) {
      setCurrent(nextIdx);
      return;
    }
    const dir = nextIdx > current ? 1 : -1;
    gsap.fromTo(
      el,
      { opacity: 0, x: dir * 28 },
      {
        opacity: 1,
        x: 0,
        duration: 0.32,
        ease: "power3.out",
        onStart: () => setCurrent(nextIdx),
      }
    );
  };

  const goNext = () => {
    if (current < STEPS.length - 1) animateTo(current + 1);
  };
  const goPrev = () => {
    if (current > 0) animateTo(current - 1);
  };
  const goTo = (i: number) => {
    if (i !== current) animateTo(i);
  };

  const finish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allComplete || submitting) return;
    if (!nationalIdFile) {
      toast.error(
        isResubmit
          ? "Upload a new national ID photo to resubmit."
          : "Please upload your profile photo and national ID."
      );
      return;
    }
    if (!isResubmit && !profilePictureFile) {
      toast.error("Please upload your profile photo and national ID.");
      return;
    }

    const tooLarge = [profilePictureFile, brandLogoFile, nationalIdFile]
      .filter(Boolean)
      .find((file) => file!.size > 5 * 1024 * 1024);
    if (tooLarge) {
      toast.error("Each image must be under 5 MB.");
      return;
    }

    setSubmitting(true);
    try {
      const slugCheck = validateBrandSlug(form.brandSlug || form.businessName);
      if (!slugCheck.ok) {
        toast.error(slugCheck.error);
        setSubmitting(false);
        return;
      }

      const response = await setupOrganizerProfile({
        fullName: form.name.trim(),
        location: form.location.trim(),
        phone: form.phone.trim(),
        whatsapp: form.whatsapp.trim() || form.phone.trim(),
        businessName: form.businessName.trim(),
        brandSlug: slugCheck.value,
        aboutYou: form.bio.trim(),
        tripSpecialties: specialties,
        profilePhoto: profilePictureFile ?? undefined,
        brandLogo: brandLogoFile,
        nationalIdPhoto: nationalIdFile,
      });

      const brandSlug =
        response.data?.brandSlug?.trim() || slugCheck.value;

      if (response.data) {
        syncOrganizerProfileCache(response.data);
        const session = mapOrganizerSession({
            id: response.data.id ?? "organizer",
            fullName: response.data.fullName ?? form.name.trim(),
            email:
              response.data.email ?? (form.email || user?.email || ""),
            phone: response.data.phone ?? form.phone.trim(),
            role: response.data.role ?? "organizer",
            isVerified: response.data.isVerified ?? false,
            status: response.data.status ?? "pending",
            rejectionReason: response.data.rejectionReason,
            onboardingCompleted: response.data.onboardingCompleted ?? true,
            brandSlug,
            businessName:
              response.data.businessName ?? form.businessName.trim(),
            profilePhoto: response.data.profilePhoto,
            brandLogo: response.data.brandLogo,
            nationalIdPhoto: response.data.nationalIdPhoto,
            aboutYou: response.data.aboutYou ?? form.bio.trim(),
            tripSpecialties: response.data.tripSpecialties ?? specialties,
            whatsapp: response.data.whatsapp,
            location: response.data.location ?? form.location.trim(),
            kyc: response.data.kyc,
            canPublish: response.data.canPublish,
            canResubmit: response.data.canResubmit,
            resubmittedAt: response.data.resubmittedAt,
            resubmissionCount: response.data.resubmissionCount,
          });
        login(session);
        if (session.kyc) setKyc(session.kyc);
      } else {
        const mapped = mapOrganizerProfileToForm(undefined, {
          fullName: form.name.trim(),
          phone: form.phone.trim(),
          whatsapp: form.whatsapp.trim() || form.phone.trim(),
          location: form.location.trim(),
          aboutYou: form.bio.trim(),
          tripSpecialties: specialties,
          businessName: form.businessName.trim(),
          brandSlug,
          profilePhotoUrl: profilePicture,
          brandLogoUrl: brandLogo,
          email: form.email || user?.email || "",
        });
        saveOrganizerProfile({
          ...getOrganizerProfile(),
          phone: mapped.phone,
          whatsapp: mapped.whatsapp,
          location: mapped.location,
          businessName: mapped.businessName,
          brandSlug: mapped.brandSlug,
          bio: mapped.aboutYou,
          specialties: mapped.tripSpecialties,
          profilePicture: mapped.profilePhotoUrl,
          brandLogo: mapped.brandLogoUrl,
        });
        if (user) {
          login({
            name: form.name.trim(),
            email: form.email || user.email,
            phone: form.phone.trim(),
            role: "organizer",
            organizerStatus: "pending",
          });
        }
      }
      const code = response.code;
      if (code === ORGANIZER_KYC_CODES.ALREADY_APPROVED) {
        toast.success(response.message || "Your account is already approved.");
        router.replace(ORGANIZER_SETTINGS_PATH);
        return;
      }
      if (code === ORGANIZER_KYC_CODES.ALREADY_PENDING) {
        toast.message(response.message || "Your application is already in review.");
        router.replace(ORGANIZER_VERIFICATION_PATH);
        return;
      }
      toast.success(
        response.message ||
          (code === ORGANIZER_KYC_CODES.RESUBMITTED
            ? "Update submitted. We’ll review it again."
            : "Profile submitted. Waiting for admin approval before you can create trips.")
      );
      router.push(ORGANIZER_VERIFICATION_PATH);
    } catch (error) {
      if (handleOrganizerKycError(error, router)) {
        const message =
          error instanceof ApiError ? error.message : "Something went wrong.";
        toast.error(message);
        return;
      }
      const message =
        error instanceof ApiError
          ? error.status === 409
            ? error.message ||
              "That public page URL is already taken. Choose another."
            : error.message
          : "Something went wrong. Please try again.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const step = STEPS[current];
  const StepIcon = step.icon;

  if (!prefillReady) {
    return (
      <div
        className="flex min-h-screen items-center justify-center text-sm"
        style={{ background: "var(--bg)", color: "var(--text-secondary)" }}
      >
        Loading your profile…
      </div>
    );
  }

  return (
    <div
      className="flex min-h-screen flex-col lg:flex-row"
      style={{ background: "var(--bg)" }}
    >
      {/* ── Sidebar (desktop) ───────────────────────────────────── */}
      <aside
        className="hidden shrink-0 flex-col border-r lg:flex lg:w-[300px] xl:w-[340px]"
        style={{ borderColor: "var(--border)", background: "var(--surface)" }}
      >
        <div className="flex flex-1 flex-col px-6 py-8 xl:px-8">
          <Link
            href="/organizer"
            className="mb-8 inline-flex w-fit items-center gap-1.5 text-sm font-medium transition-colors hover:text-[var(--primary)]"
            style={{ color: "var(--text-tertiary)" }}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to overview
          </Link>

          <Link href="/organizer" className="mb-8">
            <BrandLogo
              size="lg"
              withWordmark
              wordmarkClassName="text-lg"
              wordmarkStyle={{ color: "var(--text)" }}
              subline="Organizer setup"
            />
          </Link>

          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                Your progress
              </p>
              <span className="text-sm font-bold" style={{ color: "var(--primary)" }}>
                {completionPct}%
              </span>
            </div>
            <div
              className="h-1.5 w-full overflow-hidden rounded-full"
              style={{ background: "var(--border)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${completionPct}%`,
                  background: "var(--gradient-brand)",
                }}
              />
            </div>
            <p className="mt-2 text-xs" style={{ color: "var(--text-tertiary)" }}>
              {completedCount} of {STEPS.length} sections complete
            </p>
          </div>

          <nav className="space-y-1">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const done = stepValid(s.id, form, profilePicture, nationalId);
              const active = i === current;

              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => goTo(i)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-none px-3 py-2.5 text-left transition-all duration-150",
                    active && "shadow-sm"
                  )}
                  style={{
                    background: active ? "var(--primary-dim)" : "transparent",
                  }}
                >
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all"
                    style={{
                      borderColor: done || active ? "var(--primary)" : "var(--border)",
                      background: done ? "var(--primary-dim)" : "var(--bg-secondary)",
                    }}
                  >
                    {done ? (
                      <Check className="h-3.5 w-3.5" style={{ color: "var(--primary)" }} />
                    ) : (
                      <Icon
                        className="h-3.5 w-3.5"
                        style={{
                          color: active ? "var(--primary)" : "var(--text-tertiary)",
                        }}
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className="text-sm font-semibold leading-tight"
                      style={{
                        color: active
                          ? "var(--primary)"
                          : done
                            ? "var(--text)"
                            : "var(--text-secondary)",
                      }}
                    >
                      {s.title}
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                      {s.subtitle}
                    </p>
                  </div>
                </button>
              );
            })}
          </nav>

          <div
            className="mt-auto flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs"
            style={{
              background: "var(--bg-secondary)",
              color: "var(--text-secondary)",
            }}
          >
            <Clock className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--gold)" }} />
            About 5 minutes · save anytime and return later
          </div>
        </div>
      </aside>

      {/* ── Main panel ─────────────────────────────────────────── */}
      <div className="flex min-h-screen flex-1 flex-col lg:min-h-0">
        {/* Mobile header */}
        <div
          className="sticky top-0 z-20 border-b px-4 py-3 backdrop-blur-md lg:hidden"
          style={{
            borderColor: "var(--border)",
            background: "rgba(251,247,241,0.93)",
          }}
        >
          <div className="mb-2 flex items-center justify-between">
            <Link
              href="/organizer"
              className="inline-flex items-center gap-1 text-xs font-medium"
              style={{ color: "var(--text-tertiary)" }}
            >
              <ArrowLeft className="h-3 w-3" />
              Back
            </Link>
            <span className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
              Step {current + 1} of {STEPS.length}
            </span>
            <span className="text-xs font-bold" style={{ color: "var(--primary)" }}>
              {completionPct}%
            </span>
          </div>
          <div
            className="h-1 w-full overflow-hidden rounded-full"
            style={{ background: "var(--border)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${flowProgressPct}%`,
                background: "var(--gradient-brand)",
              }}
            />
          </div>
        </div>

        <div className="flex flex-1 flex-col lg:overflow-hidden">
          {/* Form column */}
          <form
            onSubmit={finish}
            onKeyDown={(e) => {
              // Press Enter to advance to next step (unless on the last step or inside textarea)
              if (
                e.key === "Enter" &&
                !isLast &&
                currentStepValid &&
                !submitting &&
                (e.target as HTMLElement).tagName !== "TEXTAREA"
              ) {
                e.preventDefault();
                goNext();
              }
            }}
            className="flex flex-1 flex-col"
          >
            <div ref={panelRef} className="mx-auto w-full max-w-xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
              {isResubmit && kyc.rejectionReason ? (
                <div
                  className="mb-6 rounded-2xl border px-4 py-3.5 text-sm"
                  style={{
                    background: "rgba(181,82,58,0.06)",
                    borderColor: "rgba(181,82,58,0.22)",
                  }}
                >
                  <p
                    className="text-[11px] font-semibold uppercase tracking-wider"
                    style={{ color: "var(--coral)" }}
                  >
                    Application not approved
                  </p>
                  <p className="mt-1.5 leading-relaxed" style={{ color: "var(--text)" }}>
                    {kyc.rejectionReason}
                  </p>
                  <p className="mt-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                    Update the details below and upload a new ID photo to resubmit.
                  </p>
                </div>
              ) : null}
              <p
                className="text-xs font-bold uppercase tracking-[0.18em]"
                style={{ color: "var(--gold)" }}
              >
                Step {current + 1} of {STEPS.length}
              </p>
              <div className="mt-2 flex items-start gap-4">
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: "var(--primary-dim)" }}
                >
                  <StepIcon className="h-5 w-5" style={{ color: "var(--primary)" }} />
                </div>
                <div>
                  <h1
                    className="font-display text-2xl font-bold sm:text-3xl"
                    style={{ color: "var(--text)" }}
                  >
                    {step.title}
                  </h1>
                  <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    {step.hint}
                  </p>
                </div>
              </div>

              <div
                className="mt-8 rounded-2xl border p-6 sm:p-7"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--surface)",
                  boxShadow: "0 24px 60px -32px rgba(86,47,24,0.14)",
                }}
              >
                {current === 0 && (
                  <div className="flex flex-col items-center gap-5">
                    <div
                      className="relative h-28 w-28 overflow-hidden rounded-full border-4"
                      style={{
                        borderColor: profilePicture ? "var(--primary)" : "var(--border)",
                        background: "var(--bg-secondary)",
                      }}
                    >
                      {profilePicture ? (
                        <Image
                          src={profilePicture}
                          alt="Profile preview"
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      ) : (
                        <Image
                          src={DEFAULT_PROFILE_IMAGE}
                          alt=""
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                    <FileUploadZone
                      label="Profile picture"
                      description="JPG or PNG · max 5 MB"
                      accept="image/*"
                      variant="image"
                      aspectRatio="square"
                      value={profilePicture}
                      onChange={(preview, file) => {
                        setProfilePicture(preview);
                        setProfilePictureFile(file ?? null);
                      }}
                      className="w-full max-w-sm"
                    />
                  </div>
                )}

                {current === 1 && (
                  <div className="space-y-5">
                    <div>
                      <Label htmlFor="name" className="mb-1.5 block" style={{ color: "var(--text)" }}>
                        Full name <span style={{ color: "var(--coral)" }}>*</span>
                      </Label>
                      <Input
                        id="name"
                        className="h-11 !rounded-none"
                        style={{ borderColor: "var(--border-strong)" }}
                        placeholder="Your full name"
                        value={form.name}
                        onChange={(e) => update("name", e.target.value)}
                        autoFocus
                        required
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="location"
                        className="mb-1.5 block"
                        style={{ color: "var(--text)" }}
                      >
                        Location <span style={{ color: "var(--coral)" }}>*</span>
                      </Label>
                      <Input
                        id="location"
                        className="h-11 !rounded-none"
                        style={{ borderColor: "var(--border-strong)" }}
                        placeholder="City, Country (e.g. Accra, Ghana)"
                        value={form.location}
                        onChange={(e) => update("location", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                )}

                {current === 2 && (
                  <div className="space-y-5">
                    <div>
                      <Label htmlFor="email" className="mb-1.5 block" style={{ color: "var(--text)" }}>
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        className="h-11 !rounded-none"
                        style={{
                          borderColor: "var(--border)",
                          background: "var(--bg-secondary)",
                          color: "var(--text-secondary)",
                        }}
                        value={form.email}
                        readOnly
                      />
                      <p className="mt-1.5 text-xs" style={{ color: "var(--text-tertiary)" }}>
                        Verified during sign-up
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="phone" className="mb-1.5 block" style={{ color: "var(--text)" }}>
                        Phone number <span style={{ color: "var(--coral)" }}>*</span>
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        className="h-11 !rounded-none"
                        style={{ borderColor: "var(--border-strong)" }}
                        placeholder="+233 XX XXX XXXX"
                        value={form.phone}
                        onChange={(e) => update("phone", e.target.value)}
                        autoComplete="tel"
                        required
                      />
                      <p className="mt-1.5 text-xs" style={{ color: "var(--text-tertiary)" }}>
                        Used for booking confirmations and trip updates via SMS
                      </p>
                    </div>
                    <div>
                      <div className="mb-1.5 flex items-center justify-between gap-2">
                        <Label htmlFor="whatsapp" style={{ color: "var(--text)" }}>
                          WhatsApp{" "}
                          <span className="text-xs font-normal" style={{ color: "var(--text-tertiary)" }}>
                            (optional)
                          </span>
                        </Label>
                        <button
                          type="button"
                          onClick={() => setWhatsappSameAsPhone((v) => !v)}
                          className="text-xs font-medium transition-colors hover:text-[var(--primary)]"
                          style={{
                            color: whatsappSameAsPhone ? "var(--primary)" : "var(--text-tertiary)",
                          }}
                        >
                          Same as phone
                        </button>
                      </div>
                      <Input
                        id="whatsapp"
                        type="tel"
                        className="h-11 !rounded-none"
                        style={{ borderColor: "var(--border-strong)" }}
                        placeholder="Same as phone or different number"
                        value={form.whatsapp}
                        onChange={(e) => {
                          setWhatsappSameAsPhone(false);
                          update("whatsapp", e.target.value);
                        }}
                        disabled={whatsappSameAsPhone}
                      />
                    </div>
                  </div>
                )}

                {current === 3 && (
                  <div className="space-y-5">
                    <div>
                      <Label
                        htmlFor="businessName"
                        className="mb-1.5 block"
                        style={{ color: "var(--text)" }}
                      >
                        Business or brand name{" "}
                        <span style={{ color: "var(--coral)" }}>*</span>
                      </Label>
                      <Input
                        id="businessName"
                        className="h-11 !rounded-none"
                        style={{ borderColor: "var(--border-strong)" }}
                        placeholder="How travelers will know you"
                        value={form.businessName}
                        onChange={(e) => {
                          const businessName = e.target.value;
                          setForm((f) => ({
                            ...f,
                            businessName,
                            brandSlug: brandSlugTouched
                              ? f.brandSlug
                              : tripPathSlug(businessName),
                          }));
                        }}
                        required
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="brandSlug"
                        className="mb-1.5 block"
                        style={{ color: "var(--text)" }}
                      >
                        Your public page{" "}
                        <span style={{ color: "var(--coral)" }}>*</span>
                      </Label>
                      <div
                        className="flex overflow-hidden !rounded-none border"
                        style={{
                          borderColor: "var(--border-strong)",
                          background: "var(--surface)",
                        }}
                      >
                        <span
                          className="hidden max-w-[50%] shrink-0 truncate border-r px-3 py-3 text-xs sm:inline-flex sm:items-center"
                          style={{
                            borderColor: "var(--border)",
                            color: "var(--text-tertiary)",
                            background: "var(--bg-secondary)",
                          }}
                          title={`${getRootDomain().includes("localhost") ? "http" : "https"}://`}
                        >
                          {getRootDomain().includes("localhost") ? "http" : "https"}
                          ://
                        </span>
                        <input
                          id="brandSlug"
                          value={form.brandSlug}
                          onChange={(e) => {
                            setBrandSlugTouched(true);
                            update("brandSlug", sanitizeSlugInput(e.target.value));
                          }}
                          onBlur={() => {
                            const check = validateBrandSlug(
                              form.brandSlug || form.businessName
                            );
                            if (check.ok) update("brandSlug", check.value);
                          }}
                          placeholder="your-brand"
                          spellCheck={false}
                          className="min-w-0 flex-1 bg-transparent px-3 py-3 font-mono text-sm outline-none"
                          style={{ color: "var(--text)" }}
                          aria-label="Brand subdomain"
                          required
                        />
                        <span
                          className="hidden shrink-0 items-center border-l px-3 py-3 text-xs sm:inline-flex"
                          style={{
                            borderColor: "var(--border)",
                            color: "var(--text-tertiary)",
                            background: "var(--bg-secondary)",
                          }}
                        >
                          .{getRootDomain()}
                        </span>
                      </div>
                      <p className="mt-1.5 text-xs sm:hidden" style={{ color: "var(--text-tertiary)" }}>
                        {(getRootDomain().includes("localhost") ? "http" : "https") +
                          "://"}
                        <span style={{ color: "var(--text)" }}>
                          {form.brandSlug || "your-brand"}
                        </span>
                        .{getRootDomain()}
                      </p>
                      {(() => {
                        const check = form.brandSlug
                          ? validateBrandSlug(form.brandSlug)
                          : null;
                        if (check && !check.ok) {
                          return (
                            <p className="mt-1.5 text-xs" style={{ color: "var(--coral)" }}>
                              {check.error}
                            </p>
                          );
                        }
                        return (
                          <p className="mt-1.5 text-xs" style={{ color: "var(--text-tertiary)" }}>
                            This becomes your tenant URL — trips live at{" "}
                            <span className="font-mono" style={{ color: "var(--text-secondary)" }}>
                              {form.brandSlug || "your-brand"}.{getRootDomain()}/trip-name
                            </span>
                            . 2–63 characters, letters, numbers, and hyphens.
                          </p>
                        );
                      })()}
                    </div>
                    <div>
                      <FileUploadZone
                        label="Brand logo"
                        description="JPG or PNG · max 5 MB"
                        accept="image/jpeg,image/png"
                        variant="image"
                        aspectRatio="video"
                        value={brandLogo}
                        onChange={(preview, file) => {
                          setBrandLogo(preview);
                          setBrandLogoFile(file ?? null);
                        }}
                      />
                      <p className="mt-1.5 text-xs" style={{ color: "var(--text-tertiary)" }}>
                        Optional
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="bio" className="mb-1.5 block" style={{ color: "var(--text)" }}>
                        About you <span style={{ color: "var(--coral)" }}>*</span>
                      </Label>
                      <Textarea
                        id="bio"
                        className="min-h-[120px] !rounded-none"
                        style={{ borderColor: "var(--border-strong)" }}
                        placeholder="Tell travelers about your experience organizing trips, where you operate, and what makes your trips unique..."
                        value={form.bio}
                        maxLength={BIO_MAX}
                        onChange={(e) => update("bio", e.target.value)}
                        required
                      />
                      <p
                        className="mt-1 text-right text-xs"
                        style={{
                          color:
                            form.bio.length >= BIO_MAX * 0.9
                              ? "var(--amber)"
                              : "var(--text-tertiary)",
                        }}
                      >
                        {form.bio.length} / {BIO_MAX}
                      </p>
                    </div>
                    <div>
                      <Label
                        className="mb-2 block"
                        style={{ color: "var(--text)" }}
                      >
                        Trip specialties{" "}
                        <span className="text-xs font-normal" style={{ color: "var(--text-tertiary)" }}>
                          (optional)
                        </span>
                      </Label>
                      <p className="mb-3 text-xs" style={{ color: "var(--text-tertiary)" }}>
                        Select the styles travelers will find on your trips.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {specialtyOptions.map((option) => {
                          const selected = specialties.includes(option.value);
                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => toggleSpecialty(option.value)}
                              className={cn(
                                "rounded-none px-3.5 py-2 text-sm font-medium transition-all",
                                selected && "shadow-sm"
                              )}
                              style={{
                                background: selected
                                  ? "var(--primary-dim)"
                                  : "var(--bg-secondary)",
                                color: selected
                                  ? "var(--primary)"
                                  : "var(--text-secondary)",
                                border: selected
                                  ? "1px solid var(--primary)"
                                  : "1px solid var(--border-strong)",
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
                )}

                {current === 4 && (
                  <div className="space-y-5">
                    <FileUploadZone
                      label="National ID card"
                      description={
                        isResubmit
                          ? "Required: upload a new, sharper photo of your Ghana Card or passport."
                          : "Front of your Ghana Card or passport photo page. JPG or PNG."
                      }
                      accept="image/*"
                      variant="image"
                      aspectRatio="video"
                      value={nationalId}
                      onChange={(preview, file) => {
                        setNationalId(preview);
                        setNationalIdFile(file ?? null);
                      }}
                    />
                    <div
                      className="flex items-start gap-2.5 rounded-xl px-4 py-3 text-xs leading-relaxed"
                      style={{
                        background: "var(--primary-dim)",
                        color: "var(--text-secondary)",
                      }}
                    >
                      <ShieldCheck
                        className="mt-0.5 h-3.5 w-3.5 shrink-0"
                        style={{ color: "var(--primary)" }}
                      />
                      Your ID is encrypted in transit and at rest. Only VaybeEx verification
                      staff can access it during the review process.
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button
                  type="button"
                  variant="ghost"
                  size="lg"
                  onClick={goPrev}
                  disabled={current === 0}
                  className="h-12 px-5 sm:w-auto"
                  style={{
                    color: "var(--text-secondary)",
                    border: "1px solid var(--border)",
                  }}
                >
                  Back
                </Button>

                {isLast ? (
                  <Button
                    type="submit"
                    size="lg"
                    disabled={!allComplete || submitting}
                    className="h-12 flex-1 text-sm font-semibold sm:min-w-[200px] sm:flex-none"
                    style={{
                      background:
                        allComplete && !submitting
                          ? "var(--gradient-brand)"
                          : "var(--border)",
                      color:
                        allComplete && !submitting
                          ? "#fbf7f1"
                          : "var(--text-tertiary)",
                      boxShadow:
                        allComplete && !submitting ? "var(--glow-gold)" : "none",
                    }}
                  >
                    <Check className="mr-1.5 h-4 w-4" />
                    {submitting
                      ? isResubmit
                        ? "Resubmitting…"
                        : "Submitting…"
                      : isResubmit
                        ? "Resubmit application"
                        : "Submit application"}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    size="lg"
                    onClick={goNext}
                    disabled={!currentStepValid}
                    className="h-12 flex-1 text-sm font-semibold sm:min-w-[200px] sm:flex-none"
                    style={{
                      background: currentStepValid ? "var(--gradient-brand)" : "var(--border)",
                      color: currentStepValid ? "#fbf7f1" : "var(--text-tertiary)",
                      boxShadow: currentStepValid ? "var(--glow-gold)" : "none",
                    }}
                  >
                    Continue
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                )}
              </div>

              {!currentStepValid && (
                <p className="mt-3 text-center text-xs" style={{ color: "var(--text-tertiary)" }}>
                  {stepHint(STEPS[current].id)}
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function OrganizerOnboardingPage() {
  return (
    <RequireOrganizerAuth>
      <OnboardingFlow />
    </RequireOrganizerAuth>
  );
}

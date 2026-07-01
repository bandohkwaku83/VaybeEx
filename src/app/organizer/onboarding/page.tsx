"use client";

import { RequireOrganizerAuth } from "@/components/auth/require-organizer-auth";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Compass,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileUploadZone } from "@/components/organizer/file-upload-zone";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import gsap from "gsap";

/* ─── Step definitions ──────────────────────────────────────────── */
const STEPS = [
  {
    id: "photo",
    title: "Profile photo",
    subtitle: "Put a face to your name",
    icon: User,
    color: "var(--primary-dim)",
    iconColor: "var(--primary)",
  },
  {
    id: "personal",
    title: "Personal details",
    subtitle: "Your name & location",
    icon: MapPin,
    color: "var(--primary-dim)",
    iconColor: "var(--primary)",
  },
  {
    id: "contact",
    title: "Contact",
    subtitle: "How travelers reach you",
    icon: Phone,
    color: "var(--primary-dim)",
    iconColor: "var(--primary)",
  },
  {
    id: "about",
    title: "Your trips",
    subtitle: "Brand & experience",
    icon: Sparkles,
    color: "var(--gold-dim)",
    iconColor: "var(--gold)",
  },
  {
    id: "verify",
    title: "Verification",
    subtitle: "Identity check",
    icon: ShieldCheck,
    color: "var(--gold-dim)",
    iconColor: "var(--gold)",
  },
] as const;

type StepId = (typeof STEPS)[number]["id"];

/* ─── Field-level validity per step ────────────────────────────── */
function stepValid(
  id: StepId,
  form: Record<string, string>,
  profilePicture: string | null,
  nationalId: string | null
): boolean {
  switch (id) {
    case "photo":    return !!profilePicture;
    case "personal": return !!form.name?.trim() && !!form.location?.trim();
    case "contact":  return !!form.phone?.trim();
    case "about":    return !!form.businessName?.trim() && !!form.bio?.trim();
    case "verify":   return !!nationalId;
  }
}

/* ─── Stepper dot bar ───────────────────────────────────────────── */
function StepperBar({
  current,
  steps,
  form,
  profilePicture,
  nationalId,
  onGo,
}: {
  current: number;
  steps: typeof STEPS;
  form: Record<string, string>;
  profilePicture: string | null;
  nationalId: string | null;
  onGo: (i: number) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-0">
      {steps.map((step, i) => {
        const Icon = step.icon;
        const done = stepValid(step.id, form, profilePicture, nationalId) && i < current;
        const active = i === current;
        const reachable = i <= current || done;

        return (
          <div key={step.id} className="flex items-center">
            {/* connector line */}
            {i > 0 && (
              <div
                className="h-px w-8 shrink-0 transition-all duration-500 sm:w-14"
                style={{
                  background:
                    i <= current
                      ? "var(--gradient-brand)"
                      : "var(--border)",
                }}
              />
            )}

            {/* step node */}
            <button
              type="button"
              onClick={() => reachable && onGo(i)}
              className="group flex flex-col items-center gap-1.5"
              style={{ cursor: reachable ? "pointer" : "default" }}
              aria-label={`Go to step: ${step.title}`}
            >
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all duration-300"
                style={{
                  borderColor: active
                    ? "var(--primary)"
                    : done
                    ? "var(--primary)"
                    : "var(--border)",
                  background: active
                    ? "var(--gradient-brand)"
                    : done
                    ? "var(--primary-dim)"
                    : "var(--surface)",
                  boxShadow: active ? "var(--glow-gold)" : "none",
                  transform: active ? "scale(1.12)" : "scale(1)",
                }}
              >
                {done ? (
                  <Check className="h-4 w-4" style={{ color: "var(--primary)" }} />
                ) : (
                  <Icon
                    className="h-4 w-4"
                    style={{ color: active ? "#fbf7f1" : "var(--text-tertiary)" }}
                  />
                )}
              </div>

              {/* label — hidden on mobile, visible sm+ */}
              <span
                className="hidden text-center text-[10px] font-semibold uppercase tracking-wider sm:block"
                style={{
                  color: active
                    ? "var(--primary)"
                    : done
                    ? "var(--text-secondary)"
                    : "var(--text-tertiary)",
                  maxWidth: 60,
                  lineHeight: 1.3,
                }}
              >
                {step.title}
              </span>
            </button>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Main onboarding flow ──────────────────────────────────────── */
function OnboardingFlow() {
  const router = useRouter();
  const { user, login } = useAuth();
  const [current, setCurrent] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    whatsapp: "",
    location: "",
    businessName: "",
    bio: "",
    specialties: "",
  });
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [nationalId, setNationalId] = useState<string | null>(null);

  /* Pre-fill from auth */
  useEffect(() => {
    if (user) {
      if (user.organizerStatus === "pending") {
        router.replace("/organizer/pending");
        return;
      }
      setForm((prev) => ({
        ...prev,
        name: prev.name || user.name || "",
        email: prev.email || user.email || "",
      }));
    }
  }, [user, router]);

  const update = (field: string, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  /* Progress */
  const completedCount = STEPS.filter((s) =>
    stepValid(s.id, form, profilePicture, nationalId)
  ).length;
  const progressPct = Math.round((completedCount / STEPS.length) * 100);
  const currentStepValid = stepValid(
    STEPS[current].id,
    form,
    profilePicture,
    nationalId
  );
  const allComplete = completedCount === STEPS.length;

  /* Animated panel transition */
  const animateTo = (nextIdx: number) => {
    const el = panelRef.current;
    if (!el) { setCurrent(nextIdx); return; }
    const dir = nextIdx > current ? 1 : -1;
    gsap.fromTo(
      el,
      { opacity: 0, x: dir * 40 },
      {
        opacity: 1,
        x: 0,
        duration: 0.38,
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
  const goTo  = (i: number) => {
    if (i !== current) animateTo(i);
  };

  /* Submit */
  const finish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allComplete) return;
    if (user) {
      login({
        name: form.name.trim(),
        email: form.email || user.email,
        organizerStatus: "pending",
      });
    }
    toast.success("Application submitted! We'll notify you once approved.");
    router.push("/organizer/pending");
  };

  const isLast = current === STEPS.length - 1;

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>

      {/* ── Sticky header ──────────────────────────────────────── */}
      <div
        className="sticky top-0 z-30 border-b backdrop-blur-md"
        style={{
          borderColor: "var(--border)",
          background: "rgba(251,247,241,0.93)",
        }}
      >
        <div className="mx-auto max-w-2xl px-4 py-4">
          {/* logo row */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-xl"
                style={{
                  background: "var(--gradient-brand)",
                  boxShadow: "var(--glow-gold)",
                }}
              >
                <Compass className="h-4 w-4" style={{ color: "#fbf7f1" }} />
              </div>
              <div>
                <p
                  className="font-display text-sm font-bold"
                  style={{ color: "var(--text)" }}
                >
                  Organizer setup
                </p>
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  {STEPS[current].subtitle}
                </p>
              </div>
            </div>
            <span
              className="font-display text-sm font-bold"
              style={{ color: "var(--primary)" }}
            >
              {progressPct}%
            </span>
          </div>

          {/* thin progress bar */}
          <div
            className="mb-4 h-1 w-full overflow-hidden rounded-full"
            style={{ background: "var(--border)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${progressPct}%`,
                background: "var(--gradient-brand)",
              }}
            />
          </div>

          {/* stepper dots */}
          <StepperBar
            current={current}
            steps={STEPS}
            form={form}
            profilePicture={profilePicture}
            nationalId={nationalId}
            onGo={goTo}
          />
        </div>
      </div>

      {/* ── Step panel ─────────────────────────────────────────── */}
      <form onSubmit={finish}>
        <div
          ref={panelRef}
          className="mx-auto max-w-2xl px-4 py-10"
        >
          {/* Step header */}
          <div className="mb-8 flex items-center gap-4">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
              style={{
                background: STEPS[current].color,
                boxShadow:
                  current >= 3
                    ? "var(--glow-gold)"
                    : "var(--shadow-glow-teal)",
              }}
            >
              {(() => {
                const Icon = STEPS[current].icon;
                return (
                  <Icon
                    className="h-5 w-5"
                    style={{ color: STEPS[current].iconColor }}
                  />
                );
              })()}
            </div>
            <div>
              <p
                className="text-xs font-bold uppercase tracking-[0.18em]"
                style={{ color: "var(--gold)" }}
              >
                Step {current + 1} of {STEPS.length}
              </p>
              <h2
                className="font-display text-2xl font-bold"
                style={{ color: "var(--text)" }}
              >
                {STEPS[current].title}
              </h2>
            </div>
          </div>

          {/* ── Step content ───────────────────────────────────── */}
          <div
            className="rounded-2xl border p-6 sm:p-8"
            style={{
              borderColor: "var(--border)",
              background: "var(--surface)",
            }}
          >

            {/* STEP 1 — Photo */}
            {current === 0 && (
              <div className="flex flex-col items-center gap-4">
                <p
                  className="max-w-sm text-center text-sm leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                >
                  A clear photo helps travelers recognize and trust you. It
                  appears on your public organizer profile and trip listings.
                </p>
                <FileUploadZone
                  label="Profile picture"
                  description="JPG or PNG · max 5 MB"
                  accept="image/*"
                  variant="image"
                  aspectRatio="square"
                  value={profilePicture}
                  onChange={setProfilePicture}
                  className="mx-auto max-w-[180px]"
                />
              </div>
            )}

            {/* STEP 2 — Personal details */}
            {current === 1 && (
              <div className="space-y-5">
                <div>
                  <Label
                    htmlFor="name"
                    style={{ color: "var(--text)", display: "block", marginBottom: 6 }}
                  >
                    Full name <span style={{ color: "var(--coral)" }}>*</span>
                  </Label>
                  <Input
                    id="name"
                    className="h-11 rounded-xl"
                    style={{ borderColor: "var(--border-strong)" }}
                    placeholder="Your full name"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label
                    htmlFor="location"
                    style={{ color: "var(--text)", display: "block", marginBottom: 6 }}
                  >
                    Location <span style={{ color: "var(--coral)" }}>*</span>
                  </Label>
                  <Input
                    id="location"
                    className="h-11 rounded-xl"
                    style={{ borderColor: "var(--border-strong)" }}
                    placeholder="City, Country (e.g. Accra, Ghana)"
                    value={form.location}
                    onChange={(e) => update("location", e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {/* STEP 3 — Contact */}
            {current === 2 && (
              <div className="space-y-5">
                <div>
                  <Label
                    htmlFor="email"
                    style={{ color: "var(--text)", display: "block", marginBottom: 6 }}
                  >
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    className="h-11 rounded-xl"
                    style={{
                      borderColor: "var(--border)",
                      background: "var(--bg-secondary)",
                      color: "var(--text-secondary)",
                    }}
                    value={form.email}
                    readOnly
                  />
                  <p
                    className="mt-1 text-xs"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    Verified during sign-up · cannot be changed here
                  </p>
                </div>
                <div>
                  <Label
                    htmlFor="phone"
                    style={{ color: "var(--text)", display: "block", marginBottom: 6 }}
                  >
                    Phone number <span style={{ color: "var(--coral)" }}>*</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    className="h-11 rounded-xl"
                    style={{ borderColor: "var(--border-strong)" }}
                    placeholder="+233 XX XXX XXXX"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label
                    htmlFor="whatsapp"
                    style={{ color: "var(--text)", display: "block", marginBottom: 6 }}
                  >
                    WhatsApp{" "}
                    <span
                      className="text-xs font-normal"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      (optional)
                    </span>
                  </Label>
                  <Input
                    id="whatsapp"
                    type="tel"
                    className="h-11 rounded-xl"
                    style={{ borderColor: "var(--border-strong)" }}
                    placeholder="Same as phone or different number"
                    value={form.whatsapp}
                    onChange={(e) => update("whatsapp", e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* STEP 4 — About your trips */}
            {current === 3 && (
              <div className="space-y-5">
                <div>
                  <Label
                    htmlFor="businessName"
                    style={{ color: "var(--text)", display: "block", marginBottom: 6 }}
                  >
                    Business or brand name{" "}
                    <span style={{ color: "var(--coral)" }}>*</span>
                  </Label>
                  <Input
                    id="businessName"
                    className="h-11 rounded-xl"
                    style={{ borderColor: "var(--border-strong)" }}
                    placeholder="How travelers will know you"
                    value={form.businessName}
                    onChange={(e) => update("businessName", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label
                    htmlFor="bio"
                    style={{ color: "var(--text)", display: "block", marginBottom: 6 }}
                  >
                    About you <span style={{ color: "var(--coral)" }}>*</span>
                  </Label>
                  <Textarea
                    id="bio"
                    className="min-h-[110px] rounded-xl"
                    style={{ borderColor: "var(--border-strong)" }}
                    placeholder="Tell travelers about your experience organizing trips, where you operate, and what makes your trips unique..."
                    value={form.bio}
                    onChange={(e) => update("bio", e.target.value)}
                    required
                  />
                  <p
                    className="mt-1 text-right text-xs"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    {form.bio.length} / 500
                  </p>
                </div>
                <div>
                  <Label
                    htmlFor="specialties"
                    style={{ color: "var(--text)", display: "block", marginBottom: 6 }}
                  >
                    Trip specialties{" "}
                    <span
                      className="text-xs font-normal"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      (optional)
                    </span>
                  </Label>
                  <Input
                    id="specialties"
                    className="h-11 rounded-xl"
                    style={{ borderColor: "var(--border-strong)" }}
                    placeholder="e.g. Adventure, cultural tours, beach getaways"
                    value={form.specialties}
                    onChange={(e) => update("specialties", e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* STEP 5 — Identity verification */}
            {current === 4 && (
              <div className="space-y-5">
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Upload a clear photo of the front of your national ID card.
                  This is a one-time check — your ID is never shared with
                  travelers.
                </p>
                <FileUploadZone
                  label="National ID card"
                  description="Front of your Ghana Card or passport photo page. JPG or PNG."
                  accept="image/*"
                  variant="image"
                  aspectRatio="video"
                  value={nationalId}
                  onChange={setNationalId}
                />
                <div
                  className="flex items-start gap-2.5 rounded-xl px-4 py-3 text-xs"
                  style={{
                    background: "var(--primary-dim)",
                    color: "var(--text-secondary)",
                  }}
                >
                  <ShieldCheck
                    className="mt-0.5 h-3.5 w-3.5 shrink-0"
                    style={{ color: "var(--primary)" }}
                  />
                  Your ID is encrypted in transit and at rest. Only VaybeEx
                  verification staff can access it during the review process.
                </div>
              </div>
            )}
          </div>

          {/* ── Navigation row ──────────────────────────────────── */}
          <div className="mt-6 flex items-center justify-between gap-3">
            {/* Back */}
            <Button
              type="button"
              variant="ghost"
              size="lg"
              onClick={goPrev}
              disabled={current === 0}
              className="h-12 rounded-xl px-5"
              style={{
                color: "var(--text-secondary)",
                border: "1px solid var(--border)",
                background: "transparent",
              }}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back
            </Button>

            {/* Step counter on mobile */}
            <span
              className="text-xs font-semibold sm:hidden"
              style={{ color: "var(--text-tertiary)" }}
            >
              {current + 1} / {STEPS.length}
            </span>

            {/* Next / Submit */}
            {isLast ? (
              <Button
                type="submit"
                size="lg"
                disabled={!allComplete}
                className="h-12 flex-1 rounded-xl text-sm font-semibold sm:flex-none sm:px-10"
                style={{
                  background: allComplete
                    ? "var(--gradient-brand)"
                    : "var(--border)",
                  color: allComplete ? "#fbf7f1" : "var(--text-tertiary)",
                  boxShadow: allComplete ? "var(--glow-gold)" : "none",
                  transition: "all 0.25s ease",
                }}
              >
                <Check className="mr-1.5 h-4 w-4" />
                Submit application
              </Button>
            ) : (
              <Button
                type="button"
                size="lg"
                onClick={goNext}
                disabled={!currentStepValid}
                className="h-12 flex-1 rounded-xl text-sm font-semibold sm:flex-none sm:px-10"
                style={{
                  background: currentStepValid
                    ? "var(--gradient-brand)"
                    : "var(--border)",
                  color: currentStepValid ? "#fbf7f1" : "var(--text-tertiary)",
                  boxShadow: currentStepValid ? "var(--glow-gold)" : "none",
                  transition: "all 0.25s ease",
                }}
              >
                Continue
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            )}
          </div>

          {/* ── Step validation hint ──────────────────────────── */}
          {!currentStepValid && (
            <p
              className="mt-3 text-center text-xs"
              style={{ color: "var(--text-tertiary)" }}
            >
              {current === 0 && "Upload a profile photo to continue"}
              {current === 1 && "Enter your full name and location to continue"}
              {current === 2 && "Enter a phone number to continue"}
              {current === 3 && "Add your business name and bio to continue"}
              {current === 4 && "Upload your ID to submit"}
            </p>
          )}

          {/* ── Overview of all steps at the bottom ──────────── */}
          <div
            className="mt-10 rounded-2xl border p-5"
            style={{
              borderColor: "var(--border)",
              background: "var(--surface)",
            }}
          >
            <p
              className="mb-4 text-xs font-bold uppercase tracking-[0.18em]"
              style={{ color: "var(--text-tertiary)" }}
            >
              All steps
            </p>
            <div className="space-y-3">
              {STEPS.map((step, i) => {
                const Icon = step.icon;
                const done = stepValid(
                  step.id,
                  form,
                  profilePicture,
                  nationalId
                );
                const active = i === current;
                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => goTo(i)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-150"
                    style={{
                      background: active
                        ? "var(--primary-dim)"
                        : "transparent",
                      cursor: "pointer",
                    }}
                  >
                    {/* status circle */}
                    <div
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all duration-300"
                      style={{
                        borderColor: active
                          ? "var(--primary)"
                          : done
                          ? "var(--primary)"
                          : "var(--border)",
                        background: done
                          ? "var(--primary-dim)"
                          : "transparent",
                      }}
                    >
                      {done ? (
                        <Check
                          className="h-3.5 w-3.5"
                          style={{ color: "var(--primary)" }}
                        />
                      ) : (
                        <Icon
                          className="h-3.5 w-3.5"
                          style={{
                            color: active
                              ? "var(--primary)"
                              : "var(--text-tertiary)",
                          }}
                        />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
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
                        {step.title}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: "var(--text-tertiary)" }}
                      >
                        {step.subtitle}
                      </p>
                    </div>

                    {done && !active && (
                      <span
                        className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
                        style={{
                          background: "var(--primary-dim)",
                          color: "var(--primary)",
                        }}
                      >
                        Done
                      </span>
                    )}
                    {active && (
                      <span
                        className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
                        style={{
                          background: "var(--gradient-brand)",
                          color: "#fbf7f1",
                        }}
                      >
                        Current
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </form>
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
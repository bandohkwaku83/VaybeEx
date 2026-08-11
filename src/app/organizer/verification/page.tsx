"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Loader2, Mail, RefreshCw } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { RequireOrganizerAuth } from "@/components/auth/require-organizer-auth";
import { useAuth } from "@/hooks/use-auth";
import {
  kycFromAuthUser,
  nextOrganizerRoute,
  ORGANIZER_DASHBOARD_PATH,
  ORGANIZER_SETUP_PATH,
} from "@/lib/organizer-kyc";
import { cn } from "@/lib/utils";

const POLL_MS = 45_000;
const SUPPORT_EMAIL = "support@vaybeex.com";

const STEPS = [
  { id: "account", label: "Account created" },
  { id: "profile", label: "Profile submitted" },
  { id: "review", label: "Admin review" },
  { id: "live", label: "Portal unlocked" },
] as const;

function VerificationContent() {
  const router = useRouter();
  const { user, refreshOrganizerSession, isLoading: authLoading } = useAuth();
  const [checking, setChecking] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshStatus = useCallback(async () => {
    try {
      const kyc = await refreshOrganizerSession();
      if (!kyc) return;
      if (kyc.canPublish || kyc.status === "approved") {
        router.replace(ORGANIZER_DASHBOARD_PATH);
        return;
      }
      const dest = nextOrganizerRoute(kyc);
      if (dest !== "/organizer/verification") {
        router.replace(dest);
      }
    } catch {
      setError("Could not refresh your approval status.");
    } finally {
      setChecking(false);
      setRefreshing(false);
    }
  }, [refreshOrganizerSession, router]);

  useEffect(() => {
    if (authLoading || !user) return;

    const kyc = kycFromAuthUser(user);
    if (kyc.canPublish || kyc.status === "approved") {
      router.replace(ORGANIZER_DASHBOARD_PATH);
      return;
    }
    if (!kyc.onboardingCompleted || kyc.status === "rejected") {
      router.replace(ORGANIZER_SETUP_PATH);
    }
  }, [
    authLoading,
    user,
    router,
  ]);

  useEffect(() => {
    if (authLoading || !user) return;
    const kyc = kycFromAuthUser(user);
    if (kyc.status !== "pending") return;
    void refreshStatus();
    // One network check after auth hydrates; polling/focus handles the rest.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading]);

  useEffect(() => {
    if (authLoading) return;
    const kyc = kycFromAuthUser(user);
    if (kyc.status !== "pending") return;

    const id = window.setInterval(() => {
      void refreshStatus();
    }, POLL_MS);

    const onFocus = () => void refreshStatus();
    const onVisibility = () => {
      if (document.visibilityState === "visible") onFocus();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.clearInterval(id);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [authLoading, user, refreshStatus]);

  if (authLoading || checking) {
    return (
      <div
        className="flex min-h-screen items-center justify-center gap-2"
        style={{ background: "var(--bg)", color: "var(--text-secondary)" }}
      >
        <Loader2 className="h-5 w-5 animate-spin" style={{ color: "var(--primary)" }} />
        Checking your approval status…
      </div>
    );
  }

  const kyc = kycFromAuthUser(user);
  const isResubmit = kyc.resubmissionCount > 0;
  const activeStep = 2;

  return (
    <div className="flex min-h-screen flex-col lg:flex-row" style={{ background: "var(--bg)" }}>
      <div className="relative h-36 shrink-0 overflow-hidden lg:hidden">
        <Image
          src="/images/city-from-high.jpg"
          alt="Ghana cityscape from above"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(42,27,15,0.35) 0%, rgba(251,247,241,1) 95%)",
          }}
        />
        <div className="absolute bottom-4 left-5">
          <BrandLogo
            size="sm"
            withWordmark
            wordmarkClassName="text-lg"
            wordmarkStyle={{ color: "var(--text)" }}
          />
        </div>
      </div>

      <div className="relative flex flex-1 flex-col justify-center px-5 py-10 sm:px-10 lg:px-14 xl:px-20">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 10% 0%, rgba(196,134,76,0.12), transparent 55%)",
          }}
        />

        <div className="relative mx-auto w-full max-w-lg animate-[fade-up_0.7s_cubic-bezier(0.16,1,0.3,1)_both]">
          <Link href="/organizer" className="mb-10 hidden lg:block">
            <BrandLogo
              size="lg"
              withWordmark
              wordmarkClassName="text-xl"
              wordmarkStyle={{ color: "var(--text)" }}
              subline="Organizer portal"
            />
          </Link>

          <div className="flex items-center gap-3">
            <span
              className="relative inline-flex h-2.5 w-2.5 rounded-full"
              style={{
                background: "var(--gold)",
                boxShadow: "0 0 0 6px rgba(196,134,76,0.16)",
              }}
            >
              <span
                className="absolute inset-0 animate-ping rounded-full opacity-40"
                style={{ background: "var(--gold)" }}
              />
            </span>
            <p
              className="text-xs font-semibold uppercase tracking-[0.2em]"
              style={{ color: "var(--gold)" }}
            >
              {isResubmit ? "Update in review" : "In review"}
            </p>
          </div>

          <h1
            className="font-display mt-4 text-[2rem] font-bold leading-[1.15] tracking-tight sm:text-4xl"
            style={{ color: "var(--text)" }}
          >
            {isResubmit ? "We’re reviewing your update" : "Almost ready to host trips"}
          </h1>

          <p className="mt-4 max-w-md text-[15px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            {isResubmit
              ? "We received your update and are reviewing it again. We’ll email you when there’s a decision."
              : "Your profile is under review. We’ll email you when there’s a decision — then your portal unlocks and you can publish trips."}
          </p>

          <ol className="mt-9 space-y-0">
            {STEPS.map((step, index) => {
              const done = index < activeStep;
              const current = index === activeStep;
              const locked = index > activeStep;

              return (
                <li key={step.id} className="relative flex gap-4 pb-6 last:pb-0">
                  {index < STEPS.length - 1 && (
                    <span
                      className="absolute left-[15px] top-8 h-[calc(100%-1.25rem)] w-px"
                      style={{
                        background: done ? "var(--primary)" : "var(--border)",
                      }}
                    />
                  )}
                  <span
                    className="relative z-[1] flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                    style={{
                      background: done
                        ? "var(--primary)"
                        : current
                          ? "rgba(196,134,76,0.16)"
                          : "var(--surface-raised)",
                      color: done
                        ? "#fbf7f1"
                        : current
                          ? "var(--gold)"
                          : "var(--text-tertiary)",
                      boxShadow: current ? "0 0 0 4px rgba(196,134,76,0.12)" : undefined,
                      border: locked || current ? "1px solid var(--border)" : undefined,
                    }}
                  >
                    {done ? (
                      <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                    ) : (
                      index + 1
                    )}
                  </span>
                  <div className="min-w-0 pt-1">
                    <p
                      className="text-sm font-semibold"
                      style={{
                        color: locked ? "var(--text-tertiary)" : "var(--text)",
                      }}
                    >
                      {step.label}
                    </p>
                    {current && (
                      <p className="mt-0.5 text-xs" style={{ color: "var(--text-tertiary)" }}>
                        Usually takes 1–2 business days
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>

          {error && (
            <p className="mt-4 text-sm" style={{ color: "var(--coral)" }}>
              {error}
            </p>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              disabled={refreshing}
              onClick={() => {
                setRefreshing(true);
                setError(null);
                void refreshStatus();
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-opacity disabled:opacity-70"
              style={{
                background: "var(--primary)",
                color: "#fbf7f1",
                boxShadow: "var(--glow-teal)",
              }}
            >
              {refreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              {refreshing ? "Checking…" : "Check status"}
            </button>

            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="inline-flex items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold transition-colors hover:bg-[var(--surface-raised)]"
              style={{
                borderColor: "var(--border-strong)",
                color: "var(--text)",
              }}
            >
              <Mail className="h-4 w-4" style={{ color: "var(--gold)" }} />
              Contact support
            </a>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 border-t pt-6" style={{ borderColor: "var(--border)" }}>
            <Link
              href="/organizer/login"
              className="text-sm font-medium transition-colors hover:text-[var(--primary)]"
              style={{ color: "var(--text-secondary)" }}
            >
              Sign out / use another account
            </Link>
            <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
              Auto-refreshes every {POLL_MS / 1000}s, or when you return to this tab
            </p>
          </div>
        </div>
      </div>

      <div className="relative hidden min-h-screen flex-1 overflow-hidden lg:block">
        <Image
          src="/images/city-from-high.jpg"
          alt="Aerial view over a Ghanaian city"
          fill
          priority
          className="object-cover"
          sizes="50vw"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(165deg, rgba(42,27,15,0.58) 0%, rgba(74,42,18,0.32) 42%, rgba(42,27,15,0.78) 100%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(251,247,241,0.07) 1px, transparent 1px)",
            backgroundSize: "26px 26px",
          }}
        />

        <div className="relative flex h-full flex-col justify-between p-10 xl:p-14">
          <div
            className="inline-flex w-fit items-center gap-2.5 rounded-full border px-4 py-2 text-xs font-medium backdrop-blur-md"
            style={{
              borderColor: "rgba(251,247,241,0.2)",
              background: "rgba(251,247,241,0.1)",
              color: "rgba(251,247,241,0.92)",
            }}
          >
            <span
              className={cn("h-1.5 w-1.5 animate-pulse rounded-none")}
              style={{ background: "#e8b87a" }}
            />
            Verification in progress
          </div>

          <div className="animate-[fade-up_0.9s_cubic-bezier(0.16,1,0.3,1)_both]">
            <p
              className="font-display max-w-md text-3xl font-bold leading-snug xl:text-[2.5rem]"
              style={{ color: "#fbf7f1" }}
            >
              Good trips start with trusted organizers.
            </p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed" style={{ color: "rgba(251,247,241,0.62)" }}>
              We’re confirming your details so travelers can book with confidence. You’ll get full access the moment you’re approved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrganizerVerificationPage() {
  return (
    <RequireOrganizerAuth>
      <VerificationContent />
    </RequireOrganizerAuth>
  );
}

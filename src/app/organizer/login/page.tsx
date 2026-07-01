"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Compass,
  Eye,
  EyeOff,
  LogIn,
  ShieldCheck,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import gsap from "gsap";
import { GoogleSignInButton } from "@/components/organizer/google-sign-in-button";
import { OrganizerLandingHeader } from "@/components/organizer/landing-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { sendOrganizerOtp } from "@/lib/organizer-auth-mock";

const MOCK_GOOGLE_USER = {
  name: "Alex Morgan",
  email: "alex.morgan@gmail.com",
};

/* ─────────────────────────────────────────────────────────────────
   HOW THE SLIDING OVERLAY WORKS (fixed version)
   ─────────────────────────────────────────────────────────────────
   The container is split into two halves: LEFT = Sign In, RIGHT = Sign Up.
   The coloured overlay panel is always 50% wide.

   progress = 0  →  sign-in mode
     overlay translateX = 100%  (sitting over the RIGHT / sign-up half, hiding it)
     Sign In panel fully visible on the left
     Sign Up panel hidden under the overlay on the right

   progress = 1  →  sign-up mode
     overlay translateX = 0%    (sitting over the LEFT / sign-in half, hiding it)
     Sign Up panel fully visible on the right
     Sign In panel hidden under the overlay on the left

   This is the OPPOSITE of what the original code did.
   Original: overlayXPercent = progress * 100
             → progress 0 = translateX(0%)  = covers LEFT (sign-in) ← BUG
   Fixed:    overlayXPercent = (1 - progress) * 100
             → progress 0 = translateX(100%) = covers RIGHT (sign-up) ← correct
────────────────────────────────────────────────────────────────── */

function OrganizerLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialIsSignup = searchParams.get("mode") === "signup";
  const [isSignup, setIsSignup] = useState(initialIsSignup);

  /* progress: 0 = sign-in mode, 1 = sign-up mode */
  const [progress, setProgress] = useState(initialIsSignup ? 1 : 0);

  const redirect =
    searchParams.get("redirect") ??
    (isSignup ? "/organizer/onboarding" : "/organizer/dashboard");

  const passwordValid = password.length >= 8;
  const canSubmitEmail =
    email.trim() &&
    password.trim() &&
    passwordValid &&
    (!isSignup || name.trim()) &&
    !isSubmitting;

  const progressRef = useRef({ value: initialIsSignup ? 1 : 0 });
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  const slideTo = (toSignup: boolean) => {
    if (toSignup === isSignup) return;
    setIsSignup(toSignup);
    tweenRef.current?.kill();
    tweenRef.current = gsap.to(progressRef.current, {
      value: toSignup ? 1 : 0,
      duration: 0.65,
      ease: "power3.inOut",
      onUpdate: () => setProgress(progressRef.current.value),
    });
  };

  useEffect(() => {
    return () => {
      tweenRef.current?.kill();
    };
  }, []);

  /* ── Derived visual values ──────────────────────────────────────
     KEY FIX: overlay moves RIGHT when progress=0 (sign-in mode)
     so it covers the sign-up half, not the sign-in half.
  ─────────────────────────────────────────────────────────────── */
  const overlayXPercent = (1 - progress) * 100; // 0→100%, 1→0%
  const signInOpacity = 1 - progress;            // visible when progress=0
  const signUpOpacity = progress;                // visible when progress=1
  /* The two "faces" of the overlay */
  const welcomeFaceOpacity = 1 - progress;       // "New to VaybeEx?" — shown when sign-in
  const joinFaceOpacity = progress;              // "Already an organizer?" — shown when sign-up

  const handleGoogleSignIn = () => {
    login(MOCK_GOOGLE_USER);
    toast.success(isSignup ? "Google account connected!" : "Welcome back!");
    router.push(redirect);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmitEmail) return;
    setIsSubmitting(true);

    if (isSignup) {
      sendOrganizerOtp(email.trim());
      toast.success("Verification code sent to your email");
      router.push(
        `/organizer/verify?email=${encodeURIComponent(email.trim())}&redirect=${encodeURIComponent(redirect)}`
      );
      return;
    }

    login({ name: email.split("@")[0] ?? "Organizer", email: email.trim() });
    toast.success("Welcome back!");
    router.push(redirect);
  };

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <div
        className="relative mx-auto w-full max-w-5xl overflow-hidden rounded-[2rem] border"
        style={{
          /* min-height instead of fixed height so sign-up form never clips */
          minHeight: "620px",
          borderColor: "var(--border)",
          background: "var(--surface)",
          boxShadow:
            "0 24px 60px -20px rgba(86,47,24,0.22), 0 0 0 1px rgba(107,63,29,0.08)",
        }}
      >
        {/* ── Two panels side by side ─────────────────────────── */}
        <div className="absolute inset-0 grid grid-cols-2">

          {/* LEFT: Sign In panel */}
          <div
            className="flex flex-col justify-center overflow-y-auto px-10 py-12 sm:px-14"
            style={{
              opacity: signInOpacity,
              /* pointer-events off while hidden under overlay */
              pointerEvents: progress > 0.5 ? "none" : "auto",
              transition: "none", /* opacity driven by GSAP via progress */
            }}
          >
            <div
              className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl"
              style={{
                background: "var(--gradient-brand)",
                boxShadow: "var(--glow-gold)",
              }}
            >
              <LogIn className="h-5 w-5" style={{ color: "#fbf7f1" }} />
            </div>

            <h2
              className="font-display text-center text-2xl font-bold"
              style={{ color: "var(--text)" }}
            >
              Sign in to your portal
            </h2>
            <p
              className="mt-2 text-center text-sm leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              Access your dashboard, manage trips, and track payouts.
            </p>

            <div className="mt-6">
              <GoogleSignInButton
                onClick={handleGoogleSignIn}
                disabled={isSubmitting}
              />
            </div>

            <div className="relative my-5 flex items-center">
              <span className="h-px flex-1" style={{ background: "var(--border)" }} />
              <span
                className="px-3 text-xs font-medium uppercase tracking-wider"
                style={{ color: "var(--text-tertiary)" }}
              >
                or with email
              </span>
              <span className="h-px flex-1" style={{ background: "var(--border)" }} />
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <Label
                  htmlFor="signin-email"
                  style={{ color: "var(--text)", display: "block", marginBottom: 6 }}
                >
                  Email
                </Label>
                <Input
                  id="signin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="h-11 rounded-xl"
                  style={{ borderColor: "var(--border-strong)" }}
                  autoComplete="email"
                  tabIndex={progress > 0.5 ? -1 : 0}
                />
              </div>

              <div>
                <Label
                  htmlFor="signin-password"
                  style={{ color: "var(--text)", display: "block", marginBottom: 6 }}
                >
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="signin-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Your password"
                    className="h-11 rounded-xl pr-10"
                    style={{ borderColor: "var(--border-strong)" }}
                    autoComplete="current-password"
                    tabIndex={progress > 0.5 ? -1 : 0}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--text-tertiary)" }}
                    onClick={() => setShowPassword((v) => !v)}
                    tabIndex={progress > 0.5 ? -1 : 0}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <div className="mt-2 text-right">
                  <button
                    type="button"
                    className="text-xs font-medium"
                    style={{ color: "var(--primary)" }}
                    tabIndex={progress > 0.5 ? -1 : 0}
                  >
                    Forgot password?
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={!email.trim() || !password.trim() || isSubmitting}
                className="h-12 w-full rounded-xl text-sm font-semibold"
                style={{
                  background: "var(--gradient-brand)",
                  color: "#fbf7f1",
                  boxShadow: "var(--glow-gold)",
                }}
              >
                <LogIn className="mr-1.5 h-4 w-4" />
                Sign in
              </Button>
            </form>
          </div>

          {/* RIGHT: Sign Up panel */}
          <div
            className="flex flex-col justify-center overflow-y-auto px-10 py-12 sm:px-14"
            style={{
              opacity: signUpOpacity,
              pointerEvents: progress < 0.5 ? "none" : "auto",
              transition: "none",
            }}
          >
            <div
              className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl"
              style={{
                background: "var(--gradient-brand)",
                boxShadow: "var(--glow-gold)",
              }}
            >
              <UserPlus className="h-5 w-5" style={{ color: "#fbf7f1" }} />
            </div>

            <h2
              className="font-display text-center text-2xl font-bold"
              style={{ color: "var(--text)" }}
            >
              Create organizer account
            </h2>
            <p
              className="mt-2 text-center text-sm leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              We&apos;ll verify your email before profile setup.
            </p>

            <div className="mt-6">
              <GoogleSignInButton
                onClick={handleGoogleSignIn}
                disabled={isSubmitting}
              />
            </div>

            <div className="relative my-5 flex items-center">
              <span className="h-px flex-1" style={{ background: "var(--border)" }} />
              <span
                className="px-3 text-xs font-medium uppercase tracking-wider"
                style={{ color: "var(--text-tertiary)" }}
              >
                or with email
              </span>
              <span className="h-px flex-1" style={{ background: "var(--border)" }} />
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <Label
                  htmlFor="signup-name"
                  style={{ color: "var(--text)", display: "block", marginBottom: 6 }}
                >
                  Full name
                </Label>
                <Input
                  id="signup-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="h-11 rounded-xl"
                  style={{ borderColor: "var(--border-strong)" }}
                  autoComplete="name"
                  tabIndex={progress < 0.5 ? -1 : 0}
                />
              </div>

              <div>
                <Label
                  htmlFor="signup-email"
                  style={{ color: "var(--text)", display: "block", marginBottom: 6 }}
                >
                  Email
                </Label>
                <Input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="h-11 rounded-xl"
                  style={{ borderColor: "var(--border-strong)" }}
                  autoComplete="email"
                  tabIndex={progress < 0.5 ? -1 : 0}
                />
              </div>

              <div>
                <Label
                  htmlFor="signup-password"
                  style={{ color: "var(--text)", display: "block", marginBottom: 6 }}
                >
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="h-11 rounded-xl pr-10"
                    style={{ borderColor: "var(--border-strong)" }}
                    autoComplete="new-password"
                    minLength={8}
                    tabIndex={progress < 0.5 ? -1 : 0}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--text-tertiary)" }}
                    onClick={() => setShowPassword((v) => !v)}
                    tabIndex={progress < 0.5 ? -1 : 0}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {password && !passwordValid && (
                  <p
                    className="mt-1.5 text-xs"
                    style={{ color: "var(--amber)" }}
                  >
                    Password must be at least 8 characters
                  </p>
                )}
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={!canSubmitEmail}
                className="h-12 w-full rounded-xl text-sm font-semibold"
                style={{
                  background: "var(--gradient-brand)",
                  color: "#fbf7f1",
                  boxShadow: "var(--glow-gold)",
                }}
              >
                <UserPlus className="mr-1.5 h-4 w-4" />
                Create account
              </Button>
            </form>
          </div>
        </div>

        {/* ── Sliding overlay panel ────────────────────────────────
            Sits over one half at a time.
            translateX(100%) = covers RIGHT (sign-up) = sign-in mode
            translateX(0%)   = covers LEFT  (sign-in) = sign-up mode
        ─────────────────────────────────────────────────────────── */}
        <div
          className="absolute inset-y-0 left-0 flex w-1/2 items-center justify-center overflow-hidden px-10 text-center"
          style={{
            background: "var(--gradient-teal)",
            zIndex: 10,
            transform: `translateX(${overlayXPercent}%)`,
            willChange: "transform",
          }}
        >
          {/* dot-grid texture */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(251,247,241,0.13) 1px, transparent 1px)",
              backgroundSize: "26px 26px",
            }}
          />
          {/* ambient glow blob */}
          <div
            className="pointer-events-none absolute -bottom-20 -right-20 h-56 w-56 rounded-full opacity-30 blur-3xl"
            style={{ background: "var(--gold)" }}
          />
          <div
            className="pointer-events-none absolute -left-16 -top-16 h-40 w-40 rounded-full opacity-20 blur-2xl"
            style={{ background: "var(--primary)" }}
          />

          <div className="relative h-full w-full">

            {/* Face A: shown when overlay is on the RIGHT (sign-in mode)
                "New to VaybeEx?" — prompts the user to sign up */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center"
              style={{
                opacity: welcomeFaceOpacity,
                pointerEvents: progress > 0.5 ? "none" : "auto",
              }}
            >
              <div
                className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl"
                style={{
                  background: "rgba(251,247,241,0.12)",
                  border: "1px solid rgba(251,247,241,0.22)",
                }}
              >
                <Compass
                  className="h-5 w-5"
                  style={{ color: "var(--gold)" }}
                />
              </div>
              <h3
                className="font-display text-3xl font-bold leading-tight"
                style={{ color: "#fbf7f1" }}
              >
                New to VaybeEx?
              </h3>
              <p
                className="mt-3 max-w-[22ch] text-sm leading-relaxed"
                style={{ color: "rgba(251,247,241,0.72)" }}
              >
                Create an organizer account and start listing trips travelers
                across Ghana and West Africa are already searching for.
              </p>
              <button
                type="button"
                onClick={() => slideTo(true)}
                className="mt-7 rounded-xl border px-7 py-3 text-sm font-semibold transition-all duration-200 hover:bg-[rgba(251,247,241,0.1)]"
                style={{
                  borderColor: "rgba(251,247,241,0.38)",
                  color: "#fbf7f1",
                }}
              >
                Create account →
              </button>
            </div>

            {/* Face B: shown when overlay is on the LEFT (sign-up mode)
                "Already an organizer?" — prompts the user to sign in */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center"
              style={{
                opacity: joinFaceOpacity,
                pointerEvents: progress < 0.5 ? "none" : "auto",
              }}
            >
              <div
                className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl"
                style={{
                  background: "rgba(251,247,241,0.12)",
                  border: "1px solid rgba(251,247,241,0.22)",
                }}
              >
                <ShieldCheck
                  className="h-5 w-5"
                  style={{ color: "var(--gold)" }}
                />
              </div>
              <h3
                className="font-display text-3xl font-bold leading-tight"
                style={{ color: "#fbf7f1" }}
              >
                Already an organizer?
              </h3>
              <p
                className="mt-3 max-w-[22ch] text-sm leading-relaxed"
                style={{ color: "rgba(251,247,241,0.72)" }}
              >
                Sign back in to manage your trips, review applicants, and track
                your payouts.
              </p>
              <button
                type="button"
                onClick={() => slideTo(false)}
                className="mt-7 rounded-xl border px-7 py-3 text-sm font-semibold transition-all duration-200 hover:bg-[rgba(251,247,241,0.1)]"
                style={{
                  borderColor: "rgba(251,247,241,0.38)",
                  color: "#fbf7f1",
                }}
              >
                ← Sign in
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrganizerLoginPage() {
  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ background: "var(--bg)" }}
    >
      <OrganizerLandingHeader />
      <Suspense
        fallback={
          <div
            className="flex flex-1 items-center justify-center"
            style={{ color: "var(--text-secondary)" }}
          >
            Loading...
          </div>
        }
      >
        <OrganizerLoginForm />
      </Suspense>
      <p className="pb-10 text-center text-sm">
        <Link
          href="/organizer"
          className="inline-flex items-center gap-1 transition-colors hover:text-[var(--primary)]"
          style={{ color: "var(--text-tertiary)" }}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to organizer overview
        </Link>
      </p>
    </div>
  );
}
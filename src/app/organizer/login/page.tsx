"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BarChart3, Eye, EyeOff, LogIn, UserPlus, Wallet } from "lucide-react";
import { toast } from "sonner";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { GoogleSignInButton } from "@/components/organizer/google-sign-in-button";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { ApiError } from "@/lib/api/client";
import { setOrganizerToken } from "@/lib/api/auth-token";
import {
  loginOrganizer,
  mapOrganizerSession,
  registerOrganizer,
  resolveOrganizerHome,
} from "@/lib/api/organizer-auth";
import { syncOrganizerProfileCache } from "@/lib/api/organizer-profile";

const MOCK_GOOGLE_USER = {
  name: "Alex Morgan",
  email: "alex.morgan@gmail.com",
};

const ORGANIZER_HIGHLIGHTS = [
  { icon: BarChart3, label: "Trip analytics" },
  { icon: Wallet, label: "MoMo payouts" },
  { icon: UserPlus, label: "Applicant management" },
];

function OrganizerLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const initialIsSignup = searchParams.get("mode") === "signup";
  const [isSignup, setIsSignup] = useState(initialIsSignup);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirect =
    searchParams.get("redirect") ??
    (isSignup ? "/organizer/onboarding" : "/organizer/dashboard");

  const passwordValid = password.length >= 8;
  const passwordsMatch = password === confirmPassword;
  const canSubmitSignup =
    Boolean(email.trim()) &&
    Boolean(password.trim()) &&
    passwordValid &&
    Boolean(confirmPassword.trim()) &&
    passwordsMatch &&
    acceptedTerms &&
    !isSubmitting;
  const canSubmitSignin =
    Boolean(email.trim()) && Boolean(password.trim()) && !isSubmitting;

  const handleGoogleSignIn = () => {
    if (isSignup && !acceptedTerms) {
      toast.error("Please agree to the Terms & Conditions to continue.");
      return;
    }
    login(MOCK_GOOGLE_USER);
    toast.success(isSignup ? "Google account connected!" : "Welcome back!");
    router.push(redirect);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSignup) {
      if (!canSubmitSignup) return;
      setIsSubmitting(true);

      try {
        const trimmedEmail = email.trim();
        const response = await registerOrganizer({
          email: trimmedEmail,
          password,
          confirmPassword,
        });

        toast.success(response.message);
        router.push(
          `/organizer/verify?email=${encodeURIComponent(trimmedEmail)}&redirect=${encodeURIComponent(redirect)}`
        );
      } catch (error) {
        const message =
          error instanceof ApiError
            ? error.message
            : "Something went wrong. Please try again.";
        toast.error(message);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (!canSubmitSignin) return;
    setIsSubmitting(true);

    try {
      const trimmedEmail = email.trim();
      const response = await loginOrganizer({
        email: trimmedEmail,
        password,
      });

      const { user, token } = response.data ?? {};
      if (!user || !token) {
        toast.error(response.message || "Something went wrong. Please try again.");
        return;
      }

      setOrganizerToken(token);
      login(mapOrganizerSession(user));
      syncOrganizerProfileCache(user);
      toast.success(response.message);
      router.push(resolveOrganizerHome(user, searchParams.get("redirect")));
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Something went wrong. Please try again.";
      toast.error(message);

      if (
        error instanceof ApiError &&
        error.status === 403 &&
        typeof error.data === "object" &&
        error.data !== null &&
        "requiresVerification" in error.data &&
        (error.data as { requiresVerification?: boolean }).requiresVerification
      ) {
        const verifyEmail =
          (error.data as { email?: string }).email ?? email.trim();
        router.push(
          `/organizer/verify?email=${encodeURIComponent(verifyEmail)}&redirect=${encodeURIComponent("/organizer/onboarding")}`
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthSplitLayout
      eyebrow={isSignup ? "Get started" : "Welcome back"}
      title={isSignup ? "Create organizer account" : "Sign in to your portal"}
      subtitle={
        isSignup
          ? "List trips, manage bookings, and get paid — we'll verify your email first."
          : "Access your dashboard, manage trips, and track payouts."
      }
      imageSrc="/images/high-shot.jpg"
      imageAlt="Aerial view of Ghana landscape"
      backHref="/organizer"
      backLabel="Back to organizer overview"
      brandHref="/organizer"
      brandSubline="For Organizers"
      visualQuote="Share the places you know. Build trips people want to join."
      visualCaption="Everything you need to list, manage, and grow your travel business."
      highlights={ORGANIZER_HIGHLIGHTS}
    >
      <div
        role="tablist"
        aria-label="Account mode"
        className="mb-6 flex w-full border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <button
          type="button"
          role="tab"
          aria-selected={!isSignup}
          onClick={() => {
            setIsSignup(false);
            setConfirmPassword("");
          }}
          className={cn(
            "relative flex-1 pb-3 pt-1 text-sm transition-colors",
            !isSignup ? "font-semibold" : "font-medium opacity-70"
          )}
          style={{ color: !isSignup ? "var(--text)" : "var(--text-tertiary)" }}
        >
          Sign in
          {!isSignup && (
            <span
              className="absolute inset-x-0 bottom-0 h-0.5"
              style={{ background: "var(--primary)" }}
            />
          )}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={isSignup}
          onClick={() => setIsSignup(true)}
          className={cn(
            "relative flex-1 pb-3 pt-1 text-sm transition-colors",
            isSignup ? "font-semibold" : "font-medium opacity-70"
          )}
          style={{ color: isSignup ? "var(--text)" : "var(--text-tertiary)" }}
        >
          Create account
          {isSignup && (
            <span
              className="absolute inset-x-0 bottom-0 h-0.5"
              style={{ background: "var(--primary)" }}
            />
          )}
        </button>
      </div>

      <GoogleSignInButton onClick={handleGoogleSignIn} disabled={isSubmitting} />

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
          <Label htmlFor="email" style={{ color: "var(--text)" }}>
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            className="mt-1.5 h-11 rounded-xl"
            style={{ borderColor: "var(--border-strong)" }}
            autoComplete="email"
            required
          />
        </div>

        <div>
          <Label htmlFor="password" style={{ color: "var(--text)" }}>
            Password
          </Label>
          <div className="relative mt-1.5">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isSignup ? "At least 8 characters" : "Your password"}
              className="h-11 rounded-xl pr-10"
              style={{ borderColor: "var(--border-strong)" }}
              autoComplete={isSignup ? "new-password" : "current-password"}
              minLength={isSignup ? 8 : undefined}
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--text-tertiary)" }}
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {isSignup && password && !passwordValid && (
            <p className="mt-1.5 text-xs" style={{ color: "var(--amber)" }}>
              Password must be at least 8 characters
            </p>
          )}
          {!isSignup && (
            <div className="mt-2 text-right">
              <button
                type="button"
                className="text-xs font-medium"
                style={{ color: "var(--primary)" }}
              >
                Forgot password?
              </button>
            </div>
          )}
        </div>

        {isSignup && (
          <div>
            <Label htmlFor="confirmPassword" style={{ color: "var(--text)" }}>
              Confirm password
            </Label>
            <div className="relative mt-1.5">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                className="h-11 rounded-xl pr-10"
                style={{ borderColor: "var(--border-strong)" }}
                autoComplete="new-password"
                minLength={8}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--text-tertiary)" }}
                onClick={() => setShowConfirmPassword((v) => !v)}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {confirmPassword && !passwordsMatch && (
              <p className="mt-1.5 text-xs" style={{ color: "var(--amber)" }}>
                Passwords do not match
              </p>
            )}
          </div>
        )}

        {isSignup && (
          <div className="flex items-start gap-3">
            <Checkbox
              id="organizer-terms"
              checked={acceptedTerms}
              onCheckedChange={(value) => setAcceptedTerms(value === true)}
              className="mt-0.5 border-[var(--border-strong)] data-[state=checked]:border-[var(--primary)] data-[state=checked]:bg-[var(--primary)]"
              required
            />
            <Label
              htmlFor="organizer-terms"
              className="cursor-pointer text-sm font-normal leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              I agree to the{" "}
              <Link
                href="/terms"
                target="_blank"
                className="font-medium underline-offset-2 hover:underline"
                style={{ color: "var(--primary)" }}
              >
                Terms &amp; Conditions
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                target="_blank"
                className="font-medium underline-offset-2 hover:underline"
                style={{ color: "var(--primary)" }}
              >
                Privacy Policy
              </Link>
            </Label>
          </div>
        )}

        <Button
          type="submit"
          size="lg"
          disabled={isSignup ? !canSubmitSignup : !canSubmitSignin}
          className="h-12 w-full text-sm font-semibold"
          style={{
            background: "var(--gradient-brand)",
            color: "#fbf7f1",
            boxShadow: "var(--glow-gold)",
          }}
        >
          {isSignup ? (
            <>
              <UserPlus className="h-4 w-4" />
              Create account
            </>
          ) : (
            <>
              <LogIn className="h-4 w-4" />
              {isSubmitting ? "Signing in..." : "Sign in"}
            </>
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm" style={{ color: "var(--text-secondary)" }}>
        Looking to book a trip?{" "}
        <Link
          href="/login?mode=signup"
          className="font-medium transition-colors hover:text-[var(--primary)]"
        >
          Create a traveler account
        </Link>
        {" · "}
        <Link href="/login" className="font-medium transition-colors hover:text-[var(--primary)]">
          Sign in as a traveler
        </Link>
      </p>
    </AuthSplitLayout>
  );
}

export default function OrganizerLoginPage() {
  return (
    <Suspense
      fallback={
        <div
          className="flex min-h-screen items-center justify-center"
          style={{ color: "var(--text-secondary)" }}
        >
          Loading...
        </div>
      }
    >
      <OrganizerLoginForm />
    </Suspense>
  );
}

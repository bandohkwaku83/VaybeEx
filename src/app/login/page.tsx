"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LogIn, Phone, UserPlus, Loader2, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { setTravelerToken } from "@/lib/api/auth-token";
import { ApiError } from "@/lib/api/client";
import {
  isEmailIdentifier,
  loginTraveler,
  loginTravelerWithGoogle,
  mapTravelerSession,
  normalizePhone,
  registerTraveler,
  type TravelerPublicUser,
} from "@/lib/api/traveler-auth";
import { cn } from "@/lib/utils";

function buildVerifyUrl(opts: {
  mode: "signup" | "signin";
  email?: string;
  phone?: string;
  redirect: string;
  via?: "phone" | "email";
}) {
  const params = new URLSearchParams({
    mode: opts.mode,
    redirect: opts.redirect,
  });
  if (opts.via === "phone") {
    if (opts.phone) params.set("phone", opts.phone);
  } else if (opts.via === "email") {
    if (opts.email) params.set("email", opts.email);
  } else {
    if (opts.email) params.set("email", opts.email);
    else if (opts.phone) params.set("phone", opts.phone);
  }
  if (opts.via) params.set("via", opts.via);
  return `/login/verify?${params.toString()}`;
}

/* ─── Validation helpers ───────────────────────────────────────── */
function validateEmail(value: string): { valid: boolean; message?: string } {
  const trimmed = value.trim();
  if (!trimmed) return { valid: false };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed))
    return { valid: false, message: "Enter a valid email address" };
  return { valid: true };
}

function validatePhone(value: string): { valid: boolean; message?: string } {
  const trimmed = value.trim();
  if (!trimmed) return { valid: false };
  // Allow digits, spaces, dashes, parentheses, and leading +
  const cleaned = trimmed.replace(/[\s\-()]/g, "");
  if (!/^\+?\d{7,15}$/.test(cleaned))
    return { valid: false, message: "Enter a valid phone number" };
  return { valid: true };
}

function validateName(value: string): { valid: boolean; message?: string } {
  const trimmed = value.trim();
  if (!trimmed) return { valid: false };
  if (trimmed.length < 2)
    return { valid: false, message: "Name must be at least 2 characters" };
  return { valid: true };
}

/* ─── Field status indicator ───────────────────────────────────── */
function FieldStatus({
  validation,
  show,
}: {
  validation: { valid: boolean; message?: string };
  show: boolean;
}) {
  if (!show || !validation.message) return null;
  return (
    <p
      className="mt-1.5 flex items-center gap-1.5 text-xs"
      style={{
        color: validation.valid ? "#2e7d52" : "var(--coral, #e53e3e)",
      }}
    >
      {validation.valid ? (
        <Check className="h-3.5 w-3.5" />
      ) : (
        <AlertCircle className="h-3.5 w-3.5" />
      )}
      {validation.message}
    </p>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const initialIsSignup = searchParams.get("mode") === "signup";
  const [isSignup, setIsSignup] = useState(initialIsSignup);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Field validation state (only show after user interacts)
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const markTouched = (field: string) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const redirect = searchParams.get("redirect") ?? "/";

  const emailValidation = validateEmail(email);
  const phoneValidation = validatePhone(phone);
  const nameValidation = validateName(name);

  const canSubmitSignup =
    Boolean(name.trim()) &&
    Boolean(email.trim()) &&
    Boolean(phone.trim()) &&
    nameValidation.valid &&
    emailValidation.valid &&
    phoneValidation.valid &&
    acceptedTerms &&
    !isSubmitting;
  const canSubmitSignin =
    Boolean(identifier.trim()) && !isSubmitting;

  const finishGoogleSession = (opts: {
    token: string;
    user: TravelerPublicUser;
    needsProfile?: boolean;
    needsPhoneVerification?: boolean;
    message?: string;
  }) => {
    setTravelerToken(opts.token);
    login(mapTravelerSession(opts.user));

    if (opts.needsProfile) {
      const params = new URLSearchParams({ redirect });
      if (opts.user.fullName) params.set("name", opts.user.fullName);
      if (opts.user.email) params.set("email", opts.user.email);
      toast.success(opts.message || "Connected with Google. Finish your profile.");
      router.push(`/login/complete-profile?${params.toString()}`);
      return;
    }

    if (opts.needsPhoneVerification) {
      toast.success(opts.message || "Verify your phone to continue.");
      router.push(
        buildVerifyUrl({
          mode: "signup",
          phone: opts.user.phone ?? undefined,
          redirect,
          via: "phone",
        })
      );
      return;
    }

    toast.success(opts.message || "Signed in with Google");
    if (redirect.startsWith("http://") || redirect.startsWith("https://")) {
      window.location.assign(redirect);
    } else {
      router.push(redirect);
    }
  };

  const handleGoogleCredential = async (idToken: string) => {
    if (isSignup && !acceptedTerms) {
      toast.error("Please agree to the Terms & Conditions to continue.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await loginTravelerWithGoogle({ idToken });
      const data = response.data;
      if (!data?.token || !data.user) {
        toast.error(response.message || "Google sign-in failed. Please try again.");
        return;
      }

      finishGoogleSession({
        token: data.token,
        user: data.user,
        needsProfile:
          data.needsProfile === true || data.user.needsProfile === true,
        needsPhoneVerification:
          data.needsPhoneVerification === true || data.user.needsPhoneVerification === true,
        message: response.message,
      });
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Something went wrong. Please try again.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSignup) {
      if (!canSubmitSignup) return;
      setIsSubmitting(true);

      try {
        const trimmedEmail = email.trim();
        const trimmedPhone = phone.trim();
        const response = await registerTraveler({
          fullName: name.trim(),
          email: trimmedEmail,
          phone: trimmedPhone,
        });

        // Show success state briefly before navigating
        setShowSuccess(true);
        await new Promise((r) => setTimeout(r, 800));

        toast.success(response.message);
        router.push(
          buildVerifyUrl({
            mode: "signup",
            email: trimmedEmail,
            redirect,
            via: "email",
          })
        );
      } catch (error) {
        const message =
          error instanceof ApiError
            ? error.message
            : "Something went wrong. Please try again.";
        toast.error(message);
        setShowSuccess(false);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (!canSubmitSignin) return;
    setIsSubmitting(true);

    try {
      const value = identifier.trim();
      const usingEmail = isEmailIdentifier(value);
      const response = usingEmail
        ? await loginTraveler({ email: value })
        : await loginTraveler({ phone: normalizePhone(value) });

      // Show success state briefly before navigating
      setShowSuccess(true);
      await new Promise((r) => setTimeout(r, 800));

      toast.success(response.message);
      router.push(
        buildVerifyUrl({
          mode: "signin",
          email: usingEmail ? value : undefined,
          phone: usingEmail ? undefined : normalizePhone(value),
          redirect,
          via: usingEmail ? "email" : "phone",
        })
      );
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Something went wrong. Please try again.";
      toast.error(message);
      setShowSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthSplitLayout
      showLogo={false}
      compact
      eyebrow={isSignup ? "Get started" : "Welcome back"}
      title={isSignup ? "Create your traveler account" : "Sign in to your account"}
      titleClassName={isSignup ? "whitespace-nowrap text-2xl sm:text-3xl" : undefined}
      subtitle={
        isSignup
          ? "Save trips, complete bookings, and get real-time updates on your travels"
          : "Enter your email or phone — we'll send a one-time code to sign you in."
      }
    >
      <div className="space-y-6">
        {/* ── Tab switcher with animated indicator ── */}
        <div
          role="tablist"
          aria-label="Account mode"
          className="relative flex w-full border-b"
          style={{ borderColor: "var(--border)" }}
        >
          <button
            type="button"
            role="tab"
            aria-selected={!isSignup}
            onClick={() => setIsSignup(false)}
            className={cn(
              "relative flex-1 pb-3 pt-1 text-sm transition-all duration-200",
              !isSignup ? "font-semibold" : "font-medium opacity-60 hover:opacity-80"
            )}
            style={{ color: !isSignup ? "var(--text)" : "var(--text-tertiary)" }}
          >
            Sign in
            {!isSignup && (
              <span
                className="absolute inset-x-0 bottom-0 h-0.5 transition-all duration-300 ease-out"
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
              "relative flex-1 pb-3 pt-1 text-sm transition-all duration-200",
              isSignup ? "font-semibold" : "font-medium opacity-60 hover:opacity-80"
            )}
            style={{ color: isSignup ? "var(--text)" : "var(--text-tertiary)" }}
          >
            Create account
            {isSignup && (
              <span
                className="absolute inset-x-0 bottom-0 h-0.5 transition-all duration-300 ease-out"
                style={{ background: "var(--primary)" }}
              />
            )}
          </button>
        </div>

        {/* ── Google sign-in ── */}
        <GoogleSignInButton
          onCredential={handleGoogleCredential}
          disabled={isSubmitting}
          label={isSignup ? "Sign up with Google" : "Sign in with Google"}
        />

        <div className="relative flex items-center">
          <span className="h-px flex-1" style={{ background: "var(--border)" }} />
          <span
            className="px-3 text-xs font-medium uppercase tracking-wider"
            style={{ color: "var(--text-tertiary)" }}
          >
            {isSignup ? "or with email" : "or with email / phone"}
          </span>
          <span className="h-px flex-1" style={{ background: "var(--border)" }} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup ? (
            <>
              {/* ── Email field with validation ── */}
              <div>
                <Label htmlFor="email" style={{ color: "var(--text)" }}>
                  Email
                </Label>
                <div className="relative mt-1.5">
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => markTouched("email")}
                    placeholder="you@gmail.com"
                    className={cn(
                      "h-11 rounded-xl pr-10 transition-colors duration-200",
                      touched.email && email && !emailValidation.valid
                        ? "border-red-400 focus-visible:ring-red-400/30"
                        : touched.email && email && emailValidation.valid
                          ? "border-green-400 focus-visible:ring-green-400/30"
                          : ""
                    )}
                    style={{ borderColor: "var(--border-strong)" }}
                    autoComplete="email"
                    required
                  />
                  {touched.email && email && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2">
                      {emailValidation.valid ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-400" />
                      )}
                    </span>
                  )}
                </div>
                <FieldStatus validation={emailValidation} show={!!touched.email} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* ── Name field with validation ── */}
                <div>
                  <Label htmlFor="name" style={{ color: "var(--text)" }}>
                    Full name
                  </Label>
                  <div className="relative mt-1.5">
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onBlur={() => markTouched("name")}
                      placeholder="Your full name"
                      className={cn(
                        "h-11 rounded-xl pr-10 transition-colors duration-200",
                        touched.name && name && !nameValidation.valid
                          ? "border-red-400 focus-visible:ring-red-400/30"
                          : touched.name && name && nameValidation.valid
                            ? "border-green-400 focus-visible:ring-green-400/30"
                            : ""
                      )}
                      style={{ borderColor: "var(--border-strong)" }}
                      autoComplete="name"
                      required
                    />
                    {touched.name && name && nameValidation.valid && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Check className="h-4 w-4 text-green-500" />
                      </span>
                    )}
                  </div>
                  <FieldStatus validation={nameValidation} show={!!touched.name} />
                </div>

                {/* ── Phone field with validation ── */}
                <div>
                  <Label htmlFor="phone" style={{ color: "var(--text)" }}>
                    Contact
                  </Label>
                  <div className="relative mt-1.5">
                    <Phone
                      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                      style={{ color: "var(--text-tertiary)" }}
                    />
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      onBlur={() => markTouched("phone")}
                      placeholder="+233 XX XXX XXXX"
                      className={cn(
                        "h-11 rounded-xl pl-10 pr-10 transition-colors duration-200",
                        touched.phone && phone && !phoneValidation.valid
                          ? "border-red-400 focus-visible:ring-red-400/30"
                          : touched.phone && phone && phoneValidation.valid
                            ? "border-green-400 focus-visible:ring-green-400/30"
                            : ""
                      )}
                      style={{ borderColor: "var(--border-strong)" }}
                      autoComplete="tel"
                      required
                    />
                    {touched.phone && phone && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2">
                        {phoneValidation.valid ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-400" />
                        )}
                      </span>
                    )}
                  </div>
                  <FieldStatus validation={phoneValidation} show={!!touched.phone} />
                </div>
              </div>

              <p className="-mt-1 text-xs" style={{ color: "var(--text-tertiary)" }}>
                Phone used for booking confirmations and trip updates via SMS
              </p>

              {/* ── Terms checkbox ── */}
              <div className="flex items-start gap-3 pt-1">
                <Checkbox
                  id="traveler-terms"
                  checked={acceptedTerms}
                  onCheckedChange={(value) => setAcceptedTerms(value === true)}
                  className="mt-0.5 border-[var(--border-strong)] data-[state=checked]:border-[var(--primary)] data-[state=checked]:bg-[var(--primary)]"
                  required
                />
                <Label
                  htmlFor="traveler-terms"
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
            </>
          ) : (
            /* ── Sign-in identifier field ── */
            <div>
              <Label htmlFor="identifier" style={{ color: "var(--text)" }}>
                Email or phone
              </Label>
              <Input
                id="identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="you@gmail.com or +233..."
                className="mt-1.5 h-11 rounded-xl"
                style={{ borderColor: "var(--border-strong)" }}
                autoComplete="username"
                required
              />
            </div>
          )}

          {/* ── Submit button with spinner ── */}
          <Button
            type="submit"
            size="lg"
            disabled={isSignup ? !canSubmitSignup : !canSubmitSignin}
            className={cn(
              "h-12 w-full text-sm font-semibold transition-all duration-200",
              showSuccess && "bg-green-600 hover:bg-green-600"
            )}
            style={{
              background: showSuccess
                ? "#2e7d52"
                : "var(--gradient-brand)",
              color: "#fbf7f1",
              boxShadow: "var(--glow-gold)",
            }}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {isSignup ? "Creating account..." : "Sending code..."}
              </>
            ) : showSuccess ? (
              <>
                <Check className="h-4 w-4" />
                {isSignup ? "Account created!" : "Code sent!"}
              </>
            ) : (
              <>
                {isSignup ? (
                  <UserPlus className="h-4 w-4" />
                ) : (
                  <LogIn className="h-4 w-4" />
                )}
                {isSignup ? "Send verification code" : "Continue"}
              </>
            )}
          </Button>
        </form>

        <p className="text-center text-sm" style={{ color: "var(--text-secondary)" }}>
          {isSignup ? (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setIsSignup(false)}
                className="font-medium transition-colors hover:text-[var(--primary)]"
                style={{ color: "var(--primary)" }}
              >
                Sign in
              </button>
            </>
          ) : (
            <>
              New to VaybeEx?{" "}
              <button
                type="button"
                onClick={() => setIsSignup(true)}
                className="font-medium transition-colors hover:text-[var(--primary)]"
                style={{ color: "var(--primary)" }}
              >
                Create an account
              </button>
            </>
          )}
        </p>

        <p className="text-center text-sm" style={{ color: "var(--text-secondary)" }}>
          <Link href="/" className="font-medium transition-colors hover:text-[var(--primary)]">
            Continue browsing without signing in
          </Link>
        </p>
      </div>
    </AuthSplitLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div
          className="flex min-h-screen items-center justify-center"
          style={{ color: "var(--text-secondary)" }}
        >
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

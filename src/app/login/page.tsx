"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LogIn, Phone, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api/client";
import {
  isEmailIdentifier,
  loginTraveler,
  normalizePhone,
  registerTraveler,
} from "@/lib/api/traveler-auth";
import { cn } from "@/lib/utils";

const MOCK_GOOGLE_USER = {
  name: "Jordan Lee",
  email: "jordan.lee@gmail.com",
  phone: "+233 20 123 4567",
};

function buildVerifyUrl(opts: {
  mode: "signup" | "signin";
  email?: string;
  phone?: string;
  redirect: string;
}) {
  const params = new URLSearchParams({
    mode: opts.mode,
    redirect: opts.redirect,
  });
  if (opts.email) params.set("email", opts.email);
  if (opts.phone) params.set("phone", opts.phone);
  return `/login/verify?${params.toString()}`;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialIsSignup = searchParams.get("mode") === "signup";
  const [isSignup, setIsSignup] = useState(initialIsSignup);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [googleConnected, setGoogleConnected] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirect = searchParams.get("redirect") ?? "/";

  const canSubmitSignup =
    Boolean(name.trim()) &&
    Boolean(email.trim()) &&
    Boolean(phone.trim()) &&
    acceptedTerms &&
    !isSubmitting;
  const canSubmitSignin = Boolean(identifier.trim()) && !isSubmitting;

  const handleGoogleSignIn = () => {
    if (isSignup) {
      setName(MOCK_GOOGLE_USER.name);
      setEmail(MOCK_GOOGLE_USER.email);
      setPhone(MOCK_GOOGLE_USER.phone);
      setGoogleConnected(true);
      toast.success("Google account connected. Confirm your details and continue.");
      return;
    }

    setIsSignup(true);
    setName(MOCK_GOOGLE_USER.name);
    setEmail(MOCK_GOOGLE_USER.email);
    setPhone(MOCK_GOOGLE_USER.phone);
    setGoogleConnected(true);
    toast.info("Complete your profile to create a traveler account.");
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

        toast.success(response.message);
        router.push(
          buildVerifyUrl({
            mode: "signup",
            email: trimmedEmail,
            phone: trimmedPhone,
            redirect,
          })
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
      const value = identifier.trim();
      const usingEmail = isEmailIdentifier(value);
      const response = usingEmail
        ? await loginTraveler({ email: value })
        : await loginTraveler({ phone: normalizePhone(value) });

      toast.success(response.message);
      router.push(
        buildVerifyUrl({
          mode: "signin",
          email: usingEmail ? value : response.data?.email,
          phone: usingEmail ? response.data?.phone : normalizePhone(value),
          redirect,
        })
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
        <div
          role="tablist"
          aria-label="Account mode"
          className="flex w-full border-b"
          style={{ borderColor: "var(--border)" }}
        >
          <button
            type="button"
            role="tab"
            aria-selected={!isSignup}
            onClick={() => {
              setIsSignup(false);
              setGoogleConnected(false);
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

        <GoogleSignInButton
          onClick={handleGoogleSignIn}
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
              <div>
                <Label htmlFor="email" style={{ color: "var(--text)" }}>
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@gmail.com"
                  className="mt-1.5 h-11 rounded-xl"
                  style={{
                    borderColor: "var(--border-strong)",
                    background:
                      googleConnected ? "var(--bg-secondary)" : undefined,
                  }}
                  autoComplete="email"
                  readOnly={googleConnected}
                  required
                />
                {googleConnected && (
                  <p className="mt-1.5 text-xs" style={{ color: "var(--text-tertiary)" }}>
                    Email from your Google account
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" style={{ color: "var(--text)" }}>
                    Full name
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    className="mt-1.5 h-11 rounded-xl"
                    style={{
                      borderColor: "var(--border-strong)",
                      background: googleConnected ? "var(--bg-secondary)" : undefined,
                    }}
                    autoComplete="name"
                    readOnly={googleConnected}
                    required
                  />
                </div>

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
                      placeholder="+233 XX XXX XXXX"
                      className="h-11 rounded-xl pl-10"
                      style={{ borderColor: "var(--border-strong)" }}
                      autoComplete="tel"
                      required
                    />
                  </div>
                </div>
              </div>

              <p className="-mt-1 text-xs" style={{ color: "var(--text-tertiary)" }}>
                Phone used for booking confirmations and trip updates via SMS
              </p>

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
                {isSubmitting ? "Sending code..." : "Send verification code"}
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                {isSubmitting ? "Sending code..." : "Continue"}
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
                onClick={() => {
                  setIsSignup(false);
                  setGoogleConnected(false);
                }}
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
          Loading...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

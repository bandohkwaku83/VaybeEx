"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, LogIn, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { GoogleSignInButton } from "@/components/organizer/google-sign-in-button";
import { OrganizerLandingHeader } from "@/components/organizer/landing-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { sendOrganizerOtp } from "@/lib/organizer-auth-mock";

const MOCK_GOOGLE_USER = {
  name: "Alex Morgan",
  email: "alex.morgan@gmail.com",
};

function OrganizerLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSignup = searchParams.get("mode") === "signup";
  const redirect = searchParams.get("redirect") ?? (isSignup ? "/organizer/onboarding" : "/organizer/dashboard");

  const passwordsMatch = !isSignup || password === confirmPassword;
  const passwordValid = password.length >= 8;
  const canSubmitEmail =
    email.trim() &&
    password.trim() &&
    passwordValid &&
    passwordsMatch &&
    !isSubmitting;

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
      <Card className="w-full max-w-md shadow-lg border-teal-100">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-teal-600 text-white">
            {isSignup ? <UserPlus className="h-6 w-6" /> : <LogIn className="h-6 w-6" />}
          </div>
          <CardTitle className="text-2xl">
            {isSignup ? "Create organizer account" : "Sign in to your portal"}
          </CardTitle>
          <p className="text-sm text-stone-500 mt-2">
            {isSignup
              ? "Sign up with Google or email. We'll verify your email before profile setup."
              : "Access your dashboard, manage trips, and track payouts."}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <GoogleSignInButton onClick={handleGoogleSignIn} disabled={isSubmitting} />

          <div className="relative">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs text-stone-400">
              or continue with email
            </span>
          </div>

          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="mt-1.5"
                autoComplete="email"
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1.5">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isSignup ? "At least 8 characters" : "Your password"}
                  className="pr-10"
                  autoComplete={isSignup ? "new-password" : "current-password"}
                  required
                  minLength={isSignup ? 8 : undefined}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {isSignup && password && !passwordValid && (
                <p className="text-xs text-amber-600 mt-1">Password must be at least 8 characters</p>
              )}
            </div>

            {isSignup && (
              <div>
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  className="mt-1.5"
                  autoComplete="new-password"
                  required
                />
                {confirmPassword && !passwordsMatch && (
                  <p className="text-xs text-red-600 mt-1">Passwords do not match</p>
                )}
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={!canSubmitEmail}>
              {isSignup ? (
                <>
                  <UserPlus className="h-4 w-4" />
                  Create account
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Sign in
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-stone-500">
            {isSignup ? (
              <>
                Already have an account?{" "}
                <Link
                  href={`/organizer/login?redirect=${encodeURIComponent(redirect)}`}
                  className="text-teal-600 hover:underline"
                >
                  Sign in
                </Link>
              </>
            ) : (
              <>
                New to VaybeEx?{" "}
                <Link
                  href={`/organizer/login?mode=signup&redirect=${encodeURIComponent(redirect)}`}
                  className="text-teal-600 hover:underline"
                >
                  Create an account
                </Link>
              </>
            )}
          </p>

          <p className="text-center text-sm text-stone-500">
            <Link href="/organizer" className="text-stone-400 hover:text-teal-600 inline-flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to organizer overview
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function OrganizerLoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-teal-50 to-stone-50">
      <OrganizerLandingHeader />
      <Suspense
        fallback={
          <div className="flex flex-1 items-center justify-center text-stone-500">Loading...</div>
        }
      >
        <OrganizerLoginForm />
      </Suspense>
    </div>
  );
}

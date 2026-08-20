"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Check, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { OtpInput } from "@/components/auth/otp-input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { setTravelerToken } from "@/lib/api/auth-token";
import { ApiError } from "@/lib/api/client";
import {
  mapTravelerSession,
  resendTravelerOtp,
  verifyTravelerOtp,
} from "@/lib/api/traveler-auth";

const OTP_LENGTH = 4;

function VerifyLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const email = searchParams.get("email") ?? "";
  const phone = searchParams.get("phone") ?? "";
  const mode = searchParams.get("mode") === "signin" ? "signin" : "signup";
  const viaPhone = searchParams.get("via") === "phone";
  const redirect = searchParams.get("redirect") ?? "/";

  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  const destinationLabel = viaPhone ? phone || email : email || phone;

  useEffect(() => {
    if (!email && !phone) {
      const params = new URLSearchParams({
        mode: mode === "signin" ? "signin" : "signup",
        redirect,
      });
      router.replace(`/login?${params.toString()}`);
    }
  }, [email, phone, mode, redirect, router]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== OTP_LENGTH || isVerifying) return;

    setIsVerifying(true);

    try {
      const response = await verifyTravelerOtp({
        code: otp,
        // Backend accepts exactly one identifier.
        ...(viaPhone || (phone && !email)
          ? { phone }
          : { email }),
      });

      const { user, token } = response.data ?? {};
      if (!user || !token) {
        toast.error(response.message || "Something went wrong. Please try again.");
        setIsVerifying(false);
        return;
      }

      setTravelerToken(token);
      login(mapTravelerSession(user));

      // Show success state briefly before navigating
      setShowSuccess(true);
      await new Promise((r) => setTimeout(r, 800));

      toast.success(response.message);
      if (
        redirect.startsWith("http://") ||
        redirect.startsWith("https://")
      ) {
        window.location.assign(redirect);
      } else {
        router.push(redirect);
      }
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Something went wrong. Please try again.";
      toast.error(message);
      setIsVerifying(false);
      setShowSuccess(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || isResending) return;

    setIsResending(true);
    try {
      const response = await resendTravelerOtp(
        viaPhone || (phone && !email) ? { phone } : { email }
      );
      toast.success(response.message);
      setResendCooldown(60);
      setOtp("");
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Something went wrong. Please try again.";
      toast.error(message);
    } finally {
      setIsResending(false);
    }
  };

  if (!email && !phone) return null;

  const backParams = new URLSearchParams({
    mode: mode === "signin" ? "signin" : "signup",
    redirect,
  });

  return (
    <AuthSplitLayout
      showLogo={false}
      compact
      eyebrow="Almost there"
      title={
        viaPhone
          ? "Verify your phone"
          : mode === "signin"
            ? "Enter your code"
            : "Verify your email"
      }
      subtitle={
        <>
          We sent a {OTP_LENGTH}-digit {viaPhone ? "SMS " : ""}code to{" "}
          <span className="font-semibold" style={{ color: "var(--text)" }}>
            {destinationLabel}
          </span>
          . Enter it below to{" "}
          {mode === "signin" ? "sign in." : "finish creating your account."}
        </>
      }
      imageSrc="/images/beautiful-nature.jpg"
      imageAlt="Beautiful nature landscape in Ghana"
    >
      <form onSubmit={handleVerify} className="space-y-6">
        <OtpInput
          value={otp}
          onChange={setOtp}
          onComplete={() => {
            if (otp.length === OTP_LENGTH && !isVerifying) {
              // Trigger form submit programmatically
              const form = document.querySelector('form');
              form?.requestSubmit();
            }
          }}
          length={OTP_LENGTH}
          disabled={isVerifying}
        />

        <Button
          type="submit"
          size="lg"
          disabled={otp.length !== OTP_LENGTH || isVerifying}
          className="h-12 w-full text-sm font-semibold transition-all duration-200"
          style={{
            background: showSuccess ? "#2e7d52" : "var(--gradient-brand)",
            color: "#fbf7f1",
            boxShadow: "var(--glow-gold)",
          }}
        >
          {isVerifying ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : showSuccess ? (
            <>
              <Check className="h-4 w-4" />
              Verified!
            </>
          ) : (
            <>
              <ShieldCheck className="h-4 w-4" />
              {mode === "signin"
                ? "Verify & sign in"
                : "Verify & create account"}
            </>
          )}
        </Button>
      </form>

      <div className="mt-6 space-y-4 text-center">
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Didn&apos;t receive a code?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={resendCooldown > 0 || isResending}
            className="font-medium transition-colors hover:text-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              color:
                resendCooldown > 0 || isResending
                  ? "var(--text-tertiary)"
                  : "var(--primary)",
            }}
          >
            {isResending
              ? "Sending..."
              : resendCooldown > 0
                ? `Resend in ${resendCooldown}s`
                : "Resend code"}
          </button>
        </p>

        <Link
          href={`/login?${backParams.toString()}`}
          className="inline-flex items-center gap-1.5 text-sm transition-colors hover:text-[var(--primary)]"
          style={{ color: "var(--text-tertiary)" }}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {mode === "signin" ? "Back to sign in" : "Back to create account"}
        </Link>
      </div>
    </AuthSplitLayout>
  );
}

export default function LoginVerifyPage() {
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
      <VerifyLoginForm />
    </Suspense>
  );
}

"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { OtpInput } from "@/components/organizer/otp-input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { setOrganizerToken } from "@/lib/api/auth-token";
import { ApiError } from "@/lib/api/client";
import {
  mapOrganizerSession,
  resendOrganizerOtp,
  verifyOrganizerOtp,
} from "@/lib/api/organizer-auth";
import { syncOrganizerProfileCache } from "@/lib/api/organizer-profile";

const OTP_LENGTH = 4;

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const email = searchParams.get("email") ?? "";
  const redirect = searchParams.get("redirect") ?? "/organizer/onboarding";

  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (!email) {
      router.replace("/organizer/login?mode=signup&redirect=/organizer/onboarding");
    }
  }, [email, router]);

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
      const response = await verifyOrganizerOtp({
        email,
        code: otp,
      });

      const { user, token } = response.data ?? {};
      if (token) setOrganizerToken(token);

      if (user) {
        login(mapOrganizerSession(user));
        syncOrganizerProfileCache(user);
      } else {
        login({ name: "", email });
      }

      toast.success(response.message);
      router.push("/organizer/onboarding");
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Something went wrong. Please try again.";
      toast.error(message);
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || isResending) return;

    setIsResending(true);
    try {
      const response = await resendOrganizerOtp({ email });
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

  if (!email) return null;

  return (
    <AuthSplitLayout
      eyebrow="Almost there"
      title="Verify your email"
      subtitle={
        <>
          We sent a {OTP_LENGTH}-digit code to{" "}
          <span className="font-semibold" style={{ color: "var(--text)" }}>
            {email}
          </span>
          . Enter it below to continue setting up your organizer profile.
        </>
      }
      imageSrc="/images/high-shot.jpg"
      imageAlt="Aerial view of Ghana landscape"
      backHref="/organizer/login?mode=signup"
      backLabel="Back to sign up"
      brandHref="/organizer"
      brandSubline="For Organizers"
      visualBadge="Organizer portal"
      visualQuote="Share the places you know. Build trips people want to join."
      visualCaption="Everything you need to list, manage, and grow your travel business."
    >
      <form onSubmit={handleVerify} className="space-y-6">
        <OtpInput
          value={otp}
          onChange={setOtp}
          length={OTP_LENGTH}
          disabled={isVerifying}
        />

        <Button
          type="submit"
          size="lg"
          disabled={otp.length !== OTP_LENGTH || isVerifying}
          className="h-12 w-full text-sm font-semibold"
          style={{
            background: "var(--gradient-brand)",
            color: "#fbf7f1",
            boxShadow: "var(--glow-gold)",
          }}
        >
          <ShieldCheck className="h-4 w-4" />
          {isVerifying ? "Verifying..." : "Verify email"}
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
          href={`/organizer/login?mode=signup&redirect=${encodeURIComponent(redirect)}`}
          className="inline-flex items-center gap-1.5 text-sm transition-colors hover:text-[var(--primary)]"
          style={{ color: "var(--text-tertiary)" }}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Use a different email
        </Link>
      </div>
    </AuthSplitLayout>
  );
}

export default function OrganizerVerifyPage() {
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
      <VerifyEmailForm />
    </Suspense>
  );
}

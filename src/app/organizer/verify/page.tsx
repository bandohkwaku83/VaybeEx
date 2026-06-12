"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Mail, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { OrganizerLandingHeader } from "@/components/organizer/landing-header";
import { OtpInput } from "@/components/organizer/otp-input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import {
  clearOrganizerOtp,
  DEMO_OTP,
  sendOrganizerOtp,
  verifyOrganizerOtp,
} from "@/lib/organizer-auth-mock";

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const email = searchParams.get("email") ?? "";
  const redirect = searchParams.get("redirect") ?? "/organizer/onboarding";

  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
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

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6 || isVerifying) return;

    setIsVerifying(true);

    if (!verifyOrganizerOtp(email, otp)) {
      toast.error("Invalid or expired code. Please try again.");
      setIsVerifying(false);
      return;
    }

    clearOrganizerOtp(email);
    login({ name: "", email });
    toast.success("Email verified! Let's set up your profile.");
    router.push(redirect);
  };

  const handleResend = () => {
    if (resendCooldown > 0) return;
    sendOrganizerOtp(email);
    setResendCooldown(30);
    toast.success("New verification code sent");
  };

  if (!email) return null;

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md shadow-lg border-teal-100">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-teal-600 text-white">
            <Mail className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl">Verify your email</CardTitle>
          <p className="text-sm text-stone-500 mt-2">
            We sent a 6-digit code to{" "}
            <span className="font-medium text-stone-700">{email}</span>
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify} className="space-y-6">
            <OtpInput value={otp} onChange={setOtp} disabled={isVerifying} />

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={otp.length !== 6 || isVerifying}
            >
              <ShieldCheck className="h-4 w-4" />
              Verify email
            </Button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <p className="text-sm text-stone-500">
              Didn&apos;t receive a code?{" "}
              <button
                type="button"
                onClick={handleResend}
                disabled={resendCooldown > 0}
                className="text-teal-600 hover:underline disabled:text-stone-400 disabled:no-underline"
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
              </button>
            </p>

            <p className="text-xs text-stone-400 rounded-lg bg-stone-50 px-3 py-2">
              Demo code: <span className="font-mono font-medium text-stone-600">{DEMO_OTP}</span>
            </p>

            <Link
              href={`/organizer/login?mode=signup&redirect=${encodeURIComponent(redirect)}`}
              className="text-sm text-stone-400 hover:text-teal-600 inline-flex items-center gap-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Use a different email
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function OrganizerVerifyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-teal-50 to-stone-50">
      <OrganizerLandingHeader />
      <Suspense
        fallback={
          <div className="flex flex-1 items-center justify-center text-stone-500">Loading...</div>
        }
      >
        <VerifyEmailForm />
      </Suspense>
    </div>
  );
}

"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Mail, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { OtpInput } from "@/components/auth/otp-input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import {
  clearTravelerOtp,
  DEMO_OTP,
  sendTravelerOtp,
  verifyTravelerOtp,
} from "@/lib/traveler-auth-mock";

function VerifyLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const email = searchParams.get("email") ?? "";
  const name = searchParams.get("name") ?? "";
  const phone = searchParams.get("phone") ?? "";
  const redirect = searchParams.get("redirect") ?? "/";

  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (!email || !name || !phone) {
      router.replace(`/login?redirect=${encodeURIComponent(redirect)}`);
    }
  }, [email, name, phone, redirect, router]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6 || isVerifying) return;

    setIsVerifying(true);

    if (!verifyTravelerOtp(email, otp)) {
      toast.error("Invalid or expired code. Please try again.");
      setIsVerifying(false);
      return;
    }

    clearTravelerOtp(email);
    login({ name, email, phone });
    toast.success("Welcome to VaybeEx!");
    router.push(redirect);
  };

  const handleResend = () => {
    if (resendCooldown > 0) return;
    sendTravelerOtp(email);
    setResendCooldown(30);
    toast.success("New verification code sent");
  };

  if (!email || !name || !phone) return null;

  return (
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
            Verify & sign in
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
            href={`/login?redirect=${encodeURIComponent(redirect)}`}
            className="text-sm text-stone-400 hover:text-teal-600 inline-flex items-center gap-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LoginVerifyPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <Suspense
        fallback={
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center text-stone-500">Loading...</CardContent>
          </Card>
        }
      >
        <VerifyLoginForm />
      </Suspense>
    </div>
  );
}

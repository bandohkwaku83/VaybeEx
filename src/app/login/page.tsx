"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Compass, LogIn } from "lucide-react";
import { toast } from "sonner";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { sendTravelerOtp } from "@/lib/traveler-auth-mock";

const MOCK_GOOGLE_USER = {
  name: "Jordan Lee",
  email: "jordan.lee@gmail.com",
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [googleConnected, setGoogleConnected] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirect = searchParams.get("redirect") ?? "/";

  const canSubmit = name.trim() && email.trim() && phone.trim() && !isSubmitting;

  const handleGoogleSignIn = () => {
    setName(MOCK_GOOGLE_USER.name);
    setEmail(MOCK_GOOGLE_USER.email);
    setGoogleConnected(true);
    toast.success("Google account connected! Add your phone number, then verify with OTP.");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    sendTravelerOtp(email.trim());
    toast.success("Verification code sent to your email");
    const params = new URLSearchParams({
      email: email.trim(),
      name: name.trim(),
      phone: phone.trim(),
      redirect,
    });
    router.push(`/login/verify?${params.toString()}`);
  };

  return (
    <Card className="w-full max-w-md shadow-lg border-teal-100">
      <CardHeader className="text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-teal-600 text-white">
          <Compass className="h-6 w-6" />
        </div>
        <CardTitle className="text-2xl">Sign in to VaybeEx</CardTitle>
        <p className="text-sm text-stone-500 mt-2">
          Sign in with Google or your email to save trips and complete bookings.
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className={`mt-1.5 ${googleConnected ? "bg-stone-50" : ""}`}
              autoComplete="name"
              readOnly={googleConnected}
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Gmail / Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@gmail.com"
              className={`mt-1.5 ${googleConnected ? "bg-stone-50" : ""}`}
              autoComplete="email"
              readOnly={googleConnected}
              required
            />
            {googleConnected && (
              <p className="text-xs text-stone-400 mt-1">Name and email from your Google account</p>
            )}
          </div>
          <div>
            <Label htmlFor="phone">Phone number</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+233 XX XXX XXXX"
              className="mt-1.5"
              autoComplete="tel"
              required
            />
            <p className="text-xs text-stone-400 mt-1">
              Used for booking confirmations and trip updates via SMS
            </p>
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={!canSubmit}>
            <LogIn className="h-4 w-4" />
            Send verification code
          </Button>
        </form>

        <p className="text-center text-sm text-stone-500">
          <Link href="/" className="text-teal-600 hover:underline">
            Continue browsing without signing in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <Suspense
        fallback={
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center text-stone-500">Loading...</CardContent>
          </Card>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}

"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Phone, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { getTravelerToken, setTravelerToken } from "@/lib/api/auth-token";
import { ApiError } from "@/lib/api/client";
import {
  completeTravelerProfile,
  mapTravelerSession,
  normalizePhone,
} from "@/lib/api/traveler-auth";

function CompleteProfileForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const redirect = searchParams.get("redirect") ?? "/";
  const prefillName = searchParams.get("name") ?? "";
  const prefillEmail = searchParams.get("email") ?? "";

  const [fullName, setFullName] = useState(prefillName);
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!getTravelerToken()) {
      router.replace(
        `/login?mode=signup&redirect=${encodeURIComponent(redirect)}`
      );
    }
  }, [redirect, router]);

  const canSubmit =
    Boolean(fullName.trim()) && Boolean(phone.trim()) && !isSubmitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    try {
      const trimmedPhone = normalizePhone(phone.trim());
      const response = await completeTravelerProfile({
        fullName: fullName.trim(),
        phone: trimmedPhone,
      });

      const data = response.data;
      if (data?.token) {
        setTravelerToken(data.token);
      }
      if (data?.user) {
        login(mapTravelerSession(data.user));
      }

      const needsPhoneVerification =
        data?.needsPhoneVerification === true ||
        data?.user?.needsPhoneVerification === true;

      toast.success(response.message || "Profile saved. Verify your phone to continue.");

      if (needsPhoneVerification) {
        // Use the real phone the user entered — API `data.phone` is masked for display.
        // Send only phone to verify (backend rejects email + phone together).
        const params = new URLSearchParams({
          mode: "signup",
          via: "phone",
          phone: trimmedPhone,
          redirect,
        });
        router.push(`/login/verify?${params.toString()}`);
        return;
      }

      if (redirect.startsWith("http://") || redirect.startsWith("https://")) {
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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthSplitLayout
      showLogo={false}
      compact
      eyebrow="Almost done"
      title="Complete your profile"
      subtitle="Add your phone number so we can send booking confirmations and trip updates."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {prefillEmail ? (
          <div>
            <Label style={{ color: "var(--text)" }}>Email</Label>
            <Input
              value={prefillEmail}
              readOnly
              className="mt-1.5 h-11 rounded-xl"
              style={{
                borderColor: "var(--border-strong)",
                background: "var(--bg-secondary)",
              }}
            />
            <p className="mt-1.5 text-xs" style={{ color: "var(--text-tertiary)" }}>
              From your Google account
            </p>
          </div>
        ) : null}

        <div>
          <Label htmlFor="fullName" style={{ color: "var(--text)" }}>
            Full name
          </Label>
          <Input
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your full name"
            className="mt-1.5 h-11 rounded-xl"
            style={{ borderColor: "var(--border-strong)" }}
            autoComplete="name"
            required
          />
        </div>

        <div>
          <Label htmlFor="phone" style={{ color: "var(--text)" }}>
            Phone
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
          <p className="mt-1.5 text-xs" style={{ color: "var(--text-tertiary)" }}>
            We&apos;ll send a one-time SMS code to verify this number
          </p>
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={!canSubmit}
          className="h-12 w-full text-sm font-semibold"
          style={{
            background: "var(--gradient-brand)",
            color: "#fbf7f1",
            boxShadow: "var(--glow-gold)",
          }}
        >
          <UserPlus className="h-4 w-4" />
          {isSubmitting ? "Saving..." : "Continue"}
        </Button>

        <p className="text-center text-sm" style={{ color: "var(--text-secondary)" }}>
          <Link
            href={`/login?redirect=${encodeURIComponent(redirect)}`}
            className="font-medium transition-colors hover:text-[var(--primary)]"
          >
            Back to sign in
          </Link>
        </p>
      </form>
    </AuthSplitLayout>
  );
}

export default function CompleteProfilePage() {
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
      <CompleteProfileForm />
    </Suspense>
  );
}

"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, Loader2, Phone, UserPlus, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { getTravelerToken, setTravelerToken } from "@/lib/api/auth-token";
import { ApiError } from "@/lib/api/client";
import { cn } from "@/lib/utils";
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
  const [showSuccess, setShowSuccess] = useState(false);

  // Field validation state (only show after user interacts)
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const markTouched = (field: string) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  // Validation helpers
  const validateName = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return { valid: false };
    if (trimmed.length < 2)
      return { valid: false, message: "Name must be at least 2 characters" };
    return { valid: true };
  };
  const validatePhone = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return { valid: false };
    const cleaned = trimmed.replace(/[\s\-()]/g, "");
    if (!/^\+?\d{7,15}$/.test(cleaned))
      return { valid: false, message: "Enter a valid phone number" };
    return { valid: true };
  };

  const nameValidation = validateName(fullName);
  const phoneValidation = validatePhone(phone);

  useEffect(() => {
    if (!getTravelerToken()) {
      router.replace(
        `/login?mode=signup&redirect=${encodeURIComponent(redirect)}`
      );
    }
  }, [redirect, router]);

  const canSubmit =
    Boolean(fullName.trim()) &&
    Boolean(phone.trim()) &&
    nameValidation.valid &&
    phoneValidation.valid &&
    !isSubmitting;

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

      // Show success state briefly before navigating
      setShowSuccess(true);
      await new Promise((r) => setTimeout(r, 800));

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
      setShowSuccess(false);
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
          <div className="relative mt-1.5">
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              onBlur={() => markTouched("name")}
              placeholder="Your full name"
              className={cn(
                "h-11 rounded-xl pr-10 transition-colors duration-200",
                touched.name && fullName && !nameValidation.valid
                  ? "border-red-400 focus-visible:ring-red-400/30"
                  : touched.name && fullName && nameValidation.valid
                    ? "border-green-400 focus-visible:ring-green-400/30"
                    : ""
              )}
              style={{ borderColor: "var(--border-strong)" }}
              autoComplete="name"
              required
            />
            {touched.name && fullName && nameValidation.valid && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2">
                <Check className="h-4 w-4 text-green-500" />
              </span>
            )}
          </div>
          {touched.name && fullName && !nameValidation.valid && nameValidation.message && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs" style={{ color: "var(--coral, #e53e3e)" }}>
              <AlertCircle className="h-3.5 w-3.5" />
              {nameValidation.message}
            </p>
          )}
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
          {touched.phone && phone && !phoneValidation.valid && phoneValidation.message && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs" style={{ color: "var(--coral, #e53e3e)" }}>
              <AlertCircle className="h-3.5 w-3.5" />
              {phoneValidation.message}
            </p>
          )}
          <p className="mt-1.5 text-xs" style={{ color: "var(--text-tertiary)" }}>
            We&apos;ll send a one-time SMS code to verify this number
          </p>
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={!canSubmit}
          className="h-12 w-full text-sm font-semibold transition-all duration-200"
          style={{
            background: showSuccess ? "#2e7d52" : "var(--gradient-brand)",
            color: "#fbf7f1",
            boxShadow: "var(--glow-gold)",
          }}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : showSuccess ? (
            <>
              <Check className="h-4 w-4" />
              Profile saved!
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4" />
              Continue
            </>
          )}
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

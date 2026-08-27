"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, Shield, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { ApiError } from "@/lib/api/client";
import AdminSignInLogo from "@public/admin-dashboard-logo.jpeg";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, isLoading } = useAdminAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [shakeError, setShakeError] = useState(false);

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const redirect = searchParams.get("redirect") ?? "/admin-portal";
  const safeRedirect =
    redirect.startsWith("/admin-portal") && !redirect.startsWith("/admin-portal/login")
      ? redirect
      : "/admin-portal";

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(safeRedirect);
    }
  }, [isLoading, isAuthenticated, router, safeRedirect]);

  // Auto-focus email field on mount with a slight delay for animation
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const timer = setTimeout(() => {
        emailRef.current?.focus();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isLoading, isAuthenticated]);

  // GSAP entrance animation
  useEffect(() => {
    if (isLoading || isAuthenticated) return;

    const loadGSAP = async () => {
      try {
        const gsap = (await import("gsap")).default;
        const container = containerRef.current;
        if (!container) return;

        const elements = container.querySelectorAll("[data-animate]");
        gsap.set(elements, { opacity: 0, y: 20 });
        gsap.to(elements, {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.08,
          ease: "power3.out",
          delay: 0.15,
        });
      } catch {
        // GSAP not available — skip animation gracefully
      }
    };
    void loadGSAP();
  }, [isLoading, isAuthenticated]);

  const validateEmail = (value: string) => {
    if (!value.trim()) {
      setEmailError("Email is required");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
      setEmailError("Enter a valid email address");
      return false;
    }
    setEmailError("");
    return true;
  };

  const validatePassword = (value: string) => {
    if (!value) {
      setPasswordError("Password is required");
      return false;
    }
    if (value.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const canSubmit =
    Boolean(email.trim()) && Boolean(password.trim()) && !isSubmitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailOk = validateEmail(email);
    const passwordOk = validatePassword(password);
    if (!emailOk || !passwordOk) return;

    setIsSubmitting(true);
    try {
      await login({ email: email.trim(), password });
      toast.success("Welcome back");
      router.replace(safeRedirect);
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Something went wrong. Please try again.";
      toast.error(message);
      setShakeError(true);
      setTimeout(() => setShakeError(false), 600);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || isAuthenticated) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center gap-3 text-sm"
        style={{ background: "#f5f5f5", color: "#737373" }}
      >
        <Loader2 className="h-5 w-5 animate-spin" style={{ color: "#a3a3a3" }} />
        {isAuthenticated ? "Redirecting to dashboard…" : "Verifying session…"}
      </div>
    );
  }

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12"
      style={{ background: "#f5f5f5" }}
    >
      {/* Subtle background pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, #171717 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }}
      />

      <div
        ref={containerRef}
        className="relative z-10 w-full max-w-md"
      >
        <div className="mb-8 flex flex-col items-center text-center" data-animate>
          <Link href="/" className="mb-6 transition-transform hover:scale-105">
            <BrandLogo
              size="lg"
              withWordmark
              accentEx={false}
              wordmarkClassName="text-xl"
              wordmarkStyle={{ color: "#171717" }}
              imgSrc={AdminSignInLogo}
            />
          </Link>

          <div
            className="mb-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]"
            style={{ color: "#737373", background: "#ebebeb" }}
          >
            <Shield className="h-3.5 w-3.5" />
            Admin portal
          </div>
          <h1
            className="font-display text-3xl font-bold"
            style={{ color: "#171717" }}
          >
            Sign in
          </h1>
          <p className="mt-2 text-sm" style={{ color: "#737373" }}>
            Staff access only
          </p>
        </div>

        <div
          className="rounded-2xl border bg-white p-6 sm:p-8"
          data-animate
          style={{
            borderColor: "#e5e5e5",
            boxShadow: "0 12px 40px -28px rgba(0,0,0,0.15)",
          }}
        >
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="space-y-5"
            noValidate
          >
            <div className="space-y-2">
              <Label htmlFor="admin-email">Email</Label>
              <Input
                ref={emailRef}
                id="admin-email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) validateEmail(e.target.value);
                }}
                onBlur={() => email && validateEmail(email)}
                placeholder="admin@vaybeex.com"
                required
                style={{
                  borderColor: emailError ? "#ef4444" : undefined,
                }}
              />
              {emailError && (
                <p className="flex items-center gap-1 text-xs" style={{ color: "#ef4444" }}>
                  <AlertCircle className="h-3 w-3" />
                  {emailError}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-password">Password</Label>
              <div className="relative">
                <Input
                  ref={passwordRef}
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) validatePassword(e.target.value);
                  }}
                  onBlur={() => password && validatePassword(password)}
                  placeholder="••••••••"
                  className="pr-10"
                  required
                  style={{
                    borderColor: passwordError ? "#ef4444" : undefined,
                  }}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors hover:opacity-70"
                  style={{ color: "#a3a3a3" }}
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {passwordError && (
                <p className="flex items-center gap-1 text-xs" style={{ color: "#ef4444" }}>
                  <AlertCircle className="h-3 w-3" />
                  {passwordError}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full transition-all"
              disabled={!canSubmit}
              style={{
                background: "#171717",
                color: "#fff",
                transform: shakeError ? "translateX(-4px)" : undefined,
                animation: shakeError ? "shake 0.5s ease-in-out" : undefined,
              }}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in…
                </span>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
        </div>

        <p
          className="mt-6 text-center text-xs"
          style={{ color: "#a3a3a3" }}
          data-animate
        >
          <Link
            href="/"
            className="transition-colors hover:text-[#171717]"
          >
            ← Back to VaybeEx
          </Link>
        </p>
      </div>

      {/* Inline shake animation keyframes */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-4px); }
          40% { transform: translateX(4px); }
          60% { transform: translateX(-3px); }
          80% { transform: translateX(3px); }
        }
      `}</style>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div
          className="flex min-h-screen flex-col items-center justify-center gap-3"
          style={{ background: "#f5f5f5" }}
        >
          <Loader2 className="h-5 w-5 animate-spin" style={{ color: "#a3a3a3" }} />
          <span className="text-sm" style={{ color: "#737373" }}>Loading…</span>
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}

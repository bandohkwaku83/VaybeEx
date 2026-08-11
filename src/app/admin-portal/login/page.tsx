"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Shield } from "lucide-react";
import { toast } from "sonner";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { ApiError } from "@/lib/api/client";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, isLoading } = useAdminAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const canSubmit =
    Boolean(email.trim()) && Boolean(password.trim()) && !isSubmitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
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
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || isAuthenticated) {
    return (
      <div
        className="flex min-h-screen items-center justify-center text-sm"
        style={{ background: "#f5f5f5", color: "#737373" }}
      >
        {isAuthenticated ? "Redirecting…" : "Checking session…"}
      </div>
    );
  }

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12"
      style={{ background: "#f5f5f5" }}
    >
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <Link href="/" className="mb-6">
            <BrandLogo
              size="lg"
              withWordmark
              accentEx={false}
              wordmarkClassName="text-xl"
              wordmarkStyle={{ color: "#171717" }}
            />
          </Link>

          <div
            className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em]"
            style={{ color: "#a3a3a3" }}
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
          style={{
            borderColor: "#e5e5e5",
            boxShadow: "0 12px 40px -28px rgba(0,0,0,0.15)",
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="admin-email">Email</Label>
              <Input
                id="admin-email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@vaybeex.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-password">Password</Label>
              <div className="relative">
                <Input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2"
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
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={!canSubmit}
              style={{ background: "#171717", color: "#fff" }}
            >
              {isSubmitting ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </div>

        <p
          className="mt-6 text-center text-xs"
          style={{ color: "#a3a3a3" }}
        >
          <Link
            href="/"
            className="transition-colors hover:text-[#171717]"
          >
            ← Back to VaybeEx
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div
          className="flex min-h-screen items-center justify-center"
          style={{ background: "#f5f5f5" }}
        >
          Loading…
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}

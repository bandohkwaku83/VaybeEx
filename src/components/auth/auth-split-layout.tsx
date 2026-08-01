"use client";

import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowLeft, Compass, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuthHighlight {
  icon: LucideIcon;
  label: string;
}

interface AuthSplitLayoutProps {
  children: React.ReactNode;
  eyebrow?: string;
  title: string;
  titleClassName?: string;
  subtitle: React.ReactNode;
  imageSrc?: string;
  imageAlt?: string;
  backHref?: string;
  backLabel?: string;
  brandHref?: string;
  brandSubline?: string;
  showLogo?: boolean;
  compact?: boolean;
  visualBadge?: string;
  visualQuote?: string;
  visualCaption?: string;
  highlights?: AuthHighlight[];
}

export function AuthSplitLayout({
  children,
  eyebrow = "Welcome back",
  title,
  titleClassName,
  subtitle,
  imageSrc = "/images/safarivalley.jpg",
  imageAlt = "Safari valley landscape in Ghana",
  backHref = "/",
  backLabel = "Back to explore",
  brandHref = "/",
  brandSubline,
  showLogo = true,
  compact = false,
  visualBadge,
  visualQuote = "Travel isn't about the miles — it's about the moments you collect.",
  visualCaption = "Join travelers discovering Ghana's coast, forests, and culture.",
  highlights = [],
}: AuthSplitLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row" style={{ background: "var(--bg)" }}>
      <div className="relative h-44 shrink-0 overflow-hidden lg:hidden">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(42,27,15,0.2) 0%, rgba(251,247,241,1) 92%)",
          }}
        />
      </div>

      <div
        className={cn(
          "relative flex flex-1 flex-col py-8",
          compact ? "px-4 sm:px-5 lg:px-6 xl:px-8" : "px-5 sm:px-8 lg:px-14 xl:px-20"
        )}
      >
        <Link
          href={backHref}
          className="mb-8 inline-flex w-fit items-center gap-1.5 text-sm font-medium transition-colors hover:text-[var(--primary)]"
          style={{ color: "var(--text-tertiary)" }}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {backLabel}
        </Link>

        <div
          className={cn(
            "mx-auto flex w-full flex-1 flex-col justify-center pb-8 lg:pb-12",
            compact ? "max-w-lg" : "max-w-md"
          )}
        >
          {showLogo && (
            <Link href={brandHref} className="mb-8 flex items-center gap-2.5 lg:mb-10">
              <div
                className="flex h-10 w-10 items-center justify-center text-white"
                style={{
                  background: "var(--gradient-brand)",
                  borderRadius: "12px",
                  boxShadow: "var(--glow-gold)",
                }}
              >
                <Compass className="h-5 w-5" />
              </div>
              <div>
                <span className="font-display text-xl font-bold" style={{ color: "var(--text)" }}>
                  Vaybe<span style={{ color: "var(--gold)" }}>Ex</span>
                </span>
                {brandSubline && (
                  <p className="text-xs leading-none" style={{ color: "var(--text-tertiary)" }}>
                    {brandSubline}
                  </p>
                )}
              </div>
            </Link>
          )}

          <p
            className="text-xs font-semibold uppercase tracking-[0.18em]"
            style={{ color: "var(--gold)" }}
          >
            {eyebrow}
          </p>
          <h1
            className={cn(
              "font-display mt-2 text-3xl font-bold leading-tight sm:text-4xl",
              titleClassName
            )}
            style={{ color: "var(--text)" }}
          >
            {title}
          </h1>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            {subtitle}
          </p>

          <div
            className={cn("mt-8 rounded-2xl border", compact ? "p-5 sm:p-6" : "p-6 sm:p-7")}
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
              boxShadow:
                "0 24px 60px -28px rgba(86,47,24,0.18), 0 0 0 1px rgba(107,63,29,0.05)",
            }}
          >
            {children}
          </div>
        </div>
      </div>

      <div className="relative hidden min-h-[280px] flex-1 lg:block">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          priority
          className="object-cover"
          sizes="50vw"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(160deg, rgba(42,27,15,0.55) 0%, rgba(74,42,18,0.35) 45%, rgba(42,27,15,0.72) 100%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(251,247,241,0.08) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative flex h-full flex-col p-10 xl:p-14">
          {visualBadge && (
            <div
              className="inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium backdrop-blur-sm"
              style={{
                borderColor: "rgba(251,247,241,0.22)",
                background: "rgba(251,247,241,0.1)",
                color: "rgba(251,247,241,0.9)",
              }}
            >
              <Sparkles className="h-3.5 w-3.5" style={{ color: "var(--gold)" }} />
              {visualBadge}
            </div>
          )}

          <div className="mt-auto">
            <blockquote
              className="font-display max-w-md text-3xl font-bold leading-snug xl:text-4xl"
              style={{ color: "#fbf7f1" }}
            >
              &ldquo;{visualQuote}&rdquo;
            </blockquote>
            <p className="mt-4 text-sm" style={{ color: "rgba(251,247,241,0.65)" }}>
              {visualCaption}
            </p>

            {highlights.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-3">
                {highlights.map(({ icon: Icon, label }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-medium backdrop-blur-sm"
                    style={{
                      borderColor: "rgba(251,247,241,0.18)",
                      background: "rgba(251,247,241,0.08)",
                      color: "rgba(251,247,241,0.88)",
                    }}
                  >
                    <Icon className="h-3.5 w-3.5" style={{ color: "var(--gold)" }} />
                    {label}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

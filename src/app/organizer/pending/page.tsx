"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Bell, CheckCircle2, Clock, LogOut, Mail } from "lucide-react";
import { RequireOrganizerAuth } from "@/components/auth/require-organizer-auth";
import { OrganizerLandingHeader } from "@/components/organizer/landing-header";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

const timeline = [
  {
    title: "Application received",
    desc: "Your profile and ID have been submitted successfully.",
    status: "complete" as const,
  },
  {
    title: "Under review",
    desc: "Our team is verifying your details. This usually takes 1–2 business days.",
    status: "current" as const,
  },
  {
    title: "Approval & notification",
    desc: "We'll email you as soon as you're approved to list trips.",
    status: "upcoming" as const,
  },
];

function PendingReviewContent() {
  const router = useRouter();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (!user) return;
    if (user.organizerStatus === "verified" || !user.organizerStatus) {
      router.replace(
        user.organizerStatus === "verified"
          ? "/organizer/dashboard"
          : "/organizer/onboarding"
      );
    }
  }, [user, router]);

  if (!user || user.organizerStatus !== "pending") {
    return (
      <div className="flex flex-1 items-center justify-center text-text-tertiary">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-[480px]">

        {/* ── Hero ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-7"
        >
          <motion.div
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full
                       bg-gold-dim ring-8 ring-[rgba(196,134,76,0.06)]"
          >
            <Clock className="h-9 w-9 text-gold" />
          </motion.div>

          {/* Status badge */}
          <span className="inline-flex items-center gap-1.5 rounded-full border
                           border-[rgba(208,138,60,0.3)] bg-[rgba(208,138,60,0.1)]
                           px-3 py-1 text-xs font-medium text-amber mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-amber animate-pulse" />
            Verification pending
          </span>

          <h1 className="font-display text-2xl font-bold tracking-tight text-text">
            You&apos;re almost there
          </h1>
          <p className="mt-2.5 max-w-sm mx-auto text-sm leading-relaxed text-text-secondary">
            Thanks, {user.name || "Organizer"}. Your application is under review — we&apos;ll
            notify you as soon as you&apos;re approved to start listing trips.
          </p>
        </motion.div>

        {/* ── Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl border border-border bg-surface
                     shadow-[0_2px_16px_rgba(107,63,29,0.07)] p-6 mb-4"
        >
          {/* Email row */}
          <div className="flex items-start gap-3 rounded-xl border border-border
                          bg-bg-secondary p-4 mb-6">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center
                            rounded-[10px] bg-gradient-brand">
              <Mail className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-text-tertiary mb-0.5">
                We&apos;ll reach you at
              </p>
              <p className="text-sm font-semibold text-primary">{user.email}</p>
              <p className="mt-0.5 text-xs text-text-tertiary">
                No action needed — sit tight and watch your inbox.
              </p>
            </div>
          </div>

          {/* Timeline */}
          <div className="flex flex-col">
            {timeline.map((item, index) => (
              <div key={item.title} className="flex gap-3.5">
                {/* Track */}
                <div className="flex w-8 shrink-0 flex-col items-center">
                  <div
                    className={[
                      "flex h-8 w-8 items-center justify-center rounded-full shrink-0",
                      item.status === "complete"
                        ? "bg-primary-dim text-primary"
                        : item.status === "current"
                          ? "border border-[rgba(196,134,76,0.35)] bg-gold-dim text-gold"
                          : "border border-dashed border-border-strong bg-bg-secondary text-text-tertiary",
                    ].join(" ")}
                  >
                    {item.status === "complete" ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : item.status === "current" ? (
                      <Clock className="h-4 w-4" />
                    ) : (
                      <Bell className="h-4 w-4" />
                    )}
                  </div>
                  {index < timeline.length - 1 && (
                    <div
                      className={[
                        "mt-1 w-px flex-1 min-h-5",
                        item.status === "complete"
                          ? "bg-border-strong"
                          : "bg-border",
                      ].join(" ")}
                      style={
                        item.status !== "complete"
                          ? {
                              background:
                                "repeating-linear-gradient(to bottom, var(--border-strong) 0px, var(--border-strong) 3px, transparent 3px, transparent 7px)",
                            }
                          : undefined
                      }
                    />
                  )}
                </div>

                {/* Body */}
                <div className={`pt-1 ${index < timeline.length - 1 ? "pb-5" : "pb-0"}`}>
                  <p
                    className={`text-sm font-semibold leading-snug mb-0.5 ${
                      item.status === "upcoming" ? "text-text-tertiary" : "text-text"
                    }`}
                  >
                    {item.title}
                  </p>
                  <p
                    className={`text-[13px] leading-relaxed ${
                      item.status === "upcoming"
                        ? "text-text-tertiary"
                        : "text-text-secondary"
                    }`}
                  >
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Sign out ── */}
        <div className="flex justify-center">
          <Button
            variant="ghost"
            className="text-text-tertiary hover:text-coral hover:bg-[rgba(181,82,58,0.06)]
                       text-sm gap-1.5"
            onClick={() => {
              logout();
              router.push("/organizer");
            }}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function OrganizerPendingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-hero">
      <OrganizerLandingHeader />
      <RequireOrganizerAuth>
        <PendingReviewContent />
      </RequireOrganizerAuth>
    </div>
  );
}
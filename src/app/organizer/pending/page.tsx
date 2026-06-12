"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Bell, CheckCircle2, Clock, LogOut, Mail } from "lucide-react";
import { RequireOrganizerAuth } from "@/components/auth/require-organizer-auth";
import { OrganizerLandingHeader } from "@/components/organizer/landing-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";

const timeline = [
  {
    title: "Application received",
    desc: "Your profile and ID have been submitted.",
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
      router.replace(user.organizerStatus === "verified" ? "/organizer/dashboard" : "/organizer/onboarding");
    }
  }, [user, router]);

  if (!user || user.organizerStatus !== "pending") {
    return (
      <div className="flex flex-1 items-center justify-center text-stone-500">Loading...</div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 ring-8 ring-amber-50"
          >
            <Clock className="h-10 w-10 text-amber-600" />
          </motion.div>
          <Badge variant="warning" className="mb-4">
            Verification pending
          </Badge>
          <h1 className="text-3xl font-bold text-stone-900">You&apos;re almost there</h1>
          <p className="text-stone-500 mt-3 max-w-md mx-auto">
            Thanks, {user.name || "Organizer"}. Your application is in review. We&apos;ll notify you
            when your account is approved.
          </p>
        </motion.div>

        <Card className="shadow-lg border-teal-100 mb-6">
          <CardContent className="p-6">
            <div className="flex items-start gap-3 rounded-xl bg-teal-50 p-4 mb-6">
              <Mail className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
              <div className="text-left">
                <p className="text-sm font-medium text-stone-900">We&apos;ll email you at</p>
                <p className="text-sm text-teal-700 font-medium mt-0.5">{user.email}</p>
                <p className="text-xs text-stone-500 mt-1">
                  No action needed right now — sit tight and check your inbox.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {timeline.map((item, index) => (
                <div key={item.title} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={
                        item.status === "complete"
                          ? "flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"
                          : item.status === "current"
                            ? "flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-600"
                            : "flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 text-stone-400"
                      }
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
                        className={`mt-1 w-px flex-1 min-h-6 ${
                          item.status === "complete" ? "bg-emerald-200" : "bg-stone-200"
                        }`}
                      />
                    )}
                  </div>
                  <div className="pb-2">
                    <p className="font-medium text-stone-900">{item.title}</p>
                    <p className="text-sm text-stone-500 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button
            variant="ghost"
            className="text-stone-500 hover:text-red-600"
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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-teal-50 to-stone-50">
      <OrganizerLandingHeader />
      <RequireOrganizerAuth>
        <PendingReviewContent />
      </RequireOrganizerAuth>
    </div>
  );
}

"use client";

import { use } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle, Download, Calendar, Mail, MessageSquare, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getTripById } from "@/lib/mock-data";
import { formatCurrency, formatDateRange } from "@/lib/utils";

export default function BookingConfirmPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ waitlist?: string }>;
}) {
  const { id } = use(params);
  const { waitlist } = use(searchParams);
  const trip = getTripById(id);
  const isWaitlist = waitlist === "true";

  if (!trip) return null;

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100"
      >
        <CheckCircle className="h-10 w-10 text-emerald-600" />
      </motion.div>

      <h1 className="text-2xl font-bold text-stone-900">
        {isWaitlist ? "You're on the waitlist!" : "Booking Confirmed!"}
      </h1>
      <p className="mt-2 text-stone-500">
        {isWaitlist
          ? "We'll send you an email and SMS as soon as a spot opens up."
          : `Your spot on ${trip.title} is secured.`}
      </p>

      <Card className="mt-8 text-left">
        <CardContent className="p-6 space-y-3">
          <h3 className="font-semibold text-stone-900">{trip.title}</h3>
          <p className="text-sm text-stone-500">{formatDateRange(trip.startDate, trip.endDate)}</p>
          {!isWaitlist && (
            <p className="text-sm">
              <span className="text-stone-500">Total: </span>
              <span className="font-semibold">{formatCurrency(trip.price)}</span>
            </p>
          )}
          <p className="text-xs text-stone-400 font-mono">Ref: TRX-{Date.now().toString(36).toUpperCase()}</p>
        </CardContent>
      </Card>

      {!isWaitlist && (
        <div className="mt-6 flex flex-col gap-2">
          <Button variant="outline" className="w-full" onClick={() => alert("PDF receipt downloaded (demo)")}>
            <Download className="h-4 w-4" /> Download PDF Receipt
          </Button>
          <Button variant="outline" className="w-full" onClick={() => alert("Calendar invite added (demo)")}>
            <Calendar className="h-4 w-4" /> Add to Calendar
          </Button>
        </div>
      )}

      <div className="mt-6 flex items-center justify-center gap-4 text-xs text-stone-400">
        <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> Email sent</span>
        <span className="flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" /> SMS sent</span>
      </div>

      <div className="mt-8 flex flex-col gap-2">
        <Button asChild>
          <Link href="/dashboard">Go to Dashboard <ArrowRight className="h-4 w-4" /></Link>
        </Button>
        <Button variant="ghost" asChild>
          <Link href="/">Browse more trips</Link>
        </Button>
      </div>
    </div>
  );
}

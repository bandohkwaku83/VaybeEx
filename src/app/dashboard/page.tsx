/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/purity */
"use client";

import { RequireAuth } from "@/components/auth/require-auth";
import { CancelBookingDialog } from "@/components/dashboard/cancel-booking-dialog";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Calendar, Clock, XCircle, Star, Bell, RefreshCw, CheckCircle2,
  MapPin, Compass, TrendingUp, ArrowRight, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CANCELLATION_STATUS_LABELS,
  getCancellationByBookingId,
  getCancellationRequests,
} from "@/lib/cancellation-requests";
import { userBookings } from "@/lib/mock-data";
import type { Booking, CancellationRequest } from "@/lib/types";
import { formatCurrency, formatDateRange } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

gsap.registerPlugin(ScrollTrigger);

const statusMeta = {
  confirmed: { label: "Confirmed", color: "var(--gold)", bg: "var(--gold-dim)", icon: Calendar },
  pending: { label: "Pending Payment", color: "var(--amber)", bg: "rgba(208,138,60,0.14)", icon: Clock },
  cancelled: { label: "Cancelled", color: "var(--coral)", bg: "rgba(181,82,58,0.1)", icon: XCircle },
  waitlisted: { label: "Waitlisted", color: "var(--text-secondary)", bg: "var(--bg-secondary)", icon: Bell },
};

const cancellationStatusMeta: Record<CancellationRequest["status"], { color: string; bg: string }> = {
  pending: { color: "var(--amber)", bg: "rgba(208,138,60,0.14)" },
  processing: { color: "var(--text-secondary)", bg: "var(--bg-secondary)" },
  refunded: { color: "var(--gold)", bg: "var(--gold-dim)" },
  denied: { color: "var(--coral)", bg: "rgba(181,82,58,0.1)" },
};

interface BookingCardProps {
  booking: Booking;
  hasCancellation: boolean;
  onRequestCancel: (booking: Booking) => void;
}

function BookingCard({ booking, hasCancellation, onRequestCancel }: BookingCardProps) {
  const meta = statusMeta[booking.status];
  const Icon = meta.icon;
  const isPast = new Date(booking.endDate) < new Date();

  return (
    <div
      className="dash-reveal group overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-1"
      style={{ borderColor: "var(--border)", background: "var(--surface)" }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.boxShadow = "var(--glow-teal)")}
      onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.boxShadow = "none")}
    >
      <div className="flex flex-col sm:flex-row">
        <div className="relative h-44 shrink-0 overflow-hidden sm:h-auto sm:w-52">
          <Image
            src={booking.image}
            alt={booking.tripTitle}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div
            className="absolute inset-0 sm:bg-gradient-to-r sm:from-transparent sm:to-[rgba(255,255,255,0.04)]"
            style={{ background: "linear-gradient(to top, rgba(42,27,15,0.35), transparent 50%)" }}
          />
        </div>
        <div className="flex flex-1 flex-col justify-between p-5">
          <div>
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-display font-bold" style={{ color: "var(--text)" }}>{booking.tripTitle}</h3>
                <p className="mt-0.5 flex items-center gap-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                  <MapPin className="h-3.5 w-3.5" /> {booking.destination}
                </p>
              </div>
              <span
                className="inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
                style={{ background: meta.bg, color: meta.color }}
              >
                <Icon className="h-3 w-3" />
                {meta.label}
              </span>
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-sm" style={{ color: "var(--text-tertiary)" }}>
              <Calendar className="h-3.5 w-3.5" />
              {formatDateRange(booking.startDate, booking.endDate)} · {booking.travelers} traveler{booking.travelers > 1 ? "s" : ""}
            </p>
            {booking.amount > 0 && (
              <p className="mt-1.5 text-sm">
                <span style={{ color: "var(--text-tertiary)" }}>Amount: </span>
                <span className="font-semibold" style={{ color: "var(--text)" }}>{formatCurrency(booking.amount)}</span>
                {booking.paymentStatus === "partial" && (
                  <span
                    className="ml-2 rounded-full px-2 py-0.5 text-xs font-medium"
                    style={{ background: "rgba(208,138,60,0.14)", color: "var(--amber)" }}
                  >
                    Partial
                  </span>
                )}
              </p>
            )}
          </div>
          <div className="mt-4 flex gap-2">
            <Button
              size="sm"
              variant="outline"
              asChild
              className="rounded-xl"
              style={{ borderColor: "var(--border-strong)", color: "var(--text)" }}
            >
              <Link href={`/trips/${booking.tripId}`}>View Trip</Link>
            </Button>
            {booking.status === "confirmed" && isPast && (
              <Button
                size="sm"
                variant="ghost"
                asChild
                className="rounded-xl"
                style={{ color: "var(--primary)" }}
              >
                <Link href={`/reviews/${booking.tripId}`}>
                  <Star className="h-3.5 w-3.5" /> Leave Review
                </Link>
              </Button>
            )}
            {booking.status === "confirmed" && !isPast && !hasCancellation && (
              <Button
                size="sm"
                variant="ghost"
                className="rounded-xl"
                style={{ color: "var(--coral)" }}
                onClick={() => onRequestCancel(booking)}
              >
                Request Cancellation
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CancellationCard({ request }: { request: CancellationRequest }) {
  const meta = cancellationStatusMeta[request.status];
  return (
    <div
      className="dash-reveal rounded-2xl border p-5"
      style={{ borderColor: "var(--border)", background: "var(--surface)" }}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display font-bold" style={{ color: "var(--text)" }}>{request.tripTitle}</h3>
            <span
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
              style={{ background: meta.bg, color: meta.color }}
            >
              {request.status === "refunded" && <CheckCircle2 className="h-3 w-3" />}
              {request.status === "processing" && <RefreshCw className="h-3 w-3" />}
              {CANCELLATION_STATUS_LABELS[request.status]}
            </span>
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-sm" style={{ color: "var(--text-secondary)" }}>
            <MapPin className="h-3.5 w-3.5" />
            {request.destination} · Departs {new Date(request.startDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
          </p>
          {request.reason && (
            <p className="mt-2 text-sm italic" style={{ color: "var(--text-secondary)" }}>&ldquo;{request.reason}&rdquo;</p>
          )}
        </div>
        <div className="shrink-0 space-y-1 text-sm sm:text-right">
          <p>
            <span style={{ color: "var(--text-tertiary)" }}>Paid: </span>
            <span className="font-medium" style={{ color: "var(--text)" }}>{formatCurrency(request.amountPaid)}</span>
          </p>
          <p>
            <span style={{ color: "var(--text-tertiary)" }}>Refund: </span>
            <span className="font-medium" style={{ color: request.refundEligible ? "var(--gold)" : "var(--text-tertiary)" }}>
              {formatCurrency(request.refundAmount)}
            </span>
          </p>
          {request.refundDestination && request.status !== "denied" && (
            <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>{request.refundDestination}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function DashboardContent() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>(userBookings);
  const [cancellations, setCancellations] = useState<CancellationRequest[]>([]);
  const [cancelBooking, setCancelBooking] = useState<Booking | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [activeTabOverride, setActiveTabOverride] = useState<string | null>(null);
  const activeTab = activeTabOverride ?? "upcoming";

  const refreshCancellations = useCallback(() => {
    setCancellations(getCancellationRequests());
  }, []);

  useEffect(() => {
    refreshCancellations();
  }, [refreshCancellations]);

  const handleRequestCancel = (booking: Booking) => {
    setCancelBooking(booking);
    setCancelDialogOpen(true);
  };

  const handleCancellationSubmitted = (request: CancellationRequest) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === request.bookingId ? { ...b, status: "cancelled" as const } : b))
    );
    refreshCancellations();
  };

  const upcoming = bookings.filter((b) => new Date(b.endDate) >= new Date() && b.status !== "cancelled");
  const past = bookings.filter((b) => new Date(b.endDate) < new Date());
  const waitlisted = bookings.filter((b) => b.status === "waitlisted");
  const totalSpent = bookings.reduce((s, b) => s + (b.amount || 0), 0);

  const nextTrip = upcoming
    .slice()
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())[0];
  const daysUntilNext = nextTrip
    ? Math.max(0, Math.ceil((new Date(nextTrip.startDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;


  const pageRef = useRef<HTMLDivElement>(null);
  const heroCounterRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".dash-hero-anim",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: "power3.out" }
      );
    }, pageRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!heroCounterRef.current) return;
    const obj = { val: 0 };
    gsap.to(obj, {
      val: totalSpent,
      duration: 1.2,
      ease: "power2.out",
      onUpdate: () => {
        if (heroCounterRef.current) heroCounterRef.current.textContent = formatCurrency(Math.round(obj.val));
      },
    });
  }, [totalSpent]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".dash-reveal",
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.06, ease: "power2.out" }
      );
    }, pageRef);
    return () => ctx.revert();
  }, [activeTab, bookings.length, cancellations.length]);

  return (
    <div ref={pageRef} className="mx-auto w-full mt-10 px-4 py-8 sm:px-6 lg:px-8" style={{ background: "var(--bg)" }}>
      {/* ── Hero header ────────────────────────────────────────── */}
      <div className="dash-hero-anim mb-6">
        <h1 className="font-display text-2xl font-bold" style={{ color: "var(--text)" }}>
          Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
          Manage your trips, bookings, and cancellation requests.
        </p>
      </div>

      {/* ── Next trip spotlight ────────────────────────────────── */}
      {nextTrip && (
        <div
          className="dash-hero-anim relative mb-6 overflow-hidden rounded-2xl"
          style={{ background: "var(--gradient-teal)" }}
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{ backgroundImage: "radial-gradient(circle, rgba(251,247,241,0.14) 1px, transparent 1px)", backgroundSize: "26px 26px" }}
          />
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full opacity-25 blur-3xl"
            style={{ background: "var(--gold)" }}
          />
          <div className="relative flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--gold)" }}>
                <Sparkles className="h-3.5 w-3.5" /> Your next adventure
              </span>
              <h2 className="font-display mt-2 text-xl font-bold sm:text-2xl" style={{ color: "#fbf7f1" }}>
                {nextTrip.tripTitle}
              </h2>
              <p className="mt-1 flex items-center gap-1.5 text-sm" style={{ color: "rgba(251,247,241,0.75)" }}>
                <MapPin className="h-3.5 w-3.5" /> {nextTrip.destination}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-display text-3xl font-black" style={{ color: "var(--gold)" }}>{daysUntilNext}</p>
                <p className="text-xs" style={{ color: "rgba(251,247,241,0.65)" }}>day{daysUntilNext === 1 ? "" : "s"} to go</p>
              </div>
              <Button asChild className="rounded-xl" style={{ background: "#fbf7f1", color: "var(--primary)" }}>
                <Link href={`/trips/${nextTrip.tripId}`}>
                  View Trip <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Stat row ───────────────────────────────────────────── */}
      <div className="dash-hero-anim mb-8 grid gap-4 sm:grid-cols-4">
        <StatTile icon={Compass} label="Upcoming" value={upcoming.length} accent="var(--primary)" />
        <StatTile icon={Calendar} label="Past Trips" value={past.length} accent="var(--text-secondary)" />
        <StatTile icon={Bell} label="Waitlisted" value={waitlisted.length} accent="var(--amber)" />
        <div
          className="rounded-2xl border p-4"
          style={{ borderColor: "var(--border)", background: "var(--surface)" }}
        >
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: "var(--gold-dim)" }}>
              <TrendingUp className="h-4 w-4" style={{ color: "var(--gold)" }} />
            </div>
            <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>Total spent</span>
          </div>
          <p className="font-display mt-2 text-xl font-bold" style={{ color: "var(--text)" }}>
            <span ref={heroCounterRef}>{formatCurrency(0)}</span>
          </p>
        </div>
      </div>

      {/* ── Tabs ───────────────────────────────────────────────── */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTabOverride(v)}>
        <TabsList className="rounded-xl p-1" style={{ background: "var(--bg-secondary)" }}>
          <TabsTrigger value="upcoming" className="rounded-lg data-[state=active]:shadow-sm">Upcoming ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="past" className="rounded-lg data-[state=active]:shadow-sm">Past ({past.length})</TabsTrigger>
          <TabsTrigger value="history" className="rounded-lg data-[state=active]:shadow-sm">Booking History</TabsTrigger>
          <TabsTrigger
            value="cancellations"
            className="rounded-lg data-[state=active]:shadow-sm"
            onClick={refreshCancellations}
          >
            Cancellations ({cancellations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-4 space-y-4">
          {upcoming.length === 0 ? (
            <EmptyState
              icon={Compass}
              title="No upcoming trips"
              action={<Link href="/" style={{ color: "var(--primary)" }} className="font-medium hover:underline">Browse trips</Link>}
            />
          ) : upcoming.map((b) => (
            <BookingCard
              key={b.id}
              booking={b}
              hasCancellation={Boolean(getCancellationByBookingId(b.id))}
              onRequestCancel={handleRequestCancel}
            />
          ))}
        </TabsContent>

        <TabsContent value="past" className="mt-4 space-y-4">
          {past.length === 0 ? (
            <EmptyState icon={Calendar} title="No past trips yet" />
          ) : past.map((b) => (
            <BookingCard
              key={b.id}
              booking={b}
              hasCancellation={Boolean(getCancellationByBookingId(b.id))}
              onRequestCancel={handleRequestCancel}
            />
          ))}
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card className="dash-reveal border shadow-none" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
            <CardHeader>
              <CardTitle className="font-display text-base" style={{ color: "var(--text)" }}>All Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                {bookings.map((b) => {
                  const meta = statusMeta[b.status];
                  return (
                    <div key={b.id} className="flex items-center justify-between py-3 text-sm" style={{ borderColor: "var(--border)" }}>
                      <div>
                        <p className="font-medium" style={{ color: "var(--text)" }}>{b.tripTitle}</p>
                        <p style={{ color: "var(--text-tertiary)" }}>{formatDateRange(b.startDate, b.endDate)}</p>
                      </div>
                      <div className="text-right">
                        <span
                          className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
                          style={{ background: meta.bg, color: meta.color }}
                        >
                          {meta.label}
                        </span>
                        {b.amount > 0 && <p className="mt-1" style={{ color: "var(--text-secondary)" }}>{formatCurrency(b.amount)}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cancellations" className="mt-4 space-y-4">
          {cancellations.length === 0 ? (
            <EmptyState
              icon={XCircle}
              title="No cancellation requests yet"
              subtitle="Request a cancellation from any confirmed upcoming trip."
            />
          ) : (
            cancellations.map((request) => <CancellationCard key={request.id} request={request} />)
          )}
        </TabsContent>
      </Tabs>

      <CancelBookingDialog
        booking={cancelBooking}
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        onSubmitted={handleCancellationSubmitted}
      />
    </div>
  );
}

function StatTile({
  icon: Icon, label, value, accent,
}: { icon: typeof Compass; label: string; value: number; accent: string }) {
  return (
    <div className="rounded-2xl border p-4" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: "var(--primary-dim)" }}>
          <Icon className="h-4 w-4" style={{ color: accent }} />
        </div>
        <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>{label}</span>
      </div>
      <p className="font-display mt-2 text-2xl font-bold" style={{ color: "var(--text)" }}>{value}</p>
    </div>
  );
}

function EmptyState({
  icon: Icon, title, subtitle, action,
}: { icon: typeof Compass; title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div
      className="dash-reveal flex flex-col items-center justify-center rounded-2xl border p-10 text-center"
      style={{ borderColor: "var(--border)", background: "var(--surface)" }}
    >
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: "var(--bg-secondary)" }}>
        <Icon className="h-6 w-6" style={{ color: "var(--text-tertiary)" }} />
      </div>
      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
        {title}{action && <>. {action}</>}
      </p>
      {subtitle && <p className="mt-1 text-xs" style={{ color: "var(--text-tertiary)" }}>{subtitle}</p>}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <RequireAuth>
      <DashboardContent />
    </RequireAuth>
  );
}
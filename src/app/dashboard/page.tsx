/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/purity */
"use client";

import { RequireAuth } from "@/components/auth/require-auth";
import { CancelBookingDialog } from "@/components/dashboard/cancel-booking-dialog";
import { MediaImage } from "@/components/ui/media-image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import gsap from "gsap";
import {
  Calendar,
  Clock,
  XCircle,
  Star,
  Bell,
  RefreshCw,
  CheckCircle2,
  MapPin,
  Compass,
  ArrowRight,
  Users,
  ChevronRight,
  History,
  Loader2,
} from "lucide-react";
import {
  CANCELLATION_STATUS_LABELS,
} from "@/lib/cancellation-requests";
import { listMyCancellations } from "@/lib/api/cancellations";
import { listMyBookings, payBooking } from "@/lib/api/bookings";
import { ApiError } from "@/lib/api/client";
import type { Booking, CancellationRequest } from "@/lib/types";
import { formatCurrency, formatDateRange, cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

async function resumeBookingPayment(
  bookingId: string,
  paymentAmount: number
) {
  const callbackUrl = `${window.location.origin}/booking/callback?return=${encodeURIComponent("/dashboard")}`;
  const res = await payBooking(bookingId, { callbackUrl, paymentAmount });
  const url = res.data?.paystackAuthorizationUrl;
  if (!url) throw new ApiError("Payment link unavailable.", 500);
  window.location.href = url;
}

function paymentBadge(booking: Booking): {
  label: string;
  color: string;
  bg: string;
} | null {
  if (booking.status === "pending" || booking.paymentStatus === "pending") {
    return {
      label: "Complete payment",
      color: "var(--amber)",
      bg: "rgba(208,138,60,0.14)",
    };
  }
  if (booking.paymentStatus === "partial") {
    return {
      label: "Partial · Pay balance",
      color: "var(--primary)",
      bg: "var(--primary-dim)",
    };
  }
  if (booking.paymentStatus === "paid") {
    return {
      label: "Paid",
      color: "var(--gold)",
      bg: "var(--gold-dim)",
    };
  }
  return null;
}

const statusMeta = {
  confirmed: { label: "Confirmed", color: "var(--gold)", bg: "var(--gold-dim)", icon: Calendar },
  pending: { label: "Pending Payment", color: "var(--amber)", bg: "rgba(208,138,60,0.14)", icon: Clock },
  cancelled: { label: "Cancelled", color: "var(--coral)", bg: "rgba(181,82,58,0.1)", icon: XCircle },
  waitlisted: { label: "Waitlisted", color: "var(--text-secondary)", bg: "var(--bg-secondary)", icon: Bell },
};

const cancellationStatusMeta: Record<
  CancellationRequest["status"],
  { color: string; bg: string }
> = {
  pending: { color: "var(--amber)", bg: "rgba(208,138,60,0.14)" },
  processing: { color: "var(--text-secondary)", bg: "var(--bg-secondary)" },
  refunded: { color: "var(--gold)", bg: "var(--gold-dim)" },
  denied: { color: "var(--coral)", bg: "rgba(181,82,58,0.1)" },
};

type TabKey = "upcoming" | "past" | "history" | "cancellations";

const TABS: { key: TabKey; label: string; icon: typeof Compass }[] = [
  { key: "upcoming", label: "Upcoming", icon: Compass },
  { key: "history", label: "All bookings", icon: Calendar },
  { key: "cancellations", label: "Cancellations", icon: XCircle },
  { key: "past", label: "Past", icon: History },
];

interface BookingCardProps {
  booking: Booking;
  hasCancellation: boolean;
  onRequestCancel: (booking: Booking) => void;
  onPay?: (booking: Booking) => void;
  payingId?: string | null;
  variant?: "featured" | "row";
}

function BookingCard({
  booking,
  hasCancellation,
  onRequestCancel,
  onPay,
  payingId,
  variant = "featured",
}: BookingCardProps) {
  const meta = statusMeta[booking.status];
  const Icon = meta.icon;
  const isPast = new Date(booking.endDate) < new Date();
  const paymentPct =
    booking.amount > 0
      ? Math.min(100, Math.round((booking.amountPaid / booking.amount) * 100))
      : 0;
  const canPay =
    (booking.status === "pending" ||
      booking.paymentStatus === "pending" ||
      booking.paymentStatus === "partial") &&
    booking.paymentStatus !== "paid" &&
    Boolean(onPay);
  const payLabel =
    booking.paymentStatus === "partial" ? "Pay balance" : "Complete payment";
  const badge = paymentBadge(booking);

  if (variant === "row") {
    return (
      <div className="dash-reveal group flex gap-4 border-b border-border py-5 last:border-b-0 sm:gap-5">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden bg-bg-secondary sm:h-24 sm:w-28">
          <MediaImage
            src={booking.image}
            alt={booking.tripTitle}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="112px"
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center">
            <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate font-display text-lg font-bold text-text">
                {booking.tripTitle}
              </h3>
              <p className="mt-1 flex flex-wrap items-center gap-x-2 text-sm text-text-secondary">
                <span className="inline-flex items-center gap-1">
                  <MapPin size={12} className="text-gold" />
                  {booking.destination}
                </span>
                <span className="text-text-tertiary">·</span>
                <span>{formatDateRange(booking.startDate, booking.endDate)}</span>
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {badge && (
                <span
                  className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold"
                  style={{ color: badge.color, background: badge.bg }}
                >
                  {badge.label}
                </span>
              )}
              <StatusBadge meta={meta} Icon={Icon} />
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <Link
              href={`/trips/${booking.tripId}`}
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-primary-dark"
            >
              View trip <ChevronRight size={14} />
            </Link>
            {canPay && (
              <button
                type="button"
                className="inline-flex items-center gap-1 text-sm font-semibold text-amber transition-colors hover:opacity-80 disabled:opacity-50"
                disabled={payingId === booking.id}
                onClick={() => onPay?.(booking)}
              >
                {payingId === booking.id ? "Opening Paystack…" : payLabel}
              </button>
            )}
            {booking.status === "confirmed" && isPast && (
              <Link
                href={`/reviews/${booking.tripId}`}
                className="inline-flex items-center gap-1 text-sm font-semibold text-gold transition-colors hover:text-primary"
              >
                <Star size={13} /> Leave review
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <article className="dash-reveal group flex flex-col">
      <Link href={`/trips/${booking.tripId}`} className="relative aspect-[5/4] overflow-hidden bg-bg-secondary">
        <MediaImage
          src={booking.image}
          alt={booking.tripTitle}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <div className="absolute left-4 top-4">
          <StatusBadge meta={meta} Icon={Icon} light />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="flex items-center gap-1.5 text-xs text-white/80">
            <MapPin size={12} /> {booking.destination}
          </p>
        </div>
      </Link>

      <div className="flex flex-1 flex-col pt-4">
        <h3 className="font-display text-xl font-bold leading-tight text-text transition-colors group-hover:text-primary">
          {booking.tripTitle}
        </h3>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-text-secondary">
          <span className="inline-flex items-center gap-1.5">
            <Calendar size={13} className="text-gold" />
            {formatDateRange(booking.startDate, booking.endDate)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Users size={13} className="text-gold" />
            {booking.travelers} traveler{booking.travelers > 1 ? "s" : ""}
          </span>
        </div>

        {booking.amount > 0 && (
          <div className="mt-4 border-t border-border pt-4">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-text-tertiary">Total</p>
                <p className="font-display text-lg font-bold text-text">
                  {formatCurrency(booking.amount)}
                </p>
              </div>
              {booking.paymentStatus === "paid" && (
                <p className="inline-flex items-center gap-1 text-xs font-medium text-gold">
                  <CheckCircle2 size={12} /> Paid
                </p>
              )}
              {badge && booking.paymentStatus !== "paid" && (
                <span
                  className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold"
                  style={{ color: badge.color, background: badge.bg }}
                >
                  {badge.label}
                </span>
              )}
            </div>
            {booking.paymentStatus === "partial" && (
              <div className="mt-3">
                <div className="mb-1.5 flex justify-between text-xs text-text-tertiary">
                  <span>Paid {formatCurrency(booking.amountPaid)}</span>
                  <span>
                    {booking.remainingBalance
                      ? `Due ${formatCurrency(booking.remainingBalance)}`
                      : `${paymentPct}%`}
                  </span>
                </div>
                <div className="h-1 overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${paymentPct}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 pt-5">
          <Link
            href={`/trips/${booking.tripId}`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary-dark"
          >
            View trip <ArrowRight size={14} />
          </Link>
          {canPay && (
            <button
              type="button"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber transition-colors hover:opacity-80 disabled:opacity-50"
              disabled={payingId === booking.id}
              onClick={() => onPay?.(booking)}
            >
              {payingId === booking.id ? "Opening Paystack…" : payLabel}
            </button>
          )}
          {booking.status === "confirmed" && isPast && (
            <Link
              href={`/reviews/${booking.tripId}`}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-text-secondary transition-colors hover:text-primary"
            >
              <Star size={13} /> Review
            </Link>
          )}
          {booking.status === "confirmed" && !isPast && !hasCancellation && (
            <button
              type="button"
              className="text-sm font-semibold text-coral transition-colors hover:opacity-80"
              onClick={() => onRequestCancel(booking)}
            >
              Request refund
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

function StatusBadge({
  meta,
  Icon,
  light = false,
}: {
  meta: (typeof statusMeta)[keyof typeof statusMeta];
  Icon: typeof Calendar;
  light?: boolean;
}) {
  return (
    <span
      className="inline-flex shrink-0 items-center gap-1 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider"
      style={
        light
          ? {
              background: "rgba(251,247,241,0.18)",
              color: "#fbf7f1",
              border: "1px solid rgba(251,247,241,0.25)",
            }
          : { background: meta.bg, color: meta.color }
      }
    >
      <Icon className="h-3 w-3" />
      {meta.label}
    </span>
  );
}

function CancellationCard({ request }: { request: CancellationRequest }) {
  const meta = cancellationStatusMeta[request.status];
  return (
    <div className="dash-reveal border-b border-border py-6 last:border-b-0">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-lg font-bold text-text">{request.tripTitle}</h3>
            <span
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider"
              style={{ background: meta.bg, color: meta.color }}
            >
              {request.status === "refunded" && <CheckCircle2 className="h-3 w-3" />}
              {request.status === "processing" && <RefreshCw className="h-3 w-3" />}
              {CANCELLATION_STATUS_LABELS[request.status]}
            </span>
          </div>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-text-secondary">
            <MapPin size={13} className="text-gold" />
            {request.destination} · Departs{" "}
            {new Date(request.startDate).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
          {request.reason && (
            <p className="mt-3 max-w-xl text-sm italic text-text-secondary">
              &ldquo;{request.reason}&rdquo;
            </p>
          )}
          {request.status === "refunded" && (
            <p className="mt-2 text-sm text-text-secondary">
              Refunded to your original payment method
              {request.refundDestination ? ` (${request.refundDestination})` : ""}.
            </p>
          )}
          {request.status === "processing" && (
            <p className="mt-2 text-sm text-text-secondary">
              Refund is on the way to your original payment method
              {request.refundDestination ? ` (${request.refundDestination})` : ""}.
            </p>
          )}
          {request.status === "denied" && (
            <p className="mt-2 text-sm text-text-secondary">
              Cancelled without a refund.
            </p>
          )}
        </div>
        <div className="flex shrink-0 gap-8 sm:flex-col sm:gap-2 sm:text-right">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-text-tertiary">Paid</p>
            <p className="font-display font-bold text-text">
              {formatCurrency(request.amountPaid)}
            </p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-text-tertiary">Refund</p>
            <p
              className={cn(
                "font-display font-bold",
                request.refundEligible ? "text-gold" : "text-text-tertiary",
              )}
            >
              {formatCurrency(request.refundAmount)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function NextTripHero({ trip, daysUntil }: { trip: Booking; daysUntil: number }) {
  return (
    <div className="dash-hero-anim relative overflow-hidden">
      <div className="relative min-h-[240px] sm:min-h-[280px]">
        <MediaImage
          src={trip.image}
          alt={trip.tripTitle}
          fill
          className="object-cover"
          sizes="(max-width: 1280px) 100vw, 1280px"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/20" />

        <div className="relative flex h-full min-h-[240px] flex-col justify-between p-6 sm:min-h-[280px] sm:flex-row sm:items-end sm:p-8 lg:p-10">
          <div className="max-w-xl">
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">
              Next adventure
            </span>
            <h2 className="mt-3 font-display text-3xl font-bold leading-tight text-[#fbf7f1] sm:text-4xl">
              {trip.tripTitle}
            </h2>
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/75">
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={14} /> {trip.destination}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar size={14} /> {formatDateRange(trip.startDate, trip.endDate)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Users size={14} /> {trip.travelers} traveler
                {trip.travelers > 1 ? "s" : ""}
              </span>
            </div>
          </div>

          <div className="mt-8 flex items-end gap-6 sm:mt-0">
            <div>
              <p className="font-display text-5xl font-bold leading-none text-gold">{daysUntil}</p>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/65">
                day{daysUntil === 1 ? "" : "s"} to go
              </p>
            </div>
            <Link
              href={`/trips/${trip.tripId}`}
              className="inline-flex items-center gap-1.5 bg-[#fbf7f1] px-5 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-white"
            >
              View trip <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardEmpty({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="dash-reveal relative overflow-hidden">
      <div className="relative min-h-[20rem] sm:min-h-[22rem]">
        <MediaImage
          src="/images/beautiful-nature.jpg"
          alt=""
          fill
          sizes="(max-width: 1280px) 100vw, 1280px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg)] via-[var(--bg)]/92 to-[var(--bg)]/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-transparent to-[var(--bg)]/40" />

        <div className="relative flex min-h-[20rem] max-w-lg flex-col justify-center px-1 py-10 sm:min-h-[22rem] sm:px-2 sm:py-12">
          <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
            {eyebrow}
          </span>
          <h3 className="mt-3 font-display text-3xl font-bold text-text sm:text-4xl">
            {title}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-text-secondary sm:text-base">
            {description}
          </p>
          {action}
        </div>
      </div>
    </div>
  );
}

function DashboardContent() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [cancellations, setCancellations] = useState<CancellationRequest[]>([]);
  const [cancellationsLoading, setCancellationsLoading] = useState(true);
  const [cancelBooking, setCancelBooking] = useState<Booking | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("upcoming");
  const [payingId, setPayingId] = useState<string | null>(null);

  const refreshCancellations = useCallback(async () => {
    setCancellationsLoading(true);
    try {
      const res = await listMyCancellations({ limit: 50 });
      setCancellations(res.data?.requests ?? []);
    } catch (err) {
      setCancellations([]);
      toast.error(
        err instanceof ApiError
          ? err.message
          : "Unable to load cancellation requests.",
      );
    } finally {
      setCancellationsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshCancellations();
  }, [refreshCancellations]);

  const cancelledBookingIds = new Set(cancellations.map((c) => c.bookingId));

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setBookingsLoading(true);
      try {
        const res = await listMyBookings({ limit: 50 });
        if (!cancelled) setBookings(res.data?.bookings ?? []);
      } catch (err) {
        if (!cancelled) {
          setBookings([]);
          toast.error(
            err instanceof ApiError ? err.message : "Unable to load your bookings.",
          );
        }
      } finally {
        if (!cancelled) setBookingsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleRequestCancel = (booking: Booking) => {
    setCancelBooking(booking);
    setCancelDialogOpen(true);
  };

  const handlePay = async (booking: Booking) => {
    setPayingId(booking.id);
    try {
      const due =
        booking.remainingBalance && booking.remainingBalance > 0
          ? booking.remainingBalance
          : Math.max(0, booking.amount - booking.amountPaid) || booking.amount;
      if (!(due > 0)) {
        throw new ApiError("No amount due on this booking.", 400);
      }
      await resumeBookingPayment(booking.id, due);
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? err.message
          : "Could not start payment. Please try again.",
      );
      setPayingId(null);
    }
  };

  const handleCancellationSubmitted = (request: CancellationRequest) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === request.bookingId ? { ...b, status: "cancelled" as const } : b,
      ),
    );
    setCancellations((prev) => [
      request,
      ...prev.filter((c) => c.id !== request.id && c.bookingId !== request.bookingId),
    ]);
  };

  const upcoming = bookings.filter(
    (b) => new Date(b.endDate) >= new Date() && b.status !== "cancelled",
  );
  const past = bookings.filter((b) => new Date(b.endDate) < new Date());
  const waitlisted = bookings.filter((b) => b.status === "waitlisted");
  const totalSpent = bookings.reduce((s, b) => s + (b.amountPaid || 0), 0);

  const nextTrip = upcoming
    .filter((b) => b.status === "confirmed")
    .slice()
    .sort(
      (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
    )[0];

  const daysUntilNext = nextTrip
    ? Math.max(
        0,
        Math.ceil(
          (new Date(nextTrip.startDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
        ),
      )
    : null;

  const tabCounts: Record<TabKey, number> = {
    upcoming: upcoming.length,
    past: past.length,
    history: bookings.length,
    cancellations: cancellations.length,
  };

  const pageRef = useRef<HTMLDivElement>(null);
  const spentRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".dash-hero-anim",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: "power3.out" },
      );
    }, pageRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!spentRef.current) return;
    const obj = { val: 0 };
    gsap.to(obj, {
      val: totalSpent,
      duration: 1.2,
      ease: "power2.out",
      onUpdate: () => {
        if (spentRef.current) {
          spentRef.current.textContent = formatCurrency(Math.round(obj.val));
        }
      },
    });
  }, [totalSpent]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".dash-reveal",
        { y: 18, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.45, stagger: 0.06, ease: "power2.out" },
      );
    }, pageRef);
    return () => ctx.revert();
  }, [activeTab, bookings.length, cancellations.length]);

  const firstName = user?.name?.split(" ")[0];

  return (
    <div ref={pageRef} className="min-h-screen bg-bg">
      <div className="mx-auto max-w-7xl px-4 pb-20 pt-24 sm:px-6 sm:pb-28 sm:pt-28 lg:px-8">
        {/* Header */}
        <header className="dash-hero-anim mb-10 sm:mb-12">
          <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
            Your journeys
          </span>
          <div className="mt-3 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <h1 className="font-display text-4xl font-bold text-text sm:text-5xl">
                My Trips
              </h1>
              <p className="mt-3 text-base text-text-secondary sm:text-lg">
                {firstName ? `Welcome back, ${firstName}. ` : ""}
                Track bookings, payments, and cancellations in one place.
              </p>
            </div>
            <Link
              href="/expeditions"
              className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary-dark"
            >
              Browse expeditions <ArrowRight size={14} />
            </Link>
          </div>
        </header>

        {/* Next trip */}
        {nextTrip && daysUntilNext !== null && (
          <div className="mb-12">
            <NextTripHero trip={nextTrip} daysUntil={daysUntilNext} />
          </div>
        )}

        {/* Metrics — typography strip, not card grid */}
        <div className="dash-hero-anim mb-10 grid grid-cols-2 gap-x-6 gap-y-8 border-y border-border py-8 sm:grid-cols-4 sm:gap-8">
          <Metric label="Upcoming" value={String(upcoming.length)} />
          <Metric label="Past trips" value={String(past.length)} />
          <Metric label="Waitlisted" value={String(waitlisted.length)} />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-tertiary">
              Total spent
            </p>
            <p className="mt-2 font-display text-3xl font-bold text-text sm:text-4xl">
              <span ref={spentRef}>{formatCurrency(0)}</span>
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="dash-hero-anim mb-8 flex gap-1 overflow-x-auto border-b border-border">
          {TABS.map(({ key, label }) => {
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setActiveTab(key);
                  if (key === "cancellations") void refreshCancellations();
                }}
                className={cn(
                  "relative shrink-0 px-4 py-3.5 text-sm font-semibold transition-colors",
                  isActive ? "text-text" : "text-text-secondary hover:text-text",
                )}
              >
                <span className="inline-flex items-center gap-2">
                  {label}
                  <span
                    className={cn(
                      "text-xs tabular-nums",
                      isActive ? "text-primary" : "text-text-tertiary",
                    )}
                  >
                    {tabCounts[key]}
                  </span>
                </span>
                {isActive && (
                  <span className="absolute inset-x-4 bottom-0 h-0.5 bg-primary" />
                )}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="min-w-0">
          {bookingsLoading ? (
            <div className="grid gap-8 sm:grid-cols-2">
              {[0, 1].map((i) => (
                <div key={i} className="space-y-4">
                  <div className="aspect-[5/4] animate-pulse bg-bg-secondary" />
                  <div className="h-5 w-2/3 animate-pulse bg-bg-secondary" />
                  <div className="h-4 w-1/2 animate-pulse bg-bg-secondary" />
                </div>
              ))}
            </div>
          ) : activeTab === "upcoming" ? (
            upcoming.length === 0 ? (
              <DashboardEmpty
                eyebrow="Nothing booked"
                title="No upcoming trips yet"
                description="When you book an expedition, it will show up here with dates, payments, and trip details."
                action={
                  <Link
                    href="/expeditions"
                    className="mt-7 inline-flex items-center gap-1.5 bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-dark"
                  >
                    Explore expeditions <ArrowRight size={14} />
                  </Link>
                }
              />
            ) : (
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {upcoming.map((b) => (
                  <BookingCard
                    key={b.id}
                    booking={b}
                    hasCancellation={
                      b.status === "cancelled" || cancelledBookingIds.has(b.id)
                    }
                    onRequestCancel={handleRequestCancel}
                    onPay={handlePay}
                    payingId={payingId}
                  />
                ))}
              </div>
            )
          ) : null}

          {!bookingsLoading && activeTab === "past" && (
            past.length === 0 ? (
              <DashboardEmpty
                eyebrow="History"
                title="No past trips yet"
                description="Completed adventures will appear here once you’ve travelled."
              />
            ) : (
              <div>
                {past.map((b) => (
                  <BookingCard
                    key={b.id}
                    booking={b}
                    variant="row"
                    hasCancellation={
                      b.status === "cancelled" || cancelledBookingIds.has(b.id)
                    }
                    onRequestCancel={handleRequestCancel}
                    onPay={handlePay}
                    payingId={payingId}
                  />
                ))}
              </div>
            )
          )}

          {!bookingsLoading && activeTab === "history" && (
            bookings.length === 0 ? (
              <DashboardEmpty
                eyebrow="Bookings"
                title="No bookings yet"
                description="Every trip you book on VaybeEx will be listed here."
                action={
                  <Link
                    href="/expeditions"
                    className="mt-7 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary-dark"
                  >
                    Browse expeditions <ArrowRight size={14} />
                  </Link>
                }
              />
            ) : (
              <div>
                <div className="mb-6">
                  <h2 className="font-display text-2xl font-bold text-text">
                    Booking history
                  </h2>
                  <p className="mt-1 text-sm text-text-secondary">
                    Every trip you&apos;ve booked on VaybeEx
                  </p>
                </div>
                <div className="divide-y divide-border border-t border-border">
                  {bookings.map((b) => {
                    const meta = statusMeta[b.status];
                    const Icon = meta.icon;
                    return (
                      <div
                        key={b.id}
                        className="dash-reveal flex items-center gap-4 py-4"
                      >
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden bg-bg-secondary sm:h-16 sm:w-20">
                          <MediaImage
                            src={b.image}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-display font-bold text-text">
                            {b.tripTitle}
                          </p>
                          <p className="mt-0.5 text-xs text-text-tertiary">
                            {formatDateRange(b.startDate, b.endDate)} · {b.destination}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <StatusBadge meta={meta} Icon={Icon} />
                          {b.amount > 0 && (
                            <p className="mt-1.5 font-display text-sm font-bold text-text">
                              {formatCurrency(b.amount)}
                            </p>
                          )}
                          {((b.status === "pending" &&
                            b.paymentStatus !== "paid") ||
                            b.paymentStatus === "partial") && (
                              <button
                                type="button"
                                className="mt-2 text-xs font-semibold text-amber transition-colors hover:opacity-80 disabled:opacity-50"
                                disabled={payingId === b.id}
                                onClick={() => void handlePay(b)}
                              >
                                {payingId === b.id
                                  ? "Opening…"
                                  : b.paymentStatus === "partial"
                                    ? "Pay balance"
                                    : "Complete payment"}
                              </button>
                            )}
                          {b.paymentStatus === "paid" && (
                            <p className="mt-1.5 text-[11px] font-semibold text-gold">
                              Paid
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )
          )}

          {activeTab === "cancellations" &&
            (cancellationsLoading ? (
              <div className="flex min-h-[12rem] items-center justify-center">
                <Loader2
                  className="h-6 w-6 animate-spin"
                  style={{ color: "var(--primary)" }}
                />
              </div>
            ) : cancellations.length === 0 ? (
              <DashboardEmpty
                eyebrow="Cancellations"
                title="No cancellation requests"
                description="If you need to cancel a confirmed upcoming trip, you can request it from that booking."
              />
            ) : (
              <div>
                {cancellations.map((request) => (
                  <CancellationCard key={request.id} request={request} />
                ))}
              </div>
            ))}
        </div>
      </div>

      <CancelBookingDialog
        booking={cancelBooking}
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        onSubmitted={handleCancellationSubmitted}
      />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-tertiary">
        {label}
      </p>
      <p className="mt-2 font-display text-3xl font-bold text-text sm:text-4xl">{value}</p>
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

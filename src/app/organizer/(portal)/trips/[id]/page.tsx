"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Check,
  ChevronDown,
  Clock,
  CreditCard,
  ExternalLink,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Send,
  ShieldCheck,
  Users,
  Wallet,
  X,
  RotateCcw,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import gsap from "gsap";
import { RefundRequestsSection } from "@/components/organizer/refund-requests-section";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { OrganizerPortalTabs } from "@/components/organizer/portal-tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TripAnalyticsPanel } from "@/components/organizer/trip-analytics-panel";
import { useOrganizerTrips } from "@/hooks/use-organizer-trips";
import { ApiError } from "@/lib/api/client";
import {
  getOrganizerTripAnalytics,
  getOrganizerTripBookings,
  type TripAnalyticsData,
  type TripBookingRow,
} from "@/lib/api/organizer-trips";
import { listTripCancellations } from "@/lib/api/cancellations";
import { STATUS_MESSAGES, TRIP_STATUS_OPTIONS } from "@/lib/trip-form-utils";
import { formatCurrency, formatDate, formatDateRange, formatDateTime } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/format";
import { formatRefundPolicyLabel } from "@/lib/refund-utils";
import { tripSpecialtyLabel } from "@/lib/trip-specialties";
import { getOrganizerMe, syncOrganizerProfileCache } from "@/lib/api/organizer-profile";
import { getOrganizerProfile } from "@/lib/organizer-profile";
import { getOrganizerBrandSlug, getTenantTripUrl, getTripPublicSlug } from "@/lib/tenant";
import type { CancellationRequest, TripStatus } from "@/lib/types";

function getDuration(start: string, end: string, apiDays?: number) {
  if (typeof apiDays === "number" && apiDays > 0) return apiDays;
  return (
    Math.ceil(
      (new Date(end).getTime() - new Date(start).getTime()) /
        (1000 * 60 * 60 * 24)
    ) + 1
  );
}

function toDatetimeLocalValue(value?: string) {
  const source = value ? new Date(value) : new Date();
  if (Number.isNaN(source.getTime())) {
    const fallback = new Date();
    fallback.setDate(fallback.getDate() + 1);
    fallback.setMinutes(0, 0, 0);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${fallback.getFullYear()}-${pad(fallback.getMonth() + 1)}-${pad(fallback.getDate())}T${pad(fallback.getHours())}:${pad(fallback.getMinutes())}`;
  }
  if (!value) {
    source.setDate(source.getDate() + 1);
    source.setMinutes(0, 0, 0);
  }
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${source.getFullYear()}-${pad(source.getMonth() + 1)}-${pad(source.getDate())}T${pad(source.getHours())}:${pad(source.getMinutes())}`;
}

function formatScheduleLabel(value?: string) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function statusMeta(status: string) {
  switch (status) {
    case "live":
    case "paid":
      return { background: "var(--gold-dim)", color: "var(--gold)" };
    case "partial":
    case "deposit_paid":
      return { background: "rgba(208,138,60,0.14)", color: "var(--amber)" };
    case "pending":
      return { background: "rgba(208,138,60,0.14)", color: "var(--amber)" };
    case "cancelled":
    case "refunded":
      return { background: "rgba(181,82,58,0.12)", color: "var(--coral)" };
    case "draft":
      return {
        background: "var(--bg-secondary)",
        color: "var(--text-secondary)",
      };
    default:
      return { background: "var(--primary-dim)", color: "var(--primary)" };
  }
}

function bookingPaymentLabel(row: TripBookingRow) {
  if (row.status === "paid") return "Paid in full";
  if (row.status === "partial") return "Deposit paid";
  if (row.status === "cancelled") return "Cancelled";
  if (row.status === "refunded") return "Refunded";
  if (row.paymentStatus === "deposit_paid") return "Deposit paid";
  return "Payment pending";
}

function bookingTypeLabel(type?: string) {
  if (!type) return undefined;
  const key = type.toLowerCase();
  if (key === "solo") return "Solo";
  if (key === "couple") return "Couple";
  if (key === "group") return "Group";
  return type;
}

const AVATAR_PALETTE = [
  "var(--primary)",
  "var(--gold)",
  "var(--coral)",
  "var(--amber)",
];
function avatarColorFor(name: string) {
  const sum = name.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  return AVATAR_PALETTE[sum % AVATAR_PALETTE.length];
}
function initialsFor(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function ManageTripPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const { getTrip, updateTripStatus, refreshTrip, isLoading, isSaving } =
    useOrganizerTrips();
  const trip = getTrip(id);
  const [cancellations, setCancellations] = useState<CancellationRequest[]>([]);
  const [attendees, setAttendees] = useState<TripBookingRow[]>([]);
  const [analytics, setAnalytics] = useState<TripAnalyticsData | null>(null);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleAt, setScheduleAt] = useState("");
  const [activeTab, setActiveTab] = useState(() =>
    tabFromUrl === "bookings" || tabFromUrl === "cancellations"
      ? tabFromUrl
      : "details"
  );
  const [openDay, setOpenDay] = useState<number | null>(null);
  const [bookingFilter, setBookingFilter] = useState<
    "all" | "paid" | "partial" | "pending"
  >("all");
  const [expandedBookingId, setExpandedBookingId] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (!isLoading && !trip) {
      void refreshTrip(id);
    }
  }, [id, isLoading, trip, refreshTrip]);

  useEffect(() => {
    if (!trip) return;
    let cancelled = false;
    (async () => {
      setBookingsLoading(true);
      try {
        const [bookingsRes, analyticsRes] = await Promise.all([
          getOrganizerTripBookings(id),
          getOrganizerTripAnalytics(id).catch(() => null),
        ]);
        if (cancelled) return;
        setAttendees(bookingsRes.data.bookings);
        if (analyticsRes?.data) {
          setAnalytics(analyticsRes.data);
        } else if (trip.analytics) {
          setAnalytics(trip.analytics);
        }
      } catch {
        if (!cancelled && trip.analytics) setAnalytics(trip.analytics);
      } finally {
        if (!cancelled) setBookingsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // Only refetch when the trip id changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, trip?.id]);

  const refreshCancellations = useCallback(async () => {
    try {
      const res = await listTripCancellations(id);
      setCancellations(res.data?.requests ?? []);
    } catch {
      setCancellations([]);
    }
  }, [id]);

  useEffect(() => {
    void refreshCancellations();
  }, [refreshCancellations]);

  useEffect(() => {
    if (tabFromUrl === "bookings" || tabFromUrl === "cancellations") {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  useEffect(() => {
    if (trip?.itinerary?.[0]?.day !== undefined && openDay === null) {
      setOpenDay(trip.itinerary[0].day);
    }
  }, [trip, openDay]);

  const pageRef = useRef<HTMLDivElement>(null);
  const capacityFillRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const hasAnimatedBookings = useRef(false);
  const [publicTripUrl, setPublicTripUrl] = useState("");

  useEffect(() => {
    if (!trip) return;
    let cancelled = false;

    const applyUrl = (brandInput: {
      brandSlug?: string;
      businessName?: string;
      organizerName?: string;
    }) => {
      if (cancelled) return;
      const brand = getOrganizerBrandSlug(brandInput);
      setPublicTripUrl(getTenantTripUrl(brand, getTripPublicSlug(trip)));
    };

    const profile = getOrganizerProfile();
    applyUrl({
      brandSlug: profile.brandSlug,
      businessName: profile.businessName,
    });

    getOrganizerMe()
      .then((response) => {
        if (cancelled || !response.data) return;
        syncOrganizerProfileCache(response.data);
        applyUrl({
          brandSlug: response.data.brandSlug,
          businessName: response.data.businessName,
          organizerName: response.data.fullName,
        });
      })
      .catch(() => {
        /* keep cache */
      });

    return () => {
      cancelled = true;
    };
  }, [trip]);

  useEffect(() => {
    if (!trip) return;
    const ctx = gsap.context(() => {
      gsap.from(".td-anim", {
        y: 14,
        opacity: 0,
        duration: 0.5,
        stagger: 0.05,
        ease: "power3.out",
      });
    }, pageRef);
    return () => ctx.revert();
  }, [trip]);

  useEffect(() => {
    if (!trip || !capacityFillRef.current) return;
    if (trip.capacity == null || trip.isUnlimitedCapacity) {
      gsap.set(capacityFillRef.current, { width: "0%" });
      return;
    }
    const pct = (trip.booked / trip.capacity) * 100;
    gsap.fromTo(
      capacityFillRef.current,
      { width: "0%" },
      { width: `${pct}%`, duration: 0.9, ease: "power3.out", delay: 0.2 }
    );
  }, [trip]);

  useEffect(() => {
    if (activeTab !== "bookings" || hasAnimatedBookings.current || !tableRef.current)
      return;
    hasAnimatedBookings.current = true;
    gsap.fromTo(
      tableRef.current.querySelectorAll(".attendee-row"),
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, duration: 0.35, stagger: 0.05, ease: "power2.out" }
    );
  }, [activeTab]);

  if (isLoading) {
    return (
      <div className="space-y-4 p-6 lg:p-8">
        <div
          className="h-8 w-40 animate-pulse rounded-lg"
          style={{ background: "var(--bg-secondary)" }}
        />
        <div
          className="h-28 animate-pulse rounded-xl"
          style={{ background: "var(--bg-secondary)" }}
        />
        <div
          className="h-16 animate-pulse rounded-xl"
          style={{ background: "var(--bg-secondary)" }}
        />
      </div>
    );
  }

  if (!trip) {
    return (
      <p className="p-8" style={{ color: "var(--text-secondary)" }}>
        Trip not found.
      </p>
    );
  }

  const handleStatusChange = async (status: TripStatus) => {
    if (status === "scheduled") {
      setScheduleAt(
        toDatetimeLocalValue(trip?.scheduledPublishAt || undefined)
      );
      setScheduleOpen(true);
      return;
    }
    try {
      await updateTripStatus(id, status);
      toast.success(STATUS_MESSAGES[status]);
    } catch (error) {
      if (!(error instanceof ApiError)) {
        toast.error("Unable to update status.");
      }
    }
  };

  const handleConfirmSchedule = async () => {
    if (!scheduleAt.trim()) {
      toast.error("Select a publish date and time.");
      return;
    }
    const publishAt = new Date(scheduleAt);
    if (Number.isNaN(publishAt.getTime())) {
      toast.error("Enter a valid publish date and time.");
      return;
    }
    try {
      await updateTripStatus(id, "scheduled", {
        scheduledPublishAt: publishAt.toISOString(),
      });
      setScheduleOpen(false);
      toast.success(STATUS_MESSAGES.scheduled);
    } catch (error) {
      if (!(error instanceof ApiError)) {
        toast.error("Unable to schedule trip.");
      }
    }
  };

  const paid = attendees.filter((a) => a.status === "paid");
  const partial = attendees.filter((a) => a.status === "partial");
  const pending = attendees.filter((a) => a.status === "pending");
  const unlimited = trip.isUnlimitedCapacity || trip.capacity == null;
  const pct =
    !unlimited && trip.capacity && trip.capacity > 0
      ? (trip.booked / trip.capacity) * 100
      : 0;
  const minReached = trip.booked >= trip.minCapacity;
  const duration = getDuration(
    trip.startDate,
    trip.endDate,
    trip.durationDays
  );
  const revenue =
    analytics?.revenue ?? trip.analytics?.revenue ?? trip.price * trip.booked;
  const statusStyle = statusMeta(trip.status);
  const scheduleLabel = formatScheduleLabel(trip.scheduledPublishAt);
  const showCouple =
    trip.offerCouplePrice !== false && trip.couplePrice != null;
  const showGroup = trip.offerGroupPrice !== false && trip.groupPrice != null;

  const visibleAttendees =
    bookingFilter === "paid"
      ? paid
      : bookingFilter === "partial"
        ? partial
        : bookingFilter === "pending"
          ? pending
          : attendees;

  const statusHelp =
    trip.status === "live"
      ? "Visible to travelers and accepting bookings."
      : trip.status === "draft"
        ? "Only you can see this draft."
        : trip.status === "scheduled"
          ? scheduleLabel
            ? `Goes live on ${scheduleLabel}.`
            : "Choose a publish date to go live automatically."
          : trip.status === "completed"
            ? "Finished — no longer bookable."
            : "Cancelled and hidden from travelers.";

  return (
    <div
      ref={pageRef}
      className="mx-auto max-w-6xl p-6 lg:p-8"
      style={{ background: "#f5f5f5" }}
    >
      <Link
        href="/organizer/trips/new"
        className="td-anim mb-4 inline-flex items-center gap-1.5 text-sm transition-colors"
        style={{ color: "var(--text-tertiary)" }}
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to trips
      </Link>

      {/* Compact command header — Peek / Eventbrite style admin header */}
      <div
        className="td-anim mb-4 flex flex-col gap-4 rounded-xl border p-3 sm:flex-row sm:items-center sm:p-4"
        style={{ borderColor: "var(--border)", background: "var(--surface)" }}
      >
        <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg sm:h-24 sm:w-20">
          <Image
            src={trip.image || "/images/cta-image.jpg"}
            alt=""
            fill
            className="object-cover"
            sizes="80px"
            priority
            unoptimized={
              Boolean(
                trip.image &&
                  (trip.image.startsWith("http://") ||
                    trip.image.startsWith("https://"))
              )
            }
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <span
              className="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide capitalize"
              style={statusStyle}
            >
              {trip.status}
            </span>
            <span
              className="rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide capitalize"
              style={{
                background: "var(--bg-secondary)",
                color: "var(--text-secondary)",
              }}
            >
              {tripSpecialtyLabel(trip.category)}
            </span>
            {minReached && (
              <span
                className="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                style={{ background: "var(--gold-dim)", color: "var(--gold)" }}
              >
                Min reached
              </span>
            )}
          </div>
          <h1
            className="font-display text-xl font-bold tracking-tight sm:text-2xl"
            style={{ color: "var(--text)" }}
          >
            {trip.title}
          </h1>
          <div
            className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs"
            style={{ color: "var(--text-tertiary)" }}
          >
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {trip.destination}
            </span>
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDateRange(trip.startDate, trip.endDate)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {duration} day{duration === 1 ? "" : "s"}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 sm:justify-end">
          <Button
            asChild
            size="sm"
            
            style={{
              background: "var(--gradient-brand)",
              color: "#fbf7f1",
            }}
          >
            <Link href={`/organizer/trips/${id}/edit`}>
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            asChild
            
            style={{ borderColor: "var(--border-strong)", color: "var(--text)" }}
          >
            <Link href={publicTripUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3.5 w-3.5" />
              Public
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            asChild
            
            style={{ borderColor: "var(--border-strong)", color: "var(--text)" }}
          >
            <Link href={`/organizer/messages?trip=${id}`}>
              <Send className="h-3.5 w-3.5" />
              Message
            </Link>
          </Button>
        </div>
      </div>

      {/* Dense KPI + capacity strip */}
      <div
        className="td-anim mb-5 overflow-hidden rounded-xl border"
        style={{ borderColor: "var(--border)", background: "var(--surface)" }}
      >
        <div className="grid grid-cols-2 sm:grid-cols-4">
          {[
            {
              label: "Booked",
              value: unlimited ? `${trip.booked} · Unlimited` : `${trip.booked}/${trip.capacity}`,
              icon: Users,
            },
            {
              label: "Revenue",
              value: formatCurrency(revenue),
              icon: null,
            },
            {
              label: "Fill rate",
              value: unlimited ? "—" : `${Math.round(pct)}%`,
              icon: null,
            },
            {
              label: "Views",
              value: String(trip.views),
              icon: Eye,
            },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className="px-4 py-3.5"
              style={{
                borderLeft: i > 0 ? "1px solid var(--border)" : undefined,
              }}
            >
              <p
                className="text-[11px]"
                style={{ color: "var(--text-tertiary)" }}
              >
                {stat.label}
              </p>
              <p
                className="mt-0.5 font-display text-lg font-bold tabular-nums"
                style={{ color: "var(--text)" }}
              >
                {stat.value}
              </p>
            </div>
          ))}
        </div>
        <div
          className="border-t px-4 py-3"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2 text-[11px]">
            <span style={{ color: "var(--text-secondary)" }}>
              {unlimited
                ? "Unlimited capacity"
                : `Seat fill · min ${trip.minCapacity}`}
            </span>
            <span style={{ color: "var(--text-tertiary)" }}>
              {trip.conversions} conversions
              {minReached ? " · payout on departure" : ""}
            </span>
          </div>
          {!unlimited && (
            <div
              className="relative h-1.5 overflow-hidden rounded-full"
              style={{ background: "var(--bg-secondary)" }}
            >
              <div
                ref={capacityFillRef}
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ width: "0%", background: "var(--gradient-brand)" }}
              />
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="min-w-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <OrganizerPortalTabs
              className="td-anim mb-4"
              aria-label="Trip sections"
              value={activeTab}
              onChange={(next) => {
                setActiveTab(next);
                if (next === "cancellations") {
                  void refreshCancellations();
                }
              }}
              tabs={[
                { value: "details", label: "Overview" },
                { value: "bookings", label: "Bookings", count: attendees.length },
                {
                  value: "cancellations",
                  label: "Refunds",
                  count: cancellations.length,
                },
              ]}
            />

            {/* ── Overview ─────────────────────────────────────── */}
            <TabsContent value="details" className="mt-0 space-y-4">
              <Section title="About">
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {trip.description}
                </p>
                {trip.difficulty && (
                  <p
                    className="mt-3 text-xs font-medium capitalize"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    Difficulty · {trip.difficulty}
                  </p>
                )}
              </Section>

              {trip.highlights && trip.highlights.length > 0 && (
                <Section title="Highlights">
                  <ul className="space-y-1.5">
                    {trip.highlights.map((item: string) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-sm"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        <Check
                          className="mt-0.5 h-3.5 w-3.5 shrink-0"
                          style={{ color: "var(--gold)" }}
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              {(trip.meetingPoint ||
                trip.departurePoint ||
                trip.departureTime ||
                trip.returnTime) && (
                <Section title="Meetup & logistics">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {trip.meetingPoint && (
                      <MetaItem label="Meeting point" value={trip.meetingPoint} />
                    )}
                    {trip.departurePoint && (
                      <MetaItem
                        label="Departure"
                        value={trip.departurePoint}
                      />
                    )}
                    {trip.departureTime && (
                      <MetaItem label="Departs" value={trip.departureTime} />
                    )}
                    {trip.returnTime && (
                      <MetaItem label="Returns" value={trip.returnTime} />
                    )}
                  </div>
                </Section>
              )}

              {trip.images.length > 1 && (
                <Section title="Gallery">
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {trip.images.map((img: string) => (
                      <div
                        key={img}
                        className="relative h-24 w-20 shrink-0 overflow-hidden rounded-lg"
                      >
                        <Image
                          src={img}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <Section title="Included">
                  <ul className="space-y-1.5">
                    {trip.included.map((item: string) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-sm"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        <Check
                          className="mt-0.5 h-3.5 w-3.5 shrink-0"
                          style={{ color: "var(--gold)" }}
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </Section>
                <Section title="Not included">
                  <ul className="space-y-1.5">
                    {trip.excluded.map((item: string) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-sm"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        <X
                          className="mt-0.5 h-3.5 w-3.5 shrink-0"
                          style={{ color: "var(--text-tertiary)" }}
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </Section>
              </div>

              <Section title="Itinerary">
                <div className="space-y-2">
                  {trip.itinerary.map(
                    (day: {
                      day: number;
                      title: string;
                      activities: string[];
                    }) => {
                      const isOpen = openDay === day.day;
                      return (
                        <div
                          key={day.day}
                          className="overflow-hidden rounded-lg border"
                          style={{ borderColor: "var(--border)" }}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              setOpenDay(isOpen ? null : day.day)
                            }
                            className="flex w-full items-center gap-3 px-3 py-2.5 text-left"
                          >
                            <span
                              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                              style={{
                                background: "var(--gradient-brand)",
                                color: "#fbf7f1",
                              }}
                            >
                              {day.day}
                            </span>
                            <span
                              className="flex-1 text-sm font-medium"
                              style={{ color: "var(--text)" }}
                            >
                              {day.title}
                            </span>
                            <ChevronDown
                              className="h-4 w-4 shrink-0 transition-transform"
                              style={{
                                color: "var(--text-tertiary)",
                                transform: isOpen
                                  ? "rotate(180deg)"
                                  : "rotate(0deg)",
                              }}
                            />
                          </button>
                          {isOpen && (
                            <ul
                              className="space-y-1.5 border-t px-3 pb-3 pl-12 pt-2"
                              style={{ borderColor: "var(--border)" }}
                            >
                              {day.activities.map((activity) => (
                                <li
                                  key={activity}
                                  className="flex items-center gap-2 text-sm"
                                  style={{ color: "var(--text-secondary)" }}
                                >
                                  <span
                                    className="h-1 w-1 shrink-0 rounded-full"
                                    style={{ background: "var(--gold)" }}
                                  />
                                  {activity}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      );
                    }
                  )}
                </div>
              </Section>

              {trip.addOns.length > 0 && (
                <Section title="Add-ons">
                  <div className="space-y-1">
                    {trip.addOns.map(
                      (addon: {
                        id: string;
                        name: string;
                        price: number;
                        perPerson?: boolean;
                      }) => (
                        <div
                          key={addon.id}
                          className="flex items-center justify-between py-1.5 text-sm"
                        >
                          <span style={{ color: "var(--text-secondary)" }}>
                            {addon.name}
                            <span
                              className="ml-1.5 text-xs"
                              style={{ color: "var(--text-tertiary)" }}
                            >
                              {addon.perPerson === false
                                ? "per booking"
                                : "per person"}
                            </span>
                          </span>
                          <span
                            className="font-medium"
                            style={{ color: "var(--text)" }}
                          >
                            {formatCurrency(addon.price)}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </Section>
              )}

              <Section title="Pricing & policy">
                <dl className="grid gap-3 text-sm sm:grid-cols-2">
                  <MetaItem
                    label="Per person"
                    value={formatCurrency(trip.price)}
                  />
                  <MetaItem
                    label="Initial deposit"
                    value={formatCurrency(trip.depositAmount)}
                  />
                  {showCouple && (
                    <MetaItem
                      label="Couple"
                      value={formatCurrency(trip.couplePrice!)}
                    />
                  )}
                  {showGroup && (
                    <MetaItem
                      label={`Group (${trip.groupSize ?? "—"})`}
                      value={formatCurrency(trip.groupPrice!)}
                    />
                  )}
                  <MetaItem
                    label="Refund policy"
                    value={formatRefundPolicyLabel(trip)}
                  />
                  <MetaItem
                    label="Full capacity revenue"
                    value={
                      unlimited
                        ? "Unlimited"
                        : formatCurrency(trip.price * (trip.capacity ?? 0))
                    }
                  />
                </dl>
              </Section>
            </TabsContent>

            {/* ── Bookings ─────────────────────────────────────── */}
            <TabsContent value="bookings" className="mt-0 space-y-3">
              <OrganizerPortalTabs
                aria-label="Booking status"
                value={bookingFilter}
                onChange={setBookingFilter}
                tabs={[
                  { value: "all", label: "All", count: attendees.length },
                  { value: "paid", label: "Paid", count: paid.length },
                  { value: "partial", label: "Deposit", count: partial.length },
                  { value: "pending", label: "Pending", count: pending.length },
                ]}
              />

              {bookingsLoading ? (
                <div
                  className="flex flex-col items-center justify-center rounded-xl border py-12 text-center"
                  style={{
                    borderColor: "var(--border)",
                    background: "var(--surface)",
                  }}
                >
                  <p
                    className="text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Loading bookings…
                  </p>
                </div>
              ) : visibleAttendees.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center rounded-xl border py-12 text-center"
                  style={{
                    borderColor: "var(--border)",
                    background: "var(--surface)",
                  }}
                >
                  <ShieldCheck
                    className="mb-2 h-6 w-6"
                    style={{ color: "var(--gold)" }}
                  />
                  <p
                    className="text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    No {bookingFilter === "all" ? "" : bookingFilter} bookings.
                  </p>
                </div>
              ) : (
                <div ref={tableRef} className="space-y-2.5">
                  {visibleAttendees.map((a) => {
                    const expanded = expandedBookingId === a.id;
                    const currency = a.currency || "GHS";
                    const total = a.totalAmount || a.amount || 0;
                    const paidAmt = a.amountPaid || 0;
                    const paidPct =
                      total > 0
                        ? Math.min(100, Math.round((paidAmt / total) * 100))
                        : 0;
                    const accent = statusMeta(a.status);
                    const party =
                      [
                        bookingTypeLabel(a.bookingType),
                        a.partySize > 1 ? `${a.partySize} travelers` : null,
                      ]
                        .filter(Boolean)
                        .join(" · ") || "1 traveler";

                    return (
                      <div
                        key={a.id}
                        className="attendee-row overflow-hidden rounded-2xl border transition-shadow"
                        style={{
                          borderColor: expanded
                            ? "var(--border-strong)"
                            : "var(--border)",
                          background: "var(--surface)",
                          boxShadow: expanded
                            ? "0 10px 28px -18px rgba(86, 47, 24, 0.35)"
                            : undefined,
                        }}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedBookingId(expanded ? null : a.id)
                          }
                          className="group flex w-full items-center gap-3 px-3.5 py-3.5 text-left sm:gap-3.5 sm:px-4"
                        >
                          <span
                            className="h-10 w-1 shrink-0 rounded-full"
                            style={{ background: accent.color }}
                            aria-hidden
                          />
                          <div
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                            style={{ background: avatarColorFor(a.name) }}
                          >
                            {initialsFor(a.name)}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p
                              className="truncate font-display text-[15px] font-semibold tracking-tight"
                              style={{ color: "var(--text)" }}
                            >
                              {a.name}
                            </p>
                            <p
                              className="mt-0.5 truncate text-xs"
                              style={{ color: "var(--text-tertiary)" }}
                            >
                              {party}
                              {a.createdAt
                                ? ` · ${formatRelativeTime(a.createdAt)}`
                                : ""}
                            </p>
                          </div>

                          <div className="flex shrink-0 flex-col items-end gap-1">
                            <span
                              className="text-sm font-bold tabular-nums"
                              style={{ color: "var(--text)" }}
                            >
                              {formatCurrency(paidAmt, currency)}
                            </span>
                            <span
                              className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                              style={{
                                background: accent.background,
                                color: accent.color,
                              }}
                            >
                              {bookingPaymentLabel(a)}
                            </span>
                          </div>

                          <span
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors"
                            style={{
                              background: "var(--bg-secondary)",
                              color: "var(--text-tertiary)",
                            }}
                          >
                            <ChevronDown
                              className={`h-4 w-4 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
                            />
                          </span>
                        </button>

                        {expanded && (
                          <div
                            className="space-y-4 border-t px-4 pb-4 pt-3.5 sm:px-5"
                            style={{ borderColor: "var(--border)" }}
                          >
                            {/* Payment progress */}
                            <div>
                              <div className="mb-2 flex items-end justify-between gap-3">
                                <div>
                                  <p
                                    className="text-[10px] font-semibold uppercase tracking-[0.14em]"
                                    style={{ color: "var(--text-tertiary)" }}
                                  >
                                    Payment
                                  </p>
                                  <p
                                    className="mt-0.5 text-sm"
                                    style={{ color: "var(--text-secondary)" }}
                                  >
                                    <span
                                      className="font-semibold tabular-nums"
                                      style={{ color: "var(--text)" }}
                                    >
                                      {formatCurrency(paidAmt, currency)}
                                    </span>
                                    {" of "}
                                    {formatCurrency(total, currency)}
                                  </p>
                                </div>
                                {a.remainingBalance > 0 ? (
                                  <p
                                    className="text-right text-xs font-medium"
                                    style={{ color: "var(--amber)" }}
                                  >
                                    {formatCurrency(a.remainingBalance, currency)} left
                                    {a.balanceDueDate
                                      ? ` · due ${formatDate(a.balanceDueDate)}`
                                      : ""}
                                  </p>
                                ) : (
                                  <p
                                    className="text-xs font-medium"
                                    style={{ color: "var(--gold)" }}
                                  >
                                    Fully paid
                                  </p>
                                )}
                              </div>
                              <div
                                className="h-1.5 overflow-hidden rounded-full"
                                style={{ background: "var(--bg-secondary)" }}
                              >
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{
                                    width: `${paidPct}%`,
                                    background:
                                      paidPct >= 100
                                        ? "var(--gold)"
                                        : "var(--gradient-brand)",
                                  }}
                                />
                              </div>
                            </div>

                            {/* Timeline */}
                            <div className="grid gap-3 sm:grid-cols-3">
                              <MetaChip
                                icon={Calendar}
                                label="Booked"
                                value={
                                  a.createdAt
                                    ? formatDateTime(a.createdAt)
                                    : "—"
                                }
                              />
                              <MetaChip
                                icon={CreditCard}
                                label="Paid"
                                value={
                                  a.paidAt ? formatDateTime(a.paidAt) : "—"
                                }
                              />
                              <MetaChip
                                icon={Wallet}
                                label="Method"
                                value={
                                  a.paymentMethod ||
                                  a.paymentChannel?.replace(/_/g, " ") ||
                                  "—"
                                }
                              />
                            </div>

                            {/* Contact */}
                            <div className="flex flex-wrap gap-2">
                              {a.email && (
                                <span
                                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs"
                                  style={{
                                    background: "var(--bg-secondary)",
                                    color: "var(--text-secondary)",
                                  }}
                                >
                                  <Mail className="h-3 w-3" />
                                  {a.email}
                                </span>
                              )}
                              {a.phone && (
                                <span
                                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs"
                                  style={{
                                    background: "var(--bg-secondary)",
                                    color: "var(--text-secondary)",
                                  }}
                                >
                                  <Phone className="h-3 w-3" />
                                  {a.phone}
                                </span>
                              )}
                              {a.location && (
                                <span
                                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs"
                                  style={{
                                    background: "var(--bg-secondary)",
                                    color: "var(--text-secondary)",
                                  }}
                                >
                                  <MapPin className="h-3 w-3" />
                                  {a.location}
                                </span>
                              )}
                            </div>

                            {a.guests.length > 1 && (
                              <div>
                                <p
                                  className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em]"
                                  style={{ color: "var(--text-tertiary)" }}
                                >
                                  Guests
                                </p>
                                <p
                                  className="text-sm"
                                  style={{ color: "var(--text)" }}
                                >
                                  {a.guests
                                    .map((g) =>
                                      g.isLead
                                        ? `${g.fullName} (lead)`
                                        : g.fullName
                                    )
                                    .join(", ")}
                                </p>
                              </div>
                            )}

                            {a.payments.length > 0 && (
                              <div>
                                <p
                                  className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em]"
                                  style={{ color: "var(--text-tertiary)" }}
                                >
                                  Payments
                                </p>
                                <ul className="space-y-2">
                                  {a.payments.map((p, pi) => (
                                    <li
                                      key={`${p.reference}-${pi}`}
                                      className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5"
                                      style={{ background: "var(--bg-secondary)" }}
                                    >
                                      <div className="min-w-0">
                                        <p
                                          className="text-sm font-semibold tabular-nums"
                                          style={{ color: "var(--text)" }}
                                        >
                                          {formatCurrency(p.amount, currency)}
                                        </p>
                                        <p
                                          className="truncate text-[11px]"
                                          style={{ color: "var(--text-tertiary)" }}
                                        >
                                          {[
                                            p.paymentMethod ||
                                              p.channel?.replace(/_/g, " "),
                                            p.paidAt
                                              ? formatDateTime(p.paidAt)
                                              : null,
                                          ]
                                            .filter(Boolean)
                                            .join(" · ")}
                                        </p>
                                      </div>
                                      <span
                                        className="shrink-0 text-[10px] font-semibold uppercase tracking-wide"
                                        style={{ color: "var(--gold)" }}
                                      >
                                        {p.status || "success"}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {(a.paystackReference || a.paymentNote) && (
                              <p
                                className="text-xs leading-relaxed"
                                style={{ color: "var(--text-tertiary)" }}
                              >
                                {a.paymentNote || (
                                  <>
                                    Ref{" "}
                                    <span className="font-mono">
                                      {a.paystackReference}
                                    </span>
                                  </>
                                )}
                              </p>
                            )}

                            {a.email && (
                              <div
                                className="flex justify-end border-t pt-3"
                                style={{ borderColor: "var(--border)" }}
                              >
                                <a
                                  href={`mailto:${a.email}`}
                                  className="inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-opacity hover:opacity-90"
                                  style={{
                                    background: "var(--primary)",
                                    color: "#fbf7f1",
                                  }}
                                >
                                  <Mail className="h-3.5 w-3.5" />
                                  Email traveler
                                </a>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* ── Cancellations ────────────────────────────────── */}
            <TabsContent value="cancellations" className="mt-0 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  Approve or deny cancellations for this trip. Refunds are sent by
                  Paystack to the traveler&apos;s original payment method.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  
                  style={{
                    borderColor: "var(--border-strong)",
                    color: "var(--text)",
                  }}
                >
                  <Link href="/organizer/refunds">
                    <RotateCcw className="h-3.5 w-3.5" />
                    All refunds
                  </Link>
                </Button>
              </div>
              <RefundRequestsSection
                requests={cancellations}
                onUpdated={() => {
                  void refreshCancellations();
                }}
                showTripLink={false}
                emptyMessage="No cancellation requests for this trip yet."
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Sticky ops sidebar */}
        <aside className="td-anim space-y-3 lg:sticky lg:top-6 lg:self-start">
          <div
            className="rounded-xl border p-4"
            style={{
              borderColor: "var(--border)",
              background: "var(--surface)",
            }}
          >
            <p
              className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em]"
              style={{ color: "var(--text-tertiary)" }}
            >
              Status
            </p>
            <Select
              value={trip.status}
              onValueChange={(v) => handleStatusChange(v as TripStatus)}
              disabled={isSaving}
            >
              <SelectTrigger
                className="rounded-lg capitalize"
                style={{ borderColor: "var(--border-strong)" }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TRIP_STATUS_OPTIONS.map((opt) => (
                  <SelectItem
                    key={opt.value}
                    value={opt.value}
                    className="capitalize"
                  >
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p
              className="mt-2 text-xs leading-relaxed"
              style={{ color: "var(--text-tertiary)" }}
            >
              {statusHelp}
            </p>
          </div>

          <div
            className="rounded-xl border p-4"
            style={{
              borderColor: "var(--border)",
              background: "var(--surface)",
            }}
          >
            <p
              className="mb-3 text-[11px] font-bold uppercase tracking-[0.12em]"
              style={{ color: "var(--text-tertiary)" }}
            >
              At a glance
            </p>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between gap-2">
                <span style={{ color: "var(--text-tertiary)" }}>Price</span>
                <span className="font-medium" style={{ color: "var(--text)" }}>
                  {formatCurrency(trip.price)}
                </span>
              </div>
              {showCouple && (
                <div className="flex justify-between gap-2">
                  <span style={{ color: "var(--text-tertiary)" }}>Couple</span>
                  <span className="font-medium" style={{ color: "var(--text)" }}>
                    {formatCurrency(trip.couplePrice!)}
                  </span>
                </div>
              )}
              {showGroup && (
                <div className="flex justify-between gap-2">
                  <span style={{ color: "var(--text-tertiary)" }}>
                    Group ({trip.groupSize ?? "—"})
                  </span>
                  <span className="font-medium" style={{ color: "var(--text)" }}>
                    {formatCurrency(trip.groupPrice!)}
                  </span>
                </div>
              )}
              <div className="flex justify-between gap-2">
                <span style={{ color: "var(--text-tertiary)" }}>Deposit</span>
                <span className="font-medium" style={{ color: "var(--text)" }}>
                  {formatCurrency(trip.depositAmount)}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span style={{ color: "var(--text-tertiary)" }}>Refund</span>
                <span
                  className="max-w-[58%] text-right text-xs font-medium leading-snug"
                  style={{ color: "var(--text)" }}
                >
                  {formatRefundPolicyLabel(trip)}
                </span>
              </div>
              {trip.status === "scheduled" && scheduleLabel && (
                <div className="flex justify-between gap-2">
                  <span style={{ color: "var(--text-tertiary)" }}>Goes live</span>
                  <span
                    className="max-w-[58%] text-right text-xs font-medium leading-snug"
                    style={{ color: "var(--text)" }}
                  >
                    {scheduleLabel}
                  </span>
                </div>
              )}
              <div className="flex justify-between gap-2">
                <span style={{ color: "var(--text-tertiary)" }}>Pending</span>
                <span
                  className="font-medium"
                  style={{
                    color:
                      pending.length > 0 ? "var(--amber)" : "var(--text)",
                  }}
                >
                  {pending.length}
                </span>
              </div>
            </div>
          </div>

          <TripAnalyticsPanel
            trip={trip}
            analytics={analytics}
            className="hidden lg:block"
          />
        </aside>
      </div>

      <TripAnalyticsPanel
        trip={trip}
        analytics={analytics}
        className="mt-5 lg:hidden"
      />

      <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule publish date</DialogTitle>
            <DialogDescription>
              Pick when this trip should go live. Travelers will only see it after
              that date and time.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label
              htmlFor="schedule-publish-at"
              className="text-sm font-medium"
              style={{ color: "var(--text)" }}
            >
              Publish date & time
            </label>
            <Input
              id="schedule-publish-at"
              type="datetime-local"
              value={scheduleAt}
              onChange={(e) => setScheduleAt(e.target.value)}
              className="rounded-lg"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setScheduleOpen(false)}
              disabled={isSaving}
              className="rounded-lg"
            >
              Cancel
            </Button>
            <Button
              onClick={() => void handleConfirmSchedule()}
              disabled={isSaving || !scheduleAt.trim()}
              className="rounded-lg"
              style={{
                background: "var(--gradient-brand)",
                color: "#fbf7f1",
              }}
            >
              {isSaving ? "Scheduling…" : "Schedule trip"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className="rounded-xl border p-4"
      style={{ borderColor: "var(--border)", background: "var(--surface)" }}
    >
      <h2
        className="mb-3 font-display text-sm font-semibold"
        style={{ color: "var(--text)" }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt
        className="text-[11px]"
        style={{ color: "var(--text-tertiary)" }}
      >
        {label}
      </dt>
      <dd
        className="mt-0.5 text-sm font-medium"
        style={{ color: "var(--text)" }}
      >
        {value}
      </dd>
    </div>
  );
}

function MetaChip({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  label: string;
  value: string;
}) {
  return (
    <div
      className="rounded-xl px-3 py-2.5"
      style={{ background: "var(--bg-secondary)" }}
    >
      <p
        className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.12em]"
        style={{ color: "var(--text-tertiary)" }}
      >
        <Icon className="h-3 w-3" />
        {label}
      </p>
      <p
        className="text-sm font-medium leading-snug capitalize"
        style={{ color: "var(--text)" }}
      >
        {value}
      </p>
    </div>
  );
}

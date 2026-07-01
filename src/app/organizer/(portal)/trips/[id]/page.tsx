/* eslint-disable react-hooks/set-state-in-effect */
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
  DollarSign,
  ExternalLink,
  Mail,
  MapPin,
  Pencil,
  Send,
  ShieldCheck,
  Users,
  X,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { RefundRequestsSection } from "@/components/organizer/refund-requests-section";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TripAnalyticsPanel } from "@/components/organizer/trip-analytics-panel";
import { useOrganizerTrips } from "@/hooks/use-organizer-trips";
import { STATUS_MESSAGES, TRIP_STATUS_OPTIONS } from "@/lib/trip-form-utils";
import { getCancellationsForTrip } from "@/lib/cancellation-requests";
import { formatCurrency, formatDateRange } from "@/lib/utils";
import type { CancellationRequest, TripStatus } from "@/lib/types";

gsap.registerPlugin(ScrollTrigger);

const attendees = [
  { name: "Ama Osei", email: "ama@email.com", status: "paid", amount: 1850 },
  { name: "Kwame Mensah", email: "kwame@email.com", status: "paid", amount: 1850 },
  { name: "Efua Addo", email: "efua@email.com", status: "pending", amount: 500 },
  { name: "Yaw Boateng", email: "yaw@email.com", status: "paid", amount: 2000 },
];

function getDuration(start: string, end: string) {
  return Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

function statusBadgeStyle(status: string) {
  switch (status) {
    case "live":
    case "paid":
      return { background: "var(--gold-dim)", color: "var(--gold)" };
    case "pending":
      return { background: "rgba(208,138,60,0.14)", color: "var(--amber)" };
    case "draft":
      return { background: "var(--bg-secondary)", color: "var(--text-secondary)" };
    default:
      return { background: "var(--primary-dim)", color: "var(--primary)" };
  }
}

/* Deterministic avatar color/initials from a name — used in the
   Bookings tab so the same person always gets the same chip color
   without storing anything extra in the data model. */
const AVATAR_PALETTE = ["var(--primary)", "var(--gold)", "var(--coral)", "var(--amber)"];
function avatarColorFor(name: string) {
  const sum = name.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  return AVATAR_PALETTE[sum % AVATAR_PALETTE.length];
}
function initialsFor(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export default function ManageTripPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const { getTrip, updateTripStatus, isLoading } = useOrganizerTrips();
  const trip = getTrip(id);
  const [cancellations, setCancellations] = useState<CancellationRequest[]>([]);
  const [activeTab, setActiveTab] = useState(() =>
    tabFromUrl === "bookings" || tabFromUrl === "cancellations" ? tabFromUrl : "details"
  );
  // Which itinerary day is expanded — defaults to Day 1 once trip loads
  const [openDay, setOpenDay] = useState<number | null>(null);

  const refreshCancellations = useCallback(() => {
    setCancellations(getCancellationsForTrip(id));
  }, [id]);

  useEffect(() => {
    refreshCancellations();
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


  const heroRef = useRef<HTMLDivElement>(null);
  const capacityFillRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const hasAnimatedBookings = useRef(false);

  useEffect(() => {
    if (!trip) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".manage-hero-img",
        { scale: 1.08, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.9, ease: "power3.out" }
      );
      gsap.fromTo(
        ".manage-hero-text > *",
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, delay: 0.25, ease: "power2.out" }
      );
      gsap.fromTo(
        ".manage-stat-card",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.07, delay: 0.15, ease: "power2.out" }
      );

      gsap.utils.toArray<HTMLElement>(".manage-reveal").forEach((el) => {
        gsap.fromTo(
          el,
          { y: 28, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.55,
            ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 90%", once: true },
          }
        );
      });

      gsap.fromTo(
        ".itinerary-day-marker",
        { scale: 0, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.4,
          stagger: 0.08,
          ease: "back.out(2)",
          scrollTrigger: { trigger: ".itinerary-card", start: "top 85%", once: true },
        }
      );
    }, heroRef);

    return () => ctx.revert();
  }, [trip]);

  useEffect(() => {
    if (!trip || !capacityFillRef.current) return;
    const pct = (trip.booked / trip.capacity) * 100;
    gsap.fromTo(
      capacityFillRef.current,
      { width: "0%" },
      { width: `${pct}%`, duration: 1, ease: "power3.out", delay: 0.3 }
    );
  }, [trip]);

  // First time the Bookings tab is opened, stagger attendee rows in.
  // Guarded so it only fires once per mount, not on every tab re-visit.
  useEffect(() => {
    if (activeTab !== "bookings" || hasAnimatedBookings.current || !tableRef.current) return;
    hasAnimatedBookings.current = true;
    gsap.fromTo(
      tableRef.current.querySelectorAll(".attendee-row"),
      { opacity: 0, x: -12 },
      { opacity: 1, x: 0, duration: 0.4, stagger: 0.06, ease: "power2.out" }
    );
  }, [activeTab]);

  if (isLoading) {
    return (
      <div className="space-y-4 p-6 lg:p-8">
        <div className="h-8 w-40 animate-pulse rounded-lg" style={{ background: "var(--bg-secondary)" }} />
        <div className="aspect-[21/9] animate-pulse rounded-2xl" style={{ background: "var(--bg-secondary)" }} />
      </div>
    );
  }
  if (!trip) {
    return <p className="p-8" style={{ color: "var(--text-secondary)" }}>Trip not found.</p>;
  }

  const handleStatusChange = (status: TripStatus) => {
    updateTripStatus(id, status);
    toast.success(STATUS_MESSAGES[status]);
  };

  const paid = attendees.filter((a) => a.status === "paid");
  const pending = attendees.filter((a) => a.status === "pending");
  const pct = (trip.booked / trip.capacity) * 100;
  const minReached = trip.booked >= trip.minCapacity;
  const duration = getDuration(trip.startDate, trip.endDate);

  return (
    <div ref={heroRef} className="max-w-7xl p-6 lg:p-8" style={{ background: "var(--bg)" }}>
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 mb-4"
        style={{ color: "var(--text-tertiary)" }}
        asChild
      >
        <Link href="/organizer/trips/new">
          <ArrowLeft className="h-4 w-4" />
          Back to trips
        </Link>
      </Button>

      {/* ── Hero ────────────────────────────────────────────────── */}
      <div className="relative mb-6 aspect-[21/9] overflow-hidden rounded-2xl">
        <div className="manage-hero-img absolute inset-0">
          <Image
            src={trip.image}
            alt={trip.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1024px) 100vw, 1152px"
          />
        </div>
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(42,27,15,0.7), rgba(42,27,15,0.1) 60%, transparent)" }}
        />
        <div className="manage-hero-text absolute bottom-0 left-0 right-0 p-6">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge style={{ ...statusBadgeStyle(trip.status), border: "none" }} className="capitalize">
              {trip.status}
            </Badge>
            <Badge style={{ background: "rgba(251,247,241,0.18)", color: "#fbf7f1", border: "none" }} className="capitalize">
              {trip.category}
            </Badge>
            {minReached && (
              <Badge style={{ background: "var(--gold)", color: "var(--primary-dark)", border: "none" }}>
                Min capacity reached
              </Badge>
            )}
          </div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl" style={{ color: "#fbf7f1" }}>
            {trip.title}
          </h1>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm" style={{ color: "rgba(251,247,241,0.8)" }}>
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {trip.destination}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formatDateRange(trip.startDate, trip.endDate)}
            </span>
          </p>
        </div>
      </div>

      {/* ── Stat row + actions ─────────────────────────────────── */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="grid flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Price", value: `${formatCurrency(trip.price)} / person`, icon: DollarSign },
            { label: "Deposit", value: formatCurrency(trip.depositAmount), icon: DollarSign },
            { label: "Duration", value: `${duration} day${duration === 1 ? "" : "s"}`, icon: Clock },
            { label: "Booked", value: `${trip.booked}/${trip.capacity}`, icon: Users },
          ].map((s) => (
            <Card key={s.label} className="manage-stat-card border shadow-none" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: "var(--primary-dim)" }}>
                  <s.icon className="h-4 w-4" style={{ color: "var(--primary)" }} />
                </div>
                <div>
                  <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>{s.label}</p>
                  <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>{s.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="manage-stat-card flex flex-shrink-0 flex-wrap gap-2">
          <Button asChild className="rounded-xl" style={{ background: "var(--gradient-brand)", color: "#fbf7f1", boxShadow: "var(--glow-gold)" }}>
            <Link href={`/organizer/trips/${id}/edit`}>
              <Pencil className="h-4 w-4" />
              Edit Trip
            </Link>
          </Button>
          <Button variant="outline" asChild className="rounded-xl" style={{ borderColor: "var(--border-strong)", color: "var(--text)" }}>
            <Link href={`/trips/${id}`} target="_blank">
              <ExternalLink className="h-4 w-4" />
              Public page
            </Link>
          </Button>
          <Button variant="outline" asChild className="rounded-xl" style={{ borderColor: "var(--border-strong)", color: "var(--text)" }}>
            <Link href={`/organizer/messages?trip=${id}`}>
              <Send className="h-4 w-4" />
              Communication
            </Link>
          </Button>
        </div>
      </div>

      {/* ── Status card ────────────────────────────────────────── */}
      <Card className="manage-stat-card mb-6 border shadow-none" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-base" style={{ color: "var(--text)" }}>Trip Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            <div className="min-w-[220px] max-w-sm flex-1">
              <Label className="text-xs" style={{ color: "var(--text-tertiary)" }}>Current status</Label>
              <Select value={trip.status} onValueChange={(v) => handleStatusChange(v as TripStatus)}>
                <SelectTrigger className="mt-1.5 rounded-xl capitalize" style={{ borderColor: "var(--border-strong)" }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRIP_STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="capitalize">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="min-w-[200px] flex-1 text-sm" style={{ color: "var(--text-secondary)" }}>
              {trip.status === "live"
                ? "This trip is visible to travelers and accepting bookings."
                : trip.status === "draft"
                  ? "Only you can see this trip while it is a draft."
                  : trip.status === "scheduled"
                    ? "This trip will go live automatically on the start date."
                    : trip.status === "completed"
                      ? "This trip has finished and is no longer bookable."
                      : "This trip has been cancelled and is hidden from travelers."}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ── Capacity bar ───────────────────────────────────────── */}
      <Card className="manage-stat-card mb-6 border shadow-none" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
        <CardContent className="p-5">
          <div className="mb-2 flex justify-between text-sm">
            <span style={{ color: "var(--text-secondary)" }}>Capacity ({trip.booked}/{trip.capacity})</span>
            <span style={{ color: "var(--text-secondary)" }}>Min: {trip.minCapacity}</span>
          </div>
          <div className="relative h-2 overflow-hidden rounded-full" style={{ background: "var(--border)" }}>
            <div
              ref={capacityFillRef}
              className="absolute inset-y-0 left-0 rounded-full"
              style={{ width: "0%", background: "var(--gradient-brand)" }}
            />
          </div>
          <div className="mt-2 flex flex-wrap justify-between gap-2 text-xs" style={{ color: "var(--text-tertiary)" }}>
            <span>Revenue: {formatCurrency(trip.price * trip.booked)}</span>
            <span>{trip.views} views · {trip.conversions} conversions</span>
          </div>
          {minReached && (
            <p className="mt-2 text-xs font-medium" style={{ color: "var(--gold)" }}>
              Automatic payout will trigger on departure date.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList
              className="manage-stat-card mb-6 rounded-xl p-1"
              style={{ background: "var(--bg-secondary)" }}
            >
              <TabsTrigger value="details" className="rounded-lg data-[state=active]:shadow-sm">
                Trip Details
              </TabsTrigger>
              <TabsTrigger value="bookings" className="rounded-lg data-[state=active]:shadow-sm">
                Bookings ({attendees.length})
              </TabsTrigger>
              <TabsTrigger
                value="cancellations"
                className="rounded-lg data-[state=active]:shadow-sm"
                onClick={refreshCancellations}
              >
                Cancellations ({cancellations.length})
              </TabsTrigger>
            </TabsList>

            {/* ══════════════════════ DETAILS ══════════════════════ */}
            <TabsContent value="details" className="space-y-6">
              <Card className="manage-reveal border shadow-none" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
                <CardHeader>
                  <CardTitle className="font-display text-base" style={{ color: "var(--text)" }}>About this trip</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="leading-relaxed" style={{ color: "var(--text-secondary)" }}>{trip.description}</p>
                </CardContent>
              </Card>

              {trip.images.length > 1 && (
                <Card className="manage-reveal border shadow-none" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
                  <CardHeader>
                    <CardTitle className="font-display text-base" style={{ color: "var(--text)" }}>Gallery</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                      {trip.images.map((img: string) => (
                        <div key={img} className="group relative aspect-[4/3] overflow-hidden rounded-lg">
                          <Image
                            src={img}
                            alt=""
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-110"
                            sizes="200px"
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* ── Combined included/excluded with hover-highlight rows ── */}
              <Card className="manage-reveal border shadow-none" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
                <CardContent className="grid gap-0 p-0 md:grid-cols-2">
                  <div className="p-5">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--gold)" }}>
                      What&apos;s included
                    </p>
                    <div className="space-y-1">
                      {trip.included.map((item: string) => (
                        <div
                          key={item}
                          className="flex items-start gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors"
                          style={{ color: "var(--text-secondary)" }}
                          onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.background = "var(--gold-dim)")}
                          onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.background = "transparent")}
                        >
                          <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "var(--gold)" }} />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="border-t p-5 md:border-l md:border-t-0" style={{ borderColor: "var(--border)" }}>
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                      Not included
                    </p>
                    <div className="space-y-1">
                      {trip.excluded.map((item: string) => (
                        <div
                          key={item}
                          className="flex items-start gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors"
                          style={{ color: "var(--text-secondary)" }}
                          onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.background = "var(--bg-secondary)")}
                          onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.background = "transparent")}
                        >
                          <X className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "var(--text-tertiary)" }} />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* ── Collapsible itinerary days ── */}
              <Card className="manage-reveal itinerary-card border shadow-none" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
                <CardHeader>
                  <CardTitle className="font-display text-base" style={{ color: "var(--text)" }}>Itinerary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {trip.itinerary.map((day: { day: number; title: string; activities: string[] }) => {
                    const isOpen = openDay === day.day;
                    return (
                      <div key={day.day} className="rounded-xl border" style={{ borderColor: "var(--border)" }}>
                        <button
                          type="button"
                          onClick={() => setOpenDay(isOpen ? null : day.day)}
                          className="flex w-full items-center gap-4 p-3 text-left"
                        >
                          <div
                            className="itinerary-day-marker flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                            style={{ background: "var(--gradient-brand)", color: "#fbf7f1" }}
                          >
                            {day.day}
                          </div>
                          <h3 className="flex-1 font-medium" style={{ color: "var(--text)" }}>{day.title}</h3>
                          <ChevronDown
                            className="h-4 w-4 shrink-0 transition-transform"
                            style={{ color: "var(--text-tertiary)", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                          />
                        </button>
                        {isOpen && (
                          <ul className="space-y-1.5 px-4 pb-4 pl-[3.25rem]" style={{ animation: "fade-up 0.3s ease-out" }}>
                            {day.activities.map((activity) => (
                              <li key={activity} className="flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                                <span className="h-1 w-1 shrink-0 rounded-full" style={{ background: "var(--gold)" }} />
                                {activity}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {trip.addOns.length > 0 && (
                <Card className="manage-reveal border shadow-none" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
                  <CardHeader>
                    <CardTitle className="font-display text-base" style={{ color: "var(--text)" }}>Add-ons</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1">
                    {trip.addOns.map((addon: { id: string; name: string; price: number }) => (
                      <div
                        key={addon.id}
                        className="flex items-center justify-between rounded-lg px-2 py-2 text-sm transition-colors"
                        onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.background = "var(--bg-secondary)")}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.background = "transparent")}
                      >
                        <span style={{ color: "var(--text-secondary)" }}>{addon.name}</span>
                        <span className="font-medium" style={{ color: "var(--text)" }}>{formatCurrency(addon.price)}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              <Card className="manage-reveal border shadow-none" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
                <CardHeader>
                  <CardTitle className="font-display text-base" style={{ color: "var(--text)" }}>Pricing summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span style={{ color: "var(--text-tertiary)" }}>Price per person</span>
                    <span className="font-medium" style={{ color: "var(--text)" }}>{formatCurrency(trip.price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: "var(--text-tertiary)" }}>Deposit to secure spot</span>
                    <span className="font-medium" style={{ color: "var(--text)" }}>{formatCurrency(trip.depositAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: "var(--text-tertiary)" }}>Group size</span>
                    <span className="font-medium" style={{ color: "var(--text)" }}>Min {trip.minCapacity} · Max {trip.capacity}</span>
                  </div>
                  <Separator style={{ background: "var(--border)" }} />
                  <div className="flex justify-between">
                    <span style={{ color: "var(--text-tertiary)" }}>Potential revenue (full capacity)</span>
                    <span className="font-semibold" style={{ color: "var(--primary)" }}>{formatCurrency(trip.price * trip.capacity)}</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ══════════════════════ BOOKINGS ═════════════════════ */}
            <TabsContent value="bookings">
              <Tabs defaultValue="attendees">
                <TabsList className="rounded-xl p-1" style={{ background: "var(--bg-secondary)" }}>
                  <TabsTrigger value="attendees" className="rounded-lg data-[state=active]:shadow-sm">All ({attendees.length})</TabsTrigger>
                  <TabsTrigger value="paid" className="rounded-lg data-[state=active]:shadow-sm">Paid ({paid.length})</TabsTrigger>
                  <TabsTrigger value="pending" className="rounded-lg data-[state=active]:shadow-sm">Pending ({pending.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="attendees" className="mt-4">
                  <Card className="border shadow-none" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
                    <CardContent ref={tableRef} className="p-0">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b text-left" style={{ borderColor: "var(--border)" }}>
                            <th className="p-4 font-medium" style={{ color: "var(--text-tertiary)" }}>Attendee</th>
                            <th className="p-4 font-medium" style={{ color: "var(--text-tertiary)" }}>Status</th>
                            <th className="p-4 text-right font-medium" style={{ color: "var(--text-tertiary)" }}>Amount</th>
                            <th className="p-4 text-right font-medium" style={{ color: "var(--text-tertiary)" }}></th>
                          </tr>
                        </thead>
                        <tbody>
                          {attendees.map((a) => (
                            <tr
                              key={a.email}
                              className="attendee-row border-b transition-colors last:border-0"
                              style={{ borderColor: "var(--border)" }}
                              onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "var(--bg-secondary)")}
                              onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "transparent")}
                            >
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <div
                                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                                    style={{ background: avatarColorFor(a.name) }}
                                  >
                                    {initialsFor(a.name)}
                                  </div>
                                  <div>
                                    <p className="font-medium" style={{ color: "var(--text)" }}>{a.name}</p>
                                    <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>{a.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4">
                                <Badge style={{ ...statusBadgeStyle(a.status), border: "none" }}>{a.status}</Badge>
                              </td>
                              <td className="p-4 text-right font-medium" style={{ color: "var(--text)" }}>
                                {formatCurrency(a.amount)}
                              </td>
                              <td className="p-4 text-right">
                                <button
                                  type="button"
                                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs transition-colors"
                                  style={{ color: "var(--primary)" }}
                                  onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--primary-dim)")}
                                  onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
                                >
                                  <Mail className="h-3 w-3" /> Message
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="paid" className="mt-4">
                  <div className="grid gap-2 sm:grid-cols-2">
                    {paid.map((a) => (
                      <div
                        key={a.email}
                        className="flex items-center gap-3 rounded-xl border p-3 transition-all hover:-translate-y-0.5"
                        style={{ borderColor: "var(--border)", background: "var(--surface)" }}
                      >
                        <div
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                          style={{ background: avatarColorFor(a.name) }}
                        >
                          {initialsFor(a.name)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium" style={{ color: "var(--text)" }}>{a.name}</p>
                          <p className="flex items-center gap-1 text-xs" style={{ color: "var(--gold)" }}>
                            <ShieldCheck className="h-3 w-3" /> Paid in full
                          </p>
                        </div>
                        <span className="shrink-0 text-sm font-semibold" style={{ color: "var(--gold)" }}>
                          {formatCurrency(a.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="pending" className="mt-4">
                  {pending.length === 0 ? (
                    <div
                      className="flex flex-col items-center justify-center rounded-xl border py-10 text-center"
                      style={{ borderColor: "var(--border)", background: "var(--surface)" }}
                    >
                      <ShieldCheck className="mb-2 h-6 w-6" style={{ color: "var(--gold)" }} />
                      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>No pending payments.</p>
                    </div>
                  ) : (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {pending.map((a) => (
                        <div
                          key={a.email}
                          className="rounded-xl border p-3 transition-all hover:-translate-y-0.5"
                          style={{ borderColor: "rgba(208,138,60,0.3)", background: "rgba(208,138,60,0.06)" }}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                              style={{ background: avatarColorFor(a.name) }}
                            >
                              {initialsFor(a.name)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium" style={{ color: "var(--text)" }}>{a.name}</p>
                              <p className="text-xs" style={{ color: "var(--amber)" }}>Deposit pending</p>
                            </div>
                            <span className="shrink-0 text-sm font-semibold" style={{ color: "var(--amber)" }}>
                              {formatCurrency(a.amount)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </TabsContent>

            {/* ══════════════════════ CANCELLATIONS ════════════════ */}
            <TabsContent value="cancellations" className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  Traveler cancellation requests for this trip.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="rounded-xl"
                  style={{ borderColor: "var(--border-strong)", color: "var(--text)" }}
                >
                  <Link href="/organizer/refunds">
                    <RotateCcw className="h-4 w-4" />
                    All refunds
                  </Link>
                </Button>
              </div>
              <RefundRequestsSection
                requests={cancellations}
                onUpdated={refreshCancellations}
                showTripLink={false}
                emptyMessage="No cancellation requests for this trip yet. Travelers cancel from their dashboard."
              />
            </TabsContent>
          </Tabs>
        </div>

        <TripAnalyticsPanel trip={trip} className="manage-reveal hidden lg:block" />
      </div>

      <TripAnalyticsPanel trip={trip} className="manage-reveal mt-8 lg:hidden" />
    </div>
  );
}
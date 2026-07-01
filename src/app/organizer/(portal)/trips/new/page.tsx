"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar, MapPin, Plus, Search, SlidersHorizontal, Sparkles, TrendingUp, Users } from "lucide-react";
import { toast } from "sonner";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { TripFormEditor } from "@/components/organizer/trip-form-editor";
import { ORGANIZER_ID, useOrganizerTrips } from "@/hooks/use-organizer-trips";
import {
  INITIAL_TRIP_FORM,
  STATUS_MESSAGES,
  buildNewTrip,
} from "@/lib/trip-form-utils";
import { formatCurrency, formatDateRange } from "@/lib/utils";
import type { TripStatus } from "@/lib/types";

gsap.registerPlugin(ScrollTrigger);

const FILTERS: { label: string; value: TripStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Live", value: "live" },
  { label: "Draft", value: "draft" },
  { label: "Completed", value: "completed" },
];

function statusBadgeStyle(status: string) {
  switch (status) {
    case "live":
      return { background: "var(--gold-dim)", color: "var(--gold)" };
    case "draft":
      return { background: "var(--bg-secondary)", color: "var(--text-secondary)" };
    case "completed":
      return { background: "var(--primary-dim)", color: "var(--primary)" };
    default:
      return { background: "var(--primary-dim)", color: "var(--primary)" };
  }
}

export default function CreateTripPage() {
  const router = useRouter();
  const { trips, createTrip, isLoading } = useOrganizerTrips();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<TripStatus | "all">("all");

  const startCreateTrip = () => setShowForm(true);

  const handleSave = (
    form: typeof INITIAL_TRIP_FORM,
    addOns: { name: string; price: string }[],
    status: TripStatus
  ) => {
    const trip = createTrip(buildNewTrip(form, addOns, status, ORGANIZER_ID));
    toast.success(STATUS_MESSAGES[status]);
    router.push(`/organizer/trips/${trip.id}`);
  };

  /* ── Derived stats for the summary strip ── */
  const liveCount = trips.filter((t) => t.status === "live").length;
  const totalBooked = trips.reduce((s, t) => s + t.booked, 0);
  const totalCapacity = trips.reduce((s, t) => s + t.capacity, 0);
  const fillRate = totalCapacity > 0 ? Math.round((totalBooked / totalCapacity) * 100) : 0;

  const filteredTrips = trips.filter((t) => {
    const matchesFilter = filter === "all" || t.status === filter;
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.destination.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  /* ════════════════════════════════════════════════════════════
     GSAP — scroll-triggered reveal for the trip grid + a subtle
     parallax on each card's cover image. Re-runs whenever the
     filtered list changes so newly-revealed cards (after a filter
     or search) animate in too, not just on first mount.
  ════════════════════════════════════════════════════════════ */
  const gridRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showForm) return;

    const ctx = gsap.context(() => {
      // Header + stat strip entrance
      gsap.from(".trips-hero-anim", {
        y: 24,
        opacity: 0,
        duration: 0.7,
        stagger: 0.08,
        ease: "power3.out",
      });

      // Card grid stagger-reveal on scroll
      const cards = gsap.utils.toArray<HTMLElement>(".trip-card", gridRef.current);
      cards.forEach((card, i) => {
        gsap.fromTo(
          card,
          { y: 50, opacity: 0, scale: 0.96 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.6,
            ease: "power3.out",
            delay: (i % 2) * 0.08, // slight stagger across the 2-col grid
            scrollTrigger: { trigger: card, start: "top 88%", once: true },
          }
        );

        // Cover image subtle parallax as each card scrolls through view
        const img = card.querySelector(".trip-card-image");
        if (img) {
          gsap.fromTo(
            img,
            { yPercent: -8 },
            {
              yPercent: 8,
              ease: "none",
              scrollTrigger: {
                trigger: card,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            }
          );
        }
      });
    }, heroRef);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showForm, filteredTrips.length, filter, search]);

  if (showForm) {
    return (
      <TripFormEditor
        mode="create"
        heading="Create Trip"
        subheading="Set up your trip with photos, logistics, pricing, and policies. Save as draft or publish when ready."
        initialForm={INITIAL_TRIP_FORM}
        initialAddOns={[]}
        onBack={() => setShowForm(false)}
        onSave={handleSave}
      />
    );
  }

  return (
    <div ref={heroRef} className="max-w-6xl p-6 lg:p-8" style={{ background: "var(--bg)" }}>
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="trips-hero-anim mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold" style={{ color: "var(--text)" }}>
            My Trips
          </h1>
          <p className="mt-1 max-w-xl text-sm" style={{ color: "var(--text-secondary)" }}>
            View and manage your trips, or create a new one to share with travelers.
          </p>
        </div>
        <Button
          onClick={startCreateTrip}
          className="rounded-xl"
          style={{ background: "var(--gradient-brand)", color: "#fbf7f1", boxShadow: "var(--glow-gold)" }}
        >
          <Plus className="h-4 w-4" />
          Create Trip
        </Button>
      </div>

      {/* ── Quick stat strip ───────────────────────────────────── */}
      {trips.length > 0 && (
        <div className="trips-hero-anim mb-6 grid gap-3 sm:grid-cols-3">
          <div
            className="flex items-center gap-3 rounded-2xl border p-4"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "var(--gold-dim)" }}>
              <Sparkles className="h-4.5 w-4.5" style={{ color: "var(--gold)" }} />
            </div>
            <div>
              <p className="font-display text-xl font-bold" style={{ color: "var(--text)" }}>{liveCount}</p>
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Live trips right now</p>
            </div>
          </div>
          <div
            className="flex items-center gap-3 rounded-2xl border p-4"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "var(--primary-dim)" }}>
              <Users className="h-4.5 w-4.5" style={{ color: "var(--primary)" }} />
            </div>
            <div>
              <p className="font-display text-xl font-bold" style={{ color: "var(--text)" }}>{totalBooked}</p>
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Total travelers booked</p>
            </div>
          </div>
          <div
            className="flex items-center gap-3 rounded-2xl border p-4"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "var(--primary-dim)" }}>
              <TrendingUp className="h-4.5 w-4.5" style={{ color: "var(--primary)" }} />
            </div>
            <div>
              <p className="font-display text-xl font-bold" style={{ color: "var(--text)" }}>{fillRate}%</p>
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Average fill rate</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Search + filter row ────────────────────────────────── */}
      {trips.length > 0 && (
        <div className="trips-hero-anim mb-6 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 sm:max-w-xs">
            <Search
              className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2"
              style={{ color: "var(--text-tertiary)" }}
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or destination..."
              className="h-10 rounded-xl pl-9 text-sm"
              style={{ borderColor: "var(--border-strong)" }}
            />
          </div>
          <div
            className="flex items-center gap-1 rounded-xl border p-1"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
          >
            {FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setFilter(f.value)}
                className="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                style={{
                  background: filter === f.value ? "var(--primary-dim)" : "transparent",
                  color: filter === f.value ? "var(--primary)" : "var(--text-secondary)",
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div
            className="hidden items-center gap-1.5 rounded-xl border px-3 py-2 text-xs sm:flex"
            style={{ borderColor: "var(--border)", color: "var(--text-tertiary)" }}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            {filteredTrips.length} of {trips.length}
          </div>
        </div>
      )}

      {/* ── Body ───────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="h-[280px] animate-pulse rounded-2xl"
              style={{ background: "var(--bg-secondary)" }}
            />
          ))}
        </div>
      ) : trips.length === 0 ? (
        <Card className="trips-hero-anim border shadow-none" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div
              className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{ background: "var(--gradient-brand)", boxShadow: "var(--glow-gold)" }}
            >
              <MapPin className="h-7 w-7" style={{ color: "#fbf7f1" }} />
            </div>
            <h2 className="font-display text-lg font-semibold" style={{ color: "var(--text)" }}>No trips yet</h2>
            <p className="mt-1 max-w-sm text-sm" style={{ color: "var(--text-secondary)" }}>
              Create your first trip to start accepting bookings from travelers.
            </p>
            <Button
              className="mt-6 rounded-xl"
              onClick={startCreateTrip}
              style={{ background: "var(--gradient-brand)", color: "#fbf7f1" }}
            >
              <Plus className="h-4 w-4" />
              Create Trip
            </Button>
          </CardContent>
        </Card>
      ) : filteredTrips.length === 0 ? (
        <div
          className="rounded-2xl border p-10 text-center"
          style={{ borderColor: "var(--border)", background: "var(--surface)" }}
        >
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            No trips match &quot;{search}&quot;{filter !== "all" ? ` in ${filter}` : ""}.
          </p>
        </div>
      ) : (
        <div ref={gridRef} className="grid gap-5 sm:grid-cols-2">
          {filteredTrips.map((trip) => {
            const pct = (trip.booked / trip.capacity) * 100;
            const badgeStyle = statusBadgeStyle(trip.status);
            return (
              <Link
                key={trip.id}
                href={`/organizer/trips/${trip.id}`}
                className="trip-card group block overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-1"
                style={{ borderColor: "var(--border)", background: "var(--surface)" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.boxShadow = "var(--glow-teal)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.boxShadow = "none")}
              >
                <div className="relative aspect-[16/9] overflow-hidden">
                  {/* parallax wrapper — slightly oversized so vertical
                      translate from GSAP never reveals empty edges */}
                  <div className="trip-card-image absolute inset-[-6%]">
                    <Image
                      src={trip.image}
                      alt={trip.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                  <div
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(to top, rgba(42,27,15,0.55), transparent 60%)" }}
                  />
                  <Badge
                    className="absolute right-3 top-3 capitalize"
                    style={{ ...badgeStyle, border: "none" }}
                  >
                    {trip.status}
                  </Badge>

                  {/* spots-left flag, only when nearly full — adds a
                      bit of urgency texture similar to the "live" stats */}
                  {pct >= 80 && trip.status === "live" && (
                    <span
                      className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
                      style={{ background: "var(--coral)", color: "#fff" }}
                    >
                      Filling fast
                    </span>
                  )}
                </div>

                <div className="p-4">
                  <h3
                    className="font-display font-semibold transition-colors"
                    style={{ color: "var(--text)" }}
                  >
                    {trip.title}
                  </h3>
                  <div
                    className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" style={{ color: "var(--text-tertiary)" }} />
                      {trip.destination}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" style={{ color: "var(--text-tertiary)" }} />
                      {formatDateRange(trip.startDate, trip.endDate)}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="font-semibold" style={{ color: "var(--text)" }}>
                      {formatCurrency(trip.price)}
                      <span style={{ color: "var(--text-tertiary)", fontWeight: 400 }}> / person</span>
                    </span>
                    <span style={{ color: "var(--text-secondary)" }}>
                      {trip.booked}/{trip.capacity} booked
                    </span>
                  </div>
                  <Progress value={pct} className="mt-3 h-1.5" style={{ background: "var(--bg-secondary)" }} />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
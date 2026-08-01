"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowUpRight,
  Calendar,
  MapPin,
  Plus,
  Search,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { TripFormEditor } from "@/components/organizer/trip-form-editor";
import { OrganizerEmptyState } from "@/components/organizer/empty-state";
import { useOrganizerTrips } from "@/hooks/use-organizer-trips";
import { ApiError } from "@/lib/api/client";
import type { CreateTripFiles } from "@/lib/api/organizer-trips";
import {
  INITIAL_TRIP_FORM,
  STATUS_MESSAGES,
} from "@/lib/trip-form-utils";
import { formatCurrency, formatDateRange } from "@/lib/utils";
import {
  capacityFillPercent,
  formatBookedCapacity,
} from "@/lib/trip-capacity";
import type { Trip, TripStatus } from "@/lib/types";
import type { TripForm } from "@/lib/trip-form-utils";

gsap.registerPlugin(ScrollTrigger);

const FILTERS: { label: string; value: TripStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Live", value: "live" },
  { label: "Draft", value: "draft" },
  { label: "Completed", value: "completed" },
];

function statusMeta(status: string) {
  switch (status) {
    case "live":
      return { label: "Live", color: "var(--gold)", bg: "var(--gold-dim)" };
    case "draft":
      return {
        label: "Draft",
        color: "var(--text-secondary)",
        bg: "var(--bg-secondary)",
      };
    case "completed":
      return {
        label: "Completed",
        color: "var(--primary)",
        bg: "var(--primary-dim)",
      };
    case "scheduled":
      return {
        label: "Scheduled",
        color: "var(--primary)",
        bg: "var(--primary-dim)",
      };
    default:
      return {
        label: status,
        color: "var(--text-secondary)",
        bg: "var(--bg-secondary)",
      };
  }
}

export default function CreateTripPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { trips, createTrip, isLoading, isSaving, error } = useOrganizerTrips();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState(() => searchParams.get("q")?.trim() ?? "");
  const [filter, setFilter] = useState<TripStatus | "all">("all");

  useEffect(() => {
    const q = searchParams.get("q");
    if (q != null) setSearch(q.trim());
  }, [searchParams]);

  const startCreateTrip = () => setShowForm(true);

  const handleSave = async (
    form: TripForm,
    addOns: { name: string; price: string }[],
    status: TripStatus,
    files: CreateTripFiles
  ) => {
    try {
      const trip = await createTrip(form, addOns, status, files);
      toast.success(STATUS_MESSAGES[status]);
      router.push(`/organizer/trips/${trip.id}`);
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? err.message
          : "Unable to create trip. Please try again."
      );
    }
  };

  const liveCount = trips.filter((t) => t.status === "live").length;
  const totalBooked = trips.reduce((s, t) => s + t.booked, 0);
  const totalCapacity = trips.reduce(
    (s, t) => s + (typeof t.capacity === "number" ? t.capacity : 0),
    0
  );
  const fillRate =
    totalCapacity > 0 ? Math.round((totalBooked / totalCapacity) * 100) : 0;

  if (error && !isLoading && trips.length === 0 && !showForm) {
    return (
      <div className="mx-auto max-w-lg p-8 text-center">
        <p className="mb-3 text-sm" style={{ color: "var(--text-secondary)" }}>
          {error}
        </p>
        <Button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-lg"
          style={{ background: "var(--gradient-brand)", color: "#fbf7f1" }}
        >
          Retry
        </Button>
      </div>
    );
  }

  const filterCounts = FILTERS.reduce(
    (acc, f) => {
      acc[f.value] =
        f.value === "all"
          ? trips.length
          : trips.filter((t) => t.status === f.value).length;
      return acc;
    },
    {} as Record<string, number>
  );

  const filteredTrips = trips.filter((t) => {
    const matchesFilter = filter === "all" || t.status === filter;
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      t.title.toLowerCase().includes(q) ||
      t.destination.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  const gridRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showForm) return;

    const ctx = gsap.context(() => {
      gsap.from(".trips-hero-anim", {
        y: 16,
        opacity: 0,
        duration: 0.55,
        stagger: 0.06,
        ease: "power3.out",
      });

      const cards = gsap.utils.toArray<HTMLElement>(
        ".trip-card",
        gridRef.current
      );
      cards.forEach((card, i) => {
        gsap.fromTo(
          card,
          { y: 28, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            ease: "power3.out",
            delay: (i % 3) * 0.05,
            scrollTrigger: { trigger: card, start: "top 92%", once: true },
          }
        );
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
        subheading="Four steps: basics, experience, pricing, then meetup — then publish when you're ready."
        initialForm={INITIAL_TRIP_FORM}
        initialAddOns={[]}
        isSaving={isSaving}
        onBack={() => setShowForm(false)}
        onSave={handleSave}
      />
    );
  }

  return (
    <div
      ref={heroRef}
      className="mx-auto max-w-6xl p-6 lg:p-8"
      style={{ background: "#f5f5f5" }}
    >
      {/* Header */}
      <div className="trips-hero-anim mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1
            className="font-display text-2xl font-bold tracking-tight"
            style={{ color: "var(--text)" }}
          >
            My Trips
          </h1>
          <p
            className="mt-1 text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            Manage listings, seats, and status in one place.
          </p>
        </div>
        <Button
          onClick={startCreateTrip}
          
          style={{
            background: "var(--gradient-brand)",
            color: "#fbf7f1",
            boxShadow: "var(--glow-gold)",
          }}
        >
          <Plus className="h-4 w-4" />
          Create Trip
        </Button>
      </div>

      {trips.length > 0 && (
        <>
          {/* Dense KPI strip — industry ops dashboards prefer inline metrics over 3 large cards */}
          <div
            className="trips-hero-anim mb-4 grid grid-cols-3 overflow-hidden rounded-xl border"
            style={{
              borderColor: "var(--border)",
              background: "var(--surface)",
            }}
          >
            {[
              {
                icon: Sparkles,
                value: String(liveCount),
                label: "Live",
                accent: "var(--gold)",
                dim: "var(--gold-dim)",
              },
              {
                icon: Users,
                value: String(totalBooked),
                label: "Travelers",
                accent: "var(--primary)",
                dim: "var(--primary-dim)",
              },
              {
                icon: TrendingUp,
                value: `${fillRate}%`,
                label: "Fill rate",
                accent: "var(--primary)",
                dim: "var(--primary-dim)",
              },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="flex items-center gap-3 px-4 py-3.5 sm:px-5"
                  style={{
                    borderLeft:
                      i > 0 ? "1px solid var(--border)" : undefined,
                  }}
                >
                  <div
                    className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg sm:flex"
                    style={{ background: stat.dim }}
                  >
                    <Icon className="h-3.5 w-3.5" style={{ color: stat.accent }} />
                  </div>
                  <div className="min-w-0">
                    <p
                      className="font-display text-lg font-bold leading-none sm:text-xl"
                      style={{ color: "var(--text)" }}
                    >
                      {stat.value}
                    </p>
                    <p
                      className="mt-1 truncate text-[11px]"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      {stat.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Unified toolbar */}
          <div
            className="trips-hero-anim mb-5 flex flex-col gap-3 rounded-xl border p-2 sm:flex-row sm:items-center"
            style={{
              borderColor: "var(--border)",
              background: "var(--surface)",
            }}
          >
            <div className="relative min-w-0 flex-1">
              <Search
                className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2"
                style={{ color: "var(--text-tertiary)" }}
              />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search trips or destinations…"
                className="h-9 border-0 bg-transparent pl-9 text-sm shadow-none focus-visible:ring-0"
              />
            </div>
            <div
              className="flex items-center gap-0.5 overflow-x-auto px-1 sm:border-l sm:pl-2"
              style={{ borderColor: "var(--border)" }}
            >
              {FILTERS.map((f) => {
                const active = filter === f.value;
                const count = filterCounts[f.value] ?? 0;
                return (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => setFilter(f.value)}
                    className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors"
                    style={{
                      background: active ? "var(--primary-dim)" : "transparent",
                      color: active ? "var(--primary)" : "var(--text-secondary)",
                    }}
                  >
                    {f.label}
                    <span
                      className="ml-1.5 tabular-nums"
                      style={{
                        color: active
                          ? "var(--primary)"
                          : "var(--text-tertiary)",
                        opacity: 0.85,
                      }}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-72 animate-pulse rounded-xl"
              style={{ background: "var(--bg-secondary)" }}
            />
          ))}
        </div>
      ) : trips.length === 0 ? (
        <EmptyTrips onCreate={startCreateTrip} />
      ) : filteredTrips.length === 0 ? (
        <OrganizerEmptyState
          icon={Search}
          title={
            search
              ? `No trips match "${search}"`
              : filter !== "all"
                ? `No ${filter} trips`
                : "No trips match"
          }
          description={
            filter !== "all"
              ? `Nothing in ${filter} right now. Try another filter or clear search.`
              : "Try a different search or clear your filters."
          }
          action={{
            label: "Clear filters",
            onClick: () => {
              setSearch("");
              setFilter("all");
            },
          }}
        />
      ) : (
        <div
          ref={gridRef}
          className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
        >
          {filteredTrips.map((trip) => (
            <TripListCard key={trip.id} trip={trip} />
          ))}
        </div>
      )}
    </div>
  );
}

function TripListCard({ trip }: { trip: Trip }) {
  const pct = capacityFillPercent(trip);
  const status = statusMeta(trip.status);
  const fillingFast = pct >= 80 && trip.status === "live";

  return (
    <Link
      href={`/organizer/trips/${trip.id}`}
      className="trip-card group flex flex-col overflow-hidden rounded-xl border transition-colors"
      style={{
        borderColor: "var(--border)",
        background: "var(--surface)",
      }}
    >
      {/* Mid-height cover */}
      <div className="relative h-56 overflow-hidden sm:h-60">
        <Image
          src={trip.image || "/images/cta-image.jpg"}
          alt={trip.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
          unoptimized={
            Boolean(
              trip.image &&
                (trip.image.startsWith("http://") ||
                  trip.image.startsWith("https://"))
            )
          }
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(28,18,10,0.78) 0%, rgba(28,18,10,0.25) 48%, transparent 72%)",
          }}
        />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-2.5">
          <div className="flex flex-wrap gap-1.5">
            <span
              className="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
              style={{ background: status.bg, color: status.color }}
            >
              {status.label}
            </span>
            {fillingFast && (
              <span
                className="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                style={{ background: "var(--coral)", color: "#fff" }}
              >
                Filling fast
              </span>
            )}
          </div>
          <span
            className="flex h-7 w-7 items-center justify-center rounded-full opacity-0 transition-opacity group-hover:opacity-100"
            style={{
              background: "rgba(255,255,255,0.92)",
              color: "var(--text)",
            }}
          >
            <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-3">
          <h3 className="font-display line-clamp-1 text-[15px] font-semibold leading-snug text-white">
            {trip.title}
          </h3>
          <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-white/75">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span className="max-w-[9rem] truncate">{trip.destination}</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDateRange(trip.startDate, trip.endDate)}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2 px-3.5 py-3">
        <div className="flex items-end justify-between gap-2">
          <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>
            {formatCurrency(trip.price)}
            <span
              className="ml-1 text-[11px] font-normal"
              style={{ color: "var(--text-tertiary)" }}
            >
              / person
            </span>
          </p>
          <p
            className="tabular-nums text-[11px]"
            style={{ color: "var(--text-secondary)" }}
          >
            {formatBookedCapacity(trip)}
          </p>
        </div>
        {pct > 0 || trip.capacity != null ? (
          <Progress
            value={pct}
            className="h-1"
            style={{ background: "var(--bg-secondary)" }}
          />
        ) : null}
      </div>
    </Link>
  );
}

function EmptyTrips({ onCreate }: { onCreate: () => void }) {
  return (
    <OrganizerEmptyState
      icon={MapPin}
      title="No trips yet"
      description="Publish your first listing and start filling seats with travelers."
      action={{ label: "+ Create your first trip", onClick: onCreate }}
      className="trips-hero-anim"
    />
  );
}

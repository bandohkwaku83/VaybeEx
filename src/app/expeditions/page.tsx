"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Heart,
  MapPin,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { FadeInUp } from "@/components/ui/fadeInUp";
import { MediaImage } from "@/components/ui/media-image";
import { listPublicTrips } from "@/lib/api/public-trips";
import { formatGHS, formatDateRange, tripTypeLabel } from "@/lib/format";
import { getTripDetailHref } from "@/lib/tenant";
import { isTripBookable } from "@/lib/trip-capacity";
import { TRIP_CATEGORIES } from "@/lib/trip-form-utils";
import { useAuth } from "@/hooks/use-auth";
import { useWishlist } from "@/hooks/use-wishlist";
import type { Trip, TripCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

const typeFilters: { value: TripCategory | "all"; label: string }[] = [
  { value: "all", label: "All" },
  ...TRIP_CATEGORIES.map((value) => ({
    value,
    label: tripTypeLabel[value] ?? value,
  })),
];

function categoryOf(trip: Trip) {
  const raw = tripTypeLabel[trip.category] ?? trip.category.replace(/_/g, " ");
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

function ExpeditionItem({
  trip,
  priority,
  index = 0,
}: {
  trip: Trip;
  priority?: boolean;
  index?: number;
}) {
  const href = getTripDetailHref(trip);
  const bookable = isTripBookable(trip);
  const { requireTravelerAuth } = useAuth();
  const { toggle, isWishlisted } = useWishlist();
  const saved = isWishlisted(trip.id, trip.isFavorited === true);

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    requireTravelerAuth(() => {
      void (async () => {
        const wasSaved = isWishlisted(trip.id, trip.isFavorited === true);
        try {
          await toggle(trip.id);
          toast.success(
            wasSaved ? "Removed from wishlist" : "Saved to wishlist",
          );
        } catch {
          /* toast already shown in hook */
        }
      })();
    });
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.55,
        delay: index * 0.05,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="group relative"
    >
      <a href={href} className="block outline-none">
        <div className="relative aspect-[3/4] sm:aspect-[3/2]">
          {/* Base image — dissolves to clear at the bottom */}
          <MediaImage
            src={trip.image}
            alt={trip.title}
            fill
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={cn(
              "object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]",
              !bookable && "opacity-90",
            )}
            style={{
              maskImage:
                "linear-gradient(to bottom, black 0%, black 48%, transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(to bottom, black 0%, black 48%, transparent 100%)",
            }}
          />
          {/* Soft black mist that clears the lower edge */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[58%]"
            style={{
              background:
                "linear-gradient(to top, var(--bg) 0%, rgba(0,0,0,0.55) 28%, rgba(0,0,0,0.2) 55%, transparent 100%)",
              maskImage:
                "linear-gradient(to bottom, transparent 0%, black 35%, black 100%)",
              WebkitMaskImage:
                "linear-gradient(to bottom, transparent 0%, black 35%, black 100%)",
            }}
          />
          {/* Blurred image wash — no hard crop line */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[50%] overflow-hidden"
            style={{
              maskImage:
                "linear-gradient(to top, black 0%, black 25%, transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(to top, black 0%, black 25%, transparent 100%)",
            }}
          >
            <MediaImage
              src={trip.image}
              alt=""
              fill
              sizes="(max-width: 640px) 100vw, 33vw"
              className="scale-110 object-cover object-bottom opacity-70 blur-2xl"
            />
            <div className="absolute inset-0 bg-black/40" />
          </div>

          <div className="absolute left-3 top-3 z-10 flex flex-wrap items-center gap-1.5">
            <span className="bg-white/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-sm">
              {categoryOf(trip)}
            </span>
            {!bookable && (
              <span className="bg-black/50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-sm">
                Completed
              </span>
            )}
          </div>
        </div>

        <div className="relative mt-1 pt-2">
          <div className="flex items-center gap-1.5 text-xs text-text-secondary">
            <MapPin size={12} className="shrink-0 text-gold" />
            <span className="truncate">{trip.destination}</span>
            <span className="text-text-tertiary">·</span>
            <span className="truncate">
              {formatDateRange(trip.startDate, trip.endDate)}
            </span>
          </div>

          <h2 className="mt-2 font-display text-base font-bold leading-[1.2] tracking-tight text-text transition-colors group-hover:text-primary sm:text-xl">
            {trip.title}
          </h2>

          <div className="mt-3 flex items-end justify-between gap-3">
            <div>
              <p className="font-display text-base font-bold text-text sm:text-lg">
                {formatGHS(trip.price)}
              </p>
              <p className="text-[11px] text-text-tertiary">per person</p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary transition-transform duration-300 group-hover:translate-x-0.5">
              {bookable ? "Explore" : "View"}
              <ArrowRight size={13} />
            </span>
          </div>
        </div>
      </a>

      <button
        type="button"
        onClick={handleFavorite}
        aria-label={saved ? "Remove saved trip" : "Save trip"}
        className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center bg-black/30 text-white backdrop-blur-sm transition-colors hover:bg-black/45"
      >
        <Heart size={15} fill={saved ? "currentColor" : "none"} />
      </button>
    </motion.article>
  );
}

export default function ExpeditionsPage() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<TripCategory | "all">("all");
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await listPublicTrips({
          category: type === "all" ? undefined : type,
          limit: 50,
        });
        if (cancelled) return;
        setTrips(res.data?.trips ?? []);
      } catch (err) {
        if (cancelled) return;
        setTrips([]);
        setError(
          err instanceof Error ? err.message : "Unable to load expeditions.",
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [type]);

  const filteredTrips = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return trips;
    return trips.filter((trip) => {
      return (
        trip.title.toLowerCase().includes(q) ||
        trip.destination.toLowerCase().includes(q) ||
        (trip.organizerName?.toLowerCase().includes(q) ?? false) ||
        (trip.tags ?? []).some((tag) => tag.toLowerCase().includes(q))
      );
    });
  }, [query, trips]);

  const hasFilters = query.trim() !== "" || type !== "all";

  return (
    <div className="bg-bg">
      <section className="mx-auto max-w-7xl px-4 pb-24 pt-28 sm:px-6 sm:pb-32 sm:pt-32">
        <FadeInUp>
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary transition-colors hover:text-primary"
          >
            <ArrowLeft size={15} />
            Back to home
          </Link>

          <div className="mb-10 max-w-2xl">
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
              Featured expeditions
            </span>
            <h1 className="mt-3 font-display text-4xl font-bold text-text sm:text-5xl">
              Where travellers are heading
            </h1>
            <p className="mt-4 text-base text-text-secondary sm:text-lg">
              Browse every live group trip on VaybeEx — filter by vibe,
              destination, or organiser.
            </p>
          </div>
        </FadeInUp>

        <FadeInUp delay={0.05}>
          <div className="mb-10 border-y border-border py-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative min-w-0 flex-1">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 text-text-tertiary"
                />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search trips, destinations, organisers…"
                  className="h-11 w-full border-0 border-b border-border bg-transparent py-2 pl-7 pr-4 text-sm text-text outline-none transition-colors placeholder:text-text-tertiary focus:border-primary"
                />
              </div>

              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <SlidersHorizontal size={15} className="text-primary" />
                <span className="font-medium">
                  {loading ? "…" : `${filteredTrips.length} trips`}
                </span>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {typeFilters.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setType(filter.value)}
                  className={cn(
                    "px-3.5 py-1.5 text-xs font-semibold transition-colors",
                    type === filter.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-bg-secondary text-text-secondary hover:text-text",
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </FadeInUp>

        {error ? (
          <FadeInUp delay={0.1}>
            <ExpeditionsEmpty
              eyebrow="Something went wrong"
              title="We couldn't load expeditions"
              description={error}
            />
          </FadeInUp>
        ) : loading ? (
          <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 sm:gap-y-14 lg:grid-cols-3 lg:gap-y-16">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="space-y-3 sm:space-y-4">
                <div className="aspect-[3/4] animate-pulse bg-bg-secondary sm:aspect-[3/2]" />
                <div className="h-3 w-1/3 animate-pulse bg-bg-secondary" />
                <div className="h-5 w-4/5 animate-pulse bg-bg-secondary" />
                <div className="h-4 w-1/2 animate-pulse bg-bg-secondary" />
              </div>
            ))}
          </div>
        ) : filteredTrips.length === 0 ? (
          <FadeInUp delay={0.1}>
            {hasFilters ? (
              <ExpeditionsEmpty
                eyebrow="No matches"
                title="No expeditions match your filters"
                description="Try a different search term or category — or clear filters to see everything live."
                action={
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setType("all");
                    }}
                    className="mt-7 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary-dark"
                  >
                    Clear filters
                  </button>
                }
              />
            ) : (
              <ExpeditionsEmpty
                eyebrow="Coming soon"
                title="The trail is quiet — for now"
                description="When expeditions go live, they'll appear here."
              />
            )}
          </FadeInUp>
        ) : (
          <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 sm:gap-y-14 lg:grid-cols-3 lg:gap-y-16">
            {filteredTrips.map((trip, i) => (
              <ExpeditionItem
                key={trip.id}
                trip={trip}
                priority={i < 3}
                index={Math.min(i, 8)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ExpeditionsEmpty({
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
    <div className="grid items-stretch gap-6 lg:grid-cols-2 lg:gap-10">
      <div className="relative aspect-[4/5] overflow-hidden bg-bg-secondary sm:aspect-[5/4] lg:aspect-auto lg:min-h-[26rem]">
        <MediaImage
          src="/images/beautiful-nature.jpg"
          alt=""
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="scale-110 object-cover blur-md"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
        <p className="absolute bottom-5 left-5 right-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/85">
          Expeditions forming across Ghana
        </p>
      </div>

      <div className="flex flex-col justify-between gap-8">
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="relative aspect-[4/3] overflow-hidden bg-bg-secondary">
            <MediaImage
              src="/images/city-from-high.jpg"
              alt=""
              fill
              sizes="25vw"
              className="scale-110 object-cover blur-md"
            />
          </div>
          <div className="relative aspect-[4/3] overflow-hidden bg-bg-secondary">
            <MediaImage
              src="/images/high-shot.jpg"
              alt=""
              fill
              sizes="25vw"
              className="scale-110 object-cover blur-md"
            />
          </div>
        </div>

        <div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
            {eyebrow}
          </span>
          <h2 className="mt-3 font-display text-3xl font-bold text-text sm:text-4xl">
            {title}
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-text-secondary">
            {description}
          </p>
          {action}
        </div>
      </div>
    </div>
  );
}

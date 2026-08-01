"use client";

import { useEffect, useState } from "react";
import { FadeInUp } from "../ui/fadeInUp";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { listPublicTrips } from "@/lib/api/public-trips";
import { formatGHS, formatDateRange, tripTypeLabel } from "@/lib/format";
import { getTripDetailHref } from "@/lib/tenant";
import { isTripBookable } from "@/lib/trip-capacity";
import type { Trip } from "@/lib/types";
import { cn } from "@/lib/utils";

function categoryOf(trip: Trip) {
  const raw =
    tripTypeLabel[trip.category] ??
    trip.category.replace(/_/g, " ");
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

type CardSize = "feature" | "tile";

function FeaturedExpedition({
  trip,
  priority,
  index = 0,
  size = "tile",
  className,
}: {
  trip: Trip;
  priority?: boolean;
  index?: number;
  size?: CardSize;
  className?: string;
}) {
  const href = getTripDetailHref(trip);
  const bookable = isTripBookable(trip);
  const isFeature = size === "feature";

  return (
    <motion.a
      href={href}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.55,
        delay: index * 0.07,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={cn(
        "group relative isolate block min-h-0 overflow-hidden rounded-2xl bg-bg-secondary outline-none",
        className,
      )}
    >
      <img
        src={trip.image}
        alt={trip.title}
        loading={priority ? "eager" : "lazy"}
        className={cn(
          "absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]",
          !bookable && "opacity-90",
        )}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/5 transition-opacity duration-500 group-hover:from-black/80" />

      <div
        className={cn(
          "absolute inset-0 flex flex-col justify-between",
          isFeature ? "p-5 sm:p-7 lg:p-8" : "p-4 sm:p-5",
        )}
      >
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-sm">
            {categoryOf(trip)}
          </span>
          {!bookable && (
            <span className="rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-sm">
              Completed
            </span>
          )}
        </div>

        <div>
          <div className="mb-2 flex items-center gap-1.5 text-xs text-white/75">
            <MapPin size={12} className="shrink-0 text-gold" />
            <span className="truncate">{trip.destination}</span>
            <span className="text-white/40">·</span>
            <span className="truncate">
              {formatDateRange(trip.startDate, trip.endDate)}
            </span>
          </div>

          <h3
            className={cn(
              "font-display font-bold leading-[1.15] tracking-tight text-white",
              isFeature
                ? "text-2xl sm:text-3xl lg:text-4xl"
                : "text-lg sm:text-xl",
            )}
          >
            {trip.title}
          </h3>

          <div className="mt-3 flex items-end justify-between gap-3">
            <div>
              <p
                className={cn(
                  "font-display font-bold text-white",
                  isFeature ? "text-xl sm:text-2xl" : "text-base sm:text-lg",
                )}
              >
                {formatGHS(trip.price)}
              </p>
              <p className="text-[11px] text-white/55">per person</p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-white/90 transition-transform duration-300 group-hover:translate-x-0.5">
              {bookable ? "Explore" : "View"}
              <ArrowRight size={13} />
            </span>
          </div>
        </div>
      </div>
    </motion.a>
  );
}

function FeaturedGrid({ trips }: { trips: Trip[] }) {
  if (trips.length === 1) {
    return (
      <div className="mx-auto max-w-3xl">
        <FeaturedExpedition
          trip={trips[0]}
          priority
          size="feature"
          className="aspect-[16/10] sm:aspect-[16/9]"
        />
      </div>
    );
  }

  if (trips.length === 2) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {trips.map((t, i) => (
          <FeaturedExpedition
            key={t.id}
            trip={t}
            priority={i === 0}
            index={i}
            size="tile"
            className="aspect-[3/4] sm:aspect-[5/6]"
          />
        ))}
      </div>
    );
  }

  // 3 — mobile/tablet: 2-col grid; desktop: bento
  const [hero, second, third] = trips;

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-12 lg:grid-rows-2 lg:min-h-[36rem]">
      <FeaturedExpedition
        trip={hero}
        priority
        size="feature"
        className="col-span-2 aspect-[16/10] sm:aspect-[16/9] lg:col-span-7 lg:row-span-2 lg:aspect-auto lg:h-full"
      />
      <FeaturedExpedition
        trip={second}
        priority
        index={1}
        size="tile"
        className="aspect-[3/4] sm:aspect-[4/5] lg:col-span-5 lg:aspect-auto lg:h-full"
      />
      <FeaturedExpedition
        trip={third}
        index={2}
        size="tile"
        className="aspect-[3/4] sm:aspect-[4/5] lg:col-span-5 lg:aspect-auto lg:h-full"
      />
    </div>
  );
}

const FeaturedTrips = () => {
  const [featured, setFeatured] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await listPublicTrips({ limit: 6, includeCompleted: true });
        if (cancelled) return;
        const trips = res.data?.trips ?? [];
        const sorted = [...trips].sort((a, b) => {
          const aLive = isTripBookable(a) ? 0 : 1;
          const bLive = isTripBookable(b) ? 0 : 1;
          if (aLive !== bLive) return aLive - bLive;
          return (
            new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
          );
        });
        setFeatured(sorted.slice(0, 3));
      } catch {
        if (!cancelled) setFeatured([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-28">
      <FadeInUp>
        <div className="mb-6 flex items-end justify-between gap-4 sm:mb-10 sm:gap-6">
          <div className="min-w-0">
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
              Featured expeditions
            </span>
            <h2 className="mt-2 font-display text-[1.7rem] font-bold tracking-tight text-text sm:mt-3 sm:text-4xl lg:text-5xl">
              Where travellers are heading
            </h2>
          </div>
          <Link
            href="/expeditions"
            className="mb-0.5 inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary-dark"
          >
            See all <ArrowRight size={14} />
          </Link>
        </div>
      </FadeInUp>

      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-12 lg:grid-rows-2 lg:min-h-[34rem]">
          <div className="col-span-2 aspect-[16/10] animate-pulse bg-bg-secondary sm:aspect-[16/9] lg:col-span-7 lg:row-span-2 lg:aspect-auto" />
          <div className="aspect-[3/4] animate-pulse bg-bg-secondary lg:col-span-5 lg:aspect-auto" />
          <div className="aspect-[3/4] animate-pulse bg-bg-secondary lg:col-span-5 lg:aspect-auto" />
        </div>
      ) : featured.length === 0 ? (
        <FadeInUp>
          <div className="relative aspect-[16/10] overflow-hidden bg-bg-secondary sm:aspect-[21/9]">
            <img
              src="/images/beautiful-nature.jpg"
              alt=""
              className="absolute inset-0 h-full w-full scale-110 object-cover blur-md"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/80">
                Coming soon
              </span>
              <h3 className="mt-2 font-display text-2xl font-bold text-white sm:text-4xl">
                The trail is quiet — for now
              </h3>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-white/75">
                When expeditions go live, they&apos;ll appear here.
              </p>
            </div>
          </div>
        </FadeInUp>
      ) : (
        <FeaturedGrid trips={featured} />
      )}
    </section>
  );
};

export default FeaturedTrips;

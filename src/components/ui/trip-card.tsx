"use client"

import Link from "next/link";
import { Heart, MapPin, Star, Users, Zap } from "lucide-react";
import { motion } from "framer-motion";
import type { Trip } from "@/lib/mockTrips";
import { formatGHS, formatDateRange, tripTypeLabel } from "@/lib/format";

import { cn } from "@/lib/utils";

export default function TripCard({
  trip,
  priority,
}: {
  trip: Trip;
  priority?: boolean;
}) {
  const urgent = trip.spotsLeft <= 5;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-surface bg-gradient-card transition-colors hover:border-border-strong"
    >
      <Link
        href="/traveller/trips/$id"
        // params={{ id: trip.id }}
        className="relative block aspect-[4/3] overflow-hidden"
      >
        <img
          src={trip.coverImage}
          alt={trip.title}
          loading={priority ? "eager" : "lazy"}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/30 to-transparent" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-bg/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary backdrop-blur-md">
            {tripTypeLabel[trip.type]}
          </span>
          {trip.bookingMode === "instant" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-gold-dim px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-gold backdrop-blur-md">
              <Zap size={10} /> Instant
            </span>
          )}
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
          }}
          aria-label="Save trip"
          className={cn(
            "absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur-md transition-colors",

            "border-coral/60 bg-coral/20 text-coral",
            "border-white/15 bg-bg/60 text-text hover:border-border-strong",
          )}
        >
          <Heart size={15} fill={"none"} />
        </button>

        <div className="absolute inset-x-3 bottom-3">
          <div className="flex items-end justify-between gap-2">
            <h3 className="line-clamp-2 font-display text-lg font-bold leading-tight text-text drop-shadow-md">
              {trip.title}
            </h3>
          </div>
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center gap-1.5 text-xs text-text-secondary">
          <MapPin size={12} className="text-primary" />
          <span className="truncate">{trip.destination}</span>
          <span className="text-text-tertiary">·</span>
          <span className="truncate">
            {formatDateRange(trip.startDate, trip.endDate)}
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="inline-flex items-center gap-1 text-gold">
            <Star size={12} fill="currentColor" />
            <span className="font-semibold text-text">
              {trip.rating.toFixed(1)}
            </span>
            <span className="text-text-tertiary">({trip.reviewCount})</span>
          </span>
          <span className="inline-flex items-center gap-1 text-text-secondary">
            <Users size={12} />
            <span className={cn(urgent && "text-coral font-semibold")}>
              {trip.spotsLeft} left
            </span>
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-border-subtle pt-3">
          <div className="flex items-center gap-2">
            <img
              src={trip.organiserAvatar}
              alt=""
              className="h-6 w-6 rounded-full bg-surface-raised"
            />
            <span className="text-xs text-text-secondary truncate max-w-[100px]">
              {trip.organiserName}
            </span>
          </div>
          <div className="text-right">
            <div className="font-display text-base font-bold text-text">
              {formatGHS(trip.priceGhs)}
            </div>
            <div className="text-[10px] text-text-tertiary -mt-0.5">
              per person
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

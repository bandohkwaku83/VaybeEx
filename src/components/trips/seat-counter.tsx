"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { getSpotsLeft } from "@/lib/trip-capacity";
import type { Trip } from "@/lib/types";

interface SeatCounterProps {
  trip: Trip;
  live?: boolean;
  className?: string;
}

export function SeatCounter({ trip, live = false, className }: SeatCounterProps) {
  const initial = getSpotsLeft(trip);
  const [spots, setSpots] = useState<number | null>(initial);

  useEffect(() => {
    setSpots(getSpotsLeft(trip));
  }, [trip]);

  useEffect(() => {
    if (!live || spots == null) return;
    const interval = setInterval(() => {
      setSpots((prev) => {
        if (prev == null || prev <= 0) return prev;
        return Math.random() > 0.7 ? prev - 1 : prev;
      });
    }, 8000);
    return () => clearInterval(interval);
  }, [live, spots == null]);

  const isUnlimited = spots == null;
  const isFull = spots === 0;
  const isLimited = spots != null && spots > 0 && spots <= 3;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium",
        isFull && "bg-red-50 text-red-700",
        isLimited && "bg-amber-50 text-amber-800",
        !isFull && !isLimited && "bg-emerald-50 text-emerald-700",
        className
      )}
    >
      <Users className="h-3.5 w-3.5" />
      <AnimatePresence mode="popLayout">
        <motion.span
          key={spots ?? "open"}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.2 }}
        >
          {isUnlimited
            ? "Open spots"
            : isFull
              ? "Fully booked"
              : `${spots} spot${spots === 1 ? "" : "s"} left`}
        </motion.span>
      </AnimatePresence>
      {live && !isFull && !isUnlimited && (
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
      )}
    </div>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, MapPin, Star, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SeatCounter } from "./seat-counter";
import { formatCurrency, formatDateRange, cn } from "@/lib/utils";
import { getOrganizerById } from "@/lib/mock-data";
import type { Trip } from "@/lib/types";

interface TripCardProps {
  trip: Trip;
  wishlisted?: boolean;
  onToggleWishlist?: (id: string) => void;
  index?: number;
}

export function TripCard({ trip, wishlisted, onToggleWishlist, index = 0 }: TripCardProps) {
  const organizer = getOrganizerById(trip.organizerId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Card className="group overflow-hidden hover:shadow-lg hover:border-teal-200/60 transition-all duration-300">
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image
            src={trip.image}
            alt={trip.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          {onToggleWishlist && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 right-3 h-9 w-9 rounded-full bg-white/90 hover:bg-white shadow-sm"
              onClick={(e) => {
                e.preventDefault();
                onToggleWishlist(trip.id);
              }}
            >
              <Heart className={cn("h-4 w-4", wishlisted ? "fill-red-500 text-red-500" : "text-stone-600")} />
            </Button>
          )}
          <div className="absolute bottom-3 left-3">
            <SeatCounter trip={trip} />
          </div>
        </div>
        <CardContent className="p-4">
          <Link href={`/trips/${trip.id}`}>
            <h3 className="font-semibold text-stone-900 group-hover:text-teal-700 transition-colors line-clamp-1">
              {trip.title}
            </h3>
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-stone-500">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {trip.destination}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formatDateRange(trip.startDate, trip.endDate)}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div>
              <span className="text-lg font-bold text-stone-900">{formatCurrency(trip.price)}</span>
              <span className="text-sm text-stone-400"> / person</span>
            </div>
            {trip.rating > 0 && (
              <div className="flex items-center gap-1 text-sm">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="font-medium text-stone-700">{trip.rating}</span>
                <span className="text-stone-400">({trip.reviewCount})</span>
              </div>
            )}
          </div>
          {organizer && (
            <p className="mt-2 text-xs text-stone-400">by {organizer.name}</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

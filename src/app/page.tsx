"use client";

import { useMemo, useState } from "react";
import { HeroCarousel } from "@/components/home/hero-carousel";
import { StatsBar } from "@/components/home/stats-bar";
import { FeaturesGrid } from "@/components/home/features-grid";
import { CtaBanner } from "@/components/home/cta-banner";
import { Testimonials } from "@/components/home/testimonials";
import { NewsletterSection } from "@/components/home/newsletter-section";
import { Button } from "@/components/ui/button";
import { TripCard } from "@/components/trips/trip-card";
import { TripFiltersPanel } from "@/components/trips/trip-filters";
import { useAuth } from "@/hooks/use-auth";
import { useWishlist } from "@/hooks/use-wishlist";
import { trips, getAvailabilityStatus } from "@/lib/mock-data";
import type { TripFilters } from "@/lib/types";

const defaultFilters: TripFilters = {
  destination: "",
  category: "all",
  dateFrom: "",
  dateTo: "",
  priceMin: 0,
  priceMax: 3000,
  availability: "all",
};

export default function HomePage() {
  const [filters, setFilters] = useState<TripFilters>(defaultFilters);
  const { requireAuth } = useAuth();
  const { toggle, isWishlisted } = useWishlist();

  const handleToggleWishlist = (tripId: string) => {
    requireAuth(() => toggle(tripId));
  };

  const filteredTrips = useMemo(() => {
    return trips.filter((trip) => {
      if (trip.status !== "live" && trip.status !== "scheduled") return false;
      if (filters.destination && trip.destination !== filters.destination) return false;
      if (filters.category !== "all" && trip.category !== filters.category) return false;
      if (filters.dateFrom && trip.endDate < filters.dateFrom) return false;
      if (filters.dateTo && trip.startDate > filters.dateTo) return false;
      if (trip.price < filters.priceMin || trip.price > filters.priceMax) return false;
      if (filters.availability !== "all") {
        const status = getAvailabilityStatus(trip);
        if (status !== filters.availability) return false;
      }
      return true;
    });
  }, [filters]);

  const applyFilters = (partial: Partial<TripFilters>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  };

  return (
    <div>
      <HeroCarousel onSearch={applyFilters} />
      <StatsBar />

      <FeaturesGrid />

      <CtaBanner />

      <section id="trips" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 text-center sm:text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#3d8b8b]">
            Tours
          </p>
          <h2 className="mt-2 font-serif text-3xl font-bold text-stone-900 sm:text-4xl">
            Upcoming Trips
          </h2>
          <p className="mt-2 text-stone-500">
            Filter by destination, category, dates, price, and availability
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <TripFiltersPanel
              filters={filters}
              onChange={setFilters}
              resultCount={filteredTrips.length}
            />
          </aside>

          <div>
            {filteredTrips.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center">
                <p className="text-stone-500">
                  No trips match your filters. Try adjusting your criteria.
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setFilters(defaultFilters)}
                >
                  Reset filters
                </Button>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filteredTrips.map((trip, i) => (
                  <TripCard
                    key={trip.id}
                    trip={trip}
                    index={i}
                    wishlisted={isWishlisted(trip.id)}
                    onToggleWishlist={handleToggleWishlist}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <Testimonials />

      <NewsletterSection />
    </div>
  );
}

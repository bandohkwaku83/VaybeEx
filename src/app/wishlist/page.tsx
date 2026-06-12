"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { RequireAuth } from "@/components/auth/require-auth";
import { TripCard } from "@/components/trips/trip-card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useWishlist } from "@/hooks/use-wishlist";
import { trips } from "@/lib/mock-data";

function WishlistContent() {
  const { requireAuth } = useAuth();
  const { wishlist, toggle, isWishlisted } = useWishlist();
  const savedTrips = trips.filter((t) => wishlist.includes(t.id));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
          <Heart className="h-6 w-6 text-red-500" />
          Saved Trips
        </h1>
        <p className="text-stone-500 mt-1">Trips you&apos;ve wishlisted for later</p>
      </div>

      {savedTrips.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-16 text-center">
          <Heart className="h-12 w-12 text-stone-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-stone-900">No saved trips yet</h2>
          <p className="text-stone-500 mt-2 mb-6">Tap the heart icon on any trip to save it here.</p>
          <Button asChild>
            <Link href="/">Explore Trips</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {savedTrips.map((trip, i) => (
            <TripCard
              key={trip.id}
              trip={trip}
              index={i}
              wishlisted={isWishlisted(trip.id)}
              onToggleWishlist={(id) => requireAuth(() => toggle(id))}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function WishlistPage() {
  return (
    <RequireAuth>
      <WishlistContent />
    </RequireAuth>
  );
}

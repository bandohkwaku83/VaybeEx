"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Heart, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Suspense } from "react";
import { FadeInUp } from "@/components/ui/fadeInUp";
import { TripCard } from "@/components/trips/trip-card";
import { useAuth } from "@/hooks/use-auth";
import { useWishlist } from "@/hooks/use-wishlist";
import { listFavoriteTrips } from "@/lib/api/public-trips";
import type { Trip } from "@/lib/types";

function WishlistContent() {
  const { requireTravelerAuth, user, isLoading: authLoading } = useAuth();
  const { toggle, isWishlisted, ready, isTraveler } = useWishlist();
  const [savedTrips, setSavedTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const returnPath = searchParams.toString()
    ? `${pathname}?${searchParams.toString()}`
    : pathname;

  useEffect(() => {
    if (authLoading) return;
    if (!isTraveler) {
      toast.info("Sign in as a traveler to view your wishlist");
      router.replace(`/login?redirect=${encodeURIComponent(returnPath)}`);
    }
  }, [authLoading, isTraveler, returnPath, router]);

  useEffect(() => {
    if (!ready || !isTraveler) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await listFavoriteTrips({ limit: 50 });
        if (!cancelled) setSavedTrips(res.data?.trips ?? []);
      } catch {
        if (!cancelled) setSavedTrips([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ready, isTraveler, user?.email]);

  const handleToggle = (id: string) => {
    requireTravelerAuth(() => {
      void (async () => {
        try {
          await toggle(id);
          setSavedTrips((prev) => prev.filter((t) => t.id !== id));
          toast.success("Removed from wishlist");
        } catch {
          /* toast already shown in hook */
        }
      })();
    });
  };

  if (authLoading || !isTraveler) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto max-w-7xl px-4 pb-20 pt-24 sm:px-6 sm:pb-28 sm:pt-28 lg:px-8">
        <FadeInUp>
          <header className="mb-10 sm:mb-12">
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
              Wishlist
            </span>
            <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                <h1 className="flex flex-wrap items-center gap-3 font-display text-4xl font-bold text-text sm:text-5xl">
                  Saved Trips
                  <span className="inline-flex h-8 min-w-8 items-center justify-center bg-primary-dim px-2.5 font-sans text-sm font-bold text-primary">
                    {loading ? "…" : savedTrips.length}
                  </span>
                </h1>
                <p className="mt-3 text-base text-text-secondary sm:text-lg">
                  Trips you&apos;ve wishlisted for later
                </p>
              </div>
              <Link
                href="/expeditions"
                className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary-dark"
              >
                Browse expeditions <ArrowRight size={14} />
              </Link>
            </div>
          </header>
        </FadeInUp>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="aspect-[4/5] animate-pulse bg-bg-secondary"
              />
            ))}
          </div>
        ) : savedTrips.length === 0 ? (
          <FadeInUp delay={0.05}>
            <div className="relative overflow-hidden">
              <div className="relative min-h-[20rem] sm:min-h-[22rem]">
                <img
                  src="/images/beautiful-nature.jpg"
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg)] via-[var(--bg)]/92 to-[var(--bg)]/55" />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-transparent to-[var(--bg)]/40" />

                <div className="relative flex min-h-[20rem] max-w-lg flex-col justify-center px-1 py-10 sm:min-h-[22rem] sm:px-2 sm:py-12">
                  <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
                    <Heart size={12} /> Nothing saved
                  </span>
                  <h2 className="mt-3 font-display text-3xl font-bold text-text sm:text-4xl">
                    No saved trips yet
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-text-secondary sm:text-base">
                    Tap the heart on any expedition to keep it here for later.
                  </p>
                  <Link
                    href="/expeditions"
                    className="mt-7 inline-flex w-fit items-center gap-1.5 bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-dark"
                  >
                    Explore expeditions <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </FadeInUp>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {savedTrips.map((trip, i) => (
              <FadeInUp key={trip.id} delay={0.04 * Math.min(i, 8)}>
                <TripCard
                  trip={trip}
                  index={i}
                  wishlisted={isWishlisted(trip.id, true)}
                  onToggleWishlist={handleToggle}
                />
              </FadeInUp>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function WishlistPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
        </div>
      }
    >
      <WishlistContent />
    </Suspense>
  );
}

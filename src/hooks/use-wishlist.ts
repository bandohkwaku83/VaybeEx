"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { getTravelerToken } from "@/lib/api/auth-token";
import { ApiError } from "@/lib/api/client";
import {
  addTripFavorite,
  listFavoriteTrips,
  removeTripFavorite,
} from "@/lib/api/public-trips";
import { useAuth } from "@/hooks/use-auth";

const STORAGE_KEY = "trripx-wishlist";

function readLocalWishlist(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === "string")
      : [];
  } catch {
    return [];
  }
}

function writeLocalWishlist(ids: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

function normalizeTripId(id: unknown): string {
  if (id == null) return "";
  return String(id);
}

/**
 * Traveler favorites (wishlist).
 * Uses POST/DELETE /api/trips/:id/favorite and GET /api/trips/favorites.
 * Organizer sessions are ignored — favorites are traveler-only.
 */
export function useWishlist() {
  const { user, isLoading: authLoading } = useAuth();
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  const isTraveler = user?.role === "traveler";

  useEffect(() => {
    if (authLoading) return;

    let cancelled = false;

    async function hydrate() {
      // Favorites API is traveler-only — clear hearts for organizers / guests.
      if (!isTraveler || !getTravelerToken()) {
        if (!cancelled) {
          setWishlist([]);
          writeLocalWishlist([]);
          setReady(true);
        }
        return;
      }

      // Show last known favorites while refetching.
      const local = readLocalWishlist();
      if (!cancelled && local.length) setWishlist(local);

      try {
        const res = await listFavoriteTrips({ limit: 100 });
        if (cancelled) return;
        const ids = (res.data?.trips ?? [])
          .map((t) => normalizeTripId(t.id))
          .filter(Boolean);
        setWishlist(ids);
        writeLocalWishlist(ids);
      } catch {
        /* keep local fallback when offline */
      } finally {
        if (!cancelled) setReady(true);
      }
    }

    void hydrate();
    return () => {
      cancelled = true;
    };
  }, [authLoading, isTraveler, user?.email]);

  const toggle = useCallback(
    async (tripId: string) => {
      const id = normalizeTripId(tripId);
      if (!id) return;

      if (!isTraveler || !getTravelerToken()) {
        throw new ApiError(
          "Sign in as a traveler to save trips.",
          401
        );
      }

      const currentlySaved = wishlist.includes(id);

      // Optimistic update
      setWishlist((prev) => {
        const next = currentlySaved
          ? prev.filter((x) => x !== id)
          : [...prev, id];
        writeLocalWishlist(next);
        return next;
      });

      try {
        if (currentlySaved) {
          await removeTripFavorite(id);
        } else {
          await addTripFavorite(id);
        }
      } catch (err) {
        // Revert on failure
        setWishlist((prev) => {
          const next = currentlySaved
            ? [...prev, id]
            : prev.filter((x) => x !== id);
          writeLocalWishlist(next);
          return next;
        });
        toast.error(
          err instanceof ApiError
            ? err.message
            : "Could not update saved trips. Try again."
        );
        throw err;
      }
    },
    [wishlist, isTraveler]
  );

  const isWishlisted = useCallback(
    (tripId: string, fallbackFavorited?: boolean) => {
      const id = normalizeTripId(tripId);
      if (!id) return false;
      if (wishlist.includes(id)) return true;
      // Use API isFavorited before hydrate finishes for travelers
      if (isTraveler && fallbackFavorited === true) return true;
      return false;
    },
    [wishlist, isTraveler]
  );

  return { wishlist, toggle, isWishlisted, ready, isTraveler };
}

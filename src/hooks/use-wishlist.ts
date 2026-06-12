"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "trripx-wishlist";

export function useWishlist() {
  const [wishlist, setWishlist] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setWishlist(JSON.parse(stored));
    } catch {
      /* ignore */
    }
  }, []);

  const toggle = useCallback((tripId: string) => {
    setWishlist((prev) => {
      const next = prev.includes(tripId)
        ? prev.filter((id) => id !== tripId)
        : [...prev, tripId];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const isWishlisted = useCallback(
    (tripId: string) => wishlist.includes(tripId),
    [wishlist]
  );

  return { wishlist, toggle, isWishlisted };
}

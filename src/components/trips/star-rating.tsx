"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

const sizes = { sm: "h-3.5 w-3.5", md: "h-5 w-5", lg: "h-7 w-7" };

export function StarRating({ rating, max = 5, size = "md", interactive, onChange }: StarRatingProps) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => {
        const filled = i < Math.floor(rating);
        const half = !filled && i < rating;
        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => onChange?.(i + 1)}
            className={cn(interactive && "cursor-pointer hover:scale-110 transition-transform")}
          >
            <Star
              className={cn(
                sizes[size],
                filled || half ? "fill-amber-400 text-amber-400" : "text-stone-300"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

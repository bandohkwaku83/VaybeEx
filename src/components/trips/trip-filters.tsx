"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { destinations } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import type { TripCategory, TripFilters } from "@/lib/types";

const categories: { value: TripCategory | "all"; label: string }[] = [
  { value: "all", label: "All Categories" },
  { value: "adventure", label: "Adventure" },
  { value: "beach", label: "Beach" },
  { value: "cultural", label: "Cultural" },
  { value: "wildlife", label: "Wildlife" },
  { value: "city", label: "City" },
  { value: "wellness", label: "Wellness" },
];

interface TripFiltersPanelProps {
  filters: TripFilters;
  onChange: (filters: TripFilters) => void;
  resultCount: number;
}

export function TripFiltersPanel({ filters, onChange, resultCount }: TripFiltersPanelProps) {
  const update = (partial: Partial<TripFilters>) => onChange({ ...filters, ...partial });

  const hasActiveFilters =
    filters.destination ||
    filters.category !== "all" ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.priceMin > 0 ||
    filters.priceMax < 3000 ||
    filters.availability !== "all";

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-teal-600" />
          <h3 className="font-semibold text-stone-900">Filters</h3>
        </div>
        <span className="text-sm text-stone-500">{resultCount} trips</span>
      </div>

      <div className="space-y-5">
        <div>
          <Label className="mb-2 block">Destination</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <Select
              value={filters.destination || "all"}
              onValueChange={(v) => update({ destination: v === "all" ? "" : v })}
            >
              <SelectTrigger className="pl-9">
                <SelectValue placeholder="Any destination" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any destination</SelectItem>
                {destinations.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label className="mb-2 block">Category</Label>
          <Select
            value={filters.category}
            onValueChange={(v) => update({ category: v as TripCategory | "all" })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="mb-2 block">From</Label>
            <Input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => update({ dateFrom: e.target.value })}
            />
          </div>
          <div>
            <Label className="mb-2 block">To</Label>
            <Input
              type="date"
              value={filters.dateTo}
              onChange={(e) => update({ dateTo: e.target.value })}
            />
          </div>
        </div>

        <div>
          <Label className="mb-3 block">
            Price range: {formatCurrency(filters.priceMin)} – {formatCurrency(filters.priceMax)}
          </Label>
          <Slider
            min={0}
            max={3000}
            step={50}
            value={[filters.priceMin, filters.priceMax]}
            onValueChange={([min, max]) => update({ priceMin: min, priceMax: max })}
          />
        </div>

        <div>
          <Label className="mb-2 block">Availability</Label>
          <Select
            value={filters.availability}
            onValueChange={(v) => update({ availability: v as TripFilters["availability"] })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All trips</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="limited">Limited spots (≤3)</SelectItem>
              <SelectItem value="full">Full (waitlist)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() =>
              onChange({
                destination: "",
                category: "all",
                dateFrom: "",
                dateTo: "",
                priceMin: 0,
                priceMax: 3000,
                availability: "all",
              })
            }
          >
            <X className="h-3.5 w-3.5" />
            Clear filters
          </Button>
        )}
      </div>
    </div>
  );
}

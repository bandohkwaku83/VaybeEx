/** Selectable trip specialty options shown during organizer profile setup. */
export const TRIP_SPECIALTY_OPTIONS: { value: string; label: string }[] = [
  { value: "adventure", label: "Adventure" },
  { value: "beach", label: "Beach & coast" },
  { value: "cultural", label: "Cultural tours" },
  { value: "wildlife", label: "Wildlife & safaris" },
  { value: "city", label: "City experiences" },
  { value: "wellness", label: "Wellness & retreats" },
  { value: "hiking", label: "Hiking & trekking" },
  { value: "camping", label: "Camping" },
  { value: "road_trip", label: "Road trips" },
  { value: "weekend_getaway", label: "Weekend getaways" },
  { value: "day_trips", label: "Day trips" },
  { value: "food_and_culinary", label: "Food & culinary" },
  { value: "festivals", label: "Festivals & events" },
  { value: "music_and_arts", label: "Music & arts" },
  { value: "photography", label: "Photography trips" },
  { value: "eco_tourism", label: "Eco tourism" },
  { value: "water_sports", label: "Water sports" },
  { value: "island_hopping", label: "Island hopping" },
  { value: "cross_border", label: "Cross-border trips" },
  { value: "group_retreats", label: "Group retreats" },
  { value: "family_friendly", label: "Family-friendly" },
  { value: "luxury", label: "Luxury trips" },
  { value: "budget_friendly", label: "Budget-friendly" },
];

export const tripSpecialtyLabel = (value: string): string =>
  TRIP_SPECIALTY_OPTIONS.find((o) => o.value === value)?.label ?? value;

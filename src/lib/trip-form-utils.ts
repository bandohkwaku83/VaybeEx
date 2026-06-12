import type { RefundPolicy, Trip, TripCategory, TripStatus } from "./types";

export type { RefundPolicy };
export type Difficulty = "easy" | "moderate" | "challenging";

export interface TripForm {
  title: string;
  destination: string;
  category: TripCategory | "";
  startDate: string;
  endDate: string;
  description: string;
  highlights: string;
  included: string;
  excluded: string;
  minCapacity: string;
  maxCapacity: string;
  departurePoint: string;
  departureTime: string;
  returnTime: string;
  meetingPoint: string;
  difficulty: Difficulty;
  ageMin: string;
  ageMax: string;
  price: string;
  earlyBirdPrice: string;
  earlyBirdDeadline: string;
  depositAmount: string;
  depositRules: string;
  refundPolicy: RefundPolicy;
  refundDeadlineDays: string;
  refundPercentage: string;
  coverImage: string | null;
  flyer: string | null;
  gallery: string[];
  contactPhone: string;
  contactEmail: string;
  tags: string;
  visibility: string;
  status: TripStatus;
}

export const INITIAL_TRIP_FORM: TripForm = {
  title: "",
  destination: "",
  category: "",
  startDate: "",
  endDate: "",
  description: "",
  highlights: "",
  included: "",
  excluded: "",
  minCapacity: "",
  maxCapacity: "",
  departurePoint: "",
  departureTime: "",
  returnTime: "",
  meetingPoint: "",
  difficulty: "moderate",
  ageMin: "",
  ageMax: "",
  price: "",
  earlyBirdPrice: "",
  earlyBirdDeadline: "",
  depositAmount: "",
  depositRules: "",
  refundPolicy: "partial",
  refundDeadlineDays: "14",
  refundPercentage: "50",
  coverImage: null,
  flyer: null,
  gallery: [],
  contactPhone: "",
  contactEmail: "",
  tags: "",
  visibility: "public",
  status: "draft",
};

export const TRIP_CATEGORIES: TripCategory[] = [
  "adventure",
  "beach",
  "cultural",
  "wildlife",
  "city",
  "wellness",
];

export const TRIP_STATUS_OPTIONS: { value: TripStatus; label: string }[] = [
  { value: "draft", label: "Draft — only you can see" },
  { value: "scheduled", label: "Scheduled — publish on start date" },
  { value: "live", label: "Live — visible to all travelers" },
  { value: "completed", label: "Completed — trip has finished" },
  { value: "cancelled", label: "Cancelled — no longer available" },
];

export const STATUS_MESSAGES: Record<TripStatus, string> = {
  draft: "Trip saved as draft",
  scheduled: "Trip scheduled for publication",
  live: "Trip published live!",
  completed: "Trip marked completed",
  cancelled: "Trip cancelled",
};

function parseLines(text: string) {
  return text
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function tripToForm(trip: Trip): TripForm {
  return {
    ...INITIAL_TRIP_FORM,
    title: trip.title,
    destination: trip.destination,
    category: trip.category,
    startDate: trip.startDate,
    endDate: trip.endDate,
    description: trip.description,
    included: trip.included.join("\n"),
    excluded: trip.excluded.join("\n"),
    minCapacity: String(trip.minCapacity),
    maxCapacity: String(trip.capacity),
    price: String(trip.price),
    depositAmount: String(trip.depositAmount),
    refundPolicy: trip.refundPolicy,
    refundDeadlineDays: String(trip.refundDeadlineDays),
    refundPercentage: trip.refundPercentage != null ? String(trip.refundPercentage) : "",
    coverImage: trip.image,
    gallery: trip.images.length > 1 ? trip.images.slice(1) : [],
    status: trip.status,
  };
}

export function tripToAddOns(trip: Trip) {
  return trip.addOns.map((a) => ({ name: a.name, price: String(a.price) }));
}

export function buildTripUpdates(
  form: TripForm,
  addOns: { name: string; price: string }[],
  existing?: Trip,
  status?: TripStatus
): Partial<Trip> {
  const cover = form.coverImage ?? existing?.image ?? "";
  const extraImages = form.gallery.filter((img) => img !== cover);
  const images = cover
    ? [cover, ...extraImages]
    : extraImages.length > 0
      ? extraImages
      : (existing?.images ?? []);

  return {
    title: form.title,
    destination: form.destination,
    category: form.category as TripCategory,
    startDate: form.startDate,
    endDate: form.endDate,
    description: form.description,
    included: parseLines(form.included),
    excluded: parseLines(form.excluded),
    minCapacity: Number(form.minCapacity) || existing?.minCapacity || 1,
    capacity: Number(form.maxCapacity) || existing?.capacity || 10,
    price: Number(form.price) || 0,
    depositAmount: Number(form.depositAmount) || 0,
    refundPolicy: form.refundPolicy,
    refundDeadlineDays: Number(form.refundDeadlineDays) || existing?.refundDeadlineDays || 14,
    refundPercentage:
      form.refundPolicy === "partial"
        ? Number(form.refundPercentage) || existing?.refundPercentage || 50
        : undefined,
    image: cover || existing?.image || "",
    images: images.length > 0 ? images : cover ? [cover] : [],
    status: status ?? form.status,
    addOns: addOns
      .filter((a) => a.name.trim())
      .map((a, i) => ({
        id: existing?.addOns[i]?.id ?? `addon-${Date.now()}-${i}`,
        name: a.name.trim(),
        price: Number(a.price) || 0,
      })),
  };
}

export function buildNewTrip(
  form: TripForm,
  addOns: { name: string; price: string }[],
  status: TripStatus,
  organizerId: string
): Omit<Trip, "id"> {
  const updates = buildTripUpdates(form, addOns, undefined, status);
  return {
    ...updates,
    organizerId,
    booked: 0,
    rating: 0,
    reviewCount: 0,
    reviews: [],
    views: 0,
    conversions: 0,
    itinerary: [],
    title: updates.title ?? "",
    destination: updates.destination ?? "",
    category: updates.category ?? "adventure",
    image: updates.image ?? "",
    images: updates.images ?? [],
    startDate: updates.startDate ?? "",
    endDate: updates.endDate ?? "",
    price: updates.price ?? 0,
    depositAmount: updates.depositAmount ?? 0,
    capacity: updates.capacity ?? 10,
    minCapacity: updates.minCapacity ?? 1,
    description: updates.description ?? "",
    included: updates.included ?? [],
    excluded: updates.excluded ?? [],
    status: updates.status ?? status,
    addOns: updates.addOns ?? [],
    refundPolicy: updates.refundPolicy ?? "partial",
    refundDeadlineDays: updates.refundDeadlineDays ?? 14,
    refundPercentage: updates.refundPercentage,
  };
}

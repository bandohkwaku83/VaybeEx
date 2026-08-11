import type { ItineraryDay, RefundPolicy, Trip, TripCategory, TripStatus } from "./types";
import { tripPathSlug } from "./tenant-host";

export type { RefundPolicy };
export type Difficulty = "easy" | "moderate" | "challenging";

export interface TripFormItineraryDay {
  day: number;
  title: string;
  activities: string;
}

export interface TripForm {
  title: string;
  /** Editable public URL path (trip slug). */
  slug: string;
  destination: string;
  /** Trip category value from /organizer/trips/options (or legacy TripCategory). */
  category: string;
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
  price: string;
  offerCouplePrice: boolean;
  couplePrice: string;
  offerGroupPrice: boolean;
  groupPrice: string;
  groupSize: string;
  depositAmount: string;
  refundPolicy: RefundPolicy;
  refundDeadlineDays: string;
  refundPercentage: string;
  coverImage: string | null;
  gallery: string[];
  itinerary: TripFormItineraryDay[];
  status: TripStatus;
}

export const INITIAL_TRIP_FORM: TripForm = {
  title: "",
  slug: "",
  destination: "",
  category: "",
  startDate: "",
  endDate: "",
  description: "",
  highlights: "",
  included: "",
  excluded: "",
  minCapacity: "1",
  maxCapacity: "",
  departurePoint: "",
  departureTime: "",
  returnTime: "",
  meetingPoint: "",
  difficulty: "moderate",
  price: "",
  offerCouplePrice: false,
  couplePrice: "",
  offerGroupPrice: false,
  groupPrice: "",
  groupSize: "5",
  depositAmount: "",
  refundPolicy: "partial",
  refundDeadlineDays: "14",
  refundPercentage: "50",
  coverImage: null,
  gallery: [],
  itinerary: [{ day: 1, title: "", activities: "" }],
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
  { value: "scheduled", label: "Scheduled — publish on a chosen date" },
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

function formItineraryToTrip(days: TripFormItineraryDay[]): ItineraryDay[] {
  return days
    .map((d, i) => ({
      day: d.day || i + 1,
      title: d.title.trim() || `Day ${i + 1}`,
      activities: parseLines(d.activities),
    }))
    .filter((d) => d.title || d.activities.length > 0);
}

export function tripToForm(trip: Trip): TripForm {
  return {
    ...INITIAL_TRIP_FORM,
    title: trip.title,
    slug: trip.slug?.trim() || tripPathSlug(trip.title),
    destination: trip.destination,
    category: trip.category,
    startDate: trip.startDate,
    endDate: trip.endDate,
    description: trip.description,
    highlights: (trip.highlights ?? []).join("\n"),
    included: trip.included.join("\n"),
    excluded: trip.excluded.join("\n"),
    minCapacity: String(trip.minCapacity ?? 1),
    maxCapacity:
      trip.isUnlimitedCapacity || trip.capacity == null
        ? ""
        : String(trip.capacity),
    departurePoint: trip.departurePoint ?? "",
    departureTime: trip.departureTime ?? "",
    returnTime: trip.returnTime ?? "",
    meetingPoint: trip.meetingPoint ?? "",
    difficulty: trip.difficulty ?? "moderate",
    price: String(trip.price),
    offerCouplePrice:
      trip.offerCouplePrice ?? (trip.couplePrice != null && trip.couplePrice > 0),
    couplePrice: trip.couplePrice != null ? String(trip.couplePrice) : "",
    offerGroupPrice:
      trip.offerGroupPrice ?? (trip.groupPrice != null && trip.groupPrice > 0),
    groupPrice: trip.groupPrice != null ? String(trip.groupPrice) : "",
    groupSize: trip.groupSize != null ? String(trip.groupSize) : "5",
    depositAmount: String(trip.depositAmount),
    refundPolicy: trip.refundPolicy,
    refundDeadlineDays: String(trip.refundDeadlineDays),
    refundPercentage:
      trip.refundPercentage != null ? String(trip.refundPercentage) : "50",
    coverImage: trip.image,
    gallery: (trip.images.length > 1 ? trip.images.slice(1) : []).slice(0, 6),
    itinerary:
      trip.itinerary.length > 0
        ? trip.itinerary.map((d) => ({
            day: d.day,
            title: d.title,
            activities: d.activities.join("\n"),
          }))
        : [{ day: 1, title: "", activities: "" }],
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
    title: form.title.trim(),
    slug: tripPathSlug(form.slug.trim() || form.title.trim()),
    destination: form.destination.trim(),
    category: (form.category || existing?.category || "adventure") as TripCategory,
    startDate: form.startDate,
    endDate: form.endDate,
    description: form.description.trim(),
    highlights: parseLines(form.highlights),
    included: parseLines(form.included),
    excluded: parseLines(form.excluded),
    itinerary: formItineraryToTrip(form.itinerary),
    difficulty: form.difficulty,
    meetingPoint: form.meetingPoint.trim() || undefined,
    departurePoint: form.departurePoint.trim() || undefined,
    departureTime: form.departureTime || undefined,
    returnTime: form.returnTime || undefined,
    minCapacity: Number(form.minCapacity) || existing?.minCapacity || 1,
    capacity: form.maxCapacity.trim()
      ? Number(form.maxCapacity) || null
      : null,
    isUnlimitedCapacity: !form.maxCapacity.trim(),
    price: Number(form.price) || 0,
    couplePrice:
      form.offerCouplePrice && form.couplePrice.trim()
        ? Number(form.couplePrice) || 0
        : undefined,
    groupPrice:
      form.offerGroupPrice && form.groupPrice.trim()
        ? Number(form.groupPrice) || 0
        : undefined,
    groupSize:
      form.offerGroupPrice && form.groupSize.trim()
        ? Number(form.groupSize) || undefined
        : undefined,
    depositAmount: Number(form.depositAmount) || 0,
    refundPolicy: form.refundPolicy,
    refundDeadlineDays:
      Number(form.refundDeadlineDays) || existing?.refundDeadlineDays || 14,
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
    itinerary: updates.itinerary ?? [],
    highlights: updates.highlights ?? [],
    title: updates.title ?? "",
    slug: updates.slug,
    destination: updates.destination ?? "",
    category: updates.category ?? "adventure",
    image: updates.image ?? "",
    images: updates.images ?? [],
    startDate: updates.startDate ?? "",
    endDate: updates.endDate ?? "",
    price: updates.price ?? 0,
    couplePrice: updates.couplePrice,
    groupPrice: updates.groupPrice,
    groupSize: updates.groupSize,
    depositAmount: updates.depositAmount ?? 0,
    capacity: updates.capacity ?? null,
    isUnlimitedCapacity:
      updates.isUnlimitedCapacity ?? updates.capacity == null,
    minCapacity: updates.minCapacity ?? 1,
    description: updates.description ?? "",
    included: updates.included ?? [],
    excluded: updates.excluded ?? [],
    status: updates.status ?? status,
    addOns: updates.addOns ?? [],
    refundPolicy: updates.refundPolicy ?? "partial",
    refundDeadlineDays: updates.refundDeadlineDays ?? 14,
    refundPercentage: updates.refundPercentage,
    difficulty: updates.difficulty,
    meetingPoint: updates.meetingPoint,
    departurePoint: updates.departurePoint,
    departureTime: updates.departureTime,
    returnTime: updates.returnTime,
  };
}

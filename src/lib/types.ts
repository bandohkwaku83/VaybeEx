export type TripCategory =
  | "adventure"
  | "beach"
  | "cultural"
  | "wildlife"
  | "city"
  | "wellness"
  | "weekend_getaway"
  | "day_trips"
  | "food_and_culinary"
  | "hiking"
  | "camping"
  | "road_trip"
  | (string & {});

export type TripStatus = "draft" | "scheduled" | "live" | "completed" | "cancelled";

export type RefundPolicy = "full" | "partial" | "none";

export type CancellationStatus = "pending" | "processing" | "refunded" | "denied";

export type PaymentMethod =
  | "card"
  | "mtn"
  | "vodafone"
  | "airteltigo"
  | "bank"
  | "installment";

export type VerificationStatus = "pending" | "in_review" | "verified" | "rejected";

export interface Organizer {
  id: string;
  name: string;
  /** Unique public subdomain slug (users.brandSlug), e.g. adventure-ghana. */
  brandSlug?: string;
  avatar: string;
  bio: string;
  verified: boolean;
  verificationStatus: VerificationStatus;
  rating: number;
  reviewCount: number;
  tripCount: number;
  joinedAt: string;
  location: string;
  whatsapp?: string;
  tripSpecialties?: string[];
}

export interface Review {
  id: string;
  author: string;
  avatar: string;
  rating: number;
  comment: string;
  date: string;
}

export interface ItineraryDay {
  day: number;
  title: string;
  activities: string[];
}

export interface TripAnalytics {
  views: number;
  bookClicks: number;
  checkoutStarts: number;
  confirmedBookings: number;
  conversions: number;
  conversionRate: number;
  revenue: number;
  funnel: {
    step: string;
    label: string;
    value: number;
    pct: number;
  }[];
  insight: string | null;
  repeatBookers?: number;
}

export interface Trip {
  id: string;
  title: string;
  /** Public URL path segment; falls back to slugified title when omitted. */
  slug?: string;
  destination: string;
  category: TripCategory;
  image: string;
  images: string[];
  startDate: string;
  endDate: string;
  price: number;
  couplePrice?: number;
  groupPrice?: number;
  /** Number of travelers the group flat rate covers (e.g. 5 or 10). */
  groupSize?: number;
  depositAmount: number;
  /** Max travelers; `null` = unlimited. */
  capacity: number | null;
  booked: number;
  minCapacity: number;
  /** True when max travelers was left empty (unlimited seats). */
  isUnlimitedCapacity?: boolean;
  organizerId: string;
  description: string;
  highlights?: string[];
  included: string[];
  excluded: string[];
  itinerary: ItineraryDay[];
  difficulty?: "easy" | "moderate" | "challenging";
  meetingPoint?: string;
  departurePoint?: string;
  departureTime?: string;
  returnTime?: string;
  status: TripStatus;
  /** From public API; false for completed (and any non-live) trips. Defaults to status === "live". */
  isBookable?: boolean;
  rating: number;
  reviewCount: number;
  reviews: Review[];
  addOns: { id: string; name: string; price: number; perPerson?: boolean }[];
  views: number;
  conversions: number;
  refundPolicy: RefundPolicy;
  refundDeadlineDays: number;
  refundPercentage?: number;
  /** Human-readable refund copy from the API when present. */
  refundPolicySummary?: string;
  /** When the deposit is due (API). */
  depositDue?:
    | "at_booking"
    | "7_days_before"
    | "14_days_before"
    | "30_days_before";
  visibility?: "public" | "private";
  tags?: string[];
  offerCouplePrice?: boolean;
  offerGroupPrice?: boolean;
  /** Remaining seats; `null` when capacity is unlimited. */
  seatsAvailable?: number | null;
  /** Duration in days from the API when present. */
  durationDays?: number;
  /** When a scheduled trip should go live (ISO). */
  scheduledPublishAt?: string;
  analytics?: TripAnalytics;
  /** Present when the traveler is authenticated (favorites API). */
  isFavorited?: boolean;
  /** Organizer summary from public trip payloads. */
  organizerName?: string;
  organizerAvatar?: string;
  organizerBrandSlug?: string;
  organizerVerified?: boolean;
}

export interface Booking {
  id: string;
  tripId: string;
  tripTitle: string;
  destination: string;
  image: string;
  startDate: string;
  endDate: string;
  status: "confirmed" | "pending" | "cancelled" | "waitlisted";
  amount: number;
  amountPaid: number;
  /** Remaining balance after amountPaid (deposit / installments). */
  remainingBalance?: number;
  paymentStatus: "paid" | "partial" | "pending";
  paymentMethod?: PaymentMethod;
  travelers: number;
}

export interface CancellationRequest {
  id: string;
  bookingId: string;
  tripId: string;
  tripTitle: string;
  destination: string;
  startDate: string;
  amountPaid: number;
  refundAmount: number;
  refundEligible: boolean;
  reason?: string;
  status: CancellationStatus;
  requestedAt: string;
  processedAt?: string;
  refundDestination?: string;
  paymentMethod?: string;
  travelerName?: string;
  travelerEmail?: string;
  phone?: string;
  organizerNote?: string;
  /** Present when a Paystack refund attempt failed (often status returns to pending). */
  refundFailureReason?: string;
}

export interface WaitlistEntry {
  id: string;
  tripId: string;
  tripTitle: string;
  position: number;
  joinedAt: string;
}

export interface TripAttendee {
  id: string;
  tripId: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  paymentStatus: "paid" | "partial" | "pending";
  amountPaid: number;
  amountDue: number;
  paymentMethod?: PaymentMethod;
  paidAt?: string;
  travelers: number;
}

export type PayoutAccountType = "mtn" | "vodafone" | "airteltigo";

export interface PayoutAccount {
  id: string;
  type: PayoutAccountType;
  accountName: string;
  momoNumber: string;
  isDefault: boolean;
  createdAt: string;
}

export interface Payout {
  id: string;
  tripId: string;
  tripTitle: string;
  amount: number;
  status: "completed" | "pending" | "processing" | "failed";
  date: string;
  payoutAccountId?: string;
  payoutDestination?: string;
}

export interface TripFilters {
  destination: string;
  category: TripCategory | "all";
  dateFrom: string;
  dateTo: string;
  priceMin: number;
  priceMax: number;
  availability: "all" | "available" | "limited" | "full";
}

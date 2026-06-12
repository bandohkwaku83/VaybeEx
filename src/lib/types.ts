export type TripCategory =
  | "adventure"
  | "beach"
  | "cultural"
  | "wildlife"
  | "city"
  | "wellness";

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
  avatar: string;
  bio: string;
  verified: boolean;
  verificationStatus: VerificationStatus;
  rating: number;
  reviewCount: number;
  tripCount: number;
  joinedAt: string;
  location: string;
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

export interface Trip {
  id: string;
  title: string;
  destination: string;
  category: TripCategory;
  image: string;
  images: string[];
  startDate: string;
  endDate: string;
  price: number;
  depositAmount: number;
  capacity: number;
  booked: number;
  minCapacity: number;
  organizerId: string;
  description: string;
  included: string[];
  excluded: string[];
  itinerary: ItineraryDay[];
  status: TripStatus;
  rating: number;
  reviewCount: number;
  reviews: Review[];
  addOns: { id: string; name: string; price: number }[];
  views: number;
  conversions: number;
  refundPolicy: RefundPolicy;
  refundDeadlineDays: number;
  refundPercentage?: number;
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
  status: "completed" | "pending" | "processing";
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

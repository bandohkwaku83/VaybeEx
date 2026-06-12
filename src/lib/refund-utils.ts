import type { Booking, RefundPolicy, Trip } from "@/lib/types";

export interface RefundEstimate {
  eligible: boolean;
  refundAmount: number;
  daysUntilDeparture: number;
  policy: RefundPolicy;
  deadlineDays: number;
  refundPercentage?: number;
  message: string;
}

export function getDaysUntilDeparture(startDate: string): number {
  const departure = new Date(startDate);
  departure.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((departure.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function getAmountPaid(booking: Booking): number {
  if (booking.paymentStatus === "paid") return booking.amountPaid || booking.amount;
  if (booking.paymentStatus === "partial") return booking.amountPaid;
  return 0;
}

export function estimateRefund(trip: Trip, booking: Booking): RefundEstimate {
  const amountPaid = getAmountPaid(booking);
  const daysUntilDeparture = getDaysUntilDeparture(trip.startDate);
  const policy = trip.refundPolicy;
  const deadlineDays = trip.refundDeadlineDays;
  const refundPercentage = trip.refundPercentage;

  if (amountPaid <= 0) {
    return {
      eligible: false,
      refundAmount: 0,
      daysUntilDeparture,
      policy,
      deadlineDays,
      refundPercentage,
      message: "No payment has been made yet. You can cancel without a refund.",
    };
  }

  if (policy === "none") {
    return {
      eligible: false,
      refundAmount: 0,
      daysUntilDeparture,
      policy,
      deadlineDays,
      message: "This trip is non-refundable. Your booking can still be cancelled.",
    };
  }

  if (daysUntilDeparture < deadlineDays) {
    return {
      eligible: false,
      refundAmount: 0,
      daysUntilDeparture,
      policy,
      deadlineDays,
      refundPercentage,
      message: `Cancellation deadline passed. Refunds require at least ${deadlineDays} days before departure.`,
    };
  }

  if (policy === "full") {
    return {
      eligible: true,
      refundAmount: amountPaid,
      daysUntilDeparture,
      policy,
      deadlineDays,
      message: `Full refund of ${deadlineDays}+ days before departure.`,
    };
  }

  const pct = refundPercentage ?? 50;
  const refundAmount = Math.round(amountPaid * (pct / 100));
  return {
    eligible: true,
    refundAmount,
    daysUntilDeparture,
    policy,
    deadlineDays,
    refundPercentage: pct,
    message: `${pct}% refund when cancelled ${deadlineDays}+ days before departure.`,
  };
}

export function formatRefundPolicyLabel(trip: Trip): string {
  if (trip.refundPolicy === "none") return "Non-refundable";
  if (trip.refundPolicy === "full") {
    return `Full refund up to ${trip.refundDeadlineDays} days before departure`;
  }
  return `${trip.refundPercentage ?? 50}% refund up to ${trip.refundDeadlineDays} days before departure`;
}

"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Shield } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { addCancellationRequest } from "@/lib/cancellation-requests";
import { getTripById } from "@/lib/mock-data";
import type { Booking, CancellationRequest } from "@/lib/types";
import { estimateRefund, formatRefundPolicyLabel, getAmountPaid } from "@/lib/refund-utils";
import { formatCurrency } from "@/lib/utils";

interface CancelBookingDialogProps {
  booking: Booking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitted: (request: CancellationRequest) => void;
}

export function CancelBookingDialog({
  booking,
  open,
  onOpenChange,
  onSubmitted,
}: CancelBookingDialogProps) {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const trip = booking ? getTripById(booking.tripId) : undefined;
  const estimate = useMemo(() => {
    if (!booking || !trip) return null;
    return estimateRefund(trip, booking);
  }, [booking, trip]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) setReason("");
    onOpenChange(nextOpen);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking || !trip || !estimate || isSubmitting) return;

    setIsSubmitting(true);
    const amountPaid = getAmountPaid(booking);

    const request: CancellationRequest = {
      id: `cr-${Date.now()}`,
      bookingId: booking.id,
      tripId: booking.tripId,
      tripTitle: booking.tripTitle,
      destination: booking.destination,
      startDate: booking.startDate,
      amountPaid,
      refundAmount: estimate.refundAmount,
      refundEligible: estimate.eligible,
      reason: reason.trim() || undefined,
      status: estimate.eligible ? "pending" : "denied",
      requestedAt: new Date().toISOString(),
      refundDestination: booking.paymentMethod
        ? `Original payment method (${booking.paymentMethod})`
        : "Original payment method",
    };

    addCancellationRequest(request);
    onSubmitted(request);

    if (estimate.eligible) {
      toast.success("Cancellation requested. We'll process your refund shortly.");
    } else {
      toast.success("Booking cancelled. No refund applies under this trip's policy.");
    }

    setIsSubmitting(false);
    handleOpenChange(false);
  };

  if (!booking || !trip || !estimate) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Request cancellation</DialogTitle>
          <DialogDescription>
            Review the refund policy for {booking.tripTitle} before confirming.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="rounded-xl bg-stone-50 p-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-stone-500">Amount paid</span>
              <span className="font-medium text-stone-900 tabular-nums">
                {formatCurrency(getAmountPaid(booking))}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-stone-500">Days until departure</span>
              <span className="font-medium text-stone-900">{estimate.daysUntilDeparture}</span>
            </div>
            <div className="flex items-start gap-2 pt-1 border-t border-stone-200">
              <Shield className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
              <span className="text-stone-600">{formatRefundPolicyLabel(trip)}</span>
            </div>
          </div>

          <div
            className={`rounded-xl border p-4 ${
              estimate.eligible
                ? "border-emerald-200 bg-emerald-50/60"
                : "border-amber-200 bg-amber-50/60"
            }`}
          >
            <p className="text-sm font-medium text-stone-900">
              {estimate.eligible ? "Estimated refund" : "No refund"}
            </p>
            <p className="text-2xl font-bold text-stone-900 mt-1 tabular-nums">
              {formatCurrency(estimate.refundAmount)}
            </p>
            <p className="text-xs text-stone-500 mt-1">{estimate.message}</p>
          </div>

          {!estimate.eligible && (
            <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50/50 p-3 text-sm text-amber-800">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <p>
                You can still cancel your booking, but no refund will be issued under the current
                policy.
              </p>
            </div>
          )}

          <div>
            <Label htmlFor="cancel-reason">Reason (optional)</Label>
            <Textarea
              id="cancel-reason"
              className="mt-1.5 min-h-[80px]"
              placeholder="Tell us why you're cancelling..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          {estimate.eligible && (
            <p className="text-xs text-stone-500">
              Refunds are sent back to your original payment method within 3–5 business days after
              approval.
            </p>
          )}

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Keep booking
            </Button>
            <Button
              type="submit"
              variant={estimate.eligible ? "default" : "destructive"}
              disabled={isSubmitting}
            >
              {estimate.eligible ? "Request cancellation & refund" : "Cancel without refund"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

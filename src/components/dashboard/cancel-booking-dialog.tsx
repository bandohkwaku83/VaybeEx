"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "@/lib/api/client";
import {
  getCancellationPreview,
  requestBookingCancellation,
  type CancellationPreview,
} from "@/lib/api/cancellations";
import type { Booking, CancellationRequest } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

interface CancelBookingDialogProps {
  booking: Booking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitted: (request: CancellationRequest) => void;
}

function policyLine(preview: CancellationPreview): string {
  if (preview.refundPolicySummary?.trim()) return preview.refundPolicySummary.trim();
  if (preview.policy === "full") {
    return `Full refund if cancelled ${preview.deadlineDays}+ days before departure.`;
  }
  if (preview.policy === "partial") {
    return `${preview.refundPercentage ?? 50}% refund if cancelled ${preview.deadlineDays}+ days before departure.`;
  }
  return "This trip is non-refundable.";
}

export function CancelBookingDialog({
  booking,
  open,
  onOpenChange,
  onSubmitted,
}: CancelBookingDialogProps) {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [preview, setPreview] = useState<CancellationPreview | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !booking) {
      setPreview(null);
      setPreviewError(null);
      setReason("");
      return;
    }

    let cancelled = false;
    (async () => {
      setLoadingPreview(true);
      setPreviewError(null);
      try {
        const res = await getCancellationPreview(booking.id);
        if (cancelled) return;
        if (!res.data) {
          setPreviewError(res.message || "Unable to load cancellation details.");
          setPreview(null);
          return;
        }
        setPreview(res.data);
      } catch (err) {
        if (cancelled) return;
        setPreview(null);
        setPreviewError(
          err instanceof ApiError
            ? err.message
            : "Unable to load cancellation details."
        );
      } finally {
        if (!cancelled) setLoadingPreview(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, booking]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setReason("");
      setPreview(null);
      setPreviewError(null);
    }
    onOpenChange(nextOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking || !preview || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await requestBookingCancellation(booking.id, {
        reason: reason.trim() || undefined,
      });
      const request = res.data?.request;
      if (!request) {
        throw new ApiError(res.message || "Cancellation failed.", 500);
      }
      onSubmitted(request);
      toast.success(
        res.message ||
          (preview.eligible
            ? "Refund requested. If approved, it returns to your original payment method."
            : "Booking cancelled. No refund under this trip’s policy.")
      );
      handleOpenChange(false);
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? err.message
          : "Could not cancel this booking. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!booking) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="gap-0 overflow-hidden p-0 sm:max-w-[400px]"
        style={{
          borderColor: "var(--border)",
          background: "var(--surface)",
        }}
      >
        <DialogHeader className="space-y-1.5 px-5 pb-4 pt-5 text-left sm:px-6 sm:pt-6">
          <DialogTitle
            className="font-display text-xl font-semibold tracking-tight"
            style={{ color: "var(--text)" }}
          >
            Request refund
          </DialogTitle>
          <DialogDescription
            className="text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            {booking.tripTitle}
          </DialogDescription>
        </DialogHeader>

        {loadingPreview ? (
          <div className="flex min-h-[10rem] items-center justify-center px-5 pb-6">
            <Loader2
              className="h-5 w-5 animate-spin"
              style={{ color: "var(--primary)" }}
            />
          </div>
        ) : previewError ? (
          <div className="space-y-4 px-5 pb-5 sm:px-6">
            <p className="text-sm" style={{ color: "var(--coral)" }}>
              {previewError}
            </p>
            <DialogFooter className="gap-2 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                
                onClick={() => handleOpenChange(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </div>
        ) : preview ? (
          <form
            onSubmit={(e) => void handleSubmit(e)}
            className="space-y-5 px-5 pb-5 sm:px-6 sm:pb-6"
          >
            <div className="text-center">
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.16em]"
                style={{ color: "var(--text-tertiary)" }}
              >
                {preview.eligible ? "Estimated refund" : "Refund"}
              </p>
              <p
                className="mt-1 font-display text-3xl font-bold tracking-tight tabular-nums"
                style={{
                  color: preview.eligible ? "var(--text)" : "var(--text-tertiary)",
                }}
              >
                {formatCurrency(preview.refundAmount)}
              </p>
              <p
                className="mt-2 text-sm leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                {preview.eligible
                  ? policyLine(preview)
                  : preview.message ||
                    "You can still cancel, but no refund applies."}
              </p>
              {preview.eligible && (
                <p
                  className="mt-1.5 text-xs"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  Paid {formatCurrency(preview.amountPaid)} ·{" "}
                  {preview.daysUntilDeparture} days to departure
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="cancel-reason"
                className="mb-1.5 block text-xs font-medium"
                style={{ color: "var(--text-secondary)" }}
              >
                Reason <span style={{ color: "var(--text-tertiary)" }}>(optional)</span>
              </label>
              <Textarea
                id="cancel-reason"
                className="min-h-[72px] resize-none rounded-xl"
                style={{
                  borderColor: "var(--border-strong)",
                  background: "var(--bg)",
                }}
                placeholder="Why are you cancelling?"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            {preview.eligible && (
              <p
                className="text-xs leading-relaxed"
                style={{ color: "var(--text-tertiary)" }}
              >
                If approved, the refund returns to your original payment method
                (card / MoMo).
              </p>
            )}

            <DialogFooter className="gap-2 sm:justify-stretch">
              <Button
                type="button"
                variant="outline"
                className="h-11 flex-1"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
                style={{
                  borderColor: "var(--border-strong)",
                  color: "var(--text)",
                }}
              >
                Keep booking
              </Button>
              <Button
                type="submit"
                className="h-11 flex-1 font-semibold"
                disabled={isSubmitting}
                style={
                  preview.eligible
                    ? {
                        background: "var(--primary)",
                        color: "#fbf7f1",
                      }
                    : {
                        background: "var(--coral)",
                        color: "#fff",
                      }
                }
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting…
                  </>
                ) : preview.eligible ? (
                  "Request refund"
                ) : (
                  "Cancel booking"
                )}
              </Button>
            </DialogFooter>
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

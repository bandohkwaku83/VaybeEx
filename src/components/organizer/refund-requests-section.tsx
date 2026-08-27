"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CANCELLATION_STATUS_LABELS } from "@/lib/cancellation-requests";
import { updateOrganizerCancellation } from "@/lib/api/cancellations";
import { ApiError } from "@/lib/api/client";
import type { CancellationRequest } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

const POLL_MS = 10_000;

const statusVariant: Record<
  CancellationRequest["status"],
  "warning" | "secondary" | "success" | "destructive"
> = {
  pending: "warning",
  processing: "secondary",
  refunded: "success",
  denied: "destructive",
};

const ORGANIZER_STATUS_LABELS: Record<CancellationRequest["status"], string> = {
  pending: "Pending review",
  processing: "Refund processing",
  refunded: "Refunded",
  denied: "Denied",
};

interface RefundRequestsSectionProps {
  requests: CancellationRequest[];
  onUpdated: () => void;
  showTripLink?: boolean;
  emptyMessage?: string;
}

export function RefundRequestsSection({
  requests,
  onUpdated,
  showTripLink = true,
  emptyMessage = "No cancellation requests yet. When travelers cancel from their dashboard, requests appear here.",
}: RefundRequestsSectionProps) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const hasProcessing = requests.some((r) => r.status === "processing");

  useEffect(() => {
    if (!hasProcessing) return;
    const id = window.setInterval(() => {
      onUpdated();
    }, POLL_MS);
    return () => window.clearInterval(id);
  }, [hasProcessing, onUpdated]);

  const handleUpdate = async (
    requestId: string,
    status: "refunded" | "denied",
  ) => {
    const request = requests.find((r) => r.id === requestId);
    if (!request) return;

    setBusyId(requestId);
    try {
      const res = await updateOrganizerCancellation(requestId, { status });
      const next = res.data;

      if (status === "denied") {
        toast.success("Cancellation denied — no refund");
      } else if (next?.status === "refunded") {
        toast.success("Refund sent");
      } else {
        toast.success(
          "Refund submitted — traveler will receive it via Paystack",
        );
      }
      onUpdated();
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Failed to update refund request",
      );
    } finally {
      setBusyId(null);
    }
  };

  if (requests.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-stone-500 text-sm">
          {emptyMessage}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((request) => {
        const busy = busyId === request.id;
        const isPending = request.status === "pending";
        const isProcessing = request.status === "processing";
        const canApprove = isPending && request.refundEligible;
        const canDeny = isPending;

        return (
          <Card key={request.id}>
            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  {showTripLink ? (
                    <Link
                      href={`/organizer/trips/${request.tripId}?tab=cancellations`}
                      className="font-medium text-stone-900 hover:text-teal-600"
                    >
                      {request.tripTitle}
                    </Link>
                  ) : (
                    <p className="font-medium text-stone-900">
                      {request.tripTitle}
                    </p>
                  )}
                  <Badge variant={statusVariant[request.status]}>
                    {ORGANIZER_STATUS_LABELS[request.status] ??
                      CANCELLATION_STATUS_LABELS[request.status]}
                  </Badge>
                </div>
                <p className="text-sm text-stone-500 mt-1">
                  {request.destination} · Departs{" "}
                  {new Date(request.startDate).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
                <p className="text-sm text-stone-600 mt-1">
                  Paid {formatCurrency(request.amountPaid)} · Refund{" "}
                  <span
                    className={
                      request.refundEligible
                        ? "text-emerald-600 font-medium"
                        : ""
                    }
                  >
                    {formatCurrency(request.refundAmount)}
                  </span>
                </p>
                {request.reason && (
                  <p className="text-sm text-stone-500 mt-1">
                    &ldquo;{request.reason}&rdquo;
                  </p>
                )}
                {isProcessing && (
                  <p className="mt-2 flex items-center gap-1.5 text-sm text-stone-600">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    {/* Paystack is sending the refund… */}
                    Processing
                  </p>
                )}
                {request.refundFailureReason && (
                  <p className="mt-2 text-sm text-red-600">
                    {request.refundFailureReason}
                  </p>
                )}
                {request.status === "refunded" && (
                  <p className="mt-2 text-sm text-emerald-700">
                    Money sent to the traveler&apos;s original payment method
                    {request.refundDestination
                      ? ` (${request.refundDestination})`
                      : ""}
                    .
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2 sm:shrink-0">
                {canApprove && (
                  <Button
                    size="sm"
                    disabled={busy}
                    onClick={() => void handleUpdate(request.id, "refunded")}
                  >
                    {busy ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : request.refundFailureReason ? (
                      "Retry approve"
                    ) : (
                      "Approve refund"
                    )}
                  </Button>
                )}
                {canDeny && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busy}
                    onClick={() => void handleUpdate(request.id, "denied")}
                  >
                    {request.refundEligible ? "Deny" : "Close / Deny"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

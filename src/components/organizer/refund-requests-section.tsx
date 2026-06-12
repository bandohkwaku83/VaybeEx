"use client";

import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CANCELLATION_STATUS_LABELS,
  updateCancellationRequest,
} from "@/lib/cancellation-requests";
import type { CancellationRequest } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

const statusVariant: Record<
  CancellationRequest["status"],
  "warning" | "secondary" | "success" | "destructive"
> = {
  pending: "warning",
  processing: "secondary",
  refunded: "success",
  denied: "destructive",
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
  const handleProcessRefund = (requestId: string) => {
    const request = requests.find((r) => r.id === requestId);
    if (!request) return;

    if (request.status === "pending" && request.refundEligible) {
      updateCancellationRequest(requestId, { status: "processing" });
      toast.success("Refund initiated. Traveler will be notified.");
    } else if (request.status === "processing") {
      updateCancellationRequest(requestId, {
        status: "refunded",
        processedAt: new Date().toISOString(),
      });
      toast.success(`Refund of ${formatCurrency(request.refundAmount)} marked as complete.`);
    }
    onUpdated();
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
      {requests.map((request) => (
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
                  <p className="font-medium text-stone-900">{request.tripTitle}</p>
                )}
                <Badge variant={statusVariant[request.status]}>
                  {CANCELLATION_STATUS_LABELS[request.status]}
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
                <span className={request.refundEligible ? "text-emerald-600 font-medium" : ""}>
                  {formatCurrency(request.refundAmount)}
                </span>
              </p>
              {request.reason && (
                <p className="text-sm text-stone-500 mt-1">&ldquo;{request.reason}&rdquo;</p>
              )}
            </div>
            <div className="flex flex-wrap gap-2 sm:shrink-0">
              {request.refundEligible && request.status === "pending" && (
                <Button size="sm" onClick={() => handleProcessRefund(request.id)}>
                  Process refund
                </Button>
              )}
              {request.status === "processing" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleProcessRefund(request.id)}
                >
                  Mark refunded
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

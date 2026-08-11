"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Check, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/client";
import {
  extractBookingReceiptDetails,
  getBooking,
  mapBookingFromApi,
  payBooking,
  verifyBookingPayment,
  type BookingReceiptDetails,
} from "@/lib/api/bookings";
import { getPublicTrip } from "@/lib/api/public-trips";
import { formatCurrency } from "@/lib/utils";
import type { Booking } from "@/lib/types";
import { toast } from "sonner";

type VerifyState =
  | { status: "loading" }
  | {
      status: "success";
      booking: Booking;
      details: BookingReceiptDetails;
      rawStatus: string;
    }
  | { status: "error"; message: string; bookingId?: string };

function CallbackInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reference =
    searchParams.get("reference") || searchParams.get("trxref") || "";
  const returnTo = searchParams.get("return") || "/dashboard";

  const [state, setState] = useState<VerifyState>({ status: "loading" });
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!reference) {
        setState({
          status: "error",
          message:
            "Missing payment reference. Please return to your dashboard.",
        });
        return;
      }

      try {
        const res = await verifyBookingPayment({ reference });
        if (cancelled) return;

        const raw = res.data as unknown as Record<string, unknown> | undefined;
        if (!raw) {
          setState({
            status: "error",
            message: res.message || "Payment could not be verified.",
          });
          return;
        }

        let booking = mapBookingFromApi(raw);
        const details = extractBookingReceiptDetails(raw);
        const rawStatus = String(
          raw.paymentStatus ?? raw.payment_status ?? ""
        ).toLowerCase();

        if (
          booking.tripId &&
          (!booking.tripTitle || booking.tripTitle === "Trip")
        ) {
          try {
            const tripRes = await getPublicTrip(booking.tripId);
            if (!cancelled && tripRes.data) {
              booking = {
                ...booking,
                tripTitle: tripRes.data.title || booking.tripTitle,
                destination:
                  tripRes.data.destination || booking.destination,
              };
            }
          } catch {
            /* keep mapped booking */
          }
        }

        if (cancelled) return;

        const pending =
          rawStatus === "pending" ||
          rawStatus === "pending_payment" ||
          details.paymentStatus === "pending";

        if (pending) {
          setState({
            status: "error",
            message: "Payment not completed. You can try again from your booking.",
            bookingId: booking.id,
          });
          return;
        }

        setState({
          status: "success",
          booking,
          details,
          rawStatus,
        });

        const confirmUrl = returnTo.includes("?")
          ? `${returnTo}&reference=${encodeURIComponent(reference)}`
          : `${returnTo}?reference=${encodeURIComponent(reference)}`;

        window.setTimeout(() => {
          if (!cancelled) router.replace(confirmUrl);
        }, 2400);
      } catch (err) {
        if (cancelled) return;
        setState({
          status: "error",
          message:
            err instanceof ApiError
              ? err.message
              : "Payment verification failed. If you were charged, contact support with your reference.",
        });
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [reference, returnTo, router]);

  const retryPay = async (bookingId: string) => {
    setRetrying(true);
    try {
      const callbackUrl = `${window.location.origin}/booking/callback?return=${encodeURIComponent(returnTo)}`;
      // Re-open Paystack for abandoned / incomplete checkout.
      const existing = await getBooking(bookingId);
      const due =
        existing.data?.remainingBalance ||
        existing.data?.amount ||
        (existing.raw
          ? Number(
              (existing.raw as Record<string, unknown>).remainingBalance ??
                (
                  (existing.raw as Record<string, unknown>).pricing as
                    | Record<string, unknown>
                    | undefined
                )?.balanceDue ??
                0
            )
          : 0) ||
        0;
      if (!(due > 0)) {
        toast.error("No remaining balance found. Open My Bookings to continue.");
        setRetrying(false);
        return;
      }
      const res = await payBooking(bookingId, {
        callbackUrl,
        paymentAmount: due,
      });
      const url = res.data?.paystackAuthorizationUrl;
      if (!url) throw new ApiError("Payment link unavailable.", 500);
      window.location.href = url;
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? err.message
          : "Could not restart payment."
      );
      setRetrying(false);
    }
  };

  if (state.status === "loading") {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col items-center justify-center px-5 text-center">
        <Loader2
          className="h-8 w-8 animate-spin"
          style={{ color: "var(--primary)" }}
        />
        <p className="mt-5 text-sm" style={{ color: "var(--text-secondary)" }}>
          Confirming payment…
        </p>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="mx-auto max-w-sm px-5 pb-16 pt-28 text-center">
        <div
          className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full"
          style={{
            background: "rgba(181, 82, 58, 0.12)",
            color: "var(--coral)",
          }}
        >
          <XCircle className="h-7 w-7" />
        </div>
        <h1
          className="font-display text-2xl font-bold"
          style={{ color: "var(--text)" }}
        >
          Payment not completed
        </h1>
        <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
          {state.message}
        </p>
        {reference && (
          <p
            className="mt-3 break-all font-mono text-xs"
            style={{ color: "var(--text-tertiary)" }}
          >
            {reference}
          </p>
        )}
        <div className="mt-8 flex flex-col gap-2">
          {state.bookingId && (
            <Button
              className="h-11 w-full font-semibold"
              style={{ background: "var(--primary)", color: "#fbf7f1" }}
              disabled={retrying}
              onClick={() => void retryPay(state.bookingId!)}
            >
              {retrying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Opening Paystack…
                </>
              ) : (
                <>
                  Retry payment <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          )}
          <Button
            asChild
            variant={state.bookingId ? "ghost" : "default"}
            className={
              state.bookingId
                ? "text-[var(--text-secondary)]"
                : "h-11 w-full rounded-xl font-semibold"
            }
            style={
              state.bookingId
                ? undefined
                : { background: "var(--primary)", color: "#fbf7f1" }
            }
          >
            <Link href="/dashboard">Go to dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  const { booking, details, rawStatus } = state;
  const currency = details.currency || "GHS";
  const amountPaidNow =
    details.amountPaid ?? booking.amountPaid ?? 0;
  const remaining =
    details.remainingBalance ??
    details.balanceDue ??
    booking.remainingBalance ??
    0;
  const fullyPaid =
    rawStatus === "fully_paid" || details.paymentStatus === "paid";
  const depositPaid =
    rawStatus === "deposit_paid" || details.paymentStatus === "partial";
  const tripTitle =
    booking.tripTitle && booking.tripTitle !== "Trip"
      ? booking.tripTitle
      : null;
  const displayRef = details.reference || reference;
  const continueHref = returnTo.includes("?")
    ? `${returnTo}&reference=${encodeURIComponent(reference)}`
    : `${returnTo}?reference=${encodeURIComponent(reference)}`;

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col items-center justify-center px-5 py-16 text-center">
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        className="mb-6 flex h-14 w-14 items-center justify-center rounded-full"
        style={{
          background: "var(--primary)",
          color: "#fbf7f1",
        }}
      >
        <Check className="h-7 w-7" strokeWidth={2.75} />
      </motion.div>

      <h1
        className="font-display text-2xl font-bold tracking-tight"
        style={{ color: "var(--text)" }}
      >
        {fullyPaid
          ? "You're fully booked & paid"
          : depositPaid
            ? "Spot secured"
            : "Payment successful"}
      </h1>
      <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
        {fullyPaid
          ? tripTitle
            ? `You're all set for ${tripTitle}.`
            : "Your booking is fully paid."
          : depositPaid
            ? remaining > 0
              ? `Balance: ${formatCurrency(remaining, currency)}`
              : "Your deposit is in. Pay the balance before departure."
            : tripTitle
              ? `Your spot on ${tripTitle} is confirmed.`
              : "Your booking is confirmed."}
      </p>

      <div className="mt-8 w-full text-left">
        <p
          className="text-[10px] font-semibold uppercase tracking-[0.14em]"
          style={{ color: "var(--text-tertiary)" }}
        >
          Amount paid
        </p>
        <p
          className="mt-1 font-display text-3xl font-bold tabular-nums"
          style={{ color: "var(--text)" }}
        >
          {formatCurrency(amountPaidNow, currency)}
        </p>

        {depositPaid && remaining > 0 && (
          <div className="mt-4">
            <Button
              asChild
              className="h-11 w-full font-semibold"
              style={{ background: "var(--primary)", color: "#fbf7f1" }}
            >
              <Link href="/dashboard">
                Pay remaining {formatCurrency(remaining, currency)}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}

        {details.payments && details.payments.length > 0 && (
          <div className="mt-5 space-y-1.5">
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.14em]"
              style={{ color: "var(--text-tertiary)" }}
            >
              Payments
            </p>
            {details.payments.map((p, i) => (
              <div
                key={`${p.reference ?? i}-${p.amount}`}
                className="flex justify-between gap-3 text-sm"
              >
                <span style={{ color: "var(--text-secondary)" }}>
                  {p.method || p.channel || "Payment"}
                </span>
                <span
                  className="tabular-nums font-medium"
                  style={{ color: "var(--text)" }}
                >
                  {formatCurrency(p.amount, currency)}
                </span>
              </div>
            ))}
          </div>
        )}

        {displayRef && (
          <p
            className="mt-4 break-all font-mono text-xs"
            style={{ color: "var(--text-tertiary)" }}
          >
            {displayRef}
          </p>
        )}
      </div>

      <div
        className="mt-10 flex items-center gap-2 text-xs"
        style={{ color: "var(--text-tertiary)" }}
      >
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Redirecting…
      </div>
      <Link
        href={continueHref}
        className="mt-3 text-sm font-medium transition-opacity hover:opacity-70"
        style={{ color: "var(--primary)" }}
      >
        Continue now
      </Link>
    </div>
  );
}

export default function BookingCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2
            className="h-6 w-6 animate-spin"
            style={{ color: "var(--primary)" }}
          />
        </div>
      }
    >
      <CallbackInner />
    </Suspense>
  );
}

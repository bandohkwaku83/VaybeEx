"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/client";
import {
  getAdminRefund,
  refundLabel,
  type AdminRefund,
} from "@/lib/api/admin";
import { DEFAULT_PROFILE_IMAGE } from "@/lib/api/media";
import {
  formatDateRange,
  formatDateShort,
  formatGHSMoney,
  formatRelativeTime,
} from "@/lib/format";

const ease = [0.16, 1, 0.3, 1] as const;
const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

function statusStyle(status: string) {
  switch (status) {
    case "pending":
      return { bg: "#fffbeb", color: "#b45309" };
    case "processing":
      return { bg: "#eff6ff", color: "#1d4ed8" };
    case "refunded":
      return { bg: "#f0fdf4", color: "#15803d" };
    case "denied":
      return { bg: "#fef2f2", color: "#b91c1c" };
    default:
      return { bg: "#f5f5f5", color: "#525252" };
  }
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-[#f0f0f0] py-3.5 last:border-0">
      <p
        className="text-[11px] font-medium uppercase tracking-[0.14em]"
        style={{ color: "#a3a3a3" }}
      >
        {label}
      </p>
      <div className="mt-1 text-sm font-medium" style={{ color: "#171717" }}>
        {children}
      </div>
    </div>
  );
}

function RefundDetailInner() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [refund, setRefund] = useState<AdminRefund | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminRefund(id);
      setRefund(res.data?.refund ?? null);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not load refund."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-8 text-sm" style={{ color: "#737373" }}>
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading refund…
      </div>
    );
  }

  if (error || !refund) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <Link
          href="/admin-portal/refunds?queue=awaiting"
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium"
          style={{ color: "#737373" }}
        >
          <ArrowLeft className="h-4 w-4" />
          Refunds
        </Link>
        <div
          className="rounded-2xl p-5"
          style={{
            background: "#fff",
            boxShadow: "inset 0 0 0 1px rgba(220,38,38,0.2)",
          }}
        >
          <p style={{ color: "#dc2626" }}>{error || "Refund not found"}</p>
          <Button className="mt-3" variant="outline" onClick={() => void load()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const paid = Number(refund.amountPaid ?? refund.booking?.amountPaid ?? 0);
  const refunded = Number(refund.refundAmount ?? 0);
  const retained = Math.max(0, paid - refunded);
  const tone = statusStyle(refund.status);
  const trip = refund.trip;
  const booking = refund.booking;
  const paystack = refund.paystackRefunds ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <motion.div
        {...fadeUp}
        transition={{ duration: 0.4, ease }}
        className="mb-6 flex items-center gap-2"
      >
        <Link
          href="/admin-portal/refunds?queue=awaiting"
          className="inline-flex items-center gap-1.5 text-sm font-medium"
          style={{ color: "#737373" }}
        >
          <ArrowLeft className="h-4 w-4" />
          Refunds
        </Link>
        <span style={{ color: "#d4d4d4" }}>/</span>
        <span className="truncate text-sm font-medium" style={{ color: "#171717" }}>
          {trip?.title || refund.id}
        </span>
      </motion.div>

      <motion.header
        {...fadeUp}
        transition={{ delay: 0.04, duration: 0.45, ease }}
        className="rounded-2xl bg-white p-4 sm:p-5"
        style={{ boxShadow: "inset 0 0 0 1px #e5e5e5" }}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div
            className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl"
            style={{ background: "#f5f5f5", boxShadow: "inset 0 0 0 1px #e5e5e5" }}
          >
            <Image
              src={trip?.coverImage || DEFAULT_PROFILE_IMAGE}
              alt=""
              fill
              unoptimized
              className="object-cover"
              sizes="112px"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1
                className="font-display text-xl font-bold tracking-tight sm:text-2xl"
                style={{ color: "#171717" }}
              >
                {trip?.title || "Refund"}
              </h1>
              <span
                className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium"
                style={{ background: tone.bg, color: tone.color }}
              >
                {refundLabel(refund.status)}
              </span>
            </div>
            <p className="mt-1 text-sm" style={{ color: "#737373" }}>
              {trip?.destination || "—"}
              {trip?.startDate && trip?.endDate
                ? ` · ${formatDateRange(trip.startDate, trip.endDate)}`
                : ""}
            </p>
            {trip?.refundPolicy ? (
              <p className="mt-2 text-sm" style={{ color: "#525252" }}>
                Policy: {trip.refundPolicy}
              </p>
            ) : null}
            <p className="mt-2 text-xs" style={{ color: "#a3a3a3" }}>
              Read-only. Approve or deny from the organizer portal.
            </p>
          </div>
        </div>
      </motion.header>

      {refund.refundFailureReason ? (
        <motion.div
          {...fadeUp}
          transition={{ delay: 0.08, duration: 0.45, ease }}
          className="mt-5 flex gap-3 rounded-2xl p-4 sm:p-5"
          style={{
            background: "#fef2f2",
            boxShadow: "inset 0 0 0 1px rgba(220,38,38,0.15)",
          }}
        >
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            style={{ background: "#fee2e2", color: "#b91c1c" }}
          >
            <ShieldAlert className="h-4.5 w-4.5" strokeWidth={1.75} />
          </span>
          <div>
            <p className="text-[15px] font-semibold" style={{ color: "#991b1b" }}>
              Refund failed
            </p>
            <p className="mt-1 text-sm" style={{ color: "#b91c1c" }}>
              {refund.refundFailureReason}
            </p>
          </div>
        </motion.div>
      ) : null}

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <motion.section
          {...fadeUp}
          transition={{ delay: 0.1, duration: 0.45, ease }}
          className="rounded-2xl bg-white p-5 sm:p-6"
          style={{ boxShadow: "inset 0 0 0 1px #e5e5e5" }}
        >
          <h2 className="font-display text-base font-semibold" style={{ color: "#171717" }}>
            People
          </h2>
          <Field label="Traveler">
            {refund.traveler?.id ? (
              <Link
                href={`/admin-portal/users/${refund.traveler.id}`}
                className="inline-flex items-center gap-1 hover:underline"
              >
                {refund.traveler.fullName || refund.traveler.email || "—"}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              refund.traveler?.fullName || "—"
            )}
            {refund.traveler?.email ? (
              <p className="mt-0.5 text-xs font-normal" style={{ color: "#737373" }}>
                {refund.traveler.email}
                {refund.traveler.phone ? ` · ${refund.traveler.phone}` : ""}
              </p>
            ) : null}
          </Field>
          <Field label="Organizer">
            {refund.organizer?.id ? (
              <Link
                href={`/admin-portal/users/${refund.organizer.id}`}
                className="inline-flex items-center gap-1 hover:underline"
              >
                {refund.organizer.businessName ||
                  refund.organizer.fullName ||
                  refund.organizer.email ||
                  "—"}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              refund.organizer?.businessName || refund.organizer?.fullName || "—"
            )}
            {refund.organizer?.email ? (
              <p className="mt-0.5 text-xs font-normal" style={{ color: "#737373" }}>
                {refund.organizer.email}
                {refund.organizer.phone ? ` · ${refund.organizer.phone}` : ""}
              </p>
            ) : null}
          </Field>
          <Field label="Requested">
            {refund.requestedAt
              ? `${formatDateShort(refund.requestedAt)} · ${formatRelativeTime(refund.requestedAt)}`
              : "—"}
          </Field>
          <Field label="Processed">
            {refund.processedAt
              ? `${formatDateShort(refund.processedAt)} · ${formatRelativeTime(refund.processedAt)}`
              : "—"}
          </Field>
          <Field label="Destination">{refund.refundDestination || "—"}</Field>
          <Field label="Payment method">
            {refund.paymentMethod || booking?.paymentMethod || "—"}
          </Field>
        </motion.section>

        <motion.section
          {...fadeUp}
          transition={{ delay: 0.14, duration: 0.45, ease }}
          className="rounded-2xl bg-white p-5 sm:p-6"
          style={{ boxShadow: "inset 0 0 0 1px #e5e5e5" }}
        >
          <h2 className="font-display text-base font-semibold" style={{ color: "#171717" }}>
            Amounts
          </h2>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {(
              [
                ["Paid", paid],
                ["Refund", refunded],
                ["Retained", retained],
              ] as const
            ).map(([label, value]) => (
              <div key={label}>
                <p
                  className="text-[11px] font-medium uppercase tracking-[0.14em]"
                  style={{ color: "#a3a3a3" }}
                >
                  {label}
                </p>
                <p
                  className="mt-1 font-display text-xl font-bold tabular-nums"
                  style={{ color: "#171717" }}
                >
                  {formatGHSMoney(value)}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-5">
            <Field label="Traveler reason">{refund.reason || "—"}</Field>
            <Field label="Organizer note">{refund.organizerNote || "—"}</Field>
          </div>
        </motion.section>
      </div>

      {booking ? (
        <motion.section
          {...fadeUp}
          transition={{ delay: 0.18, duration: 0.45, ease }}
          className="mt-5 rounded-2xl bg-white p-5 sm:p-6"
          style={{ boxShadow: "inset 0 0 0 1px #e5e5e5" }}
        >
          <h2 className="font-display text-base font-semibold" style={{ color: "#171717" }}>
            Booking
          </h2>
          <div className="mt-2 grid gap-x-8 sm:grid-cols-2">
            <Field label="Booking ID">{booking.id || "—"}</Field>
            <Field label="Status">{booking.status || "—"}</Field>
            <Field label="Payment">{booking.paymentStatus || "—"}</Field>
            <Field label="Party size">{booking.partySize ?? "—"}</Field>
            <Field label="Type">{booking.bookingType || "—"}</Field>
            <Field label="Paid at">
              {booking.paidAt ? formatDateShort(booking.paidAt) : "—"}
            </Field>
          </div>
          {(booking.payments?.length ?? 0) > 0 ? (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead>
                  <tr style={{ color: "#a3a3a3" }}>
                    <th className="pb-2 font-medium">Reference</th>
                    <th className="pb-2 font-medium">Amount</th>
                    <th className="pb-2 font-medium">Channel</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium">Paid</th>
                  </tr>
                </thead>
                <tbody>
                  {booking.payments!.map((p, i) => (
                    <tr key={p.reference || i} className="border-t border-[#f0f0f0]">
                      <td className="py-2.5 font-mono text-xs">{p.reference || "—"}</td>
                      <td className="py-2.5 tabular-nums">{formatGHSMoney(p.amount)}</td>
                      <td className="py-2.5 capitalize">
                        {p.channel || p.paymentMethod || "—"}
                      </td>
                      <td className="py-2.5">{p.status || "—"}</td>
                      <td className="py-2.5">
                        {p.paidAt ? formatDateShort(p.paidAt) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </motion.section>
      ) : null}

      {paystack.length > 0 ? (
        <motion.section
          {...fadeUp}
          transition={{ delay: 0.22, duration: 0.45, ease }}
          className="mt-5 rounded-2xl bg-white p-5 sm:p-6"
          style={{ boxShadow: "inset 0 0 0 1px #e5e5e5" }}
        >
          <h2 className="font-display text-base font-semibold" style={{ color: "#171717" }}>
            Paystack refunds
          </h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr style={{ color: "#a3a3a3" }}>
                  <th className="pb-2 font-medium">Refund ID</th>
                  <th className="pb-2 font-medium">Transaction</th>
                  <th className="pb-2 font-medium">Amount</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {paystack.map((row, i) => (
                  <tr key={row.refundId || i} className="border-t border-[#f0f0f0]">
                    <td className="py-2.5 font-mono text-xs">{row.refundId || "—"}</td>
                    <td className="py-2.5 font-mono text-xs">
                      {row.transactionReference || "—"}
                    </td>
                    <td className="py-2.5 tabular-nums">
                      {formatGHSMoney(row.amount)}
                      {row.currency && row.currency !== "GHS" ? ` ${row.currency}` : ""}
                    </td>
                    <td className="py-2.5 capitalize">{row.status || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.section>
      ) : null}
    </div>
  );
}

export default function AdminRefundDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center gap-2 p-8 text-sm" style={{ color: "#737373" }}>
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading…
        </div>
      }
    >
      <RefundDetailInner />
    </Suspense>
  );
}

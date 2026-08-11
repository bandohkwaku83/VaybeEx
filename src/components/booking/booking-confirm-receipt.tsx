"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Calendar,
  Check,
  Copy,
  MapPin,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { BookingReceiptDetails, BookingType } from "@/lib/api/bookings";
import { formatCurrency, formatDate } from "@/lib/utils";

export type BookingConfirmReceiptProps = {
  waitlist?: boolean;
  title: string;
  destination?: string;
  image?: string;
  startDate?: string;
  endDate?: string;
  /** Fallback total when pricing details are unavailable. */
  total?: number;
  travelers?: number;
  reference?: string | null;
  dashboardHref: string;
  tripHref: string;
  dashboardAsExternal?: boolean;
  organizerName?: string;
  meetingPoint?: string;
  durationDays?: number;
  details?: BookingReceiptDetails | null;
};

const BOOKING_TYPE_LABEL: Record<BookingType, string> = {
  solo: "Solo",
  couple: "Couple",
  group: "Group",
};

function TicketNotch({ side }: { side: "left" | "right" }) {
  return (
    <div
      data-receipt-notch
      className="absolute top-1/2 z-10 h-6 w-6 -translate-y-1/2 rounded-full"
      style={{
        background: "var(--bg)",
        ...(side === "left"
          ? { left: "-12px", boxShadow: "inset -1px 0 0 var(--border)" }
          : { right: "-12px", boxShadow: "inset 1px 0 0 var(--border)" }),
      }}
    />
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value?: ReactNode;
}) {
  if (value == null || value === "") return null;
  return (
    <div
      className="flex items-start justify-between gap-4 border-t py-2.5 first:border-t-0 first:pt-0"
      style={{ borderColor: "var(--border-subtle)" }}
    >
      <dt
        className="shrink-0 pt-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]"
        style={{ color: "var(--text-tertiary)" }}
      >
        {label}
      </dt>
      <dd
        className="min-w-0 text-right text-sm font-medium leading-snug"
        style={{ color: "var(--text)" }}
      >
        {value}
      </dd>
    </div>
  );
}

function MoneyRow({
  label,
  amount,
  currency,
  emphasize,
  muted,
}: {
  label: string;
  amount?: number;
  currency: string;
  emphasize?: boolean;
  muted?: boolean;
}) {
  if (amount == null || amount <= 0) return null;
  return (
    <div className="flex items-center justify-between gap-3">
      <span
        className="text-sm"
        style={{
          color: muted ? "var(--text-tertiary)" : "var(--text-secondary)",
        }}
      >
        {label}
      </span>
      <span
        className={
          emphasize
            ? "text-base font-semibold tabular-nums"
            : "text-sm font-medium tabular-nums"
        }
        style={{ color: "var(--text)" }}
      >
        {formatCurrency(amount, currency)}
      </span>
    </div>
  );
}

export function BookingConfirmReceipt({
  waitlist = false,
  title,
  destination,
  image: _image,
  startDate,
  endDate,
  total = 0,
  travelers,
  reference,
  dashboardHref,
  tripHref,
  dashboardAsExternal = false,
  organizerName,
  meetingPoint,
  durationDays,
  details,
}: BookingConfirmReceiptProps) {
  const [copied, setCopied] = useState(false);
  const hasDates = Boolean(startDate || endDate);

  const currency = details?.currency || "GHS";
  const bookingType = details?.bookingType;
  const namedGuests = (details?.guests ?? []).filter((g) => g.fullName.trim());
  const selectedAddOns = (details?.addOns ?? []).filter((a) => a.name.trim());
  const partySize =
    details?.partySize ||
    travelers ||
    (namedGuests.length > 0 ? namedGuests.length : undefined);

  const tripSubtotal = details?.tripSubtotal;
  const addOnsTotal = details?.addOnsTotal;
  const totalAmount = details?.totalAmount || total || 0;
  const amountPaid = details?.amountPaid;
  const depositTotal = details?.depositTotal;
  const balanceDue = details?.balanceDue;
  const balanceDueDate = details?.balanceDueDate;
  const paymentNote = details?.paymentNote;
  const paymentStatus = details?.paymentStatus;
  const paymentStatusLabel =
    details?.paymentStatusLabel ||
    (paymentStatus === "paid"
      ? "Paid in full"
      : paymentStatus === "partial"
        ? "Deposit paid"
        : paymentStatus === "pending"
          ? "Payment pending"
          : undefined);
  const paymentMethodLabel = details?.paymentMethodLabel;
  const paidAt = details?.paidAt;
  const displayReference = reference || details?.reference || null;

  const isDeposit =
    paymentStatus === "partial" ||
    Boolean(balanceDue && balanceDue > 0) ||
    Boolean(amountPaid && totalAmount && amountPaid < totalAmount);

  const resolvedDuration =
    durationDays && durationDays > 0
      ? durationDays
      : startDate && endDate
        ? Math.max(
            1,
            Math.round(
              (new Date(endDate).getTime() - new Date(startDate).getTime()) /
                (1000 * 60 * 60 * 24)
            ) + 1
          )
        : undefined;

  const copyRef = async () => {
    if (!displayReference) return;
    try {
      await navigator.clipboard.writeText(displayReference);
      setCopied(true);
      toast.success("Reference copied");
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Could not copy reference");
    }
  };

  return (
    <div
      className="relative min-h-[75vh] overflow-hidden"
      style={{ background: "var(--bg)" }}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[28rem]"
        style={{
          background:
            "radial-gradient(ellipse 80% 55% at 50% -8%, rgba(196,134,76,0.22), transparent 70%), linear-gradient(180deg, var(--bg-secondary) 0%, transparent 55%)",
        }}
      />
      <div
        className="pointer-events-none absolute -left-24 top-40 h-64 w-64 rounded-full opacity-40 blur-3xl"
        style={{ background: "var(--primary-dim)" }}
      />
      <div
        className="pointer-events-none absolute -right-20 top-72 h-56 w-56 rounded-full opacity-30 blur-3xl"
        style={{ background: "var(--gold-dim)" }}
      />

      <div className="relative mx-auto max-w-[420px] px-5 pb-20 pt-28 sm:px-6 sm:pt-32">
        <motion.article
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-[1.35rem]"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            boxShadow:
              "0 24px 50px -28px rgba(86, 47, 24, 0.45), 0 8px 18px -12px rgba(86, 47, 24, 0.18)",
          }}
        >
          <div className="px-5 pb-2 pt-5">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                style={{
                  background: "var(--gold-dim)",
                  color: "var(--gold)",
                }}
              >
                <Check className="h-3 w-3" strokeWidth={3} />
                {waitlist
                  ? "Waitlisted"
                  : isDeposit
                    ? "Deposit paid"
                    : "Booking confirmed"}
              </span>
              {destination && (
                <span
                  className="inline-flex items-center gap-1 text-xs font-medium"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  {destination}
                </span>
              )}
            </div>
            <h2
              className="font-display text-xl font-bold leading-snug tracking-tight"
              style={{ color: "var(--text)" }}
            >
              {title}
            </h2>
            {organizerName && (
              <p
                className="mt-1.5 text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                Hosted by {organizerName}
              </p>
            )}

            {hasDates && (
              <div
                className="mt-4 grid grid-cols-2 gap-3 rounded-xl px-3.5 py-3"
                style={{ background: "var(--bg-secondary)" }}
              >
                <div>
                  <p
                    className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.14em]"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    <Calendar className="h-3 w-3" />
                    Starts
                  </p>
                  <p
                    className="mt-1 text-sm font-semibold"
                    style={{ color: "var(--text)" }}
                  >
                    {startDate ? formatDate(startDate) : "—"}
                  </p>
                </div>
                <div
                  className="border-l pl-3.5"
                  style={{ borderColor: "var(--border)" }}
                >
                  <p
                    className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.14em]"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    <Calendar className="h-3 w-3" />
                    Ends
                  </p>
                  <p
                    className="mt-1 text-sm font-semibold"
                    style={{ color: "var(--text)" }}
                  >
                    {endDate ? formatDate(endDate) : "—"}
                  </p>
                </div>
              </div>
            )}

            <dl className="mt-4">
              <DetailRow
                label="Duration"
                value={
                  resolvedDuration
                    ? `${resolvedDuration} ${resolvedDuration === 1 ? "day" : "days"}`
                    : undefined
                }
              />
              <DetailRow label="Meeting point" value={meetingPoint} />
              <DetailRow
                label="Party"
                value={
                  bookingType
                    ? `${BOOKING_TYPE_LABEL[bookingType]}${
                        partySize ? ` · ${partySize}` : ""
                      }`
                    : partySize
                      ? `${partySize} ${partySize === 1 ? "traveler" : "travelers"}`
                      : undefined
                }
              />
              {namedGuests.length > 0 ? (
                <DetailRow
                  label="Travelers"
                  value={
                    <span className="inline-flex flex-col items-end gap-0.5">
                      {namedGuests.map((g, i) => (
                        <span key={`${g.fullName}-${i}`}>
                          {g.fullName}
                          {g.isLead ? (
                            <span
                              className="ml-1 text-[11px] font-normal"
                              style={{ color: "var(--text-tertiary)" }}
                            >
                              (lead)
                            </span>
                          ) : null}
                        </span>
                      ))}
                    </span>
                  }
                />
              ) : partySize ? (
                <DetailRow
                  label="Travelers"
                  value={
                    <span className="inline-flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" />
                      {partySize} {partySize === 1 ? "traveler" : "travelers"}
                    </span>
                  }
                />
              ) : null}
              <DetailRow
                label="Add-ons"
                value={
                  selectedAddOns.length > 0 ? (
                    <span className="inline-flex flex-col items-end gap-0.5">
                      {selectedAddOns.map((a, i) => (
                        <span key={`${a.name}-${i}`}>
                          {a.name}
                          {a.perPerson ? " (pp)" : ""}
                          {a.quantity && a.quantity > 1
                            ? ` ×${a.quantity}`
                            : ""}
                          {typeof a.lineTotal === "number"
                            ? ` · ${formatCurrency(a.lineTotal, currency)}`
                            : ""}
                        </span>
                      ))}
                    </span>
                  ) : undefined
                }
              />
              <DetailRow label="Location" value={details?.location} />
              <DetailRow label="WhatsApp" value={details?.whatsapp} />
              {!waitlist && (paymentStatusLabel || paymentMethodLabel) ? (
                <DetailRow
                  label="Payment"
                  value={
                    <span className="inline-flex flex-col items-end gap-0.5">
                      {paymentStatusLabel ? (
                        <span>{paymentStatusLabel}</span>
                      ) : null}
                      {paymentMethodLabel ? (
                        <span
                          className="text-[11px] font-normal"
                          style={{ color: "var(--text-tertiary)" }}
                        >
                          via {paymentMethodLabel}
                        </span>
                      ) : null}
                      {paidAt ? (
                        <span
                          className="text-[11px] font-normal"
                          style={{ color: "var(--text-tertiary)" }}
                        >
                          {formatDate(paidAt)}
                        </span>
                      ) : null}
                    </span>
                  }
                />
              ) : null}
            </dl>
          </div>

          <div className="relative my-4">
            <TicketNotch side="left" />
            <TicketNotch side="right" />
            <div
              className="mx-5 border-t border-dashed"
              style={{ borderColor: "var(--border-strong)" }}
            />
          </div>

          <div className="space-y-3.5 px-5 pb-5">
            {!waitlist && totalAmount > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <p
                    className="text-[10px] font-semibold uppercase tracking-[0.14em]"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    Pricing
                  </p>
                  <span
                    className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
                    style={{
                      background: "var(--gold-dim)",
                      color: "var(--gold)",
                    }}
                  >
                    {isDeposit
                      ? "Deposit paid"
                      : paymentStatus === "pending"
                        ? "Pending"
                        : "Paid"}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <MoneyRow
                    label="Trip"
                    amount={tripSubtotal}
                    currency={currency}
                    muted
                  />
                  <MoneyRow
                    label="Add-ons"
                    amount={addOnsTotal}
                    currency={currency}
                    muted
                  />
                  <MoneyRow
                    label="Total"
                    amount={totalAmount}
                    currency={currency}
                    emphasize
                  />
                  {(amountPaid != null || depositTotal != null) && (
                    <div
                      className="my-1 border-t border-dashed"
                      style={{ borderColor: "var(--border)" }}
                    />
                  )}
                  <MoneyRow
                    label={isDeposit ? "Deposit paid" : "Amount paid"}
                    amount={amountPaid ?? depositTotal}
                    currency={currency}
                  />
                  <MoneyRow
                    label={
                      balanceDueDate
                        ? `Balance due · ${formatDate(balanceDueDate)}`
                        : "Balance due"
                    }
                    amount={balanceDue}
                    currency={currency}
                    emphasize
                  />
                </div>

                {paymentNote ? (
                  <p
                    className="pt-1 text-xs leading-relaxed"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    {paymentNote}
                  </p>
                ) : null}
              </div>
            )}

            {displayReference && (
              <div
                className="flex items-center justify-between gap-3 rounded-xl px-3.5 py-3"
                style={{ background: "var(--bg-secondary)" }}
              >
                <div className="min-w-0">
                  <p
                    className="text-[10px] font-semibold uppercase tracking-[0.14em]"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    Booking reference
                  </p>
                  <p
                    className="mt-0.5 truncate font-mono text-xs font-medium"
                    style={{ color: "var(--text)" }}
                  >
                    {displayReference}
                  </p>
                </div>
                <button
                  type="button"
                  data-receipt-hide
                  onClick={() => void copyRef()}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-opacity hover:opacity-80"
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    color: "var(--text-secondary)",
                  }}
                  aria-label="Copy booking reference"
                >
                  {copied ? (
                    <Check
                      className="h-3.5 w-3.5"
                      style={{ color: "var(--primary)" }}
                    />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            )}

            <p
              className="text-center text-[10px] font-medium uppercase tracking-[0.16em]"
              style={{ color: "var(--text-tertiary)" }}
            >
              VaybeEx booking receipt
            </p>
          </div>
        </motion.article>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.35 }}
          className="mt-7 flex flex-col gap-2.5"
        >
          {dashboardAsExternal ? (
            <a
              href={dashboardHref}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl text-base font-semibold transition-opacity hover:opacity-90"
              style={{ background: "var(--primary)", color: "#fbf7f1" }}
            >
              View my bookings
              <ArrowRight className="h-4 w-4" />
            </a>
          ) : (
            <Link
              href={dashboardHref}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl text-base font-semibold transition-opacity hover:opacity-90"
              style={{ background: "var(--primary)", color: "#fbf7f1" }}
            >
              View my bookings
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
          <Link
            href={tripHref}
            className="block text-center text-sm font-medium transition-colors hover:opacity-80"
            style={{ color: "var(--text-tertiary)" }}
          >
            Back to trip
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

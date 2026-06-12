"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  getOrganizerTrips, getTripAttendees, getPayoutByTripId,
} from "@/lib/mock-data";
import type { PaymentMethod, TripAttendee } from "@/lib/types";
import { formatCurrency, formatDate, formatDateRange } from "@/lib/utils";
import { cn } from "@/lib/utils";

const ORGANIZER_ID = "org-1";

const paymentMethodLabels: Record<PaymentMethod, string> = {
  card: "Card",
  mtn: "MTN MoMo",
  vodafone: "Vodafone Cash",
  airteltigo: "AirtelTigo Money",
  bank: "Bank Transfer",
  installment: "Installment",
};

type PaymentFilter = "all" | "paid" | "partial" | "pending";

const filterLabels: Record<PaymentFilter, string> = {
  all: "All",
  paid: "Paid",
  partial: "Partial",
  pending: "Pending",
};

function statusClass(status: TripAttendee["paymentStatus"]) {
  if (status === "paid") return "text-emerald-700";
  if (status === "partial") return "text-amber-700";
  return "text-stone-500";
}

function payoutStatusClass(status: "completed" | "processing" | "pending") {
  if (status === "completed") return "text-emerald-700";
  if (status === "processing") return "text-amber-700";
  return "text-stone-500";
}

function MemberRow({ attendee }: { attendee: TripAttendee }) {
  return (
    <tr className="border-b border-stone-100 last:border-0">
      <td className="py-3 pl-4 pr-4 font-medium text-stone-900">{attendee.name}</td>
      <td className="py-3 pr-4 text-stone-500 hidden sm:table-cell">
        <span className="block">{attendee.email}</span>
        <span className="text-xs text-stone-400">{attendee.phone}</span>
      </td>
      <td className="py-3 pr-4 text-stone-500 hidden md:table-cell">
        {attendee.paymentMethod ? paymentMethodLabels[attendee.paymentMethod] : "—"}
      </td>
      <td className="py-3 pr-4 text-stone-500 hidden lg:table-cell">
        {attendee.paidAt ? formatDate(attendee.paidAt) : "—"}
      </td>
      <td className={cn("py-3 pr-4 capitalize", statusClass(attendee.paymentStatus))}>
        {attendee.paymentStatus}
      </td>
      <td className="py-3 pr-4 text-right tabular-nums">
        <span className="font-medium text-stone-900">{formatCurrency(attendee.amountPaid)}</span>
        {attendee.paymentStatus !== "paid" && (
          <span className="block text-xs text-stone-400">of {formatCurrency(attendee.amountDue)}</span>
        )}
      </td>
    </tr>
  );
}

export default function PayoutsPage() {
  const searchParams = useSearchParams();
  const myTrips = useMemo(() => getOrganizerTrips(ORGANIZER_ID), []);
  const tripsWithBookings = myTrips.filter((t) => t.booked > 0);
  const [selectedTripId, setSelectedTripId] = useState(
    tripsWithBookings[0]?.id ?? myTrips[0]?.id ?? ""
  );
  const [filter, setFilter] = useState<PaymentFilter>("all");

  useEffect(() => {
    const tripFromUrl = searchParams.get("trip");
    if (tripFromUrl && myTrips.some((t) => t.id === tripFromUrl)) {
      setSelectedTripId(tripFromUrl);
    }
  }, [searchParams, myTrips]);

  const selectedTrip = myTrips.find((t) => t.id === selectedTripId);
  const attendees = selectedTripId ? getTripAttendees(selectedTripId) : [];
  const payout = selectedTripId ? getPayoutByTripId(selectedTripId) : undefined;

  const paid = attendees.filter((a) => a.paymentStatus === "paid");
  const partial = attendees.filter((a) => a.paymentStatus === "partial");
  const unpaid = attendees.filter((a) => a.paymentStatus === "pending");

  const collected = attendees.reduce((s, a) => s + a.amountPaid, 0);
  const outstanding = attendees.reduce((s, a) => s + (a.amountDue - a.amountPaid), 0);
  const grossRevenue = selectedTrip ? selectedTrip.price * selectedTrip.booked : 0;

  const filteredAttendees =
    filter === "all"
      ? attendees
      : attendees.filter((a) => a.paymentStatus === filter);

  const filterCounts: Record<PaymentFilter, number> = {
    all: attendees.length,
    paid: paid.length,
    partial: partial.length,
    pending: unpaid.length,
  };

  return (
    <div className="p-6 lg:p-8 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 pb-6 border-b border-stone-200">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900 tracking-tight">Payouts</h1>
          <p className="text-sm text-stone-500 mt-1">
            Earnings and member payments by trip.
          </p>
        </div>
        <Select value={selectedTripId} onValueChange={(id) => { setSelectedTripId(id); setFilter("all"); }}>
          <SelectTrigger className="w-full sm:w-72 bg-white">
            <SelectValue placeholder="Select a trip" />
          </SelectTrigger>
          <SelectContent>
            {myTrips.map((trip) => (
              <SelectItem key={trip.id} value={trip.id}>
                {trip.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!selectedTrip ? (
        <p className="text-sm text-stone-500">Select a trip to view payouts.</p>
      ) : (
        <div className="space-y-8">
          {/* Trip summary */}
          <section>
            <h2 className="text-lg font-medium text-stone-900">{selectedTrip.title}</h2>
            <p className="text-sm text-stone-500 mt-0.5">
              {formatDateRange(selectedTrip.startDate, selectedTrip.endDate)}
              {" · "}
              {selectedTrip.destination}
              {" · "}
              {formatCurrency(selectedTrip.price)} per ticket
              {" · "}
              {selectedTrip.booked}/{selectedTrip.capacity} booked
            </p>

            <dl className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-6 text-sm">
              <div>
                <dt className="text-stone-500">Collected</dt>
                <dd className="mt-1 text-xl font-semibold text-stone-900 tabular-nums">
                  {formatCurrency(collected)}
                </dd>
              </div>
              <div>
                <dt className="text-stone-500">Outstanding</dt>
                <dd className="mt-1 text-xl font-semibold text-stone-900 tabular-nums">
                  {formatCurrency(outstanding)}
                </dd>
              </div>
              <div>
                <dt className="text-stone-500">Paid members</dt>
                <dd className="mt-1 text-xl font-semibold text-stone-900 tabular-nums">
                  {paid.length}
                </dd>
              </div>
              <div>
                <dt className="text-stone-500">Awaiting payment</dt>
                <dd className="mt-1 text-xl font-semibold text-stone-900 tabular-nums">
                  {partial.length + unpaid.length}
                </dd>
              </div>
            </dl>

            <div className="mt-6 pt-6 border-t border-stone-100 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-stone-500">Potential revenue</span>
                <span className="text-stone-900 tabular-nums">{formatCurrency(grossRevenue)}</span>
              </div>
              {payout ? (
                <div className="flex justify-between">
                  <span className="text-stone-500">
                    Withdrawal · {formatDate(payout.date)}
                  </span>
                  <span className={cn("tabular-nums capitalize", payoutStatusClass(payout.status))}>
                    {formatCurrency(payout.amount)} · {payout.status}
                  </span>
                </div>
              ) : (
                <p className="text-stone-400">No withdrawal scheduled for this trip yet.</p>
              )}
            </div>
          </section>

          {/* Member payments */}
          <section>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h3 className="text-base font-medium text-stone-900">Member payments</h3>
              <div className="flex gap-1 text-sm">
                {(Object.keys(filterLabels) as PaymentFilter[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFilter(key)}
                    className={cn(
                      "px-3 py-1 rounded-md transition-colors",
                      filter === key
                        ? "bg-stone-900 text-white"
                        : "text-stone-500 hover:text-stone-900 hover:bg-stone-100"
                    )}
                  >
                    {filterLabels[key]} ({filterCounts[key]})
                  </button>
                ))}
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                {filteredAttendees.length === 0 ? (
                  <p className="p-8 text-sm text-stone-500 text-center">
                    {attendees.length === 0
                      ? "No bookings yet for this trip."
                      : `No ${filter === "all" ? "" : filter} members.`}
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-stone-200 text-left text-stone-500">
                          <th className="py-3 pr-4 pl-4 font-medium">Name</th>
                          <th className="py-3 pr-4 font-medium hidden sm:table-cell">Contact</th>
                          <th className="py-3 pr-4 font-medium hidden md:table-cell">Method</th>
                          <th className="py-3 pr-4 font-medium hidden lg:table-cell">Paid on</th>
                          <th className="py-3 pr-4 font-medium">Status</th>
                          <th className="py-3 pr-4 font-medium text-right w-28">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAttendees.map((a) => (
                          <MemberRow key={a.id} attendee={a} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          <div className="flex justify-end pt-2">
            <Link
              href="/organizer/withdrawals"
              className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-900 transition-colors"
            >
              Withdrawal history <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

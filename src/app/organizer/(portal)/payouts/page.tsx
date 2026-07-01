"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight, ArrowUpDown, ArrowUp, ArrowDown, Search, Download,
  TrendingUp, TrendingDown, Wallet, Clock, Users, CheckCircle2,
  XCircle, AlertCircle, Calendar,
} from "lucide-react";
import {
  useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel,
  getPaginationRowModel, flexRender, createColumnHelper, type SortingState,
} from "@tanstack/react-table";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  getOrganizerTrips, getTripAttendees, getPayoutByTripId,
} from "@/lib/mock-data";
import type { PaymentMethod, TripAttendee } from "@/lib/types";
import { formatCurrency, formatDate, formatDateRange, cn } from "@/lib/utils";
import { PaymentMethodBreakdown } from "./paymentmethodbreakdown";

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
  all: "All", paid: "Paid", partial: "Partial", pending: "Pending",
};

type DateRangeFilter = "all" | "7d" | "30d" | "90d";
const dateRangeLabels: Record<DateRangeFilter, string> = {
  all: "All time", "7d": "Last 7 days", "30d": "Last 30 days", "90d": "Last 90 days",
};

function payoutStatusMeta(status: "completed" | "processing" | "pending") {
  if (status === "completed") return { label: "Success",    color: "var(--gold)",          bg: "var(--gold-dim)",              Icon: CheckCircle2 };
  if (status === "processing") return { label: "Processing", color: "var(--amber)",         bg: "rgba(208,138,60,0.14)",        Icon: Clock };
  return                              { label: "Pending",    color: "var(--text-tertiary)", bg: "var(--bg-secondary)",          Icon: AlertCircle };
}

function paymentStatusMeta(status: TripAttendee["paymentStatus"]) {
  if (status === "paid")    return { label: "Paid",    color: "var(--gold)",  bg: "var(--gold-dim)",         Icon: CheckCircle2 };
  if (status === "partial") return { label: "Partial", color: "var(--amber)", bg: "rgba(208,138,60,0.14)",   Icon: Clock };
  return                           { label: "Pending", color: "var(--coral)", bg: "rgba(181,82,58,0.1)",     Icon: XCircle };
}

const AVATAR_PALETTE = ["var(--primary)", "var(--gold)", "var(--coral)", "var(--amber)"];
function avatarColorFor(name: string) {
  const sum = name.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  return AVATAR_PALETTE[sum % AVATAR_PALETTE.length];
}
function initialsFor(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

function msFromRange(range: DateRangeFilter): number | null {
  if (range === "7d")  return 7  * 86400000;
  if (range === "30d") return 30 * 86400000;
  if (range === "90d") return 90 * 86400000;
  return null;
}

/* ─── StatCard — defined outside the page so it never re-infers ── */
interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  sub: string;
  trend: "up" | "down" | "neutral";
}
function StatCard({ icon: Icon, label, value, sub, trend }: StatCardProps) {
  return (
    <Card
      className="border shadow-none transition-all duration-200 hover:-translate-y-0.5"
      style={{ borderColor: "var(--border)", background: "var(--surface)" }}
    >
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
            {label}
          </span>
          <div
            className="flex h-8 w-8 items-center justify-center rounded-xl"
            style={{ background: "var(--primary-dim)" }}
          >
            <Icon className="h-4 w-4" style={{ color: "var(--primary)" }} />
          </div>
        </div>
        <p
          className="mt-3 font-display text-2xl font-bold tabular-nums"
          style={{ color: "var(--text)" }}
        >
          {value}
        </p>
        <div
          className="mt-1.5 flex items-center gap-1 text-xs font-medium"
          style={{
            color:
              trend === "up"
                ? "var(--gold)"
                : trend === "down"
                ? "var(--coral)"
                : "var(--text-tertiary)",
          }}
        >
          {trend === "up"   && <TrendingUp   className="h-3 w-3" />}
          {trend === "down" && <TrendingDown className="h-3 w-3" />}
          {sub}
        </div>
      </CardContent>
    </Card>
  );
}

/* ─── Column helper — outside component so reference is stable ─── */
const columnHelper = createColumnHelper<TripAttendee>();

const TABLE_COLUMNS = [
  columnHelper.accessor("name", {
    header: "Attendee",
    cell: (info) => {
      const a = info.row.original;
      return (
        <div className="flex items-center gap-3">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{ background: avatarColorFor(a.name) }}
          >
            {initialsFor(a.name)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium" style={{ color: "var(--text)" }}>
              {a.name}
            </p>
            <p className="truncate text-xs" style={{ color: "var(--text-tertiary)" }}>
              {a.email}
            </p>
          </div>
        </div>
      );
    },
  }),
  columnHelper.accessor("phone", {
    header: "Contact",
    cell: (info) => (
      <span className="text-sm" style={{ color: "var(--text-tertiary)" }}>
        {info.getValue() || "—"}
      </span>
    ),
    meta: { className: "hidden sm:table-cell" },
  }),
  columnHelper.accessor("paymentMethod", {
    header: "Method",
    cell: (info) => {
      const v = info.getValue();
      return (
        <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
          {v ? paymentMethodLabels[v] : "—"}
        </span>
      );
    },
    meta: { className: "hidden md:table-cell" },
  }),
  columnHelper.accessor("paidAt", {
    header: "Paid on",
    cell: (info) => {
      const v = info.getValue();
      return (
        <span className="text-sm" style={{ color: "var(--text-tertiary)" }}>
          {v ? formatDate(v) : "—"}
        </span>
      );
    },
    sortingFn: (a, b) => {
      const av = a.original.paidAt ? new Date(a.original.paidAt).getTime() : 0;
      const bv = b.original.paidAt ? new Date(b.original.paidAt).getTime() : 0;
      return av - bv;
    },
    meta: { className: "hidden lg:table-cell" },
  }),
  columnHelper.accessor("paymentStatus", {
    header: "Status",
    cell: (info) => {
      const meta = paymentStatusMeta(info.getValue());
      return (
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
          style={{ background: meta.bg, color: meta.color }}
        >
          <meta.Icon className="h-3 w-3" />
          {meta.label}
        </span>
      );
    },
  }),
  columnHelper.accessor("amountPaid", {
    header: "Amount",
    cell: (info) => {
      const a = info.row.original;
      return (
        <div className="text-right tabular-nums">
          <span className="font-semibold" style={{ color: "var(--text)" }}>
            {formatCurrency(a.amountPaid)}
          </span>
          {a.paymentStatus !== "paid" && (
            <span className="block text-xs" style={{ color: "var(--text-tertiary)" }}>
              of {formatCurrency(a.amountDue)}
            </span>
          )}
        </div>
      );
    },
    meta: { className: "text-right" },
  }),
];

/* ─── Page ─────────────────────────────────────────────────────── */
export default function PayoutsPage() {
  const searchParams = useSearchParams();
  const myTrips = useMemo(() => getOrganizerTrips(ORGANIZER_ID), []);
  const tripsWithBookings = useMemo(() => myTrips.filter((t) => t.booked > 0), [myTrips]);

  const [selectedTripIdOverride, setSelectedTripIdOverride] = useState<string | null>(null);
  const tripFromUrl = searchParams.get("trip");
  const selectedTripId = useMemo(() => (
    selectedTripIdOverride ??
    (tripFromUrl && myTrips.some((t) => t.id === tripFromUrl)
      ? tripFromUrl
      : tripsWithBookings[0]?.id ?? myTrips[0]?.id ?? "")
  ), [selectedTripIdOverride, tripFromUrl, myTrips, tripsWithBookings]);

  const [filter, setFilter]           = useState<PaymentFilter>("all");
  const [dateRange, setDateRange]     = useState<DateRangeFilter>("all");
  const [globalSearch, setGlobalSearch] = useState("");
  const [sorting, setSorting]         = useState<SortingState>([{ id: "amountPaid", desc: true }]);

  const selectedTrip = useMemo(
    () => myTrips.find((t) => t.id === selectedTripId),
    [myTrips, selectedTripId]
  );
  const attendees = useMemo(
    () => (selectedTripId ? getTripAttendees(selectedTripId) : []),
    [selectedTripId]
  );
  const payout = useMemo(
    () => (selectedTripId ? getPayoutByTripId(selectedTripId) : undefined),
    [selectedTripId]
  );

  /* Derived counts — stable references */
  const paid    = useMemo(() => attendees.filter((a) => a.paymentStatus === "paid"),    [attendees]);
  const partial = useMemo(() => attendees.filter((a) => a.paymentStatus === "partial"), [attendees]);
  const unpaid  = useMemo(() => attendees.filter((a) => a.paymentStatus === "pending"), [attendees]);

  const collected    = useMemo(() => attendees.reduce((s, a) => s + a.amountPaid, 0), [attendees]);
  const outstanding  = useMemo(() => attendees.reduce((s, a) => s + (a.amountDue - a.amountPaid), 0), [attendees]);
  const grossRevenue = useMemo(() => (selectedTrip ? selectedTrip.price * selectedTrip.booked : 0), [selectedTrip]);
  const collectionPct = grossRevenue > 0 ? Math.round((collected / grossRevenue) * 100) : 0;

  const filterCounts: Record<PaymentFilter, number> = {
    all: attendees.length,
    paid: paid.length,
    partial: partial.length,
    pending: unpaid.length,
  };

  /* Status + date filter applied once, result memoised */
  const tableData = useMemo(() => {
    const statusFiltered =
      filter === "all" ? attendees : attendees.filter((a) => a.paymentStatus === filter);
    const windowMs = msFromRange(dateRange);
    if (windowMs === null) return statusFiltered;
    const cutoff = Date.now() - windowMs;
    return statusFiltered.filter((a) => {
      if (!a.paidAt) return false;
      return new Date(a.paidAt).getTime() >= cutoff;
    });
  }, [attendees, filter, dateRange]);

  /* TanStack Table — columns reference is stable (defined outside component) */
  const table = useReactTable({
    data: tableData,
    columns: TABLE_COLUMNS,
    state: { sorting, globalFilter: globalSearch },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalSearch,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: (row, _columnId, value) => {
      const a = row.original;
      const q = (value as string).toLowerCase();
      return (
        a.name.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        (a.phone ?? "").toLowerCase().includes(q)
      );
    },
    initialState: { pagination: { pageSize: 8 } },
  });

  const rows = table.getRowModel().rows;

  return (
    <div
      className="w-full px-4 py-8 sm:px-6 lg:px-10 lg:py-10"
      style={{ background: "var(--bg)" }}
    >
      {/* ── Page header ─────────────────────────────────────────── */}
      <div
        className="mb-8 flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between"
        style={{ borderColor: "var(--border)" }}
      >
        <div>
          <h1
            className="font-display text-2xl font-bold tracking-tight"
            style={{ color: "var(--text)" }}
          >
            Payouts
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
            Earnings and member payments by trip.
          </p>
        </div>

        <Select
          value={selectedTripId}
          onValueChange={(id) => {
            setSelectedTripIdOverride(id);
            setFilter("all");
            setDateRange("all");
            setGlobalSearch("");
          }}
        >
          <SelectTrigger
            className="w-full rounded-xl sm:w-72"
            style={{ borderColor: "var(--border-strong)", background: "var(--surface)" }}
          >
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
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Select a trip to view payouts.
        </p>
      ) : (
        <div className="space-y-10">

          {/* ── Trip summary ────────────────────────────────────── */}
          <section>
            <h2
              className="font-display text-lg font-semibold"
              style={{ color: "var(--text)" }}
            >
              {selectedTrip.title}
            </h2>
            <p className="mt-0.5 text-sm" style={{ color: "var(--text-secondary)" }}>
              {formatDateRange(selectedTrip.startDate, selectedTrip.endDate)}
              {" · "}{selectedTrip.destination}
              {" · "}{formatCurrency(selectedTrip.price)} per ticket
              {" · "}{selectedTrip.booked}/{selectedTrip.capacity} booked
            </p>

            {/* Stat cards */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard icon={Wallet}      label="Collected"         value={formatCurrency(collected)}          sub={`${collectionPct}% of potential`}                       trend="up" />
              <StatCard icon={Clock}       label="Outstanding"       value={formatCurrency(outstanding)}        sub={outstanding > 0 ? "Awaiting payment" : "Fully collected"} trend={outstanding > 0 ? "down" : "up"} />
              <StatCard icon={Users}       label="Paid members"      value={String(paid.length)}               sub={`of ${attendees.length} total`}                          trend="neutral" />
              <StatCard icon={AlertCircle} label="Awaiting payment"  value={String(partial.length + unpaid.length)} sub={`${partial.length} partial · ${unpaid.length} pending`} trend={partial.length + unpaid.length > 0 ? "down" : "up"} />
            </div>

            {/* Collection progress + withdrawal */}
            <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_300px]">
              <Card
                className="border shadow-none"
                style={{ borderColor: "var(--border)", background: "var(--surface)" }}
              >
                <CardContent className="p-5">
                  <div className="mb-2 flex justify-between text-sm">
                    <span style={{ color: "var(--text-secondary)" }}>Collection progress</span>
                    <span className="font-semibold" style={{ color: "var(--text)" }}>
                      {collectionPct}%
                    </span>
                  </div>
                  <div
                    className="h-2.5 overflow-hidden rounded-full"
                    style={{ background: "var(--border)" }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${collectionPct}%`,
                        background: "var(--gradient-brand)",
                      }}
                    />
                  </div>
                  <div
                    className="mt-2 flex justify-between text-xs"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    <span>{formatCurrency(collected)} collected</span>
                    <span>{formatCurrency(grossRevenue)} potential</span>
                  </div>
                </CardContent>
              </Card>

              <Card
                className="border shadow-none"
                style={{ borderColor: "var(--border)", background: "var(--surface)" }}
              >
                <CardContent className="p-5">
                  <p className="mb-1 text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                    Withdrawal
                  </p>
                  {payout ? (
                    (() => {
                      const meta = payoutStatusMeta(payout.status);
                      return (
                        <>
                          <p
                            className="font-display text-xl font-bold"
                            style={{ color: "var(--text)" }}
                          >
                            {formatCurrency(payout.amount)}
                          </p>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                              {formatDate(payout.date)}
                            </span>
                            <span
                              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
                              style={{ background: meta.bg, color: meta.color }}
                            >
                              <meta.Icon className="h-3 w-3" />
                              {meta.label}
                            </span>
                          </div>
                        </>
                      );
                    })()
                  ) : (
                    <p className="mt-2 text-sm" style={{ color: "var(--text-tertiary)" }}>
                      No withdrawal scheduled for this trip yet.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </section>

          <PaymentMethodBreakdown attendees={attendees} />

          {/* ── Member payments table ────────────────────────────── */}
          <section>
            <div className="mb-5 flex flex-col gap-3">
              {/* Row 1: heading + search + date range + export */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3
                  className="font-display text-base font-semibold"
                  style={{ color: "var(--text)" }}
                >
                  Member payments
                </h3>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Search */}
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2"
                      style={{ color: "var(--text-tertiary)" }}
                    />
                    <Input
                      value={globalSearch}
                      onChange={(e) => setGlobalSearch(e.target.value)}
                      placeholder="Search name, email, phone…"
                      className="h-9 w-52 rounded-xl pl-9 text-sm"
                      style={{ borderColor: "var(--border-strong)" }}
                    />
                  </div>

                  {/* Date range */}
                  <Select
                    value={dateRange}
                    onValueChange={(v) => setDateRange(v as DateRangeFilter)}
                  >
                    <SelectTrigger
                      className="h-9 w-40 rounded-xl text-sm"
                      style={{ borderColor: "var(--border-strong)", background: "var(--surface)" }}
                    >
                      <Calendar className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--text-tertiary)" }} />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(dateRangeLabels) as DateRangeFilter[]).map((key) => (
                        <SelectItem key={key} value={key}>
                          {dateRangeLabels[key]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Export button — pure CSS hover, no inline mutation */}
                  <button
                    type="button"
                    className="flex h-9 items-center gap-1.5 rounded-xl border px-3 text-sm transition-colors hover:bg-[var(--bg-secondary)]"
                    style={{
                      borderColor: "var(--border-strong)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    <Download className="h-3.5 w-3.5" />
                    Export
                  </button>
                </div>
              </div>

              {/* Row 2: status filter pills */}
              <div className="flex flex-wrap gap-1">
                {(Object.keys(filterLabels) as PaymentFilter[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFilter(key)}
                    className="rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-150"
                    style={{
                      background:
                        filter === key ? "var(--gradient-brand)" : "var(--bg-secondary)",
                      color:
                        filter === key ? "#fbf7f1" : "var(--text-secondary)",
                      border:
                        filter === key
                          ? "1px solid transparent"
                          : "1px solid var(--border)",
                    }}
                  >
                    {filterLabels[key]}{" "}
                    <span
                      style={{
                        opacity: 0.75,
                        fontSize: "0.7rem",
                      }}
                    >
                      ({filterCounts[key]})
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Table card — extra padding around the table itself */}
            <Card
              className="border shadow-none"
              style={{ borderColor: "var(--border)", background: "var(--surface)" }}
            >
              <CardContent className="p-0">
                {rows.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Search className="mb-3 h-7 w-7" style={{ color: "var(--text-tertiary)" }} />
                    <p className="font-medium" style={{ color: "var(--text-secondary)" }}>
                      {attendees.length === 0
                        ? "No bookings yet for this trip."
                        : globalSearch
                        ? `No members match "${globalSearch}".`
                        : `No ${filter === "all" ? "" : filter} members in this period.`}
                    </p>
                  </div>
                ) : (
                  <>
                    {/*
                      The padding px-4 py-0 on the wrapper gives breathing room
                      around the table edges. Overflow-x-auto lets it scroll on
                      narrow viewports without stretching the card.
                    */}
                    <div className="overflow-x-auto px-4 pt-4 pb-2">
                      <table className="w-full text-sm">
                        <thead>
                          {table.getHeaderGroups().map((headerGroup) => (
                            <tr
                              key={headerGroup.id}
                              className="border-b"
                              style={{ borderColor: "var(--border)" }}
                            >
                              {headerGroup.headers.map((header) => {
                                const meta = header.column.columnDef.meta as
                                  | { className?: string }
                                  | undefined;
                                const sortDir = header.column.getIsSorted();
                                return (
                                  <th
                                    key={header.id}
                                    className={cn(
                                      "py-3 pl-3 pr-4 text-left font-semibold select-none text-xs uppercase tracking-wider",
                                      header.column.getCanSort() && "cursor-pointer",
                                      meta?.className
                                    )}
                                    style={{ color: "var(--text-tertiary)" }}
                                    onClick={header.column.getToggleSortingHandler()}
                                  >
                                    <span className="inline-flex items-center gap-1">
                                      {flexRender(
                                        header.column.columnDef.header,
                                        header.getContext()
                                      )}
                                      {header.column.getCanSort() &&
                                        (sortDir === "asc" ? (
                                          <ArrowUp className="h-3 w-3" />
                                        ) : sortDir === "desc" ? (
                                          <ArrowDown className="h-3 w-3" />
                                        ) : (
                                          <ArrowUpDown className="h-3 w-3 opacity-35" />
                                        ))}
                                    </span>
                                  </th>
                                );
                              })}
                            </tr>
                          ))}
                        </thead>

                        {/*
                          KEY FIX: removed onMouseEnter/onMouseLeave from <tr>.
                          Row hover is handled purely via CSS hover:bg-* class —
                          no JS event handlers, no inline style mutation, no
                          layout recalculation on mouse movement.
                        */}
                        <tbody>
                          {rows.map((row) => (
                            <tr
                              key={row.id}
                              className="border-b transition-colors last:border-0 hover:bg-[var(--bg-secondary)]"
                              style={{ borderColor: "var(--border-subtle)" }}
                            >
                              {row.getVisibleCells().map((cell) => {
                                const meta = cell.column.columnDef.meta as
                                  | { className?: string }
                                  | undefined;
                                return (
                                  <td
                                    key={cell.id}
                                    className={cn("py-3.5 pl-3 pr-4", meta?.className)}
                                  >
                                    {flexRender(
                                      cell.column.columnDef.cell,
                                      cell.getContext()
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    {table.getPageCount() > 1 && (
                      <div
                        className="flex items-center justify-between border-t px-6 py-3"
                        style={{ borderColor: "var(--border)" }}
                      >
                        <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                          Page {table.getState().pagination.pageIndex + 1} of{" "}
                          {table.getPageCount()} ·{" "}
                          {table.getFilteredRowModel().rows.length} results
                        </span>
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                            className="rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-[var(--bg-secondary)] disabled:opacity-40"
                            style={{
                              borderColor: "var(--border-strong)",
                              color: "var(--text-secondary)",
                            }}
                          >
                            Previous
                          </button>
                          <button
                            type="button"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                            className="rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-[var(--bg-secondary)] disabled:opacity-40"
                            style={{
                              borderColor: "var(--border-strong)",
                              color: "var(--text-secondary)",
                            }}
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </section>

          <div className="flex justify-end pt-2">
            <Link
              href="/organizer/withdrawals"
              className="inline-flex items-center gap-1.5 text-sm transition-colors hover:text-[var(--primary)]"
              style={{ color: "var(--text-secondary)" }}
            >
              Withdrawal history <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
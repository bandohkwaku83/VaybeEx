"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  Download,
  TrendingUp,
  TrendingDown,
  Wallet,
  Clock,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  Loader2,
  ArrowDownToLine,
} from "lucide-react";
import { toast } from "sonner";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from "@tanstack/react-table";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TripWithdrawDialog } from "@/components/organizer/trip-withdraw-dialog";
import { OrganizerEmptyState } from "@/components/organizer/empty-state";
import { OrganizerPortalTabs } from "@/components/organizer/portal-tabs";
import { ApiError } from "@/lib/api/client";
import {
  exportTripPayoutMembers,
  getTripPayoutDetail,
  listPayoutTrips,
  listTripPayoutMembers,
  mapPayoutMemberToAttendee,
  type PayoutPaymentFilter,
  type PayoutPeriodFilter,
  type PayoutTripListItem,
  type TripPayoutDetail,
} from "@/lib/api/organizer-payouts";
import type { PaymentMethod, TripAttendee } from "@/lib/types";
import { formatCurrency, formatDate, formatDateRange, cn } from "@/lib/utils";
import { PaymentMethodBreakdown } from "./paymentmethodbreakdown";

const paymentMethodLabels: Record<PaymentMethod, string> = {
  card: "Card",
  mtn: "MTN MoMo",
  vodafone: "Vodafone Cash",
  airteltigo: "AirtelTigo Money",
  bank: "Bank Transfer",
  installment: "Installment",
};

type PaymentFilter = PayoutPaymentFilter;
const filterLabels: Record<PaymentFilter, string> = {
  all: "All",
  paid: "Paid",
  partial: "Partial",
  pending: "Pending",
};

type DateRangeFilter = PayoutPeriodFilter;
const dateRangeLabels: Record<DateRangeFilter, string> = {
  all: "All time",
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
};

function payoutStatusMeta(status: string) {
  const s = status.toLowerCase();
  if (s === "completed" || s === "success") {
    return {
      label: "Success",
      color: "var(--gold)",
      bg: "var(--gold-dim)",
      Icon: CheckCircle2,
    };
  }
  if (s === "processing") {
    return {
      label: "Processing",
      color: "var(--amber)",
      bg: "rgba(208,138,60,0.14)",
      Icon: Clock,
    };
  }
  return {
    label: "Pending",
    color: "var(--text-tertiary)",
    bg: "var(--bg-secondary)",
    Icon: AlertCircle,
  };
}

function paymentStatusMeta(status: TripAttendee["paymentStatus"]) {
  if (status === "paid") {
    return {
      label: "Paid",
      color: "var(--gold)",
      bg: "var(--gold-dim)",
      Icon: CheckCircle2,
    };
  }
  if (status === "partial") {
    return {
      label: "Partial",
      color: "var(--amber)",
      bg: "rgba(208,138,60,0.14)",
      Icon: Clock,
    };
  }
  return {
    label: "Pending",
    color: "var(--coral)",
    bg: "rgba(181,82,58,0.1)",
    Icon: XCircle,
  };
}

const AVATAR_PALETTE = [
  "var(--primary)",
  "var(--gold)",
  "var(--coral)",
  "var(--amber)",
];
function avatarColorFor(name: string) {
  const sum = name.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  return AVATAR_PALETTE[sum % AVATAR_PALETTE.length];
}
function initialsFor(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

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
          <span
            className="text-xs font-medium uppercase tracking-wider"
            style={{ color: "var(--text-tertiary)" }}
          >
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
          {trend === "up" && <TrendingUp className="h-3 w-3" />}
          {trend === "down" && <TrendingDown className="h-3 w-3" />}
          {sub}
        </div>
      </CardContent>
    </Card>
  );
}

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
            <p
              className="truncate text-sm font-medium"
              style={{ color: "var(--text)" }}
            >
              {a.name}
            </p>
            <p
              className="truncate text-xs"
              style={{ color: "var(--text-tertiary)" }}
            >
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
            <span
              className="block text-xs"
              style={{ color: "var(--text-tertiary)" }}
            >
              of {formatCurrency(a.amountDue)}
            </span>
          )}
        </div>
      );
    },
    meta: { className: "text-right" },
  }),
];

function sortByFromSorting(sorting: SortingState): {
  sortBy: "paidOn" | "amountPaid" | "attendee" | "status";
  sortOrder: "asc" | "desc";
} {
  const first = sorting[0];
  if (!first) return { sortBy: "paidOn", sortOrder: "desc" };
  const map: Record<string, "paidOn" | "amountPaid" | "attendee" | "status"> = {
    paidAt: "paidOn",
    amountPaid: "amountPaid",
    name: "attendee",
    paymentStatus: "status",
  };
  return {
    sortBy: map[first.id] ?? "paidOn",
    sortOrder: first.desc ? "desc" : "asc",
  };
}

export default function PayoutsPage() {
  const searchParams = useSearchParams();
  const tripFromUrl = searchParams.get("trip");

  const [trips, setTrips] = useState<PayoutTripListItem[]>([]);
  const [tripsLoading, setTripsLoading] = useState(true);
  const [tripsError, setTripsError] = useState<string | null>(null);

  const [selectedTripIdOverride, setSelectedTripIdOverride] = useState<
    string | null
  >(null);
  const selectedTripId = useMemo(() => {
    if (selectedTripIdOverride) return selectedTripIdOverride;
    if (tripFromUrl && trips.some((t) => t.id === tripFromUrl)) {
      return tripFromUrl;
    }
    const withBookings = trips.find((t) => t.booked > 0);
    return withBookings?.id ?? trips[0]?.id ?? "";
  }, [selectedTripIdOverride, tripFromUrl, trips]);

  const [detail, setDetail] = useState<TripPayoutDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const [attendees, setAttendees] = useState<TripAttendee[]>([]);
  const [statusCounts, setStatusCounts] = useState({
    all: 0,
    paid: 0,
    partial: 0,
    pending: 0,
  });
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersPage, setMembersPage] = useState(1);
  const [membersPages, setMembersPages] = useState(1);
  const [membersTotal, setMembersTotal] = useState(0);

  const [filter, setFilter] = useState<PaymentFilter>("all");
  const [dateRange, setDateRange] = useState<DateRangeFilter>("all");
  const [globalSearch, setGlobalSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([
    { id: "paidAt", desc: true },
  ]);
  const [exporting, setExporting] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadTrips = useCallback(async () => {
    setTripsLoading(true);
    setTripsError(null);
    try {
      const res = await listPayoutTrips({ limit: 50 });
      setTrips(res.data?.trips ?? []);
    } catch (err) {
      setTrips([]);
      setTripsError(
        err instanceof ApiError
          ? err.message
          : "Could not load payout trips."
      );
    } finally {
      setTripsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTrips();
  }, [loadTrips]);

  useEffect(() => {
    if (!selectedTripId) {
      setDetail(null);
      return;
    }

    let cancelled = false;
    setDetailLoading(true);
    setDetailError(null);

    (async () => {
      try {
        const res = await getTripPayoutDetail(selectedTripId);
        if (cancelled) return;
        setDetail(res.data ?? null);
      } catch (err) {
        if (cancelled) return;
        setDetail(null);
        setDetailError(
          err instanceof ApiError
            ? err.message
            : "Could not load trip payout details."
        );
      } finally {
        if (!cancelled) setDetailLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedTripId, refreshKey]);

  useEffect(() => {
    if (!selectedTripId) {
      setAttendees([]);
      return;
    }

    let cancelled = false;
    setMembersLoading(true);
    const { sortBy, sortOrder } = sortByFromSorting(sorting);

    (async () => {
      try {
        const res = await listTripPayoutMembers(selectedTripId, {
          paymentStatus: filter,
          period: dateRange,
          sortBy,
          sortOrder,
          page: membersPage,
          limit: 20,
        });
        if (cancelled) return;
        const members = res.data?.members ?? [];
        setAttendees(
          members.map((m) => mapPayoutMemberToAttendee(m, selectedTripId))
        );
        setStatusCounts(
          res.data?.statusCounts ?? {
            all: 0,
            paid: 0,
            partial: 0,
            pending: 0,
          }
        );
        setMembersPages(res.data?.pagination.pages ?? 1);
        setMembersTotal(res.data?.pagination.total ?? members.length);
      } catch (err) {
        if (cancelled) return;
        setAttendees([]);
        toast.error(
          err instanceof ApiError
            ? err.message
            : "Could not load member payments."
        );
      } finally {
        if (!cancelled) setMembersLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    selectedTripId,
    filter,
    dateRange,
    sorting,
    membersPage,
    refreshKey,
  ]);

  const selectedTrip = detail?.trip ?? trips.find((t) => t.id === selectedTripId);
  const summary = detail?.summary;
  const currency = summary?.currency ?? selectedTrip?.currency ?? "GHS";

  const collected = summary?.collected ?? 0;
  const outstanding = summary?.outstanding ?? 0;
  const potential = summary?.potential ?? 0;
  const collectionPct =
    summary?.collectionPercent ??
    summary?.collectionProgress?.percent ??
    0;
  const paidCount = summary?.paidMembers ?? statusCounts.paid;
  const totalMembers = summary?.totalMembers ?? statusCounts.all;
  const awaitingPayment =
    summary?.awaitingPayment ??
    statusCounts.partial + statusCounts.pending;
  const partialCount = summary?.partialMembers ?? statusCounts.partial;
  const pendingCount = summary?.pendingMembers ?? statusCounts.pending;

  const filterCounts: Record<PaymentFilter, number> = {
    all: statusCounts.all,
    paid: statusCounts.paid,
    partial: statusCounts.partial,
    pending: statusCounts.pending,
  };

  const latestWithdrawal =
    detail?.withdrawal ??
    detail?.withdrawals?.[0] ??
    null;

  const table = useReactTable({
    data: attendees,
    columns: TABLE_COLUMNS,
    state: { sorting, globalFilter: globalSearch },
    onSortingChange: (updater) => {
      setMembersPage(1);
      setSorting(updater);
    },
    onGlobalFilterChange: setGlobalSearch,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualSorting: true,
    globalFilterFn: (row, _columnId, value) => {
      const a = row.original;
      const q = (value as string).toLowerCase();
      return (
        a.name.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        (a.phone ?? "").toLowerCase().includes(q)
      );
    },
  });

  const rows = table.getRowModel().rows;

  const handleExport = async () => {
    if (!selectedTripId) return;
    setExporting(true);
    try {
      const blob = await exportTripPayoutMembers(selectedTripId, {
        paymentStatus: filter,
        period: dateRange,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `payout-members-${selectedTripId}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Export downloaded.");
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? err.message
          : "Could not export member payments."
      );
    } finally {
      setExporting(false);
    }
  };

  return (
    <div
      className="w-full px-4 py-8 sm:px-6 lg:px-10 lg:py-10"
      style={{ background: "#f5f5f5" }}
    >
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

        {trips.length > 0 ? (
          <Select
            value={selectedTripId || undefined}
            onValueChange={(id) => {
              setSelectedTripIdOverride(id);
              setFilter("all");
              setDateRange("all");
              setGlobalSearch("");
              setMembersPage(1);
            }}
            disabled={tripsLoading}
          >
            <SelectTrigger
              className="w-full rounded-xl sm:w-72"
              style={{
                borderColor: "var(--border-strong)",
                background: "var(--surface)",
              }}
            >
              <SelectValue
                placeholder={tripsLoading ? "Loading trips…" : "Select a trip"}
              />
            </SelectTrigger>
            <SelectContent>
              {trips.map((trip) => (
                <SelectItem key={trip.id} value={trip.id}>
                  {trip.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}
      </div>

      {tripsLoading ? (
        <div
          className="flex min-h-[30vh] items-center justify-center gap-2 text-sm"
          style={{ color: "var(--text-tertiary)" }}
        >
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading payouts…
        </div>
      ) : tripsError ? (
        <OrganizerEmptyState
          icon={AlertCircle}
          title="Couldn't load payouts"
          description={tripsError}
          action={{ label: "Try again", onClick: () => void loadTrips() }}
        />
      ) : !selectedTrip ? (
        <OrganizerEmptyState
          icon={Wallet}
          title="No trips for payouts yet"
          description="Publish a trip and collect bookings — earnings and member payments will show up here."
          action={{
            href: "/organizer/trips/new",
            label: "+ Create your first trip",
          }}
        />
      ) : (
        <div className="space-y-10">
          <section>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2
                  className="font-display text-lg font-semibold"
                  style={{ color: "var(--text)" }}
                >
                  {selectedTrip.title}
                </h2>
                <p
                  className="mt-0.5 text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {formatDateRange(selectedTrip.startDate, selectedTrip.endDate)}
                  {" · "}
                  {selectedTrip.destination}
                  {" · "}
                  {formatCurrency(selectedTrip.pricePerPerson || selectedTrip.price, currency)}{" "}
                  per ticket
                  {" · "}
                  {selectedTrip.capacity == null
                    ? `${selectedTrip.booked} booked`
                    : `${selectedTrip.booked}/${selectedTrip.capacity} booked`}
                </p>
              </div>

              {(detail?.availableToWithdraw ?? 0) > 0 && (
                <Button
                  onClick={() => setWithdrawOpen(true)}
                  className="rounded-xl font-semibold"
                  style={{ background: "var(--primary)", color: "#fbf7f1" }}
                >
                  <ArrowDownToLine className="h-4 w-4" />
                  Withdraw{" "}
                  {formatCurrency(detail!.availableToWithdraw, currency)}
                </Button>
              )}
            </div>

            {detailLoading && !detail ? (
              <div
                className="mt-8 flex items-center gap-2 text-sm"
                style={{ color: "var(--text-tertiary)" }}
              >
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading trip summary…
              </div>
            ) : detailError && !detail ? (
              <p className="mt-6 text-sm" style={{ color: "var(--coral)" }}>
                {detailError}
              </p>
            ) : (
              <>
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <StatCard
                    icon={Wallet}
                    label="Collected"
                    value={formatCurrency(collected, currency)}
                    sub={`${collectionPct}% of potential`}
                    trend="up"
                  />
                  <StatCard
                    icon={Clock}
                    label="Outstanding"
                    value={formatCurrency(outstanding, currency)}
                    sub={
                      outstanding > 0 ? "Awaiting payment" : "Fully collected"
                    }
                    trend={outstanding > 0 ? "down" : "up"}
                  />
                  <StatCard
                    icon={Users}
                    label="Paid members"
                    value={String(paidCount)}
                    sub={`of ${totalMembers} total`}
                    trend="neutral"
                  />
                  <StatCard
                    icon={AlertCircle}
                    label="Awaiting payment"
                    value={String(awaitingPayment)}
                    sub={`${partialCount} partial · ${pendingCount} pending`}
                    trend={awaitingPayment > 0 ? "down" : "up"}
                  />
                </div>

                <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_300px]">
                  <Card
                    className="border shadow-none"
                    style={{
                      borderColor: "var(--border)",
                      background: "var(--surface)",
                    }}
                  >
                    <CardContent className="p-5">
                      <div className="mb-2 flex justify-between text-sm">
                        <span style={{ color: "var(--text-secondary)" }}>
                          Collection progress
                        </span>
                        <span
                          className="font-semibold"
                          style={{ color: "var(--text)" }}
                        >
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
                            width: `${Math.min(100, Math.max(0, collectionPct))}%`,
                            background: "var(--gradient-brand)",
                          }}
                        />
                      </div>
                      <div
                        className="mt-2 flex justify-between text-xs"
                        style={{ color: "var(--text-tertiary)" }}
                      >
                        <span>
                          {formatCurrency(collected, currency)} collected
                        </span>
                        <span>
                          {formatCurrency(potential, currency)} potential
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card
                    className="border shadow-none"
                    style={{
                      borderColor: "var(--border)",
                      background: "var(--surface)",
                    }}
                  >
                    <CardContent className="p-5">
                      <p
                        className="mb-1 text-xs font-medium uppercase tracking-wider"
                        style={{ color: "var(--text-tertiary)" }}
                      >
                        Withdrawal
                      </p>
                      {(detail?.availableToWithdraw ?? 0) > 0 && (
                        <p
                          className="mb-3 text-xs"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Available:{" "}
                          <span
                            className="font-semibold"
                            style={{ color: "var(--text)" }}
                          >
                            {formatCurrency(
                              detail!.availableToWithdraw,
                              currency
                            )}
                          </span>
                          {detail!.withdrawnTotal > 0 && (
                            <>
                              {" "}
                              · Withdrawn{" "}
                              {formatCurrency(detail!.withdrawnTotal, currency)}
                            </>
                          )}
                        </p>
                      )}
                      {latestWithdrawal ? (
                        (() => {
                          const meta = payoutStatusMeta(latestWithdrawal.status);
                          return (
                            <>
                              <p
                                className="font-display text-xl font-bold"
                                style={{ color: "var(--text)" }}
                              >
                                {formatCurrency(
                                  latestWithdrawal.amount,
                                  currency
                                )}
                              </p>
                              {latestWithdrawal.destinationLabel && (
                                <p
                                  className="mt-1 text-xs"
                                  style={{ color: "var(--text-tertiary)" }}
                                >
                                  {latestWithdrawal.destinationLabel}
                                </p>
                              )}
                              <div className="mt-2 flex items-center justify-between">
                                <span
                                  className="text-xs"
                                  style={{ color: "var(--text-tertiary)" }}
                                >
                                  {latestWithdrawal.date
                                    ? formatDate(latestWithdrawal.date)
                                    : "—"}
                                </span>
                                <span
                                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
                                  style={{
                                    background: meta.bg,
                                    color: meta.color,
                                  }}
                                >
                                  <meta.Icon className="h-3 w-3" />
                                  {meta.label}
                                </span>
                              </div>
                            </>
                          );
                        })()
                      ) : (
                        <p
                          className="mt-2 text-sm"
                          style={{ color: "var(--text-tertiary)" }}
                        >
                          {(detail?.availableToWithdraw ?? 0) > 0
                            ? "Ready to withdraw — request a transfer when you’re ready."
                            : "No withdrawal scheduled for this trip yet."}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </section>

          <PaymentMethodBreakdown
            attendees={attendees}
            paymentMethods={detail?.paymentMethods}
          />

          <section>
            <div className="mb-5 flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3
                  className="font-display text-base font-semibold"
                  style={{ color: "var(--text)" }}
                >
                  Member payments
                </h3>

                <div className="flex flex-wrap items-center gap-2">
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

                  <Select
                    value={dateRange}
                    onValueChange={(v) => {
                      setMembersPage(1);
                      setDateRange(v as DateRangeFilter);
                    }}
                  >
                    <SelectTrigger
                      className="h-9 w-40 rounded-xl text-sm"
                      style={{
                        borderColor: "var(--border-strong)",
                        background: "var(--surface)",
                      }}
                    >
                      <Calendar
                        className="h-3.5 w-3.5 shrink-0"
                        style={{ color: "var(--text-tertiary)" }}
                      />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(dateRangeLabels) as DateRangeFilter[]).map(
                        (key) => (
                          <SelectItem key={key} value={key}>
                            {dateRangeLabels[key]}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>

                  <button
                    type="button"
                    onClick={() => void handleExport()}
                    disabled={exporting || !selectedTripId}
                    className="flex h-9 items-center gap-1.5 rounded-xl border px-3 text-sm transition-colors hover:bg-[var(--bg-secondary)] disabled:opacity-50"
                    style={{
                      borderColor: "var(--border-strong)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {exporting ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Download className="h-3.5 w-3.5" />
                    )}
                    Export
                  </button>
                </div>
              </div>

              <OrganizerPortalTabs
                aria-label="Payment status"
                value={filter}
                onChange={(key) => {
                  setMembersPage(1);
                  setFilter(key);
                }}
                tabs={(Object.keys(filterLabels) as PaymentFilter[]).map(
                  (key) => ({
                    value: key,
                    label: filterLabels[key],
                    count: filterCounts[key],
                  })
                )}
              />
            </div>

            <Card
              className="border shadow-none"
              style={{
                borderColor: "var(--border)",
                background: "var(--surface)",
              }}
            >
              <CardContent className="p-0">
                {membersLoading ? (
                  <div
                    className="flex items-center justify-center gap-2 py-16 text-sm"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading members…
                  </div>
                ) : rows.length === 0 ? (
                  <OrganizerEmptyState
                    icon={Users}
                    title={
                      statusCounts.all === 0
                        ? "No bookings yet"
                        : globalSearch
                          ? `No members match "${globalSearch}"`
                          : `No ${filter === "all" ? "" : `${filter} `}members`
                    }
                    description={
                      statusCounts.all === 0
                        ? "When travelers book this trip, their payments will appear here."
                        : globalSearch
                          ? "Try a different search term."
                          : "Try another status or date range."
                    }
                    framed={false}
                    className="py-16"
                  />
                ) : (
                  <>
                    <div className="overflow-x-auto px-4 pb-2 pt-4">
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
                                      "select-none py-3 pl-3 pr-4 text-left text-xs font-semibold uppercase tracking-wider",
                                      header.column.getCanSort() &&
                                        "cursor-pointer",
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
                                    className={cn(
                                      "py-3.5 pl-3 pr-4",
                                      meta?.className
                                    )}
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

                    {membersPages > 1 && (
                      <div
                        className="flex items-center justify-between border-t px-6 py-3"
                        style={{ borderColor: "var(--border)" }}
                      >
                        <span
                          className="text-xs"
                          style={{ color: "var(--text-tertiary)" }}
                        >
                          Page {membersPage} of {membersPages} · {membersTotal}{" "}
                          results
                        </span>
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              setMembersPage((p) => Math.max(1, p - 1))
                            }
                            disabled={membersPage <= 1}
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
                            onClick={() =>
                              setMembersPage((p) =>
                                Math.min(membersPages, p + 1)
                              )
                            }
                            disabled={membersPage >= membersPages}
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

      {selectedTrip && (
        <TripWithdrawDialog
          open={withdrawOpen}
          onOpenChange={setWithdrawOpen}
          tripId={selectedTrip.id}
          tripTitle={selectedTrip.title}
          availableToWithdraw={detail?.availableToWithdraw ?? 0}
          currency={currency}
          onSuccess={() => setRefreshKey((k) => k + 1)}
        />
      )}
    </div>
  );
}

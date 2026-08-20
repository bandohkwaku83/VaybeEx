"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDownToLine,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  Download,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  TrendingUp,
  TrendingDown,
  Wallet,
  Calendar,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from "@tanstack/react-table";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  WithdrawFormDialog,
  type WithdrawEligibleTrip,
} from "@/components/organizer/withdraw-form-dialog";
import { OrganizerEmptyState } from "@/components/organizer/empty-state";
import { OrganizerPortalTabs } from "@/components/organizer/portal-tabs";
import { ApiError } from "@/lib/api/client";
import {
  listAllTripWithdrawals,
  normalizeWithdrawalStatus,
  isWithdrawalInFlight,
  withdrawalStatusCopy,
  type PayoutWithdrawal,
} from "@/lib/api/organizer-payouts";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

const POLL_MS = 20_000;

type WithdrawalRow = PayoutWithdrawal & {
  tripTitle: string;
};

function statusMeta(status: string, failureReason?: string | null) {
  const normalized = normalizeWithdrawalStatus(status);
  const copy = withdrawalStatusCopy(status, failureReason);
  if (normalized === "completed")
    return {
      label: copy.label,
      Icon: CheckCircle2,
      color: "#2e7d52",
      bg: "rgba(46,125,82,0.1)",
      border: "rgba(46,125,82,0.2)",
    };
  if (normalized === "processing")
    return {
      label: copy.label,
      Icon: Clock,
      color: "#c4864c",
      bg: "rgba(208,138,60,0.1)",
      border: "rgba(208,138,60,0.25)",
    };
  if (normalized === "failed")
    return {
      label: copy.label,
      Icon: AlertCircle,
      color: "#6b3f1d",
      bg: "rgba(181,82,58,0.1)",
      border: "rgba(181,82,58,0.25)",
    };
  return {
    label: copy.label,
    Icon: AlertCircle,
    color: "#9c8773",
    bg: "rgba(107,63,29,0.07)",
    border: "rgba(107,63,29,0.15)",
  };
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  sub: string;
  iconBg: string;
  iconColor: string;
  trend?: "up" | "down" | "neutral";
}
function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  iconBg,
  iconColor,
  trend = "neutral",
}: StatCardProps) {
  return (
    <Card
      className="border shadow-none transition-all duration-200 hover:-translate-y-0.5"
      style={{ borderColor: "var(--border)", background: "var(--surface)" }}
    >
      <CardContent className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <span
            className="text-[11px] font-semibold uppercase tracking-wider"
            style={{ color: "var(--text-tertiary)" }}
          >
            {label}
          </span>
          <div
            className="flex h-8 w-8 items-center justify-center rounded-[9px]"
            style={{ background: iconBg }}
          >
            <Icon className="h-4 w-4" style={{ color: iconColor }} />
          </div>
        </div>
        <p
          className="text-[22px] font-bold tracking-tight tabular-nums"
          style={{ color: "var(--text)" }}
        >
          {value}
        </p>
        <div
          className="mt-1.5 flex items-center gap-1 text-[11px] font-medium"
          style={{
            color:
              trend === "up"
                ? "#2e7d52"
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

const columnHelper = createColumnHelper<WithdrawalRow>();

const TABLE_COLUMNS = [
  columnHelper.accessor("tripTitle", {
    header: "Trip",
    cell: (info) => {
      const p = info.row.original;
      return (
        <Link
          href={`/organizer/payouts?trip=${p.tripId ?? ""}`}
          className="group flex items-center gap-2"
        >
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold"
            style={{
              background: "var(--primary-dim)",
              color: "var(--primary)",
            }}
          >
            {p.tripTitle.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p
              className="truncate text-[13px] font-semibold transition-colors group-hover:text-[var(--gold)]"
              style={{ color: "var(--text)" }}
            >
              {p.tripTitle}
            </p>
          </div>
        </Link>
      );
    },
  }),
  columnHelper.accessor((row) => row.destinationLabel ?? "", {
    id: "destination",
    header: "Destination",
    cell: (info) => {
      const row = info.row.original;
      const failed =
        normalizeWithdrawalStatus(row.status) === "failed" && row.failureReason;
      return (
        <div className="min-w-0">
          <span
            className="block truncate text-[13px]"
            style={{ color: "var(--text-secondary)" }}
          >
            {info.getValue() || "—"}
          </span>
          {failed && (
            <span
              className="mt-0.5 block truncate text-[11px]"
              style={{ color: "var(--coral)" }}
            >
              {row.failureReason}
            </span>
          )}
        </div>
      );
    },
    meta: { className: "hidden sm:table-cell" },
  }),
  columnHelper.accessor(
    (row) => row.processedAt || row.date || row.createdAt || "",
    {
      id: "date",
      header: "Date",
      cell: (info) => {
        const value = info.getValue();
        return (
          <span
            className="inline-flex items-center gap-1.5 text-[12px]"
            style={{ color: "var(--text-tertiary)" }}
          >
            <Calendar className="h-3 w-3" />
            {value ? formatDate(value) : "—"}
          </span>
        );
      },
      sortingFn: (a, b) => {
        const av = new Date(
          a.original.processedAt || a.original.date || a.original.createdAt || 0
        ).getTime();
        const bv = new Date(
          b.original.processedAt || b.original.date || b.original.createdAt || 0
        ).getTime();
        return av - bv;
      },
      meta: { className: "hidden md:table-cell" },
    }
  ),
  columnHelper.accessor("status", {
    header: "Status",
    cell: (info) => {
      const row = info.row.original;
      const meta = statusMeta(row.status, row.failureReason);
      return (
        <div>
          <span
            className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold"
            style={{
              background: meta.bg,
              color: meta.color,
              borderColor: meta.border,
            }}
          >
            <meta.Icon className="h-3 w-3" />
            {meta.label}
          </span>
          {normalizeWithdrawalStatus(row.status) === "failed" && row.failureReason ? (
            <p
              className="mt-1 max-w-[180px] text-[11px] leading-snug"
              style={{ color: "var(--coral)" }}
            >
              {row.failureReason}
            </p>
          ) : null}
        </div>
      );
    },
  }),
  columnHelper.accessor("amount", {
    header: "Amount",
    cell: (info) => {
      const row = info.row.original;
      return (
        <div className="text-right tabular-nums">
          <span
            className="text-[13px] font-bold"
            style={{ color: "var(--text)" }}
          >
            {formatCurrency(info.getValue(), row.currency ?? "GHS")}
          </span>
        </div>
      );
    },
    meta: { className: "text-right" },
  }),
];

type StatusFilter = "all" | "completed" | "processing" | "pending" | "failed";
const STATUS_FILTER_LABELS: Record<StatusFilter, string> = {
  all: "All",
  completed: "Paid",
  processing: "Processing",
  pending: "Pending review",
  failed: "Rejected",
};

type DateRangeFilter = "all" | "7d" | "30d" | "90d";
const DATE_RANGE_LABELS: Record<DateRangeFilter, string> = {
  all: "All time",
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
};

function msFromRange(range: DateRangeFilter): number | null {
  if (range === "7d") return 7 * 86400000;
  if (range === "30d") return 30 * 86400000;
  if (range === "90d") return 90 * 86400000;
  return null;
}

export default function WithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRow[]>([]);
  const [eligibleTrips, setEligibleTrips] = useState<WithdrawEligibleTrip[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [dateRange, setDateRange] = useState<DateRangeFilter>("all");
  const [globalSearch, setGlobalSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([
    { id: "date", desc: true },
  ]);

  const loadWithdrawals = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoading(true);
    setError(null);
    try {
      const result = await listAllTripWithdrawals({ limit: 50 });
      setWithdrawals(
        result.withdrawals.map((w) => ({
          ...w,
          tripTitle: w.tripTitle,
        }))
      );
      setEligibleTrips(result.availableByTrip);
    } catch (err) {
      if (!opts?.silent) {
        setWithdrawals([]);
        setEligibleTrips([]);
        setError(
          err instanceof ApiError
            ? err.message
            : "Could not load withdrawals."
        );
      }
    } finally {
      if (!opts?.silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadWithdrawals();
  }, [loadWithdrawals]);

  const hasInFlight = useMemo(
    () => withdrawals.some((w) => isWithdrawalInFlight(w.status)),
    [withdrawals]
  );

  useEffect(() => {
    if (!hasInFlight) return;
    const id = window.setInterval(() => {
      void loadWithdrawals({ silent: true });
    }, POLL_MS);
    return () => window.clearInterval(id);
  }, [hasInFlight, loadWithdrawals]);

  useEffect(() => {
    const onFocus = () => {
      void loadWithdrawals({ silent: true });
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [loadWithdrawals]);

  const completed = useMemo(
    () =>
      withdrawals.filter(
        (p) => normalizeWithdrawalStatus(p.status) === "completed"
      ),
    [withdrawals]
  );
  const processing = useMemo(
    () =>
      withdrawals.filter(
        (p) => normalizeWithdrawalStatus(p.status) === "processing"
      ),
    [withdrawals]
  );
  const pending = useMemo(
    () =>
      withdrawals.filter(
        (p) => normalizeWithdrawalStatus(p.status) === "pending"
      ),
    [withdrawals]
  );
  const failed = useMemo(
    () =>
      withdrawals.filter(
        (p) => normalizeWithdrawalStatus(p.status) === "failed"
      ),
    [withdrawals]
  );

  const completedTotal = completed.reduce((s, p) => s + p.amount, 0);
  const processingTotal = processing.reduce((s, p) => s + p.amount, 0);
  const pendingTotal = pending.reduce((s, p) => s + p.amount, 0);
  const failedTotal = failed.reduce((s, p) => s + p.amount, 0);
  const inFlightTotal = processingTotal + pendingTotal;
  const inFlightCount = processing.length + pending.length;

  const filterCounts: Record<StatusFilter, number> = {
    all: withdrawals.length,
    completed: completed.length,
    processing: processing.length,
    pending: pending.length,
    failed: failed.length,
  };

  const tableData = useMemo(() => {
    const byStatus =
      statusFilter === "all"
        ? withdrawals
        : withdrawals.filter(
            (p) => normalizeWithdrawalStatus(p.status) === statusFilter
          );
    const windowMs = msFromRange(dateRange);
    if (windowMs === null) return byStatus;
    const cutoff = Date.now() - windowMs;
    return byStatus.filter((p) => {
      const raw = p.processedAt || p.date || p.createdAt;
      if (!raw) return false;
      return new Date(raw).getTime() >= cutoff;
    });
  }, [withdrawals, statusFilter, dateRange]);

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
    globalFilterFn: (row, _col, value) => {
      const p = row.original;
      const q = (value as string).toLowerCase();
      return (
        p.tripTitle.toLowerCase().includes(q) ||
        (p.destinationLabel ?? "").toLowerCase().includes(q) ||
        (p.accountName ?? "").toLowerCase().includes(q)
      );
    },
    initialState: { pagination: { pageSize: 8 } },
  });

  const rows = table.getRowModel().rows;

  const handleExport = () => {
    if (tableData.length === 0) {
      toast.error("Nothing to export.");
      return;
    }
    const header = [
      "Trip",
      "Destination",
      "Date",
      "Status",
      "Amount",
      "Currency",
      "Note",
    ];
    const lines = tableData.map((row) =>
      [
        row.tripTitle,
        row.destinationLabel ?? "",
        row.processedAt || row.date || row.createdAt || "",
        normalizeWithdrawalStatus(row.status),
        String(row.amount),
        row.currency ?? "GHS",
        row.note ?? "",
      ]
        .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
        .join(",")
    );
    const blob = new Blob([[header.join(","), ...lines].join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "withdrawals.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success("Export downloaded.");
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
            Withdrawals
          </h1>
          <p
            className="mt-1 text-[13px]"
            style={{ color: "var(--text-secondary)" }}
          >
            Request a payout to MoMo.
            Pending requests lock that amount until they are paid or rejected.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setWithdrawOpen(true)}
          disabled={loading || eligibleTrips.length === 0}
          className="inline-flex items-center gap-2 rounded-none px-4 py-2.5 text-[13px] font-semibold transition-colors disabled:opacity-50"
          style={{ background: "var(--primary)", color: "#fbf7f1" }}
        >
          <ArrowDownToLine className="h-4 w-4" />
          Request payout
        </button>
      </div>

      {loading ? (
        <div
          className="flex min-h-[30vh] items-center justify-center gap-2 text-sm"
          style={{ color: "var(--text-tertiary)" }}
        >
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading withdrawals…
        </div>
      ) : error ? (
        <div
          className="rounded-2xl border px-5 py-8 text-center"
          style={{ borderColor: "var(--border)", background: "var(--surface)" }}
        >
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {error}
          </p>
          <button
            type="button"
            className="mt-4 rounded-none border px-4 py-2 text-sm"
            style={{
              borderColor: "var(--border-strong)",
              color: "var(--text-secondary)",
            }}
            onClick={() => void loadWithdrawals()}
          >
            Try again
          </button>
        </div>
      ) : (
        <>
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={Wallet}
              label="Paid"
              value={formatCurrency(completedTotal)}
              sub={`${completed.length} paid to MoMo`}
              iconBg="var(--primary-dim)"
              iconColor="var(--primary)"
              trend="up"
            />
            <StatCard
              icon={Clock}
              label="Awaiting admin"
              value={formatCurrency(inFlightTotal)}
              sub={`${inFlightCount} pending review / processing`}
              iconBg="rgba(208,138,60,0.1)"
              iconColor="var(--amber)"
              trend={inFlightTotal > 0 ? "neutral" : "up"}
            />
            <StatCard
              icon={AlertCircle}
              label="Rejected"
              value={formatCurrency(failedTotal)}
              sub={`${failed.length} rejected`}
              iconBg="rgba(181,82,58,0.1)"
              iconColor="var(--coral)"
              trend={failedTotal > 0 ? "down" : "up"}
            />
            <StatCard
              icon={CheckCircle2}
              label="All requests"
              value={String(withdrawals.length)}
              sub={`${formatCurrency(completedTotal + inFlightTotal + failedTotal)} total volume`}
              iconBg="var(--primary-dim)"
              iconColor="var(--text-tertiary)"
              trend="neutral"
            />
          </div>

          {completedTotal + inFlightTotal + failedTotal > 0 && (
            <Card
              className="mb-8 border shadow-none"
              style={{
                borderColor: "var(--border)",
                background: "var(--surface)",
              }}
            >
              <CardContent className="p-5">
                <div className="mb-3 flex items-center justify-between text-[13px]">
                  <span style={{ color: "var(--text-secondary)" }}>
                    Withdrawal pipeline
                  </span>
                  <span
                    className="font-semibold"
                    style={{ color: "var(--text)" }}
                  >
                    {formatCurrency(completedTotal + inFlightTotal + failedTotal)}{" "}
                    volume
                  </span>
                </div>
                <div
                  className="flex h-2.5 w-full overflow-hidden rounded-full"
                  style={{ background: "var(--bg-secondary)" }}
                >
                  {(() => {
                    const total =
                      completedTotal + inFlightTotal + failedTotal || 1;
                    return (
                      <>
                        <div
                          className="h-full transition-all duration-700"
                          style={{
                            width: `${(completedTotal / total) * 100}%`,
                            background: "#2e7d52",
                          }}
                        />
                        <div
                          className="h-full transition-all duration-700"
                          style={{
                            width: `${(inFlightTotal / total) * 100}%`,
                            background: "var(--amber)",
                          }}
                        />
                        <div
                          className="h-full transition-all duration-700"
                          style={{
                            width: `${(failedTotal / total) * 100}%`,
                            background: "var(--coral)",
                          }}
                        />
                      </>
                    );
                  })()}
                </div>
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1">
                  {[
                    {
                      label: "Paid",
                      value: completedTotal,
                      color: "#2e7d52",
                    },
                    {
                      label: "Awaiting admin",
                      value: inFlightTotal,
                      color: "var(--amber)",
                    },
                    {
                      label: "Rejected",
                      value: failedTotal,
                      color: "var(--coral)",
                    },
                  ].map((item) => (
                    <span
                      key={item.label}
                      className="flex items-center gap-1.5 text-[11px]"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ background: item.color }}
                      />
                      {item.label} ·{" "}
                      <span
                        className="font-semibold"
                        style={{ color: "var(--text)" }}
                      >
                        {formatCurrency(item.value)}
                      </span>
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <section>
            <div className="mb-5 flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div
                  className="flex items-center gap-2"
                  style={{ color: "var(--text)" }}
                >
                  <ArrowDownToLine
                    className="h-3.5 w-3.5"
                    style={{ color: "var(--text-tertiary)" }}
                  />
                  <h2 className="text-[15px] font-bold">Withdrawal history</h2>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2"
                      style={{ color: "var(--text-tertiary)" }}
                    />
                    <Input
                      value={globalSearch}
                      onChange={(e) => setGlobalSearch(e.target.value)}
                      placeholder="Search trip or destination…"
                      className="h-9 w-52 rounded-xl pl-9 text-sm"
                      style={{ borderColor: "var(--border-strong)" }}
                    />
                  </div>

                  <Select
                    value={dateRange}
                    onValueChange={(v) => setDateRange(v as DateRangeFilter)}
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
                      {(
                        Object.keys(DATE_RANGE_LABELS) as DateRangeFilter[]
                      ).map((key) => (
                        <SelectItem key={key} value={key}>
                          {DATE_RANGE_LABELS[key]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <button
                    type="button"
                    onClick={handleExport}
                    className="flex h-9 items-center gap-1.5 rounded-none border px-3 text-[13px] transition-colors hover:bg-[var(--bg-secondary)]"
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

              <OrganizerPortalTabs
                aria-label="Withdrawal status"
                value={statusFilter}
                onChange={setStatusFilter}
                tabs={(Object.keys(STATUS_FILTER_LABELS) as StatusFilter[]).map(
                  (key) => ({
                    value: key,
                    label: STATUS_FILTER_LABELS[key],
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
                {rows.length === 0 ? (
                  <OrganizerEmptyState
                    icon={Wallet}
                    title={
                      withdrawals.length === 0
                        ? "No withdrawals yet"
                        : globalSearch
                          ? `No results for "${globalSearch}"`
                          : `No ${statusFilter === "all" ? "" : `${statusFilter} `}withdrawals`
                    }
                    description={
                      withdrawals.length === 0
                        ? "When you request a payout, it will appear in this list."
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
                                      "select-none py-3 pl-3 pr-4 text-left text-[11px] font-semibold uppercase tracking-wider",
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

                    {table.getPageCount() > 1 && (
                      <div
                        className="flex items-center justify-between border-t px-6 py-3"
                        style={{ borderColor: "var(--border)" }}
                      >
                        <span
                          className="text-[11px]"
                          style={{ color: "var(--text-tertiary)" }}
                        >
                          Page {table.getState().pagination.pageIndex + 1} of{" "}
                          {table.getPageCount()} ·{" "}
                          {table.getFilteredRowModel().rows.length} results
                        </span>
                        <div className="flex gap-1.5">
                          {[
                            {
                              label: "Previous",
                              action: () => table.previousPage(),
                              can: table.getCanPreviousPage(),
                            },
                            {
                              label: "Next",
                              action: () => table.nextPage(),
                              can: table.getCanNextPage(),
                            },
                          ].map((btn) => (
                            <button
                              key={btn.label}
                              type="button"
                              onClick={btn.action}
                              disabled={!btn.can}
                              className="rounded-none border px-3 py-1.5 text-[11px] font-medium transition-colors hover:bg-[var(--bg-secondary)] disabled:opacity-40"
                              style={{
                                borderColor: "var(--border-strong)",
                                color: "var(--text-secondary)",
                              }}
                            >
                              {btn.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </section>
        </>
      )}

      <div
        className="mt-2 flex justify-end border-t pt-4"
        style={{ borderColor: "var(--border)" }}
      >
        <Link
          href="/organizer/payouts"
          className="inline-flex items-center gap-1.5 text-[12px] transition-colors hover:text-[var(--primary)]"
          style={{ color: "var(--text-secondary)" }}
        >
          View payout details <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <WithdrawFormDialog
        open={withdrawOpen}
        onOpenChange={setWithdrawOpen}
        eligibleTrips={eligibleTrips}
        onSuccess={() => void loadWithdrawals()}
      />
    </div>
  );
}

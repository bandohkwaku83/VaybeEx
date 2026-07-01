"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDownToLine, CheckCircle2, Clock, AlertCircle, Search,
  Download, ArrowUpDown, ArrowUp, ArrowDown, TrendingUp,
  TrendingDown, Wallet, Calendar, ArrowRight,
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
import { WithdrawFormDialog } from "@/components/organizer/withdraw-form-dialog";
import { organizerPayouts } from "@/lib/mock-data";
import type { Payout } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

/* ── Status helpers ───────────────────────────────────────────────── */
function statusMeta(status: Payout["status"]) {
  if (status === "completed")
    return {
      label: "Completed",
      Icon: CheckCircle2,
      color: "#2e7d52",
      bg: "rgba(46,125,82,0.1)",
      border: "rgba(46,125,82,0.2)",
    };
  if (status === "processing")
    return {
      label: "Processing",
      Icon: Clock,
      color: "#d08a3c",
      bg: "rgba(208,138,60,0.1)",
      border: "rgba(208,138,60,0.25)",
    };
  return {
    label: "Pending",
    Icon: AlertCircle,
    color: "#9c8773",
    bg: "rgba(107,63,29,0.07)",
    border: "rgba(107,63,29,0.15)",
  };
}

/* ── Stat card ────────────────────────────────────────────────────── */
interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  sub: string;
  iconBg: string;
  iconColor: string;
  trend?: "up" | "down" | "neutral";
}
function StatCard({ icon: Icon, label, value, sub, iconBg, iconColor, trend = "neutral" }: StatCardProps) {
  return (
    <Card
      className="border shadow-none transition-all duration-200 hover:-translate-y-0.5"
      style={{ borderColor: "var(--border)", background: "var(--surface)" }}
    >
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
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
              trend === "up" ? "#2e7d52" : trend === "down" ? "var(--coral)" : "var(--text-tertiary)",
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

/* ── Column helper (stable — outside component) ───────────────────── */
const columnHelper = createColumnHelper<Payout>();

const TABLE_COLUMNS = [
  columnHelper.accessor("tripTitle", {
    header: "Trip",
    cell: (info) => {
      const p = info.row.original;
      return (
        <Link
          href={`/organizer/payouts?trip=${p.tripId}`}
          className="group flex items-center gap-2"
        >
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold"
            style={{ background: "var(--primary-dim)", color: "var(--primary)" }}
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
  columnHelper.accessor("payoutDestination", {
    header: "Destination",
    cell: (info) => (
      <span className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
        {info.getValue() ?? "—"}
      </span>
    ),
    meta: { className: "hidden sm:table-cell" },
  }),
  columnHelper.accessor("date", {
    header: "Date",
    cell: (info) => (
      <span
        className="inline-flex items-center gap-1.5 text-[12px]"
        style={{ color: "var(--text-tertiary)" }}
      >
        <Calendar className="h-3 w-3" />
        {formatDate(info.getValue())}
      </span>
    ),
    sortingFn: (a, b) =>
      new Date(a.original.date).getTime() - new Date(b.original.date).getTime(),
    meta: { className: "hidden md:table-cell" },
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: (info) => {
      const meta = statusMeta(info.getValue());
      return (
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold border"
          style={{ background: meta.bg, color: meta.color, borderColor: meta.border }}
        >
          <meta.Icon className="h-3 w-3" />
          {meta.label}
        </span>
      );
    },
  }),
  columnHelper.accessor("amount", {
    header: "Amount",
    cell: (info) => (
      <div className="text-right tabular-nums">
        <span
          className="text-[13px] font-bold"
          style={{ color: "var(--text)" }}
        >
          {formatCurrency(info.getValue())}
        </span>
      </div>
    ),
    meta: { className: "text-right" },
  }),
];

type StatusFilter = "all" | "completed" | "processing" | "pending";
const STATUS_FILTER_LABELS: Record<StatusFilter, string> = {
  all: "All", completed: "Completed", processing: "Processing", pending: "Pending",
};

type DateRangeFilter = "all" | "7d" | "30d" | "90d";
const DATE_RANGE_LABELS: Record<DateRangeFilter, string> = {
  all: "All time", "7d": "Last 7 days", "30d": "Last 30 days", "90d": "Last 90 days",
};

function msFromRange(range: DateRangeFilter): number | null {
  if (range === "7d")  return 7  * 86400000;
  if (range === "30d") return 30 * 86400000;
  if (range === "90d") return 90 * 86400000;
  return null;
}

/* ── Page ─────────────────────────────────────────────────────────── */
export default function WithdrawalsPage() {
  const [payouts, setPayouts] = useState<Payout[]>(organizerPayouts);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [dateRange, setDateRange]       = useState<DateRangeFilter>("all");
  const [globalSearch, setGlobalSearch] = useState("");
  const [sorting, setSorting]           = useState<SortingState>([{ id: "date", desc: true }]);

  /* Derived totals */
  const completed  = useMemo(() => payouts.filter(p => p.status === "completed"),  [payouts]);
  const processing = useMemo(() => payouts.filter(p => p.status === "processing"), [payouts]);
  const pending    = useMemo(() => payouts.filter(p => p.status === "pending"),    [payouts]);

  const completedTotal  = completed.reduce((s, p)  => s + p.amount, 0);
  const processingTotal = processing.reduce((s, p) => s + p.amount, 0);
  const pendingTotal    = pending.reduce((s, p)    => s + p.amount, 0);
  const grandTotal      = payouts.reduce((s, p)    => s + p.amount, 0);

  const filterCounts: Record<StatusFilter, number> = {
    all: payouts.length,
    completed: completed.length,
    processing: processing.length,
    pending: pending.length,
  };

  /* Table data — status + date + search */
  const tableData = useMemo(() => {
    const byStatus =
      statusFilter === "all" ? payouts : payouts.filter(p => p.status === statusFilter);
    const windowMs = msFromRange(dateRange);
    if (windowMs === null) return byStatus;
    const cutoff = Date.now() - windowMs;
    return byStatus.filter(p => new Date(p.date).getTime() >= cutoff);
  }, [payouts, statusFilter, dateRange]);

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
        (p.payoutDestination ?? "").toLowerCase().includes(q)
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
            Withdrawals
          </h1>
          <p className="mt-1 text-[13px]" style={{ color: "var(--text-secondary)" }}>
            Request and track withdrawals to your mobile money accounts.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setWithdrawOpen(true)}
          className="inline-flex items-center gap-2 rounded-[10px] px-4 py-2.5 text-[13px] font-semibold transition-colors"
          style={{ background: "var(--primary)", color: "#fbf7f1" }}
          onMouseEnter={e => (e.currentTarget.style.background = "var(--primary-dark)")}
          onMouseLeave={e => (e.currentTarget.style.background = "var(--primary)")}
        >
          <ArrowDownToLine className="h-4 w-4" />
          Withdraw funds
        </button>
      </div>

      {/* ── Stat cards ──────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          icon={Wallet}
          label="Total withdrawn"
          value={formatCurrency(grandTotal)}
          sub={`${payouts.length} transfers total`}
          iconBg="var(--primary-dim)"
          iconColor="var(--primary)"
          trend="up"
        />
        <StatCard
          icon={CheckCircle2}
          label="Completed"
          value={formatCurrency(completedTotal)}
          sub={`${completed.length} transfer${completed.length !== 1 ? "s" : ""}`}
          iconBg="rgba(46,125,82,0.1)"
          iconColor="#2e7d52"
          trend="up"
        />
        <StatCard
          icon={Clock}
          label="Processing"
          value={formatCurrency(processingTotal)}
          sub={`${processing.length} in progress`}
          iconBg="rgba(208,138,60,0.1)"
          iconColor="var(--amber)"
          trend={processingTotal > 0 ? "neutral" : "up"}
        />
        <StatCard
          icon={AlertCircle}
          label="Pending"
          value={formatCurrency(pendingTotal)}
          sub={`${pending.length} upcoming`}
          iconBg="var(--primary-dim)"
          iconColor="var(--text-tertiary)"
          trend="neutral"
        />
      </div>

      {/* ── Collection progress bar ─────────────────────────────── */}
      {grandTotal > 0 && (
        <Card
          className="border shadow-none mb-8"
          style={{ borderColor: "var(--border)", background: "var(--surface)" }}
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-[13px] mb-3">
              <span style={{ color: "var(--text-secondary)" }}>Withdrawal breakdown</span>
              <span className="font-semibold" style={{ color: "var(--text)" }}>
                {formatCurrency(grandTotal)} total
              </span>
            </div>
            {/* Stacked bar */}
            <div
              className="h-2.5 w-full rounded-full overflow-hidden flex"
              style={{ background: "var(--bg-secondary)" }}
            >
              <div
                className="h-full transition-all duration-700"
                style={{
                  width: `${(completedTotal / grandTotal) * 100}%`,
                  background: "#2e7d52",
                }}
              />
              <div
                className="h-full transition-all duration-700"
                style={{
                  width: `${(processingTotal / grandTotal) * 100}%`,
                  background: "var(--amber)",
                }}
              />
              <div
                className="h-full transition-all duration-700"
                style={{
                  width: `${(pendingTotal / grandTotal) * 100}%`,
                  background: "var(--text-tertiary)",
                }}
              />
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-1 mt-3">
              {[
                { label: "Completed",  value: completedTotal,  color: "#2e7d52" },
                { label: "Processing", value: processingTotal, color: "var(--amber)" },
                { label: "Pending",    value: pendingTotal,    color: "var(--text-tertiary)" },
              ].map(item => (
                <span key={item.label} className="flex items-center gap-1.5 text-[11px]" style={{ color: "var(--text-secondary)" }}>
                  <span className="h-2 w-2 rounded-full" style={{ background: item.color }} />
                  {item.label} · <span className="font-semibold" style={{ color: "var(--text)" }}>{formatCurrency(item.value)}</span>
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Withdrawal history table ────────────────────────────── */}
      <section>
        <div className="mb-5 flex flex-col gap-3">

          {/* Row 1: heading + search + date + export */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2" style={{ color: "var(--text)" }}>
              <ArrowDownToLine className="h-3.5 w-3.5" style={{ color: "var(--text-tertiary)" }} />
              <h2 className="text-[15px] font-bold">Withdrawal history</h2>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2"
                  style={{ color: "var(--text-tertiary)" }}
                />
                <Input
                  value={globalSearch}
                  onChange={e => setGlobalSearch(e.target.value)}
                  placeholder="Search trip or destination…"
                  className="h-9 w-52 rounded-xl pl-9 text-sm"
                  style={{ borderColor: "var(--border-strong)" }}
                />
              </div>

              {/* Date range */}
              <Select value={dateRange} onValueChange={v => setDateRange(v as DateRangeFilter)}>
                <SelectTrigger
                  className="h-9 w-40 rounded-xl text-sm"
                  style={{ borderColor: "var(--border-strong)", background: "var(--surface)" }}
                >
                  <Calendar className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--text-tertiary)" }} />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(DATE_RANGE_LABELS) as DateRangeFilter[]).map(key => (
                    <SelectItem key={key} value={key}>{DATE_RANGE_LABELS[key]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Export */}
              <button
                type="button"
                className="flex h-9 items-center gap-1.5 rounded-xl border px-3 text-[13px] transition-colors hover:bg-[var(--bg-secondary)]"
                style={{ borderColor: "var(--border-strong)", color: "var(--text-secondary)" }}
              >
                <Download className="h-3.5 w-3.5" />
                Export
              </button>
            </div>
          </div>

          {/* Row 2: status filter pills */}
          <div className="flex flex-wrap gap-1">
            {(Object.keys(STATUS_FILTER_LABELS) as StatusFilter[]).map(key => (
              <button
                key={key}
                type="button"
                onClick={() => setStatusFilter(key)}
                className="rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all duration-150"
                style={{
                  background: statusFilter === key ? "var(--primary)" : "var(--bg-secondary)",
                  color: statusFilter === key ? "#fbf7f1" : "var(--text-secondary)",
                  border: statusFilter === key ? "1px solid transparent" : "1px solid var(--border)",
                }}
              >
                {STATUS_FILTER_LABELS[key]}{" "}
                <span style={{ opacity: 0.7, fontSize: "0.7rem" }}>
                  ({filterCounts[key]})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <Card
          className="border shadow-none"
          style={{ borderColor: "var(--border)", background: "var(--surface)" }}
        >
          <CardContent className="p-0">
            {rows.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Search className="mb-3 h-7 w-7" style={{ color: "var(--text-tertiary)" }} />
                <p className="font-medium text-[13px]" style={{ color: "var(--text-secondary)" }}>
                  {payouts.length === 0
                    ? "No withdrawals yet."
                    : globalSearch
                    ? `No results for "${globalSearch}".`
                    : `No ${statusFilter === "all" ? "" : statusFilter} withdrawals in this period.`}
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto px-4 pt-4 pb-2">
                  <table className="w-full text-sm">
                    <thead>
                      {table.getHeaderGroups().map(headerGroup => (
                        <tr
                          key={headerGroup.id}
                          className="border-b"
                          style={{ borderColor: "var(--border)" }}
                        >
                          {headerGroup.headers.map(header => {
                            const meta = header.column.columnDef.meta as { className?: string } | undefined;
                            const sortDir = header.column.getIsSorted();
                            return (
                              <th
                                key={header.id}
                                className={cn(
                                  "py-3 pl-3 pr-4 text-left font-semibold select-none text-[11px] uppercase tracking-wider",
                                  header.column.getCanSort() && "cursor-pointer",
                                  meta?.className
                                )}
                                style={{ color: "var(--text-tertiary)" }}
                                onClick={header.column.getToggleSortingHandler()}
                              >
                                <span className="inline-flex items-center gap-1">
                                  {flexRender(header.column.columnDef.header, header.getContext())}
                                  {header.column.getCanSort() && (
                                    sortDir === "asc"  ? <ArrowUp   className="h-3 w-3" /> :
                                    sortDir === "desc" ? <ArrowDown className="h-3 w-3" /> :
                                                         <ArrowUpDown className="h-3 w-3 opacity-35" />
                                  )}
                                </span>
                              </th>
                            );
                          })}
                        </tr>
                      ))}
                    </thead>
                    <tbody>
                      {rows.map(row => (
                        <tr
                          key={row.id}
                          className="border-b transition-colors last:border-0 hover:bg-[var(--bg-secondary)]"
                          style={{ borderColor: "var(--border-subtle)" }}
                        >
                          {row.getVisibleCells().map(cell => {
                            const meta = cell.column.columnDef.meta as { className?: string } | undefined;
                            return (
                              <td key={cell.id} className={cn("py-3.5 pl-3 pr-4", meta?.className)}>
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
                    <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                      Page {table.getState().pagination.pageIndex + 1} of{" "}
                      {table.getPageCount()} · {table.getFilteredRowModel().rows.length} results
                    </span>
                    <div className="flex gap-1.5">
                      {[
                        { label: "Previous", action: () => table.previousPage(), can: table.getCanPreviousPage() },
                        { label: "Next",     action: () => table.nextPage(),     can: table.getCanNextPage() },
                      ].map(btn => (
                        <button
                          key={btn.label}
                          type="button"
                          onClick={btn.action}
                          disabled={!btn.can}
                          className="rounded-lg border px-3 py-1.5 text-[11px] font-medium transition-colors hover:bg-[var(--bg-secondary)] disabled:opacity-40"
                          style={{ borderColor: "var(--border-strong)", color: "var(--text-secondary)" }}
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

      {/* ── Footer link ─────────────────────────────────────────── */}
      <div className="flex justify-end pt-4 mt-2 border-t" style={{ borderColor: "var(--border)" }}>
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
        existingPayouts={payouts}
        onSubmit={payout => setPayouts(prev => [payout, ...prev])}
      />
    </div>
  );
}
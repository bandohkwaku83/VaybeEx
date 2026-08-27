/* eslint-disable react-hooks/static-components */
"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  RefreshCw,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Search,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  User,
  CreditCard,
  Calendar,
  MapPin,
  DollarSign,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
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
import { OrganizerEmptyState } from "@/components/organizer/empty-state";
import { OrganizerPortalTabs } from "@/components/organizer/portal-tabs";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  listOrganizerCancellations,
  updateOrganizerCancellation,
} from "@/lib/api/cancellations";
import { ApiError } from "@/lib/api/client";
import type { CancellationRequest, CancellationStatus } from "@/lib/types";

type RefundStatus = CancellationStatus;

const POLL_MS = 10_000;

function paymentMethodLabel(method?: string) {
  return method?.trim() || "Original payment method";
}

function travelerDisplayName(request: CancellationRequest) {
  return request.travelerName?.trim() || "Traveler";
}

/* ── Status helpers ──────────────────────────────────────────────── */
function statusMeta(status: RefundStatus) {
  switch (status) {
    case "pending":
      return {
        label: "Pending",
        Icon: Clock,
        color: "#c4864c",
        bg: "rgba(208,138,60,0.1)",
        border: "rgba(208,138,60,0.25)",
      };
    case "processing":
      return {
        label: "Processing",
        Icon: RefreshCw,
        color: "var(--primary)",
        bg: "var(--primary-dim)",
        border: "rgba(107,63,29,0.2)",
      };
    case "refunded":
      return {
        label: "Refunded",
        Icon: CheckCircle2,
        color: "#2e7d52",
        bg: "rgba(46,125,82,0.1)",
        border: "rgba(46,125,82,0.2)",
      };
    case "denied":
      return {
        label: "Denied",
        Icon: XCircle,
        color: "var(--coral)",
        bg: "rgba(181,82,58,0.1)",
        border: "rgba(181,82,58,0.2)",
      };
  }
}

function StatusBadge({ status }: { status: RefundStatus }) {
  const meta = statusMeta(status);
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold border"
      style={{
        background: meta.bg,
        color: meta.color,
        borderColor: meta.border,
      }}
    >
      <meta.Icon className="h-3 w-3" />
      {meta.label}
    </span>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/* ── Stat card ───────────────────────────────────────────────────── */
function StatCard({
  label,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  sub,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  sub?: string;
}) {
  return (
    <div
      className="rounded-[14px] border p-5 transition-all duration-200 hover:-translate-y-0.5"
      style={{ borderColor: "var(--border)", background: "var(--surface)" }}
    >
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
        className="text-[26px] font-bold tracking-tight"
        style={{ color: "var(--text)" }}
      >
        {value}
      </p>
      {sub && (
        <p
          className="mt-1 text-[11px]"
          style={{ color: "var(--text-tertiary)" }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

/* ── Expandable action card ──────────────────────────────────────── */
function RefundActionCard({
  request,
  onAction,
}: {
  request: CancellationRequest;
  onAction: (id: string, action: "refunded" | "denied") => Promise<void> | void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState<"approve" | "deny" | null>(null);
  const meta = statusMeta(request.status);
  const isPending = request.status === "pending";
  const isProcessing = request.status === "processing";
  const canApprove = isPending && request.refundEligible;
  const canDeny = isPending;

  async function handleAction(action: "approve" | "deny") {
    setLoading(action);
    try {
      await onAction(request.id, action === "approve" ? "refunded" : "denied");
      setExpanded(false);
    } finally {
      setLoading(null);
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="rounded-[14px] border overflow-hidden"
      style={{ borderColor: "var(--border)", background: "var(--surface)" }}
    >
      <div
        className="flex items-start justify-between gap-3 p-4 cursor-pointer select-none"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="flex items-start gap-3 min-w-0">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
            style={{
              background: "var(--primary-dim)",
              color: "var(--primary)",
            }}
          >
            {initials(travelerDisplayName(request))}
          </div>
          <div className="min-w-0">
            <p
              className="text-[13px] font-semibold truncate"
              style={{ color: "var(--text)" }}
            >
              {travelerDisplayName(request)}
            </p>
            <p
              className="text-[12px] truncate mt-0.5"
              style={{ color: "var(--text-secondary)" }}
            >
              {request.tripTitle} · {request.destination}
            </p>
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
              <span
                className="flex items-center gap-1 text-[11px]"
                style={{ color: "var(--text-tertiary)" }}
              >
                <Calendar className="h-3 w-3" />{" "}
                {formatDate(request.requestedAt)}
              </span>
              <span
                className="flex items-center gap-1 text-[11px]"
                style={{ color: "var(--text-tertiary)" }}
              >
                <DollarSign className="h-3 w-3" />{" "}
                {formatCurrency(request.refundAmount)}
              </span>
              <span
                className="flex items-center gap-1 text-[11px]"
                style={{ color: "var(--text-tertiary)" }}
              >
                <CreditCard className="h-3 w-3" />{" "}
                {paymentMethodLabel(request.paymentMethod)}
              </span>
            </div>
            {isProcessing && (
              <p
                className="mt-1.5 flex items-center gap-1.5 text-[11px]"
                style={{ color: "var(--text-secondary)" }}
              >
                <RefreshCw className="h-3 w-3 animate-spin" />
                {/* Paystack is sending the refund… */}
                Processing
              </p>
            )}
            {request.refundFailureReason && (
              <p
                className="mt-1.5 text-[11px]"
                style={{ color: "var(--coral)" }}
              >
                {request.refundFailureReason}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge status={request.status} />
          {expanded ? (
            <ChevronUp
              className="h-4 w-4"
              style={{ color: "var(--text-tertiary)" }}
            />
          ) : (
            <ChevronDown
              className="h-4 w-4"
              style={{ color: "var(--text-tertiary)" }}
            />
          )}
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: "hidden" }}
          >
            <div
              className="px-4 pb-4 border-t pt-4 space-y-4"
              style={{ borderColor: "var(--border)" }}
            >
              {/* Detail grid */}
              <div
                className="grid grid-cols-2 gap-3 rounded-xl p-3"
                style={{ background: "var(--bg-secondary)" }}
              >
                {[
                  {
                    icon: User,
                    label: "Traveler",
                    value: travelerDisplayName(request),
                  },
                  {
                    icon: MapPin,
                    label: "Trip",
                    value: `${request.tripTitle} · ${request.destination}`,
                  },
                  {
                    icon: Calendar,
                    label: "Requested",
                    value: formatDate(request.requestedAt),
                  },
                  {
                    icon: DollarSign,
                    label: "Refund amt",
                    value: formatCurrency(request.refundAmount),
                  },
                  {
                    icon: CreditCard,
                    label: "Method",
                    value: paymentMethodLabel(request.paymentMethod),
                  },
                  { icon: Clock, label: "Status", value: meta.label },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-2">
                    <item.icon
                      className="h-3.5 w-3.5 mt-0.5 shrink-0"
                      style={{ color: "var(--text-tertiary)" }}
                    />
                    <div>
                      <p
                        className="text-[10px] uppercase tracking-wider font-semibold"
                        style={{ color: "var(--text-tertiary)" }}
                      >
                        {item.label}
                      </p>
                      <p
                        className="text-[12px] font-medium mt-0.5"
                        style={{ color: "var(--text)" }}
                      >
                        {item.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reason */}
              <div
                className="rounded-xl p-3 border"
                style={{
                  background: "var(--bg-secondary)",
                  borderColor: "var(--border)",
                }}
              >
                <p
                  className="text-[11px] font-semibold uppercase tracking-wider mb-1"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  Reason for cancellation
                </p>
                <p
                  className="text-[12px] leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {request.reason?.trim() || "No reason provided."}
                </p>
              </div>

              {isProcessing && (
                <div
                  className="flex items-center gap-2 rounded-xl border px-3 py-2.5 text-[12px]"
                  style={{
                    background: "var(--primary-dim)",
                    borderColor: "rgba(107,63,29,0.2)",
                    color: "var(--text-secondary)",
                  }}
                >
                  <RefreshCw
                    className="h-3.5 w-3.5 shrink-0 animate-spin"
                    style={{ color: "var(--primary)" }}
                  />
                  Paystack is sending the refund to the traveler&apos;s original
                  payment method. This updates automatically.
                </div>
              )}

              {request.refundFailureReason && (
                <div
                  className="rounded-xl border px-3 py-2.5 text-[12px]"
                  style={{
                    background: "rgba(181,82,58,0.07)",
                    borderColor: "rgba(181,82,58,0.25)",
                    color: "var(--coral)",
                  }}
                >
                  {request.refundFailureReason}
                </div>
              )}

              {/* Actions — never set processing from the client */}
              {isPending && (
                <div className="flex gap-2 pt-1">
                  {canApprove && (
                    <button
                      type="button"
                      disabled={loading !== null}
                      onClick={() => void handleAction("approve")}
                      className="flex flex-1 items-center justify-center gap-2 rounded-none px-4 py-2.5 text-[13px] font-semibold transition-all"
                      style={{
                        background: "#2e7d52",
                        color: "#fff",
                        opacity: loading ? 0.7 : 1,
                      }}
                    >
                      {loading === "approve" ? (
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      )}
                      {request.refundFailureReason
                        ? "Retry approve"
                        : "Approve refund"}
                    </button>
                  )}
                  {canDeny && (
                    <button
                      type="button"
                      disabled={loading !== null}
                      onClick={() => void handleAction("deny")}
                      className="flex flex-1 items-center justify-center gap-2 rounded-none border px-4 py-2.5 text-[13px] font-semibold transition-all"
                      style={{
                        borderColor: "rgba(181,82,58,0.3)",
                        background: "rgba(181,82,58,0.07)",
                        color: "var(--coral)",
                        opacity: loading ? 0.7 : 1,
                      }}
                    >
                      {loading === "deny" ? (
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5" />
                      )}
                      {request.refundEligible ? "Deny" : "Close / Deny"}
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ── TanStack table — completed requests ─────────────────────────── */
const columnHelper = createColumnHelper<CancellationRequest>();

const COMPLETED_COLUMNS = [
  columnHelper.accessor((row) => travelerDisplayName(row), {
    id: "travelerName",
    header: "Traveler",
    cell: (info) => {
      const r = info.row.original;
      const name = travelerDisplayName(r);
      return (
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
            style={{
              background: "var(--primary-dim)",
              color: "var(--primary)",
            }}
          >
            {initials(name)}
          </div>
          <div className="min-w-0">
            <p
              className="text-[13px] font-semibold truncate"
              style={{ color: "var(--text)" }}
            >
              {name}
            </p>
            <p
              className="text-[11px] truncate"
              style={{ color: "var(--text-tertiary)" }}
            >
              {r.travelerEmail || "—"}
            </p>
          </div>
        </div>
      );
    },
  }),
  columnHelper.accessor("tripTitle", {
    header: "Trip",
    cell: (info) => {
      const r = info.row.original;
      return (
        <div>
          <p className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
            {info.getValue()}
          </p>
          <p
            className="text-[11px] flex items-center gap-1 mt-0.5"
            style={{ color: "var(--text-tertiary)" }}
          >
            <MapPin className="h-2.5 w-2.5" /> {r.destination}
          </p>
        </div>
      );
    },
    meta: { className: "hidden sm:table-cell" },
  }),
  columnHelper.accessor("requestedAt", {
    header: "Requested",
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
      new Date(a.original.requestedAt).getTime() -
      new Date(b.original.requestedAt).getTime(),
    meta: { className: "hidden md:table-cell" },
  }),
  columnHelper.accessor((row) => paymentMethodLabel(row.paymentMethod), {
    id: "paymentMethod",
    header: "Method",
    cell: (info) => (
      <span className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
        {info.getValue()}
      </span>
    ),
    meta: { className: "hidden lg:table-cell" },
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: (info) => <StatusBadge status={info.getValue()} />,
  }),
  columnHelper.accessor("refundAmount", {
    header: "Amount",
    cell: (info) => {
      const s = info.row.original.status;
      return (
        <div className="text-right tabular-nums">
          <span
            className="text-[13px] font-bold"
            style={{
              color: s === "refunded" ? "#2e7d52" : "var(--text-tertiary)",
            }}
          >
            {s === "refunded" ? formatCurrency(info.getValue()) : "—"}
          </span>
          {s === "denied" && (
            <p
              className="text-[10px] mt-0.5"
              style={{ color: "var(--text-tertiary)" }}
            >
              {formatCurrency(info.getValue())} requested
            </p>
          )}
        </div>
      );
    },
    meta: { className: "text-right" },
  }),
];

function CompletedTable({
  data,
  search,
}: {
  data: CancellationRequest[];
  search: string;
}) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "requestedAt", desc: true },
  ]);

  const table = useReactTable({
    data,
    columns: COMPLETED_COLUMNS,
    state: { sorting, globalFilter: search },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: (row, _col, value) => {
      const r = row.original;
      const q = (value as string).toLowerCase();
      return (
        travelerDisplayName(r).toLowerCase().includes(q) ||
        r.tripTitle.toLowerCase().includes(q) ||
        (r.travelerEmail || "").toLowerCase().includes(q) ||
        r.destination.toLowerCase().includes(q) ||
        (r.reason || "").toLowerCase().includes(q)
      );
    },
    initialState: { pagination: { pageSize: 8 } },
  });

  const rows = table.getRowModel().rows;

  return (
    <Card
      className="border shadow-none"
      style={{ borderColor: "var(--border)", background: "var(--surface)" }}
    >
      <CardContent className="p-0">
        {rows.length === 0 ? (
          <OrganizerEmptyState
            icon={RotateCcw}
            title={
              search
                ? `No results for "${search}"`
                : "No completed requests yet"
            }
            description={
              search
                ? "Try a different search term."
                : "Approved and denied refunds will show up here."
            }
            framed={false}
            className="py-14"
          />
        ) : (
          <>
            <div className="overflow-x-auto px-4 pt-4 pb-2">
              <table className="w-full text-sm">
                <thead>
                  {table.getHeaderGroups().map((hg) => (
                    <tr
                      key={hg.id}
                      className="border-b"
                      style={{ borderColor: "var(--border)" }}
                    >
                      {hg.headers.map((header) => {
                        const meta = header.column.columnDef.meta as
                          | { className?: string }
                          | undefined;
                        const sortDir = header.column.getIsSorted();
                        return (
                          <th
                            key={header.id}
                            className={cn(
                              "py-3 pl-3 pr-4 text-left font-semibold select-none text-[11px] uppercase tracking-wider",
                              header.column.getCanSort() && "cursor-pointer",
                              meta?.className,
                            )}
                            style={{ color: "var(--text-tertiary)" }}
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            <span className="inline-flex items-center gap-1">
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
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
                            className={cn("py-3.5 pl-3 pr-4", meta?.className)}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
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
  );
}

/* ── Page ────────────────────────────────────────────────────────── */
type TabValue = "pending" | "completed" | "all";

export default function RefundsPage() {
  const [requests, setRequests] = useState<CancellationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabValue>("pending");
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const loadRequests = useCallback(async () => {
    const res = await listOrganizerCancellations({ limit: 100 });
    setRequests(res.data?.requests ?? []);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        await loadRequests();
      } catch (error) {
        if (!cancelled) {
          toast.error(
            error instanceof ApiError
              ? error.message
              : "Failed to load refund requests",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadRequests]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadRequests();
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Failed to refresh refund requests",
      );
    } finally {
      setRefreshing(false);
    }
  }, [loadRequests]);

  const hasProcessing = useMemo(
    () => requests.some((r) => r.status === "processing"),
    [requests],
  );

  useEffect(() => {
    if (!hasProcessing) return;
    const id = window.setInterval(() => {
      void loadRequests();
    }, POLL_MS);
    return () => window.clearInterval(id);
  }, [hasProcessing, loadRequests]);

  const handleAction = useCallback(
    async (id: string, newStatus: "refunded" | "denied") => {
      try {
        const res = await updateOrganizerCancellation(id, {
          status: newStatus,
        });
        const updated = res.data;
        if (updated) {
          setRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
        } else {
          await loadRequests();
        }
        if (newStatus === "denied") {
          toast.success("Cancellation denied — no refund");
        } else if (updated?.status === "refunded") {
          toast.success("Refund sent");
        } else {
          toast.success(
            "Refund submitted — traveler will receive it via Paystack",
          );
        }
      } catch (error) {
        toast.error(
          error instanceof ApiError
            ? error.message
            : "Failed to update refund request",
        );
        throw error;
      }
    },
    [loadRequests],
  );

  const needsAction = useMemo(
    () => requests.filter((r) => r.status === "pending"),
    [requests],
  );
  const processing = useMemo(
    () => requests.filter((r) => r.status === "processing"),
    [requests],
  );
  const pending = useMemo(
    () => [...needsAction, ...processing],
    [needsAction, processing],
  );
  const completed = useMemo(
    () =>
      requests.filter((r) => r.status === "refunded" || r.status === "denied"),
    [requests],
  );
  const refunded = useMemo(
    () => completed.filter((r) => r.status === "refunded"),
    [completed],
  );
  const denied = useMemo(
    () => completed.filter((r) => r.status === "denied"),
    [completed],
  );
  const totalRefunded = useMemo(
    () => refunded.reduce((s, r) => s + r.refundAmount, 0),
    [refunded],
  );

  const filterBySearch = useCallback(
    (list: CancellationRequest[]) => {
      if (!search.trim()) return list;
      const q = search.toLowerCase();
      return list.filter(
        (r) =>
          travelerDisplayName(r).toLowerCase().includes(q) ||
          r.tripTitle.toLowerCase().includes(q) ||
          (r.travelerEmail || "").toLowerCase().includes(q) ||
          (r.reason || "").toLowerCase().includes(q),
      );
    },
    [search],
  );

  const pendingFiltered = useMemo(
    () => filterBySearch(pending),
    [filterBySearch, pending],
  );

  const TABS: { value: TabValue; label: string; count: number }[] = [
    { value: "pending", label: "Open", count: pending.length },
    { value: "completed", label: "Completed", count: completed.length },
    { value: "all", label: "All", count: requests.length },
  ];

  function ActionCards({ items }: { items: CancellationRequest[] }) {
    if (!items.length) {
      return (
        <OrganizerEmptyState
          icon={CheckCircle2}
          title="All clear"
          description={
            search
              ? `No results for "${search}".`
              : "No refunds waiting for action."
          }
        />
      );
    }
    return (
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {items.map((r) => (
            <RefundActionCard key={r.id} request={r} onAction={handleAction} />
          ))}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div
      className="w-full px-4 py-8 sm:px-6 lg:px-10 lg:py-10"
      style={{ background: "#f5f5f5" }}
    >
      {/* ── Header ──────────────────────────────────────────────── */}
      <div
        className="mb-8 flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between"
        style={{ borderColor: "var(--border)" }}
      >
        <div>
          <h1
            className="font-display text-2xl font-bold tracking-tight"
            style={{ color: "var(--text)" }}
          >
            Refunds
          </h1>
          <p
            className="mt-1 text-[13px]"
            style={{ color: "var(--text-secondary)" }}
          >
            Approve or deny cancellations. Approved refunds are sent by Paystack
            to the traveler&apos;s original payment method — you don&apos;t hold
            the money.
          </p>
        </div>
        <button
          type="button"
          onClick={refresh}
          disabled={refreshing}
          className="inline-flex items-center gap-2 rounded-none border px-4 py-2.5 text-[13px] font-semibold transition-colors self-start sm:self-auto"
          style={{
            borderColor: "var(--border-strong)",
            background: "var(--surface)",
            color: "var(--text-secondary)",
          }}
        >
          <RefreshCw
            className={cn("h-3.5 w-3.5", refreshing && "animate-spin")}
          />
          Refresh
        </button>
      </div>

      {/* ── Stat cards ──────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          label="Needs action"
          value={needsAction.length}
          icon={AlertCircle}
          iconBg="rgba(208,138,60,0.1)"
          iconColor="#c4864c"
          sub={
            processing.length > 0
              ? `${processing.length} sending via Paystack`
              : needsAction.length > 0
                ? "Awaiting your review"
                : "All clear"
          }
        />
        <StatCard
          label="Refunded"
          value={refunded.length}
          icon={CheckCircle2}
          iconBg="rgba(46,125,82,0.1)"
          iconColor="#2e7d52"
          sub={
            refunded.length > 0
              ? `${formatCurrency(totalRefunded)} returned`
              : "None yet"
          }
        />
        <StatCard
          label="Denied"
          value={denied.length}
          icon={XCircle}
          iconBg="rgba(181,82,58,0.1)"
          iconColor="var(--coral)"
          sub="No refund issued"
        />
        <StatCard
          label="Total requests"
          value={requests.length}
          icon={RotateCcw}
          iconBg="var(--primary-dim)"
          iconColor="var(--primary)"
          sub="All time"
        />
      </div>

      {/* ── Alert banner ────────────────────────────────────────── */}
      <AnimatePresence>
        {needsAction.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center justify-between gap-3 rounded-xl border px-4 py-3.5 mb-6"
            style={{
              background: "rgba(208,138,60,0.07)",
              borderColor: "rgba(208,138,60,0.28)",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px]"
                style={{ background: "rgba(208,138,60,0.15)" }}
              >
                <Clock className="h-4 w-4" style={{ color: "#c4864c" }} />
              </div>
              <p
                className="text-[13px]"
                style={{ color: "var(--text-secondary)" }}
              >
                <span
                  className="font-semibold"
                  style={{ color: "var(--text)" }}
                >
                  {needsAction.length} request
                  {needsAction.length !== 1 ? "s" : ""}
                </span>{" "}
                waiting for approve or deny
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab("pending")}
              className="shrink-0 flex items-center gap-1 text-[12px] font-semibold"
              style={{ color: "#c4864c" }}
            >
              Review <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Search + tab pills ───────────────────────────────────── */}
      <div className="mb-5 flex flex-col gap-3">
        <div className="relative max-w-sm">
          <Search
            className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2"
            style={{ color: "var(--text-tertiary)" }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search traveler, trip, or reason…"
            className="w-full h-9 rounded-xl pl-9 pr-3 text-[13px] border outline-none transition-colors"
            style={{
              borderColor: "var(--border-strong)",
              background: "var(--surface)",
              color: "var(--text)",
            }}
          />
        </div>
        <OrganizerPortalTabs
          aria-label="Refund sections"
          tabs={TABS}
          value={activeTab}
          onChange={setActiveTab}
        />
      </div>

      {/* ── Tab content ─────────────────────────────────────────── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <RefreshCw
            className="h-5 w-5 animate-spin mb-3"
            style={{ color: "var(--primary)" }}
          />
          <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
            Loading refund requests…
          </p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            {activeTab === "pending" && <ActionCards items={pendingFiltered} />}

            {activeTab === "completed" && (
              <CompletedTable data={completed} search={search} />
            )}

            {activeTab === "all" && (
              <div className="space-y-8">
                {pending.length > 0 && (
                  <div>
                    <p
                      className="text-[11px] font-semibold uppercase tracking-wider mb-3"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      Open
                    </p>
                    <ActionCards items={filterBySearch(pending)} />
                  </div>
                )}
                {completed.length > 0 && (
                  <div>
                    <p
                      className="text-[11px] font-semibold uppercase tracking-wider mb-3"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      Completed
                    </p>
                    <CompletedTable data={completed} search={search} />
                  </div>
                )}
                {requests.length === 0 && (
                  <OrganizerEmptyState
                    icon={RotateCcw}
                    title="No refund requests yet"
                    description="When travelers request cancellations, they appear here for review."
                  />
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

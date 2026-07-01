"use client";

import { useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCw, RotateCcw, CheckCircle2, XCircle, Clock,
  AlertCircle, Search, ChevronDown, ChevronUp, ArrowRight,
  User, CreditCard, Calendar, MapPin, DollarSign, Filter,
  ArrowUpDown, ArrowUp, ArrowDown,
} from "lucide-react";
import {
  useReactTable, getCoreRowModel, getSortedRowModel,
  getFilteredRowModel, getPaginationRowModel,
  flexRender, createColumnHelper, type SortingState,
} from "@tanstack/react-table";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

/* ── Types ───────────────────────────────────────────────────────── */
type RefundStatus = "pending" | "processing" | "refunded" | "denied";
type PaymentMethod = "card" | "mtn" | "vodafone" | "airteltigo" | "bank" | "installment";

interface CancellationRequest {
  id: string;
  travelerName: string;
  travelerEmail: string;
  phone: string;
  tripTitle: string;
  tripId: string;
  destination: string;
  requestedAt: string;
  refundAmount: number;
  paymentMethod: PaymentMethod;
  status: RefundStatus;
  reason: string;
}

/* ── Mock data ───────────────────────────────────────────────────── */
const MOCK_REQUESTS: CancellationRequest[] = [
  // Pending / processing — these show as action cards
  {
    id: "cr-01", travelerName: "Kofi Mensah",    travelerEmail: "kofi@example.com",    phone: "+233 20 111 2222",
    tripTitle: "Sahara Desert Trek",   tripId: "t1", destination: "Morocco",
    requestedAt: "2026-06-10", refundAmount: 700,  paymentMethod: "mtn",
    status: "pending",
    reason: "Family emergency came up unexpectedly and I'm unable to travel on the scheduled dates.",
  },
  {
    id: "cr-02", travelerName: "Adwoa Kyei",      travelerEmail: "adwoa@example.com",   phone: "+233 27 555 6661",
    tripTitle: "Atlas Mountains Hike", tripId: "t2", destination: "Morocco",
    requestedAt: "2026-06-14", refundAmount: 450,  paymentMethod: "bank",
    status: "processing",
    reason: "My passport renewal is delayed and won't arrive before the trip departure.",
  },
  {
    id: "cr-03", travelerName: "Yaw Frimpong",    travelerEmail: "yaw@example.com",     phone: "+233 27 445 5667",
    tripTitle: "Sahara Desert Trek",   tripId: "t1", destination: "Morocco",
    requestedAt: "2026-06-18", refundAmount: 700,  paymentMethod: "mtn",
    status: "pending",
    reason: "Work obligations have changed and I can no longer take leave during this period.",
  },
  {
    id: "cr-04", travelerName: "Kweku Baffoe",    travelerEmail: "kweku@example.com",   phone: "+233 26 777 8881",
    tripTitle: "Atlas Mountains Hike", tripId: "t2", destination: "Morocco",
    requestedAt: "2026-06-20", refundAmount: 900,  paymentMethod: "installment",
    status: "pending",
    reason: "Medical condition prevents me from participating in strenuous hiking activities.",
  },

  // Completed — these populate the TanStack table
  {
    id: "cr-05", travelerName: "Ama Owusu",       travelerEmail: "ama@example.com",     phone: "+233 24 333 4444",
    tripTitle: "Cape Coast Tour",      tripId: "t3", destination: "Ghana",
    requestedAt: "2026-05-02", refundAmount: 320,  paymentMethod: "card",
    status: "refunded",
    reason: "Personal reasons.",
  },
  {
    id: "cr-06", travelerName: "Efua Boateng",    travelerEmail: "efua@example.com",    phone: "+233 26 777 8888",
    tripTitle: "Sahara Desert Trek",   tripId: "t1", destination: "Morocco",
    requestedAt: "2026-05-08", refundAmount: 700,  paymentMethod: "vodafone",
    status: "refunded",
    reason: "Flight cancellation meant I couldn't reach the departure city in time.",
  },
  {
    id: "cr-07", travelerName: "Kwame Adjei",     travelerEmail: "kwame@example.com",   phone: "+233 20 999 0000",
    tripTitle: "Sahara Desert Trek",   tripId: "t1", destination: "Morocco",
    requestedAt: "2026-05-12", refundAmount: 700,  paymentMethod: "bank",
    status: "denied",
    reason: "Requested cancellation 2 days before departure, outside the refund window.",
  },
  {
    id: "cr-08", travelerName: "Akua Sarpong",    travelerEmail: "akua@example.com",    phone: "+233 26 778 8990",
    tripTitle: "Sahara Desert Trek",   tripId: "t1", destination: "Morocco",
    requestedAt: "2026-05-15", refundAmount: 420,  paymentMethod: "installment",
    status: "refunded",
    reason: "Medical emergency with a family member requiring my immediate attention.",
  },
  {
    id: "cr-09", travelerName: "Nana Asare",      travelerEmail: "nana@example.com",    phone: "+233 20 111 2221",
    tripTitle: "Atlas Mountains Hike", tripId: "t2", destination: "Morocco",
    requestedAt: "2026-05-20", refundAmount: 900,  paymentMethod: "card",
    status: "denied",
    reason: "No valid reason provided within the cancellation window.",
  },
  {
    id: "cr-10", travelerName: "Akosua Bonsu",    travelerEmail: "akosua@example.com",  phone: "+233 20 111 2223",
    tripTitle: "Cape Coast Tour",      tripId: "t3", destination: "Ghana",
    requestedAt: "2026-05-22", refundAmount: 320,  paymentMethod: "vodafone",
    status: "refunded",
    reason: "Visa application was rejected for the travel period.",
  },
  {
    id: "cr-11", travelerName: "Fiifi Acheampong", travelerEmail: "fiifi@example.com",  phone: "+233 24 333 4443",
    tripTitle: "Cape Coast Tour",      tripId: "t3", destination: "Ghana",
    requestedAt: "2026-05-25", refundAmount: 320,  paymentMethod: "card",
    status: "denied",
    reason: "Cancellation request submitted after the 14-day refund policy window.",
  },
  {
    id: "cr-12", travelerName: "Benedicta Asante", travelerEmail: "bene@example.com",   phone: "+233 20 999 0003",
    tripTitle: "Cape Coast Tour",      tripId: "t3", destination: "Ghana",
    requestedAt: "2026-06-01", refundAmount: 320,  paymentMethod: "card",
    status: "refunded",
    reason: "Trip dates conflict with a mandatory work training that was just announced.",
  },
  {
    id: "cr-13", travelerName: "Serwaa Ntim",     travelerEmail: "serwaa@example.com",  phone: "+233 27 555 6663",
    tripTitle: "Cape Coast Tour",      tripId: "t3", destination: "Ghana",
    requestedAt: "2026-06-03", refundAmount: 320,  paymentMethod: "mtn",
    status: "refunded",
    reason: "Pregnancy complications advised by doctor to avoid travel.",
  },
  {
    id: "cr-14", travelerName: "Maame Ofori",     travelerEmail: "maame@example.com",   phone: "+233 20 999 0001",
    tripTitle: "Atlas Mountains Hike", tripId: "t2", destination: "Morocco",
    requestedAt: "2026-06-05", refundAmount: 900,  paymentMethod: "card",
    status: "denied",
    reason: "Changed mind about the trip without qualifying reason within policy.",
  },
  {
    id: "cr-15", travelerName: "Paa Kwesi Mensah", travelerEmail: "paa@example.com",   phone: "+233 24 112 2336",
    tripTitle: "Cape Coast Tour",      tripId: "t3", destination: "Ghana",
    requestedAt: "2026-06-08", refundAmount: 160,  paymentMethod: "airteltigo",
    status: "refunded",
    reason: "Partial refund requested — only partially paid and cannot complete payment.",
  },
];

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  card: "Card", mtn: "MTN MoMo", vodafone: "Vodafone Cash",
  airteltigo: "AirtelTigo Money", bank: "Bank Transfer", installment: "Installment",
};

/* ── Status helpers ──────────────────────────────────────────────── */
function statusMeta(status: RefundStatus) {
  switch (status) {
    case "pending":
      return { label: "Pending",    Icon: Clock,        color: "#d08a3c",        bg: "rgba(208,138,60,0.1)",  border: "rgba(208,138,60,0.25)" };
    case "processing":
      return { label: "Processing", Icon: RefreshCw,    color: "var(--primary)", bg: "var(--primary-dim)",    border: "rgba(107,63,29,0.2)"  };
    case "refunded":
      return { label: "Refunded",   Icon: CheckCircle2, color: "#2e7d52",        bg: "rgba(46,125,82,0.1)",   border: "rgba(46,125,82,0.2)"  };
    case "denied":
      return { label: "Denied",     Icon: XCircle,      color: "var(--coral)",   bg: "rgba(181,82,58,0.1)",   border: "rgba(181,82,58,0.2)"  };
  }
}

function StatusBadge({ status }: { status: RefundStatus }) {
  const meta = statusMeta(status);
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold border"
      style={{ background: meta.bg, color: meta.color, borderColor: meta.border }}
    >
      <meta.Icon className="h-3 w-3" />
      {meta.label}
    </span>
  );
}

function initials(name: string) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

/* ── Stat card ───────────────────────────────────────────────────── */
function StatCard({ label, value, icon: Icon, iconBg, iconColor, sub }: {
  label: string; value: number | string; icon: React.ElementType;
  iconBg: string; iconColor: string; sub?: string;
}) {
  return (
    <div
      className="rounded-[14px] border p-5 transition-all duration-200 hover:-translate-y-0.5"
      style={{ borderColor: "var(--border)", background: "var(--surface)" }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
          {label}
        </span>
        <div className="flex h-8 w-8 items-center justify-center rounded-[9px]" style={{ background: iconBg }}>
          <Icon className="h-4 w-4" style={{ color: iconColor }} />
        </div>
      </div>
      <p className="text-[26px] font-bold tracking-tight" style={{ color: "var(--text)" }}>{value}</p>
      {sub && <p className="mt-1 text-[11px]" style={{ color: "var(--text-tertiary)" }}>{sub}</p>}
    </div>
  );
}

/* ── Expandable action card ──────────────────────────────────────── */
function RefundActionCard({
  request, onAction,
}: {
  request: CancellationRequest;
  onAction: (id: string, action: "refunded" | "denied") => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading]   = useState<"approve" | "deny" | null>(null);
  const meta = statusMeta(request.status);

  async function handleAction(action: "approve" | "deny") {
    setLoading(action);
    await new Promise(r => setTimeout(r, 700));
    setLoading(null);
    setExpanded(false);
    onAction(request.id, action === "approve" ? "refunded" : "denied");
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
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-start gap-3 min-w-0">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
            style={{ background: "var(--primary-dim)", color: "var(--primary)" }}
          >
            {initials(request.travelerName)}
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold truncate" style={{ color: "var(--text)" }}>
              {request.travelerName}
            </p>
            <p className="text-[12px] truncate mt-0.5" style={{ color: "var(--text-secondary)" }}>
              {request.tripTitle} · {request.destination}
            </p>
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
              <span className="flex items-center gap-1 text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                <Calendar className="h-3 w-3" /> {formatDate(request.requestedAt)}
              </span>
              <span className="flex items-center gap-1 text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                <DollarSign className="h-3 w-3" /> {formatCurrency(request.refundAmount)}
              </span>
              <span className="flex items-center gap-1 text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                <CreditCard className="h-3 w-3" /> {PAYMENT_METHOD_LABELS[request.paymentMethod]}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge status={request.status} />
          {expanded
            ? <ChevronUp   className="h-4 w-4" style={{ color: "var(--text-tertiary)" }} />
            : <ChevronDown className="h-4 w-4" style={{ color: "var(--text-tertiary)" }} />}
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
            <div className="px-4 pb-4 border-t pt-4 space-y-4" style={{ borderColor: "var(--border)" }}>
              {/* Detail grid */}
              <div className="grid grid-cols-2 gap-3 rounded-xl p-3" style={{ background: "var(--bg-secondary)" }}>
                {[
                  { icon: User,       label: "Traveler",    value: request.travelerName },
                  { icon: MapPin,     label: "Trip",        value: `${request.tripTitle} · ${request.destination}` },
                  { icon: Calendar,   label: "Requested",   value: formatDate(request.requestedAt) },
                  { icon: DollarSign, label: "Refund amt",  value: formatCurrency(request.refundAmount) },
                  { icon: CreditCard, label: "Method",      value: PAYMENT_METHOD_LABELS[request.paymentMethod] },
                  { icon: Clock,      label: "Status",      value: meta.label },
                ].map(item => (
                  <div key={item.label} className="flex items-start gap-2">
                    <item.icon className="h-3.5 w-3.5 mt-0.5 shrink-0" style={{ color: "var(--text-tertiary)" }} />
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: "var(--text-tertiary)" }}>
                        {item.label}
                      </p>
                      <p className="text-[12px] font-medium mt-0.5" style={{ color: "var(--text)" }}>
                        {item.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reason */}
              <div className="rounded-xl p-3 border" style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
                <p className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--text-tertiary)" }}>
                  Reason for cancellation
                </p>
                <p className="text-[12px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {request.reason}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  disabled={loading !== null}
                  onClick={() => handleAction("approve")}
                  className="flex flex-1 items-center justify-center gap-2 rounded-[10px] px-4 py-2.5 text-[13px] font-semibold transition-all"
                  style={{ background: "#2e7d52", color: "#fff", opacity: loading ? 0.7 : 1 }}
                >
                  {loading === "approve"
                    ? <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    : <CheckCircle2 className="h-3.5 w-3.5" />}
                  Approve refund
                </button>
                <button
                  type="button"
                  disabled={loading !== null}
                  onClick={() => handleAction("deny")}
                  className="flex flex-1 items-center justify-center gap-2 rounded-[10px] border px-4 py-2.5 text-[13px] font-semibold transition-all"
                  style={{
                    borderColor: "rgba(181,82,58,0.3)",
                    background: "rgba(181,82,58,0.07)",
                    color: "var(--coral)",
                    opacity: loading ? 0.7 : 1,
                  }}
                >
                  {loading === "deny"
                    ? <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    : <XCircle className="h-3.5 w-3.5" />}
                  Deny request
                </button>
              </div>
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
  columnHelper.accessor("travelerName", {
    header: "Traveler",
    cell: info => {
      const r = info.row.original;
      return (
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
            style={{ background: "var(--primary-dim)", color: "var(--primary)" }}
          >
            {initials(r.travelerName)}
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold truncate" style={{ color: "var(--text)" }}>
              {r.travelerName}
            </p>
            <p className="text-[11px] truncate" style={{ color: "var(--text-tertiary)" }}>
              {r.travelerEmail}
            </p>
          </div>
        </div>
      );
    },
  }),
  columnHelper.accessor("tripTitle", {
    header: "Trip",
    cell: info => {
      const r = info.row.original;
      return (
        <div>
          <p className="text-[13px]" style={{ color: "var(--text-secondary)" }}>{info.getValue()}</p>
          <p className="text-[11px] flex items-center gap-1 mt-0.5" style={{ color: "var(--text-tertiary)" }}>
            <MapPin className="h-2.5 w-2.5" /> {r.destination}
          </p>
        </div>
      );
    },
    meta: { className: "hidden sm:table-cell" },
  }),
  columnHelper.accessor("requestedAt", {
    header: "Requested",
    cell: info => (
      <span className="inline-flex items-center gap-1.5 text-[12px]" style={{ color: "var(--text-tertiary)" }}>
        <Calendar className="h-3 w-3" />
        {formatDate(info.getValue())}
      </span>
    ),
    sortingFn: (a, b) =>
      new Date(a.original.requestedAt).getTime() - new Date(b.original.requestedAt).getTime(),
    meta: { className: "hidden md:table-cell" },
  }),
  columnHelper.accessor("paymentMethod", {
    header: "Method",
    cell: info => (
      <span className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
        {PAYMENT_METHOD_LABELS[info.getValue()]}
      </span>
    ),
    meta: { className: "hidden lg:table-cell" },
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: info => <StatusBadge status={info.getValue()} />,
  }),
  columnHelper.accessor("refundAmount", {
    header: "Amount",
    cell: info => {
      const s = info.row.original.status;
      return (
        <div className="text-right tabular-nums">
          <span
            className="text-[13px] font-bold"
            style={{ color: s === "refunded" ? "#2e7d52" : "var(--text-tertiary)" }}
          >
            {s === "refunded" ? formatCurrency(info.getValue()) : "—"}
          </span>
          {s === "denied" && (
            <p className="text-[10px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>
              {formatCurrency(info.getValue())} requested
            </p>
          )}
        </div>
      );
    },
    meta: { className: "text-right" },
  }),
];

function CompletedTable({ data, search }: { data: CancellationRequest[]; search: string }) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "requestedAt", desc: true }]);

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
        r.travelerName.toLowerCase().includes(q) ||
        r.tripTitle.toLowerCase().includes(q) ||
        r.travelerEmail.toLowerCase().includes(q) ||
        r.destination.toLowerCase().includes(q) ||
        r.reason.toLowerCase().includes(q)
      );
    },
    initialState: { pagination: { pageSize: 8 } },
  });

  const rows = table.getRowModel().rows;

  return (
    <Card className="border shadow-none" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
      <CardContent className="p-0">
        {rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full mb-4" style={{ background: "var(--primary-dim)" }}>
              <RotateCcw className="h-5 w-5" style={{ color: "var(--primary)" }} />
            </div>
            <p className="text-[13px] font-medium" style={{ color: "var(--text-secondary)" }}>
              {search ? `No results for "${search}".` : "No completed requests yet."}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto px-4 pt-4 pb-2">
              <table className="w-full text-sm">
                <thead>
                  {table.getHeaderGroups().map(hg => (
                    <tr key={hg.id} className="border-b" style={{ borderColor: "var(--border)" }}>
                      {hg.headers.map(header => {
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

            {table.getPageCount() > 1 && (
              <div className="flex items-center justify-between border-t px-6 py-3" style={{ borderColor: "var(--border)" }}>
                <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                  Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()} · {table.getFilteredRowModel().rows.length} results
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
  );
}

/* ── Page ────────────────────────────────────────────────────────── */
type TabValue = "pending" | "completed" | "all";

export default function RefundsPage() {
  const [requests, setRequests]     = useState<CancellationRequest[]>(MOCK_REQUESTS);
  const [activeTab, setActiveTab]   = useState<TabValue>("pending");
  const [search, setSearch]         = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 500));
    // In production: setRequests(getOrganizerCancellationRequests(ORGANIZER_ID));
    setRefreshing(false);
  }, []);

  // Move an actioned request from pending → completed in local state
  const handleAction = useCallback((id: string, newStatus: "refunded" | "denied") => {
    setRequests(prev =>
      prev.map(r => r.id === id ? { ...r, status: newStatus } : r)
    );
  }, []);

  const pending   = useMemo(() => requests.filter(r => r.status === "pending" || r.status === "processing"), [requests]);
  const completed = useMemo(() => requests.filter(r => r.status === "refunded" || r.status === "denied"),    [requests]);
  const refunded  = useMemo(() => completed.filter(r => r.status === "refunded"), [completed]);
  const denied    = useMemo(() => completed.filter(r => r.status === "denied"),   [completed]);
  const totalRefunded = useMemo(() => refunded.reduce((s, r) => s + r.refundAmount, 0), [refunded]);

  const filterBySearch = useCallback((list: CancellationRequest[]) => {
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(r =>
      r.travelerName.toLowerCase().includes(q) ||
      r.tripTitle.toLowerCase().includes(q) ||
      r.travelerEmail.toLowerCase().includes(q) ||
      r.reason.toLowerCase().includes(q)
    );
  }, [search]);

  const pendingFiltered = useMemo(() => filterBySearch(pending), [filterBySearch, pending]);

  const TABS: { value: TabValue; label: string }[] = [
    { value: "pending",   label: `Needs action (${pending.length})` },
    { value: "completed", label: `Completed (${completed.length})` },
    { value: "all",       label: `All requests (${requests.length})` },
  ];

  function ActionCards({ items }: { items: CancellationRequest[] }) {
    if (!items.length) {
      return (
        <div
          className="flex flex-col items-center justify-center py-14 rounded-[14px] border border-dashed text-center"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full mb-4" style={{ background: "var(--primary-dim)" }}>
            <CheckCircle2 className="h-5 w-5" style={{ color: "var(--primary)" }} />
          </div>
          <p className="text-[13px] font-semibold" style={{ color: "var(--text)" }}>All clear</p>
          <p className="text-[12px] mt-1" style={{ color: "var(--text-tertiary)" }}>
            {search ? `No results for "${search}".` : "No refunds waiting for action."}
          </p>
        </div>
      );
    }
    return (
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {items.map(r => (
            <RefundActionCard key={r.id} request={r} onAction={handleAction} />
          ))}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-8 sm:px-6 lg:px-10 lg:py-10" style={{ background: "var(--bg)" }}>

      {/* ── Header ──────────────────────────────────────────────── */}
      <div
        className="mb-8 flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between"
        style={{ borderColor: "var(--border)" }}
      >
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight" style={{ color: "var(--text)" }}>
            Refunds
          </h1>
          <p className="mt-1 text-[13px]" style={{ color: "var(--text-secondary)" }}>
            Review traveler cancellation requests and process refunds.
          </p>
        </div>
        <button
          type="button"
          onClick={refresh}
          disabled={refreshing}
          className="inline-flex items-center gap-2 rounded-[10px] border px-4 py-2.5 text-[13px] font-semibold transition-colors self-start sm:self-auto"
          style={{ borderColor: "var(--border-strong)", background: "var(--surface)", color: "var(--text-secondary)" }}
        >
          <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
          Refresh
        </button>
      </div>

      {/* ── Stat cards ──────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          label="Pending action" value={pending.length}
          icon={AlertCircle} iconBg="rgba(208,138,60,0.1)" iconColor="#d08a3c"
          sub={pending.length > 0 ? "Awaiting your review" : "All clear"}
        />
        <StatCard
          label="Refunded" value={refunded.length}
          icon={CheckCircle2} iconBg="rgba(46,125,82,0.1)" iconColor="#2e7d52"
          sub={refunded.length > 0 ? `${formatCurrency(totalRefunded)} returned` : "None yet"}
        />
        <StatCard
          label="Denied" value={denied.length}
          icon={XCircle} iconBg="rgba(181,82,58,0.1)" iconColor="var(--coral)"
          sub="Not eligible"
        />
        <StatCard
          label="Total requests" value={requests.length}
          icon={RotateCcw} iconBg="var(--primary-dim)" iconColor="var(--primary)"
          sub="All time"
        />
      </div>

      {/* ── Alert banner ────────────────────────────────────────── */}
      <AnimatePresence>
        {pending.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center justify-between gap-3 rounded-xl border px-4 py-3.5 mb-6"
            style={{ background: "rgba(208,138,60,0.07)", borderColor: "rgba(208,138,60,0.28)" }}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px]" style={{ background: "rgba(208,138,60,0.15)" }}>
                <Clock className="h-4 w-4" style={{ color: "#d08a3c" }} />
              </div>
              <p className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
                <span className="font-semibold" style={{ color: "var(--text)" }}>
                  {pending.length} request{pending.length !== 1 ? "s" : ""}
                </span>{" "}waiting for your action
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab("pending")}
              className="shrink-0 flex items-center gap-1 text-[12px] font-semibold"
              style={{ color: "#d08a3c" }}
            >
              Review <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Search + tab pills ───────────────────────────────────── */}
      <div className="mb-5 flex flex-col gap-3">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search traveler, trip, or reason…"
            className="w-full h-9 rounded-xl pl-9 pr-3 text-[13px] border outline-none transition-colors"
            style={{ borderColor: "var(--border-strong)", background: "var(--surface)", color: "var(--text)" }}
          />
        </div>
        <div className="flex flex-wrap gap-1">
          {TABS.map(tab => {
            const active = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveTab(tab.value)}
                className="rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all duration-150"
                style={{
                  background: active ? "var(--primary)" : "var(--bg-secondary)",
                  color: active ? "#fbf7f1" : "var(--text-secondary)",
                  border: active ? "1px solid transparent" : "1px solid var(--border)",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Tab content ─────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          {activeTab === "pending" && <ActionCards items={pendingFiltered} />}

          {activeTab === "completed" && <CompletedTable data={completed} search={search} />}

          {activeTab === "all" && (
            <div className="space-y-8">
              {pending.length > 0 && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-tertiary)" }}>
                    Needs action
                  </p>
                  <ActionCards items={filterBySearch(pending)} />
                </div>
              )}
              {completed.length > 0 && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-tertiary)" }}>
                    Completed
                  </p>
                  <CompletedTable data={completed} search={search} />
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ── How-to guide (only when truly empty) ────────────────── */}
      {requests.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 rounded-[14px] border border-dashed p-6"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: "var(--primary-dim)" }}>
              <Filter className="h-3.5 w-3.5" style={{ color: "var(--primary)" }} />
            </div>
            <p className="text-[13px] font-semibold" style={{ color: "var(--text)" }}>How to test this flow</p>
          </div>
          <ol className="space-y-2 ml-1">
            {[
              <> Sign in as a traveler and open{" "}<Link href="/dashboard" className="font-semibold underline underline-offset-2" style={{ color: "var(--gold)" }}>My Dashboard</Link></>,
              <> Click <span className="font-semibold" style={{ color: "var(--text)" }}>Request Cancellation</span> on an upcoming booking</>,
              <> Sign back in as organizer — the request appears on this page</>,
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[12px]" style={{ color: "var(--text-secondary)" }}>
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold mt-0.5" style={{ background: "var(--primary-dim)", color: "var(--primary)" }}>
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </motion.div>
      )}
    </div>
  );
}
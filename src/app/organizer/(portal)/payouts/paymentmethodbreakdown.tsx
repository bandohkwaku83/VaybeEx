"use client";

import { useMemo, useRef, useEffect } from "react";
import {
  CreditCard,
  Smartphone,
  Building2,
  CalendarClock,
  BarChart3,
} from "lucide-react";
import type { PayoutPaymentMethods } from "@/lib/api/organizer-payouts";
import type { TripAttendee, PaymentMethod } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

const METHOD_META: Record<
  PaymentMethod,
  { label: string; Icon: React.ElementType; color: string }
> = {
  card: { label: "Card", Icon: CreditCard, color: "#6b3f1d" },
  mtn: { label: "MTN MoMo", Icon: Smartphone, color: "#c4864c" },
  vodafone: { label: "Vodafone Cash", Icon: Smartphone, color: "#c4864c" },
  airteltigo: { label: "AirtelTigo", Icon: Smartphone, color: "#6b3f1d" },
  bank: { label: "Bank Transfer", Icon: Building2, color: "#4a2a12" },
  installment: { label: "Installment", Icon: CalendarClock, color: "#9c8773" },
};

const FALLBACK_COLORS = ["#6b3f1d", "#c4864c", "#c4864c", "#6b3f1d", "#4a2a12", "#9c8773"];

interface AggRow {
  key: string;
  label: string;
  color: string;
  Icon: React.ElementType;
  collected: number;
  count: number;
  paid: number;
  partial: number;
  pending: number;
}

function normalizeMethodKey(value?: string | null): PaymentMethod | null {
  if (!value) return null;
  const raw = value.toLowerCase().replace(/[\s_-]+/g, "");
  if (raw === "card" || raw === "paystack") return "card";
  if (raw === "mtn" || raw === "mtnmomo" || raw === "momo") return "mtn";
  if (raw === "vodafone" || raw === "vodafonecash") return "vodafone";
  if (raw === "airteltigo" || raw === "airteltigomoney") return "airteltigo";
  if (raw === "bank" || raw === "banktransfer") return "bank";
  if (raw === "installment") return "installment";
  return null;
}

function useAggregated(
  attendees: TripAttendee[],
  apiMethods?: PayoutPaymentMethods | null
): { rows: AggRow[]; methodsUsed: number; avgPerPaid: number } {
  return useMemo(() => {
    if (apiMethods && apiMethods.methods.length > 0) {
      const rows = apiMethods.methods.map((m, i) => {
        const key =
          normalizeMethodKey(m.method) ??
          m.method ??
          m.label ??
          `method-${i}`;
        const known = normalizeMethodKey(m.method);
        const meta = known ? METHOD_META[known] : null;
        return {
          key: String(key),
          label: m.label || meta?.label || String(m.method || "Other"),
          color: meta?.color ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length],
          Icon: meta?.Icon ?? CreditCard,
          collected: m.collected ?? m.amount ?? 0,
          count: m.count ?? 0,
          paid: m.paid ?? 0,
          partial: m.partial ?? 0,
          pending: m.pending ?? 0,
        };
      });
      return {
        rows: rows.sort((a, b) => b.collected - a.collected),
        methodsUsed: apiMethods.methodsUsed || rows.length,
        avgPerPaid: apiMethods.avgPerPaidMember,
      };
    }

    const map = new Map<PaymentMethod, AggRow>();
    for (const a of attendees) {
      if (!a.paymentMethod) continue;
      const meta = METHOD_META[a.paymentMethod];
      const row = map.get(a.paymentMethod) ?? {
        key: a.paymentMethod,
        ...meta,
        collected: 0,
        count: 0,
        paid: 0,
        partial: 0,
        pending: 0,
      };
      row.collected += a.amountPaid;
      row.count++;
      row[a.paymentStatus]++;
      map.set(a.paymentMethod, row);
    }
    const rows = [...map.values()].sort((a, b) => b.collected - a.collected);
    const paidCount = attendees.filter((a) => a.paymentStatus === "paid").length;
    const totalCollected = rows.reduce((s, m) => s + m.collected, 0);

    return {
      rows,
      methodsUsed: apiMethods?.methodsUsed ?? rows.length,
      avgPerPaid:
        apiMethods?.avgPerPaidMember ??
        (paidCount > 0 ? totalCollected / paidCount : 0),
    };
  }, [attendees, apiMethods]);
}

function AnimatedBar({ pct, color }: { pct: number; color: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const t = setTimeout(() => {
      if (ref.current) ref.current.style.width = pct + "%";
    }, 80);
    return () => clearTimeout(t);
  }, [pct, color]);
  return (
    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-bg-secondary">
      <div
        ref={ref}
        style={{
          width: "0%",
          background: color,
          transition: "width 0.65s cubic-bezier(0.34,1.2,0.64,1)",
        }}
        className="h-full rounded-full"
      />
    </div>
  );
}

interface Props {
  attendees: TripAttendee[];
  paymentMethods?: PayoutPaymentMethods | null;
}

export function PaymentMethodBreakdown({ attendees, paymentMethods }: Props) {
  const { rows: agg, methodsUsed, avgPerPaid } = useAggregated(
    attendees,
    paymentMethods
  );
  const totalCollected = agg.reduce((s, m) => s + m.collected, 0);

  if (!agg.length && !paymentMethods) return null;

  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <BarChart3 className="h-3.5 w-3.5 text-text-tertiary" />
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-text-tertiary">
          Payment methods
        </h3>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2">
        <div className="rounded-[10px] bg-bg-secondary p-3 text-center">
          <p className="text-[15px] font-bold tracking-tight text-text">
            {methodsUsed}
          </p>
          <p className="mt-0.5 text-[11px] text-text-tertiary">Methods used</p>
        </div>
        <div className="rounded-[10px] bg-bg-secondary p-3 text-center">
          <p className="text-[15px] font-bold tracking-tight text-text">
            {formatCurrency(avgPerPaid)}
          </p>
          <p className="mt-0.5 text-[11px] text-text-tertiary">
            Avg per paid member
          </p>
        </div>
      </div>

      {agg.length > 0 && (
        <div className="overflow-hidden rounded-[14px] border border-border bg-surface">
          <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
            <div className="flex items-center gap-2 text-[13px] font-bold text-text">
              <CreditCard className="h-3.5 w-3.5 text-text-tertiary" />
              Collected by method
            </div>
            <span className="text-[11px] text-text-tertiary">
              {formatCurrency(totalCollected)} total
            </span>
          </div>
          <div className="space-y-1 p-3">
            {agg.map((m) => {
              const pct = Math.round(
                (m.collected / Math.max(totalCollected, 1)) * 100
              );
              return (
                <div
                  key={m.key}
                  className="flex items-center gap-3 rounded-[9px] px-3 py-2.5 transition-colors hover:bg-bg-secondary"
                >
                  <div
                    className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[9px]"
                    style={{ background: m.color + "18" }}
                  >
                    <m.Icon className="h-4 w-4" style={{ color: m.color }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1.5 flex items-baseline justify-between">
                      <span className="text-[12px] font-semibold text-text">
                        {m.label}
                      </span>
                      <span className="text-[12px] font-bold text-text">
                        {formatCurrency(m.collected)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AnimatedBar pct={pct} color={m.color} />
                      <span className="w-7 shrink-0 text-right text-[11px] text-text-tertiary">
                        {pct}%
                      </span>
                    </div>
                    <div className="mt-1 flex gap-2">
                      {m.paid > 0 && (
                        <span className="text-[10px] text-[#2e7d52]">
                          {m.paid} paid
                        </span>
                      )}
                      {m.partial > 0 && (
                        <span className="text-[10px] text-amber">
                          {m.partial} partial
                        </span>
                      )}
                      {m.pending > 0 && (
                        <span className="text-[10px] text-text-tertiary">
                          {m.pending} pending
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

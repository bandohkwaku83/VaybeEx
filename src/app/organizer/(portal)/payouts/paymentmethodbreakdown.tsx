// components/organizer/payment-method-breakdown.tsx
"use client";

import { useMemo, useRef, useEffect } from "react";
import { CreditCard, Smartphone, Building2, CalendarClock, BarChart3 } from "lucide-react";
import type { TripAttendee, PaymentMethod } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

const METHOD_META: Record<PaymentMethod, { label: string; Icon: React.ElementType; color: string }> = {
  card:        { label: "Card",          Icon: CreditCard,    color: "#6b3f1d" },
  mtn:         { label: "MTN MoMo",      Icon: Smartphone,    color: "#c4864c" },
  vodafone:    { label: "Vodafone Cash", Icon: Smartphone,    color: "#d08a3c" },
  airteltigo:  { label: "AirtelTigo",    Icon: Smartphone,    color: "#b5523a" },
  bank:        { label: "Bank Transfer", Icon: Building2,     color: "#4a2a12" },
  installment: { label: "Installment",   Icon: CalendarClock, color: "#9c8773" },
};

interface AggRow {
  key: PaymentMethod;
  label: string;
  color: string;
  Icon: React.ElementType;
  collected: number;
  count: number;
  paid: number;
  partial: number;
  pending: number;
}

function useAggregated(attendees: TripAttendee[]): AggRow[] {
  return useMemo(() => {
    const map = new Map<PaymentMethod, AggRow>();
    for (const a of attendees) {
      if (!a.paymentMethod) continue;
      const meta = METHOD_META[a.paymentMethod];
      const row = map.get(a.paymentMethod) ?? {
        key: a.paymentMethod, ...meta,
        collected: 0, count: 0, paid: 0, partial: 0, pending: 0,
      };
      row.collected += a.amountPaid;
      row.count++;
      row[a.paymentStatus]++;
      map.set(a.paymentMethod, row);
    }
    return [...map.values()].sort((a, b) => b.collected - a.collected);
  }, [attendees]);
}

function AnimatedBar({ pct, color }: { pct: number; color: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const t = setTimeout(() => { if (ref.current) ref.current.style.width = pct + "%"; }, 80);
    return () => clearTimeout(t);
  }, [pct, color]);
  return (
    <div className="h-1.5 rounded-full overflow-hidden bg-bg-secondary flex-1">
      <div
        ref={ref}
        style={{ width: "0%", background: color, transition: "width 0.65s cubic-bezier(0.34,1.2,0.64,1)" }}
        className="h-full rounded-full"
      />
    </div>
  );
}

interface Props { attendees: TripAttendee[] }

export function PaymentMethodBreakdown({ attendees }: Props) {
  const agg = useAggregated(attendees);
  const totalCollected = agg.reduce((s, m) => s + m.collected, 0);
  const paidCount      = attendees.filter(a => a.paymentStatus === "paid").length;

  if (!agg.length) return null;

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="h-3.5 w-3.5 text-text-tertiary" />
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-text-tertiary">
          Payment methods
        </h3>
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-bg-secondary rounded-[10px] p-3 text-center">
          <p className="text-[15px] font-bold tracking-tight text-text">{agg.length}</p>
          <p className="text-[11px] text-text-tertiary mt-0.5">Methods used</p>
        </div>
        <div className="bg-bg-secondary rounded-[10px] p-3 text-center">
          <p className="text-[15px] font-bold tracking-tight text-text">
            {formatCurrency(totalCollected / Math.max(paidCount, 1))}
          </p>
          <p className="text-[11px] text-text-tertiary mt-0.5">Avg per paid member</p>
        </div>
      </div>

      {/* Method list */}
      <div className="bg-surface border border-border rounded-[14px] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-border">
          <div className="flex items-center gap-2 text-[13px] font-bold text-text">
            <CreditCard className="h-3.5 w-3.5 text-text-tertiary" />
            Collected by method
          </div>
          <span className="text-[11px] text-text-tertiary">
            {formatCurrency(totalCollected)} total
          </span>
        </div>
        <div className="p-3 space-y-1">
          {agg.map(m => {
            const pct = Math.round((m.collected / Math.max(totalCollected, 1)) * 100);
            return (
              <div
                key={m.key}
                className="flex items-center gap-3 px-3 py-2.5 rounded-[9px] hover:bg-bg-secondary transition-colors"
              >
                <div
                  className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[9px]"
                  style={{ background: m.color + "18" }}
                >
                  <m.Icon className="h-4 w-4" style={{ color: m.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1.5">
                    <span className="text-[12px] font-semibold text-text">{m.label}</span>
                    <span className="text-[12px] font-bold text-text">{formatCurrency(m.collected)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AnimatedBar pct={pct} color={m.color} />
                    <span className="text-[11px] text-text-tertiary w-7 text-right shrink-0">{pct}%</span>
                  </div>
                  <div className="flex gap-2 mt-1">
                    {m.paid    > 0 && <span className="text-[10px] text-[#2e7d52]">{m.paid} paid</span>}
                    {m.partial > 0 && <span className="text-[10px] text-amber">{m.partial} partial</span>}
                    {m.pending > 0 && <span className="text-[10px] text-text-tertiary">{m.pending} pending</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
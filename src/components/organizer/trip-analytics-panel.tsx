"use client";

import { useEffect, useRef, useState } from "react";
import {
  Eye,
  MousePointerClick,
  TrendingUp,
  Repeat,
  BarChart3,
  ChevronDown,
  Info,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { Trip } from "@/lib/types";
import gsap from "gsap";

interface TripAnalyticsPanelProps {
  trip: Trip;
  className?: string;
}

/* ─── Animated count-up hook ────────────────────────────────────── */
function useCountUp(target: number, duration = 1.4, prefix = "", suffix = "") {
  const [display, setDisplay] = useState(`${prefix}0${suffix}`);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const obj = { val: 0 };
    const tween = gsap.to(obj, {
      val: target,
      duration,
      ease: "power2.out",
      delay: 0.15,
      onUpdate() {
        const v =
          target % 1 === 0
            ? Math.round(obj.val).toLocaleString()
            : obj.val.toFixed(1);
        setDisplay(`${prefix}${v}${suffix}`);
      },
    });
    return () => { tween.kill(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return { display, ref };
}

/* ─── Funnel bar with GSAP width animation ──────────────────────── */
function FunnelRow({
  label,
  value,
  pct,
  delay,
  color,
}: {
  label: string;
  value: number;
  pct: number;
  delay: number;
  color: string;
}) {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!barRef.current) return;
    gsap.fromTo(
      barRef.current,
      { width: "0%" },
      { width: `${pct}%`, duration: 1.1, delay, ease: "power3.out" }
    );
  }, [pct, delay]);

  return (
    <div className="group">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
          {label}
        </span>
        <span
          className="font-mono text-xs font-semibold"
          style={{ color: "var(--text)" }}
        >
          {value.toLocaleString()}
          <span
            className="ml-1 text-[10px] font-normal"
            style={{ color: "var(--text-tertiary)" }}
          >
            ({pct.toFixed(1)}%)
          </span>
        </span>
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-full"
        style={{ background: "var(--border)" }}
      >
        <div
          ref={barRef}
          className="h-full rounded-full"
          style={{ background: color, width: 0 }}
        />
      </div>
    </div>
  );
}

/* ─── Stat card ─────────────────────────────────────────────────── */
function StatCard({
  label,
  rawValue,
  prefix,
  suffix,
  icon: Icon,
  iconBg,
  iconColor,
  tooltip,
  delay,
}: {
  label: string;
  rawValue: number;
  prefix?: string;
  suffix?: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  tooltip?: string;
  delay: number;
}) {
  const [tip, setTip] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const { display } = useCountUp(rawValue, 1.3, prefix, suffix);

  useEffect(() => {
    if (!cardRef.current) return;
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 0.6, delay, ease: "power3.out" }
    );
  }, [delay]);

  return (
    <div
      ref={cardRef}
      className="group relative rounded-2xl border p-4 transition-all duration-300 hover:-translate-y-1"
      style={{
        opacity: 0,
        borderColor: "var(--border)",
        background: "var(--surface)",
        boxShadow: "none",
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "var(--shadow-glow-gold)";
        (e.currentTarget as HTMLDivElement).style.borderColor =
          "var(--border-strong)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
        (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
      }}
    >
      {/* top row */}
      <div className="mb-3 flex items-start justify-between">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
          style={{ background: iconBg }}
        >
          <Icon className="h-4 w-4" style={{ color: iconColor }} />
        </div>
        {tooltip && (
          <button
            type="button"
            onMouseEnter={() => setTip(true)}
            onMouseLeave={() => setTip(false)}
            className="relative"
            aria-label={`Info: ${label}`}
          >
            <Info className="h-3.5 w-3.5" style={{ color: "var(--text-tertiary)" }} />
            {tip && (
              <div
                className="absolute right-0 top-5 z-20 w-44 rounded-xl border p-2.5 text-xs shadow-lg"
                style={{
                  background: "var(--surface)",
                  borderColor: "var(--border)",
                  color: "var(--text-secondary)",
                  lineHeight: 1.5,
                }}
              >
                {tooltip}
              </div>
            )}
          </button>
        )}
      </div>

      <p
        className="font-display text-xl font-black leading-none"
        style={{ color: "var(--text)" }}
      >
        {display}
      </p>
      <p
        className="mt-1 text-xs font-medium uppercase tracking-wider"
        style={{ color: "var(--text-tertiary)" }}
      >
        {label}
      </p>
    </div>
  );
}

/* ─── Revenue breakdown accordion ───────────────────────────────── */
function RevenueBreakdown({
  revenue,
  booked,
}: {
  revenue: number;
  booked: number;
}) {
  const [open, setOpen] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const chevronRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const wrap = bodyRef.current;
    const inner = innerRef.current;
    if (!wrap || !inner) return;

    const h = inner.getBoundingClientRect().height;
    if (open) {
      gsap.to(wrap, { height: h, duration: 0.4, ease: "power3.out" });
      gsap.to(chevronRef.current, { rotate: 180, duration: 0.3 });
    } else {
      gsap.to(wrap, { height: 0, duration: 0.3, ease: "power3.inOut" });
      gsap.to(chevronRef.current, { rotate: 0, duration: 0.3 });
    }
  }, [open]);

  const rows = [
    {
      label: `Ticket sales (×${booked})`,
      value: formatCurrency(revenue),
      color: "var(--text)",
      sign: "",
    },
    {
      label: "Platform fee (10%)",
      value: formatCurrency(revenue * 0.1),
      color: "var(--coral)",
      sign: "−",
    },
    {
      label: "Processing (1.5%)",
      value: formatCurrency(revenue * 0.015),
      color: "var(--coral)",
      sign: "−",
    },
  ];

  return (
    <div
      className="overflow-hidden rounded-2xl border"
      style={{ borderColor: "var(--border)", background: "var(--surface)" }}
    >
      {/* header — always visible */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors duration-150 hover:bg-[var(--bg-secondary)]"
      >
        <div>
          <p
            className="font-display text-sm font-bold"
            style={{ color: "var(--text)" }}
          >
            Revenue breakdown
          </p>
          <p className="mt-0.5 text-xs" style={{ color: "var(--text-tertiary)" }}>
            Net earnings after fees
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="font-display text-lg font-black"
            style={{ color: "var(--primary)" }}
          >
            {formatCurrency(revenue * 0.885)}
          </span>
          <ChevronDown
            ref={chevronRef}
            className="h-4 w-4 shrink-0"
            style={{ color: "var(--text-tertiary)" }}
          />
        </div>
      </button>

      {/* expandable rows */}
      <div ref={bodyRef} style={{ height: 0, overflow: "hidden" }}>
        <div ref={innerRef}>
          <div
            className="h-px"
            style={{ background: "var(--border)" }}
          />
          <div className="space-y-0 px-5 py-3">
            {rows.map((r) => (
              <div
                key={r.label}
                className="flex items-center justify-between border-b py-2.5 last:border-0"
                style={{ borderColor: "var(--border-subtle)" }}
              >
                <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  {r.label}
                </span>
                <span
                  className="font-mono text-xs font-semibold"
                  style={{ color: r.color }}
                >
                  {r.sign}
                  {r.value}
                </span>
              </div>
            ))}

            {/* net total */}
            <div className="flex items-center justify-between pt-3">
              <span
                className="text-sm font-bold"
                style={{ color: "var(--text)" }}
              >
                Your earnings
              </span>
              <span
                className="font-display text-base font-black"
                style={{ color: "var(--primary)" }}
              >
                {formatCurrency(revenue * 0.885)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main panel ─────────────────────────────────────────────────── */
export function TripAnalyticsPanel({ trip, className }: TripAnalyticsPanelProps) {
  const conversionRate =
    trip.views > 0 ? (trip.conversions / trip.views) * 100 : 0;
  const revenue = trip.price * trip.booked;
  const repeatBookers = 2;

  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!headerRef.current) return;
    gsap.fromTo(
      headerRef.current,
      { opacity: 0, y: -10 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
    );
  }, []);

  const funnelSteps = [
    {
      label: "Page views",
      value: trip.views,
      pct: 100,
      color: "linear-gradient(90deg, var(--primary-dark), var(--primary))",
    },
    {
      label: "Clicked Book",
      value: Math.round(trip.views * 0.12),
      pct: 12,
      color: "linear-gradient(90deg, var(--primary), var(--gold))",
    },
    {
      label: "Started checkout",
      value: Math.round(trip.views * 0.06),
      pct: 6,
      color: "linear-gradient(90deg, var(--gold), var(--amber))",
    },
    {
      label: "Confirmed booking",
      value: trip.conversions,
      pct: conversionRate,
      color: "linear-gradient(90deg, var(--amber), var(--coral))",
    },
  ];

  return (
    <div className={className}>
      <div className="sticky top-6 space-y-4">

        {/* ── Section header ── */}
        <div ref={headerRef} style={{ opacity: 0 }} className="flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ background: "var(--primary-dim)" }}
          >
            <BarChart3 className="h-4 w-4" style={{ color: "var(--primary)" }} />
          </div>
          <div>
            <p
              className="font-display text-sm font-bold"
              style={{ color: "var(--text)" }}
            >
              Analytics
            </p>
            <p className="text-[10px] uppercase tracking-widest" style={{ color: "var(--text-tertiary)" }}>
              Live performance
            </p>
          </div>
        </div>

        {/* ── 4 stat cards ── */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="Views"
            rawValue={trip.views}
            icon={Eye}
            iconBg="var(--primary-dim)"
            iconColor="var(--primary)"
            tooltip="Total unique page views for this trip listing."
            delay={0.05}
          />
          <StatCard
            label="Conversion"
            rawValue={parseFloat(conversionRate.toFixed(1))}
            suffix="%"
            icon={MousePointerClick}
            iconBg="var(--gold-dim)"
            iconColor="var(--gold)"
            tooltip="Percentage of viewers who completed a booking."
            delay={0.12}
          />
          <StatCard
            label="Revenue"
            rawValue={revenue}
            prefix="GHS "
            icon={TrendingUp}
            iconBg="rgba(107,63,29,0.08)"
            iconColor="var(--primary-dark)"
            tooltip="Gross revenue before platform and processing fees."
            delay={0.19}
          />
          <StatCard
            label="Repeat bookers"
            rawValue={repeatBookers}
            icon={Repeat}
            iconBg="rgba(181,82,58,0.1)"
            iconColor="var(--coral)"
            tooltip="Travelers who have booked one of your trips before."
            delay={0.26}
          />
        </div>

        {/* ── Booking funnel ── */}
        <div
          className="rounded-2xl border p-5"
          style={{ borderColor: "var(--border)", background: "var(--surface)" }}
        >
          <div className="mb-4 flex items-center justify-between">
            <p
              className="font-display text-sm font-bold"
              style={{ color: "var(--text)" }}
            >
              Booking funnel
            </p>
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
              style={{
                background: "var(--primary-dim)",
                color: "var(--primary)",
              }}
            >
              {conversionRate.toFixed(1)}% cvr
            </span>
          </div>

          <div className="space-y-4">
            {funnelSteps.map((step, i) => (
              <FunnelRow
                key={step.label}
                label={step.label}
                value={step.value}
                pct={step.pct}
                delay={0.3 + i * 0.1}
                color={step.color}
              />
            ))}
          </div>

          {/* drop-off insight */}
          <div
            className="mt-4 flex items-start gap-2 rounded-xl px-3 py-2.5 text-xs"
            style={{
              background: "var(--primary-dim)",
              color: "var(--text-secondary)",
              lineHeight: 1.6,
            }}
          >
            <TrendingUp
              className="mt-0.5 h-3.5 w-3.5 shrink-0"
              style={{ color: "var(--primary)" }}
            />
            <span>
              <strong style={{ color: "var(--text)" }}>
                {(100 - conversionRate).toFixed(1)}% drop-off
              </strong>{" "}
              from views to bookings. Consider improving your trip description
              or pricing clarity to convert more browsers.
            </span>
          </div>
        </div>

        {/* ── Revenue breakdown (accordion) ── */}
        <RevenueBreakdown revenue={revenue} booked={trip.booked} />
      </div>
    </div>
  );
}
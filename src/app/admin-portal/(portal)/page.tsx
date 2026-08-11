"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Mail,
  Map,
  RotateCcw,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/client";
import {
  getAdminDashboard,
  type AdminDashboard,
} from "@/lib/api/admin";
import { formatGHS, formatGHSMoney } from "@/lib/format";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;

const fadeUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
};

function greetingForHour(h: number) {
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function formatToday() {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());
}

type AttentionItem = {
  href: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  count: number;
  hint: string;
  cta: string;
  tone: "urgent" | "warn";
};

function AttentionTile({
  item,
  delay,
}: {
  item: AttentionItem;
  delay: number;
}) {
  const urgent = item.tone === "urgent";
  return (
    <motion.div
      {...fadeUp}
      transition={{ delay, duration: 0.45, ease }}
      className="min-w-0"
    >
      <Link
        href={item.href}
        className="group relative flex h-full flex-col overflow-hidden rounded-2xl p-5 transition-transform duration-300 hover:-translate-y-0.5 sm:p-6"
        style={{
          background: urgent ? "#171717" : "#fff",
          boxShadow: urgent
            ? "0 18px 40px -24px rgba(23,23,23,0.55)"
            : "inset 0 0 0 1px #e5e5e5",
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <span
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{
              background: urgent ? "rgba(255,255,255,0.1)" : "#f5f5f5",
              color: urgent ? "#fff" : "#171717",
            }}
          >
            <item.icon className="h-4.5 w-4.5" strokeWidth={1.75} />
          </span>
          <span
            className="font-display text-4xl font-bold tabular-nums tracking-tight sm:text-5xl"
            style={{ color: urgent ? "#fff" : "#171717" }}
          >
            {item.count}
          </span>
        </div>
        <div className="mt-5 flex-1">
          <p
            className="text-[15px] font-semibold tracking-tight"
            style={{ color: urgent ? "#fff" : "#171717" }}
          >
            {item.label}
          </p>
          <p
            className="mt-1.5 text-sm leading-relaxed"
            style={{ color: urgent ? "rgba(255,255,255,0.55)" : "#737373" }}
          >
            {item.hint}
          </p>
        </div>
        <span
          className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold"
          style={{ color: urgent ? "#fff" : "#171717" }}
        >
          {item.cta}
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </Link>
    </motion.div>
  );
}

function MetricLink({
  label,
  value,
  hint,
  href,
  delay,
}: {
  label: string;
  value: string | number;
  hint: string;
  href: string;
  delay: number;
}) {
  return (
    <motion.div {...fadeUp} transition={{ delay, duration: 0.45, ease }}>
      <Link
        href={href}
        className="group block border-b border-[#e5e5e5] pb-5 last:border-0 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-6 sm:last:border-r-0 sm:last:pr-0 lg:pr-8"
      >
        <p
          className="text-[11px] font-medium uppercase tracking-[0.16em]"
          style={{ color: "#a3a3a3" }}
        >
          {label}
        </p>
        <p
          className="mt-2.5 font-display text-3xl font-bold tabular-nums tracking-tight transition-colors group-hover:text-neutral-600 sm:text-[2.1rem]"
          style={{ color: "#171717" }}
        >
          {value}
        </p>
        <p className="mt-1.5 text-xs" style={{ color: "#737373" }}>
          {hint}
        </p>
      </Link>
    </motion.div>
  );
}

function TripComposition({ data }: { data: AdminDashboard["trips"] }) {
  const segments = [
    { key: "live", label: "Live", value: data.live, color: "#171717" },
    {
      key: "scheduled",
      label: "Scheduled",
      value: data.scheduled,
      color: "#737373",
    },
    { key: "draft", label: "Draft", value: data.draft, color: "#d4d4d4" },
    {
      key: "completed",
      label: "Completed",
      value: data.completed,
      color: "#a3a3a3",
    },
    {
      key: "cancelled",
      label: "Cancelled",
      value: data.cancelled,
      color: "#dc2626",
    },
  ];
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;

  return (
    <div>
      <div
        className="flex h-3 overflow-hidden rounded-full"
        style={{ background: "#f0f0f0" }}
      >
        {segments.map((seg, i) =>
          seg.value > 0 ? (
            <motion.div
              key={seg.key}
              className="h-full"
              style={{ background: seg.color }}
              initial={{ width: 0 }}
              animate={{ width: `${(seg.value / total) * 100}%` }}
              transition={{
                delay: 0.25 + i * 0.05,
                duration: 0.65,
                ease,
              }}
              title={`${seg.label}: ${seg.value}`}
            />
          ) : null
        )}
      </div>
      <ul className="mt-5 grid gap-3 sm:grid-cols-2">
        {segments.map((seg) => (
          <li
            key={seg.key}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <span className="flex items-center gap-2.5" style={{ color: "#525252" }}>
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ background: seg.color }}
              />
              {seg.label}
            </span>
            <span
              className="font-semibold tabular-nums"
              style={{ color: "#171717" }}
            >
              {seg.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function OrganizerFunnel({
  data,
}: {
  data: AdminDashboard["organizers"];
}) {
  const steps = [
    {
      label: "Incomplete",
      value: data.incompleteSetup,
      href: "/admin-portal/users?role=organizer&setup=incomplete",
    },
    {
      label: "Needs review",
      value: data.pendingApproval,
      href: "/admin-portal/users?queue=pending_approval",
    },
    {
      label: "Resubmitted",
      value: data.resubmitted ?? 0,
      href: "/admin-portal/users?queue=resubmitted",
    },
    {
      label: "Rejected",
      value: data.rejected,
      href: "/admin-portal/users?queue=rejected",
    },
    {
      label: "Approved",
      value: data.approved,
      href: "/admin-portal/users?role=organizer&status=approved",
    },
  ];

  return (
    <div className="grid gap-0 sm:grid-cols-2 lg:grid-cols-5">
      {steps.map((step, i) => (
        <Link
          key={step.label}
          href={step.href}
          className={cn(
            "group relative px-1 py-4 transition-colors sm:px-4 sm:py-0",
            i > 0 && "border-t border-[#e5e5e5] sm:border-t-0 sm:border-l"
          )}
        >
          <p
            className="text-[11px] font-medium uppercase tracking-[0.14em]"
            style={{ color: "#a3a3a3" }}
          >
            {step.label}
          </p>
          <p
            className="mt-2 font-display text-2xl font-bold tabular-nums tracking-tight transition-colors group-hover:text-neutral-600 sm:text-3xl"
            style={{ color: "#171717" }}
          >
            {step.value}
          </p>
          {i < steps.length - 1 && (
            <ArrowRight
              className="absolute right-0 top-1/2 hidden h-3.5 w-3.5 -translate-y-1/2 translate-x-1/2 sm:block"
              style={{ color: "#d4d4d4" }}
            />
          )}
        </Link>
      ))}
    </div>
  );
}

export default function AdminDashboardPage() {
  const { user } = useAdminAuth();
  const [data, setData] = useState<AdminDashboard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hour] = useState(() => new Date().getHours());

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await getAdminDashboard();
        if (!cancelled) setData(res.data ?? null);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof ApiError
              ? err.message
              : "Could not load dashboard."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const firstName = user?.name?.split(" ")[0] ?? "there";
  const greeting = greetingForHour(hour);

  const attentionItems: AttentionItem[] = data
    ? (
        [
          (data.organizers.resubmitted ?? 0) > 0 && {
            href: "/admin-portal/users?queue=resubmitted",
            icon: ShieldCheck,
            label: "Resubmitted",
            count: data.organizers.resubmitted,
            hint: "Rejected, then came back — review what you asked them to fix",
            cta: "Prioritize these",
            tone: "urgent" as const,
          },
          data.organizers.pendingApproval > 0 && {
            href: "/admin-portal/users?queue=pending_approval",
            icon: ShieldCheck,
            label: "Needs review",
            count: data.organizers.pendingApproval,
            hint: "First reviews and resubmits waiting on a decision",
            cta: "Open queue",
            tone: (data.organizers.resubmitted ?? 0) > 0 ? ("warn" as const) : ("urgent" as const),
          },
          data.organizers.rejected > 0 && {
            href: "/admin-portal/users?queue=rejected",
            icon: Users,
            label: "Rejected",
            count: data.organizers.rejected,
            hint: "Waiting on the organizer to update and resubmit",
            cta: "View rejected",
            tone: "warn" as const,
          },
          data.withdrawals.counts.pending +
            data.withdrawals.counts.processing >
            0 && {
            href: "/admin-portal/withdrawals?queue=awaiting",
            icon: Wallet,
            label: "Withdrawals awaiting you",
            count:
              data.withdrawals.counts.pending +
              data.withdrawals.counts.processing,
            hint: data.withdrawals.counts.pending
              ? `${data.withdrawals.counts.pending} need review — send MoMo outside the app`
              : "Mark paid once you’ve sent MoMo",
            cta: "Open queue",
            tone: "urgent" as const,
          },
          data.withdrawals.counts.failed > 0 && {
            href: "/admin-portal/withdrawals?queue=rejected",
            icon: Wallet,
            label: "Rejected withdrawals",
            count: data.withdrawals.counts.failed,
            hint: data.withdrawals.amounts.failed
              ? `${formatGHS(data.withdrawals.amounts.failed)} unlocked for organizers`
              : "Funds unlocked — organizer can request again",
            cta: "View rejected",
            tone: "warn" as const,
          },
          data.cancellations.awaitingReview > 0 && {
            href: "/admin-portal/refunds?queue=awaiting",
            icon: RotateCcw,
            label: "Refunds awaiting review",
            count: data.cancellations.awaitingReview,
            hint: data.cancellations.amounts?.refunded
              ? `${formatGHSMoney(data.cancellations.amounts.refunded)} already refunded`
              : "Refund requests awaiting a decision",
            cta: "Open refunds",
            tone: "warn" as const,
          },
        ] as const
      ).filter(Boolean) as AttentionItem[]
    : [];

  const attentionTotal = attentionItems.reduce((sum, i) => sum + i.count, 0);
  const moneyInFlight = data
    ? data.withdrawals.amounts.pending + data.withdrawals.amounts.processing
    : 0;
  const tripTotal = data
    ? data.trips.live +
      data.trips.scheduled +
      data.trips.draft +
      data.trips.completed +
      data.trips.cancelled
    : 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <motion.header
        {...fadeUp}
        transition={{ duration: 0.5, ease }}
        className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: "#a3a3a3" }}
          >
            {formatToday()}
          </p>
          <h1
            className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl"
            style={{ color: "#171717" }}
          >
            {greeting}, {firstName}
          </h1>
          <p
            className="mt-2 max-w-md text-sm leading-relaxed sm:text-[15px]"
            style={{ color: "#737373" }}
          >
            {loading
              ? "Loading the state of the platform…"
              : attentionTotal > 0
                ? `${attentionTotal} item${attentionTotal === 1 ? "" : "s"} need a decision before the day moves on.`
                : "Queues are clear. Here's how the platform is running."}
          </p>
        </div>

        {!loading && data && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.4, ease }}
            className="inline-flex items-center gap-2 self-start rounded-full px-3.5 py-2 text-xs font-semibold sm:self-auto"
            style={{
              background: attentionTotal > 0 ? "#fef2f2" : "#f0fdf4",
              color: attentionTotal > 0 ? "#dc2626" : "#15803d",
              boxShadow:
                attentionTotal > 0
                  ? "inset 0 0 0 1px #fecaca"
                  : "inset 0 0 0 1px #bbf7d0",
            }}
          >
            {attentionTotal > 0 ? (
              <>
                <span
                  className="h-1.5 w-1.5 animate-pulse rounded-full"
                  style={{ background: "#dc2626" }}
                />
                {attentionTotal} need attention
              </>
            ) : (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" />
                All clear
              </>
            )}
          </motion.div>
        )}
      </motion.header>

      {loading && (
        <div
          className="flex items-center gap-2 py-24 text-sm"
          style={{ color: "#737373" }}
        >
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading overview…
        </div>
      )}

      {error && (
        <div
          className="rounded-2xl px-5 py-5"
          style={{
            background: "#fef2f2",
            boxShadow: "inset 0 0 0 1px #fecaca",
          }}
        >
          <p className="text-sm font-medium" style={{ color: "#dc2626" }}>
            {error}
          </p>
          <Button
            className="mt-3"
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      )}

      {data && !loading && (
        <div className="space-y-10 sm:space-y-12">
          {/* Priority actions */}
          <section>
            <div className="mb-4 flex items-end justify-between gap-3">
              <h2
                className="font-display text-xl font-bold tracking-tight"
                style={{ color: "#171717" }}
              >
                Needs attention
              </h2>
              {attentionItems.length === 0 && (
                <span className="text-xs font-medium" style={{ color: "#16a34a" }}>
                  Nothing waiting
                </span>
              )}
            </div>

            {attentionItems.length > 0 ? (
              <div
                className={cn(
                  "grid gap-3 sm:gap-4",
                  attentionItems.length === 1 && "sm:grid-cols-1",
                  attentionItems.length === 2 && "sm:grid-cols-2",
                  attentionItems.length >= 3 && "sm:grid-cols-3"
                )}
              >
                {attentionItems.map((item, i) => (
                  <AttentionTile key={item.label} item={item} delay={0.05 + i * 0.06} />
                ))}
              </div>
            ) : (
              <motion.div
                {...fadeUp}
                transition={{ delay: 0.05, duration: 0.45, ease }}
                className="flex items-center gap-4 rounded-2xl bg-white px-5 py-5 sm:px-6"
                style={{ boxShadow: "inset 0 0 0 1px #e5e5e5" }}
              >
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: "#f0fdf4", color: "#15803d" }}
                >
                  <CheckCircle2 className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "#171717" }}>
                    Approvals, payouts, and refunds are clear
                  </p>
                  <p className="mt-0.5 text-sm" style={{ color: "#737373" }}>
                    New items will surface here as they arrive.
                  </p>
                </div>
              </motion.div>
            )}
          </section>

          {/* Platform pulse */}
          <section>
            <h2
              className="mb-5 font-display text-xl font-bold tracking-tight"
              style={{ color: "#171717" }}
            >
              Platform pulse
            </h2>
            <div className="grid gap-5 border-y border-[#e5e5e5] py-7 sm:grid-cols-2 lg:grid-cols-5 lg:gap-0">
              <MetricLink
                label="Travelers"
                value={data.travelers.total}
                hint={`${data.travelers.verified} verified`}
                href="/admin-portal/users?role=traveler"
                delay={0.1}
              />
              <MetricLink
                label="Organizers"
                value={data.organizers.total}
                hint={`${data.organizers.approved} approved`}
                href="/admin-portal/users?role=organizer"
                delay={0.14}
              />
              <MetricLink
                label="Live trips"
                value={data.trips.live}
                hint={`${data.trips.scheduled} scheduled`}
                href="/admin-portal/trips?status=live"
                delay={0.18}
              />
              <MetricLink
                label="Bookings"
                value={data.bookings.confirmed}
                hint={`${data.bookings.pending_payment} awaiting pay`}
                href="/admin-portal/trips"
                delay={0.22}
              />
              <MetricLink
                label="Refunded"
                value={data.cancellations.counts.refunded}
                hint={formatGHSMoney(data.cancellations.amounts.refunded)}
                href="/admin-portal/refunds?status=refunded"
                delay={0.26}
              />
            </div>
            <Link
              href="/admin-portal/messages"
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium"
              style={{ color: "#171717" }}
            >
              <Mail className="h-4 w-4" style={{ color: "#737373" }} />
              {data.messages.campaigns} campaign
              {data.messages.campaigns === 1 ? "" : "s"}
              <span style={{ color: "#a3a3a3" }}>·</span>
              {data.messages.delivered} delivered
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </section>

          {/* Trips + money */}
          <div className="grid gap-8 lg:grid-cols-5 lg:gap-10">
            <motion.section
              className="lg:col-span-3"
              {...fadeUp}
              transition={{ delay: 0.2, duration: 0.5, ease }}
            >
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h2
                    className="font-display text-xl font-bold tracking-tight"
                    style={{ color: "#171717" }}
                  >
                    Trip inventory
                  </h2>
                  <p className="mt-1 text-xs" style={{ color: "#a3a3a3" }}>
                    {tripTotal} listings across the marketplace
                  </p>
                </div>
                <Link
                  href="/admin-portal/trips"
                  className="inline-flex items-center gap-1 text-xs font-semibold"
                  style={{ color: "#171717" }}
                >
                  View all
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <TripComposition data={data.trips} />
            </motion.section>

            <motion.section
              className="lg:col-span-2"
              {...fadeUp}
              transition={{ delay: 0.26, duration: 0.5, ease }}
            >
              <div className="mb-5 flex items-center justify-between gap-3">
                <h2
                  className="font-display text-xl font-bold tracking-tight"
                  style={{ color: "#171717" }}
                >
                  Withdrawals
                </h2>
                <Link
                  href="/admin-portal/withdrawals"
                  className="inline-flex items-center gap-1 text-xs font-semibold"
                  style={{ color: "#171717" }}
                >
                  Open
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              <div
                className="rounded-2xl bg-white p-5"
                style={{ boxShadow: "inset 0 0 0 1px #e5e5e5" }}
              >
                <p
                  className="text-[11px] font-medium uppercase tracking-[0.14em]"
                  style={{ color: "#a3a3a3" }}
                >
                  In flight
                </p>
                <p
                  className="mt-2 font-display text-3xl font-bold tabular-nums tracking-tight"
                  style={{ color: "#171717" }}
                >
                  {moneyInFlight ? formatGHS(moneyInFlight) : "—"}
                </p>
                <p className="mt-1 text-xs" style={{ color: "#737373" }}>
                  Pending + processing
                </p>

                <dl className="mt-5 space-y-3 border-t border-[#e5e5e5] pt-4">
                  {(
                    [
                      [
                        "Processing",
                        data.withdrawals.counts.processing,
                        data.withdrawals.amounts.processing,
                      ],
                      [
                        "Pending review",
                        data.withdrawals.counts.pending,
                        data.withdrawals.amounts.pending,
                      ],
                      [
                        "Paid",
                        data.withdrawals.counts.success,
                        data.withdrawals.amounts.success,
                      ],
                      [
                        "Rejected",
                        data.withdrawals.counts.failed,
                        data.withdrawals.amounts.failed,
                      ],
                    ] as const
                  ).map(([label, count, amount]) => (
                    <div
                      key={label}
                      className="flex items-baseline justify-between gap-3"
                    >
                      <dt className="text-sm" style={{ color: "#737373" }}>
                        {label}
                        <span
                          className="ml-1.5 tabular-nums"
                          style={{ color: "#a3a3a3" }}
                        >
                          ×{count}
                        </span>
                      </dt>
                      <dd
                        className="text-sm font-semibold tabular-nums"
                        style={{
                          color:
                            label === "Rejected" && count > 0
                              ? "#dc2626"
                              : "#171717",
                        }}
                      >
                        {amount ? formatGHS(amount) : "—"}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </motion.section>
          </div>

          {/* Organizer funnel + shortcuts */}
          <div className="grid gap-6 lg:grid-cols-5 lg:gap-8">
            <motion.section
              className="lg:col-span-3"
              {...fadeUp}
              transition={{ delay: 0.3, duration: 0.5, ease }}
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" style={{ color: "#737373" }} />
                  <h2
                    className="font-display text-xl font-bold tracking-tight"
                    style={{ color: "#171717" }}
                  >
                    Organizer pipeline
                  </h2>
                </div>
                <p className="text-xs tabular-nums" style={{ color: "#a3a3a3" }}>
                  {data.organizers.incompleteSetup} incomplete setup
                </p>
              </div>
              <div
                className="rounded-2xl bg-white px-5 py-2 sm:px-6 sm:py-5"
                style={{ boxShadow: "inset 0 0 0 1px #e5e5e5" }}
              >
                <OrganizerFunnel data={data.organizers} />
              </div>
            </motion.section>

            <motion.section
              className="lg:col-span-2"
              {...fadeUp}
              transition={{ delay: 0.34, duration: 0.5, ease }}
            >
              <h2
                className="mb-4 font-display text-xl font-bold tracking-tight"
                style={{ color: "#171717" }}
              >
                Jump to
              </h2>
              <div className="space-y-2">
                {(
                  [
                    {
                      href: "/admin-portal/users?queue=pending_approval",
                      icon: ShieldCheck,
                      label: "Approvals queue",
                    },
                    {
                      href: "/admin-portal/refunds?queue=awaiting",
                      icon: RotateCcw,
                      label: data.cancellations.amounts?.refunded
                        ? `Refunds · ${formatGHSMoney(data.cancellations.amounts.refunded)} sent`
                        : "Refunds queue",
                    },
                    {
                      href: "/admin-portal/messages",
                      icon: Mail,
                      label: data.messages?.delivered
                        ? `Messages · ${data.messages.delivered} delivered`
                        : "Messages",
                    },
                    {
                      href: "/admin-portal/activity",
                      icon: Activity,
                      label: "Activity feed",
                    },
                    {
                      href: "/admin-portal/trips",
                      icon: Map,
                      label: "All trips",
                    },
                    {
                      href: "/admin-portal/withdrawals?queue=awaiting",
                      icon: Wallet,
                      label: "Payout queue",
                    },
                    {
                      href: "/admin-portal/users",
                      icon: Users,
                      label: "People directory",
                    },
                  ] as const
                ).map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="group flex items-center gap-3 rounded-xl bg-white px-4 py-3 transition-colors hover:bg-[#fafafa]"
                    style={{ boxShadow: "inset 0 0 0 1px #e5e5e5" }}
                  >
                    <link.icon
                      className="h-4 w-4 shrink-0"
                      style={{ color: "#737373" }}
                      strokeWidth={1.75}
                    />
                    <span
                      className="flex-1 text-sm font-medium"
                      style={{ color: "#171717" }}
                    >
                      {link.label}
                    </span>
                    <ArrowRight
                      className="h-3.5 w-3.5 opacity-40 transition-all group-hover:translate-x-0.5 group-hover:opacity-100"
                      style={{ color: "#171717" }}
                    />
                  </Link>
                ))}
              </div>
            </motion.section>
          </div>
        </div>
      )}
    </div>
  );
}

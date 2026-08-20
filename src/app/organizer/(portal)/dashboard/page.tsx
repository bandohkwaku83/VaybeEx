"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  Calendar,
  Eye,
  MapPin,
  MessageSquare,
  Plus,
  RotateCcw,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { MediaImage } from "@/components/ui/media-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { OrganizerEmptyState } from "@/components/organizer/empty-state";
import { ApiError } from "@/lib/api/client";
import {
  formatDashboardGhs,
  formatGrowth,
  getOrganizerDashboard,
  type DashboardTripItem,
  type DashboardWithdrawal,
  type OrganizerDashboardData,
  type RevenuePulseMonth,
} from "@/lib/api/organizer-dashboard";
import {
  dashboardWithdrawalLabel,
  isWithdrawalInFlight,
  normalizeWithdrawalStatus,
} from "@/lib/api/organizer-payouts";
import { formatDateRange } from "@/lib/format";
import { formatDate, cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import {
  extractOrganizerKyc,
  handleOrganizerKycError,
  kycFromAuthUser,
  ORGANIZER_KYC_CODES,
  ORGANIZER_SETUP_PATH,
  organizerCannotPublishReason,
} from "@/lib/organizer-kyc";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

function greetingForHour(h: number) {
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function tripStatusStyle(status: string) {
  switch (status) {
    case "live":
      return { background: "var(--gold-dim)", color: "var(--gold)" };
    case "completed":
      return { background: "rgba(46,125,82,0.14)", color: "#2e7d52" };
    case "processing":
    case "pending":
    case "scheduled":
      return { background: "rgba(208,138,60,0.14)", color: "var(--amber)" };
    case "draft":
      return { background: "var(--bg-secondary)", color: "var(--text-secondary)" };
    default:
      return { background: "var(--primary-dim)", color: "var(--primary)" };
  }
}

function withdrawalStatusStyle(status: string) {
  switch (normalizeWithdrawalStatus(status)) {
    case "failed":
      return { background: "rgba(181,82,58,0.12)", color: "#6b3f1d" };
    case "completed":
      return { background: "rgba(46,125,82,0.14)", color: "#2e7d52" };
    case "processing":
      return { background: "rgba(208,138,60,0.18)", color: "#c4864c" };
    default:
      return { background: "rgba(208,138,60,0.1)", color: "#c48a4a" };
  }
}

function formatBookedLabel(trip: DashboardTripItem) {
  if (trip.capacity == null) return `${trip.booked} booked`;
  return `${trip.booked}/${trip.capacity}`;
}

function RevenueBars({ values }: { values: RevenuePulseMonth[] }) {
  const max = Math.max(...values.map((v) => v.revenue), 1);
  return (
    <div className="flex h-[168px] items-end gap-2.5 sm:gap-3">
      {values.map((m, i) => {
        const isLast = i === values.length - 1;
        const height = Math.max(12, (m.revenue / max) * 140);
        return (
          <div key={`${m.month}-${i}`} className="flex min-w-0 flex-1 flex-col items-center gap-2">
            <motion.div
              className="relative w-full origin-bottom overflow-hidden rounded-lg"
              initial={{ height: 0, opacity: 0.4 }}
              animate={{ height, opacity: 1 }}
              transition={{
                duration: 0.7,
                delay: 0.08 * i,
                ease: [0.16, 1, 0.3, 1],
              }}
              style={{
                background: isLast
                  ? "var(--gradient-brand)"
                  : "linear-gradient(180deg, rgba(107,63,29,0.28) 0%, rgba(107,63,29,0.12) 100%)",
              }}
              title={formatDashboardGhs(m.revenue)}
            >
              {isLast && (
                <span
                  className="absolute inset-x-0 top-0 h-1/2 opacity-40"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(196,134,76,0.55), transparent)",
                  }}
                />
              )}
            </motion.div>
            <span
              className="text-[10px] font-medium uppercase tracking-wider sm:text-[11px]"
              style={{ color: isLast ? "var(--primary)" : "var(--text-tertiary)" }}
            >
              {m.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function TripThumbCard({
  trip,
  index,
}: {
  trip: DashboardTripItem;
  index: number;
}) {
  const badge = tripStatusStyle(trip.status);
  const isLive = trip.status === "live";

  return (
    <motion.div
      {...fadeUp}
      transition={{ delay: 0.12 + index * 0.06, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        href={`/organizer/trips/${trip.id}`}
        className="group relative block overflow-hidden rounded-2xl border transition-shadow duration-300 hover:shadow-[0_18px_40px_-24px_rgba(86,47,24,0.45)]"
        style={{ borderColor: "var(--border)", background: "var(--surface)" }}
      >
        <div className="relative aspect-[16/10] overflow-hidden">
          <MediaImage
            src={trip.coverImage}
            fallback="/images/beautiful-nature.jpg"
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, transparent 35%, rgba(20,12,6,0.72) 100%)",
            }}
          />
          <Badge className="absolute left-3 top-3 border-0 capitalize" style={badge}>
            {trip.status}
          </Badge>
          {isLive && (
            <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/35 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-400" />
              </span>
              Live
            </span>
          )}
          <div className="absolute inset-x-0 bottom-0 p-3.5">
            <p className="font-display text-base font-bold leading-snug text-white line-clamp-2">
              {trip.title}
            </p>
            {trip.destination && (
              <p className="mt-1 flex items-center gap-1 text-xs text-white/75">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">{trip.destination}</span>
              </p>
            )}
          </div>
        </div>

        <div className="space-y-3 p-3.5">
          <div className="flex items-center justify-between gap-2 text-xs">
            <span style={{ color: "var(--text-tertiary)" }}>
              {trip.startDate && trip.endDate
                ? formatDateRange(trip.startDate, trip.endDate)
                : trip.startDate
                  ? formatDate(trip.startDate)
                  : "Dates TBD"}
            </span>
            {trip.revenue != null && (
              <span className="font-semibold" style={{ color: "var(--primary)" }}>
                {formatDashboardGhs(trip.revenue)}
              </span>
            )}
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between text-[11px]">
              <span
                className="inline-flex items-center gap-1"
                style={{ color: "var(--text-secondary)" }}
              >
                <Users className="h-3 w-3" />
                {formatBookedLabel(trip)}
              </span>
              {trip.fillRate > 0 && (
                <span style={{ color: "var(--text-tertiary)" }}>
                  {trip.fillRate}% full
                </span>
              )}
            </div>
            {trip.fillRate > 0 ? (
              <Progress
                value={trip.fillRate}
                className="h-1.5"
                style={{ background: "var(--bg-secondary)" }}
              />
            ) : (
              <div
                className="h-1.5 rounded-full"
                style={{ background: "var(--bg-secondary)" }}
              />
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function WithdrawalRow({
  withdrawal,
  index,
}: {
  withdrawal: DashboardWithdrawal;
  index: number;
}) {
  const badge = withdrawalStatusStyle(withdrawal.status);
  const statusLabel = dashboardWithdrawalLabel(withdrawal.status);
  return (
    <li
      className="flex items-center gap-3 border-b px-5 py-3.5 transition-colors last:border-b-0"
      style={{ borderColor: "var(--border)" }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLLIElement).style.background = "var(--bg-secondary)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLLIElement).style.background = "transparent";
      }}
    >
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
        style={{
          background: index % 2 === 0 ? "var(--primary-dim)" : "var(--gold-dim)",
          color: index % 2 === 0 ? "var(--primary)" : "var(--gold)",
        }}
      >
        <Wallet className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium" style={{ color: "var(--text)" }}>
          {withdrawal.tripTitle}
        </p>
        <p className="truncate text-xs" style={{ color: "var(--text-tertiary)" }}>
          {withdrawal.momoProviderLabel} · {withdrawal.momoNumberMasked} ·{" "}
          {formatDate(withdrawal.createdAt)}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>
          {formatDashboardGhs(withdrawal.amount)}
        </p>
        <Badge className="mt-1 border-0" style={badge}>
          {statusLabel}
        </Badge>
      </div>
    </li>
  );
}

export default function OrganizerDashboard() {
  const router = useRouter();
  const { user, setKyc } = useAuth();
  const kyc = kycFromAuthUser(user);
  const canPublish = kyc.canPublish;
  const [data, setData] = useState<OrganizerDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hour] = useState(() => new Date().getHours());

  const loadDashboard = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!opts?.silent) setIsLoading(true);
      try {
        const dashboard = await getOrganizerDashboard({
          tripsLimit: 5,
          withdrawalsLimit: 5,
        });
        setData(dashboard);
        if (dashboard.kyc) setKyc(dashboard.kyc);
      } catch (error) {
        if (opts?.silent) return;
        if (error instanceof ApiError && error.status === 401) {
          toast.error("Session expired. Please sign in again.");
          router.push(
            `/organizer/login?redirect=${encodeURIComponent("/organizer/dashboard")}`
          );
          return;
        }
        if (error instanceof ApiError && error.status === 403) {
          const extracted = extractOrganizerKyc(error.data);
          if (extracted) setKyc(extracted);
          if (error.code !== ORGANIZER_KYC_CODES.REJECTED) {
            handleOrganizerKycError(error, router);
            return;
          }
        }
        toast.error(
          error instanceof ApiError
            ? error.message
            : "Could not load dashboard"
        );
      } finally {
        if (!opts?.silent) setIsLoading(false);
      }
    },
    [router, setKyc]
  );

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const hasInFlightWithdrawal = useMemo(
    () =>
      (data?.recentWithdrawals ?? []).some((w) =>
        isWithdrawalInFlight(w.status)
      ),
    [data?.recentWithdrawals]
  );

  useEffect(() => {
    if (!hasInFlightWithdrawal) return;
    const id = window.setInterval(() => {
      void loadDashboard({ silent: true });
    }, 20_000);
    return () => window.clearInterval(id);
  }, [hasInFlightWithdrawal, loadDashboard]);

  useEffect(() => {
    const onFocus = () => {
      void loadDashboard({ silent: true });
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [loadDashboard]);

  const firstName =
    data?.organizer.fullName?.split(" ")[0]?.trim() || "there";
  const greeting = greetingForHour(hour);
  const pendingRefunds = data?.quickActions.pendingRefunds ?? 0;
  const unreadNotifications = data?.quickActions.unreadNotifications ?? 0;
  const trips = data?.trips.items ?? [];
  const activeTrips = data?.stats.activeTrips.value ?? 0;
  const revenueGrowth = formatGrowth(data?.stats.revenue.growthPercent);
  const travelersGrowth = formatGrowth(data?.stats.travelers.growthPercent);
  const viewsGrowth = formatGrowth(data?.stats.views.growthPercent);
  const avgRating =
    data?.stats.avgRating.value == null
      ? "—"
      : String(data.stats.avgRating.value);
  const pulseMonths = data?.revenuePulse.months ?? [];
  const thisMonthRevenue = data?.revenuePulse.thisMonth.revenue ?? 0;
  const withdrawals = data?.recentWithdrawals ?? [];

  const kpis = [
    {
      label: "Revenue",
      value: formatDashboardGhs(data?.stats.revenue.value ?? 0),
      hint: revenueGrowth ? `${revenueGrowth} vs last month` : "vs last month",
      showTrend: revenueGrowth != null && (data?.stats.revenue.growthPercent ?? 0) > 0,
      icon: Wallet,
      accent: true,
    },
    {
      label: "Active trips",
      value: String(data?.stats.activeTrips.value ?? 0),
      hint: `${data?.stats.activeTrips.totalListings ?? 0} total listings`,
      showTrend: false,
      icon: Sparkles,
      accent: false,
    },
    {
      label: "Travelers",
      value: String(data?.stats.travelers.value ?? 0),
      hint: travelersGrowth ? `${travelersGrowth} this month` : "this month",
      showTrend:
        travelersGrowth != null && (data?.stats.travelers.growthPercent ?? 0) > 0,
      icon: Users,
      accent: false,
    },
    {
      label: "Views",
      value: (data?.stats.views.value ?? 0).toLocaleString(),
      hint: viewsGrowth ? `${viewsGrowth} this month` : "All time",
      showTrend: viewsGrowth != null && (data?.stats.views.growthPercent ?? 0) > 0,
      icon: Eye,
      accent: false,
    },
    {
      label: "Avg rating",
      value: avgRating,
      hint: "Across reviews",
      showTrend: false,
      icon: Star,
      accent: false,
    },
  ];

  const quickActions = [
    {
      href: canPublish ? "/organizer/trips/new" : ORGANIZER_SETUP_PATH,
      label: "Create trip",
      desc: canPublish ? "Launch a new listing" : "Available after approval",
      icon: Plus,
      accent: "var(--primary)",
      dim: "var(--primary-dim)",
      badge: null as number | null,
      disabled: !canPublish,
    },
    {
      href: "/organizer/messages",
      label: "Messages",
      desc: "Broadcast to travelers",
      icon: MessageSquare,
      accent: "var(--gold)",
      dim: "var(--gold-dim)",
      badge: null,
      disabled: false,
    },
    {
      href: "/organizer/payouts",
      label: "Withdraw",
      desc: "Cash out earnings",
      icon: Wallet,
      accent: "var(--amber)",
      dim: "rgba(208,138,60,0.14)",
      badge: null,
      disabled: false,
    },
    {
      href: "/organizer/refunds",
      label: "Refunds",
      desc: pendingRefunds > 0 ? `${pendingRefunds} waiting` : "All clear",
      icon: RotateCcw,
      accent: pendingRefunds > 0 ? "var(--coral)" : "var(--primary)",
      dim:
        pendingRefunds > 0
          ? "rgba(181,82,58,0.12)"
          : "var(--primary-dim)",
      badge: pendingRefunds > 0 ? pendingRefunds : null,
      disabled: false,
    },
  ];

  return (
    <div className="relative mx-auto max-w-6xl overflow-x-hidden p-4 sm:p-6 lg:p-8">
      <div
        className="pointer-events-none absolute -left-24 -top-20 h-72 w-72 rounded-full opacity-50 blur-3xl"
        style={{ background: "rgba(196,134,76,0.18)" }}
      />
      <div
        className="pointer-events-none absolute -right-16 top-40 h-64 w-64 rounded-full opacity-40 blur-3xl"
        style={{ background: "rgba(107,63,29,0.12)" }}
      />

      <motion.section
        {...fadeUp}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative mb-7 overflow-hidden rounded-3xl border"
        style={{
          borderColor: "var(--border)",
          background:
            "linear-gradient(135deg, #fff 0%, #f7f0e2 48%, #efe4d2 100%)",
        }}
      >
        <div
          className="pointer-events-none absolute inset-y-0 right-0 hidden w-[42%] md:block"
          style={{
            maskImage: "linear-gradient(90deg, transparent 0%, black 35%)",
            WebkitMaskImage: "linear-gradient(90deg, transparent 0%, black 35%)",
          }}
        >
          <MediaImage
            src="/images/beautiful-nature.jpg"
            alt=""
            fill
            sizes="42vw"
            className="object-cover"
          />
        </div>
        <div
          className="pointer-events-none absolute inset-y-0 right-0 hidden w-[42%] md:block"
          style={{
            background:
              "linear-gradient(90deg, rgba(247,240,226,0.95) 0%, rgba(42,27,15,0.25) 100%)",
          }}
        />

        <div className="relative flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.22em]"
              style={{ color: "var(--gold)" }}
            >
              Organizer home
            </p>
            <h1
              className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl"
              style={{ color: "var(--text)" }}
            >
              {greeting}, {firstName}.
            </h1>
            <p
              className="mt-2 max-w-md text-sm leading-relaxed sm:text-[15px]"
              style={{ color: "var(--text-secondary)" }}
            >
              {isLoading
                ? "Loading your expedition overview…"
                : activeTrips > 0
                  ? `You have ${activeTrips} live trip${activeTrips === 1 ? "" : "s"} filling seats right now.`
                  : "Your next expedition starts with a listing travelers can book today."}
            </p>
            {unreadNotifications > 0 ? (
              <button
                type="button"
                onClick={() =>
                  window.dispatchEvent(new Event("organizer:open-notifications"))
                }
                className="mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold"
                style={{
                  background: "var(--primary-dim)",
                  color: "var(--primary)",
                }}
              >
                <Bell className="h-3.5 w-3.5" />
                {unreadNotifications} unread notification
                {unreadNotifications === 1 ? "" : "s"}
              </button>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              asChild={canPublish}
              disabled={!canPublish}
              className="px-5"
              style={{
                background: "var(--gradient-brand)",
                color: "#fbf7f1",
                boxShadow: "var(--glow-gold)",
                opacity: canPublish ? 1 : 0.55,
              }}
              onClick={
                canPublish
                  ? undefined
                  : () => toast.error(organizerCannotPublishReason(kyc))
              }
            >
              {canPublish ? (
                <Link href="/organizer/trips/new">
                  <Plus className="h-4 w-4" />
                  Create trip
                </Link>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Create trip
                </>
              )}
            </Button>
            <Button
              asChild
              variant="outline"
              className="bg-white/70 backdrop-blur-sm"
              style={{ borderColor: "var(--border-strong)", color: "var(--text)" }}
            >
              <Link href="/organizer/payouts">
                View payouts
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </motion.section>

      {kyc.status === "rejected" && (
        <div
          className="mb-6 rounded-2xl border p-4"
          style={{
            borderColor: "rgba(181,82,58,0.28)",
            background: "rgba(181,82,58,0.08)",
          }}
        >
          <p className="text-sm font-semibold" style={{ color: "var(--coral)" }}>
            Application not approved.
          </p>
          {kyc.rejectionReason ? (
            <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--text)" }}>
              {kyc.rejectionReason}
            </p>
          ) : null}
          {kyc.canResubmit ? (
            <Link
              href={ORGANIZER_SETUP_PATH}
              className="mt-3 inline-flex text-sm font-semibold"
              style={{ color: "var(--primary)" }}
            >
              Update and resubmit
            </Link>
          ) : null}
        </div>
      )}

      {kyc.status === "pending" && (
        <div
          className="mb-6 rounded-2xl border p-4"
          style={{
            borderColor: "rgba(208,138,60,0.35)",
            background:
              "linear-gradient(90deg, rgba(208,138,60,0.12), rgba(208,138,60,0.04))",
          }}
        >
          <p className="text-sm font-semibold" style={{ color: "var(--amber)" }}>
            {kyc.resubmissionCount > 0
              ? "We received your update and are reviewing it again."
              : "Your profile is under review. We’ll email you when there’s a decision."}
          </p>
        </div>
      )}

      {pendingRefunds > 0 && (
        <motion.div
          {...fadeUp}
          transition={{ delay: 0.05, duration: 0.4 }}
          className="mb-6 flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between"
          style={{
            borderColor: "rgba(208,138,60,0.35)",
            background:
              "linear-gradient(90deg, rgba(208,138,60,0.12), rgba(208,138,60,0.04))",
          }}
        >
          <div className="flex items-start gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              style={{ background: "rgba(208,138,60,0.2)", color: "var(--amber)" }}
            >
              <RotateCcw className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium" style={{ color: "var(--text)" }}>
                {pendingRefunds} refund request{pendingRefunds === 1 ? "" : "s"} need
                action
              </p>
              <p className="mt-0.5 text-sm" style={{ color: "var(--text-secondary)" }}>
                Travelers are waiting — review and process refunds.
              </p>
            </div>
          </div>
          <Button
            asChild
            
            style={{ background: "var(--gradient-brand)", color: "#fbf7f1" }}
          >
            <Link href="/organizer/refunds">Review refunds</Link>
          </Button>
        </motion.div>
      )}

      <motion.div
        {...fadeUp}
        transition={{ delay: 0.06, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="mb-8 overflow-hidden rounded-2xl"
        style={{
          background: "var(--surface)",
          boxShadow: "inset 0 0 0 1px rgba(86, 47, 24, 0.12)",
        }}
      >
        <div className="grid sm:grid-cols-2 xl:grid-cols-5">
          {kpis.map((kpi, i) => {
            const Icon = kpi.icon;
            return (
              <div
                key={kpi.label}
                className={cn(
                  "relative min-h-[116px] px-5 py-5",
                  i > 0 && "border-t xl:border-t-0 xl:border-l",
                  i === 1 && "sm:border-t-0 sm:border-l",
                  i > 1 && "sm:border-t",
                  i === 2 && "xl:border-t-0",
                  i === 3 && "sm:border-l xl:border-t-0",
                  i === 4 && "sm:col-span-2 xl:col-span-1 xl:border-t-0 xl:border-l"
                )}
                style={{
                  borderColor: "rgba(86, 47, 24, 0.12)",
                  background: kpi.accent
                    ? "var(--primary)"
                    : i % 2 === 0
                      ? "var(--surface)"
                      : "rgba(247, 240, 226, 0.7)",
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <p
                    className="text-[11px] font-semibold uppercase tracking-[0.16em]"
                    style={{
                      color: kpi.accent
                        ? "rgba(251,247,241,0.72)"
                        : "var(--text-secondary)",
                    }}
                  >
                    {kpi.label}
                  </p>
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                    style={{
                      background: kpi.accent
                        ? "rgba(251,247,241,0.14)"
                        : "var(--primary-dim)",
                      color: kpi.accent ? "#fbf7f1" : "var(--primary)",
                    }}
                  >
                    <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                  </span>
                </div>
                <p
                  className="mt-2.5 font-display text-[1.75rem] font-bold leading-none tracking-tight"
                  style={{
                    color: kpi.accent ? "#fbf7f1" : "var(--text)",
                  }}
                >
                  {isLoading ? "…" : kpi.value}
                </p>
                <p
                  className="mt-2.5 flex items-center gap-1 text-[12px] font-medium"
                  style={{
                    color: kpi.accent
                      ? "rgba(251,247,241,0.78)"
                      : "var(--text-secondary)",
                  }}
                >
                  {kpi.showTrend && (
                    <TrendingUp
                      className="h-3.5 w-3.5"
                      style={{ color: "var(--gold)" }}
                    />
                  )}
                  {kpi.hint}
                </p>
              </div>
            );
          })}
        </div>
      </motion.div>

      <section className="mb-8">
        <div className="mb-4">
          <h2
            className="font-display text-lg font-bold"
            style={{ color: "var(--text)" }}
          >
            Quick access
          </h2>
          <p className="mt-0.5 text-sm" style={{ color: "var(--text-secondary)" }}>
            Jump into common organizer tasks
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {quickActions.map((action, i) => {
          const Icon = action.icon;
          return (
            <motion.div
              key={action.href}
              {...fadeUp}
              transition={{ delay: 0.15 + i * 0.04, duration: 0.4 }}
            >
              <Link
                href={action.disabled ? "#" : action.href}
                onClick={(e) => {
                  if (!action.disabled) return;
                  e.preventDefault();
                  toast.error(organizerCannotPublishReason(kyc));
                }}
                className="group relative block min-h-[108px] overflow-hidden rounded-2xl border p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-18px_rgba(86,47,24,0.35)] sm:min-h-[116px] sm:p-5"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--surface)",
                  opacity: action.disabled ? 0.6 : 1,
                }}
              >
                {action.badge != null && (
                  <span
                    className="absolute right-3 top-3 z-10 flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold text-white"
                    style={{ background: "var(--coral)" }}
                  >
                    {action.badge}
                  </span>
                )}

                <span className="relative z-[1] block max-w-[70%] pr-2">
                  <span
                    className="block text-sm font-semibold sm:text-[15px]"
                    style={{ color: "var(--text)" }}
                  >
                    {action.label}
                  </span>
                  <span
                    className="mt-1 block text-[11px] leading-snug sm:text-[12px]"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    {action.desc}
                  </span>
                </span>

                <span
                  aria-hidden
                  className="pointer-events-none absolute -bottom-5 -right-4 flex h-20 w-20 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-105 sm:-bottom-6 sm:-right-5 sm:h-24 sm:w-24"
                  style={{ background: action.dim, color: action.accent }}
                >
                  <Icon className="h-8 w-8 opacity-80 sm:h-10 sm:w-10" strokeWidth={1.5} />
                </span>
              </Link>
            </motion.div>
          );
        })}
        </div>
      </section>

      <section className="mb-8">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2
              className="font-display text-lg font-bold"
              style={{ color: "var(--text)" }}
            >
              Your trips
            </h2>
            <p className="mt-0.5 text-sm" style={{ color: "var(--text-secondary)" }}>
              Latest listings with seats filling
            </p>
          </div>
          <Link
            href="/organizer/trips/new"
            className="inline-flex items-center gap-1 text-sm font-semibold transition-colors"
            style={{ color: "var(--primary)" }}
          >
            See all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="aspect-[5/4] animate-pulse rounded-2xl"
                style={{ background: "var(--bg-secondary)" }}
              />
            ))}
          </div>
        ) : trips.length === 0 ? (
          <OrganizerEmptyState
            icon={Calendar}
            title="No trips yet"
            description={
              canPublish
                ? "Publish your first expedition and start taking bookings."
                : organizerCannotPublishReason(kyc)
            }
            action={
              canPublish
                ? { href: "/organizer/trips/new", label: "+ Create your first trip" }
                : kyc.canResubmit
                  ? { href: ORGANIZER_SETUP_PATH, label: "Update and resubmit" }
                  : undefined
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {trips.slice(0, 5).map((trip, i) => (
              <TripThumbCard key={trip.id} trip={trip} index={i} />
            ))}
          </div>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.section
          {...fadeUp}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="rounded-2xl border p-5"
          style={{ borderColor: "var(--border)", background: "var(--surface)" }}
        >
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <h2
                className="font-display text-lg font-bold"
                style={{ color: "var(--text)" }}
              >
                Revenue pulse
              </h2>
              <p className="mt-0.5 text-sm" style={{ color: "var(--text-secondary)" }}>
                Last {pulseMonths.length || 7} months
              </p>
            </div>
            {revenueGrowth != null && (data?.stats.revenue.growthPercent ?? 0) > 0 && (
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                style={{ background: "var(--gold-dim)", color: "var(--gold)" }}
              >
                <TrendingUp className="h-3 w-3" />
                {revenueGrowth}
              </span>
            )}
          </div>
          {isLoading ? (
            <div
              className="h-[168px] animate-pulse rounded-xl"
              style={{ background: "var(--bg-secondary)" }}
            />
          ) : pulseMonths.length === 0 ? (
            <OrganizerEmptyState
              icon={TrendingUp}
              title="No revenue yet"
              description="Revenue from bookings will show up here month by month."
              action={{ href: "/organizer/payouts", label: "View payouts" }}
              framed={false}
              className="py-10 sm:py-12"
            />
          ) : (
            <RevenueBars values={pulseMonths} />
          )}
          <div
            className="mt-5 flex items-center justify-between rounded-xl px-3.5 py-3"
            style={{ background: "var(--bg-secondary)" }}
          >
            <div>
              <p
                className="text-[11px] uppercase tracking-wider"
                style={{ color: "var(--text-tertiary)" }}
              >
                This month
              </p>
              <p
                className="font-display text-xl font-bold"
                style={{ color: "var(--text)" }}
              >
                {isLoading ? "…" : formatDashboardGhs(thisMonthRevenue)}
              </p>
            </div>
            <Link
              href="/organizer/payouts"
              className="inline-flex items-center gap-1 text-sm font-semibold"
              style={{ color: "var(--primary)" }}
            >
              Details <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </motion.section>

        <motion.section
          {...fadeUp}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="rounded-2xl border"
          style={{ borderColor: "var(--border)", background: "var(--surface)" }}
        >
          <div
            className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4"
            style={{ borderColor: "var(--border)" }}
          >
            <div>
              <h2
                className="font-display text-lg font-bold"
                style={{ color: "var(--text)" }}
              >
                Recent withdrawals
              </h2>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Latest cash-outs to your MoMo accounts
              </p>
            </div>
            <Link
              href="/organizer/payouts"
              className="inline-flex items-center gap-1 text-sm font-semibold"
              style={{ color: "var(--primary)" }}
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-3 p-5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-14 animate-pulse rounded-xl"
                  style={{ background: "var(--bg-secondary)" }}
                />
              ))}
            </div>
          ) : withdrawals.length === 0 ? (
            <OrganizerEmptyState
              icon={Wallet}
              title="No withdrawals yet"
              description="When you request a payout, recent requests will appear here."
              action={{ href: "/organizer/payouts", label: "Go to payouts" }}
              framed={false}
              className="py-10 sm:py-12"
            />
          ) : (
            <ul>
              {withdrawals.map((w, i) => (
                <WithdrawalRow key={w.id} withdrawal={w} index={i} />
              ))}
            </ul>
          )}
        </motion.section>
      </div>
    </div>
  );
}

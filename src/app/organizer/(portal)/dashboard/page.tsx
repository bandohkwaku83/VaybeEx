"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Eye, TrendingUp, Users, DollarSign, BarChart3, ArrowRight, Settings,
  RotateCcw, Search, Filter, Star, Clock, MapPin, ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { ORGANIZER_ID } from "@/hooks/use-organizer-trips";
import { getPendingRefundCount } from "@/lib/cancellation-requests";
import { trips, organizerPayouts } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

const myTrips = trips.filter((t) => t.organizerId === "org-1");

/* ── Hero stat — gets the bold filled treatment, like "Total Earnings"
   in the reference image ── */
const heroStat = {
  label: "Total Revenue",
  value: formatCurrency(38200),
  trend: "+12%",
  trendUp: true,
  note: "vs last month",
};

/* ── Secondary stats — neutral cards ── */
const stats = [
  {
    label: "Active Trips",
    value: String(myTrips.filter((t) => t.status === "live").length),
    icon: TrendingUp,
    trend: "+2",
    trendUp: true,
  },
  {
    label: "Total Bookings",
    value: String(myTrips.reduce((s, t) => s + t.booked, 0)),
    icon: Users,
    trend: "+8%",
    trendUp: true,
  },
  {
    label: "Total Views",
    value: String(myTrips.reduce((s, t) => s + t.views, 0)),
    icon: Eye,
    trend: "+24%",
    trendUp: true,
  },
  {
    label: "Avg. Rating",
    value: "4.8",
    icon: Star,
    trend: "-0.1",
    trendUp: false,
  },
];

/* ── Mock revenue-by-month for the bar chart, in the same spirit as
   the reference's "Profit and Loss" panel ── */
const revenueByMonth = [
  { month: "Jan", value: 18 },
  { month: "Feb", value: 24 },
  { month: "Mar", value: 21 },
  { month: "Apr", value: 30 },
  { month: "May", value: 27 },
  { month: "Jun", value: 35 },
  { month: "Jul", value: 38 },
];
const maxRevenue = Math.max(...revenueByMonth.map((m) => m.value));

function statusBadgeStyle(status: string) {
  switch (status) {
    case "completed":
    case "live":
      return { background: "var(--gold-dim)", color: "var(--gold)" };
    case "processing":
    case "pending":
      return { background: "rgba(208,138,60,0.14)", color: "var(--amber)" };
    case "draft":
      return { background: "var(--bg-secondary)", color: "var(--text-secondary)" };
    default:
      return { background: "var(--primary-dim)", color: "var(--primary)" };
  }
}

export default function OrganizerDashboard() {
  const { user } = useAuth();
  const [pendingRefunds, setPendingRefunds] = useState(0);
  const [search, setSearch] = useState("");

  // useEffect(() => {
  //   setPendingRefunds(getPendingRefundCount(ORGANIZER_ID));
  // }, []);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  })();

  const filteredPayouts = organizerPayouts.filter((p) =>
    p.tripTitle.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6" style={{ background: "var(--bg)" }} >
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold" style={{ color: "var(--text)" }}>
            {greeting}, {user?.name?.split(" ")[0] ?? "Organizer"}
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
            Stay on top of your trips, monitor bookings, and track payouts.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            asChild
            className="rounded-xl"
            style={{ borderColor: "var(--border-strong)", color: "var(--text)" }}
          >
            <Link href="/organizer/settings">
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </Button>
          <Button
            asChild
            className="rounded-xl"
            style={{ background: "var(--gradient-brand)", color: "#fbf7f1", boxShadow: "var(--glow-gold)" }}
          >
            <Link href="/organizer/trips/new">Create New Trip</Link>
          </Button>
        </div>
      </div>

      {/* ── Refund alert ───────────────────────────────────────── */}
      {pendingRefunds > 0 && (
        <Card
          className="mb-6 border shadow-none"
          style={{ borderColor: "rgba(208,138,60,0.3)", background: "rgba(208,138,60,0.08)" }}
        >
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{ background: "rgba(208,138,60,0.18)", color: "var(--amber)" }}
              >
                <RotateCcw className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium" style={{ color: "var(--text)" }}>
                  {pendingRefunds} refund request{pendingRefunds === 1 ? "" : "s"} need action
                </p>
                <p className="mt-0.5 text-sm" style={{ color: "var(--text-secondary)" }}>
                  Travelers have requested cancellations. Review and process refunds.
                </p>
              </div>
            </div>
            <Button
              asChild
              className="rounded-xl"
              style={{ background: "var(--gradient-brand)", color: "#fbf7f1" }}
            >
              <Link href="/organizer/refunds">Review refunds</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ── Stat row — hero card (filled) + 4 neutral cards ──────
          mirrors the reference's "Total Earnings" filled tile sitting
          among plainer stat tiles ── */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {/* hero */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="sm:col-span-2 xl:col-span-1"
        >
          <Card
            className="h-full border-0 shadow-none"
            style={{ background: "var(--gradient-brand)" }}
          >
            <CardContent className="flex h-full flex-col justify-between p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium" style={{ color: "rgba(251,247,241,0.75)" }}>
                  {heroStat.label}
                </span>
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-lg"
                  style={{ background: "rgba(251,247,241,0.16)" }}
                >
                  <DollarSign className="h-3.5 w-3.5" style={{ color: "#fbf7f1" }} />
                </div>
              </div>
              <div className="mt-3">
                <p className="font-display text-2xl font-bold" style={{ color: "#fbf7f1" }}>
                  {heroStat.value}
                </p>
                <div className="mt-1.5 flex items-center gap-1 text-xs" style={{ color: "rgba(251,247,241,0.75)" }}>
                  <ArrowUpRight className="h-3 w-3" style={{ color: "var(--gold)" }} />
                  <span style={{ color: "var(--gold)" }}>{heroStat.trend}</span>
                  {heroStat.note}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* secondary stats */}
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (i + 1) * 0.05 }}
          >
            <Card className="h-full border shadow-none" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
              <CardContent className="flex h-full flex-col justify-between p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>{stat.label}</span>
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-lg"
                    style={{ background: "var(--primary-dim)" }}
                  >
                    <stat.icon className="h-3.5 w-3.5" style={{ color: "var(--primary)" }} />
                  </div>
                </div>
                <div className="mt-3">
                  <p className="font-display text-2xl font-bold" style={{ color: "var(--text)" }}>{stat.value}</p>
                  <div
                    className="mt-1.5 flex items-center gap-1 text-xs"
                    style={{ color: stat.trendUp ? "var(--gold)" : "var(--coral)" }}
                  >
                    {stat.trendUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {stat.trend}
                    <span style={{ color: "var(--text-tertiary)" }}>this month</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* ── Revenue chart + My Trips ──────────────────────────────
          mirrors the reference's "Profit and Loss" bar chart panel ── */}
      <div className="mb-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="border shadow-none" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="font-display text-base" style={{ color: "var(--text)" }}>
                Revenue
              </CardTitle>
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                Earnings across the last 7 months
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-tertiary)" }}>
              <span className="h-2 w-2 rounded-full" style={{ background: "var(--primary)" }} />
              Revenue (GHS &apos;00)
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex h-[180px] items-end gap-3 pt-4">
              {revenueByMonth.map((m) => (
                <div key={m.month} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className="w-full rounded-lg transition-all"
                    style={{
                      height: `${(m.value / maxRevenue) * 140}px`,
                      background:
                        m.month === revenueByMonth[revenueByMonth.length - 1].month
                          ? "var(--gradient-brand)"
                          : "var(--primary-dim)",
                    }}
                  />
                  <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>{m.month}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-none" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-display text-base" style={{ color: "var(--text)" }}>My Trips</CardTitle>
            <Button variant="ghost" size="sm" asChild style={{ color: "var(--primary)" }}>
              <Link href="/organizer/trips/new">+ New</Link>
            </Button>
          </CardHeader>
          <CardContent className="max-h-[260px] space-y-3 overflow-y-auto">
            {myTrips.map((trip) => {
              const pct = (trip.booked / trip.capacity) * 100;
              const badgeStyle = statusBadgeStyle(trip.status);
              return (
                <Link
                  key={trip.id}
                  href={`/organizer/trips/${trip.id}`}
                  className="block rounded-xl border p-3.5 transition-colors"
                  style={{ borderColor: "var(--border)" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border-strong)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border)")}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium" style={{ color: "var(--text)" }}>{trip.title}</p>
                      <p className="mt-0.5 flex items-center gap-1 text-xs" style={{ color: "var(--text-tertiary)" }}>
                        <Users className="h-3 w-3" /> {trip.booked}/{trip.capacity} booked · Min {trip.minCapacity}
                      </p>
                    </div>
                    <Badge style={{ ...badgeStyle, border: "none" }}>{trip.status}</Badge>
                  </div>
                  <Progress
                    value={pct}
                    className="mt-2.5 h-1.5"
                    style={{ background: "var(--bg-secondary)" }}
                  />
                  <div className="mt-2 flex items-center justify-between text-xs" style={{ color: "var(--text-tertiary)" }}>
                    <span>{trip.views} views · {trip.conversions} conversions</span>
                    <span style={{ color: "var(--primary)" }}>{formatCurrency(trip.price * trip.booked)}</span>
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* ── Recent Activity table ─────────────────────────────────
          mirrors the reference's searchable "Recent Activities" table ── */}
      <Card className="mb-6 border shadow-none" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="font-display text-base" style={{ color: "var(--text)" }}>
            Recent Withdrawals
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2"
                style={{ color: "var(--text-tertiary)" }}
              />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search trip..."
                className="h-9 w-44 rounded-xl pl-9 text-sm"
                style={{ borderColor: "var(--border-strong)" }}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-9 rounded-xl"
              style={{ borderColor: "var(--border-strong)", color: "var(--text-secondary)" }}
            >
              <Filter className="h-3.5 w-3.5" />
              Filter
            </Button>
            <Button variant="ghost" size="sm" asChild style={{ color: "var(--primary)" }}>
              <Link href="/organizer/withdrawals">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y" style={{ borderColor: "var(--border)" }}>
                  {["Trip", "Amount", "Status", "Date"].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-2.5 text-left text-xs font-medium uppercase tracking-wider"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredPayouts.slice(0, 6).map((p) => {
                  const badgeStyle = statusBadgeStyle(p.status);
                  return (
                    <tr
                      key={p.id}
                      className="border-b last:border-0 transition-colors"
                      style={{ borderColor: "var(--border)" }}
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                            style={{ background: "var(--primary-dim)" }}
                          >
                            <MapPin className="h-3.5 w-3.5" style={{ color: "var(--primary)" }} />
                          </div>
                          <span style={{ color: "var(--text)" }}>{p.tripTitle}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 font-medium" style={{ color: "var(--text)" }}>
                        {formatCurrency(p.amount)}
                      </td>
                      <td className="px-5 py-3">
                        <Badge style={{ ...badgeStyle, border: "none" }}>{p.status}</Badge>
                      </td>
                      <td className="px-5 py-3 flex items-center gap-1.5" style={{ color: "var(--text-tertiary)" }}>
                        <Clock className="h-3 w-3" /> {p.date}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ── Quick analytics ────────────────────────────────────── */}
      <Card className="border shadow-none" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display text-base" style={{ color: "var(--text)" }}>
            <BarChart3 className="h-4 w-4" style={{ color: "var(--primary)" }} /> Quick Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            {myTrips.filter((t) => t.status === "live").map((trip) => (
              <Link
                key={trip.id}
                href={`/organizer/trips/${trip.id}/analytics`}
                className="rounded-xl p-4 transition-colors"
                style={{ background: "var(--bg-secondary)" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "var(--primary-dim)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "var(--bg-secondary)")}
              >
                <p className="text-sm font-medium" style={{ color: "var(--text)" }}>{trip.title}</p>
                <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="font-display text-lg font-bold" style={{ color: "var(--text)" }}>{trip.views}</p>
                    <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Views</p>
                  </div>
                  <div>
                    <p className="font-display text-lg font-bold" style={{ color: "var(--primary)" }}>
                      {trip.conversions > 0 ? ((trip.conversions / trip.views) * 100).toFixed(1) : 0}%
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Conv.</p>
                  </div>
                  <div>
                    <p className="font-display text-lg font-bold" style={{ color: "var(--text)" }}>
                      {formatCurrency(trip.price * trip.booked)}
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Revenue</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
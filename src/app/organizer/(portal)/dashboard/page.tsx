"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Eye, TrendingUp, Users, DollarSign, BarChart3, ArrowRight, Settings, RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import { ORGANIZER_ID } from "@/hooks/use-organizer-trips";
import { getPendingRefundCount } from "@/lib/cancellation-requests";
import { trips, organizerPayouts } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

const myTrips = trips.filter((t) => t.organizerId === "org-1");

const stats = [
  { label: "Total Revenue", value: formatCurrency(38200), icon: DollarSign, color: "text-teal-600 bg-teal-50" },
  { label: "Active Trips", value: String(myTrips.filter((t) => t.status === "live").length), icon: TrendingUp, color: "text-emerald-600 bg-emerald-50" },
  { label: "Total Bookings", value: String(myTrips.reduce((s, t) => s + t.booked, 0)), icon: Users, color: "text-blue-600 bg-blue-50" },
  { label: "Total Views", value: String(myTrips.reduce((s, t) => s + t.views, 0)), icon: Eye, color: "text-purple-600 bg-purple-50" },
];

export default function OrganizerDashboard() {
  const { user } = useAuth();
  const [pendingRefunds, setPendingRefunds] = useState(0);

  useEffect(() => {
    setPendingRefunds(getPendingRefundCount(ORGANIZER_ID));
  }, []);

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Organizer Dashboard</h1>
          <p className="text-stone-500 mt-1">Welcome back, {user?.name ?? "Organizer"}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/organizer/settings">
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </Button>
          <Button asChild>
            <Link href="/organizer/trips/new">Create New Trip</Link>
          </Button>
        </div>
      </div>

      {pendingRefunds > 0 && (
        <Card className="mb-6 border-amber-200 bg-amber-50/50">
          <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 shrink-0">
                <RotateCcw className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-stone-900">
                  {pendingRefunds} refund request{pendingRefunds === 1 ? "" : "s"} need action
                </p>
                <p className="text-sm text-stone-500 mt-0.5">
                  Travelers have requested cancellations. Review and process refunds.
                </p>
              </div>
            </div>
            <Button asChild>
              <Link href="/organizer/refunds">Review refunds</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-8">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card>
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-stone-500">{stat.label}</p>
                  <p className="text-xl font-bold text-stone-900">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">My Trips</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/organizer/trips/new">+ New</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {myTrips.map((trip) => {
              const pct = (trip.booked / trip.capacity) * 100;
              return (
                <Link key={trip.id} href={`/organizer/trips/${trip.id}`} className="block rounded-xl border border-stone-200 p-4 hover:border-teal-300 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-stone-900">{trip.title}</p>
                      <p className="text-xs text-stone-500 mt-0.5">{trip.booked}/{trip.capacity} booked · Min {trip.minCapacity}</p>
                    </div>
                    <Badge variant={trip.status === "live" ? "success" : trip.status === "draft" ? "secondary" : "default"}>
                      {trip.status}
                    </Badge>
                  </div>
                  <Progress value={pct} className="mt-3" />
                  <div className="flex items-center justify-between mt-2 text-xs text-stone-400">
                    <span>{trip.views} views · {trip.conversions} conversions</span>
                    <span>{formatCurrency(trip.price * trip.booked)} revenue</span>
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Withdrawals</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/organizer/withdrawals">View all <ArrowRight className="h-3.5 w-3.5" /></Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {organizerPayouts.slice(0, 4).map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2 text-sm">
                  <div>
                    <p className="font-medium text-stone-900">{p.tripTitle}</p>
                    <p className="text-xs text-stone-400">{p.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(p.amount)}</p>
                    <Badge variant={p.status === "completed" ? "success" : p.status === "processing" ? "warning" : "secondary"} className="mt-0.5">
                      {p.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4" /> Quick Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            {myTrips.filter((t) => t.status === "live").map((trip) => (
              <Link key={trip.id} href={`/organizer/trips/${trip.id}/analytics`} className="rounded-xl bg-stone-50 p-4 hover:bg-teal-50 transition-colors">
                <p className="font-medium text-sm text-stone-900">{trip.title}</p>
                <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                  <div><p className="text-lg font-bold text-stone-900">{trip.views}</p><p className="text-xs text-stone-400">Views</p></div>
                  <div><p className="text-lg font-bold text-teal-600">{trip.conversions > 0 ? ((trip.conversions / trip.views) * 100).toFixed(1) : 0}%</p><p className="text-xs text-stone-400">Conv.</p></div>
                  <div><p className="text-lg font-bold text-stone-900">{formatCurrency(trip.price * trip.booked)}</p><p className="text-xs text-stone-400">Revenue</p></div>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

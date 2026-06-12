"use client";

import { Eye, MousePointerClick, DollarSign, Repeat, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";
import type { Trip } from "@/lib/types";

interface TripAnalyticsPanelProps {
  trip: Trip;
  className?: string;
}

export function TripAnalyticsPanel({ trip, className }: TripAnalyticsPanelProps) {
  const conversionRate = trip.views > 0 ? ((trip.conversions / trip.views) * 100).toFixed(1) : "0";
  const revenue = trip.price * trip.booked;
  const repeatBookers = 2;

  const stats = [
    { label: "Views", value: trip.views.toLocaleString(), icon: Eye, color: "text-purple-600 bg-purple-50" },
    { label: "Conversion", value: `${conversionRate}%`, icon: MousePointerClick, color: "text-teal-600 bg-teal-50" },
    { label: "Revenue", value: formatCurrency(revenue), icon: DollarSign, color: "text-emerald-600 bg-emerald-50" },
    { label: "Repeat", value: String(repeatBookers), icon: Repeat, color: "text-amber-600 bg-amber-50" },
  ];

  const funnelSteps = [
    { label: "Page Views", value: trip.views, pct: 100 },
    { label: "Clicked Book", value: Math.round(trip.views * 0.12), pct: 12 },
    { label: "Started Checkout", value: Math.round(trip.views * 0.06), pct: 6 },
    { label: "Completed Booking", value: trip.conversions, pct: parseFloat(conversionRate) },
  ];

  return (
    <div className={className}>
      <div className="sticky top-6 space-y-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-teal-600" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-500">Analytics</h2>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {stats.map((s) => (
            <Card key={s.label}>
              <CardContent className="p-3">
                <div className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${s.color} mb-2`}>
                  <s.icon className="h-4 w-4" />
                </div>
                <p className="text-lg font-bold text-stone-900 leading-tight">{s.value}</p>
                <p className="text-xs text-stone-500">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Booking Funnel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {funnelSteps.map((step) => (
              <div key={step.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-stone-600">{step.label}</span>
                  <span className="font-medium">{step.value}</span>
                </div>
                <Progress value={step.pct} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Revenue Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-stone-100">
              <span className="text-stone-500">Ticket sales ({trip.booked})</span>
              <span className="font-medium">{formatCurrency(revenue)}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-stone-100">
              <span className="text-stone-500">Platform fee (10%)</span>
              <span className="text-red-500">-{formatCurrency(revenue * 0.1)}</span>
            </div>
            <div className="flex justify-between py-1.5 font-semibold text-sm">
              <span>Net earnings</span>
              <span className="text-teal-600">{formatCurrency(revenue * 0.9)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

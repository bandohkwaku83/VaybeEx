"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { RefreshCw, RotateCcw } from "lucide-react";
import { RefundRequestsSection } from "@/components/organizer/refund-requests-section";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ORGANIZER_ID } from "@/hooks/use-organizer-trips";
import { getOrganizerCancellationRequests } from "@/lib/cancellation-requests";
import type { CancellationRequest } from "@/lib/types";

export default function RefundsPage() {
  const [requests, setRequests] = useState<CancellationRequest[]>([]);

  const refresh = useCallback(() => {
    setRequests(getOrganizerCancellationRequests(ORGANIZER_ID));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const pending = useMemo(
    () => requests.filter((r) => r.status === "pending" || r.status === "processing"),
    [requests]
  );
  const completed = useMemo(
    () => requests.filter((r) => r.status === "refunded" || r.status === "denied"),
    [requests]
  );

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Refunds</h1>
          <p className="text-stone-500 mt-1">
            Review traveler cancellation requests and process refunds to their original payment method.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={refresh}>
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        {[
          { label: "Pending action", value: pending.length, color: "text-amber-600 bg-amber-50" },
          { label: "Completed", value: completed.filter((r) => r.status === "refunded").length, color: "text-emerald-600 bg-emerald-50" },
          { label: "Not eligible", value: completed.filter((r) => r.status === "denied").length, color: "text-stone-600 bg-stone-100" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.color}`}>
                <span className="text-lg font-bold">{stat.value}</span>
              </div>
              <span className="text-sm font-medium text-stone-600">{stat.label}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Needs action ({pending.length})</TabsTrigger>
          <TabsTrigger value="all">All requests ({requests.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completed.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          <RefundRequestsSection
            requests={pending}
            onUpdated={refresh}
            emptyMessage="No refunds waiting for action. Travelers request cancellations from their dashboard — those requests show up here."
          />
        </TabsContent>

        <TabsContent value="all" className="mt-4">
          <RefundRequestsSection requests={requests} onUpdated={refresh} />
        </TabsContent>

        <TabsContent value="completed" className="mt-4">
          <RefundRequestsSection
            requests={completed}
            onUpdated={refresh}
            emptyMessage="No completed refund requests yet."
          />
        </TabsContent>
      </Tabs>

      {requests.length === 0 && (
        <Card className="mt-6 border-dashed">
          <CardContent className="p-6 text-sm text-stone-600 space-y-2">
            <p className="font-medium text-stone-900 flex items-center gap-2">
              <RotateCcw className="h-4 w-4 text-teal-600" />
              How to test this flow
            </p>
            <ol className="list-decimal list-inside space-y-1 text-stone-500">
              <li>Sign in as a traveler and open <Link href="/dashboard" className="text-teal-600 hover:underline">My Dashboard</Link></li>
              <li>Click <strong>Request Cancellation</strong> on an upcoming booking</li>
              <li>Sign back in as organizer — the request appears on this page</li>
            </ol>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

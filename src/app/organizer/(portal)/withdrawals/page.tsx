"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowDownToLine, CheckCircle, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WithdrawFormDialog } from "@/components/organizer/withdraw-form-dialog";
import { organizerPayouts } from "@/lib/mock-data";
import type { Payout } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";

function WithdrawalTable({ items }: { items: Payout[] }) {
  if (items.length === 0) {
    return (
      <p className="p-6 text-sm text-stone-500 text-center">
        No withdrawals in this category.
      </p>
    );
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-stone-100 text-left text-stone-500">
          <th className="p-4 font-medium">Trip</th>
          <th className="p-4 font-medium">Destination</th>
          <th className="p-4 font-medium">Date</th>
          <th className="p-4 font-medium">Status</th>
          <th className="p-4 font-medium text-right">Amount</th>
        </tr>
      </thead>
      <tbody>
        {items.map((p) => (
          <tr key={p.id} className="border-b border-stone-50 hover:bg-stone-50">
            <td className="p-4">
              <Link
                href={`/organizer/payouts?trip=${p.tripId}`}
                className="font-medium text-stone-900 hover:text-teal-600 transition-colors"
              >
                {p.tripTitle}
              </Link>
            </td>
            <td className="p-4 text-stone-500">
              {p.payoutDestination ?? "—"}
            </td>
            <td className="p-4 text-stone-500">{formatDate(p.date)}</td>
            <td className="p-4">
              <Badge
                variant={
                  p.status === "completed"
                    ? "success"
                    : p.status === "processing"
                      ? "warning"
                      : "secondary"
                }
              >
                {p.status}
              </Badge>
            </td>
            <td className="p-4 text-right font-medium">{formatCurrency(p.amount)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function WithdrawalsPage() {
  const [payouts, setPayouts] = useState<Payout[]>(organizerPayouts);
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  const completed = useMemo(() => payouts.filter((p) => p.status === "completed"), [payouts]);
  const processing = useMemo(() => payouts.filter((p) => p.status === "processing"), [payouts]);
  const pending = useMemo(() => payouts.filter((p) => p.status === "pending"), [payouts]);

  const completedTotal = completed.reduce((s, p) => s + p.amount, 0);
  const processingTotal = processing.reduce((s, p) => s + p.amount, 0);
  const pendingTotal = pending.reduce((s, p) => s + p.amount, 0);

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Withdrawals</h1>
          <p className="text-stone-500 mt-1">
            Request withdrawals to your saved mobile money accounts.
          </p>
        </div>
        <Button onClick={() => setWithdrawOpen(true)}>
          <ArrowDownToLine className="h-4 w-4" />
          Withdraw
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-stone-500">Withdrawn</p>
              <p className="text-xl font-bold">{formatCurrency(completedTotal)}</p>
              <p className="text-xs text-stone-400">{completed.length} transfers</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Loader2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-stone-500">Processing</p>
              <p className="text-xl font-bold">{formatCurrency(processingTotal)}</p>
              <p className="text-xs text-stone-400">{processing.length} in progress</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-stone-100 text-stone-600">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-stone-500">Pending</p>
              <p className="text-xl font-bold">{formatCurrency(pendingTotal)}</p>
              <p className="text-xs text-stone-400">{pending.length} upcoming</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <ArrowDownToLine className="h-4 w-4 text-stone-500" />
          <CardTitle className="text-base">Withdrawal History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="all">
            <div className="px-4 pt-2">
              <TabsList>
                <TabsTrigger value="all">All ({payouts.length})</TabsTrigger>
                <TabsTrigger value="completed">Completed ({completed.length})</TabsTrigger>
                <TabsTrigger value="processing">Processing ({processing.length})</TabsTrigger>
                <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="all" className="mt-0">
              <WithdrawalTable items={payouts} />
            </TabsContent>
            <TabsContent value="completed" className="mt-0">
              <WithdrawalTable items={completed} />
            </TabsContent>
            <TabsContent value="processing" className="mt-0">
              <WithdrawalTable items={processing} />
            </TabsContent>
            <TabsContent value="pending" className="mt-0">
              <WithdrawalTable items={pending} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <WithdrawFormDialog
        open={withdrawOpen}
        onOpenChange={setWithdrawOpen}
        existingPayouts={payouts}
        onSubmit={(payout) => setPayouts((prev) => [payout, ...prev])}
      />
    </div>
  );
}

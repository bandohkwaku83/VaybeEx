"use client";

import { RequireAuth } from "@/components/auth/require-auth";
import { CancelBookingDialog } from "@/components/dashboard/cancel-booking-dialog";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar, Clock, XCircle, Star, Bell, RefreshCw, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CANCELLATION_STATUS_LABELS,
  getCancellationByBookingId,
  getCancellationRequests,
} from "@/lib/cancellation-requests";
import { userBookings } from "@/lib/mock-data";
import type { Booking, CancellationRequest } from "@/lib/types";
import { formatCurrency, formatDateRange } from "@/lib/utils";

const statusConfig = {
  confirmed: { label: "Confirmed", variant: "success" as const, icon: Calendar },
  pending: { label: "Pending Payment", variant: "warning" as const, icon: Clock },
  cancelled: { label: "Cancelled", variant: "destructive" as const, icon: XCircle },
  waitlisted: { label: "Waitlisted", variant: "secondary" as const, icon: Bell },
};

const cancellationStatusVariant: Record<
  CancellationRequest["status"],
  "warning" | "secondary" | "success" | "destructive"
> = {
  pending: "warning",
  processing: "secondary",
  refunded: "success",
  denied: "destructive",
};

interface BookingCardProps {
  booking: Booking;
  index: number;
  hasCancellation: boolean;
  onRequestCancel: (booking: Booking) => void;
}

function BookingCard({ booking, index, hasCancellation, onRequestCancel }: BookingCardProps) {
  const config = statusConfig[booking.status];
  const Icon = config.icon;
  const isPast = new Date(booking.endDate) < new Date();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <div className="flex flex-col sm:flex-row">
          <div className="relative h-40 sm:h-auto sm:w-48 shrink-0">
            <Image src={booking.image} alt={booking.tripTitle} fill className="object-cover" />
          </div>
          <CardContent className="flex flex-1 flex-col justify-between p-5">
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-stone-900">{booking.tripTitle}</h3>
                  <p className="text-sm text-stone-500 mt-0.5">{booking.destination}</p>
                </div>
                <Badge variant={config.variant}>
                  <Icon className="h-3 w-3 mr-1" />
                  {config.label}
                </Badge>
              </div>
              <p className="text-sm text-stone-500 mt-2">
                {formatDateRange(booking.startDate, booking.endDate)} · {booking.travelers} traveler{booking.travelers > 1 ? "s" : ""}
              </p>
              {booking.amount > 0 && (
                <p className="text-sm mt-1">
                  <span className="text-stone-500">Amount: </span>
                  <span className="font-medium">{formatCurrency(booking.amount)}</span>
                  {booking.paymentStatus === "partial" && (
                    <Badge variant="warning" className="ml-2">Partial</Badge>
                  )}
                </p>
              )}
            </div>
            <div className="flex gap-2 mt-4">
              <Button size="sm" variant="outline" asChild>
                <Link href={`/trips/${booking.tripId}`}>View Trip</Link>
              </Button>
              {booking.status === "confirmed" && isPast && (
                <Button size="sm" variant="ghost" asChild>
                  <Link href={`/reviews/${booking.tripId}`}>
                    <Star className="h-3.5 w-3.5" /> Leave Review
                  </Link>
                </Button>
              )}
              {booking.status === "confirmed" && !isPast && !hasCancellation && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => onRequestCancel(booking)}
                >
                  Request Cancellation
                </Button>
              )}
            </div>
          </CardContent>
        </div>
      </Card>
    </motion.div>
  );
}

function CancellationCard({ request }: { request: CancellationRequest }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-stone-900">{request.tripTitle}</h3>
              <Badge variant={cancellationStatusVariant[request.status]}>
                {request.status === "refunded" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                {request.status === "processing" && <RefreshCw className="h-3 w-3 mr-1" />}
                {CANCELLATION_STATUS_LABELS[request.status]}
              </Badge>
            </div>
            <p className="text-sm text-stone-500 mt-1">
              {request.destination} · Departs {new Date(request.startDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
            </p>
            {request.reason && (
              <p className="text-sm text-stone-600 mt-2">&ldquo;{request.reason}&rdquo;</p>
            )}
          </div>
          <div className="text-sm sm:text-right shrink-0 space-y-1">
            <p>
              <span className="text-stone-500">Paid: </span>
              <span className="font-medium">{formatCurrency(request.amountPaid)}</span>
            </p>
            <p>
              <span className="text-stone-500">Refund: </span>
              <span className={`font-medium ${request.refundEligible ? "text-emerald-600" : "text-stone-400"}`}>
                {formatCurrency(request.refundAmount)}
              </span>
            </p>
            {request.refundDestination && request.status !== "denied" && (
              <p className="text-xs text-stone-400">{request.refundDestination}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardContent() {
  const [bookings, setBookings] = useState<Booking[]>(userBookings);
  const [cancellations, setCancellations] = useState<CancellationRequest[]>([]);
  const [cancelBooking, setCancelBooking] = useState<Booking | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const refreshCancellations = useCallback(() => {
    setCancellations(getCancellationRequests());
  }, []);

  useEffect(() => {
    refreshCancellations();
  }, [refreshCancellations]);

  const handleRequestCancel = (booking: Booking) => {
    setCancelBooking(booking);
    setCancelDialogOpen(true);
  };

  const handleCancellationSubmitted = (request: CancellationRequest) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === request.bookingId ? { ...b, status: "cancelled" as const } : b))
    );
    refreshCancellations();
  };

  const upcoming = bookings.filter((b) => new Date(b.endDate) >= new Date() && b.status !== "cancelled");
  const past = bookings.filter((b) => new Date(b.endDate) < new Date());
  const waitlisted = bookings.filter((b) => b.status === "waitlisted");

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-900">My Dashboard</h1>
        <p className="text-stone-500 mt-1">Manage your trips, bookings, and cancellation requests</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        {[
          { label: "Upcoming", value: upcoming.length, color: "text-teal-600 bg-teal-50" },
          { label: "Past Trips", value: past.length, color: "text-stone-600 bg-stone-100" },
          { label: "Waitlisted", value: waitlisted.length, color: "text-amber-600 bg-amber-50" },
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

      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
          <TabsTrigger value="history">Booking History</TabsTrigger>
          <TabsTrigger value="cancellations" onClick={refreshCancellations}>
            Cancellations ({cancellations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4 mt-4">
          {upcoming.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-stone-500">No upcoming trips. <Link href="/" className="text-teal-600 hover:underline">Browse trips</Link></CardContent></Card>
          ) : upcoming.map((b, i) => (
            <BookingCard
              key={b.id}
              booking={b}
              index={i}
              hasCancellation={Boolean(getCancellationByBookingId(b.id))}
              onRequestCancel={handleRequestCancel}
            />
          ))}
        </TabsContent>

        <TabsContent value="past" className="space-y-4 mt-4">
          {past.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-stone-500">No past trips yet.</CardContent></Card>
          ) : past.map((b, i) => (
            <BookingCard
              key={b.id}
              booking={b}
              index={i}
              hasCancellation={Boolean(getCancellationByBookingId(b.id))}
              onRequestCancel={handleRequestCancel}
            />
          ))}
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">All Bookings</CardTitle></CardHeader>
            <CardContent>
              <div className="divide-y divide-stone-100">
                {bookings.map((b) => (
                  <div key={b.id} className="flex items-center justify-between py-3 text-sm">
                    <div>
                      <p className="font-medium text-stone-900">{b.tripTitle}</p>
                      <p className="text-stone-500">{formatDateRange(b.startDate, b.endDate)}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={statusConfig[b.status].variant}>{statusConfig[b.status].label}</Badge>
                      {b.amount > 0 && <p className="text-stone-600 mt-1">{formatCurrency(b.amount)}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cancellations" className="space-y-4 mt-4">
          {cancellations.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-stone-500">
                <XCircle className="h-8 w-8 text-stone-300 mx-auto mb-3" />
                <p>No cancellation requests yet.</p>
                <p className="text-xs mt-1">Request a cancellation from any confirmed upcoming trip.</p>
              </CardContent>
            </Card>
          ) : (
            cancellations.map((request) => <CancellationCard key={request.id} request={request} />)
          )}
        </TabsContent>
      </Tabs>

      <CancelBookingDialog
        booking={cancelBooking}
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        onSubmitted={handleCancellationSubmitted}
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <RequireAuth>
      <DashboardContent />
    </RequireAuth>
  );
}

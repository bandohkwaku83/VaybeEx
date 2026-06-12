"use client";

import { use, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Check,
  Clock,
  DollarSign,
  ExternalLink,
  MapPin,
  Pencil,
  Send,
  Users,
  X,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { RefundRequestsSection } from "@/components/organizer/refund-requests-section";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TripAnalyticsPanel } from "@/components/organizer/trip-analytics-panel";
import { useOrganizerTrips } from "@/hooks/use-organizer-trips";
import { STATUS_MESSAGES, TRIP_STATUS_OPTIONS } from "@/lib/trip-form-utils";
import { getCancellationsForTrip } from "@/lib/cancellation-requests";
import { formatCurrency, formatDateRange } from "@/lib/utils";
import type { CancellationRequest, TripStatus } from "@/lib/types";

const attendees = [
  { name: "Ama Osei", email: "ama@email.com", status: "paid", amount: 1850 },
  { name: "Kwame Mensah", email: "kwame@email.com", status: "paid", amount: 1850 },
  { name: "Efua Addo", email: "efua@email.com", status: "pending", amount: 500 },
  { name: "Yaw Boateng", email: "yaw@email.com", status: "paid", amount: 2000 },
];

function getDuration(start: string, end: string) {
  return Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

export default function ManageTripPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const { getTrip, updateTripStatus, isLoading } = useOrganizerTrips();
  const trip = getTrip(id);
  const [cancellations, setCancellations] = useState<CancellationRequest[]>([]);
  const [activeTab, setActiveTab] = useState(() =>
    tabFromUrl === "bookings" || tabFromUrl === "cancellations" ? tabFromUrl : "details"
  );

  const refreshCancellations = useCallback(() => {
    setCancellations(getCancellationsForTrip(id));
  }, [id]);

  useEffect(() => {
    refreshCancellations();
  }, [refreshCancellations]);

  useEffect(() => {
    if (tabFromUrl === "bookings" || tabFromUrl === "cancellations") {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  if (isLoading) return <p className="p-8 text-stone-500">Loading trip...</p>;
  if (!trip) return <p className="p-8 text-stone-500">Trip not found.</p>;

  const handleStatusChange = (status: TripStatus) => {
    updateTripStatus(id, status);
    toast.success(STATUS_MESSAGES[status]);
  };

  const paid = attendees.filter((a) => a.status === "paid");
  const pending = attendees.filter((a) => a.status === "pending");
  const pct = (trip.booked / trip.capacity) * 100;
  const minReached = trip.booked >= trip.minCapacity;
  const duration = getDuration(trip.startDate, trip.endDate);

  return (
    <div className="p-6 lg:p-8 max-w-7xl">
      <Button
        variant="ghost"
        size="sm"
        className="mb-4 -ml-2 text-stone-500 hover:text-stone-900"
        asChild
      >
        <Link href="/organizer/trips/new">
          <ArrowLeft className="h-4 w-4" />
          Back to trips
        </Link>
      </Button>

      <div className="relative aspect-[21/9] overflow-hidden rounded-2xl mb-6">
        <Image
          src={trip.image}
          alt={trip.title}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 1024px) 100vw, 1152px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge variant={trip.status === "live" ? "success" : "secondary"} className="capitalize">
              {trip.status}
            </Badge>
            <Badge variant="secondary" className="capitalize">{trip.category}</Badge>
            {minReached && <Badge variant="success">Min capacity reached</Badge>}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">{trip.title}</h1>
          <p className="text-white/80 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {trip.destination}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formatDateRange(trip.startDate, trip.endDate)}
            </span>
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 flex-1">
          {[
            { label: "Price", value: `${formatCurrency(trip.price)} / person`, icon: DollarSign },
            { label: "Deposit", value: formatCurrency(trip.depositAmount), icon: DollarSign },
            { label: "Duration", value: `${duration} day${duration === 1 ? "" : "s"}`, icon: Clock },
            { label: "Booked", value: `${trip.booked}/${trip.capacity}`, icon: Users },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <s.icon className="h-5 w-5 text-teal-600 shrink-0" />
                <div>
                  <p className="text-xs text-stone-500">{s.label}</p>
                  <p className="font-semibold text-stone-900 text-sm">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <Button asChild>
            <Link href={`/organizer/trips/${id}/edit`}>
              <Pencil className="h-4 w-4" />
              Edit Trip
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/trips/${id}`} target="_blank">
              <ExternalLink className="h-4 w-4" />
              Public page
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/organizer/messages?trip=${id}`}>
              <Send className="h-4 w-4" />
              Communication
            </Link>
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Trip Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[220px] max-w-sm">
              <Label className="text-stone-500 text-xs">Current status</Label>
              <Select value={trip.status} onValueChange={(v) => handleStatusChange(v as TripStatus)}>
                <SelectTrigger className="mt-1.5 capitalize">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRIP_STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="capitalize">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-stone-500 flex-1 min-w-[200px]">
              {trip.status === "live"
                ? "This trip is visible to travelers and accepting bookings."
                : trip.status === "draft"
                  ? "Only you can see this trip while it is a draft."
                  : trip.status === "scheduled"
                    ? "This trip will go live automatically on the start date."
                    : trip.status === "completed"
                      ? "This trip has finished and is no longer bookable."
                      : "This trip has been cancelled and is hidden from travelers."}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardContent className="p-5">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-stone-500">Capacity ({trip.booked}/{trip.capacity})</span>
            <span className="text-stone-500">Min: {trip.minCapacity}</span>
          </div>
          <Progress value={pct} />
          <div className="flex flex-wrap justify-between gap-2 mt-2 text-xs text-stone-500">
            <span>Revenue: {formatCurrency(trip.price * trip.booked)}</span>
            <span>{trip.views} views · {trip.conversions} conversions</span>
          </div>
          {minReached && (
            <p className="text-xs text-emerald-600 mt-2">Automatic payout will trigger on departure date.</p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="details">Trip Details</TabsTrigger>
          <TabsTrigger value="bookings">Bookings ({attendees.length})</TabsTrigger>
          <TabsTrigger value="cancellations" onClick={refreshCancellations}>
            Cancellations ({cancellations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">About this trip</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-stone-600 leading-relaxed">{trip.description}</p>
            </CardContent>
          </Card>

          {trip.images.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Gallery</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {trip.images.map((img) => (
                    <div key={img} className="relative aspect-[4/3] rounded-lg overflow-hidden">
                      <Image src={img} alt="" fill className="object-cover" sizes="200px" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">What&apos;s included</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {trip.included.map((item) => (
                  <div key={item} className="flex items-start gap-2 text-sm text-stone-700">
                    <Check className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                    {item}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Not included</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {trip.excluded.map((item) => (
                  <div key={item} className="flex items-start gap-2 text-sm text-stone-700">
                    <X className="h-4 w-4 text-stone-400 shrink-0 mt-0.5" />
                    {item}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Itinerary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {trip.itinerary.map((day) => (
                <div key={day.day} className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-600 text-sm font-bold text-white">
                    {day.day}
                  </div>
                  <div className="flex-1 pb-4 border-b border-stone-100 last:border-0 last:pb-0">
                    <h3 className="font-semibold text-stone-900">{day.title}</h3>
                    <ul className="mt-2 space-y-1">
                      {day.activities.map((activity) => (
                        <li key={activity} className="text-sm text-stone-600 flex items-center gap-2">
                          <span className="h-1 w-1 rounded-full bg-teal-400 shrink-0" />
                          {activity}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {trip.addOns.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Add-ons</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {trip.addOns.map((addon) => (
                  <div key={addon.id} className="flex items-center justify-between text-sm">
                    <span className="text-stone-700">{addon.name}</span>
                    <span className="font-medium text-stone-900">{formatCurrency(addon.price)}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pricing summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-stone-500">Price per person</span>
                <span className="font-medium">{formatCurrency(trip.price)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Deposit to secure spot</span>
                <span className="font-medium">{formatCurrency(trip.depositAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Group size</span>
                <span className="font-medium">Min {trip.minCapacity} · Max {trip.capacity}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-stone-500">Potential revenue (full capacity)</span>
                <span className="font-semibold text-teal-700">{formatCurrency(trip.price * trip.capacity)}</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings">
          <Tabs defaultValue="attendees">
            <TabsList>
              <TabsTrigger value="attendees">All ({attendees.length})</TabsTrigger>
              <TabsTrigger value="paid">Paid ({paid.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="attendees" className="mt-4">
              <Card>
                <CardContent className="p-0">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-stone-100 text-left text-stone-500">
                        <th className="p-4 font-medium">Name</th>
                        <th className="p-4 font-medium">Email</th>
                        <th className="p-4 font-medium">Status</th>
                        <th className="p-4 font-medium text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendees.map((a) => (
                        <tr key={a.email} className="border-b border-stone-50 hover:bg-stone-50">
                          <td className="p-4 font-medium text-stone-900">{a.name}</td>
                          <td className="p-4 text-stone-500">{a.email}</td>
                          <td className="p-4">
                            <Badge variant={a.status === "paid" ? "success" : "warning"}>{a.status}</Badge>
                          </td>
                          <td className="p-4 text-right">{formatCurrency(a.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="paid" className="mt-4">
              <Card>
                <CardContent className="p-4 space-y-2">
                  {paid.map((a) => (
                    <div key={a.email} className="flex justify-between py-2 text-sm">
                      <span className="font-medium">{a.name}</span>
                      <span className="text-emerald-600">{formatCurrency(a.amount)}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pending" className="mt-4">
              <Card>
                <CardContent className="p-4 space-y-2">
                  {pending.length === 0 ? (
                    <p className="text-stone-500 text-sm">No pending payments.</p>
                  ) : (
                    pending.map((a) => (
                      <div key={a.email} className="flex justify-between py-2 text-sm">
                        <span className="font-medium">{a.name}</span>
                        <span className="text-amber-600">{formatCurrency(a.amount)} deposit due</span>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>

          </Tabs>
        </TabsContent>

        <TabsContent value="cancellations" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-stone-500">
              Traveler cancellation requests for this trip.
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link href="/organizer/refunds">
                <RotateCcw className="h-4 w-4" />
                All refunds
              </Link>
            </Button>
          </div>
          <RefundRequestsSection
            requests={cancellations}
            onUpdated={refreshCancellations}
            showTripLink={false}
            emptyMessage="No cancellation requests for this trip yet. Travelers cancel from their dashboard."
          />
        </TabsContent>
      </Tabs>
        </div>

        <TripAnalyticsPanel trip={trip} className="hidden lg:block" />
      </div>

      <TripAnalyticsPanel trip={trip} className="lg:hidden mt-8" />
    </div>
  );
}

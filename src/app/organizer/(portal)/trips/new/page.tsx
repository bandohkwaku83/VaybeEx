"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar, MapPin, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TripFormEditor } from "@/components/organizer/trip-form-editor";
import { ORGANIZER_ID, useOrganizerTrips } from "@/hooks/use-organizer-trips";
import {
  INITIAL_TRIP_FORM,
  STATUS_MESSAGES,
  buildNewTrip,
} from "@/lib/trip-form-utils";
import { formatCurrency, formatDateRange } from "@/lib/utils";
import type { TripStatus } from "@/lib/types";

export default function CreateTripPage() {
  const router = useRouter();
  const { trips, createTrip, isLoading } = useOrganizerTrips();
  const [showForm, setShowForm] = useState(false);

  const startCreateTrip = () => setShowForm(true);

  const handleSave = (
    form: typeof INITIAL_TRIP_FORM,
    addOns: { name: string; price: string }[],
    status: TripStatus
  ) => {
    const trip = createTrip(buildNewTrip(form, addOns, status, ORGANIZER_ID));
    toast.success(STATUS_MESSAGES[status]);
    router.push(`/organizer/trips/${trip.id}`);
  };

  if (showForm) {
    return (
      <TripFormEditor
        mode="create"
        heading="Create Trip"
        subheading="Set up your trip with photos, logistics, pricing, and policies. Save as draft or publish when ready."
        initialForm={INITIAL_TRIP_FORM}
        initialAddOns={[]}
        onBack={() => setShowForm(false)}
        onSave={handleSave}
      />
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">My Trips</h1>
          <p className="text-stone-500 mt-1 max-w-xl">
            View and manage your trips, or create a new one to share with travelers.
          </p>
        </div>
        <Button onClick={startCreateTrip}>
          <Plus className="h-4 w-4" />
          Create Trip
        </Button>
      </div>

      {isLoading ? (
        <p className="text-stone-500">Loading trips...</p>
      ) : trips.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 mb-4">
              <MapPin className="h-7 w-7" />
            </div>
            <h2 className="text-lg font-semibold text-stone-900">No trips yet</h2>
            <p className="text-stone-500 mt-1 max-w-sm">
              Create your first trip to start accepting bookings from travelers.
            </p>
            <Button className="mt-6" onClick={startCreateTrip}>
              <Plus className="h-4 w-4" />
              Create Trip
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {trips.map((trip) => {
            const pct = (trip.booked / trip.capacity) * 100;
            return (
              <Link
                key={trip.id}
                href={`/organizer/trips/${trip.id}`}
                className="group block rounded-xl border border-stone-200 overflow-hidden hover:border-teal-300 transition-colors"
              >
                <div className="relative aspect-[16/9] overflow-hidden">
                  <Image
                    src={trip.image}
                    alt={trip.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <Badge
                    variant={trip.status === "live" ? "success" : trip.status === "draft" ? "secondary" : "default"}
                    className="absolute top-3 right-3 capitalize"
                  >
                    {trip.status}
                  </Badge>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-stone-900 group-hover:text-teal-700 transition-colors">
                    {trip.title}
                  </h3>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-stone-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {trip.destination}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDateRange(trip.startDate, trip.endDate)}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="font-semibold text-stone-900">
                      {formatCurrency(trip.price)}
                      <span className="font-normal text-stone-400"> / person</span>
                    </span>
                    <span className="text-stone-500">
                      {trip.booked}/{trip.capacity} booked
                    </span>
                  </div>
                  <Progress value={pct} className="mt-3" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

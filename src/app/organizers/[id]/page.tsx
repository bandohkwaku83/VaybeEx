import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Star, Calendar } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { TripCard } from "@/components/trips/trip-card";
import { VerifiedBadge } from "@/components/trips/verified-badge";
import { getOrganizerById, getOrganizerTrips } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";

export default async function OrganizerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const organizer = getOrganizerById(id);
  if (!organizer) notFound();

  const organizerTrips = getOrganizerTrips(id);
  const upcoming = organizerTrips.filter((t) => new Date(t.endDate) >= new Date());
  const past = organizerTrips.filter((t) => new Date(t.endDate) < new Date());

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Card className="overflow-hidden mb-8">
        <div className="h-32 bg-gradient-to-r from-teal-600 to-emerald-500" />
        <CardContent className="relative px-6 pb-6">
          <Avatar className="h-24 w-24 -mt-12 border-4 border-white shadow-lg">
            <AvatarImage src={organizer.avatar} />
            <AvatarFallback>{organizer.name[0]}</AvatarFallback>
          </Avatar>
          <div className="mt-4">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-stone-900">{organizer.name}</h1>
              {organizer.verified && <VerifiedBadge />}
              {!organizer.verified && (
                <Badge variant="warning">{organizer.verificationStatus === "in_review" ? "Verification in review" : "Unverified"}</Badge>
              )}
            </div>
            <p className="flex items-center gap-1 text-sm text-stone-500 mt-1">
              <MapPin className="h-3.5 w-3.5" />{organizer.location}
            </p>
            <p className="text-stone-600 mt-3 max-w-2xl leading-relaxed">{organizer.bio}</p>
            <div className="flex flex-wrap gap-4 mt-4 text-sm text-stone-500">
              <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-amber-400 text-amber-400" />{organizer.rating} ({organizer.reviewCount} reviews)</span>
              <span>{organizer.tripCount} trips hosted</span>
              <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />Joined {formatDate(organizer.joinedAt)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <section className="mb-10">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Upcoming Trips</h2>
        {upcoming.length === 0 ? (
          <p className="text-stone-500">No upcoming trips.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((trip, i) => <TripCard key={trip.id} trip={trip} index={i} />)}
          </div>
        )}
      </section>

      {past.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-stone-900 mb-4">Past Trips</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {past.map((trip, i) => <TripCard key={trip.id} trip={trip} index={i} />)}
          </div>
        </section>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  Check,
  ChevronRight,
  Clock,
  Compass,
  Heart,
  MapPin,
  Mountain,
  Palmtree,
  Share2,
  Shield,
  Sparkles,
  Star,
  Users,
  X,
  Binoculars,
  Building2,
  Landmark,
  Utensils,
  Bus,
  Tent,
  Camera,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { VerifiedBadge } from "@/components/trips/verified-badge";
import { SeatCounter } from "@/components/trips/seat-counter";
import { StarRating } from "@/components/trips/star-rating";
import { useAuth } from "@/hooks/use-auth";
import { useWishlist } from "@/hooks/use-wishlist";
import { cn, formatCurrency, formatDateRange } from "@/lib/utils";
import { getSpotsLeft } from "@/lib/mock-data";
import { formatRefundPolicyLabel } from "@/lib/refund-utils";
import type { Organizer, Trip, TripCategory } from "@/lib/types";

interface TripDetailClientProps {
  trip: Trip;
  organizer: Organizer;
}

const CATEGORY_META: Record<
  TripCategory,
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  adventure: { label: "Adventure", icon: Mountain },
  beach: { label: "Beach", icon: Palmtree },
  cultural: { label: "Cultural", icon: Landmark },
  wildlife: { label: "Wildlife", icon: Binoculars },
  city: { label: "City", icon: Building2 },
  wellness: { label: "Wellness", icon: Sparkles },
};

const INCLUDED_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  guide: Compass,
  meal: Utensils,
  transport: Bus,
  camp: Tent,
  insurance: Shield,
  photo: Camera,
};

function getIncludedIcon(item: string) {
  const lower = item.toLowerCase();
  for (const [key, Icon] of Object.entries(INCLUDED_ICONS)) {
    if (lower.includes(key)) return Icon;
  }
  return Check;
}

function getTripDuration(start: string, end: string) {
  const days =
    Math.ceil(
      (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;
  return days;
}

function BookingCard({
  trip,
  isFull,
  onBook,
  onSave,
  onShare,
  wishlisted,
  className,
}: {
  trip: Trip;
  isFull: boolean;
  onBook: () => void;
  onSave: () => void;
  onShare: () => void;
  wishlisted: boolean;
  className?: string;
}) {
  const fillPct = Math.round((trip.booked / trip.capacity) * 100);

  return (
    <Card
      className={cn(
        "overflow-hidden border-stone-200/80 shadow-xl shadow-stone-200/50",
        className
      )}
    >
      <div className="h-1 bg-gradient-to-r from-teal-500 via-teal-400 to-amber-400" />
      <CardContent className="p-6">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-stone-400">
              From
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-stone-900">
                {formatCurrency(trip.price)}
              </span>
              <span className="text-stone-400">/ person</span>
            </div>
          </div>
          {trip.rating > 0 && (
            <div className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-sm">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-stone-800">{trip.rating}</span>
            </div>
          )}
        </div>

        <p className="mt-2 text-sm text-stone-500">
          {formatCurrency(trip.depositAmount)} deposit to secure your spot
        </p>

        <Separator className="my-5" />

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-stone-500">Availability</span>
            <span className="font-medium text-stone-700">
              {trip.booked}/{trip.capacity} booked
            </span>
          </div>
          <Progress value={fillPct} className="h-2" />
          <SeatCounter trip={trip} live className="w-full justify-center" />
        </div>

        <div className="mt-5 space-y-2.5">
          <Button
            className="w-full"
            size={isFull ? "default" : "lg"}
            variant={isFull ? "accent" : "default"}
            onClick={onBook}
          >
            {isFull ? "Join Waitlist" : "Book Now"}
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={onSave}>
              <Heart
                className={cn(
                  "h-4 w-4",
                  wishlisted && "fill-red-500 text-red-500"
                )}
              />
              Save
            </Button>
            <Button variant="outline" onClick={onShare}>
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>
        </div>

        <div className="mt-5 space-y-2.5 rounded-xl bg-stone-50 p-4">
          <div className="flex items-start gap-2.5 text-sm text-stone-600">
            <Shield className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
            <span>{formatRefundPolicyLabel(trip)}</span>
          </div>
          <div className="flex items-start gap-2.5 text-sm text-stone-600">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
            <span>No payment today — pay deposit to confirm</span>
          </div>
        </div>

        {trip.addOns.length > 0 && (
          <div className="mt-5">
            <p className="text-xs font-medium uppercase tracking-wider text-stone-400">
              Optional add-ons
            </p>
            <ul className="mt-2 space-y-1.5">
              {trip.addOns.slice(0, 3).map((addon) => (
                <li
                  key={addon.id}
                  className="flex items-center justify-between text-sm text-stone-600"
                >
                  <span>{addon.name}</span>
                  <span className="font-medium text-stone-800">
                    +{formatCurrency(addon.price)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function TripDetailClient({ trip, organizer }: TripDetailClientProps) {
  const router = useRouter();
  const { requireAuth } = useAuth();
  const { toggle, isWishlisted } = useWishlist();
  const [descExpanded, setDescExpanded] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);

  const spotsLeft = getSpotsLeft(trip);
  const isFull = spotsLeft === 0;
  const bookHref = `/trips/${trip.id}/book${isFull ? "?waitlist=true" : ""}`;
  const duration = getTripDuration(trip.startDate, trip.endDate);
  const CategoryIcon = CATEGORY_META[trip.category].icon;
  const wishlisted = isWishlisted(trip.id);

  const handleBook = () =>
    requireAuth(() => router.push(bookHref), bookHref);

  const handleSave = () =>
    requireAuth(() => {
      toggle(trip.id);
      toast.success(wishlisted ? "Removed from wishlist" : "Saved to wishlist");
    });

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied!");
  };

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-12">
        {/* Back nav */}
        <Link
          href="/trips"
          className="mb-5 inline-flex items-center gap-1.5 text-sm text-stone-500 transition-colors hover:text-teal-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to trips
        </Link>

        {/* Hero gallery */}
        <div className="relative -mx-4 sm:mx-0">
          <div className="grid h-[280px] gap-1.5 overflow-hidden sm:rounded-2xl md:h-[440px] md:grid-cols-4 md:grid-rows-2">
            <button
              type="button"
              className="relative md:col-span-2 md:row-span-2"
              onClick={() => setGalleryOpen(true)}
            >
              <Image
                src={trip.images[0]}
                alt={trip.title}
                fill
                className="object-cover transition-transform duration-700 hover:scale-[1.02]"
                priority
              />
            </button>
            {trip.images.slice(1, 5).map((img, i) => (
              <button
                key={i}
                type="button"
                className={cn(
                  "relative hidden md:block",
                  i === 0 && trip.images.length === 2 && "md:col-span-2"
                )}
                onClick={() => setGalleryOpen(true)}
              >
                <Image src={img} alt="" fill className="object-cover" />
              </button>
            ))}
          </div>

          {/* Floating actions */}
          <div className="absolute right-4 top-4 flex gap-2 sm:right-6 sm:top-6">
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full border-0 bg-white/90 shadow-md backdrop-blur-sm hover:bg-white"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full border-0 bg-white/90 shadow-md backdrop-blur-sm hover:bg-white"
              onClick={handleSave}
            >
              <Heart
                className={cn(
                  "h-4 w-4",
                  wishlisted && "fill-red-500 text-red-500"
                )}
              />
            </Button>
          </div>

          {trip.images.length > 1 && (
            <Button
              variant="outline"
              size="sm"
              className="absolute bottom-4 right-4 border-0 bg-white/90 shadow-md backdrop-blur-sm hover:bg-white sm:bottom-6 sm:right-6"
              onClick={() => setGalleryOpen(true)}
            >
              <Camera className="h-4 w-4" />
              Show all {trip.images.length} photos
            </Button>
          )}
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px] lg:gap-12">
          <div>
            {/* Header */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="gap-1 capitalize">
                <CategoryIcon className="h-3 w-3" />
                {CATEGORY_META[trip.category].label}
              </Badge>
              {organizer.verified && <VerifiedBadge />}
              <SeatCounter trip={trip} live />
            </div>

            <h1 className="mt-3 font-serif text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
              {trip.title}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-stone-500">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-teal-600" />
                {trip.destination}
              </span>
              {trip.rating > 0 && (
                <span className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="font-medium text-stone-700">{trip.rating}</span>
                  <span>({trip.reviewCount} reviews)</span>
                </span>
              )}
            </div>

            {/* Quick info grid */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                {
                  icon: Calendar,
                  label: "Dates",
                  value: formatDateRange(trip.startDate, trip.endDate),
                },
                {
                  icon: Clock,
                  label: "Duration",
                  value: `${duration} day${duration === 1 ? "" : "s"}`,
                },
                {
                  icon: Users,
                  label: "Group size",
                  value: `Up to ${trip.capacity}`,
                },
                {
                  icon: CategoryIcon,
                  label: "Style",
                  value: CATEGORY_META[trip.category].label,
                },
              ].map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="rounded-xl border border-stone-100 bg-white p-3.5 shadow-sm"
                >
                  <Icon className="h-4 w-4 text-teal-600" />
                  <p className="mt-2 text-xs font-medium uppercase tracking-wide text-stone-400">
                    {label}
                  </p>
                  <p className="mt-0.5 text-sm font-medium text-stone-800">{value}</p>
                </div>
              ))}
            </div>

            {/* Organizer preview */}
            <Link
              href={`/organizers/${organizer.id}`}
              className="mt-6 flex items-center gap-3 rounded-xl border border-stone-100 bg-white p-4 shadow-sm transition-all hover:border-teal-200 hover:shadow-md"
            >
              <Avatar className="h-11 w-11 ring-2 ring-teal-100">
                <AvatarImage src={organizer.avatar} />
                <AvatarFallback>{organizer.name[0]}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-stone-900">
                    Hosted by {organizer.name}
                  </span>
                  {organizer.verified && <VerifiedBadge />}
                </div>
                <p className="text-sm text-stone-500">
                  {organizer.tripCount} trips · {organizer.rating} rating
                </p>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-stone-300" />
            </Link>

            {/* About */}
            <section className="mt-8">
              <h2 className="text-lg font-semibold text-stone-900">About this trip</h2>
              <p
                className={cn(
                  "mt-3 text-stone-600 leading-relaxed",
                  !descExpanded && "line-clamp-3"
                )}
              >
                {trip.description}
              </p>
              {trip.description.length > 180 && (
                <button
                  type="button"
                  onClick={() => setDescExpanded((v) => !v)}
                  className="mt-2 text-sm font-medium text-teal-700 hover:text-teal-800"
                >
                  {descExpanded ? "Show less" : "Read more"}
                </button>
              )}
            </section>

            {/* Highlights */}
            <section className="mt-8">
              <h2 className="text-lg font-semibold text-stone-900">Trip highlights</h2>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {trip.included.slice(0, 6).map((item) => {
                  const Icon = getIncludedIcon(item);
                  return (
                    <div
                      key={item}
                      className="flex items-center gap-2.5 rounded-xl bg-teal-50/60 px-3.5 py-3 text-sm text-stone-700"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
                        <Icon className="h-4 w-4 text-teal-600" />
                      </div>
                      <span className="leading-snug">{item}</span>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Tabs */}
            <Tabs defaultValue="itinerary" className="mt-10">
              <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto bg-transparent p-0">
                {(["itinerary", "included", "reviews", "organizer"] as const).map(
                  (tab) => (
                    <TabsTrigger
                      key={tab}
                      value={tab}
                      className="rounded-full border border-transparent px-4 py-2 capitalize data-[state=active]:border-stone-200 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                      {tab}
                      {tab === "reviews" && trip.reviewCount > 0 && (
                        <span className="ml-1.5 rounded-full bg-stone-100 px-1.5 py-0.5 text-xs tabular-nums">
                          {trip.reviewCount}
                        </span>
                      )}
                    </TabsTrigger>
                  )
                )}
              </TabsList>

              <TabsContent value="itinerary">
                <div className="relative mt-6 space-y-0">
                  {trip.itinerary.map((day, idx) => (
                    <motion.div
                      key={day.day}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.08 }}
                      className="relative flex gap-5 pb-8 last:pb-0"
                    >
                      {idx < trip.itinerary.length - 1 && (
                        <div className="absolute left-[15px] top-10 h-[calc(100%-16px)] w-0.5 bg-gradient-to-b from-teal-200 to-stone-100" />
                      )}
                      <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-600 text-sm font-bold text-white shadow-md shadow-teal-200">
                        {day.day}
                      </div>
                      <div className="min-w-0 flex-1 rounded-xl border border-stone-100 bg-white p-4 shadow-sm">
                        <h3 className="font-semibold text-stone-900">{day.title}</h3>
                        <ul className="mt-3 space-y-2">
                          {day.activities.map((activity, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-2.5 text-sm text-stone-600"
                            >
                              <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-500" />
                              {activity}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="included">
                <div className="mt-6 space-y-6">
                  <div>
                    <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-emerald-700">
                      What&apos;s included
                    </h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {trip.included.map((item) => {
                        const Icon = getIncludedIcon(item);
                        return (
                          <div
                            key={item}
                            className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50/40 px-4 py-3"
                          >
                            <Icon className="h-4 w-4 shrink-0 text-emerald-600" />
                            <span className="text-sm text-stone-700">{item}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  {trip.excluded.length > 0 && (
                    <div>
                      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-red-600">
                        Not included
                      </h3>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {trip.excluded.map((item) => (
                          <div
                            key={item}
                            className="flex items-center gap-3 rounded-xl border border-red-100 bg-red-50/40 px-4 py-3"
                          >
                            <X className="h-4 w-4 shrink-0 text-red-400" />
                            <span className="text-sm text-stone-700">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="reviews">
                <div className="mt-6">
                  {trip.reviews.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-stone-200 py-12 text-center">
                      <Star className="mx-auto h-8 w-8 text-stone-300" />
                      <p className="mt-3 font-medium text-stone-600">No reviews yet</p>
                      <p className="mt-1 text-sm text-stone-400">
                        Be the first to share your experience after the trip!
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="mb-6 flex items-center gap-6 rounded-xl bg-amber-50/60 p-5">
                        <div className="text-center">
                          <p className="text-4xl font-bold text-stone-900">
                            {trip.rating}
                          </p>
                          <StarRating rating={Math.round(trip.rating)} size="sm" />
                          <p className="mt-1 text-xs text-stone-500">
                            {trip.reviewCount} reviews
                          </p>
                        </div>
                        <Separator orientation="vertical" className="h-16" />
                        <p className="text-sm leading-relaxed text-stone-600">
                          Travelers love this trip for its organization, authentic
                          experiences, and knowledgeable guides.
                        </p>
                      </div>
                      <div className="space-y-4">
                        {trip.reviews.map((review) => (
                          <div
                            key={review.id}
                            className="rounded-xl border border-stone-100 bg-white p-5 shadow-sm"
                          >
                            <div className="flex items-start gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={review.avatar} />
                                <AvatarFallback>{review.author[0]}</AvatarFallback>
                              </Avatar>
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-medium text-stone-900">
                                    {review.author}
                                  </span>
                                  <StarRating rating={review.rating} size="sm" />
                                </div>
                                <p className="mt-2 text-sm leading-relaxed text-stone-600">
                                  {review.comment}
                                </p>
                                <p className="mt-2 text-xs text-stone-400">
                                  {review.date}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="organizer">
                <div className="mt-6 overflow-hidden rounded-2xl border border-stone-100 bg-white shadow-sm">
                  <div className="h-24 bg-gradient-to-r from-teal-600 to-teal-500" />
                  <div className="relative px-6 pb-6">
                    <Avatar className="absolute -top-10 h-20 w-20 border-4 border-white shadow-md">
                      <AvatarImage src={organizer.avatar} />
                      <AvatarFallback className="text-xl">
                        {organizer.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="pt-14">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-xl font-semibold text-stone-900">
                          {organizer.name}
                        </h3>
                        {organizer.verified && <VerifiedBadge />}
                      </div>
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-stone-500">
                        <MapPin className="h-3.5 w-3.5" />
                        {organizer.location}
                      </p>
                      <p className="mt-4 leading-relaxed text-stone-600">
                        {organizer.bio}
                      </p>
                      <div className="mt-5 flex flex-wrap gap-4 text-sm">
                        <span className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 font-medium text-stone-700">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          {organizer.rating} rating
                        </span>
                        <span className="rounded-full bg-stone-100 px-3 py-1.5 font-medium text-stone-700">
                          {organizer.tripCount} trips hosted
                        </span>
                        <span className="rounded-full bg-stone-100 px-3 py-1.5 font-medium text-stone-700">
                          {organizer.reviewCount} reviews
                        </span>
                      </div>
                      <Button asChild variant="outline" className="mt-5">
                        <Link href={`/organizers/${organizer.id}`}>
                          View all trips by {organizer.name.split(" ")[0]}
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Desktop booking sidebar */}
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <BookingCard
                trip={trip}
                isFull={isFull}
                onBook={handleBook}
                onSave={handleSave}
                onShare={handleShare}
                wishlisted={wishlisted}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky booking bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white/95 px-4 py-3 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div>
            <p className="text-xs text-stone-400">From</p>
            <p className="text-xl font-bold text-stone-900">
              {formatCurrency(trip.price)}
              <span className="text-sm font-normal text-stone-400"> / person</span>
            </p>
          </div>
          <Button
            size="lg"
            variant={isFull ? "accent" : "default"}
            className="min-w-[140px] shrink-0"
            onClick={handleBook}
          >
            {isFull ? "Join Waitlist" : "Book Now"}
          </Button>
        </div>
      </div>

      {/* Full-screen gallery */}
      <AnimatePresence>
        {galleryOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col bg-stone-950/95 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between px-4 py-4 sm:px-6">
              <p className="text-sm font-medium text-white">
                {trip.title} · {trip.images.length} photos
              </p>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
                onClick={() => setGalleryOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 pb-8 sm:px-6">
              <div className="mx-auto grid max-w-5xl gap-3 sm:grid-cols-2">
                {trip.images.map((img, i) => (
                  <div
                    key={i}
                    className={cn(
                      "relative aspect-[4/3] overflow-hidden rounded-xl",
                      i === 0 && "sm:col-span-2 sm:aspect-[21/9]"
                    )}
                  >
                    <Image src={img} alt="" fill className="object-cover" />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

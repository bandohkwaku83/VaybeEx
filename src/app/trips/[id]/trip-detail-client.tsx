/* eslint-disable react-hooks/static-components */
"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowLeft, Calendar, Check, ChevronLeft, ChevronRight, Clock,
  Compass, Heart, MapPin, Mountain, Palmtree, Share2, Shield,
  Sparkles, Star, Users, X, Binoculars, Building2, Landmark,
  Utensils, Bus, Tent, Camera,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VerifiedBadge } from "@/components/trips/verified-badge";
import { SeatCounter } from "@/components/trips/seat-counter";
import { StarRating } from "@/components/trips/star-rating";
import { useAuth } from "@/hooks/use-auth";
import { useWishlist } from "@/hooks/use-wishlist";
import { cn, formatCurrency, formatDateRange } from "@/lib/utils";
import { getSpotsLeft } from "@/lib/mock-data";
import { formatRefundPolicyLabel } from "@/lib/refund-utils";
import type { Organizer, Trip, TripCategory } from "@/lib/types";

gsap.registerPlugin(ScrollTrigger);

interface TripDetailClientProps {
  trip: Trip;
  organizer: Organizer;
}

const CATEGORY_META: Record<TripCategory, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  adventure: { label: "Adventure", icon: Mountain },
  beach: { label: "Beach", icon: Palmtree },
  cultural: { label: "Cultural", icon: Landmark },
  wildlife: { label: "Wildlife", icon: Binoculars },
  city: { label: "City", icon: Building2 },
  wellness: { label: "Wellness", icon: Sparkles },
};

const INCLUDED_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  guide: Compass, meal: Utensils, transport: Bus, camp: Tent, insurance: Shield, photo: Camera,
};
function getIncludedIcon(item: string) {
  const lower = item.toLowerCase();
  for (const [key, Icon] of Object.entries(INCLUDED_ICONS)) {
    if (lower.includes(key)) return Icon;
  }
  return Check;
}

function getTripDuration(start: string, end: string) {
  return Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

/* ════════════════════════════════════════════════════════════════
   LIGHTBOX — full-screen image viewer with prev/next navigation
   and keyboard support. Mounted at document root via a portal-like
   pattern (rendered at the top of the component tree but absolutely
   positioned over everything).
════════════════════════════════════════════════════════════════ */
function Lightbox({ images, startIndex, onClose }: { images: string[]; startIndex: number; onClose: () => void }) {
  const [index, setIndex] = useState(startIndex);
  const overlayRef = useRef<HTMLDivElement>(null);
  const imgWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: "power2.out" });
    gsap.fromTo(imgWrapRef.current, { scale: 0.93, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: "power3.out" });
  }, []);

  const goTo = (next: number) => {
    const el = imgWrapRef.current;
    if (!el) return;
    const dir = next > index ? 1 : -1;
    gsap.fromTo(el, { x: dir * 40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.25, ease: "power2.out" });
    setIndex(((next % images.length) + images.length) % images.length);
  };

  const close = () => {
    gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 0.2,
      onComplete: onClose,
    });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") goTo(index + 1);
      if (e.key === "ArrowLeft") goTo(index - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex flex-col"
      style={{ background: "rgba(10,6,3,0.95)", backdropFilter: "blur(8px)" }}
    >
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between px-5 py-4">
        <p className="text-sm font-medium" style={{ color: "rgba(251,247,241,0.7)" }}>
          {index + 1} / {images.length}
        </p>
        <button
          type="button"
          onClick={close}
          className="flex h-9 w-9 items-center justify-center rounded-full transition-colors"
          style={{ background: "rgba(251,247,241,0.1)", color: "#fbf7f1" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(251,247,241,0.2)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(251,247,241,0.1)")}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Image stage */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden px-14">
        <div ref={imgWrapRef} className="relative h-full max-h-[75vh] w-full max-w-5xl">
          <Image
            key={images[index]}
            src={images[index]}
            alt={`Photo ${index + 1}`}
            fill
            className="object-contain"
            priority
          />
        </div>

        <button
          type="button"
          onClick={() => goTo(index - 1)}
          className="absolute left-3 flex h-11 w-11 items-center justify-center rounded-full transition-colors"
          style={{ background: "rgba(251,247,241,0.12)", color: "#fbf7f1" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(251,247,241,0.22)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(251,247,241,0.12)")}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => goTo(index + 1)}
          className="absolute right-3 flex h-11 w-11 items-center justify-center rounded-full transition-colors"
          style={{ background: "rgba(251,247,241,0.12)", color: "#fbf7f1" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(251,247,241,0.22)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(251,247,241,0.12)")}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Thumbnail strip */}
      <div className="shrink-0 overflow-x-auto px-5 pb-5 pt-4">
        <div className="flex gap-2 justify-center">
          {images.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all"
              style={{ borderColor: i === index ? "var(--gold)" : "transparent" }}
            >
              <Image src={src} alt="" fill className="object-cover" />
              {i !== index && <div className="absolute inset-0 bg-black/40" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}


function HeroMosaic({ images, onOpen }: { images: string[]; onOpen: (i: number) => void }) {
  const focalRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!focalRef.current) return;
    gsap.fromTo(
      focalRef.current,
      { scale: 1.0 },
      { scale: 1.06, duration: 9, ease: "none", yoyo: true, repeat: -1 }
    );
  }, []);

  const count = images.length;

  const MosaicCell = ({ src, index, className }: { src: string; index: number; className?: string }) => (
    <button
      type="button"
      onClick={() => onOpen(index)}
      className={cn(
        "group relative block overflow-hidden",
        className
      )}
    >
      <Image
        src={src}
        alt={`Photo ${index + 1}`}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-105"
        ref={index === 0 ? focalRef : undefined}
        priority={index === 0}
        sizes="(max-width: 768px) 100vw, 60vw"
      />
      <div
        className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: "rgba(196,134,76,0.18)" }}
      />
    </button>
  );

  if (count === 1) {
    return (
      <div className="relative h-[55vh] w-full overflow-hidden">
        <MosaicCell src={images[0]} index={0} className="absolute inset-0" />
      </div>
    );
  }

  if (count === 2) {
    return (
      <div className="grid h-[65vh] grid-cols-[62%_38%] gap-1.5">
        <MosaicCell src={images[0]} index={0} className="relative" />
        <MosaicCell src={images[1]} index={1} className="relative" />
      </div>
    );
  }

  if (count === 3) {
    return (
      <div className="grid h-[65vh] grid-cols-[62%_38%] gap-1.5">
        <MosaicCell src={images[0]} index={0} className="relative row-span-2" />
        <MosaicCell src={images[1]} index={1} className="relative" />
        <MosaicCell src={images[2]} index={2} className="relative" />
      </div>
    );
  }

  // 4+ images: large focal left, 2×2 right (last cell shows +N overflow badge)
  const rightImages = images.slice(1, 5);
  const overflow = Math.max(0, count - 5);

  return (
    <div className="grid h-[70vh] min-h-[460px] grid-cols-[62%_38%] gap-1.5">
      <MosaicCell src={images[0]} index={0} className="relative" />
      <div className="grid grid-rows-2 gap-1.5">
        <div className="grid grid-cols-2 gap-1.5">
          {rightImages.slice(0, 2).map((src, i) => (
            <MosaicCell key={i} src={src} index={i + 1} className="relative" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {rightImages.slice(2, 4).map((src, i) => {
            const globalIdx = i + 3;
            const isLast = i === 1 && overflow > 0;
            return (
              <button
                key={i}
                type="button"
                onClick={() => onOpen(globalIdx)}
                className="group relative overflow-hidden"
              >
                <Image src={src} alt="" fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                {isLast && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1" style={{ background: "rgba(42,27,15,0.72)" }}>
                    <Camera className="h-5 w-5" style={{ color: "#fbf7f1" }} />
                    <span className="font-display text-lg font-bold" style={{ color: "#fbf7f1" }}>+{overflow + 1}</span>
                    <span className="text-xs" style={{ color: "rgba(251,247,241,0.7)" }}>more photos</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   BOOKING CARD — themed to match the project's brown/cream palette
════════════════════════════════════════════════════════════════ */
function BookingCard({
  trip, isFull, onBook, onSave, onShare, wishlisted, className,
}: { trip: Trip; isFull: boolean; onBook: () => void; onSave: () => void; onShare: () => void; wishlisted: boolean; className?: string }) {
  const fillPct = Math.round((trip.booked / trip.capacity) * 100);
  return (
    <Card className={cn("overflow-hidden border shadow-2xl", className)} style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
      <div className="h-1" style={{ background: "var(--gradient-brand)" }} />
      <CardContent className="p-6">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>From</p>
            <div className="flex items-baseline gap-1">
              <span className="font-display text-3xl font-bold" style={{ color: "var(--text)" }}>{formatCurrency(trip.price)}</span>
              <span style={{ color: "var(--text-tertiary)" }}>/ person</span>
            </div>
          </div>
          {trip.rating > 0 && (
            <div className="flex items-center gap-1 rounded-full px-2.5 py-1 text-sm" style={{ background: "var(--gold-dim)" }}>
              <Star className="h-3.5 w-3.5 fill-current" style={{ color: "var(--gold)" }} />
              <span className="font-semibold" style={{ color: "var(--primary)" }}>{trip.rating}</span>
            </div>
          )}
        </div>
        <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
          {formatCurrency(trip.depositAmount)} deposit to secure your spot
        </p>

        <Separator className="my-5" style={{ background: "var(--border)" }} />

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span style={{ color: "var(--text-secondary)" }}>Availability</span>
            <span className="font-medium" style={{ color: "var(--text)" }}>{trip.booked}/{trip.capacity} booked</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full" style={{ background: "var(--border)" }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${fillPct}%`, background: "var(--gradient-brand)" }} />
          </div>
          <SeatCounter trip={trip} live className="w-full justify-center" />
        </div>

        <div className="mt-5 space-y-2.5">
          <Button
            className="w-full rounded-xl text-sm font-semibold"
            size="lg"
            onClick={onBook}
            style={{ background: "var(--gradient-brand)", color: "#fbf7f1", boxShadow: "var(--glow-gold)" }}
          >
            {isFull ? "Join Waitlist" : "Book Now"}
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              className="rounded-xl"
              style={{ borderColor: "var(--border-strong)", color: "var(--text)" }}
              onClick={onSave}
            >
              <Heart className={cn("h-4 w-4", wishlisted && "fill-current")} style={{ color: wishlisted ? "var(--coral)" : undefined }} />
              Save
            </Button>
            <Button
              variant="outline"
              className="rounded-xl"
              style={{ borderColor: "var(--border-strong)", color: "var(--text)" }}
              onClick={onShare}
            >
              <Share2 className="h-4 w-4" /> Share
            </Button>
          </div>
        </div>

        <div className="mt-5 space-y-2.5 rounded-xl p-4" style={{ background: "var(--bg-secondary)" }}>
          <div className="flex items-start gap-2.5 text-sm" style={{ color: "var(--text-secondary)" }}>
            <Shield className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "var(--primary)" }} />
            <span>{formatRefundPolicyLabel(trip)}</span>
          </div>
          <div className="flex items-start gap-2.5 text-sm" style={{ color: "var(--text-secondary)" }}>
            <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "var(--gold)" }} />
            <span>No payment today — pay deposit to confirm</span>
          </div>
        </div>

        {trip.addOns.length > 0 && (
          <div className="mt-5">
            <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>Optional add-ons</p>
            <ul className="mt-2 space-y-1.5">
              {trip.addOns.slice(0, 3).map((addon) => (
                <li key={addon.id} className="flex items-center justify-between text-sm" style={{ color: "var(--text-secondary)" }}>
                  <span>{addon.name}</span>
                  <span className="font-medium" style={{ color: "var(--text)" }}>+{formatCurrency(addon.price)}</span>
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
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const pageRef = useRef<HTMLDivElement>(null);

  const spotsLeft = getSpotsLeft(trip);
  const isFull = spotsLeft === 0;
  const bookHref = `/trips/${trip.id}/book${isFull ? "?waitlist=true" : ""}`;
  const duration = getTripDuration(trip.startDate, trip.endDate);
  const CategoryIcon = CATEGORY_META[trip.category].icon;
  const wishlisted = isWishlisted(trip.id);

  const handleBook = () => requireAuth(() => router.push(bookHref), bookHref);
  const handleSave = () => requireAuth(() => {
    toggle(trip.id);
    toast.success(wishlisted ? "Removed from wishlist" : "Saved to wishlist");
  });
  const handleShare = () => { navigator.clipboard.writeText(window.location.href); toast.success("Link copied!"); };

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".trip-content-block", { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.09, ease: "power3.out", scrollTrigger: { trigger: pageRef.current, start: "top 70%", once: true } });
    }, pageRef);
    return () => ctx.revert();
  }, []);

  return (
    <>
 
      <div className="relative  w-full">
        <HeroMosaic images={trip.images} onOpen={(i) => setLightboxIndex(i)} />

       

        {/* "Show all photos" pill, bottom-right */}
        {trip.images.length > 1 && (
          <button
            type="button"
            onClick={() => setLightboxIndex(0)}
            className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium shadow-md backdrop-blur-md sm:bottom-5 sm:right-5"
            style={{ background: "rgba(251,247,241,0.9)", color: "var(--primary)" }}
          >
            <Camera className="h-4 w-4" />
            All {trip.images.length} photos
          </button>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════
          Main content — padded back in below the mosaic
      ════════════════════════════════════════════════════════ */}
      <div ref={pageRef} className="mx-auto w-full px-4 pb-28 pt-8 sm:px-6 lg:px-8 lg:pb-12">
        <div className="grid gap-10 lg:grid-cols-[1fr_380px] lg:gap-12">
          <div>
            {/* Header strip */}
            <div className="trip-content-block flex flex-wrap items-center gap-2">
              <span
                className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium capitalize"
                style={{ background: "var(--primary-dim)", color: "var(--primary)" }}
              >
                <CategoryIcon className="h-3 w-3" />
                {CATEGORY_META[trip.category].label}
              </span>
              {organizer.verified && <VerifiedBadge />}
              <SeatCounter trip={trip} live />
            </div>

            <h1 className="trip-content-block font-display mt-3 text-3xl font-bold tracking-tight sm:text-4xl" style={{ color: "var(--text)" }}>
              {trip.title}
            </h1>

            <div className="trip-content-block mt-3 flex flex-wrap items-center gap-x-4 gap-y-1" style={{ color: "var(--text-secondary)" }}>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" style={{ color: "var(--primary)" }} />
                {trip.destination}
              </span>
              {trip.rating > 0 && (
                <span className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-current" style={{ color: "var(--gold)" }} />
                  <span className="font-medium" style={{ color: "var(--text)" }}>{trip.rating}</span>
                  <span>({trip.reviewCount} reviews)</span>
                </span>
              )}
            </div>

            {/* Quick info cards */}
            <div className="trip-content-block mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { icon: Calendar, label: "Dates", value: formatDateRange(trip.startDate, trip.endDate) },
                { icon: Clock, label: "Duration", value: `${duration} day${duration === 1 ? "" : "s"}` },
                { icon: Users, label: "Group size", value: `Up to ${trip.capacity}` },
                { icon: CategoryIcon, label: "Style", value: CATEGORY_META[trip.category].label },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="rounded-xl border p-3.5" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
                  <Icon className="h-4 w-4" style={{ color: "var(--primary)" }} />
                  <p className="mt-2 text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>{label}</p>
                  <p className="mt-0.5 text-sm font-medium" style={{ color: "var(--text)" }}>{value}</p>
                </div>
              ))}
            </div>

            {/* Organizer link */}
            <Link
              href={`/organizers/${organizer.id}`}
              className="trip-content-block mt-6 flex items-center gap-3 rounded-xl border p-4 transition-all"
              style={{ borderColor: "var(--border)", background: "var(--surface)" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border-strong)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border)")}
            >
              <Avatar className="h-11 w-11 ring-2" style={{ "--ring-color": "var(--primary-dim)" } as React.CSSProperties}>
                <AvatarImage src={organizer.avatar} />
                <AvatarFallback>{organizer.name[0]}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium" style={{ color: "var(--text)" }}>Hosted by {organizer.name}</span>
                  {organizer.verified && <VerifiedBadge />}
                </div>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{organizer.tripCount} trips · {organizer.rating} rating</p>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0" style={{ color: "var(--text-tertiary)" }} />
            </Link>

            {/* About */}
            <section className="trip-content-block mt-8">
              <h2 className="font-display text-lg font-semibold" style={{ color: "var(--text)" }}>About this trip</h2>
              <p className={cn("mt-3 leading-relaxed", !descExpanded && "line-clamp-3")} style={{ color: "var(--text-secondary)" }}>
                {trip.description}
              </p>
              {trip.description.length > 180 && (
                <button type="button" onClick={() => setDescExpanded((v) => !v)} className="mt-2 text-sm font-medium" style={{ color: "var(--primary)" }}>
                  {descExpanded ? "Show less" : "Read more"}
                </button>
              )}
            </section>

            {/* Highlights */}
            <section className="trip-content-block mt-8">
              <h2 className="font-display text-lg font-semibold" style={{ color: "var(--text)" }}>Trip highlights</h2>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {trip.included.slice(0, 6).map((item) => {
                  const Icon = getIncludedIcon(item);
                  return (
                    <div key={item} className="flex items-center gap-2.5 rounded-xl px-3.5 py-3 text-sm" style={{ background: "var(--bg-secondary)" }}>
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: "var(--surface)" }}>
                        <Icon className="h-4 w-4" style={{ color: "var(--primary)" }} />
                      </div>
                      <span className="leading-snug" style={{ color: "var(--text)" }}>{item}</span>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Tabs */}
            <div className="trip-content-block mt-10">
              <Tabs defaultValue="itinerary">
                <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto rounded-xl p-1" style={{ background: "var(--bg-secondary)" }}>
                  {(["itinerary", "included", "reviews", "organizer"] as const).map((tab) => (
                    <TabsTrigger key={tab} value={tab} className="rounded-lg capitalize data-[state=active]:shadow-sm">
                      {tab}
                      {tab === "reviews" && trip.reviewCount > 0 && (
                        <span className="ml-1.5 rounded-full px-1.5 py-0.5 text-xs tabular-nums" style={{ background: "var(--border)", color: "var(--text-secondary)" }}>
                          {trip.reviewCount}
                        </span>
                      )}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value="itinerary">
                  <div className="relative mt-6 space-y-0">
                    {trip.itinerary.map((day, idx) => (
                      <div key={day.day} className="relative flex gap-5 pb-8 last:pb-0">
                        {idx < trip.itinerary.length - 1 && (
                          <div className="absolute left-[15px] top-10 h-[calc(100%-16px)] w-0.5" style={{ background: "linear-gradient(to bottom, var(--gold-dim), var(--border))" }} />
                        )}
                        <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold" style={{ background: "var(--gradient-brand)", color: "#fbf7f1" }}>
                          {day.day}
                        </div>
                        <div className="min-w-0 flex-1 rounded-xl border p-4" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
                          <h3 className="font-semibold" style={{ color: "var(--text)" }}>{day.title}</h3>
                          <ul className="mt-3 space-y-2">
                            {day.activities.map((activity, i) => (
                              <li key={i} className="flex items-start gap-2.5 text-sm" style={{ color: "var(--text-secondary)" }}>
                                <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: "var(--gold)" }} />
                                {activity}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="included">
                  <div className="mt-6 space-y-6">
                    <div>
                      <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--gold)" }}>What&apos;s included</h3>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {trip.included.map((item) => {
                          const Icon = getIncludedIcon(item);
                          return (
                            <div key={item} className="flex items-center gap-3 rounded-xl border px-4 py-3" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
                              <Icon className="h-4 w-4 shrink-0" style={{ color: "var(--gold)" }} />
                              <span className="text-sm" style={{ color: "var(--text)" }}>{item}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    {trip.excluded.length > 0 && (
                      <div>
                        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--coral)" }}>Not included</h3>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {trip.excluded.map((item) => (
                            <div key={item} className="flex items-center gap-3 rounded-xl border px-4 py-3" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
                              <X className="h-4 w-4 shrink-0" style={{ color: "var(--coral)" }} />
                              <span className="text-sm" style={{ color: "var(--text)" }}>{item}</span>
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
                      <div className="flex flex-col items-center rounded-xl border border-dashed py-12 text-center" style={{ borderColor: "var(--border)" }}>
                        <Star className="h-8 w-8" style={{ color: "var(--border)" }} />
                        <p className="mt-3 font-medium" style={{ color: "var(--text)" }}>No reviews yet</p>
                        <p className="mt-1 text-sm" style={{ color: "var(--text-tertiary)" }}>Be the first to share your experience!</p>
                      </div>
                    ) : (
                      <>
                        <div className="mb-6 flex items-center gap-6 rounded-xl p-5" style={{ background: "var(--gold-dim)" }}>
                          <div className="text-center">
                            <p className="font-display text-4xl font-bold" style={{ color: "var(--text)" }}>{trip.rating}</p>
                            <StarRating rating={Math.round(trip.rating)} size="sm" />
                            <p className="mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>{trip.reviewCount} reviews</p>
                          </div>
                          <Separator orientation="vertical" className="h-16" style={{ background: "var(--border)" }} />
                          <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>Travelers love this trip for its organization, authentic experiences, and knowledgeable guides.</p>
                        </div>
                        <div className="space-y-4">
                          {trip.reviews.map((review) => (
                            <div key={review.id} className="rounded-xl border p-5" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
                              <div className="flex items-start gap-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={review.avatar} />
                                  <AvatarFallback>{review.author[0]}</AvatarFallback>
                                </Avatar>
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-medium" style={{ color: "var(--text)" }}>{review.author}</span>
                                    <StarRating rating={review.rating} size="sm" />
                                  </div>
                                  <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{review.comment}</p>
                                  <p className="mt-2 text-xs" style={{ color: "var(--text-tertiary)" }}>{review.date}</p>
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
                  <div className="mt-6 overflow-hidden rounded-2xl border" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
                    <div className="h-24" style={{ background: "var(--gradient-teal)" }} />
                    <div className="relative px-6 pb-6">
                      <Avatar className="absolute -top-10 h-20 w-20 border-4" style={{ borderColor: "var(--surface)" }}>
                        <AvatarImage src={organizer.avatar} />
                        <AvatarFallback className="text-xl">{organizer.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="pt-14">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-display text-xl font-semibold" style={{ color: "var(--text)" }}>{organizer.name}</h3>
                          {organizer.verified && <VerifiedBadge />}
                        </div>
                        <p className="mt-1 flex items-center gap-1.5 text-sm" style={{ color: "var(--text-secondary)" }}>
                          <MapPin className="h-3.5 w-3.5" /> {organizer.location}
                        </p>
                        <p className="mt-4 leading-relaxed" style={{ color: "var(--text-secondary)" }}>{organizer.bio}</p>
                        <div className="mt-5 flex flex-wrap gap-3">
                          {[
                            { label: `${organizer.rating} rating`, icon: Star },
                            { label: `${organizer.tripCount} trips hosted` },
                            { label: `${organizer.reviewCount} reviews` },
                          ].map(({ label, icon: Icon }) => (
                            <span key={label} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium" style={{ background: "var(--bg-secondary)", color: "var(--text)" }}>
                              {Icon && <Icon className="h-3.5 w-3.5 fill-current" style={{ color: "var(--gold)" }} />}
                              {label}
                            </span>
                          ))}
                        </div>
                        <Button asChild variant="outline" className="mt-5 rounded-xl" style={{ borderColor: "var(--border-strong)", color: "var(--text)" }}>
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
          </div>

          {/* Desktop booking sidebar */}
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <BookingCard trip={trip} isFull={isFull} onBook={handleBook} onSave={handleSave} onShare={handleShare} wishlisted={wishlisted} />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky booking bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t px-4 py-3 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] backdrop-blur-md lg:hidden" style={{ borderColor: "var(--border)", background: "rgba(251,247,241,0.96)" }}>
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div>
            <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>From</p>
            <p className="font-display text-xl font-bold" style={{ color: "var(--text)" }}>
              {formatCurrency(trip.price)}
              <span className="text-sm font-normal" style={{ color: "var(--text-tertiary)" }}> / person</span>
            </p>
          </div>
          <Button
            size="lg"
            className="min-w-[140px] shrink-0 rounded-xl"
            style={{ background: "var(--gradient-brand)", color: "#fbf7f1", boxShadow: "var(--glow-gold)" }}
            onClick={handleBook}
          >
            {isFull ? "Join Waitlist" : "Book Now"}
          </Button>
        </div>
      </div>

      {/* Lightbox — rendered last so it sits above everything */}
      {lightboxIndex !== null && (
        <Lightbox images={trip.images} startIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />
      )}
    </>
  );
}
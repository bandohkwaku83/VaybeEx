/* eslint-disable react-hooks/static-components */
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MediaImage } from "@/components/ui/media-image";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import {
  ArrowLeft,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Heart,
  HeartHandshake,
  MapPin,
  Share2,
  Shield,
  Star,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { VerifiedBadge } from "@/components/trips/verified-badge";
import { StarRating } from "@/components/trips/star-rating";
import { useAuth } from "@/hooks/use-auth";
import { useWishlist } from "@/hooks/use-wishlist";
import { DEFAULT_PROFILE_IMAGE } from "@/lib/api/media";
import { cn, formatCurrency, formatDateRange } from "@/lib/utils";
import { trackTripEvent } from "@/lib/api/public-trips";
import { formatRefundPolicyLabel } from "@/lib/refund-utils";
import {
  formatSpotsLeftLabel,
  getSpotsLeft,
  isTripBookable,
  isTripFull,
} from "@/lib/trip-capacity";
import {
  getTenantBrandHomeUrl,
  getTripPublicSlug,
} from "@/lib/tenant";
import { getBrandFromHost } from "@/lib/tenant-host";
import { tripSpecialtyLabel } from "@/lib/trip-specialties";
import { findActiveBookingForTrip } from "@/lib/api/bookings";
import type { Booking, Organizer, Trip } from "@/lib/types";

function existingBookingCta(booking: Booking): { label: string; hint: string } {
  if (booking.paymentStatus === "paid") {
    return {
      label: "You're booked",
      hint: "This trip is already on your bookings",
    };
  }
  if (booking.paymentStatus === "partial") {
    return {
      label: "Pay balance",
      hint: "You already reserved this trip — pay the remaining balance",
    };
  }
  return {
    label: "Complete payment",
    hint: "Finish paying to confirm your existing reservation",
  };
}

interface TripDetailClientProps {
  trip: Trip;
  organizer: Organizer;
}

function formatClock(time?: string) {
  if (!time) return null;
  const [h, m] = time.split(":").map(Number);
  if (Number.isNaN(h)) return time;
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m ?? 0).padStart(2, "0")} ${period}`;
}

function Lightbox({
  images,
  startIndex,
  onClose,
}: {
  images: string[];
  startIndex: number;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(startIndex);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.fromTo(
      overlayRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.2, ease: "power2.out" }
    );
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight")
        setIndex((i) => (i + 1) % images.length);
      if (e.key === "ArrowLeft")
        setIndex((i) => (i - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [images.length, onClose]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex flex-col"
      style={{ background: "rgba(10,6,3,0.94)" }}
    >
      <div className="flex shrink-0 items-center justify-between px-5 py-4">
        <p className="text-sm" style={{ color: "rgba(251,247,241,0.7)" }}>
          {index + 1} / {images.length}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-none"
          style={{ background: "rgba(251,247,241,0.12)", color: "#fbf7f1" }}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="relative flex flex-1 items-center justify-center px-12">
        <div className="relative h-full max-h-[78vh] w-full max-w-5xl">
          <MediaImage
            key={images[index]}
            src={images[index]}
            alt=""
            fill
            className="object-contain"
            priority
            sizes="100vw"
          />
        </div>
        <button
          type="button"
          onClick={() =>
            setIndex((i) => (i - 1 + images.length) % images.length)
          }
          className="absolute left-3 flex h-10 w-10 items-center justify-center rounded-full"
          style={{ background: "rgba(251,247,241,0.12)", color: "#fbf7f1" }}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => setIndex((i) => (i + 1) % images.length)}
          className="absolute right-3 flex h-10 w-10 items-center justify-center rounded-full"
          style={{ background: "rgba(251,247,241,0.12)", color: "#fbf7f1" }}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

/** Airbnb-style photo grid — inset, rounded, show-all control */
function PhotoGallery({
  images,
  onOpen,
}: {
  images: string[];
  onOpen: (i: number) => void;
}) {
  const pics = images.length ? images : ["/images/cta-image.jpg"];
  const count = pics.length;

  if (count === 1) {
    return (
      <button
        type="button"
        onClick={() => onOpen(0)}
        className="relative block h-[42vh] min-h-[280px] w-full overflow-hidden rounded-2xl sm:h-[52vh]"
      >
        <MediaImage
          src={pics[0]}
          alt=""
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      </button>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl">
      <div
        className={cn(
          "grid gap-1.5",
          count === 2
            ? "grid-cols-2"
            : "grid-cols-1 sm:grid-cols-[1.4fr_1fr]"
        )}
      >
        <button
          type="button"
          onClick={() => onOpen(0)}
          className="relative h-[280px] overflow-hidden sm:h-[420px]"
        >
          <MediaImage
            src={pics[0]}
            alt=""
            fill
            className="object-cover transition-transform duration-500 hover:scale-[1.02]"
            priority
            sizes="(max-width: 640px) 100vw, 60vw"
          />
        </button>

        {count >= 3 ? (
          <div className="hidden h-[280px] grid-cols-2 grid-rows-2 gap-1.5 sm:grid sm:h-[420px]">
            {pics.slice(1, 5).map((src, i) => (
              <button
                key={src + i}
                type="button"
                onClick={() => onOpen(i + 1)}
                className="relative h-full min-h-0 overflow-hidden"
              >
                <MediaImage
                  src={src}
                  alt=""
                  fill
                  className="object-cover transition-transform duration-500 hover:scale-[1.03]"
                  sizes="25vw"
                />
              </button>
            ))}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onOpen(1)}
            className="relative hidden h-[420px] overflow-hidden sm:block"
          >
            <MediaImage
              src={pics[1]}
              alt=""
              fill
              className="object-cover transition-transform duration-500 hover:scale-[1.02]"
              sizes="40vw"
            />
          </button>
        )}
      </div>

      {count > 1 && (
        <button
          type="button"
          onClick={() => onOpen(0)}
          className="absolute bottom-3 right-3 inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold shadow-sm backdrop-blur-md"
          style={{
            background: "rgba(255,255,255,0.92)",
            borderColor: "var(--border-strong)",
            color: "var(--text)",
          }}
        >
          <Camera className="h-3.5 w-3.5" />
          Show all {count} photos
        </button>
      )}
    </div>
  );
}

function BookingPanel({
  trip,
  isFull,
  onBook,
  onSave,
  onShare,
  wishlisted,
  existingBooking,
}: {
  trip: Trip;
  isFull: boolean;
  onBook: () => void;
  onSave: () => void;
  onShare: () => void;
  wishlisted: boolean;
  existingBooking: Booking | null;
}) {
  const bookable = isTripBookable(trip);
  const existingCta = existingBooking
    ? existingBookingCta(existingBooking)
    : null;
  const spots = getSpotsLeft(trip);
  const showCouple =
    trip.offerCouplePrice !== false && trip.couplePrice != null;
  const showGroup =
    trip.offerGroupPrice !== false && trip.groupPrice != null;

  return (
    <aside className="overflow-hidden rounded-2xl bg-white shadow-[0_6px_30px_rgba(42,27,15,0.1)] ring-1 ring-black/[0.06]">
      <div className="p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span
                className="font-display text-[1.75rem] font-bold leading-none tracking-tight"
                style={{ color: "var(--text)" }}
              >
                {formatCurrency(trip.price)}
              </span>
              <span
                className="text-sm"
                style={{ color: "var(--text-tertiary)" }}
              >
                person
              </span>
            </div>
            <p
              className="mt-2 text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              {existingCta
                ? existingCta.hint
                : bookable
                  ? `${formatCurrency(trip.depositAmount)} due today to reserve`
                  : trip.status === "completed"
                    ? "This trip has already been completed"
                    : "Booking is not available for this trip"}
            </p>
          </div>
          {trip.rating > 0 && (
            <span
              className="inline-flex items-center gap-1 text-sm font-semibold"
              style={{ color: "var(--text)" }}
            >
              <Star
                className="h-3.5 w-3.5 fill-current"
                style={{ color: "var(--gold)" }}
              />
              {trip.rating}
            </span>
          )}
        </div>

        <div
          className="mt-5 flex items-center gap-2 rounded-xl border px-3.5 py-3"
          style={{ borderColor: "var(--border)" }}
        >
          <Users
            className="h-4 w-4 shrink-0"
            style={{
              color:
                spots === 0
                  ? "var(--coral)"
                  : spots != null && spots <= 5
                    ? "var(--amber)"
                    : "#2e7d52",
            }}
          />
          <div className="min-w-0 flex-1">
            <p
              className="text-[11px] font-medium uppercase tracking-wide"
              style={{ color: "var(--text-tertiary)" }}
            >
              Spots left
            </p>
            <p
              className="truncate text-sm font-semibold"
              style={{
                color:
                  spots === 0
                    ? "var(--coral)"
                    : spots != null && spots <= 5
                      ? "var(--amber)"
                      : "var(--text)",
              }}
            >
              {formatSpotsLeftLabel(trip)}
            </p>
          </div>
        </div>

        {(showCouple || showGroup) && (
          <div className="mt-5">
            <p
              className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.12em]"
              style={{ color: "var(--text-tertiary)" }}
            >
              Pricing options
            </p>
            <div
              className="overflow-hidden rounded-xl border"
              style={{ borderColor: "var(--border)" }}
            >
              <div
                className="flex items-center justify-between px-3.5 py-2.5 text-sm"
                style={{ background: "var(--bg-secondary)" }}
              >
                <span style={{ color: "var(--text-secondary)" }}>
                  Per person
                </span>
                <span className="font-semibold" style={{ color: "var(--text)" }}>
                  {formatCurrency(trip.price)}
                </span>
              </div>
              {showCouple && (
                <div
                  className="flex items-center justify-between border-t px-3.5 py-2.5 text-sm"
                  style={{ borderColor: "var(--border)" }}
                >
                  <span
                    className="inline-flex items-center gap-2"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <HeartHandshake
                      className="h-3.5 w-3.5"
                      style={{ color: "var(--gold)" }}
                    />
                    Couple
                  </span>
                  <span
                    className="font-semibold"
                    style={{ color: "var(--text)" }}
                  >
                    {formatCurrency(trip.couplePrice!)}
                  </span>
                </div>
              )}
              {showGroup && (
                <div
                  className="flex items-center justify-between border-t px-3.5 py-2.5 text-sm"
                  style={{ borderColor: "var(--border)" }}
                >
                  <span
                    className="inline-flex items-center gap-2"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <Users
                      className="h-3.5 w-3.5"
                      style={{ color: "var(--gold)" }}
                    />
                    Group of {trip.groupSize ?? "—"}
                  </span>
                  <span
                    className="font-semibold"
                    style={{ color: "var(--text)" }}
                  >
                    {formatCurrency(trip.groupPrice!)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={onBook}
          disabled={!existingCta && !bookable}
          className="mt-5 flex h-12 w-full items-center justify-center rounded-none text-sm font-semibold text-white transition-opacity hover:opacity-95 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          style={{ background: "var(--primary)" }}
        >
          {existingCta
            ? existingCta.label
            : !bookable
              ? trip.status === "completed"
                ? "Completed"
                : "Unavailable"
              : isFull
                ? "Join waitlist"
                : "Reserve"}
        </button>

        <p
          className="mt-2.5 text-center text-xs"
          style={{ color: "var(--text-tertiary)" }}
        >
          {existingCta
            ? "Open your booking instead of creating another one"
            : bookable
              ? "You won't be charged the full amount yet"
              : "Booking is closed for this trip"}
        </p>

        <div className="mt-4 flex items-center justify-center gap-1">
          <button
            type="button"
            onClick={onSave}
            className="inline-flex items-center gap-1.5 rounded-none px-3 py-2 text-sm font-semibold transition-colors hover:bg-black/[0.04]"
            style={{ color: wishlisted ? "var(--coral)" : "var(--text)" }}
          >
            <Heart
              className={cn("h-4 w-4", wishlisted && "fill-current")}
              strokeWidth={1.75}
            />
            <span className="underline decoration-[1.5px] underline-offset-2">
              {wishlisted ? "Saved" : "Save"}
            </span>
          </button>
          <button
            type="button"
            onClick={onShare}
            className="inline-flex items-center gap-1.5 rounded-none px-3 py-2 text-sm font-semibold transition-colors hover:bg-black/[0.04]"
            style={{ color: "var(--text)" }}
          >
            <Share2 className="h-4 w-4" strokeWidth={1.75} />
            <span className="underline decoration-[1.5px] underline-offset-2">
              Share
            </span>
          </button>
        </div>
      </div>

      <div
        className="border-t px-6 py-4"
        style={{
          borderColor: "var(--border)",
          background: "var(--bg-secondary)",
        }}
      >
        <p
          className="flex items-start gap-2.5 text-sm leading-snug"
          style={{ color: "var(--text-secondary)" }}
        >
          <Shield
            className="mt-0.5 h-4 w-4 shrink-0"
            style={{ color: "var(--primary)" }}
          />
          {formatRefundPolicyLabel(trip)}
        </p>

        {trip.addOns.length > 0 && (
          <div className="mt-4 border-t pt-4" style={{ borderColor: "var(--border)" }}>
            <p
              className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em]"
              style={{ color: "var(--text-tertiary)" }}
            >
              Add-ons
            </p>
            <ul className="space-y-2">
              {trip.addOns.map((addon) => (
                <li
                  key={addon.id}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span style={{ color: "var(--text-secondary)" }}>
                    {addon.name}
                    <span
                      className="ml-1 text-xs"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      · {addon.perPerson === false ? "booking" : "person"}
                    </span>
                  </span>
                  <span
                    className="font-semibold tabular-nums"
                    style={{ color: "var(--text)" }}
                  >
                    +{formatCurrency(addon.price)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </aside>
  );
}

export function TripDetailClient({ trip, organizer }: TripDetailClientProps) {
  const router = useRouter();
  const { requireTravelerAuth, user, isLoading: authLoading } = useAuth();
  const { toggle, isWishlisted } = useWishlist();
  const [descExpanded, setDescExpanded] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [existingBooking, setExistingBooking] = useState<Booking | null>(null);
  const pageRef = useRef<HTMLDivElement>(null);

  const isFull = isTripFull(trip);
  const bookable = isTripBookable(trip);
  const existingCta = existingBooking
    ? existingBookingCta(existingBooking)
    : null;
  const organizerHomeHref = organizer.brandSlug
    ? getTenantBrandHomeUrl(organizer.brandSlug)
    : `/organizers/${organizer.id}`;
  const wishlisted = isWishlisted(trip.id, trip.isFavorited === true);
  const highlights = trip.highlights?.length
    ? trip.highlights
    : trip.included.slice(0, 4);
  const hasLogistics = Boolean(
    trip.meetingPoint ||
      trip.departurePoint ||
      trip.departureTime ||
      trip.returnTime
  );

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== "traveler") {
      setExistingBooking(null);
      return;
    }
    let cancelled = false;
    void findActiveBookingForTrip(trip.id)
      .then((booking) => {
        if (!cancelled) setExistingBooking(booking);
      })
      .catch(() => {
        if (!cancelled) setExistingBooking(null);
      });
    return () => {
      cancelled = true;
    };
  }, [authLoading, user, trip.id]);

  const handleBook = () => {
    if (existingBooking) {
      requireTravelerAuth(() => {
        router.push("/dashboard");
      }, "/dashboard");
      return;
    }

    const onTenant =
      typeof window !== "undefined" &&
      Boolean(getBrandFromHost(window.location.host));
    // Always same-origin: Next's router.push strips host from absolute tenant URLs
    // (e.g. http://brand.localhost/slug/book → /slug/book on apex → 404).
    const dest = onTenant
      ? `/${getTripPublicSlug(trip)}/book${isFull ? "?waitlist=true" : ""}`
      : `/trips/${trip.id}/book${isFull ? "?waitlist=true" : ""}`;

    requireTravelerAuth(() => {
      void trackTripEvent(trip.id, "book_click").catch(() => {});
      router.push(dest);
    }, dest);
  };


  const handleSave = () =>
    requireTravelerAuth(() => {
      void (async () => {
        const wasSaved = wishlisted;
        try {
          await toggle(trip.id);
          toast.success(
            wasSaved ? "Removed from wishlist" : "Saved to wishlist"
          );
        } catch {
          /* hook toast */
        }
      })();
    });

  const handleShare = () => {
    void navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied!");
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".td-reveal",
        { y: 18, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.55,
          stagger: 0.06,
          ease: "power3.out",
        }
      );
    }, pageRef);
    return () => ctx.revert();
  }, []);

  return (
    <>
      <div
        ref={pageRef}
        className="mx-auto max-w-6xl px-4 pb-28 pt-24 sm:px-6 sm:pt-28 lg:px-8 lg:pb-16"
      >
        <button
          type="button"
          onClick={() => router.back()}
          className="td-reveal mb-5 inline-flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-70"
          style={{ color: "var(--text-secondary)" }}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        {/* Title block — identity before media; Share/Save on the right */}
        <header className="td-reveal mb-5">
          <div className="flex flex-wrap items-start justify-between gap-3 sm:gap-4">
            <div className="min-w-0 max-w-3xl">
              <h1
                className="font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]"
                style={{ color: "var(--text)" }}
              >
                {trip.title}
              </h1>
              <div
                className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <MapPin className="h-3.5 w-3.5" style={{ color: "var(--gold)" }} />
                  {trip.destination}
                </span>
                <span style={{ color: "var(--border-strong)" }}>·</span>
                <span>{formatDateRange(trip.startDate, trip.endDate)}</span>
                {organizer.verified && (
                  <>
                    <span style={{ color: "var(--border-strong)" }}>·</span>
                    <VerifiedBadge />
                  </>
                )}
                {trip.rating > 0 && (
                  <>
                    <span style={{ color: "var(--border-strong)" }}>·</span>
                    <span className="inline-flex items-center gap-1">
                      <Star
                        className="h-3.5 w-3.5 fill-current"
                        style={{ color: "var(--gold)" }}
                      />
                      <span className="font-medium" style={{ color: "var(--text)" }}>
                        {trip.rating}
                      </span>
                      <span>({trip.reviewCount})</span>
                    </span>
                  </>
                )}
              </div>
            </div>

            <div
              className="flex shrink-0 items-center gap-1 pt-1.5"
              role="group"
              aria-label="Trip actions"
            >
              <button
                type="button"
                onClick={handleShare}
                aria-label="Share trip"
                className="inline-flex items-center gap-2 rounded-none px-3 py-2 text-sm font-semibold transition-colors hover:bg-black/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/25"
                style={{ color: "var(--text)" }}
              >
                <Share2 className="h-[18px] w-[18px]" strokeWidth={1.5} />
                <span className="underline decoration-[1.5px] underline-offset-[3px]">
                  Share
                </span>
              </button>
              <button
                type="button"
                onClick={handleSave}
                aria-label={wishlisted ? "Remove from wishlist" : "Save trip"}
                aria-pressed={wishlisted}
                className="inline-flex items-center gap-2 rounded-none px-3 py-2 text-sm font-semibold transition-colors hover:bg-black/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/25"
                style={{ color: "var(--text)" }}
              >
                <Heart
                  className={cn(
                    "h-[18px] w-[18px]",
                    wishlisted && "fill-[var(--coral)] text-[var(--coral)]"
                  )}
                  strokeWidth={1.5}
                />
                <span className="underline decoration-[1.5px] underline-offset-[3px]">
                  {wishlisted ? "Saved" : "Save"}
                </span>
              </button>
            </div>
          </div>
        </header>

        <div className="td-reveal mb-10">
          <PhotoGallery
            images={trip.images}
            onOpen={(i) => setLightboxIndex(i)}
          />
        </div>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-14">
          <div className="min-w-0">
            {/* Host strip */}
            <Link
              href={organizerHomeHref}
              className="td-reveal flex items-center gap-3 border-b pb-6"
              style={{ borderColor: "var(--border)" }}
            >
              <Avatar className="h-12 w-12">
                <AvatarImage src={organizer.avatar || DEFAULT_PROFILE_IMAGE} />
                <AvatarFallback className="overflow-hidden p-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={DEFAULT_PROFILE_IMAGE}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="font-medium" style={{ color: "var(--text)" }}>
                  Hosted by {organizer.name}
                </p>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  {[
                    organizer.location,
                    formatSpotsLeftLabel(trip),
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
              <ChevronRight
                className="h-5 w-5 shrink-0"
                style={{ color: "var(--text-tertiary)" }}
              />
            </Link>

            {/* Highlights — open list, not boxed cards */}
            <section className="td-reveal border-b py-8" style={{ borderColor: "var(--border)" }}>
              <h2
                className="font-display text-xl font-semibold tracking-tight"
                style={{ color: "var(--text)" }}
              >
                What you&apos;ll experience
              </h2>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {highlights.map((item, i) => (
                  <li
                    key={`${item}-${i}`}
                    className="flex items-start gap-3 text-sm leading-snug"
                    style={{ color: "var(--text)" }}
                  >
                    <Check
                      className="mt-0.5 h-4 w-4 shrink-0"
                      style={{ color: "var(--gold)" }}
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            {/* About */}
            <section className="td-reveal border-b py-8" style={{ borderColor: "var(--border)" }}>
              <h2
                className="font-display text-xl font-semibold tracking-tight"
                style={{ color: "var(--text)" }}
              >
                About this trip
              </h2>
              <p
                className={cn(
                  "mt-4 text-[15px] leading-relaxed",
                  !descExpanded && "line-clamp-5"
                )}
                style={{ color: "var(--text-secondary)" }}
              >
                {trip.description}
              </p>
              {trip.description.length > 220 && (
                <button
                  type="button"
                  onClick={() => setDescExpanded((v) => !v)}
                  className="mt-3 text-sm font-semibold underline underline-offset-4"
                  style={{ color: "var(--text)" }}
                >
                  {descExpanded ? "Show less" : "Show more"}
                </button>
              )}
            </section>

            {/* Itinerary timeline */}
            {trip.itinerary.length > 0 && (
              <section
                className="td-reveal border-b py-8"
                style={{ borderColor: "var(--border)" }}
              >
                <h2
                  className="font-display text-xl font-semibold tracking-tight"
                  style={{ color: "var(--text)" }}
                >
                  Itinerary
                </h2>
                <p className="mt-1.5 text-sm" style={{ color: "var(--text-secondary)" }}>
                  {trip.itinerary.length} day
                  {trip.itinerary.length === 1 ? "" : "s"} planned with your host
                </p>

                <ol className="relative mt-8 space-y-0">
                  {trip.itinerary.map((day, idx) => (
                    <li key={day.day} className="relative flex gap-4 pb-8 last:pb-0">
                      {idx < trip.itinerary.length - 1 && (
                        <span
                          className="absolute left-[15px] top-8 bottom-0 w-px"
                          style={{ background: "var(--border-strong)" }}
                        />
                      )}
                      <span
                        className="relative z-[1] flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                        style={{
                          background: "var(--primary)",
                          color: "#fbf7f1",
                        }}
                      >
                        {day.day}
                      </span>
                      <div className="min-w-0 flex-1 pt-0.5">
                        <h3
                          className="font-medium"
                          style={{ color: "var(--text)" }}
                        >
                          {day.title}
                        </h3>
                        <ul className="mt-2 space-y-1.5">
                          {day.activities.map((activity, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-2 text-sm"
                              style={{ color: "var(--text-secondary)" }}
                            >
                              <Clock
                                className="mt-0.5 h-3.5 w-3.5 shrink-0"
                                style={{ color: "var(--gold)" }}
                              />
                              {activity}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {/* Included */}
            <section className="td-reveal border-b py-8" style={{ borderColor: "var(--border)" }}>
              <h2
                className="font-display text-xl font-semibold tracking-tight"
                style={{ color: "var(--text)" }}
              >
                What&apos;s included
              </h2>
              <div className="mt-5 grid gap-8 sm:grid-cols-2">
                <div>
                  <p
                    className="mb-3 text-xs font-semibold uppercase tracking-[0.14em]"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    Included
                  </p>
                  <ul className="space-y-2.5">
                    {trip.included.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2.5 text-sm"
                        style={{ color: "var(--text)" }}
                      >
                        <Check
                          className="mt-0.5 h-4 w-4 shrink-0"
                          style={{ color: "var(--gold)" }}
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                {trip.excluded.length > 0 && (
                  <div>
                    <p
                      className="mb-3 text-xs font-semibold uppercase tracking-[0.14em]"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      Not included
                    </p>
                    <ul className="space-y-2.5">
                      {trip.excluded.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-2.5 text-sm"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          <X
                            className="mt-0.5 h-4 w-4 shrink-0"
                            style={{ color: "var(--coral)" }}
                          />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </section>

            {/* Logistics */}
            {hasLogistics && (
              <section
                className="td-reveal border-b py-8"
                style={{ borderColor: "var(--border)" }}
              >
                <h2
                  className="font-display text-xl font-semibold tracking-tight"
                  style={{ color: "var(--text)" }}
                >
                  Where to meet
                </h2>
                <dl className="mt-5 grid gap-5 sm:grid-cols-2">
                  {trip.meetingPoint && (
                    <div>
                      <dt
                        className="text-xs font-semibold uppercase tracking-[0.14em]"
                        style={{ color: "var(--text-tertiary)" }}
                      >
                        Meeting point
                      </dt>
                      <dd
                        className="mt-1.5 text-sm font-medium leading-snug"
                        style={{ color: "var(--text)" }}
                      >
                        {trip.meetingPoint}
                      </dd>
                    </div>
                  )}
                  {trip.departurePoint && (
                    <div>
                      <dt
                        className="text-xs font-semibold uppercase tracking-[0.14em]"
                        style={{ color: "var(--text-tertiary)" }}
                      >
                        Departure
                      </dt>
                      <dd
                        className="mt-1.5 text-sm font-medium leading-snug"
                        style={{ color: "var(--text)" }}
                      >
                        {trip.departurePoint}
                      </dd>
                    </div>
                  )}
                  {trip.departureTime && (
                    <div>
                      <dt
                        className="text-xs font-semibold uppercase tracking-[0.14em]"
                        style={{ color: "var(--text-tertiary)" }}
                      >
                        Departs
                      </dt>
                      <dd
                        className="mt-1.5 text-sm font-medium"
                        style={{ color: "var(--text)" }}
                      >
                        {formatClock(trip.departureTime)}
                      </dd>
                    </div>
                  )}
                  {trip.returnTime && (
                    <div>
                      <dt
                        className="text-xs font-semibold uppercase tracking-[0.14em]"
                        style={{ color: "var(--text-tertiary)" }}
                      >
                        Returns
                      </dt>
                      <dd
                        className="mt-1.5 text-sm font-medium"
                        style={{ color: "var(--text)" }}
                      >
                        {formatClock(trip.returnTime)}
                      </dd>
                    </div>
                  )}
                </dl>
              </section>
            )}

            {/* Reviews */}
            <section className="td-reveal border-b py-8" style={{ borderColor: "var(--border)" }}>
              <h2
                className="font-display text-xl font-semibold tracking-tight"
                style={{ color: "var(--text)" }}
              >
                {trip.reviews.length > 0
                  ? `${trip.rating} · ${trip.reviewCount} reviews`
                  : "Reviews"}
              </h2>
              {trip.reviews.length === 0 ? (
                <p className="mt-4 text-sm" style={{ color: "var(--text-secondary)" }}>
                  No reviews yet — be among the first travelers on this trip.
                </p>
              ) : (
                <div className="mt-6 grid gap-6 sm:grid-cols-2">
                  {trip.reviews.map((review) => (
                    <article key={review.id}>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={review.avatar} />
                          <AvatarFallback>{review.author[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p
                            className="text-sm font-medium"
                            style={{ color: "var(--text)" }}
                          >
                            {review.author}
                          </p>
                          <p
                            className="text-xs"
                            style={{ color: "var(--text-tertiary)" }}
                          >
                            {review.date}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <StarRating rating={review.rating} size="sm" />
                      </div>
                      <p
                        className="mt-2 text-sm leading-relaxed"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {review.comment}
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </section>

            {/* Host — editorial portrait panel */}
            <section className="td-reveal py-8">
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.2em]"
                style={{ color: "var(--gold)" }}
              >
                Your host
              </p>
              <h2
                className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-[1.75rem]"
                style={{ color: "var(--text)" }}
              >
                Meet {organizer.name.split(" ")[0]}
              </h2>

              <div
                className="relative mt-6 overflow-hidden rounded-3xl"
                style={{
                  background:
                    "linear-gradient(145deg, var(--bg-secondary) 0%, #fff 48%, var(--surface-raised) 100%)",
                }}
              >
                {/* Decorative corner wash */}
                <div
                  className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-40"
                  style={{
                    background:
                      "radial-gradient(circle, var(--gold-dim) 0%, transparent 70%)",
                  }}
                />

                <div className="relative grid gap-6 p-6 sm:grid-cols-[auto_1fr] sm:gap-8 sm:p-8">
                  {/* Portrait + verified seal */}
                  <div className="flex flex-col items-center sm:items-start">
                    <div className="relative">
                      <div
                        className="h-28 w-28 overflow-hidden rounded-full sm:h-32 sm:w-32"
                        style={{
                          boxShadow:
                            "0 0 0 4px #fff, 0 18px 40px -20px rgba(42,27,15,0.45)",
                        }}
                      >
                        <Avatar className="h-full w-full">
                          <AvatarImage
                            src={organizer.avatar || DEFAULT_PROFILE_IMAGE}
                            className="object-cover"
                          />
                          <AvatarFallback className="overflow-hidden p-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={DEFAULT_PROFILE_IMAGE}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      {organizer.verified && (
                        <span
                          className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-full ring-2 ring-white"
                          style={{ background: "var(--primary)" }}
                          title="Identity verified"
                        >
                          <Check
                            className="h-4 w-4 text-[#fbf7f1]"
                            strokeWidth={3}
                          />
                        </span>
                      )}
                    </div>
                    {organizer.verified && (
                      <p
                        className="mt-3 text-center text-xs font-medium sm:text-left"
                        style={{ color: "var(--text-tertiary)" }}
                      >
                        Identity verified
                      </p>
                    )}
                  </div>

                  <div className="min-w-0 text-center sm:text-left">
                    <h3
                      className="font-display text-xl font-bold tracking-tight sm:text-2xl"
                      style={{ color: "var(--text)" }}
                    >
                      {organizer.name}
                    </h3>
                    {organizer.location && (
                      <p
                        className="mt-1.5 inline-flex items-center justify-center gap-1.5 text-sm sm:justify-start"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        <MapPin
                          className="h-3.5 w-3.5"
                          style={{ color: "var(--gold)" }}
                        />
                        {organizer.location}
                      </p>
                    )}

                    {/* Trust stats */}
                    {(organizer.rating > 0 ||
                      organizer.tripCount > 0 ||
                      organizer.reviewCount > 0) && (
                      <div
                        className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-y py-3 text-sm sm:justify-start"
                        style={{ borderColor: "var(--border)" }}
                      >
                        {organizer.rating > 0 && (
                          <span
                            className="inline-flex items-center gap-1.5 font-semibold"
                            style={{ color: "var(--text)" }}
                          >
                            <Star
                              className="h-3.5 w-3.5 fill-current"
                              style={{ color: "var(--gold)" }}
                            />
                            {organizer.rating}
                            <span
                              className="font-normal"
                              style={{ color: "var(--text-tertiary)" }}
                            >
                              rating
                            </span>
                          </span>
                        )}
                        {organizer.tripCount > 0 && (
                          <span style={{ color: "var(--text-secondary)" }}>
                            <span
                              className="font-semibold"
                              style={{ color: "var(--text)" }}
                            >
                              {organizer.tripCount}
                            </span>{" "}
                            trips hosted
                          </span>
                        )}
                        {organizer.reviewCount > 0 && (
                          <span style={{ color: "var(--text-secondary)" }}>
                            <span
                              className="font-semibold"
                              style={{ color: "var(--text)" }}
                            >
                              {organizer.reviewCount}
                            </span>{" "}
                            reviews
                          </span>
                        )}
                      </div>
                    )}

                    {organizer.bio && (
                      <blockquote
                        className="mt-4 border-l-2 pl-4 text-left text-[15px] leading-relaxed"
                        style={{
                          borderColor: "var(--gold)",
                          color: "var(--text-secondary)",
                        }}
                      >
                        {organizer.bio}
                      </blockquote>
                    )}

                    {organizer.tripSpecialties &&
                      organizer.tripSpecialties.length > 0 && (
                        <div className="mt-5 flex flex-wrap justify-center gap-2 sm:justify-start">
                          {organizer.tripSpecialties.map((s) => (
                            <span
                              key={s}
                              className="rounded-full px-3 py-1 text-xs font-medium"
                              style={{
                                background: "rgba(255,255,255,0.7)",
                                color: "var(--text-secondary)",
                                border: "1px solid var(--border)",
                              }}
                            >
                              {tripSpecialtyLabel(s)}
                            </span>
                          ))}
                        </div>
                      )}

                    <Link
                      href={organizerHomeHref}
                      className="mt-6 inline-flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-70"
                      style={{ color: "var(--primary)" }}
                    >
                      View all trips by {organizer.name.split(" ")[0]}
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="td-reveal hidden lg:block">
            <div className="sticky top-24">
              <BookingPanel
                trip={trip}
                isFull={isFull}
                onBook={handleBook}
                onSave={handleSave}
                onShare={handleShare}
                wishlisted={wishlisted}
                existingBooking={existingBooking}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky CTA — GetYourGuide / Airbnb pattern */}
      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t px-4 py-3 backdrop-blur-md lg:hidden"
        style={{
          borderColor: "var(--border)",
          background: "rgba(251,247,241,0.94)",
        }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="font-display text-lg font-bold" style={{ color: "var(--text)" }}>
              {formatCurrency(trip.price)}
              <span
                className="text-sm font-normal"
                style={{ color: "var(--text-tertiary)" }}
              >
                {" "}
                / person
              </span>
            </p>
            <p className="truncate text-xs" style={{ color: "var(--text-secondary)" }}>
              {existingCta
                ? existingCta.hint
                : bookable
                  ? formatSpotsLeftLabel(trip)
                  : trip.status === "completed"
                    ? "Trip completed"
                    : "Not bookable"}
            </p>
          </div>
          <Button
            size="lg"
            className="shrink-0 px-6"
            style={{ background: "var(--primary)", color: "#fbf7f1" }}
            onClick={handleBook}
            disabled={!existingCta && !bookable}
          >
            {existingCta
              ? existingCta.label
              : !bookable
                ? trip.status === "completed"
                  ? "Completed"
                  : "Unavailable"
                : isFull
                  ? "Join waitlist"
                  : "Reserve"}
          </Button>
        </div>
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          images={trip.images.length ? trip.images : ["/images/cta-image.jpg"]}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}

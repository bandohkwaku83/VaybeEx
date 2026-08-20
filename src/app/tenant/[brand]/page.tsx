import type { Metadata } from "next";
import Link from "next/link";
import { MediaImage } from "@/components/ui/media-image";
import { ArrowRight, Check, MapPin, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { HistoryBackButton } from "@/components/ui/history-back-button";
import { DEFAULT_PROFILE_IMAGE } from "@/lib/api/media";
import {
  listPublicTripsByBrand,
  organizerFromPublicTrip,
} from "@/lib/api/public-trips";
import { formatSpotsLeftLabel, isTripBookable } from "@/lib/trip-capacity";
import { tripSpecialtyLabel } from "@/lib/trip-specialties";
import {
  getOrganizerByBrand,
  getOrganizerBrandSlug,
  getTripPublicSlug,
  getTripsForBrand,
} from "@/lib/tenant";
import { formatCurrency, formatDateRange } from "@/lib/utils";
import type { Trip } from "@/lib/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ brand: string }>;
}): Promise<Metadata> {
  const { brand } = await params;
  const displayName = brand
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  return {
    title: `${displayName} — Trips on VaybeEx`,
    description: `Browse and book group trips hosted by ${displayName} on VaybeEx. Explore upcoming expeditions across Ghana and West Africa.`,
    openGraph: {
      title: `${displayName} — VaybeEx`,
      description: `Browse and book group trips hosted by ${displayName} on VaybeEx.`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${displayName} — VaybeEx`,
      description: `Browse and book group trips hosted by ${displayName} on VaybeEx.`,
    },
  };
}

export default async function TenantBrandHomePage({
  params,
}: {
  params: Promise<{ brand: string }>;
}) {
  const { brand } = await params;

  const mockOrganizer = getOrganizerByBrand(brand);
  const apiResult = await listPublicTripsByBrand(brand);

  const brandTrips =
    (apiResult.data?.trips?.length ?? 0) > 0
      ? apiResult.data!.trips
      : getTripsForBrand(brand);

  const organizer =
    apiResult.data?.organizer ??
    mockOrganizer ??
    (brandTrips[0]
      ? organizerFromPublicTrip(brandTrips[0], undefined, brand)
      : null);

  const rootHref = `http://${process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000"}`;

  if (!organizer && brandTrips.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 pb-16 pt-28 text-center sm:pt-32">
        <h1
          className="font-display text-2xl font-semibold"
          style={{ color: "var(--text)" }}
        >
          Brand not found
        </h1>
        <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
          No organizer or trips match this brand.
        </p>
        <p className="mt-6 text-sm">
          <Link
            href={rootHref}
            className="font-medium underline-offset-2 hover:underline"
            style={{ color: "var(--primary)" }}
          >
            Browse all trips on VaybeEx
          </Link>
        </p>
      </div>
    );
  }

  const display = organizer ?? {
    name: brand
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" "),
    brandSlug: brand,
    avatar: "/images/cta-image.jpg",
    bio: "",
    verified: false,
    location: "",
    rating: 0,
    reviewCount: 0,
    tripCount: 0,
    tripSpecialties: [] as string[],
  };

  const brandSlug = getOrganizerBrandSlug({
    brandSlug: display.brandSlug ?? brand,
    organizerName: display.name,
  });

  const firstName = display.name.split(" ")[0] || display.name;
  const tripCount =
    "tripCount" in display && display.tripCount > 0
      ? display.tripCount
      : brandTrips.length;

  const liveTrips = brandTrips.filter((t) => isTripBookable(t));
  const completedTrips = brandTrips.filter((t) => !isTripBookable(t));

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <div className="mx-auto max-w-5xl px-4 pb-10 pt-24 sm:px-6 sm:pb-12 sm:pt-28 lg:px-8">
        <HistoryBackButton
          className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-70"
          style={{ color: "var(--text-secondary)" }}
        />

        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
          <div className="relative shrink-0 self-start">
            <div
              className="h-24 w-24 overflow-hidden rounded-full sm:h-28 sm:w-28"
              style={{
                boxShadow:
                  "0 0 0 4px #fff, 0 16px 36px -18px rgba(42,27,15,0.4)",
              }}
            >
              <Avatar className="h-full w-full">
                <AvatarImage
                  src={display.avatar || DEFAULT_PROFILE_IMAGE}
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
            {"verified" in display && display.verified && (
              <span
                className="absolute bottom-0.5 right-0.5 flex h-7 w-7 items-center justify-center rounded-full ring-2 ring-white"
                style={{ background: "var(--primary)" }}
                title="Identity verified"
              >
                <Check
                  className="h-3.5 w-3.5 text-[#fbf7f1]"
                  strokeWidth={3}
                />
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.2em]"
              style={{ color: "var(--gold)" }}
            >
              Trip organizer
            </p>
            <h1
              className="mt-1.5 font-display text-3xl font-bold tracking-tight sm:text-4xl"
              style={{ color: "var(--text)" }}
            >
              {display.name}
            </h1>

            <div
              className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              {display.location ? (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin
                    className="h-3.5 w-3.5"
                    style={{ color: "var(--gold)" }}
                  />
                  {display.location}
                </span>
              ) : null}
              {"verified" in display && display.verified && (
                <>
                  {display.location && (
                    <span style={{ color: "var(--border-strong)" }}>·</span>
                  )}
                  <span className="font-medium">Identity verified</span>
                </>
              )}
              {display.rating > 0 && (
                <>
                  <span style={{ color: "var(--border-strong)" }}>·</span>
                  <span className="inline-flex items-center gap-1 font-medium">
                    <Star
                      className="h-3.5 w-3.5 fill-current"
                      style={{ color: "var(--gold)" }}
                    />
                    {display.rating}
                    {"reviewCount" in display && display.reviewCount > 0
                      ? ` (${display.reviewCount})`
                      : ""}
                  </span>
                </>
              )}
            </div>

            {display.bio ? (
              <p
                className="mt-4 max-w-2xl text-[15px] leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                {display.bio}
              </p>
            ) : null}

            {"tripSpecialties" in display &&
              display.tripSpecialties &&
              display.tripSpecialties.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {display.tripSpecialties.map((s) => (
                    <span
                      key={s}
                      className="rounded-full border px-3 py-1 text-xs font-medium"
                      style={{
                        borderColor: "var(--border)",
                        background: "var(--surface)",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {tripSpecialtyLabel(s)}
                    </span>
                  ))}
                </div>
              )}

            <div
              className="mt-5 flex flex-wrap gap-x-6 gap-y-2 border-t pt-4 text-sm"
              style={{ borderColor: "var(--border)" }}
            >
              <span style={{ color: "var(--text-secondary)" }}>
                <span
                  className="font-semibold"
                  style={{ color: "var(--text)" }}
                >
                  {liveTrips.length}
                </span>{" "}
                live trip{liveTrips.length === 1 ? "" : "s"}
              </span>
              {completedTrips.length > 0 && (
                <span style={{ color: "var(--text-secondary)" }}>
                  <span
                    className="font-semibold"
                    style={{ color: "var(--text)" }}
                  >
                    {completedTrips.length}
                  </span>{" "}
                  completed
                </span>
              )}
              {tripCount > 0 &&
                tripCount !== brandTrips.length && (
                <span style={{ color: "var(--text-secondary)" }}>
                  <span
                    className="font-semibold"
                    style={{ color: "var(--text)" }}
                  >
                    {tripCount}
                  </span>{" "}
                  trips hosted
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 pb-10 sm:px-6 sm:pb-12 lg:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2
              className="font-display text-2xl font-bold tracking-tight"
              style={{ color: "var(--text)" }}
            >
              Trips by {firstName}
            </h2>
            <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
              {liveTrips.length === 0 && completedTrips.length === 0
                ? "No trips listed yet — check back soon."
                : liveTrips.length === 0
                  ? "No live trips right now — past trips are below."
                  : "Book a seat on one of their upcoming experiences."}
            </p>
          </div>
        </div>

        {liveTrips.length === 0 && completedTrips.length === 0 ? (
          <div
            className="rounded-2xl border border-dashed px-6 py-14 text-center"
            style={{ borderColor: "var(--border)" }}
          >
            <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
              Nothing listed right now.
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {liveTrips.length > 0 && (
              <BrandTripGrid
                trips={liveTrips}
                brandSlug={brandSlug}
                completed={false}
              />
            )}

            {completedTrips.length > 0 && (
              <div>
                <h3
                  className="mb-4 font-display text-lg font-semibold tracking-tight"
                  style={{ color: "var(--text)" }}
                >
                  Past trips
                  <span
                    className="ml-2 text-sm font-medium"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    {completedTrips.length}
                  </span>
                </h3>
                <BrandTripGrid
                  trips={completedTrips}
                  brandSlug={brandSlug}
                  completed
                />
              </div>
            )}
          </div>
        )}

        <p className="mt-12 text-center text-sm">
          <Link
            href={rootHref}
            className="inline-flex items-center gap-1.5 font-medium underline-offset-4 hover:underline"
            style={{ color: "var(--text-secondary)" }}
          >
            Browse all trips on VaybeEx
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </p>
      </div>
    </div>
  );
}

function BrandTripGrid({
  trips,
  brandSlug,
  completed,
}: {
  trips: Trip[];
  brandSlug: string;
  completed: boolean;
}) {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {trips.map((trip) => (
        <li key={trip.id}>
          <a
            href={`/${getTripPublicSlug(trip)}`}
            className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0_6px_24px_rgba(42,27,15,0.08)] ring-1 ring-black/[0.05] transition-transform duration-300 hover:-translate-y-0.5"
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <MediaImage
                src={trip.image}
                alt=""
                fill
                className={`object-cover transition-transform duration-500 group-hover:scale-105${
                  completed ? " opacity-90" : ""
                }`}
                sizes="(max-width: 640px) 100vw, 33vw"
              />
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/45 to-transparent" />
              {completed ? (
                <span
                  className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm"
                  style={{ background: "rgba(42,27,15,0.55)" }}
                >
                  Completed
                </span>
              ) : null}
              <span
                className="absolute bottom-3 left-3 rounded-full px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm"
                style={{ background: "rgba(42,27,15,0.45)" }}
              >
                {formatCurrency(trip.price)}
                <span className="font-normal opacity-80"> / person</span>
              </span>
            </div>
            <div className="flex flex-1 flex-col p-4">
              <h3
                className="font-display text-lg font-semibold leading-snug tracking-tight"
                style={{ color: "var(--text)" }}
              >
                {trip.title}
              </h3>
              <p
                className="mt-1.5 flex items-center gap-1.5 text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                <MapPin
                  className="h-3.5 w-3.5 shrink-0"
                  style={{ color: "var(--gold)" }}
                />
                <span className="truncate">{trip.destination}</span>
              </p>
              <p
                className="mt-1 text-xs"
                style={{ color: "var(--text-tertiary)" }}
              >
                {formatDateRange(trip.startDate, trip.endDate)}
              </p>
              <div className="mt-auto flex items-center justify-between gap-2 pt-4">
                <span
                  className="text-xs font-medium"
                  style={{
                    color: completed
                      ? "var(--text-tertiary)"
                      : trip.seatsAvailable === 0
                        ? "var(--coral)"
                        : "var(--text-secondary)",
                  }}
                >
                  {completed ? "Trip completed" : formatSpotsLeftLabel(trip)}
                </span>
                <span
                  className="inline-flex items-center gap-1 text-sm font-semibold"
                  style={{ color: "var(--primary)" }}
                >
                  View
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </div>
          </a>
        </li>
      ))}
    </ul>
  );
}

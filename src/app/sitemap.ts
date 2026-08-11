import type { MetadataRoute } from "next";
import { listPublicTrips } from "@/lib/api/public-trips";
import {
  getRootAbsoluteUrl,
  getTenantBrandHomeUrl,
  getTenantTripUrl,
} from "@/lib/tenant-host";

const STATIC_ROUTES: {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}[] = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/expeditions", changeFrequency: "daily", priority: 0.9 },
  { path: "/organizer", changeFrequency: "weekly", priority: 0.8 },
  { path: "/login", changeFrequency: "monthly", priority: 0.4 },
  { path: "/organizer/login", changeFrequency: "monthly", priority: 0.4 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
];

async function fetchPublicTripsForSitemap() {
  const trips: Awaited<
    ReturnType<typeof listPublicTrips>
  >["data"]["trips"] = [];

  try {
    let page = 1;
    let pages = 1;
    const limit = 100;

    do {
      const response = await listPublicTrips({ page, limit });
      trips.push(...response.data.trips);
      pages = Math.max(1, response.data.pagination.pages || 1);
      page += 1;
    } while (page <= pages && page <= 50);
  } catch {
    // Sitemap should still ship static URLs if the API is unreachable.
  }

  return trips;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: getRootAbsoluteUrl(route.path),
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const trips = await fetchPublicTripsForSitemap();
  const seen = new Set<string>();
  const dynamicEntries: MetadataRoute.Sitemap = [];

  for (const trip of trips) {
    const apexTripUrl = getRootAbsoluteUrl(`/trips/${trip.id}`);
    if (!seen.has(apexTripUrl)) {
      seen.add(apexTripUrl);
      dynamicEntries.push({
        url: apexTripUrl,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }

    if (trip.organizerId) {
      const organizerUrl = getRootAbsoluteUrl(`/organizers/${trip.organizerId}`);
      if (!seen.has(organizerUrl)) {
        seen.add(organizerUrl);
        dynamicEntries.push({
          url: organizerUrl,
          lastModified: now,
          changeFrequency: "weekly",
          priority: 0.6,
        });
      }
    }

    const brandName = trip.organizerBrandSlug || trip.organizerName;
    if (brandName) {
      const brandHome = getTenantBrandHomeUrl(brandName);
      if (!seen.has(brandHome)) {
        seen.add(brandHome);
        dynamicEntries.push({
          url: brandHome,
          lastModified: now,
          changeFrequency: "weekly",
          priority: 0.65,
        });
      }

      const tripSlug = trip.slug || trip.title;
      if (tripSlug) {
        const tenantTripUrl = getTenantTripUrl(brandName, tripSlug);
        if (!seen.has(tenantTripUrl)) {
          seen.add(tenantTripUrl);
          dynamicEntries.push({
            url: tenantTripUrl,
            lastModified: now,
            changeFrequency: "weekly",
            priority: 0.75,
          });
        }
      }
    }
  }

  return [...staticEntries, ...dynamicEntries];
}

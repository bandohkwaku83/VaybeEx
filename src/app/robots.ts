import type { MetadataRoute } from "next";
import { getRootAbsoluteUrl } from "@/lib/tenant-host";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard",
          "/wishlist",
          "/admin-portal",
          "/admin",
          "/organizer/dashboard",
          "/organizer/trips",
          "/organizer/messages",
          "/organizer/payouts",
          "/organizer/withdrawals",
          "/organizer/refunds",
          "/organizer/settings",
          "/organizer/verification",
          "/organizer/onboarding",
          "/organizer/pending",
          "/organizer/verify",
          "/login/verify",
          "/login/complete-profile",
          "/booking",
          "/api/",
        ],
      },
    ],
    sitemap: getRootAbsoluteUrl("/sitemap.xml"),
  };
}

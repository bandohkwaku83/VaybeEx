import type { Metadata } from "next";
import HomeContent from "./home-content";

export const metadata: Metadata = {
  title: "VaybeEx — Discover & Book Group Trips in Ghana & West Africa",
  description:
    "Browse curated group travel experiences across Ghana and West Africa. Find adventures, cultural tours, safari trips, and more — book your next expedition on VaybeEx.",
  openGraph: {
    title: "VaybeEx — Discover & Book Group Trips in Ghana & West Africa",
    description:
      "Browse curated group travel experiences across Ghana and West Africa. Find adventures, cultural tours, safari trips, and more.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "VaybeEx — Discover & Book Group Trips in Ghana & West Africa",
    description:
      "Browse curated group travel experiences across Ghana and West Africa.",
  },
};

export default function HomePage() {
  return <HomeContent />;
}

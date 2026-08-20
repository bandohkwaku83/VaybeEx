import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Organizer Profile",
  description:
    "View this organizer's profile, upcoming trips, reviews, and verification status on VaybeEx.",
  openGraph: {
    title: "Organizer Profile — VaybeEx",
    description:
      "View this organizer's profile, upcoming trips, reviews, and verification status.",
    type: "profile",
  },
  twitter: {
    card: "summary",
    title: "Organizer Profile — VaybeEx",
    description:
      "View this organizer's profile, upcoming trips, and reviews.",
  },
};

export default function OrganizerProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

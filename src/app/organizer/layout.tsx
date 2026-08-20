import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "For Organizers — List & Manage Group Trips",
  description:
    "Join VaybeEx as a trip organizer. List your group experiences, accept bookings, manage attendees, and receive payouts across Ghana and West Africa.",
  openGraph: {
    title: "For Organizers — VaybeEx",
    description:
      "Join VaybeEx as a trip organizer. List your group experiences, accept bookings, and receive payouts.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "For Organizers — VaybeEx",
    description:
      "Join VaybeEx as a trip organizer. List your group experiences and receive payouts.",
  },
};

export default function OrganizerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

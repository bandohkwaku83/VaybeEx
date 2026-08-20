import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Wishlist — Saved Trips",
  description:
    "View and manage your saved trips on VaybeEx. Keep track of the expeditions you want to book.",
  openGraph: {
    title: "My Wishlist — VaybeEx",
    description: "View and manage your saved trips on VaybeEx.",
    type: "website",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function WishlistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

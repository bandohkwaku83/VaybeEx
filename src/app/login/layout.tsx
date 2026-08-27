import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In — VaybeEx",
  description:
    "Sign in or create your VaybeEx traveler account. Book group trips, manage your wishlist, and track your travel plans.",
  openGraph: {
    title: "Sign In — VaybeEx",
    description:
      "Sign in or create your VaybeEx traveler account.",
    type: "website",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

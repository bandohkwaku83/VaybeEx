import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Expeditions — Browse Group Trips",
  description:
    "Browse every live group trip on VaybeEx. Filter by destination, category, and budget to find your next adventure across Ghana and West Africa.",
  openGraph: {
    title: "Expeditions — VaybeEx",
    description:
      "Browse every live group trip on VaybeEx. Filter by destination, category, and budget.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Expeditions — VaybeEx",
    description:
      "Browse every live group trip on VaybeEx.",
  },
};

export default function ExpeditionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Leave a Review",
  description:
    "Share your experience and help other travelers choose the right trip on VaybeEx.",
  openGraph: {
    title: "Leave a Review — VaybeEx",
    description: "Share your experience and help other travelers.",
    type: "website",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function ReviewsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

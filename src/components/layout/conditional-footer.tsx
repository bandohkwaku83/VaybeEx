"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/layout/footer";

/** Hide the marketing footer on organizer portal, admin portal, auth, and onboarding routes. */
export function ConditionalFooter() {
  const pathname = usePathname();
  if (pathname.startsWith("/organizer/")) return null;
  if (pathname.startsWith("/admin-portal")) return null;
  return <Footer />;
}

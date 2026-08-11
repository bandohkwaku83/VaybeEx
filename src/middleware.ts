import { NextRequest, NextResponse } from "next/server";
import {
  getBrandFromHost,
  isPlatformPath,
  isReservedBrand,
} from "@/lib/tenant-host";

/**
 * Tenant host proxy (Next.js 16 "proxy" / legacy middleware).
 *
 * Platform routes (/login, /dashboard, …) must NOT redirect to the apex host:
 * Next relativizes cross-subdomain Location headers (localhost ↔ *.localhost),
 * which caused ERR_TOO_MANY_REDIRECTS. Serve those routes on the tenant host.
 */
export function proxy(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const brand = getBrandFromHost(host);

  if (!brand || isReservedBrand(brand)) {
    return NextResponse.next();
  }

  const { pathname, search } = request.nextUrl;

  // Never rewrite framework / asset / API paths
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/tenant") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Apex app routes: render as-is on the tenant host (no rewrite, no redirect)
  if (isPlatformPath(pathname)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname =
    pathname === "/" ? `/tenant/${brand}` : `/tenant/${brand}${pathname}`;
  url.search = search;

  const response = NextResponse.rewrite(url);
  response.headers.set("x-tenant-brand", brand);
  return response;
}

export const middleware = proxy;

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};

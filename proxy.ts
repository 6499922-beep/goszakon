import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { isTenderHost } from "@/lib/tender-host";

export function proxy(request: NextRequest) {
  const host = request.headers.get("host");

  if (!isTenderHost(host)) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  const isPublicAsset =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/robots.txt") ||
    pathname.startsWith("/sitemap.xml");

  if (isPublicAsset || pathname.startsWith("/tender")) {
    return NextResponse.next();
  }

  const rewrittenUrl = request.nextUrl.clone();
  rewrittenUrl.pathname = pathname === "/" ? "/tender" : `/tender${pathname}`;

  return NextResponse.rewrite(rewrittenUrl);
}

export const config = {
  matcher: ["/:path*"],
};

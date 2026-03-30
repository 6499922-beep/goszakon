import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { isAdminPanelEnabled, isAdminPath } from "@/lib/admin-access";
import { isTenderChatHost, isTenderHost } from "@/lib/tender-host";

export function proxy(request: NextRequest) {
  if (!isAdminPanelEnabled() && isAdminPath(request.nextUrl.pathname)) {
    return new NextResponse("Not Found", {
      status: 404,
      headers: {
        "cache-control": "no-store",
        "content-type": "text/plain; charset=utf-8",
      },
    });
  }

  const host = request.headers.get("host");

  if (!isTenderHost(host)) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  const isPublicAsset =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/docs") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/robots.txt") ||
    pathname.startsWith("/sitemap.xml");

  if (isPublicAsset || pathname.startsWith("/tender")) {
    return NextResponse.next();
  }

  const rewrittenUrl = request.nextUrl.clone();
  if (isTenderChatHost(host)) {
    rewrittenUrl.pathname = pathname === "/" ? "/tender/chat" : `/tender${pathname}`;
    return NextResponse.rewrite(rewrittenUrl);
  }

  rewrittenUrl.pathname = pathname === "/" ? "/tender" : `/tender${pathname}`;

  return NextResponse.rewrite(rewrittenUrl);
}

export const config = {
  matcher: ["/:path*"],
};

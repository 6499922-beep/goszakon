import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME } from "@/lib/admin-auth";

function buildLogoutResponse(request: Request) {
  const response = NextResponse.redirect(new URL("/admin/signin", request.url));

  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });

  return response;
}

export async function GET(request: Request) {
  return NextResponse.redirect(new URL("/admin", request.url));
}

export async function POST(request: Request) {
  return buildLogoutResponse(request);
}

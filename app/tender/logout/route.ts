import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/signin", request.url));

  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: "",
    path: "/",
    expires: new Date(0),
  });

  return response;
}

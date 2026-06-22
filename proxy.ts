import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const { supabaseResponse, user } = await updateSession(request);

  // ── /admin — exige autenticação + email de admin ───────────────────────────
  if (pathname.startsWith("/admin")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
    if (!ADMIN_EMAILS.includes((user.email ?? "").toLowerCase())) {
      // Autenticado mas não é admin — redireciona para o app
      return NextResponse.redirect(new URL("/app", request.url));
    }
    return supabaseResponse;
  }

  // ── /auth — redireciona para /app se já autenticado ───────────────────────
  if (pathname.startsWith("/auth")) {
    if (user) {
      const redirect = searchParams.get("redirect") ?? "/app";
      return NextResponse.redirect(new URL(redirect, request.url));
    }
    return supabaseResponse;
  }

  // ── /app — exige autenticação ─────────────────────────────────────────────
  if (pathname.startsWith("/app")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/auth/:path*",
    "/auth",
    "/app/:path*",
    "/app",
  ],
};

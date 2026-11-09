import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const LOCALES = ["ar", "fr"];
const DEFAULT_LOCALE = "ar";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Ensure a locale prefix: "/dashboard" -> "/ar/dashboard"
  const first = pathname.split("/")[1];
  if (!LOCALES.includes(first)) {
    const url = req.nextUrl.clone();
    url.pathname = `/${DEFAULT_LOCALE}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url);
  }

  const locale = first;
  const rest = pathname.slice(locale.length + 1) || "/";
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  const redirectTo = (path: string) => {
    const url = req.nextUrl.clone();
    url.pathname = `/${locale}${path}`;
    url.search = "";
    return NextResponse.redirect(url);
  };

  // 2. Protect /admin (ADMIN only) and /dashboard (any signed-in user)
  if (rest.startsWith("/admin")) {
    if (!token) return redirectTo("/login");
    if (token.role !== "ADMIN") return redirectTo("/dashboard");
  }
  if (rest.startsWith("/dashboard") && !token) return redirectTo("/login");

  // 3. Signed-in users don't need the login page
  if (rest.startsWith("/login") && token) {
    return redirectTo(token.role === "ADMIN" ? "/admin" : "/dashboard");
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};

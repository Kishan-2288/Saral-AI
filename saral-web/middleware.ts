import { NextResponse, type NextRequest } from "next/server";

/**
 * Locale routing without a framework: English at "/", Hindi at "/hi".
 *  - "/en/x"  -> 308 "/x"            (one canonical URL per page)
 *  - "/hi/..." -> pass through
 *  - anything else -> internal rewrite to "/en/...", so unknown URLs reach the branded 404.
 * /api, /book (patient payment links) and /og are never touched.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/api/") || pathname === "/book" || pathname.startsWith("/book/") || pathname === "/og") {
    return NextResponse.next();
  }
  const m = pathname.match(/^\/(en|hi)(\/.*)?$/);
  if (m) {
    if (m[1] === "en") {
      const url = req.nextUrl.clone();
      url.pathname = m[2] || "/";
      return NextResponse.redirect(url, 308);
    }
    return NextResponse.next();
  }
  const url = req.nextUrl.clone();
  url.pathname = `/en${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = { matcher: ["/((?!_next/|.*\\..*).*)"] };

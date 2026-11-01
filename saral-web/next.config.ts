import type { NextConfig } from "next";

// ONE documented default for the backend (old code disagreed: 8001 in code vs 8000 in .env.example).
const backend = (process.env.BACKEND_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "");
const isDev = process.env.NODE_ENV !== "production";
const plausible = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN ? ["https://plausible.io"] : [];

/**
 * CSP notes: Next.js emits inline bootstrap scripts and we ship a no-flash theme script, so script-src needs
 * 'unsafe-inline' while pages stay statically rendered. Upgrade path (nonces via middleware) is in the README.
 */
function csp(route: "site" | "book"): string {
  const book = route === "book";
  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": ["'self'", "'unsafe-inline'", ...(isDev ? ["'unsafe-eval'"] : []), ...(book ? ["https://checkout.razorpay.com"] : ["https://challenges.cloudflare.com", ...plausible])],
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "data:", "blob:", ...(book ? ["https://*.razorpay.com"] : [])],
    "font-src": ["'self'", "data:"],
    "connect-src": ["'self'", ...(isDev ? ["ws:", "http://127.0.0.1:*"] : []), ...(book ? ["https://api.razorpay.com", "https://lumberjack.razorpay.com", "https://checkout.razorpay.com"] : plausible)],
    "frame-src": book ? ["https://api.razorpay.com", "https://checkout.razorpay.com"] : ["https://challenges.cloudflare.com"],
    "worker-src": ["'self'", "blob:"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
  };
  const body = Object.entries(directives).map(([k, v]) => `${k} ${v.join(" ")}`).join("; ");
  return isDev ? body : `${body}; upgrade-insecure-requests`;
}

const baseHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  // Lets `next dev` and `next start` run side by side from one checkout (QA). Default is the standard .next
  distDir: process.env.NEXT_DIST_DIR || ".next",
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: { optimizePackageImports: ["framer-motion", "@react-three/drei"] },
  async headers() {
    return [
      { source: "/:path*", headers: baseHeaders },
      { source: "/((?!book/).*)", headers: [{ key: "Content-Security-Policy", value: csp("site") }] },
      { source: "/book/:path*", headers: [{ key: "Content-Security-Policy", value: csp("book") }, { key: "X-Robots-Tag", value: "noindex, nofollow" }, { key: "Cache-Control", value: "no-store" }] },
    ];
  },
  // Same-origin proxy used by /book/[token] (booking link, create-order, verify). BACKEND_URL is read at BUILD time here.
  async rewrites() {
    return [{ source: "/api/v1/:path*", destination: `${backend}/api/v1/:path*` }];
  },
};

export default nextConfig;

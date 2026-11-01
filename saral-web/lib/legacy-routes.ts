/**
 * The old site was a hash-routed SPA (#/services …). Hash fragments never reach the server, so these
 * cannot be 301s; <LegacyHashRedirect/> maps them on the client instead.
 */
export const LEGACY_HASH_ROUTES: Record<string, string> = {
  "": "/",
  home: "/",
  services: "/features",
  solutions: "/solutions/clinics",
  "saral-booking": "/demo",
  "case-studies": "/about",
  about: "/about",
  contact: "/demo",
  "book-demo": "/demo",
};

/** Returns the new path for a legacy hash like "#/services", or null if it is not a legacy route. */
export function mapLegacyHash(hash: string): string | null {
  if (!hash.startsWith("#/")) return null;
  const key = hash.slice(2).replace(/\/+$/, "").toLowerCase();
  return key in LEGACY_HASH_ROUTES ? LEGACY_HASH_ROUTES[key] : null;
}

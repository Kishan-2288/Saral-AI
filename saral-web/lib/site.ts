import { locales, localePath, type Locale } from "./i18n";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.saral.me").replace(/\/$/, "");

/** Indexable routes (without locale prefix). */
export const ROUTES = [
  "/", "/features", "/how-it-works", "/solutions/clinics", "/solutions/hospitals",
  "/security", "/pricing", "/demo", "/about", "/privacy", "/terms", "/cookies",
] as const;
export type RoutePath = (typeof ROUTES)[number];

export function absoluteUrl(locale: Locale, path: string): string {
  return `${SITE_URL}${localePath(locale, path)}`;
}

export function languageAlternates(path: string): Record<string, string> {
  const map: Record<string, string> = {};
  for (const l of locales) map[l] = absoluteUrl(l, path);
  map["x-default"] = absoluteUrl("en", path);
  return map;
}

import { en } from "@/content/en";
import { hi } from "@/content/hi";
import type { Dictionary } from "@/content/types";

export const locales = ["en", "hi"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export const isLocale = (value: string): value is Locale => (locales as readonly string[]).includes(value);

export function getDictionary(locale: Locale): Dictionary {
  return locale === "hi" ? hi : en;
}

/** English lives at "/", Hindi at "/hi". */
export function localePath(locale: Locale, path = "/"): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  if (locale === defaultLocale) return p;
  return p === "/" ? `/${locale}` : `/${locale}${p}`;
}

/** Strip a leading locale segment from a browser-visible pathname. */
export function stripLocale(pathname: string): { locale: Locale; path: string } {
  const m = pathname.match(/^\/(en|hi)(\/.*)?$/);
  if (m) return { locale: m[1] as Locale, path: m[2] || "/" };
  return { locale: defaultLocale, path: pathname || "/" };
}

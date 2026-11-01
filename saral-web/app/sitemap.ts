import type { MetadataRoute } from "next";
import { ROUTES, absoluteUrl, languageAlternates } from "@/lib/site";
import { locales } from "@/lib/i18n";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return ROUTES.flatMap((path) =>
    locales.map((locale) => ({
      url: absoluteUrl(locale, path),
      lastModified: now,
      changeFrequency: path === "/" ? ("weekly" as const) : ("monthly" as const),
      priority: path === "/" ? 1 : path === "/demo" ? 0.9 : 0.7,
      alternates: { languages: languageAlternates(path) },
    })),
  );
}

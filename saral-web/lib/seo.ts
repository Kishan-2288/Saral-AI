import type { Metadata } from "next";
import { getDictionary, type Locale } from "./i18n";
import { SITE_URL, absoluteUrl, languageAlternates } from "./site";
import { SOCIALS } from "./contact";
import type { PageKey } from "@/content/types";

export function pageMetadata(locale: Locale, key: PageKey, path: string, opts?: { noindex?: boolean }): Metadata {
  const t = getDictionary(locale).meta[key];
  const url = absoluteUrl(locale, path);
  const og = `${SITE_URL}/og`;
  return {
    title: key === "home" ? { absolute: t.title } : t.title,
    description: t.description,
    alternates: { canonical: url, languages: languageAlternates(path) },
    robots: opts?.noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      type: "website", url, title: t.title, description: t.description, siteName: "Saral AI",
      locale: locale === "hi" ? "hi_IN" : "en_IN", alternateLocale: locale === "hi" ? ["en_IN"] : ["hi_IN"],
      images: [{ url: og, width: 1200, height: 630, alt: "Saral AI: WhatsApp AI appointment assistant" }],
    },
    twitter: { card: "summary_large_image", title: t.title, description: t.description, images: [og] },
  };
}

export function organizationLd() {
  return {
    "@context": "https://schema.org", "@type": "Organization", name: "Saral AI", url: SITE_URL,
    logo: `${SITE_URL}/brand/saral-logo-light.svg`,
    ...(SOCIALS.length ? { sameAs: SOCIALS.map((s) => s.url) } : {}),
  };
}

export function websiteLd(locale: Locale) {
  return { "@context": "https://schema.org", "@type": "WebSite", name: "Saral AI", url: SITE_URL, inLanguage: locale === "hi" ? "hi-IN" : "en-IN" };
}

/** No offers / ratings: nothing is claimed that the site can't back up. */
export function softwareLd(locale: Locale) {
  const t = getDictionary(locale);
  return {
    "@context": "https://schema.org", "@type": "SoftwareApplication", name: "Saral AI",
    applicationCategory: "BusinessApplication", operatingSystem: "WhatsApp",
    description: t.meta.home.description, url: absoluteUrl(locale, "/"), inLanguage: locale === "hi" ? "hi-IN" : "en-IN",
  };
}

export function faqLd(locale: Locale) {
  const t = getDictionary(locale);
  return {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: t.faq.items.map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } })),
  };
}

export function breadcrumbLd(locale: Locale, crumbs: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: absoluteUrl(locale, c.path) })),
  };
}

import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n";
import { resolveLocale } from "@/lib/page-helpers";
import { breadcrumbLd, pageMetadata } from "@/lib/seo";
import JsonLd from "@/components/ui/JsonLd";
import Features from "@/components/sections/Features";
import PageCta from "@/components/sections/PageCta";

type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> { return pageMetadata(await resolveLocale(params), "features", "/features"); }

export default async function Page({ params }: Props) {
  const locale = await resolveLocale(params);
  const t = getDictionary(locale);
  const f = { ...t.features, title: t.pages.features.title, lead: t.pages.features.lead };
  return (
    <>
      <JsonLd data={breadcrumbLd(locale, [{ name: t.siteName, path: "/" }, { name: t.nav.features, path: "/features" }])} />
      <div className="pt-16"><Features t={f} heading="h1" detailed /></div>
      <PageCta locale={locale} t={t} />
    </>
  );
}

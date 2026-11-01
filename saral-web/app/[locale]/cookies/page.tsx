import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n";
import { resolveLocale } from "@/lib/page-helpers";
import { pageMetadata } from "@/lib/seo";
import { cookies } from "@/content/legal";
import LegalPage from "@/components/sections/LegalPage";

type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> { return pageMetadata(await resolveLocale(params), "cookies", "/cookies"); }

export default async function Page({ params }: Props) {
  const locale = await resolveLocale(params);
  const t = getDictionary(locale);
  return <LegalPage title={t.meta.cookies.title} sections={cookies} notice={t.pages.legalNotice} />;
}

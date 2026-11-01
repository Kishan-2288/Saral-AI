import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n";
import { resolveLocale } from "@/lib/page-helpers";
import { breadcrumbLd, pageMetadata } from "@/lib/seo";
import JsonLd from "@/components/ui/JsonLd";
import HowItWorks from "@/components/sections/HowItWorks";
import PageCta from "@/components/sections/PageCta";
import { Icon } from "@/components/ui/Icons";

type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> { return pageMetadata(await resolveLocale(params), "howItWorks", "/how-it-works"); }

export default async function Page({ params }: Props) {
  const locale = await resolveLocale(params);
  const t = getDictionary(locale);
  const p = t.pages.howItWorks;
  return (
    <>
      <JsonLd data={breadcrumbLd(locale, [{ name: t.siteName, path: "/" }, { name: t.nav.howItWorks, path: "/how-it-works" }])} />
      <div className="pt-16"><HowItWorks t={{ ...t.how, title: p.title, lead: p.lead }} heading="h1" /></div>
      <section className="section-sm pt-0">
        <div className="container-x md:grid md:grid-cols-12">
          <div className="md:col-span-7">
            <h2 className="h2">{p.safetyTitle}</h2>
            <ul className="m-0 mt-8 flex list-none flex-col gap-4 p-0">
              {p.safetyItems.map((x) => (<li key={x} className="flex items-start gap-3"><span className="mt-0.5 text-[var(--primary)]"><Icon name="shield" size={20} /></span><span>{x}</span></li>))}
            </ul>
          </div>
        </div>
      </section>
      <PageCta locale={locale} t={t} />
    </>
  );
}

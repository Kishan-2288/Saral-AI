import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n";
import { resolveLocale } from "@/lib/page-helpers";
import { breadcrumbLd, pageMetadata } from "@/lib/seo";
import { PRICING } from "@/lib/pricing.config";
import JsonLd from "@/components/ui/JsonLd";
import PageHero from "@/components/ui/PageHero";
import PageCta from "@/components/sections/PageCta";

type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> { return pageMetadata(await resolveLocale(params), "pricing", "/pricing"); }

export default async function Page({ params }: Props) {
  const locale = await resolveLocale(params);
  const t = getDictionary(locale);
  const p = t.pages.pricing;
  return (
    <>
      <JsonLd data={breadcrumbLd(locale, [{ name: t.siteName, path: "/" }, { name: t.nav.pricing, path: "/pricing" }])} />
      <PageHero title={p.title} lead={p.lead} />
      <section className="section-sm pt-0">
        <div className="container-x">
          <p className="lead m-0">{p.body}</p>
          {/* Prices stay hidden ("Talk to us"). To enable, see lib/pricing.config.ts. */}
          {PRICING.show && PRICING.plans && (
            <ul className="m-0 mt-10 grid list-none gap-6 p-0 md:grid-cols-2">
              {PRICING.plans.map((pl) => (
                <li key={pl.id} className="card p-7">
                  <h2 className="h3">{pl.label}</h2>
                  <p className="m-0 mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold">{pl.approx ? "~" : ""}₹{pl.amountInr.toLocaleString("en-IN")}</p>
                  <p className="muted mt-1 mb-0">{pl.note}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
      <PageCta locale={locale} t={t} text={t.cta.talk} />
    </>
  );
}

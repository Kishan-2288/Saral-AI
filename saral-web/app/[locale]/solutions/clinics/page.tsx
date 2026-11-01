import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n";
import { resolveLocale } from "@/lib/page-helpers";
import { breadcrumbLd, pageMetadata } from "@/lib/seo";
import JsonLd from "@/components/ui/JsonLd";
import PageHero from "@/components/ui/PageHero";
import PageCta from "@/components/sections/PageCta";
import { Icon } from "@/components/ui/Icons";

type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> { return pageMetadata(await resolveLocale(params), "clinics", "/solutions/clinics"); }

export default async function Page({ params }: Props) {
  const locale = await resolveLocale(params);
  const t = getDictionary(locale);
  const p = t.pages.clinics;
  return (
    <>
      <JsonLd data={breadcrumbLd(locale, [{ name: t.siteName, path: "/" }, { name: t.nav.clinics, path: "/solutions/clinics" }])} />
      <PageHero title={p.title} lead={p.lead} />
      <section className="section-sm pt-0">
        <div className="container-x">
          <ul className="m-0 grid list-none gap-6 p-0 md:grid-cols-3">
            {p.points.map((pt) => (
              <li key={pt.title} className="card p-7">
                <span className="text-[var(--primary)]"><Icon name="checkCircle" /></span>
                <h2 className="h3 mt-4">{pt.title}</h2>
                <p className="muted mt-2 mb-0">{pt.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <PageCta locale={locale} t={t} text={p.closing} />
    </>
  );
}

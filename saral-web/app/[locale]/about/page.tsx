import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n";
import { resolveLocale } from "@/lib/page-helpers";
import { breadcrumbLd, pageMetadata } from "@/lib/seo";
import JsonLd from "@/components/ui/JsonLd";
import PageHero from "@/components/ui/PageHero";
import PageCta from "@/components/sections/PageCta";

type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> { return pageMetadata(await resolveLocale(params), "about", "/about"); }

// TODO(owner): add team / story content when it can be verified. Nothing is invented here.
export default async function Page({ params }: Props) {
  const locale = await resolveLocale(params);
  const t = getDictionary(locale);
  const p = t.pages.about;
  return (
    <>
      <JsonLd data={breadcrumbLd(locale, [{ name: t.siteName, path: "/" }, { name: t.nav.about, path: "/about" }])} />
      <PageHero title={p.title} lead={p.lead} />
      <section className="section-sm pt-0">
        <div className="container-x">
          <ul className="m-0 grid list-none gap-6 p-0 md:grid-cols-2">
            {p.blocks.map((b) => (<li key={b.title} className="card p-8"><h2 className="h3">{b.title}</h2><p className="muted mt-3 mb-0">{b.text}</p></li>))}
          </ul>
        </div>
      </section>
      <PageCta locale={locale} t={t} />
    </>
  );
}

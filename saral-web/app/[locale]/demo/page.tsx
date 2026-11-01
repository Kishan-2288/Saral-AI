import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n";
import { resolveLocale } from "@/lib/page-helpers";
import { breadcrumbLd, pageMetadata } from "@/lib/seo";
import JsonLd from "@/components/ui/JsonLd";
import PageHero from "@/components/ui/PageHero";
import DemoForm from "@/components/forms/DemoForm";
import Button from "@/components/ui/Button";
import { whatsappLink } from "@/lib/contact";

type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> { return pageMetadata(await resolveLocale(params), "demo", "/demo"); }

export default async function Page({ params }: Props) {
  const locale = await resolveLocale(params);
  const t = getDictionary(locale);
  const p = t.pages.demo;
  return (
    <>
      <JsonLd data={breadcrumbLd(locale, [{ name: t.siteName, path: "/" }, { name: t.nav.demo, path: "/demo" }])} />
      <PageHero title={p.title} lead={p.lead} />
      <section className="section-sm pt-0">
        <div className="container-x grid gap-12 md:grid-cols-12">
          <div className="md:col-span-7"><DemoForm t={t.form} /></div>
          <aside className="md:col-span-5">
            <ol className="m-0 flex list-none flex-col gap-5 p-0">
              {p.whatNext.map((x, i) => (
                <li key={x} className="flex items-start gap-4">
                  <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--primary)] font-[family-name:var(--font-display)] text-sm font-semibold text-[var(--primary-ink)]">{i + 1}</span>
                  <span className="pt-1">{x}</span>
                </li>
              ))}
            </ol>
            <p className="muted mt-10 mb-4">{t.form.or}</p>
            <Button href={whatsappLink(locale)} external variant="secondary" icon="message" track="cta_whatsapp_click" opensNewTab={t.ui.opensNewTab}>{t.cta.whatsapp}</Button>
          </aside>
        </div>
      </section>
    </>
  );
}

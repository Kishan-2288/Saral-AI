import Button from "@/components/ui/Button";
import { localePath, type Locale } from "@/lib/i18n";
import { whatsappLink } from "@/lib/contact";
import type { Dictionary } from "@/content/types";

export default function PageCta({ locale, t, text }: { locale: Locale; t: Dictionary; text?: string }) {
  return (
    <section className="section-sm" aria-label={t.cta.demo}>
      <div className="container-x">
        <div className="card flex flex-col items-start gap-6 p-8 md:flex-row md:items-center md:justify-between md:p-12">
          <p className="h3 m-0 max-w-md">{text ?? t.finalCta.title}</p>
          <div className="flex flex-wrap gap-4">
            <Button href={localePath(locale, "/demo")} track="cta_demo_click">{t.cta.demo}</Button>
            <Button href={whatsappLink(locale)} external variant="secondary" icon="message" track="cta_whatsapp_click" opensNewTab={t.ui.opensNewTab}>{t.cta.whatsapp}</Button>
          </div>
        </div>
      </div>
    </section>
  );
}

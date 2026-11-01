import Section from "./Section";
import Button from "@/components/ui/Button";
import { localePath, type Locale } from "@/lib/i18n";
import { whatsappLink } from "@/lib/contact";
import type { Dictionary } from "@/content/types";

export default function FinalCta({ locale, t }: { locale: Locale; t: Dictionary }) {
  return (
    <Section id="cta" className="min-h-[90svh] !flex items-center">
      <div className="container-x w-full">
        <div className="max-w-xl max-md:rounded-3xl max-md:bg-[color-mix(in_srgb,var(--bg)_84%,transparent)] max-md:p-6">
          <h2 id="cta-title" className="display" data-reveal>{t.finalCta.title}</h2>
          <p className="lead mt-6" data-reveal>{t.finalCta.lead}</p>
          <div className="mt-10 flex flex-wrap gap-4" data-reveal>
            <Button href={localePath(locale, "/demo")} track="cta_demo_click">{t.cta.demo}</Button>
            <Button href={whatsappLink(locale)} external variant="secondary" icon="message" track="cta_whatsapp_click" opensNewTab={t.ui.opensNewTab}>{t.cta.whatsapp}</Button>
          </div>
        </div>
      </div>
    </Section>
  );
}

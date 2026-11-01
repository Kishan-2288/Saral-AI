import Section from "./Section";
import Accordion from "@/components/ui/Accordion";
import type { Dictionary } from "@/content/types";

export default function Faq({ t }: { t: Dictionary["faq"] }) {
  return (
    <Section id="faq">
      <div className="container-x grid gap-12 md:grid-cols-12">
        <div className="md:col-span-4">
          <h2 id="faq-title" className="h2" data-reveal>{t.title}</h2>
          <p className="lead mt-6" data-reveal>{t.lead}</p>
        </div>
        <div className="md:col-span-8" data-reveal><Accordion items={t.items} /></div>
      </div>
    </Section>
  );
}

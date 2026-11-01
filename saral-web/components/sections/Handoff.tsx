import Section from "./Section";
import { Icon } from "@/components/ui/Icons";
import type { Dictionary } from "@/content/types";

export default function Handoff({ t }: { t: Dictionary["handoff"] }) {
  return (
    <Section id="handoff" tall>
      <div className="container-x grid md:grid-cols-12">
        <div className="sticky top-[22vh] md:col-span-5">
          <h2 id="handoff-title" className="h2" data-reveal>{t.title}</h2>
          <p className="lead mt-6" data-reveal>{t.lead}</p>
          <h3 className="h3 mt-10" data-reveal>{t.triggersTitle}</h3>
          <ul className="m-0 mt-4 flex list-none flex-col gap-3 p-0" data-reveal>
            {t.triggers.map((x) => (
              <li key={x} className="flex items-start gap-3"><span className="mt-0.5 text-[var(--primary)]"><Icon name="check" size={20} /></span><span>{x}</span></li>
            ))}
          </ul>
          <p className="mt-8 flex items-center gap-3 text-sm muted">
            <span className="rounded-full bg-[var(--primary-soft)] px-3 py-1 font-semibold text-[var(--primary-ink)]">{t.from}</span>
            <Icon name="swap" size={16} />
            <span className="rounded-full bg-[var(--handoff-soft)] px-3 py-1 font-semibold text-[var(--handoff-text)]">{t.to}</span>
          </p>
        </div>
      </div>
    </Section>
  );
}

import Section from "./Section";
import { Icon, type IconName } from "@/components/ui/Icons";
import type { Dictionary } from "@/content/types";

const ICONS: IconName[] = ["message", "spark", "calendar", "checkCircle"];

export default function HowItWorks({ t, heading = "h2" }: { t: Dictionary["how"]; heading?: "h1" | "h2" }) {
  const H = heading;
  return (
    <Section id="how">
      <div className="container-x grid gap-12 md:grid-cols-12">
        <div className="md:col-span-6">
          <H id="how-title" className="h2" data-reveal>{t.title}</H>
          <p className="lead mt-6" data-reveal>{t.lead}</p>
          <ol data-steps className="m-0 mt-12 list-none p-0">
            {t.steps.map((s, i) => (
              <li key={s.title} data-step className="step flex items-center py-6 max-md:rounded-2xl max-md:bg-[color-mix(in_srgb,var(--bg)_82%,transparent)] max-md:px-4">
                <div className="flex gap-5">
                  <span aria-hidden="true" className="step-num flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-[family-name:var(--font-display)] font-semibold">{i + 1}</span>
                  <div>
                    <h3 className="h3 flex items-center gap-3">{s.title}<span className="text-[var(--primary)]"><Icon name={ICONS[i]} size={20} /></span></h3>
                    <p className="muted mt-2 max-w-md">{s.text}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </Section>
  );
}

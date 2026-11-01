import Section from "./Section";
import { Icon, type IconName } from "@/components/ui/Icons";
import type { Dictionary } from "@/content/types";

const ICONS: Record<string, IconName> = { booking: "calendar", upcoming: "list", reschedule: "swap", support: "help", voice: "mic", reminders: "bell" };

export default function Features({ t, heading = "h2", detailed = false }: { t: Dictionary["features"]; heading?: "h1" | "h2"; detailed?: boolean }) {
  const H = heading;
  return (
    <Section id="features">
      <div className="container-x">
        <div className="md:ml-[calc(41.666%+1rem)]">
          <H id="features-title" className="h2 max-w-xl" data-reveal>{t.title}</H>
          <p className="lead mt-6" data-reveal>{t.lead}</p>
          <ul className="m-0 mt-12 flex list-none flex-col gap-10 p-0">
            {t.items.map((f) => (
              <li key={f.id} className="flex gap-5 max-md:rounded-2xl max-md:bg-[color-mix(in_srgb,var(--bg)_84%,transparent)] max-md:p-4" data-reveal>
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)]"><Icon name={ICONS[f.id] ?? "check"} /></span>
                <div className="min-w-0">
                  <h3 className="h3">{f.title}</h3>
                  <p className="muted mt-2 max-w-lg">{detailed ? f.detail : f.text}</p>
                  <figure className="m-0 mt-4 max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm">
                    <figcaption className="muted mb-1 font-semibold">{f.example.label}</figcaption>
                    <blockquote className="m-0">{f.example.text}</blockquote>
                    <p className="m-0 mt-3 text-[var(--primary)]"><span className="font-semibold">{t.resultLabel}: </span>{f.example.result}</p>
                  </figure>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}

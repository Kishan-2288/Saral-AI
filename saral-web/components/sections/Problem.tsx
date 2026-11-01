import Section from "./Section";
import type { Dictionary } from "@/content/types";

export default function Problem({ t }: { t: Dictionary["problem"] }) {
  return (
    <Section id="problem">
      <div className="container-x grid gap-12 md:grid-cols-12">
        <div className="md:col-span-6">
          <h2 id="problem-title" className="h2" data-reveal>{t.title}</h2>
          <p className="lead mt-6" data-reveal>{t.lead}</p>
          <ul className="m-0 mt-12 list-none divide-y divide-[var(--border)] border-y border-[var(--border)] p-0 max-md:rounded-2xl max-md:bg-[color-mix(in_srgb,var(--bg)_82%,transparent)]">
            {t.items.map((it) => (
              <li key={it.title} className="flex flex-col gap-1 py-5 md:flex-row md:items-baseline md:gap-8" data-reveal>
                <h3 className="h3 md:w-56 md:shrink-0">{it.title}</h3>
                <p className="muted m-0">{it.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}

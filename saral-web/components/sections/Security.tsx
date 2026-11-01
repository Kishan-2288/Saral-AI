import Section from "./Section";
import { Icon, type IconName } from "@/components/ui/Icons";
import type { Dictionary } from "@/content/types";

const ICONS: IconName[] = ["building", "key", "link", "log"];

export default function Security({ t, heading = "h2" }: { t: Dictionary["security"]; heading?: "h1" | "h2" }) {
  const H = heading;
  return (
    <Section id="security" tall>
      <div className="container-x grid md:grid-cols-12">
        <div className="md:col-span-6 md:col-start-7">
          <div className="sticky top-[16vh]">
            <H id="security-title" className="h2" data-reveal>{t.title}</H>
            <p className="lead mt-6" data-reveal>{t.lead}</p>
            <ul className="m-0 mt-10 grid list-none gap-8 p-0 sm:grid-cols-2">
              {t.items.map((it, i) => (
                <li key={it.title} data-reveal className="max-md:rounded-2xl max-md:bg-[color-mix(in_srgb,var(--bg)_84%,transparent)] max-md:p-4">
                  <span className="text-[var(--primary)]"><Icon name={ICONS[i]} /></span>
                  <h3 className="h3 mt-3">{it.title}</h3>
                  <p className="muted mt-2">{it.text}</p>
                </li>
              ))}
            </ul>
            <div className="mt-10 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5" data-reveal>
              <h3 className="h3 flex items-center gap-2"><span className="text-[var(--primary)]"><Icon name="shield" size={20} /></span>{t.siteTitle}</h3>
              <p className="muted mt-2 mb-0">{t.siteText}</p>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

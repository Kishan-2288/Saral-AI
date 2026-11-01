import Link from "next/link";
import Section from "./Section";
import { Icon, type IconName } from "@/components/ui/Icons";
import { localePath, type Locale } from "@/lib/i18n";
import type { Dictionary } from "@/content/types";

const ICONS: IconName[] = ["person", "building", "users", "list"];
const LINKS = ["/solutions/clinics", "/solutions/hospitals", "/solutions/hospitals", "/solutions/hospitals"];

export default function UseCases({ locale, t }: { locale: Locale; t: Dictionary["useCases"] }) {
  return (
    <Section id="use-cases">
      <div className="container-x">
        <h2 id="use-cases-title" className="h2 max-w-2xl" data-reveal>{t.title}</h2>
        <p className="lead mt-6" data-reveal>{t.lead}</p>
        <ul className="hscroll m-0 mt-12 list-none p-0 pb-4" data-lenis-prevent data-reveal>
          {t.items.map((it, i) => (
            <li key={it.title} className="card flex flex-col p-7">
              <span className="text-[var(--primary)]"><Icon name={ICONS[i]} size={28} /></span>
              <h3 className="h3 mt-6">{it.title}</h3>
              <p className="muted mt-2 flex-1">{it.text}</p>
              <Link href={localePath(locale, LINKS[i])} className="mt-6 font-semibold text-[var(--primary)] underline-offset-4 hover:underline" >{t.more}: {it.title}</Link>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

import Link from "next/link";
import Logo from "./Logo";
import MotionToggle from "./MotionToggle";
import { Icon } from "./Icons";
import { localePath, type Locale } from "@/lib/i18n";
import { SOCIALS, SUPPORT_EMAIL, whatsappLink } from "@/lib/contact";
import type { Dictionary } from "@/content/types";

export default function Footer({ locale, t }: { locale: Locale; t: Dictionary }) {
  const L = (p: string) => localePath(locale, p);
  const col = (title: string, links: { href: string; label: string }[]) => (
    <div>
      <h2 className="!font-[family-name:var(--font-display)] !text-sm !font-semibold">{title}</h2>
      <ul className="m-0 mt-4 flex list-none flex-col gap-3 p-0 text-[0.95rem]">
        {links.map((l) => (<li key={l.href}><Link href={l.href} className="muted transition-colors hover:text-[var(--text)]">{l.label}</Link></li>))}
      </ul>
    </div>
  );
  return (
    <footer className="relative z-[1] border-t border-[var(--border)] bg-[var(--bg)]">
      <div className="container-x grid gap-12 py-16 md:grid-cols-[1.4fr_repeat(4,1fr)]">
        <div>
          <Logo locale={locale} label={t.nav.home} />
          <p className="muted mt-4 max-w-xs text-[0.95rem]">{t.footer.tagline}</p>
        </div>
        {col(t.footer.product, [
          { href: L("/features"), label: t.nav.features }, { href: L("/how-it-works"), label: t.nav.howItWorks },
          { href: L("/security"), label: t.nav.security }, { href: L("/pricing"), label: t.nav.pricing },
        ])}
        {col(t.footer.solutions, [{ href: L("/solutions/clinics"), label: t.nav.clinics }, { href: L("/solutions/hospitals"), label: t.nav.hospitals }])}
        {col(t.footer.company, [{ href: L("/about"), label: t.nav.about }, { href: L("/demo"), label: t.nav.demo }])}
        <div>
          <h2 className="!font-[family-name:var(--font-display)] !text-sm !font-semibold">{t.footer.contact}</h2>
          <ul className="m-0 mt-4 flex list-none flex-col gap-3 p-0 text-[0.95rem]">
            {/* TODO(owner): set NEXT_PUBLIC_SUPPORT_EMAIL and NEXT_PUBLIC_WHATSAPP_NUMBER; empty email is not rendered. */}
            {SUPPORT_EMAIL && <li><a className="muted inline-flex items-center gap-2 hover:text-[var(--text)]" href={`mailto:${SUPPORT_EMAIL}`}><Icon name="mail" size={16} />{SUPPORT_EMAIL}</a></li>}
            <li><a className="muted inline-flex items-center gap-2 hover:text-[var(--text)]" href={whatsappLink(locale)} target="_blank" rel="noopener noreferrer" data-track="cta_whatsapp_click"><Icon name="message" size={16} />{t.cta.whatsapp}<span className="sr-only"> {t.ui.opensNewTab}</span></a></li>
            {SOCIALS.map((s) => (<li key={s.id}><a className="muted hover:text-[var(--text)]" href={s.url} target="_blank" rel="noopener noreferrer">{s.label}<span className="sr-only"> {t.ui.opensNewTab}</span></a></li>))}
          </ul>
        </div>
      </div>
      <div className="container-x flex flex-wrap items-center justify-between gap-4 border-t border-[var(--border)] py-6 text-sm">
        <p className="muted m-0">© {new Date().getFullYear()} {t.siteName}. {t.footer.rights}</p>
        <nav aria-label={t.nav.legalNav}>
          <ul className="m-0 flex list-none flex-wrap gap-6 p-0">
            <li><Link className="muted hover:text-[var(--text)]" href={L("/privacy")}>{t.footer.privacy}</Link></li>
            <li><Link className="muted hover:text-[var(--text)]" href={L("/terms")}>{t.footer.terms}</Link></li>
            <li><Link className="muted hover:text-[var(--text)]" href={L("/cookies")}>{t.footer.cookies}</Link></li>
          </ul>
        </nav>
        <MotionToggle t={t.ui.motion} />
      </div>
    </footer>
  );
}

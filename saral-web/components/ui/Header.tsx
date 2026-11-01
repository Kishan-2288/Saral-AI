import Link from "next/link";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";
import LanguageSwitch from "./LanguageSwitch";
import MobileMenu from "./MobileMenu";
import { localePath, type Locale } from "@/lib/i18n";
import type { Dictionary } from "@/content/types";

export default function Header({ locale, t }: { locale: Locale; t: Dictionary }) {
  const items = [
    { href: localePath(locale, "/features"), label: t.nav.features },
    { href: localePath(locale, "/how-it-works"), label: t.nav.howItWorks },
    { href: localePath(locale, "/security"), label: t.nav.security },
    { href: localePath(locale, "/pricing"), label: t.nav.pricing },
    { href: localePath(locale, "/about"), label: t.nav.about },
  ];
  const demo = { href: localePath(locale, "/demo"), label: t.nav.demo };
  return (
    <header className="frosted fixed inset-x-0 top-0 z-50 border-b border-[var(--border)]">
      <div className="container-x flex h-16 items-center justify-between gap-4">
        <Logo locale={locale} label={t.nav.home} />
        <nav aria-label={t.nav.primary} className="hidden md:block">
          <ul className="m-0 flex list-none items-center gap-7 p-0 text-[0.95rem]">
            {items.map((it) => (
              <li key={it.href}><Link href={it.href} className="muted transition-colors hover:text-[var(--text)]">{it.label}</Link></li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-3 md:flex">
            <LanguageSwitch locale={locale} t={t.ui.language} />
            <ThemeToggle t={t.ui.theme} />
          </div>
          <Link href={demo.href} className="btn btn-primary !min-h-10 !px-5 max-sm:hidden" data-track="cta_demo_click">{demo.label}</Link>
          <MobileMenu items={items} cta={demo} labels={{ open: t.nav.menu, close: t.nav.closeMenu, nav: t.nav.primary }}>
            <LanguageSwitch locale={locale} t={t.ui.language} />
            <ThemeToggle t={t.ui.theme} />
          </MobileMenu>
        </div>
      </div>
      <div aria-hidden="true" className="absolute inset-x-0 bottom-[-1px] h-[2px] overflow-hidden">
        <span className="block h-full origin-left bg-[var(--primary)]" style={{ transform: "scaleX(var(--scroll-progress, 0))" }} />
      </div>
    </header>
  );
}

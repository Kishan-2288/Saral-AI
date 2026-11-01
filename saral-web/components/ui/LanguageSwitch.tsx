"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { localePath, stripLocale, type Locale } from "@/lib/i18n";
import type { Dictionary } from "@/content/types";

export default function LanguageSwitch({ locale, t }: { locale: Locale; t: Dictionary["ui"]["language"] }) {
  const pathname = usePathname() ?? "/";
  const { path } = stripLocale(pathname);
  const items: { l: Locale; short: string; name: string }[] = [
    { l: "en", short: "EN", name: t.en },
    { l: "hi", short: "हिं", name: t.hi },
  ];
  return (
    <nav aria-label={t.label} className="tt-group">
      {items.map(({ l, short, name }) => (
        <Link key={l} href={localePath(l, path)} hrefLang={l} lang={l} prefetch={false}
          className="tt tt-text" data-active={l === locale} aria-current={l === locale ? "true" : undefined} title={name}>
          <span aria-hidden="true">{short}</span><span className="sr-only">{name}</span>
        </Link>
      ))}
    </nav>
  );
}

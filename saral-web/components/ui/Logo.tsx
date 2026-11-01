import Link from "next/link";
import type { CSSProperties } from "react";
import { localePath, type Locale } from "@/lib/i18n";

/** Compact brand mark and wordmark. */
export default function Logo({ locale, label, height = 36 }: { locale: Locale; label: string; height?: number }) {
  return (
    <Link href={localePath(locale, "/")} aria-label={label} className="brand-logo" style={{ "--brand-size": `${height}px` } as CSSProperties} prefetch={false}>
      <span className="brand-logo-mark" aria-hidden="true">S</span>
      <span className="brand-logo-name" aria-hidden="true">Saral AI</span>
    </Link>
  );
}

import Link from "next/link";
import { localePath, type Locale } from "@/lib/i18n";

/** SVG wordmark, light + dark variants swap with the theme via CSS (no JS, no flash). Replace files in /public/brand when a real logo exists. */
export default function Logo({ locale, label, height = 28 }: { locale: Locale; label: string; height?: number }) {
  return (
    <Link href={localePath(locale, "/")} aria-label={label} className="inline-flex items-center" prefetch={false}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="logo-light" src="/brand/saral-logo-light.svg" alt="" height={height} width={Math.round(height * 1.835)} style={{ height }} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="logo-dark" src="/brand/saral-logo-dark.svg" alt="" height={height} width={Math.round(height * 1.835)} style={{ height }} />
    </Link>
  );
}

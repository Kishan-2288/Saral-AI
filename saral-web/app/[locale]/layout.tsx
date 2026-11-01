import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import "../globals.css";
import { fontVariables } from "@/lib/fonts";
import { themeScript } from "@/lib/theme-script";
import { getDictionary, isLocale, locales } from "@/lib/i18n";
import { SITE_URL } from "@/lib/site";
import Providers from "@/components/ui/Providers";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import FloatingWhatsApp from "@/components/ui/FloatingWhatsApp";
import CookieBanner from "@/components/ui/CookieBanner";
import Analytics from "@/components/ui/Analytics";
import LegacyHashRedirect from "@/components/ui/LegacyHashRedirect";

export const dynamicParams = false;
export function generateStaticParams() { return locales.map((locale) => ({ locale })); }

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [{ media: "(prefers-color-scheme: light)", color: "#f7fafc" }, { media: "(prefers-color-scheme: dark)", color: "#0a0f1a" }],
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Saral AI", template: "%s | Saral AI" },
  applicationName: "Saral AI",
  formatDetection: { telephone: false },
};

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  return (
    <html lang={locale} className={fontVariables} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body suppressHydrationWarning>
        <a className="skip-link" href="#main">{t.nav.skip}</a>
        <Providers>
          <Header locale={locale} t={t} />
          <main id="main" tabIndex={-1} className="relative z-[1] outline-none">{children}</main>
          <Footer locale={locale} t={t} />
          <FloatingWhatsApp locale={locale} label={t.ui.whatsappFloat} newTab={t.ui.opensNewTab} />
          <CookieBanner locale={locale} t={t.ui.cookie} />
          <Analytics />
          <LegacyHashRedirect />
        </Providers>
      </body>
    </html>
  );
}

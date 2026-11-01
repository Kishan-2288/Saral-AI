import type { Metadata, Viewport } from "next";
import "../globals.css";
import { fontVariables } from "@/lib/fonts";
import { themeScript } from "@/lib/theme-script";
import { SITE_URL } from "@/lib/site";

export const viewport: Viewport = { width: "device-width", initialScale: 1 };
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Confirm your appointment | Saral Booking",
  robots: { index: false, follow: false, nocache: true },
};

/** Separate root layout: patient payment links stay outside the marketing chrome, locale routing and 3D. */
export default function BookLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}

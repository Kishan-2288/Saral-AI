import localFont from "next/font/local";

// Self-hosted WOFF2 subsets (no third-party font host). Licences: app/fonts/LICENSE-*.txt (SIL OFL 1.1).
export const sora = localFont({
  src: "../app/fonts/sora-latin-wght-normal.woff2",
  variable: "--font-sora",
  weight: "100 800",
  display: "swap",
});

export const inter = localFont({
  src: "../app/fonts/inter-latin-wght-normal.woff2",
  variable: "--font-inter",
  weight: "100 900",
  display: "swap",
});

// Devanagari subset (Hindi). Only requested by the browser when Devanagari glyphs are on the page.
export const notoDevanagari = localFont({
  src: "../app/fonts/noto-sans-devanagari-devanagari-wght-normal.woff2",
  variable: "--font-devanagari",
  weight: "100 900",
  display: "swap",
  preload: false,
});

export const fontVariables = `${sora.variable} ${inter.variable} ${notoDevanagari.variable}`;

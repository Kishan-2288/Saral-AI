import { notFound } from "next/navigation";
import { isLocale, type Locale } from "./i18n";

export async function resolveLocale(params: Promise<{ locale: string }>): Promise<Locale> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return locale;
}

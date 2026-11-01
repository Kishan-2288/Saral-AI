import type { Locale } from "./i18n";

// TODO(owner): set NEXT_PUBLIC_WHATSAPP_NUMBER (digits only, with country code, e.g. 919XXXXXXXXX).
const digits = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "").replace(/\D/g, "");

export const WHATSAPP_CONFIGURED = digits.length >= 8;

const PREFILL: Record<Locale, string> = {
  en: "Hi, I’d like to know more about Saral AI for my clinic.",
  hi: "नमस्ते, मैं अपने क्लिनिक के लिए Saral AI के बारे में जानना चाहता हूँ।",
};

/** wa.me link. When the number is not configured, wa.me/?text= opens WhatsApp's contact picker. */
export function whatsappLink(locale: Locale): string {
  const text = encodeURIComponent(PREFILL[locale]);
  return WHATSAPP_CONFIGURED ? `https://wa.me/${digits}?text=${text}` : `https://wa.me/?text=${text}`;
}

// TODO(owner): set NEXT_PUBLIC_SUPPORT_EMAIL.
export const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "";

// TODO(owner): set the social URLs. Empty values are not rendered anywhere.
export const SOCIALS = [
  { id: "linkedin", label: "LinkedIn", url: process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN ?? "" },
  { id: "instagram", label: "Instagram", url: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM ?? "" },
  { id: "x", label: "X", url: process.env.NEXT_PUBLIC_SOCIAL_X ?? "" },
  { id: "youtube", label: "YouTube", url: process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE ?? "" },
].filter((s) => s.url);

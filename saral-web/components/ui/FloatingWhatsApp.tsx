import { Icon } from "./Icons";
import { whatsappLink } from "@/lib/contact";
import type { Locale } from "@/lib/i18n";

export default function FloatingWhatsApp({ locale, label, newTab }: { locale: Locale; label: string; newTab: string }) {
  return (
    <a href={whatsappLink(locale)} target="_blank" rel="noopener noreferrer" data-track="cta_whatsapp_click"
      className="fixed bottom-5 right-5 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[var(--primary)] text-[var(--on-primary)] shadow-[var(--shadow)] transition-transform hover:scale-105 max-sm:bottom-4 max-sm:right-4">
      <Icon name="message" size={26} />
      <span className="sr-only">{label} {newTab}</span>
    </a>
  );
}

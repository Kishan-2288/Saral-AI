import Button from "@/components/ui/Button";
import { localePath, type Locale } from "@/lib/i18n";
import { whatsappLink } from "@/lib/contact";
import type { Dictionary } from "@/content/types";

/** Static poster shown instantly (no JS, reduced-motion, no WebGL). The live 3D phone fades in over it. */
function HeroPoster({ alt }: { alt: string }) {
  return (
    <div className="hero-poster mx-auto w-full max-w-[340px] max-md:max-w-[240px]">
      <svg role="img" aria-label={alt} viewBox="0 0 340 640" className="float-slow h-auto w-full" style={{ filter: "drop-shadow(0 30px 40px rgba(15,23,42,0.14))" }}>
        <rect x="20" y="10" width="300" height="620" rx="48" fill="var(--surface-2)" stroke="var(--border)" strokeWidth="2" />
        <rect x="32" y="22" width="276" height="596" rx="38" fill="var(--bg)" />
        <rect x="134" y="34" width="72" height="18" rx="9" fill="var(--text)" opacity="0.85" />
        <rect x="32" y="66" width="276" height="56" fill="var(--surface)" />
        <circle cx="62" cy="94" r="14" fill="var(--primary)" />
        <rect x="86" y="82" width="90" height="9" rx="4.5" fill="var(--text)" opacity="0.8" />
        <rect x="86" y="98" width="56" height="7" rx="3.5" fill="var(--text-muted)" opacity="0.6" />
        <rect x="120" y="150" width="172" height="52" rx="18" fill="var(--primary)" />
        <rect x="136" y="166" width="120" height="7" rx="3.5" fill="var(--on-primary)" opacity="0.85" />
        <rect x="136" y="180" width="76" height="7" rx="3.5" fill="var(--on-primary)" opacity="0.6" />
        <rect x="48" y="222" width="196" height="84" rx="18" fill="var(--surface)" stroke="var(--border)" />
        <rect x="64" y="240" width="140" height="7" rx="3.5" fill="var(--text)" opacity="0.7" />
        <rect x="64" y="256" width="100" height="7" rx="3.5" fill="var(--text-muted)" opacity="0.6" />
        <rect x="64" y="274" width="54" height="20" rx="10" fill="none" stroke="var(--primary)" />
        <rect x="126" y="274" width="54" height="20" rx="10" fill="none" stroke="var(--primary)" />
        <rect x="200" y="326" width="92" height="40" rx="18" fill="var(--primary)" />
        <rect x="48" y="386" width="212" height="64" rx="18" fill="var(--surface)" stroke="var(--border)" />
        <rect x="64" y="404" width="150" height="7" rx="3.5" fill="var(--text)" opacity="0.7" />
        <rect x="64" y="420" width="96" height="7" rx="3.5" fill="var(--text-muted)" opacity="0.6" />
        <rect x="48" y="560" width="190" height="40" rx="20" fill="var(--surface-2)" />
        <circle cx="272" cy="580" r="22" fill="var(--primary)" />
      </svg>
    </div>
  );
}

export default function Hero({ locale, t }: { locale: Locale; t: Dictionary }) {
  return (
    <section id="hero" data-scene aria-labelledby="hero-title" className="relative flex min-h-[100svh] items-center pb-16 pt-28">
      <div className="container-x grid w-full items-center gap-10 md:grid-cols-12">
        <div data-hero-copy className="md:col-span-6">
          <h1 id="hero-title" className="display rise">{t.hero.title}</h1>
          <p className="lead rise rise-2 mt-6">{t.hero.lead}</p>
          <div className="rise rise-3 mt-10 flex flex-wrap gap-4">
            <Button href={localePath(locale, "/demo")} track="cta_demo_click">{t.cta.demo}</Button>
            <Button href={whatsappLink(locale)} external variant="secondary" icon="message" track="cta_whatsapp_click" opensNewTab={t.ui.opensNewTab}>{t.cta.whatsapp}</Button>
          </div>
          <p className="rise rise-3 mt-8 text-sm"><a href="#chat" className="muted underline underline-offset-4 hover:text-[var(--text)]">{t.hero.demoHint}</a></p>
        </div>
        <div className="md:col-span-6"><HeroPoster alt={t.hero.posterAlt} /></div>
      </div>
    </section>
  );
}

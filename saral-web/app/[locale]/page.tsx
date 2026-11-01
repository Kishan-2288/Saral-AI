import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n";
import { resolveLocale } from "@/lib/page-helpers";
import { faqLd, organizationLd, pageMetadata, softwareLd, websiteLd } from "@/lib/seo";
import JsonLd from "@/components/ui/JsonLd";
import CanvasHost from "@/components/canvas/CanvasHost";
import ScrollEngine from "@/components/ui/ScrollEngine";
import SectionDots from "@/components/ui/SectionDots";
import Hero from "@/components/sections/Hero";
import Problem from "@/components/sections/Problem";
import HowItWorks from "@/components/sections/HowItWorks";
import Features from "@/components/sections/Features";
import ChatDemoSection from "@/components/sections/ChatDemoSection";
import Handoff from "@/components/sections/Handoff";
import Dashboard from "@/components/sections/Dashboard";
import Security from "@/components/sections/Security";
import UseCases from "@/components/sections/UseCases";
import Faq from "@/components/sections/Faq";
import FinalCta from "@/components/sections/FinalCta";

type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> { return pageMetadata(await resolveLocale(params), "home", "/"); }

// ORDER MUST MATCH `SCENE` in components/canvas/rig.ts
const SECTION_IDS = ["hero", "problem", "how", "features", "chat", "handoff", "dashboard", "security", "use-cases", "faq", "cta"];

export default async function HomePage({ params }: Props) {
  const locale = await resolveLocale(params);
  const t = getDictionary(locale);
  return (
    <>
      <JsonLd data={[organizationLd(), websiteLd(locale), softwareLd(locale), faqLd(locale)]} />
      <CanvasHost />
      <ScrollEngine />
      <SectionDots ids={SECTION_IDS} label={t.ui.sections} />
      <Hero locale={locale} t={t} />
      <Problem t={t.problem} />
      <HowItWorks t={t.how} />
      <Features t={t.features} />
      <ChatDemoSection t={t.chat} />
      <Handoff t={t.handoff} />
      <Dashboard t={t.dashboard} />
      <Security t={t.security} />
      <UseCases locale={locale} t={t.useCases} />
      <Faq t={t.faq} />
      <FinalCta locale={locale} t={t} />
    </>
  );
}

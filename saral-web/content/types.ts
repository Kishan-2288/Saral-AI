export type PageKey =
  | "home" | "features" | "howItWorks" | "clinics" | "hospitals"
  | "security" | "pricing" | "demo" | "about" | "privacy" | "terms" | "cookies";

export interface ChatMsg {
  from: "patient" | "bot" | "staff";
  text: string;
  kind?: "voice" | "alert";
  voiceLength?: string;
  buttons?: string[];
}
export type ChatReply = ChatMsg | { event: "handoff" };
export interface ChatTurn { prompt: string; patient: ChatMsg; replies: ChatReply[] }
export interface ChatFlow {
  id: "book" | "reschedule" | "cancel" | "voice" | "rash" | "emergency";
  label: string;
  turns: ChatTurn[];
}

export interface Dictionary {
  siteName: string;
  meta: Record<PageKey, { title: string; description: string }>;
  nav: {
    features: string; howItWorks: string; security: string; pricing: string; about: string;
    clinics: string; hospitals: string; solutions: string; demo: string;
    skip: string; menu: string; closeMenu: string; primary: string; footerNav: string; legalNav: string; home: string;
  };
  cta: { demo: string; whatsapp: string; talk: string };
  hero: { title: string; lead: string; demoHint: string; posterAlt: string };
  problem: { title: string; lead: string; items: { title: string; text: string }[] };
  how: { title: string; lead: string; steps: { title: string; text: string }[] };
  features: {
    title: string; lead: string; patientLabel: string; resultLabel: string;
    items: { id: string; title: string; text: string; detail: string; example: { label: string; text: string; result: string } }[];
  };
  chat: {
    title: string; lead: string; clinicName: string; assistantName: string; online: string;
    notice: string; intro: string; chooseFlow: string; tapToSend: string; replay: string; typing: string;
    handoffBadge: string; inputPlaceholder: string; flowsLabel: string; sampleData: string; alertLabel: string;
    flows: ChatFlow[];
  };
  handoff: { title: string; lead: string; triggersTitle: string; triggers: string[]; from: string; to: string; badge: string };
  dashboard: {
    title: string; lead: string; badge: string; caption: string;
    columns: { time: string; patient: string; doctor: string; status: string };
    rows: { time: string; patient: string; doctor: string; status: string }[];
    handoffRow: string;
  };
  security: {
    title: string; lead: string; items: { title: string; text: string }[];
    siteTitle: string; siteText: string; aiTitle: string; aiItems: string[];
  };
  useCases: { title: string; lead: string; items: { title: string; text: string }[]; more: string };
  faq: { title: string; lead: string; items: { q: string; a: string }[] };
  finalCta: { title: string; lead: string };
  footer: { tagline: string; product: string; solutions: string; company: string; legal: string; contact: string; rights: string; privacy: string; terms: string; cookies: string; emailLabel: string; social: string };
  ui: {
    theme: { label: string; light: string; dark: string; system: string };
    language: { label: string; en: string; hi: string };
    motion: { pause: string; resume: string };
    cookie: { title: string; text: string; accept: string; reject: string; policy: string };
    whatsappFloat: string; progress: string; sections: string; opensNewTab: string; loading: string;
  };
  form: {
    title: string; lead: string; privacyNote: string;
    labels: { name: string; email: string; phone: string; organization: string; industry: string; volume: string; challenge: string; consent: string };
    placeholders: { name: string; email: string; phone: string; organization: string; challenge: string };
    industries: { value: string; label: string }[];
    volumes: { value: string; label: string }[];
    submit: string; submitting: string; retry: string;
    successTitle: string; successText: string; reference: string;
    errors: Record<"name" | "email" | "phone" | "organization" | "industry" | "volume" | "challenge" | "consent" | "captcha", string>;
    server: Record<"rate_limited" | "captcha" | "unavailable" | "validation" | "unknown" | "network", string>;
    captchaMissing: string; or: string;
  };
  pages: {
    features: { title: string; lead: string };
    howItWorks: { title: string; lead: string; safetyTitle: string; safetyItems: string[] };
    clinics: { title: string; lead: string; points: { title: string; text: string }[]; closing: string };
    hospitals: { title: string; lead: string; points: { title: string; text: string }[]; closing: string };
    security: { title: string; lead: string };
    pricing: { title: string; lead: string; body: string };
    demo: { title: string; lead: string; whatNext: string[] };
    about: { title: string; lead: string; blocks: { title: string; text: string }[] };
    notFound: { title: string; text: string; back: string };
    legalNotice: string;
    book: { eyebrow: string };
  };
}

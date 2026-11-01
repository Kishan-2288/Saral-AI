/**
 * Consent-gated analytics. Nothing is sent, and no third-party script is loaded, unless:
 *   1. the visitor accepted analytics, AND
 *   2. NEXT_PUBLIC_PLAUSIBLE_DOMAIN is configured.
 */
export const CONSENT_KEY = "saral-consent";
export type Consent = "granted" | "denied" | null;

export function getConsent(): Consent {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch { return null; }
}
export function setConsent(v: "granted" | "denied") {
  try { localStorage.setItem(CONSENT_KEY, v); } catch { /* ignore */ }
  window.dispatchEvent(new CustomEvent("saral:consent", { detail: v }));
}

type Plausible = (event: string, options?: { props?: Record<string, string | number | boolean> }) => void;

export type AnalyticsEvent =
  | "cta_demo_click" | "cta_whatsapp_click" | "demo_form_submit"
  | "chat_demo_started" | "chat_demo_completed"
  | "scroll_depth_25" | "scroll_depth_50" | "scroll_depth_75" | "scroll_depth_100"
  | "theme_toggle" | "web_vitals";

export function track(event: AnalyticsEvent, props?: Record<string, string | number | boolean>) {
  if (typeof window === "undefined" || getConsent() !== "granted") return;
  const plausible = (window as unknown as { plausible?: Plausible }).plausible;
  if (plausible) plausible(event, props ? { props } : undefined);
}

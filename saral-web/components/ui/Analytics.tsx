"use client";

import { useEffect } from "react";
import { useReportWebVitals } from "next/web-vitals";
import { getConsent, track, type AnalyticsEvent } from "@/lib/analytics";

const PLAUSIBLE_DOMAIN = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

function loadProvider() {
  if (!PLAUSIBLE_DOMAIN || document.getElementById("plausible-script")) return;
  const s = document.createElement("script");
  s.id = "plausible-script"; s.defer = true; s.dataset.domain = PLAUSIBLE_DOMAIN; s.src = "https://plausible.io/js/script.js";
  document.head.appendChild(s);
}

/** Consent-gated analytics: nothing loads or fires until the visitor accepts. */
export default function Analytics() {
  useEffect(() => {
    if (getConsent() === "granted") loadProvider();
    const onConsent = (e: Event) => { if ((e as CustomEvent).detail === "granted") loadProvider(); };
    window.addEventListener("saral:consent", onConsent);

    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest<HTMLElement>("[data-track]");
      if (el?.dataset.track) track(el.dataset.track as AnalyticsEvent, { path: location.pathname });
    };
    document.addEventListener("click", onClick);

    const fired = new Set<number>();
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max <= 0) return;
      const pct = (window.scrollY / max) * 100;
      for (const mark of [25, 50, 75, 100]) {
        if (pct >= mark - 1 && !fired.has(mark)) { fired.add(mark); track(`scroll_depth_${mark}` as AnalyticsEvent); }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("saral:consent", onConsent);
      document.removeEventListener("click", onClick);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useReportWebVitals((m) => track("web_vitals", { name: m.name, value: Math.round(m.name === "CLS" ? m.value * 1000 : m.value) }));
  return null;
}

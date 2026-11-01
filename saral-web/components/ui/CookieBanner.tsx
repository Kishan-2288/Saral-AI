"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, m } from "framer-motion";
import { getConsent, setConsent } from "@/lib/analytics";
import { localePath, type Locale } from "@/lib/i18n";
import type { Dictionary } from "@/content/types";

export default function CookieBanner({ locale, t }: { locale: Locale; t: Dictionary["ui"]["cookie"] }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (getConsent() !== null) return;
    const id = window.setTimeout(() => setOpen(true), 1200);
    return () => window.clearTimeout(id);
  }, []);
  const choose = (v: "granted" | "denied") => { setConsent(v); setOpen(false); };
  return (
    <AnimatePresence>
      {open && (
        <m.section
          role="region" aria-label={t.title}
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }} transition={{ duration: 0.4 }}
          className="card frosted fixed inset-x-3 bottom-3 z-[70] p-4 shadow-[var(--shadow)] md:bottom-5 md:left-5 md:right-24 md:flex md:items-center md:justify-between md:gap-6 md:py-4"
        >
          <div>
            <h2 className="h3 !text-base">{t.title}</h2>
            <p className="muted mt-1 mb-0 text-[0.8rem] leading-snug md:text-sm">{t.text} <Link className="underline underline-offset-2" href={localePath(locale, "/cookies")}>{t.policy}</Link></p>
          </div>
          <div className="mt-3 flex shrink-0 gap-2 md:mt-0 md:gap-3">
            <button type="button" className="btn btn-primary !min-h-10 !px-4 !text-sm" onClick={() => choose("granted")}>{t.accept}</button>
            <button type="button" className="btn btn-secondary !min-h-10 !px-4 !text-sm" onClick={() => choose("denied")}>{t.reject}</button>
          </div>
        </m.section>
      )}
    </AnimatePresence>
  );
}

"use client";

import { useId, useState } from "react";
import { m } from "framer-motion";
import { Icon } from "./Icons";

/** FAQ accordion. All answers are in the DOM (closed ones are collapsed, not removed), so crawlers and screen readers see them. */
export default function Accordion({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  const base = useId();
  return (
    <div className="divide-y divide-[var(--border)] border-y border-[var(--border)]">
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div key={it.q}>
            <h3 className="m-0">
              <button type="button" id={`${base}-b${i}`} aria-expanded={isOpen} aria-controls={`${base}-p${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-6 py-6 text-left font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight">
                <span>{it.q}</span>
                <span className="text-[var(--primary)]"><Icon name={isOpen ? "minus" : "plus"} size={20} /></span>
              </button>
            </h3>
            <m.div id={`${base}-p${i}`} role="region" aria-labelledby={`${base}-b${i}`} initial={false}
              animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              style={{ overflow: "hidden" }} aria-hidden={!isOpen}>
              <p className="muted m-0 max-w-2xl pb-6">{it.a}</p>
            </m.div>
          </div>
        );
      })}
    </div>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { AnimatePresence, m } from "framer-motion";
import { Icon } from "./Icons";

interface Props {
  items: { href: string; label: string }[];
  cta: { href: string; label: string };
  labels: { open: string; close: string; nav: string };
  children: ReactNode;
}

export default function MobileMenu({ items, cta, labels, children }: Props) {
  const [open, setOpen] = useState(false);
  const btn = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const close = useCallback(() => { setOpen(false); btn.current?.focus(); }, []);

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = "hidden";
    const focusables = () => Array.from(panel.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? []);
    focusables()[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); close(); return; }
      if (e.key !== "Tab") return;
      const f = focusables(); if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => { root.style.overflow = prev; document.removeEventListener("keydown", onKey); };
  }, [open, close]);

  return (
    <>
      <button ref={btn} type="button" className="tt !h-11 !w-11 md:!hidden" aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? labels.close : labels.open} onClick={() => setOpen((v) => !v)}>
        <Icon name={open ? "close" : "menu"} size={22} />
      </button>
      <AnimatePresence>
        {open && (
          <m.div id="mobile-menu" ref={panel} role="dialog" aria-modal="true" aria-label={labels.nav}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
            className="fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto bg-[var(--bg)] px-6 pb-10 pt-6 md:hidden">
            <nav aria-label={labels.nav}>
              <ul className="m-0 flex list-none flex-col p-0">
                {items.map((it) => (
                  <li key={it.href} className="border-b border-[var(--border)]">
                    <Link href={it.href} onClick={() => setOpen(false)} className="block py-4 font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight">{it.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="mt-8 flex flex-wrap items-center gap-4">{children}</div>
            <Link href={cta.href} onClick={() => setOpen(false)} className="btn btn-primary mt-8 w-full" data-track="cta_demo_click">{cta.label}</Link>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
}

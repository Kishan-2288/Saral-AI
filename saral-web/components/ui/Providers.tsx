"use client";

import { useEffect, type ReactNode } from "react";
import { LazyMotion } from "framer-motion";
import { useUI } from "@/lib/store";

const loadFeatures = () => import("framer-motion").then((m) => m.domAnimation);

/** Framer Motion features load lazily; theme store syncs with the attribute the inline script set before paint. */
export default function Providers({ children }: { children: ReactNode }) {
  const syncFromDom = useUI((s) => s.syncFromDom);
  const setResolved = useUI((s) => s.setResolved);

  useEffect(() => {
    syncFromDom();
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => { if (useUI.getState().pref === "system") setResolved(mq.matches ? "dark" : "light"); };
    mq.addEventListener("change", onChange);
    const onStorage = (e: StorageEvent) => {
      if (e.key !== "saral-theme") return;
      const pref = e.newValue === "light" || e.newValue === "dark" ? e.newValue : "system";
      useUI.getState().setPref(pref);
    };
    window.addEventListener("storage", onStorage);
    return () => { mq.removeEventListener("change", onChange); window.removeEventListener("storage", onStorage); };
  }, [syncFromDom, setResolved]);

  return <LazyMotion features={loadFeatures} strict>{children}</LazyMotion>;
}

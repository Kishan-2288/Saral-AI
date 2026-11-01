"use client";

import { useEffect } from "react";
import { mapLegacyHash } from "@/lib/legacy-routes";
import { localePath, stripLocale } from "@/lib/i18n";

/** Old site used hash routes (#/services). They never reach the server, so we map them to the new routes here. */
export default function LegacyHashRedirect() {
  useEffect(() => {
    const run = () => {
      const target = mapLegacyHash(window.location.hash);
      if (target === null) return;
      const { locale, path } = stripLocale(window.location.pathname);
      const dest = localePath(locale, target);
      if (dest === window.location.pathname && path === target) { history.replaceState(null, "", dest); return; }
      window.location.replace(dest);
    };
    run();
    window.addEventListener("hashchange", run);
    return () => window.removeEventListener("hashchange", run);
  }, []);
  return null;
}

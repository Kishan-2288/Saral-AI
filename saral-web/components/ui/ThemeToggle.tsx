"use client";

import { useUI, type ThemePref } from "@/lib/store";
import { Icon, type IconName } from "./Icons";
import { track } from "@/lib/analytics";
import type { Dictionary } from "@/content/types";

const ITEMS: { pref: ThemePref; icon: IconName }[] = [
  { pref: "light", icon: "sun" },
  { pref: "system", icon: "monitor" },
  { pref: "dark", icon: "moon" },
];

/** Light / System / Dark. Selected state is styled from <html data-theme-pref> so it never flashes. */
export default function ThemeToggle({ t }: { t: Dictionary["ui"]["theme"] }) {
  const pref = useUI((s) => s.pref);
  const setPref = useUI((s) => s.setPref);
  return (
    <div role="group" aria-label={t.label} className="tt-group">
      {ITEMS.map(({ pref: p, icon }) => (
        <button key={p} type="button" className="tt" data-pref={p} aria-pressed={pref === p} title={t[p]}
          onClick={() => { setPref(p); track("theme_toggle", { theme: p }); }}>
          <Icon name={icon} size={16} />
          <span className="sr-only">{t[p]}</span>
        </button>
      ))}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

/** Right-edge section navigation (desktop). Labels come from each section's own heading, so there is no extra copy to translate. */
export default function SectionDots({ ids, label }: { ids: string[]; label: string }) {
  const [active, setActive] = useState(ids[0]);
  const [names, setNames] = useState<Record<string, string>>({});
  useEffect(() => {
    const n: Record<string, string> = {};
    ids.forEach((id) => { n[id] = document.getElementById(id)?.querySelector("h1, h2")?.textContent?.trim() ?? id; });
    setNames(n);
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); });
    }, { rootMargin: "-50% 0px -50% 0px" });
    ids.forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, [ids]);
  return (
    <nav aria-label={label} className="fixed right-5 top-1/2 z-30 hidden -translate-y-1/2 xl:block">
      <ul className="m-0 flex list-none flex-col gap-0 p-0">
        {ids.map((id) => (
          <li key={id}>
            <a href={`#${id}`} className="dot-link" data-active={active === id} aria-current={active === id ? "true" : undefined}>
              <span className="sr-only">{names[id] ?? id}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

"use client";

import { useUI } from "@/lib/store";
import { Icon } from "./Icons";
import type { Dictionary } from "@/content/types";

/** "Skip animation" control (WCAG 2.2.2): pauses 3D, smooth scroll and decorative motion site-wide. */
export default function MotionToggle({ t }: { t: Dictionary["ui"]["motion"] }) {
  const paused = useUI((s) => s.motionPaused);
  const setPaused = useUI((s) => s.setMotionPaused);
  return (
    <button type="button" className="inline-flex items-center gap-2 text-sm muted underline-offset-4 hover:underline" aria-pressed={paused} onClick={() => setPaused(!paused)}>
      <Icon name={paused ? "play" : "pause"} size={16} />
      {paused ? t.resume : t.pause}
    </button>
  );
}

"use client";

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { anyVisible } from "./rig";
import { scrollState } from "@/lib/scroll-state";

/**
 * On-demand rendering: the canvas only renders while an object is visible (or the theme is blending).
 * In dead zones (chat demo, dashboard, FAQ…) the GPU is idle. Hidden tabs pause automatically (rAF).
 */
export default function Driver() {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    let raf = 0;
    let wasActive = true;
    const loop = () => {
      const active = anyVisible(scrollState.scene) > 0.003 || performance.now() - scrollState.themeChangedAt < 1200;
      if (active || wasActive) invalidate();
      wasActive = active;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [invalidate]);
  return null;
}

"use client";

import { Component, useEffect, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { useUI, type Quality } from "@/lib/store";

// 3D is a separate chunk, fetched only after first paint + idle, and only when the device qualifies.
const SceneCanvas = dynamic(() => import("./SceneCanvas"), { ssr: false });

class Boundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onError(); }
  render() { return this.state.failed ? null : this.props.children; }
}

function hasWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    // failIfMajorPerformanceCaveat: software-rendered WebGL counts as "no WebGL" (poster + static content instead)
    return !!(c.getContext("webgl2", { failIfMajorPerformanceCaveat: true }) || c.getContext("webgl", { failIfMajorPerformanceCaveat: true }));
  } catch { return false; }
}

type Nav = Navigator & { connection?: { saveData?: boolean; effectiveType?: string }; deviceMemory?: number };

export default function CanvasHost() {
  const paused = useUI((s) => s.motionPaused);
  const [quality, setQuality] = useState<Quality>("off");
  const setStoreQuality = useUI((s) => s.setQuality);

  useEffect(() => {
    if (paused) { setQuality("off"); setStoreQuality("off"); return; }
    const params = new URLSearchParams(window.location.search);
    const override = params.get("3d"); // QA switch: ?3d=off | ?3d=force | ?3d=low
    const nav = navigator as Nav;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (override === "off" || reduce) return;
    if (override !== "force" && override !== "low" && !hasWebGL()) return;

    const slow = nav.connection?.saveData || /(^|-)2g$/.test(nav.connection?.effectiveType ?? "");
    const weak = (nav.deviceMemory ?? 8) <= 2 || (navigator.hardwareConcurrency ?? 8) <= 2;
    const mobile = window.matchMedia("(max-width: 767px), (pointer: coarse)").matches;
    const q: Exclude<Quality, "off"> = override === "low" || mobile || slow || weak ? "low" : "high";

    let cancelled = false;
    let idleHandle: number | undefined;
    let timer: number | undefined;
    const start = () => {
      if (cancelled) return;
      setQuality(q); setStoreQuality(q);
    };
    const afterLoad = () => {
      // first paint is long gone by now; wait for an idle slice, slower networks wait a bit longer
      const delay = slow ? 3000 : 400;
      timer = window.setTimeout(() => {
        if ("requestIdleCallback" in window) idleHandle = window.requestIdleCallback(start, { timeout: 2500 });
        else start();
      }, delay);
    };
    if (document.readyState === "complete") afterLoad();
    else window.addEventListener("load", afterLoad, { once: true });
    return () => {
      cancelled = true;
      window.removeEventListener("load", afterLoad);
      if (timer) window.clearTimeout(timer);
      if (idleHandle !== undefined && "cancelIdleCallback" in window) window.cancelIdleCallback(idleHandle);
    };
  }, [paused, setStoreQuality]);

  if (quality === "off") return null;
  return (
    <Boundary onError={() => { setQuality("off"); setStoreQuality("off"); }}>
      <SceneCanvas quality={quality} />
    </Boundary>
  );
}

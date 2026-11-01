import { create } from "zustand";
import { MOTION_STORAGE_KEY, THEME_STORAGE_KEY } from "./theme-script";
import { scrollState } from "./scroll-state";

export type ThemePref = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";
export type Quality = "off" | "low" | "high";

interface UIState {
  pref: ThemePref;
  resolved: ResolvedTheme;
  motionPaused: boolean;
  quality: Quality;
  canvasLive: boolean;
  setPref: (pref: ThemePref) => void;
  syncFromDom: () => void;
  setResolved: (r: ResolvedTheme) => void;
  setMotionPaused: (paused: boolean) => void;
  setQuality: (q: Quality) => void;
  setCanvasLive: (live: boolean) => void;
}

const systemDark = () => typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;

function applyTheme(pref: ThemePref): ResolvedTheme {
  const resolved: ResolvedTheme = pref === "system" ? (systemDark() ? "dark" : "light") : pref;
  const root = document.documentElement;
  root.classList.add("theme-transition");
  root.setAttribute("data-theme", resolved);
  root.setAttribute("data-theme-pref", pref);
  root.style.colorScheme = resolved;
  window.setTimeout(() => root.classList.remove("theme-transition"), 450);
  scrollState.themeChangedAt = performance.now();
  return resolved;
}

export const useUI = create<UIState>((set) => ({
  pref: "system",
  resolved: "light",
  motionPaused: false,
  quality: "off",
  canvasLive: false,
  setPref: (pref) => {
    try { localStorage.setItem(THEME_STORAGE_KEY, pref); } catch { /* storage unavailable */ }
    set({ pref, resolved: applyTheme(pref) });
  },
  syncFromDom: () => {
    const root = document.documentElement;
    const pref = (root.getAttribute("data-theme-pref") as ThemePref) || "system";
    const resolved = (root.getAttribute("data-theme") as ResolvedTheme) || "light";
    set({ pref, resolved, motionPaused: root.getAttribute("data-motion") === "off" });
  },
  setResolved: (resolved) => {
    document.documentElement.setAttribute("data-theme", resolved);
    document.documentElement.style.colorScheme = resolved;
    scrollState.themeChangedAt = performance.now();
    set({ resolved });
  },
  setMotionPaused: (motionPaused) => {
    try { localStorage.setItem(MOTION_STORAGE_KEY, motionPaused ? "off" : "on"); } catch { /* ignore */ }
    if (motionPaused) document.documentElement.setAttribute("data-motion", "off");
    else document.documentElement.removeAttribute("data-motion");
    set({ motionPaused });
  },
  setQuality: (quality) => set({ quality }),
  setCanvasLive: (canvasLive) => {
    document.documentElement.classList.toggle("canvas-live", canvasLive);
    set({ canvasLive });
  },
}));

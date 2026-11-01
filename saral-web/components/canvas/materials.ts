import * as THREE from "three";
import { useEffect, useMemo } from "react";

export type Themed = THREE.MeshStandardMaterial | THREE.MeshBasicMaterial | THREE.PointsMaterial | THREE.SpriteMaterial;

interface Entry { mat: Themed; light: THREE.Color; dark: THREE.Color; glow: number }
const registry = new Set<Entry>();
const entries = new WeakMap<Themed, Entry>();
const tmp = new THREE.Color();
/** Smoothed theme blend shared with non-material consumers (halo, lights). 0 = light, 1 = dark. */
export const themeBlend = { t: 0 };

/** Registers a material so its colour follows the theme blend (0 = light, 1 = dark). `glow` adds emissive in dark mode. */
export function themed<T extends Themed>(mat: T, light: string, dark: string, glow = 0, baseOpacity = 1): T {
  mat.transparent = true;
  mat.opacity = baseOpacity;
  mat.userData.base = baseOpacity;
  const entry: Entry = { mat, light: new THREE.Color(light), dark: new THREE.Color(dark), glow };
  entries.set(mat, entry);
  registry.add(entry);
  mat.color.copy(entry.light);
  return mat;
}

export function applyThemeBlend(t: number) {
  registry.forEach((e) => {
    e.mat.color.copy(e.light).lerp(e.dark, t);
    const m = e.mat as THREE.MeshStandardMaterial;
    if (e.glow > 0 && m.emissive) m.emissive.copy(tmp.copy(e.mat.color)).multiplyScalar(e.glow * t);
  });
}

export function setOpacity(mats: Record<string, Themed>, vis: number) {
  for (const m of Object.values(mats)) m.opacity = (m.userData.base as number) * vis;
}

export function useDisposable<T extends Record<string, Themed>>(factory: () => T): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const mats = useMemo(factory, []);
  useEffect(() => () => {
    for (const m of Object.values(mats)) { const e = entries.get(m); if (e) registry.delete(e); m.dispose(); }
  }, [mats]);
  return mats;
}

export const std = (p: THREE.MeshStandardMaterialParameters = {}) => new THREE.MeshStandardMaterial({ roughness: 0.55, metalness: 0.05, ...p });
export const basic = (p: THREE.MeshBasicMaterialParameters = {}) => new THREE.MeshBasicMaterial(p);

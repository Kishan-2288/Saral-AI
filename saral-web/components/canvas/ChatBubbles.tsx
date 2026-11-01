"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { VIS, panelGeometry } from "./rig";
import { setOpacity, std, themed, useDisposable } from "./materials";
import { scrollState } from "@/lib/scroll-state";
import type { Quality } from "@/lib/store";

const SPECS = [
  { w: 0.66, h: 0.23, kind: "user", r: 1.12, a0: 0.5, sp: 0.16, y: 0.62 },
  { w: 0.82, h: 0.27, kind: "bot", r: 1.22, a0: 2.0, sp: 0.13, y: 0.1 },
  { w: 0.5, h: 0.2, kind: "user", r: 1.1, a0: 3.5, sp: 0.15, y: -0.5 },
  { w: 0.74, h: 0.26, kind: "bot", r: 1.28, a0: 4.8, sp: 0.12, y: 0.95 },
  { w: 0.58, h: 0.22, kind: "user", r: 1.2, a0: 5.7, sp: 0.14, y: -0.15 },
] as const;

/** Soft matte bubbles that drift around the phone. Line bars hint at text without any real copy. */
export default function ChatBubbles({ quality }: { quality: Exclude<Quality, "off"> }) {
  const specs = quality === "high" ? SPECS : SPECS.slice(0, 3);
  const refs = useRef<(THREE.Group | null)[]>([]);
  const mats = useDisposable(() => ({
    user: themed(std({ roughness: 0.6 }), "#0a7f5a", "#2dd4a0", 0.12),
    bot: themed(std({ roughness: 0.7 }), "#ffffff", "#27324f", 0, 0.94),
    lineOnUser: themed(std({ roughness: 0.8 }), "#d8f3ea", "#04130d", 0, 0.85),
    lineOnBot: themed(std({ roughness: 0.8 }), "#cbd5e1", "#475569", 0, 0.9),
  }));
  const geos = useMemo(() => specs.map((s) => ({
    panel: panelGeometry(s.w, s.h, s.h * 0.4, 0.035, 0.012),
    l1: panelGeometry(s.w * 0.62, 0.03, 0.015, 0.01, 0.004),
    l2: panelGeometry(s.w * 0.4, 0.03, 0.015, 0.01, 0.004),
  })), [specs]);

  useFrame((state) => {
    const vis = VIS.phone(scrollState.scene);
    setOpacity(mats, vis);
    const t = state.clock.elapsedTime;
    refs.current.forEach((g, i) => {
      if (!g) return;
      const s = specs[i];
      const a = s.a0 + t * s.sp;
      g.position.set(Math.cos(a) * s.r, s.y + Math.sin(t * 0.7 + i) * 0.04, Math.sin(a) * s.r * 0.7);
      g.rotation.y = -Math.sin(a) * 0.35;
    });
  });

  return (
    <group>
      {specs.map((s, i) => (
        <group key={i} ref={(el) => { refs.current[i] = el; }}>
          <mesh geometry={geos[i].panel} material={s.kind === "user" ? mats.user : mats.bot} />
          <mesh geometry={geos[i].l1} material={s.kind === "user" ? mats.lineOnUser : mats.lineOnBot} position={[-s.w * 0.1, s.h * 0.12, 0.04]} />
          <mesh geometry={geos[i].l2} material={s.kind === "user" ? mats.lineOnUser : mats.lineOnBot} position={[-s.w * 0.2, -s.h * 0.14, 0.04]} />
        </group>
      ))}
    </group>
  );
}

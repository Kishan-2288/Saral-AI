"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { LAYOUT, VIS, clamp01, panelGeometry, place, ramp } from "./rig";
import { setOpacity, std, themed, useDisposable } from "./materials";
import { scrollState } from "@/lib/scroll-state";

/** Handoff scene: a chat bubble travels from the AI node to the staff node. */
export default function HandoffObjects() {
  const root = useRef<THREE.Group>(null);
  const bubble = useRef<THREE.Group>(null);
  const staff = useRef<THREE.Group>(null);
  const mats = useDisposable(() => ({
    bot: themed(std({ roughness: 0.45 }), "#0a7f5a", "#2dd4a0", 0.2),
    human: themed(std({ roughness: 0.45 }), "#f59e0b", "#fbbf24", 0.18),
    msg: themed(std({ roughness: 0.6 }), "#ffffff", "#27324f"),
    glyph: themed(std({ roughness: 0.6 }), "#ffffff", "#04130d"),
    dot: themed(std({ roughness: 0.8 }), "#a9b6c6", "#475569", 0, 0.9),
  }));
  const geo = useMemo(() => ({ bubble: panelGeometry(0.52, 0.28, 0.11, 0.06, 0.016) }), []);
  const dots = useMemo(() => Array.from({ length: 11 }, (_, i) => { const u = i / 10; return new THREE.Vector3(-1 + 2 * u, Math.sin(Math.PI * u) * 0.5, 0); }), []);

  useFrame((state) => {
    const r = root.current;
    if (!r) return;
    const s = scrollState.scene;
    const vis = VIS.handoff(s);
    r.visible = vis > 0.003;
    if (!r.visible) return;
    place(r, LAYOUT.handoff, s, state.viewport, state.size.width < 768, { ry: scrollState.pointerX * 0.08 });
    setOpacity(mats, vis);
    const u = ramp(clamp01(s - 5), 0.12, 0.82);
    if (bubble.current) bubble.current.position.set(-1 + 2 * u, Math.sin(Math.PI * u) * 0.5 + 0.08, 0.15);
    if (staff.current) staff.current.scale.setScalar(1 + ramp(u, 0.9, 1) * 0.1 + Math.sin(state.clock.elapsedTime * 2) * 0.01);
  });

  return (
    <group ref={root} visible={false}>
      <group position={[-1, 0, 0]}>
        <mesh material={mats.bot} rotation={[Math.PI / 2, Math.PI / 8, 0]}><cylinderGeometry args={[0.4, 0.4, 0.16, 8]} /></mesh>
        <mesh material={mats.glyph} position={[-0.1, 0.04, 0.1]}><sphereGeometry args={[0.04, 16, 16]} /></mesh>
        <mesh material={mats.glyph} position={[0.1, 0.04, 0.1]}><sphereGeometry args={[0.04, 16, 16]} /></mesh>
      </group>
      <group ref={staff} position={[1, 0, 0]}>
        <mesh material={mats.human} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.4, 0.4, 0.16, 48]} /></mesh>
        <mesh material={mats.glyph} position={[0, 0.1, 0.1]}><sphereGeometry args={[0.095, 24, 24]} /></mesh>
        <mesh material={mats.glyph} position={[0, -0.1, 0.1]} scale={[1, 0.62, 0.35]}><sphereGeometry args={[0.18, 24, 24]} /></mesh>
      </group>
      {dots.map((p, i) => (
        <mesh key={i} position={p} material={mats.dot}><sphereGeometry args={[0.025, 12, 12]} /></mesh>
      ))}
      <group ref={bubble}><mesh geometry={geo.bubble} material={mats.msg} /></group>
    </group>
  );
}

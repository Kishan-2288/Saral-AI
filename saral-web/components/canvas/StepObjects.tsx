"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { LAYOUT, VIS, panelGeometry, place, clamp01 } from "./rig";
import { setOpacity, std, themed, useDisposable } from "./materials";
import { scrollState } from "@/lib/scroll-state";
import { CalendarModel } from "./CalendarCard";

const weight = (x: number) => clamp01(1 - Math.abs(x) * 1.7);

/** How-it-works scene: ONE object that becomes the next as you scroll: message → AI → booking → confirmation. */
export default function StepObjects() {
  const root = useRef<THREE.Group>(null);
  const g0 = useRef<THREE.Group>(null);
  const g1 = useRef<THREE.Group>(null);
  const g2 = useRef<THREE.Group>(null);
  const g3 = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Mesh>(null);
  const calVis = useRef(0);

  const mMsg = useDisposable(() => ({
    user: themed(std({ roughness: 0.6 }), "#0a7f5a", "#2dd4a0", 0.14),
    line: themed(std({ roughness: 0.8 }), "#d8f3ea", "#04130d", 0, 0.85),
  }));
  const mAi = useDisposable(() => ({
    orb: themed(std({ roughness: 0.35, metalness: 0.1 }), "#0a7f5a", "#2dd4a0", 0.3),
    ring: themed(std({ roughness: 0.5 }), "#94a3b8", "#6b7d99"),
    spark: themed(std({ roughness: 0.5 }), "#f59e0b", "#fbbf24", 0.2),
  }));
  const mOk = useDisposable(() => ({
    disc: themed(std({ roughness: 0.5 }), "#0a7f5a", "#2dd4a0", 0.2),
    tick: themed(std({ roughness: 0.6 }), "#ffffff", "#04130d"),
  }));
  const geo = useMemo(() => ({
    bubble: panelGeometry(1.5, 0.66, 0.26, 0.08, 0.02),
    l1: panelGeometry(0.95, 0.06, 0.03, 0.02, 0.006),
    l2: panelGeometry(0.6, 0.06, 0.03, 0.02, 0.006),
    armShort: panelGeometry(0.3, 0.1, 0.05, 0.04, 0.01),
    armLong: panelGeometry(0.62, 0.1, 0.05, 0.04, 0.01),
  }), []);

  useFrame((state) => {
    const r = root.current;
    if (!r) return;
    const s = scrollState.scene;
    const vis = VIS.steps(s);
    r.visible = vis > 0.003;
    calVis.current = 0;
    if (!r.visible) return;
    place(r, LAYOUT.steps, s, state.viewport, state.size.width < 768, { ry: scrollState.pointerX * 0.1, rx: -scrollState.pointerY * 0.05 });
    const stage = scrollState.stage;
    const t = state.clock.elapsedTime;
    const groups = [g0.current, g1.current, g2.current, g3.current];
    groups.forEach((g, i) => {
      if (!g) return;
      const w = weight(stage - (i + 0.5)) * vis;
      g.visible = w > 0.003;
      g.scale.setScalar(0.55 + 0.45 * Math.min(1, w));
      g.position.y = Math.sin(t * 0.8 + i) * 0.04;
      if (i === 0) setOpacity(mMsg, w);
      if (i === 1) setOpacity(mAi, w);
      if (i === 2) calVis.current = w;
      if (i === 3) setOpacity(mOk, w);
    });
    if (ring.current) { ring.current.rotation.z = t * 0.5; ring.current.rotation.x = 1.1 + Math.sin(t * 0.4) * 0.15; }
  });

  return (
    <group ref={root} visible={false}>
      <group ref={g0}>
        <mesh geometry={geo.bubble} material={mMsg.user} />
        <mesh geometry={geo.l1} material={mMsg.line} position={[-0.15, 0.1, 0.07]} />
        <mesh geometry={geo.l2} material={mMsg.line} position={[-0.32, -0.08, 0.07]} />
      </group>
      <group ref={g1}>
        <mesh material={mAi.orb}><sphereGeometry args={[0.52, 48, 48]} /></mesh>
        <mesh ref={ring} material={mAi.ring}><torusGeometry args={[0.85, 0.014, 12, 96]} /></mesh>
        <mesh material={mAi.spark} position={[0.85, 0, 0]}><sphereGeometry args={[0.05, 20, 20]} /></mesh>
      </group>
      <group ref={g2}><CalendarModel visRef={calVis} /></group>
      <group ref={g3}>
        <mesh material={mOk.disc} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.72, 0.72, 0.16, 56]} /></mesh>
        <mesh geometry={geo.armShort} material={mOk.tick} position={[-0.17, -0.02, 0.12]} rotation={[0, 0, -Math.PI / 4]} />
        <mesh geometry={geo.armLong} material={mOk.tick} position={[0.12, 0.06, 0.12]} rotation={[0, 0, Math.PI / 4]} />
      </group>
    </group>
  );
}

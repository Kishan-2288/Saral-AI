"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { LAYOUT, VIS, panelGeometry, place, clamp01 } from "./rig";
import { setOpacity, std, themed, useDisposable } from "./materials";
import { scrollState } from "@/lib/scroll-state";

/** The calendar model itself. Fade is driven by `visRef` so the same model serves Steps and Features. */
export function CalendarModel({ visRef }: { visRef: { current: number } }) {
  const slot = useRef<THREE.Mesh>(null);
  const mats = useDisposable(() => ({
    face: themed(std({ roughness: 0.55 }), "#ffffff", "#1e2742"),
    band: themed(std({ roughness: 0.5 }), "#0a7f5a", "#2dd4a0", 0.12),
    cell: themed(std({ roughness: 0.7 }), "#dde5ee", "#2c3860"),
    pick: themed(std({ roughness: 0.5 }), "#0a7f5a", "#2dd4a0", 0.2),
    ring: themed(std({ roughness: 0.4, metalness: 0.2 }), "#64748b", "#a5b4cc"),
  }));
  const geos = useMemo(() => ({
    card: panelGeometry(1.5, 1.78, 0.2, 0.12, 0.02),
    band: panelGeometry(1.34, 0.26, 0.1, 0.03, 0.008),
    cell: panelGeometry(0.13, 0.13, 0.04, 0.03, 0.008),
    binder: panelGeometry(0.07, 0.22, 0.035, 0.05, 0.01),
  }), []);
  const cells = useMemo(() => {
    const out: [number, number][] = [];
    for (let r = 0; r < 4; r++) for (let c = 0; c < 7; c++) out.push([-0.555 + c * 0.185, 0.2 - r * 0.24]);
    return out;
  }, []);

  useFrame((state) => {
    setOpacity(mats, visRef.current);
    if (slot.current) slot.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2.2) * 0.07);
  });

  return (
    <group>
      <mesh geometry={geos.card} material={mats.face} />
      <mesh geometry={geos.band} material={mats.band} position={[0, 0.6, 0.09]} />
      <mesh geometry={geos.binder} material={mats.ring} position={[-0.42, 0.9, 0.06]} />
      <mesh geometry={geos.binder} material={mats.ring} position={[0.42, 0.9, 0.06]} />
      {cells.map(([x, y], i) => (i === 10
        ? <mesh key={i} ref={slot} geometry={geos.cell} material={mats.pick} position={[x, y, 0.1]} />
        : <mesh key={i} geometry={geos.cell} material={mats.cell} position={[x, y, 0.09]} />))}
    </group>
  );
}

/** Features scene: the calendar slowly turns as the six features go by. */
export default function CalendarCard() {
  const group = useRef<THREE.Group>(null);
  const visRef = useRef(0);
  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    const s = scrollState.scene;
    const vis = VIS.calendar(s);
    visRef.current = vis;
    g.visible = vis > 0.003;
    if (!g.visible) return;
    const local = clamp01(s - 3);
    place(g, LAYOUT.calendar, s, state.viewport, state.size.width < 768, { ry: -0.5 + local * 1.1 + scrollState.pointerX * 0.08, rx: 0.08 - scrollState.pointerY * 0.05 });
    g.position.y += Math.sin(state.clock.elapsedTime * 0.8) * 0.04;
  });
  return <group ref={group} visible={false}><CalendarModel visRef={visRef} /></group>;
}

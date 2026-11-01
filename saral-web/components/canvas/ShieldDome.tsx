"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { LAYOUT, VIS, clamp01, panelGeometry, place, ramp } from "./rig";
import { setOpacity, std, themed, useDisposable } from "./materials";
import { scrollState } from "@/lib/scroll-state";
import type { Quality } from "@/lib/store";

function shieldShape() {
  const s = new THREE.Shape();
  s.moveTo(0, 0.85);
  s.bezierCurveTo(0.2, 0.72, 0.45, 0.66, 0.66, 0.66);
  s.lineTo(0.66, 0.0);
  s.bezierCurveTo(0.66, -0.45, 0.32, -0.72, 0, -0.88);
  s.bezierCurveTo(-0.32, -0.72, -0.66, -0.45, -0.66, 0.0);
  s.lineTo(-0.66, 0.66);
  s.bezierCurveTo(-0.45, 0.66, -0.2, 0.72, 0, 0.85);
  return s;
}

/** Security scene: a matte shield with a lock; a soft dome of particles forms around it. */
export default function ShieldDome({ quality }: { quality: Exclude<Quality, "off"> }) {
  const root = useRef<THREE.Group>(null);
  const dome = useRef<THREE.Points>(null);
  const mats = useDisposable(() => ({
    shield: themed(std({ roughness: 0.45, metalness: 0.08 }), "#0a7f5a", "#2dd4a0", 0.16),
    lock: themed(std({ roughness: 0.55 }), "#ffffff", "#04130d"),
    hole: themed(std({ roughness: 0.6 }), "#0a7f5a", "#2dd4a0"),
    pts: themed(new THREE.PointsMaterial({ size: 0.035, sizeAttenuation: true, depthWrite: false }), "#0a7f5a", "#2dd4a0", 0, 0.8),
  }));
  const geo = useMemo(() => {
    const body = new THREE.ExtrudeGeometry(shieldShape(), { depth: 0.1, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 5, curveSegments: 28 });
    body.center();
    return { body, lock: panelGeometry(0.38, 0.3, 0.06, 0.05, 0.012), shackle: new THREE.TorusGeometry(0.11, 0.028, 12, 28, Math.PI) };
  }, []);
  const points = useMemo(() => {
    const n = quality === "high" ? 650 : 220;
    const pos: number[] = [];
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < n; i++) {
      const y = 1 - (i / (n - 1)) * 2;
      const rad = Math.sqrt(1 - y * y);
      const th = golden * i;
      if (y < -0.35) continue;
      pos.push(Math.cos(th) * rad, y, Math.sin(th) * rad);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    return g;
  }, [quality]);

  useFrame((state) => {
    const r = root.current;
    if (!r) return;
    const s = scrollState.scene;
    const vis = VIS.shield(s);
    r.visible = vis > 0.003;
    if (!r.visible) return;
    place(r, LAYOUT.shield, s, state.viewport, state.size.width < 768, { ry: Math.sin(state.clock.elapsedTime * 0.4) * 0.15 + scrollState.pointerX * 0.1, rx: -scrollState.pointerY * 0.05 });
    setOpacity(mats, vis);
    const local = ramp(clamp01(s - 7), 0.05, 0.6);
    if (dome.current) {
      dome.current.scale.setScalar(0.7 + local * 0.9);
      dome.current.rotation.y = state.clock.elapsedTime * 0.12;
    }
  });

  return (
    <group ref={root} visible={false}>
      <mesh geometry={geo.body} material={mats.shield} />
      <group position={[0, -0.04, 0.11]}>
        <mesh geometry={geo.lock} material={mats.lock} />
        <mesh geometry={geo.shackle} material={mats.lock} position={[0, 0.15, 0]} />
        <mesh material={mats.hole} position={[0, -0.01, 0.05]}><circleGeometry args={[0.04, 24]} /></mesh>
      </group>
      <points ref={dome} geometry={points} material={mats.pts} />
    </group>
  );
}

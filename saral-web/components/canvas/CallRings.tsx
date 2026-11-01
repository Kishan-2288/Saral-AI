"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { LAYOUT, VIS, place, ramp } from "./rig";
import { basic, setOpacity, themed, useDisposable } from "./materials";
import { scrollState } from "@/lib/scroll-state";

/** Problem scene: a quiet "ringing" pulse that settles as you scroll on. */
export default function CallRings() {
  const group = useRef<THREE.Group>(null);
  const rings = useRef<(THREE.Mesh | null)[]>([]);
  const dot = useRef<THREE.Mesh>(null);
  const mats = useDisposable(() => ({
    r0: themed(basic({ side: THREE.DoubleSide, depthWrite: false }), "#7f93a8", "#6b7d99", 0, 0.7),
    r1: themed(basic({ side: THREE.DoubleSide, depthWrite: false }), "#7f93a8", "#6b7d99", 0, 0.7),
    r2: themed(basic({ side: THREE.DoubleSide, depthWrite: false }), "#7f93a8", "#6b7d99", 0, 0.7),
    alert: themed(basic({ depthWrite: false }), "#f59e0b", "#fbbf24", 0, 0.95),
  }));
  const ringMats = [mats.r0, mats.r1, mats.r2];

  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    const s = scrollState.scene;
    const vis = VIS.rings(s);
    g.visible = vis > 0.003;
    if (!g.visible) return;
    place(g, LAYOUT.rings, s, state.viewport, state.size.width < 768);
    setOpacity({ alert: mats.alert }, vis);
    const amp = 1 - ramp(s, 1.35, 1.95) * 0.75; // calms down as the section ends
    const t = state.clock.elapsedTime * 0.45;
    rings.current.forEach((m, i) => {
      if (!m) return;
      const phase = (t + i / 3) % 1;
      m.scale.setScalar(0.35 + phase * 1.5);
      ringMats[i].opacity = (1 - phase) * 0.7 * vis * amp;
    });
    if (dot.current) dot.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 3) * 0.08 * amp);
  });

  return (
    <group ref={group} visible={false}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} ref={(el) => { rings.current[i] = el; }} material={ringMats[i]}>
          <ringGeometry args={[0.9, 0.93, 96]} />
        </mesh>
      ))}
      <mesh ref={dot} material={mats.alert}>
        <circleGeometry args={[0.16, 40]} />
      </mesh>
    </group>
  );
}

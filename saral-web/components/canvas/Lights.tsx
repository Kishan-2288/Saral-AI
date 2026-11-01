"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { applyThemeBlend, themeBlend } from "./materials";
import { useUI } from "@/lib/store";

const lerp = THREE.MathUtils.lerp;

/** Lights + theme bridge. Damped blend (~400 ms) drives material colours, light intensity, env intensity and halo. */
export default function Lights() {
  const amb = useRef<THREE.AmbientLight>(null);
  const key = useRef<THREE.DirectionalLight>(null);
  const rim = useRef<THREE.PointLight>(null);
  const t = useRef(-1);

  useFrame((state, dt) => {
    const target = useUI.getState().resolved === "dark" ? 1 : 0;
    if (t.current < 0) t.current = target;
    t.current = THREE.MathUtils.damp(t.current, target, 9, Math.min(dt, 0.1));
    if (Math.abs(t.current - target) < 0.003) t.current = target;
    const v = t.current;
    themeBlend.t = v;
    applyThemeBlend(v);
    if (amb.current) amb.current.intensity = lerp(1.0, 0.45, v);
    if (key.current) key.current.intensity = lerp(1.8, 1.1, v);
    if (rim.current) rim.current.intensity = lerp(0.8, 3.2, v);
    state.scene.environmentIntensity = lerp(0.9, 0.5, v);
  });

  return (
    <>
      <ambientLight ref={amb} intensity={1} />
      <directionalLight ref={key} position={[2.5, 3.5, 4]} intensity={1.8} />
      <pointLight ref={rim} position={[-3, 1, 2]} intensity={0.8} color="#2dd4a0" distance={14} />
    </>
  );
}

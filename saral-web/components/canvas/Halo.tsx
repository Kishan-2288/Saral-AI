"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { LAYOUT, anyVisible, poseAt, type Pose } from "./rig";
import { themeBlend, themed } from "./materials";
import { makeGlowTexture } from "./phoneTexture";
import { scrollState } from "@/lib/scroll-state";

/** The scene's glow: a soft radial halo behind the active object. Normal blend in light mode, additive in dark. */
export default function Halo() {
  const mesh = useRef<THREE.Mesh>(null);
  const tex = useMemo(() => makeGlowTexture(), []);
  const mat = useMemo(() => themed(new THREE.MeshBasicMaterial({ map: tex, depthWrite: false, toneMapped: false }), "#0a7f5a", "#2dd4a0", 0, 0.16), [tex]);
  const pose = useRef<Pose>({ nx: 0, ny: 0, z: 0, rx: 0, ry: 0, rz: 0, s: 1 });
  const additive = useRef(false);
  useEffect(() => () => { tex.dispose(); mat.dispose(); }, [tex, mat]);

  useFrame((state) => {
    const m = mesh.current;
    if (!m) return;
    const s = scrollState.scene;
    const v = anyVisible(s);
    m.visible = v > 0.003;
    if (!m.visible) return;
    poseAt(LAYOUT.haloX, s, pose.current);
    const h = state.viewport.height;
    m.position.set(pose.current.nx * state.viewport.width * 0.5, 0, -1.8);
    m.scale.setScalar(h * (state.size.width < 768 ? 1.5 : 1.7));
    const t = themeBlend.t;
    mat.opacity = (0.16 + t * 0.2) * v * (1 + Math.sin(state.clock.elapsedTime * 0.8) * 0.06);
    const wantAdd = t > 0.5;
    if (wantAdd !== additive.current) { additive.current = wantAdd; mat.blending = wantAdd ? THREE.AdditiveBlending : THREE.NormalBlending; mat.needsUpdate = true; }
  });

  return (
    <mesh ref={mesh} material={mat} visible={false} renderOrder={-1}>
      <planeGeometry args={[1, 1]} />
    </mesh>
  );
}

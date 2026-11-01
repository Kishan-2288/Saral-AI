"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { LAYOUT, VIS, place, roundedRect, screenGeometry } from "./rig";
import { setOpacity, std, themed, useDisposable } from "./materials";
import { makeChatTexture, redrawChatTexture } from "./phoneTexture";
import { scrollState } from "@/lib/scroll-state";
import { useUI } from "@/lib/store";
import ChatBubbles from "./ChatBubbles";
import type { Quality } from "@/lib/store";

/** Procedural phone: extruded rounded body + canvas-texture screen. No external model needed. */
export default function Phone({ quality }: { quality: Exclude<Quality, "off"> }) {
  const group = useRef<THREE.Group>(null);
  const floater = useRef<THREE.Group>(null);
  const smooth = useRef({ x: 0, y: 0 });

  const mats = useDisposable(() => ({
    body: themed(std({ metalness: 0.5, roughness: 0.4 }), "#cdd5df", "#2b3652"),
    bezel: themed(std({ roughness: 0.5 }), "#0b1020", "#05080f"),
  }));
  const texture = useMemo(() => makeChatTexture(useUI.getState().resolved === "dark"), []);
  const screenMat = useMemo(() => new THREE.MeshBasicMaterial({ map: texture, transparent: true, toneMapped: false }), [texture]);

  const bodyGeo = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(roundedRect(1.02, 2.1, 0.17), { depth: 0.09, bevelEnabled: true, bevelThickness: 0.025, bevelSize: 0.025, bevelSegments: 6, curveSegments: 28 });
    g.center();
    return g;
  }, []);
  const screenGeo = useMemo(() => screenGeometry(0.93, 2.0, 0.13), []);
  const notchGeo = useMemo(() => new THREE.ShapeGeometry(roundedRect(0.28, 0.075, 0.037), 12), []);

  useEffect(() => useUI.subscribe((s, prev) => {
    if (s.resolved !== prev.resolved) redrawChatTexture(texture, s.resolved === "dark");
  }), [texture]);
  useEffect(() => () => { texture.dispose(); screenMat.dispose(); bodyGeo.dispose(); screenGeo.dispose(); notchGeo.dispose(); }, [texture, screenMat, bodyGeo, screenGeo, notchGeo]);

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    const s = scrollState.scene;
    const vis = VIS.phone(s);
    g.visible = vis > 0.003;
    if (!g.visible) return;
    const k = Math.min(1, dt * 3);
    smooth.current.x += (scrollState.pointerX - smooth.current.x) * k;
    smooth.current.y += (scrollState.pointerY - smooth.current.y) * k;
    const t = state.clock.elapsedTime;
    const mobile = state.size.width < 768;
    place(g, LAYOUT.phone, s, state.viewport, mobile, { ry: smooth.current.x * 0.14 + Math.sin(t * 0.5) * 0.04, rx: -smooth.current.y * 0.07 });
    if (floater.current) floater.current.position.y = Math.sin(t * 0.9) * 0.05;
    setOpacity(mats, vis);
    screenMat.opacity = vis;
  });

  return (
    <group ref={group} visible={false}>
      <group ref={floater}>
        <mesh geometry={bodyGeo} material={mats.body} />
        <mesh geometry={screenGeo} material={screenMat} position={[0, 0, 0.0755]} renderOrder={2} />
        <mesh geometry={notchGeo} material={mats.bezel} position={[0, 0.93, 0.077]} renderOrder={3} />
        <ChatBubbles quality={quality} />
      </group>
    </group>
  );
}

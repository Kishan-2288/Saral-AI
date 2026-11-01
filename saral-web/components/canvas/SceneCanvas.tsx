"use client";

import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, Lightformer, PerformanceMonitor } from "@react-three/drei";
import { useUI } from "@/lib/store";
import type { Quality } from "@/lib/store";
import Lights from "./Lights";
import Driver from "./Driver";
import Halo from "./Halo";
import Phone from "./Phone";
import CallRings from "./CallRings";
import StepObjects from "./StepObjects";
import CalendarCard from "./CalendarCard";
import HandoffObjects from "./HandoffObjects";
import ShieldDome from "./ShieldDome";

/** Fixed, decorative, aria-hidden canvas behind the page. All information also exists as real text in the DOM. */
export default function SceneCanvas({ quality }: { quality: Exclude<Quality, "off"> }) {
  const base: [number, number] = quality === "high" ? [1, 1.75] : [1, 1.25];
  const [dpr, setDpr] = useState<[number, number]>(base);
  const setCanvasLive = useUI((s) => s.setCanvasLive);
  useEffect(() => () => setCanvasLive(false), [setCanvasLive]);

  return (
    <div aria-hidden="true" data-canvas className="pointer-events-none fixed inset-0 z-0">
      <Canvas
        flat
        frameloop="demand"
        dpr={dpr}
        camera={{ position: [0, 0, 6], fov: 35, near: 0.1, far: 30 }}
        gl={{ antialias: quality === "high", alpha: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          setCanvasLive(true);
          gl.domElement.addEventListener("webglcontextlost", (e) => { e.preventDefault(); setCanvasLive(false); });
          gl.domElement.addEventListener("webglcontextrestored", () => setCanvasLive(true));
        }}
      >
        {/* Adaptive quality: drop pixel ratio if the frame rate falls, restore when it recovers. */}
        <PerformanceMonitor onDecline={() => setDpr([0.75, 1])} onIncline={() => setDpr(base)} />
        <Lights />
        <Driver />
        <Environment resolution={128} frames={1}>
          <color attach="background" args={["#8f9bab"]} />
          <Lightformer form="rect" intensity={2.4} position={[0, 5, -3]} scale={[10, 4, 1]} />
          <Lightformer form="rect" intensity={1.4} position={[-5, 1, 2]} scale={[3, 5, 1]} />
          <Lightformer form="rect" intensity={1.0} position={[5, 0, 3]} scale={[3, 5, 1]} />
        </Environment>
        <Halo />
        <Phone quality={quality} />
        <CallRings />
        <StepObjects />
        <CalendarCard />
        <HandoffObjects />
        <ShieldDome quality={quality} />
      </Canvas>
    </div>
  );
}

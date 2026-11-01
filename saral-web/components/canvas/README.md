# components/canvas: the 3D layer

Everything here is **client-only, lazy-loaded after first paint, and decorative** (`aria-hidden`). All information
also exists as real text in the DOM.

| File | Role |
|---|---|
| `CanvasHost.tsx` | Decides *whether* and *when* to load 3D (WebGL check, reduced motion, Save-Data, memory/cores, mobile) and picks the quality tier. Dynamic-imports `SceneCanvas`. QA switch: `?3d=off \| low \| force`. |
| `SceneCanvas.tsx` | The fixed `<Canvas>` (on-demand frameloop, adaptive DPR via `PerformanceMonitor`, context-loss handling). |
| `rig.ts` | **The story.** `SCENE` order, visibility windows (`VIS.*`) and per-object keyframes (`LAYOUT`). Edit here to retime or move objects. |
| `Lights.tsx` + `materials.ts` | Theme bridge: one damped light↔dark blend drives every material colour, light intensity, env intensity and the halo. |
| `Driver.tsx` | Renders only while an object is visible or the theme is blending (idle canvas costs ~0 GPU). |
| `Phone`, `ChatBubbles`, `CallRings`, `StepObjects`, `CalendarCard`, `HandoffObjects`, `ShieldDome`, `Halo` | Procedural objects, no model files. |

## Adding or retiming a scene
1. Add the section in `app/[locale]/page.tsx` and keep `SECTION_IDS` and `SCENE` (in `rig.ts`) in the same order.
2. Add a `VIS.yourScene(s)` window and a `LAYOUT.yourScene` entry (`d` = desktop, `m` = mobile, in normalised screen units).
3. Build the object with `useDisposable` + `themed(...)` materials so it follows the theme automatically.

## Swapping in an optimised GLB (e.g. a real phone model)
Procedural objects are placeholders by design. To use a real model:
1. Export from Blender with baked lighting/AO, then compress: `npx gltf-transform optimize in.glb out.glb --compress draco --texture-compress webp` (or `meshopt`; KTX2 for textures).
2. Put it in `public/models/phone.glb` (budget: ≤ 6 MB desktop, ≤ 3 MB mobile in total).
3. In `Phone.tsx`, replace the `<mesh geometry={bodyGeo} …/>` + screen meshes with `const { scene } = useGLTF("/models/phone.glb")` (from `@react-three/drei`) and `<primitive object={scene} />`. Keep the `group` ref and the `place(...)` / opacity code. Call `useGLTF.preload` only inside the lazy chunk, never in a server component.
4. For theme-aware materials, traverse the loaded scene and register them with `themed(mat, lightHex, darkHex)`.
5. Self-host Draco decoders (`useGLTF("/models/phone.glb", "/draco/")`) so the CSP (`connect-src 'self'`) stays strict.

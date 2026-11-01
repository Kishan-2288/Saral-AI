import * as THREE from "three";

/** Section order MUST match the data-scene order in app/[locale]/page.tsx. */
export const SCENE = { hero: 0, problem: 1, how: 2, features: 3, chat: 4, handoff: 5, dashboard: 6, security: 7, useCases: 8, faq: 9, cta: 10 } as const;

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (x: number) => x * x * (3 - 2 * x);
export const ramp = (x: number, a: number, b: number) => smooth(clamp01((x - a) / (b - a)));
/** 0→1 over [a-f, a], stays 1 until b, then 1→0 over [b, b+f]. */
export const win = (x: number, a: number, b: number, f = 0.3) => ramp(x, a - f, a) * (1 - ramp(x, b, b + f));

export const VIS = {
  phone: (s: number) => Math.max(1 - ramp(s, 0.95, 1.4), win(s, 10.05, 12, 0.5)),
  rings: (s: number) => win(s, 1.35, 1.9, 0.3),
  steps: (s: number) => win(s, 2.2, 2.9, 0.3),
  calendar: (s: number) => win(s, 3.3, 3.9, 0.3),
  handoff: (s: number) => win(s, 5.2, 5.85, 0.3),
  shield: (s: number) => win(s, 7.2, 7.85, 0.3),
};
export const anyVisible = (s: number) => Math.max(VIS.phone(s), VIS.rings(s), VIS.steps(s), VIS.calendar(s), VIS.handoff(s), VIS.shield(s));

export interface Pose { nx: number; ny: number; z: number; rx: number; ry: number; rz: number; s: number }
type Key = Partial<Pose> & { at: number };
const BASE: Pose = { nx: 0, ny: 0, z: 0, rx: 0, ry: 0, rz: 0, s: 1 };
const P: (keyof Pose)[] = ["nx", "ny", "z", "rx", "ry", "rz", "s"];

/** Interpolates keyframes (missing props carry forward from the previous key). */
export function poseAt(keys: Key[], x: number, out: Pose): Pose {
  const full: Pose[] = [];
  let prev = { ...BASE };
  for (const k of keys) { prev = { ...prev, ...k }; full.push(prev); }
  if (x <= keys[0].at) return Object.assign(out, full[0]);
  if (x >= keys[keys.length - 1].at) return Object.assign(out, full[full.length - 1]);
  let i = 0;
  while (i < keys.length - 2 && x > keys[i + 1].at) i++;
  const t = smooth((x - keys[i].at) / (keys[i + 1].at - keys[i].at));
  for (const p of P) out[p] = full[i][p] + (full[i + 1][p] - full[i][p]) * t;
  return out;
}

/** Layouts in normalised screen units: nx/ny ∈ [-1, 1] across the viewport. Desktop keeps objects beside the text. */
export const LAYOUT = {
  phone: {
    d: [
      { at: 0, nx: 0.46, ny: -0.02, z: 0, rx: 0.05, ry: -0.5, s: 1.0 },
      { at: 0.8, ry: -0.18, nx: 0.46 },
      { at: 1.4, nx: 0.46, z: -1.5, s: 0.9 },
      { at: 10.0, nx: 0.46, ny: -0.02, z: 0, ry: -0.5, s: 1.0 },
      { at: 10.9, ry: -0.1 },
    ] as Key[],
    m: [
      { at: 0, nx: 0, ny: -0.52, z: 0, rx: 0.05, ry: -0.35, s: 0.6 },
      { at: 0.8, ry: -0.1 },
      { at: 1.4, z: -1.5, s: 0.5 },
      { at: 10.0, nx: 0, ny: -0.52, z: 0, ry: -0.3, s: 0.6 },
      { at: 10.9, ry: -0.08 },
    ] as Key[],
  },
  rings: { d: [{ at: 0, nx: 0.46, ny: 0, z: -0.3, s: 1.15 }] as Key[], m: [{ at: 0, nx: 0, ny: -0.5, z: -0.3, s: 0.62 }] as Key[] },
  steps: { d: [{ at: 0, nx: 0.46, ny: 0, z: 0, s: 1.1 }] as Key[], m: [{ at: 0, nx: 0, ny: -0.5, z: 0, s: 0.6 }] as Key[] },
  calendar: { d: [{ at: 0, nx: -0.46, ny: 0, z: 0, s: 1.05 }] as Key[], m: [{ at: 0, nx: 0, ny: -0.5, z: 0, s: 0.56 }] as Key[] },
  handoff: { d: [{ at: 0, nx: 0.44, ny: 0, z: 0, s: 0.74 }] as Key[], m: [{ at: 0, nx: 0, ny: -0.52, z: 0, s: 0.42 }] as Key[] },
  shield: { d: [{ at: 0, nx: -0.44, ny: 0, z: 0, s: 0.78 }] as Key[], m: [{ at: 0, nx: 0, ny: -0.5, z: 0, s: 0.56 }] as Key[] },
  haloX: [
    { at: 0, nx: 0.46 }, { at: 2.95, nx: 0.46 }, { at: 3.05, nx: -0.46 }, { at: 4.95, nx: -0.46 },
    { at: 5.05, nx: 0.44 }, { at: 6.95, nx: 0.44 }, { at: 7.05, nx: -0.46 }, { at: 9.95, nx: -0.46 }, { at: 10.05, nx: 0.46 },
  ] as Key[],
};

const tmpPose: Pose = { ...BASE };
export function place(group: THREE.Object3D, keys: { d: Key[]; m: Key[] }, s: number, viewport: { width: number; height: number }, mobile: boolean, extra?: Partial<Pose>) {
  const pose = poseAt(mobile ? keys.m : keys.d, s, tmpPose);
  group.position.set(pose.nx * viewport.width * 0.5, pose.ny * viewport.height * 0.5, pose.z);
  group.rotation.set(pose.rx + (extra?.rx ?? 0), pose.ry + (extra?.ry ?? 0), pose.rz + (extra?.rz ?? 0));
  group.scale.setScalar(pose.s * (extra?.s ?? 1));
}

/** Rounded rectangle outline, centred on the origin. */
export function roundedRect(w: number, h: number, r: number) {
  const s = new THREE.Shape();
  const x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
  s.lineTo(x + w, y + h - r);
  s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false);
  s.lineTo(x + r, y + h);
  s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false);
  s.lineTo(x, y + r);
  s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);
  return s;
}

export function panelGeometry(w: number, h: number, r: number, depth = 0.04, bevel = 0.014) {
  const g = new THREE.ExtrudeGeometry(roundedRect(w, h, r), { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 3, curveSegments: 14 });
  g.center();
  return g;
}

/** ShapeGeometry with 0..1 UVs so a canvas texture maps onto the rounded screen. */
export function screenGeometry(w: number, h: number, r: number) {
  const g = new THREE.ShapeGeometry(roundedRect(w, h, r), 20);
  const pos = g.attributes.position;
  const uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) { uv[i * 2] = (pos.getX(i) + w / 2) / w; uv[i * 2 + 1] = (pos.getY(i) + h / 2) / h; }
  g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  return g;
}

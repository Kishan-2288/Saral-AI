import * as THREE from "three";

const W = 512, H = 1112;
const FONT = "ui-sans-serif, system-ui, sans-serif";

function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const words = text.split(" "); const lines: string[] = []; let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

function bubble(ctx: CanvasRenderingContext2D, y: number, text: string, side: "l" | "r", fill: string, color: string, pills?: string[]) {
  ctx.font = `600 27px ${FONT}`;
  const maxW = 290; const lines = wrap(ctx, text, maxW);
  const tw = Math.min(maxW, Math.max(...lines.map((l) => ctx.measureText(l).width)));
  const w = tw + 44; const lh = 36; let h = lines.length * lh + 32;
  if (pills) h += 58;
  const bx = side === "r" ? W - 36 - w : 36;
  ctx.fillStyle = fill; ctx.beginPath(); ctx.roundRect(bx, y, w, h, 26); ctx.fill();
  ctx.fillStyle = color; ctx.textBaseline = "top";
  lines.forEach((l, i) => ctx.fillText(l, bx + 22, y + 16 + i * lh));
  if (pills) {
    let px = bx + 22; const py = y + 16 + lines.length * lh + 6;
    ctx.font = `600 23px ${FONT}`;
    for (const label of pills) {
      const pw = ctx.measureText(label).width + 28;
      ctx.strokeStyle = color; ctx.globalAlpha = 0.5; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(px, py, pw, 40, 20); ctx.stroke(); ctx.globalAlpha = 1;
      ctx.fillText(label, px + 14, py + 8); px += pw + 10;
    }
  }
  return y + h + 22;
}

export function drawChat(canvas: HTMLCanvasElement, dark: boolean) {
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const teal = dark ? "#2dd4a0" : "#0a7f5a";
  ctx.fillStyle = dark ? "#0d1524" : "#eef3f1"; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = dark ? "#121a2b" : "#ffffff"; ctx.fillRect(0, 0, W, 150);
  ctx.fillStyle = dark ? "#243049" : "#dbe3ea"; ctx.fillRect(0, 149, W, 2);
  ctx.fillStyle = teal; ctx.beginPath(); ctx.arc(70, 92, 28, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = dark ? "#04130d" : "#ffffff"; ctx.beginPath(); ctx.roundRect(56, 80, 28, 20, 6); ctx.fill();
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = dark ? "#f1f5f9" : "#0f172a"; ctx.font = `700 29px ${FONT}`; ctx.fillText("Demo Clinic", 118, 90);
  ctx.fillStyle = dark ? "#94a3b8" : "#475569"; ctx.font = `500 22px ${FONT}`; ctx.fillText("AI assistant", 118, 120);
  const userFill = teal, userText = dark ? "#04130d" : "#ffffff";
  const botFill = dark ? "#1e2742" : "#ffffff", botText = dark ? "#f1f5f9" : "#0f172a";
  let y = 190;
  y = bubble(ctx, y, "Can I book Dr. Sharma tomorrow evening?", "r", userFill, userText);
  y = bubble(ctx, y, "Dr. Sharma has these slots tomorrow:", "l", botFill, botText, ["5:30 PM", "6:15 PM"]);
  y = bubble(ctx, y, "5:30 PM", "r", userFill, userText);
  bubble(ctx, y, "Booked. Dr. Sharma, tomorrow at 5:30 PM. I’ll remind you before the visit.", "l", botFill, botText);
  ctx.fillStyle = dark ? "#121a2b" : "#ffffff"; ctx.fillRect(0, H - 120, W, 120);
  ctx.fillStyle = dark ? "#1e2742" : "#eef3f7"; ctx.beginPath(); ctx.roundRect(28, H - 92, W - 150, 62, 31); ctx.fill();
  ctx.fillStyle = teal; ctx.beginPath(); ctx.arc(W - 62, H - 61, 31, 0, Math.PI * 2); ctx.fill();
}

export function makeChatTexture(dark: boolean): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  drawChat(canvas, dark);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

export function redrawChatTexture(tex: THREE.CanvasTexture, dark: boolean) {
  drawChat(tex.image as HTMLCanvasElement, dark);
  tex.needsUpdate = true;
}

export function makeGlowTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas"); c.width = c.height = 256;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(0.35, "rgba(255,255,255,0.35)"); g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 256);
  // Dither: removes the visible banding rings of an 8-bit radial gradient at low opacity.
  const img = ctx.getImageData(0, 0, 256, 256);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 6;
    img.data[i + 3] = Math.max(0, Math.min(255, img.data[i + 3] + n));
  }
  ctx.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

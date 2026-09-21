import { useEffect, useRef } from 'react';

const FRAME_COUNT = 300;
const phases = [
  { until: 0.22, label: 'MESSAGE RECEIVED' },
  { until: 0.46, label: 'UNDERSTANDING INTENT' },
  { until: 0.74, label: 'WORKFLOW EXECUTING' },
  { until: 1, label: 'BOOKING CONFIRMED' },
];
const framePath = (frame: number) => `/frames/ezgif-frame-${String(frame).padStart(3, '0')}.jpg`;

export function FrameSequence() {
  const trackRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d', { alpha: false });
    if (!track || !canvas || !context) return;
    const frames = Array.from<HTMLImageElement | undefined>({ length: FRAME_COUNT });
    let paintedFrame = -1;
    let raf = 0;
    let lastLabel = '';
    const progress = () => Math.min(1, Math.max(0, -track.getBoundingClientRect().top / Math.max(1, track.offsetHeight - window.innerHeight)));
    const load = (index: number) => {
      if (index < 0 || index >= FRAME_COUNT || frames[index]) return;
      const image = new Image();
      image.decoding = 'async';
      image.src = framePath(index + 1);
      image.addEventListener('load', schedule, { once: true });
      frames[index] = image;
    };
    const prime = (target: number) => {
      for (let index = Math.max(0, target - 4); index <= Math.min(FRAME_COUNT - 1, target + 18); index += 1) load(index);
    };
    const draw = (index: number) => {
      const image = frames[index];
      if (!image?.complete || !image.naturalWidth) return;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const bounds = canvas.getBoundingClientRect();
      const width = Math.round(bounds.width * ratio);
      const height = Math.round(bounds.height * ratio);
      if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
      const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
      const drawWidth = image.naturalWidth * scale;
      const drawHeight = image.naturalHeight * scale;
      context.fillStyle = '#000';
      context.fillRect(0, 0, width, height);
      context.drawImage(image, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);
      paintedFrame = index;
    };
    const render = () => {
      raf = 0;
      const current = progress();
      const target = Math.round(current * (FRAME_COUNT - 1));
      prime(target);
      if (target !== paintedFrame) draw(target);
      const label = phases.find((phase) => current <= phase.until)?.label ?? phases[phases.length - 1].label;
      if (labelRef.current && label !== lastLabel) { labelRef.current.textContent = label; lastLabel = label; }
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${current})`;
    };
    function schedule() { if (!raf) raf = window.requestAnimationFrame(render); }
    for (let index = 0; index < 14; index += 1) load(index);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', () => { paintedFrame = -1; schedule(); }, { passive: true });
    schedule();
    return () => { window.cancelAnimationFrame(raf); window.removeEventListener('scroll', schedule); };
  }, []);

  return (
    <section ref={trackRef} aria-label="Message to confirmation scroll story" className="frame-sequence relative bg-white py-8 md:py-12" style={{ height: '220vh' }}>
      <div className="sticky top-24 mx-auto h-[62vh] min-h-[380px] max-h-[680px] w-[calc(100%-2rem)] max-w-7xl overflow-hidden rounded-2xl border border-neutral-200 bg-black shadow-sm md:w-[calc(100%-6rem)]">
        <canvas ref={canvasRef} aria-hidden="true" className="block h-full w-full" />
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between p-6 text-white sm:p-10">
          <span ref={labelRef} className="rounded-full border border-white/20 bg-black/25 px-3 py-1.5 text-[10px] font-semibold tracking-[0.16em] backdrop-blur-sm">MESSAGE RECEIVED</span>
          <span className="hidden text-[10px] font-mono tracking-widest text-white/55 sm:block">SARAL AI / LIVE WORKFLOW</span>
        </div>
        <div className="absolute inset-x-6 bottom-7 h-px bg-white/20 sm:inset-x-10 sm:bottom-10"><div ref={progressRef} className="h-full origin-left bg-white" /></div>
      </div>
    </section>
  );
}

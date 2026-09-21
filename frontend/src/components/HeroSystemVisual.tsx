import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { prefersReducedMotion } from '../animations/motion';

const nodes = ['MESSAGE', 'INTENT', 'WORKFLOW', 'DATABASE', 'CONFIRMED'];

export function HeroSystemVisual() {
  const visualRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (!visualRef.current || prefersReducedMotion()) return;
    const context = gsap.context(() => {
      gsap.fromTo('[data-system-node]', { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.1, ease: 'power3.out', delay: 0.35 });
      gsap.to('[data-system-packet]', { x: 188, duration: 3.6, ease: 'none', repeat: -1, repeatDelay: 0.7 });
    }, visualRef);
    return () => context.revert();
  }, []);
  return (
    <div ref={visualRef} aria-label="Saral AI automation workflow" className="relative mx-auto w-full max-w-xl rounded-[28px] border border-neutral-200 bg-neutral-50/70 p-5 shadow-[0_24px_80px_rgba(10,10,10,0.08)] sm:p-7">
      <div className="mb-7 flex items-center justify-between text-[10px] font-mono tracking-widest text-neutral-400"><span>LIVE AUTOMATION</span><span className="flex items-center gap-1.5 text-emerald-700"><i className="h-1.5 w-1.5 rounded-full bg-emerald-500" />ACTIVE</span></div>
      <div className="relative grid grid-cols-5 gap-2"><div className="absolute left-[9%] right-[9%] top-5 h-px bg-neutral-300" /><i data-system-packet className="absolute left-[9%] top-[17px] z-10 h-2.5 w-2.5 rounded-full bg-neutral-950 shadow-[0_0_0_4px_rgba(255,255,255,0.9)]" />
        {nodes.map((node, index) => <div data-system-node key={node} className="relative z-10 flex min-w-0 flex-col items-center gap-3 text-center"><div className={`flex h-10 w-10 items-center justify-center rounded-xl border text-[11px] font-bold ${index === 4 ? 'border-neutral-950 bg-neutral-950 text-white' : 'border-neutral-200 bg-white text-neutral-900'}`}>{String(index + 1).padStart(2, '0')}</div><span className="text-[8px] font-semibold tracking-wide text-neutral-500 sm:text-[9px]">{node}</span></div>)}</div>
      <div data-system-node className="mt-8 rounded-2xl border border-neutral-200 bg-white p-4"><div className="flex items-center justify-between text-xs"><span className="font-medium text-neutral-900">Patient · WhatsApp</span><span className="font-mono text-[10px] text-emerald-700">VERIFIED</span></div><p className="mt-2 text-sm text-neutral-700">“Book Dr. Sharma tomorrow.”</p><div className="mt-3 flex items-center justify-between border-t border-neutral-100 pt-3 text-[11px] text-neutral-500"><span>Cardiology · 5:30 PM</span><span className="font-semibold text-neutral-900">CONFIRMED</span></div></div>
    </div>
  );
}

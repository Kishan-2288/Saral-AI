import { useLayoutEffect, type RefObject } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function usePageMotion(scope: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    if (!scope.current) return;

    const cleanupListeners: Array<() => void> = [];
    const context = gsap.context(() => {
      const root = scope.current!;
      if (prefersReducedMotion()) {
        gsap.set(root.querySelectorAll('[data-reveal-section], .motion-mask'), { autoAlpha: 1, y: 0, clearProps: 'transform' });
        return;
      }

      (Array.from(root.querySelectorAll('[data-reveal-section]')) as HTMLElement[]).forEach((section) => {
        const eyebrow = section.querySelector('.motion-eyebrow') as HTMLElement | null;
        const title = section.querySelector('.motion-title') as HTMLElement | null;
        const copy = section.querySelector('.motion-copy') as HTMLElement | null;
        const content = section.querySelector('.motion-content') as HTMLElement | null;
        const targets = [eyebrow, title, copy, content].filter(Boolean) as HTMLElement[];

        if (!targets.length) return;
        gsap.fromTo(targets, { autoAlpha: 0, y: 34 }, {
          autoAlpha: 1,
          y: 0,
          duration: 0.82,
          ease: 'power3.out',
          stagger: 0.11,
          scrollTrigger: { trigger: section, start: 'top 82%', once: true },
        });
      });

      (Array.from(root.querySelectorAll('[data-motion-cards]')) as HTMLElement[]).forEach((group) => {
        const cards = Array.from(group.children) as HTMLElement[];
        if (!cards.length) return;
        gsap.fromTo(cards, { autoAlpha: 0, y: 24 }, {
          autoAlpha: 1,
          y: 0,
          duration: 0.68,
          ease: 'power3.out',
          stagger: 0.09,
          scrollTrigger: { trigger: group, start: 'top 84%', once: true },
        });
      });

      (Array.from(root.querySelectorAll('.motion-mask')) as HTMLElement[]).forEach((heading) => {
        gsap.fromTo(heading, { yPercent: 112, clipPath: 'inset(0 0 100% 0)' }, {
          yPercent: 0,
          clipPath: 'inset(0 0 0% 0)',
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: { trigger: heading, start: 'top 82%', once: true },
        });
      });

      (Array.from(root.querySelectorAll('[data-flow-diagram]')) as HTMLElement[]).forEach((diagram) => {
        const nodes = Array.from(diagram.querySelectorAll('[data-flow-node]')) as HTMLElement[];
        const lines = Array.from(diagram.querySelectorAll('[data-flow-line]')) as HTMLElement[];
        const timeline = gsap.timeline({ scrollTrigger: { trigger: diagram, start: 'top 76%', once: true } });
        timeline.fromTo(nodes, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.48, stagger: 0.12, ease: 'power3.out' })
          .fromTo(lines, { scaleY: 0, transformOrigin: 'top center' }, { scaleY: 1, duration: 0.36, stagger: 0.08, ease: 'power2.out' }, '<0.08');
      });

      (Array.from(root.querySelectorAll('[data-timeline]')) as HTMLElement[]).forEach((timeline) => {
        const line = timeline.querySelector('[data-timeline-line]') as HTMLElement | null;
        const steps = Array.from(timeline.querySelectorAll('[data-timeline-step]')) as HTMLElement[];
        const animation = gsap.timeline({ scrollTrigger: { trigger: timeline, start: 'top 78%', once: true } });
        if (line) animation.fromTo(line, { scaleX: 0, transformOrigin: 'left center' }, { scaleX: 1, duration: 0.8, ease: 'power2.out' });
        animation.fromTo(steps, { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, stagger: 0.16, duration: 0.65, ease: 'power3.out' }, line ? '-=0.35' : 0);
      });

      (Array.from(root.querySelectorAll('[data-dashboard]')) as HTMLElement[]).forEach((dashboard) => {
        const entries = Array.from(dashboard.querySelectorAll('[data-dashboard-entry]')) as HTMLElement[];
        gsap.fromTo(entries, { autoAlpha: 0, y: 14 }, {
          autoAlpha: 1, y: 0, duration: 0.52, stagger: 0.07, ease: 'power3.out',
          scrollTrigger: { trigger: dashboard, start: 'top 80%', once: true },
        });
      });

      (Array.from(root.querySelectorAll('[data-magnetic]')) as HTMLElement[]).forEach((button) => {
        const media = window.matchMedia('(pointer: fine)');
        if (!media.matches) return;
        const move = (event: MouseEvent) => {
          const rect = button.getBoundingClientRect();
          gsap.to(button, { x: (event.clientX - rect.left - rect.width / 2) * 0.1, y: (event.clientY - rect.top - rect.height / 2) * 0.1, scale: 1.02, duration: 0.25, ease: 'power3.out', overwrite: true });
        };
        const leave = () => gsap.to(button, { x: 0, y: 0, scale: 1, duration: 0.45, ease: 'power3.out', overwrite: true });
        button.addEventListener('mousemove', move);
        button.addEventListener('mouseleave', leave);
        cleanupListeners.push(() => {
          button.removeEventListener('mousemove', move);
          button.removeEventListener('mouseleave', leave);
        });
      });
    }, scope);

    return () => {
      cleanupListeners.forEach((cleanup) => cleanup());
      context.revert();
    };
  }, [scope]);
}

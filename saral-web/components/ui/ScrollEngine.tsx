"use client";

import { useEffect } from "react";
import { useUI } from "@/lib/store";
import { scrollState } from "@/lib/scroll-state";

/**
 * Enhancement layer (loaded after first paint): Lenis smooth scroll + GSAP ScrollTrigger scene tracking.
 * Skipped entirely for prefers-reduced-motion and when the visitor paused animation; the page is then plain native scroll.
 * Also: pointer parallax input, "How it works" step highlighting, scroll progress variable, reveal-on-view.
 */
export default function ScrollEngine() {
  const paused = useUI((s) => s.motionPaused);

  // Reveal-on-view (one quiet fade). Content is visible by default without JS (see globals.css).
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || paused || !("IntersectionObserver" in window)) { els.forEach((e) => e.classList.add("is-in")); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [paused]);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || paused) return;

    let disposed = false;
    let cleanup: () => void = () => {};

    (async () => {
      const [{ gsap }, { ScrollTrigger }, { default: Lenis }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger"), import("lenis")]);
      if (disposed) return;
      gsap.registerPlugin(ScrollTrigger);

      const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
      lenis.on("scroll", ScrollTrigger.update);
      let lastY = -1;
      let update: () => void = () => {};
      // Poll scrollY once per frame instead of trusting a single event source: keyboard, scrollbar drag,
      // anchor jumps and programmatic scrolls all keep the 3D scene in sync.
      const tick = (time: number) => {
        lenis.raf(time * 1000);
        if (Math.abs(window.scrollY - lastY) > 0.5) { lastY = window.scrollY; update(); }
      };
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);

      const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-scene]"));
      const stepsBox = document.querySelector<HTMLElement>("[data-steps]");
      const stepEls = Array.from(document.querySelectorAll<HTMLElement>("[data-step]"));
      scrollState.sceneCount = sections.length || scrollState.sceneCount;
      const root = document.documentElement;
      // QA hook: only when the ?3d= switch is present
      if (new URLSearchParams(window.location.search).has("3d")) (window as unknown as { __scroll?: typeof scrollState }).__scroll = scrollState;

      update = () => {
        const vh = window.innerHeight;
        const center = vh * 0.5;
        let idx = 0; let local = 0;
        for (let i = 0; i < sections.length; i++) {
          const r = sections[i].getBoundingClientRect();
          if (r.top <= center) { idx = i; local = Math.min(1, Math.max(0, (center - r.top) / Math.max(1, r.height))); }
        }
        scrollState.scene = idx + local;
        const max = document.documentElement.scrollHeight - vh;
        scrollState.progress = max > 0 ? Math.min(1, window.scrollY / max) : 0;
        root.style.setProperty("--scroll-progress", scrollState.progress.toFixed(4));
        if (stepsBox) {
          const r = stepsBox.getBoundingClientRect();
          scrollState.stage = Math.min(4, Math.max(0, ((center - r.top) / Math.max(1, r.height)) * 4));
          stepEls.forEach((el, i) => el.setAttribute("data-active", String(Math.floor(Math.min(3.999, scrollState.stage)) === i)));
        }
      };

      const trigger = ScrollTrigger.create({ start: 0, end: "max", onUpdate: () => update(), onRefresh: () => update() });
      update();
      const onResize = () => update();
      window.addEventListener("resize", onResize);

      // Hero copy eases away as the story begins (scrubbed, subtle).
      const heroCopy = document.querySelector<HTMLElement>("[data-hero-copy]");
      const heroSection = document.querySelector<HTMLElement>("#hero");
      let heroTween: gsap.core.Tween | undefined;
      if (heroCopy && heroSection) {
        heroTween = gsap.to(heroCopy, { y: -36, opacity: 0.0, ease: "none", scrollTrigger: { trigger: heroSection, start: "55% top", end: "bottom 30%", scrub: true } });
      }

      const onPointer = (e: PointerEvent) => {
        if (e.pointerType === "touch") return;
        scrollState.pointerX = (e.clientX / window.innerWidth) * 2 - 1;
        scrollState.pointerY = (e.clientY / window.innerHeight) * 2 - 1;
      };
      window.addEventListener("pointermove", onPointer, { passive: true });

      const onClick = (e: MouseEvent) => {
        const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
        if (!a || a.getAttribute("href") === "#") return;
        const el = document.querySelector(a.getAttribute("href") as string);
        if (!el) return;
        e.preventDefault();
        lenis.scrollTo(el as HTMLElement, { offset: -72 });
        (el as HTMLElement).setAttribute("tabindex", "-1");
        (el as HTMLElement).focus({ preventScroll: true });
      };
      document.addEventListener("click", onClick);

      const onLoad = () => ScrollTrigger.refresh();
      window.addEventListener("load", onLoad);

      cleanup = () => {
        window.removeEventListener("pointermove", onPointer);
        window.removeEventListener("load", onLoad);
        window.removeEventListener("resize", onResize);
        document.removeEventListener("click", onClick);
        heroTween?.scrollTrigger?.kill(); heroTween?.kill();
        trigger.kill();
        gsap.ticker.remove(tick);
        lenis.destroy();
        gsap.set(heroCopy ?? [], { clearProps: "all" });
        stepEls.forEach((el) => el.removeAttribute("data-active"));
        scrollState.scene = 0; scrollState.stage = 0;
      };
    })();

    return () => { disposed = true; cleanup(); };
  }, [paused]);

  return null;
}

import React, { useLayoutEffect, useRef } from 'react';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { gsap } from 'gsap';
import { prefersReducedMotion } from '../animations/motion';
import { HeroSystemVisual } from './HeroSystemVisual';

interface HeroProps {
  onOpenDemo: () => void;
  onExploreScroll: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenDemo, onExploreScroll }) => {
  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    if (!sectionRef.current || prefersReducedMotion()) return;
    const context = gsap.context(() => {
      const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } });
      timeline
        .fromTo('[data-hero-eyebrow]', { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.45 })
        .fromTo('[data-hero-line]', { autoAlpha: 0, y: 44 }, { autoAlpha: 1, y: 0, duration: 0.76, stagger: 0.1 }, '-=0.12')
        .fromTo('[data-hero-copy]', { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.58 }, '-=0.34')
        .fromTo('[data-hero-actions]', { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.48 }, '-=0.26');
    }, sectionRef);
    return () => context.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="home"
      className="relative pt-28 md:pt-36 pb-16 md:pb-24 overflow-hidden bg-white"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7">
        {/* Subtle status eyebrow */}
        <div data-hero-eyebrow className="flex items-center space-x-2.5 mb-8 md:mb-10">
          <span className="w-1.5 h-1.5 rounded-full bg-neutral-900 inline-block"></span>
          <span className="text-xs md:text-[13px] font-semibold tracking-[0.2em] text-neutral-500 uppercase">
            AI AUTOMATION FOR MODERN BUSINESSES
          </span>
        </div>

        {/* Hero Headlines */}
        <div className="max-w-5xl">
          <h1 id="hero-main-title" data-hero-line className="text-neutral-950 font-display mb-1">
            Automate Your Work.
          </h1>
          <h1 id="hero-sub-title" data-hero-line className="text-neutral-400 font-display mb-8 md:mb-10">
            Grow Your Business.
          </h1>

          <p
            id="hero-supporting-copy" data-hero-copy
            className="text-[17px] text-neutral-600 font-normal leading-[1.65] max-w-[600px] tracking-normal mb-10 md:mb-12"
          >
            Saral AI helps businesses automate repetitive communication and workflows using AI. From lead generation to customer support, appointments, payments and follow-ups — we connect AI with the systems your business already uses.
          </p>

          {/* Action CTAs */}
          <div data-hero-actions className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <button
              id="hero-book-demo-cta"
              data-magnetic
              onClick={onOpenDemo}
              className="inline-flex items-center justify-center space-x-2.5 px-7 py-3.5 bg-neutral-950 hover:bg-black text-white text-[15px] font-semibold rounded-full transition-all duration-200 shadow-xs cursor-pointer group"
            >
              <span>Book a Demo</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              id="hero-how-it-works-cta"
              onClick={onExploreScroll}
              className="inline-flex items-center justify-center space-x-2 px-6 py-3.5 bg-neutral-50 hover:bg-neutral-100 text-neutral-800 text-[15px] font-medium rounded-full border border-neutral-200/80 transition-all duration-200 cursor-pointer group"
            >
              <span>Explore Solutions</span>
              <ChevronDown className="w-4 h-4 text-neutral-500 transition-transform group-hover:translate-y-0.5" />
            </button>
          </div>
        </div>
        </div>
        <div data-hero-copy className="lg:col-span-5"><HeroSystemVisual /></div>
      </div>
    </section>
  );
};

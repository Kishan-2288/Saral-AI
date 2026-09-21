import React from 'react';
import { ArrowRight } from 'lucide-react';

interface FinalCTAProps {
  onOpenDemo: () => void;
}

export const FinalCTA: React.FC<FinalCTAProps> = ({ onOpenDemo }) => {
  return (
    <section id="contact" data-reveal-section className="py-36 md:py-52 bg-white text-center">
      <div className="max-w-4xl mx-auto px-6 md:px-12">
        {/* Centered Heading */}
        <h2 className="motion-title motion-mask text-4xl sm:text-6xl md:text-7xl font-extrabold text-neutral-950 tracking-[-0.035em] leading-[1.05] font-display">
          What should your business stop doing manually?
        </h2>

        {/* Supporting Line */}
        {/* Primary CTA Button */}
        <div className="motion-content mt-10">
          <button
            onClick={onOpenDemo}
            data-magnetic
            className="inline-flex items-center space-x-2.5 px-8 py-4 bg-neutral-950 hover:bg-black text-white text-base font-medium rounded-full transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer group"
          >
            <span>Book a Demo</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* Brand Stamp Below */}
        <div className="mt-20 pt-10 border-t border-neutral-100 flex flex-col items-center">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded bg-neutral-950 text-white flex items-center justify-center font-mono text-[10px] font-bold">
              S
            </div>
            <span className="text-lg font-bold text-neutral-950 tracking-tight font-display">Saral AI</span>
          </div>
          <p className="text-xs text-neutral-400 mt-1 font-mono">
            AI automation for modern businesses.
          </p>
        </div>
      </div>
    </section>
  );
};

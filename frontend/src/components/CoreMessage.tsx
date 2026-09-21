import React from 'react';
import { ArrowRight } from 'lucide-react';

export const CoreMessage: React.FC = () => {
  return (
    <section
      id="core-message-section"
      data-reveal-section className="py-24 md:py-36 bg-white border-b border-neutral-100"
    >
      <div className="max-w-6xl mx-auto px-6 md:px-12 text-center">
        {/* Large Statement */}
        <h2 className="motion-title motion-mask text-4xl sm:text-5xl md:text-7xl font-extrabold text-neutral-950 tracking-[-0.035em] leading-[1.05] font-display max-w-4xl mx-auto">
          Understand. Automate. Act.
        </h2>

        {/* Small Supporting Text */}
        <p className="motion-copy mt-6 md:mt-8 text-lg sm:text-xl md:text-2xl text-neutral-500 font-normal max-w-2xl mx-auto leading-relaxed tracking-tight">
          A message becomes a completed workflow.
        </p>

        {/* Single Visual Line: Conversation → Intelligence → Automation → Action */}
        <div className="motion-content mt-14 md:mt-20 inline-flex flex-wrap items-center justify-center gap-3 sm:gap-6 py-3.5 px-6 sm:px-10 rounded-full border border-neutral-200/90 bg-neutral-50/60 shadow-xs">
          <span className="text-xs sm:text-sm font-semibold tracking-wide text-neutral-900">
            Conversation
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
          
          <span className="text-xs sm:text-sm font-semibold tracking-wide text-neutral-900">
            Understanding
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
          
          <span className="text-xs sm:text-sm font-semibold tracking-wide text-neutral-900">
            Workflow
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
          
          <span className="text-xs sm:text-sm font-semibold tracking-wide text-neutral-950">
            Outcome
          </span>
        </div>
      </div>
    </section>
  );
};

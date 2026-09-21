import React from 'react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      number: '01',
      title: 'Understand',
      desc: 'AI understands the patient’s request.',
      detail: 'Message becomes clear intent.',
    },
    {
      number: '02',
      title: 'Automate',
      desc: 'Workflows execute the required business logic.',
      detail: 'Logic checks the right system.',
    },
    {
      number: '03',
      title: 'Act',
      desc: 'The patient receives a verified result.',
      detail: 'The result is confirmed and recorded.',
    },
  ];

  return (
    <section data-reveal-section className="py-24 md:py-36 bg-white border-b border-neutral-100">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Section Heading */}
        <div className="max-w-2xl mb-16 md:mb-24">
          <span className="motion-eyebrow text-xs font-semibold tracking-widest text-neutral-400 uppercase font-mono">
            PROCESS SIMPLICITY
          </span>
          <h2 className="motion-title motion-mask text-4xl sm:text-5xl md:text-6xl font-bold text-neutral-950 tracking-[-0.035em] font-display mt-2">
            How Saral AI works.
          </h2>
          <p className="motion-copy text-base sm:text-lg text-neutral-500 mt-3">
            Three steps. One verified outcome.
          </p>
        </div>

        {/* 3-Stage Layout with continuous connecting line */}
        <div data-timeline className="motion-content relative">
          {/* Continuous connecting horizontal line on desktop */}
          <div data-timeline-line className="hidden md:block absolute top-7 left-12 right-12 h-px bg-neutral-200 z-0"></div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative z-10">
            {steps.map((step) => (
              <div data-timeline-step key={step.number} className="bg-white pt-2 space-y-4">
                {/* Number node */}
                <div className="w-14 h-14 rounded-2xl bg-neutral-950 text-white font-medium text-[14px] flex items-center justify-center shadow-xs border border-neutral-900">
                  {step.number}
                </div>

                <div>
                  <h3 className="text-[24px] font-semibold text-neutral-950 font-display">
                    {step.title}
                  </h3>
                  <p className="text-[16px] font-normal text-neutral-800 mt-1 leading-[1.7]">
                    {step.desc}
                  </p>
                  <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                    {step.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

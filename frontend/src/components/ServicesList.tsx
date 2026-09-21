import React, { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';

interface ServiceRow {
  number: string;
  name: string;
  statusTag?: string;
  oneLiner: string;
  expandedDetails: string;
}

const services: ServiceRow[] = [
  {
    number: '01',
    name: 'Appointment Automation',
    statusTag: 'Live Engine',
    oneLiner: 'Patient → availability → confirmed.',
    expandedDetails: 'Patients request preferred doctors, departments, dates, and times. The assistant queries available slots in Supabase and confirms reservations instantly.',
  },
  {
    number: '02',
    name: 'AI Reception',
    statusTag: 'Live Engine',
    oneLiner: 'Answers routine patient questions.',
    expandedDetails: 'Patients check their scheduled appointments, doctor names, and clinic locations without having to place a phone call to busy reception desks.',
  },
  {
    number: '03',
    name: 'Self-serve Changes',
    statusTag: 'Live Engine',
    oneLiner: 'Reschedule or cancel without a call.',
    expandedDetails: 'Seamlessly updates existing rows in Supabase, freeing up vacated slots for other patients and dispatching revised schedule confirmations.',
  },
  {
    number: '04',
    name: 'Human Escalation',
    statusTag: 'Live Engine',
    oneLiner: 'The right request reaches the right person.',
    expandedDetails: 'Answers routine questions on clinic timings, doctor availability, and visiting hours. When a query exceeds known FAQs or requires clinical advice, it routes to staff.',
  },
  {
    number: '05',
    name: 'Voice Automation',
    statusTag: 'Live Engine',
    oneLiner: 'Speak naturally. The workflow listens.',
    expandedDetails: 'Ingests voice notes sent on WhatsApp, transcribes speech, and runs the appropriate booking or rescheduling workflow. Gracefully falls back to text if audio is unclear.',
  },
  {
    number: '06',
    name: 'System Integration',
    statusTag: 'Live Engine',
    oneLiner: 'Verified logic across your systems.',
    expandedDetails: 'Every appointment action is executed via tested n8n state machines connecting directly to Supabase PostgreSQL, ensuring zero hallucinations and an auditable event trail.',
  },
];

interface ServicesListProps {
  onOpenDemo: () => void;
}

export const ServicesList: React.FC<ServicesListProps> = ({ onOpenDemo }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section id="services" data-reveal-section className="py-24 md:py-36 bg-white border-b border-neutral-100">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Section Heading */}
        <div className="mb-16 md:mb-20 max-w-2xl">
          <span className="motion-eyebrow text-xs font-semibold tracking-widest text-neutral-400 uppercase font-mono">
            WHAT WE AUTOMATE TODAY
          </span>
          <h2 className="motion-title text-4xl sm:text-5xl md:text-6xl font-bold text-neutral-950 tracking-[-0.035em] font-display mt-2">
            What Saral automates.
          </h2>
          <p className="motion-copy text-base sm:text-lg text-neutral-500 mt-3">
            Six modules. One calm front desk.
          </p>
        </div>

        {/* Minimalist Vertical Monochromatic List */}
        <div data-motion-cards className="motion-content border-t border-neutral-200 divide-y divide-neutral-200/80">
          {services.map((item, index) => {
            const isHovered = hoveredIndex === index;
            return (
              <div
                key={item.number}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={onOpenDemo}
                className={`group py-8 sm:py-10 transition-all duration-300 cursor-pointer ${
                  isHovered ? 'bg-neutral-50/70 -mx-4 px-4 sm:-mx-8 sm:px-8 -translate-y-0.5 shadow-sm' : ''
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Number + Title */}
                  <div className="flex items-baseline space-x-6 sm:space-x-10">
                    <span className="text-xs sm:text-sm font-mono font-bold text-neutral-400 group-hover:text-neutral-950 transition-colors">
                      {item.number}
                    </span>
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h3 className="text-[24px] font-semibold tracking-[-0.02em] text-neutral-950 font-display">
                          {item.name}
                        </h3>
                        {item.statusTag && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-100 text-neutral-700 border border-neutral-200 hidden sm:inline-block">
                            {item.statusTag}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Center/Right: One-liner description */}
                  <div className="lg:max-w-md xl:max-w-lg text-[15px] font-normal text-neutral-500 group-hover:text-neutral-800 transition-colors leading-[1.65]">
                    {item.oneLiner}
                  </div>

                  {/* Arrow Indicator */}
                  <div className="flex items-center justify-end">
                    <div className="w-10 h-10 rounded-full border border-neutral-200 group-hover:border-neutral-950 group-hover:bg-neutral-950 text-neutral-500 group-hover:text-white flex items-center justify-center transition-all duration-200">
                      <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </div>
                </div>

                {/* Subtle expansion details on hover */}
                {isHovered && (
                  <div className="mt-4 pt-4 border-t border-neutral-200/60 max-w-3xl animate-in fade-in duration-200">
                    <p className="text-xs text-neutral-600 leading-relaxed font-mono">
                      {item.expandedDetails}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Roadmap footnote note */}
        <div className="mt-12 p-5 bg-neutral-50 rounded-2xl border border-neutral-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-neutral-500 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
            <span>Engineering Roadmap (Upcoming):</span>
            <span className="text-neutral-800 font-sans">In-chat UPI payment reconciliation · Lab PDF delivery · HIS/EHR custom connectors</span>
          </div>
          <span className="text-neutral-400 text-[11px]">Strict verification standards</span>
        </div>
      </div>
    </section>
  );
};

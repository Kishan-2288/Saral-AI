import React from 'react';
import { Building2, Stethoscope, ArrowRight, Activity, Microscope, Baby, Building, GraduationCap, Utensils } from 'lucide-react';

interface IndustriesProps {
  onOpenDemo: (industry?: string) => void;
}

export const Industries: React.FC<IndustriesProps> = ({ onOpenDemo }) => {
  return (
    <section data-reveal-section className="py-24 md:py-36 bg-white border-b border-neutral-100">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Section Heading */}
        <div className="max-w-3xl mb-16 md:mb-20">
          <span className="motion-eyebrow text-xs font-semibold tracking-widest text-neutral-400 uppercase font-mono">
            SECTOR SPECIALIZATION
          </span>
          <h2 className="motion-title text-4xl sm:text-5xl md:text-6xl font-bold text-neutral-950 tracking-[-0.035em] leading-[1.05] font-display mt-3">
            Built for one industry first.
            <br />
            <span className="text-neutral-400">Designed to go further.</span>
          </h2>
          <p className="motion-copy text-base sm:text-lg text-neutral-500 mt-4 leading-relaxed max-w-xl">
            Healthcare first. Built to expand.
          </p>
        </div>

        {/* PRIMARY PROMINENT FOCUS: Healthcare */}
        <div className="motion-content bg-neutral-950 text-white rounded-3xl p-8 sm:p-12 md:p-14 mb-10 shadow-lg relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-mono mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>PRIMARY SECTOR FOCUS</span>
            </div>

            <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight font-display mb-4">
              Healthcare & Clinical Operations
            </h3>

            <p className="text-base sm:text-lg text-neutral-300 leading-relaxed font-normal mb-8 max-w-2xl">
              Appointments, support and escalation — in WhatsApp.
            </p>

            {/* Healthcare Sub-Specialties */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-white/10 mb-8">
              <div className="space-y-1">
                <div className="text-sm font-semibold text-white">Hospitals</div>
                <div className="text-xs text-neutral-400">Appointment workflows</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-semibold text-white">Clinics</div>
                <div className="text-xs text-neutral-400">Patient support</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-semibold text-white">IVF Centres</div>
                <div className="text-xs text-neutral-400">Smart intake</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-semibold text-white">Diagnostic Labs</div>
                <div className="text-xs text-neutral-400">Scheduling</div>
              </div>
            </div>

            <button
              onClick={() => onOpenDemo('Healthcare')}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-white text-neutral-950 text-xs sm:text-sm font-medium rounded-full hover:bg-neutral-100 transition-colors cursor-pointer group"
            >
              <span>Explore Healthcare Deployments</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>

        {/* SECONDARY FUTURE CATEGORIES (Smaller, subdued as requested) */}
        <div>
          <div className="text-xs font-mono uppercase text-neutral-400 tracking-wider mb-4">
            Next Expansion Horizons
          </div>

          <div data-motion-cards className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Real Estate */}
            <div className="p-6 rounded-2xl border border-neutral-200/90 bg-neutral-50/50 hover:bg-white hover:border-neutral-300 transition-all">
              <div className="flex items-center justify-between mb-3">
                <Building className="w-5 h-5 text-neutral-700" />
                <span className="text-[10px] font-mono text-neutral-400 uppercase">Upcoming</span>
              </div>
              <h4 className="text-[22px] font-semibold text-neutral-900 font-display">Real Estate</h4>
              <p className="text-[15px] text-neutral-500 mt-1.5 leading-[1.6]">
                Automated site visit scheduling, property brochure dispatch, and buyer qualification over WhatsApp.
              </p>
            </div>

            {/* Education */}
            <div className="p-6 rounded-2xl border border-neutral-200/90 bg-neutral-50/50 hover:bg-white hover:border-neutral-300 transition-all">
              <div className="flex items-center justify-between mb-3">
                <GraduationCap className="w-5 h-5 text-neutral-700" />
                <span className="text-[10px] font-mono text-neutral-400 uppercase">Upcoming</span>
              </div>
              <h4 className="text-[22px] font-semibold text-neutral-900 font-display">Education</h4>
              <p className="text-[15px] text-neutral-500 mt-1.5 leading-[1.6]">
                Student admissions counseling, fee payment reminders, and campus tour reservations.
              </p>
            </div>

            {/* Restaurants */}
            <div className="p-6 rounded-2xl border border-neutral-200/90 bg-neutral-50/50 hover:bg-white hover:border-neutral-300 transition-all">
              <div className="flex items-center justify-between mb-3">
                <Utensils className="w-5 h-5 text-neutral-700" />
                <span className="text-[10px] font-mono text-neutral-400 uppercase">Upcoming</span>
              </div>
              <h4 className="text-[22px] font-semibold text-neutral-900 font-display">Restaurants</h4>
              <p className="text-[15px] text-neutral-500 mt-1.5 leading-[1.6]">
                Instant table reservations, party size verification, and digital takeaway order coordination.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

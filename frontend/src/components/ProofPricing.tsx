import React from 'react';
import { ArrowRight, Check, Shield } from 'lucide-react';

interface ProofPricingProps {
  onOpenDemo: () => void;
}

export const ProofPricing: React.FC<ProofPricingProps> = ({ onOpenDemo }) => {
  return (
    <div>
      {/* 31 — BRAND PRINCIPLE */}
      <section id="about" data-reveal-section className="py-24 md:py-36 bg-neutral-50/60 border-b border-neutral-100">
        <div className="max-w-5xl mx-auto px-6 md:px-12 text-center">
          <span className="motion-eyebrow text-xs font-semibold tracking-widest text-neutral-400 uppercase font-mono">
            THE PHILOSOPHY BEHIND SARAL
          </span>
          <h2 className="motion-title text-3xl sm:text-5xl font-bold text-neutral-950 tracking-[-0.035em] font-display mt-3">
            Complex inside. Simple outside.
          </h2>
          <p className="motion-copy text-base sm:text-lg text-neutral-500 mt-4 max-w-2xl mx-auto leading-relaxed">
            Simple for patients. Disciplined for operations.
          </p>

          <div data-motion-cards className="motion-content grid grid-cols-1 md:grid-cols-3 gap-6 mt-14 max-w-4xl mx-auto text-left">
            <div className="p-6 bg-white rounded-2xl border border-neutral-200/90 shadow-xs">
              <div className="text-[10px] font-mono text-neutral-400 uppercase mb-2">01 / Architecture</div>
              <div className="text-base font-bold text-neutral-950 font-display">Complex backend.</div>
              <div className="text-base font-medium text-neutral-400 mt-0.5 font-display">Simple interface.</div>
              <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                Underneath is a fault-tolerant web of state machines and APIs. To the user, it is just a friendly WhatsApp message.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-neutral-200/90 shadow-xs">
              <div className="text-[10px] font-mono text-neutral-400 uppercase mb-2">02 / Interaction</div>
              <div className="text-base font-bold text-neutral-950 font-display">Complex workflows.</div>
              <div className="text-base font-medium text-neutral-400 mt-0.5 font-display">Simple conversations.</div>
              <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                Hospital OPD schedules and doctor availability rules become a 15-second natural chat for any patient.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-neutral-200/90 shadow-xs">
              <div className="text-[10px] font-mono text-neutral-400 uppercase mb-2">03 / Outcomes</div>
              <div className="text-base font-bold text-neutral-950 font-display">Complex automation.</div>
              <div className="text-base font-medium text-neutral-400 mt-0.5 font-display">Simple outcomes.</div>
              <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                Automated appointment bookings, reschedules, cancellations, and staff escalations without front-desk manual strain.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 19 — PROOF / CASE STUDIES: RESTRAINED PLACEHOLDER */}
      <section id="case-studies" data-reveal-section className="py-20 md:py-28 bg-white border-b border-neutral-100">
        <div className="max-w-4xl mx-auto px-6 md:px-12 text-center">
          <span className="text-xs font-semibold tracking-widest text-neutral-400 uppercase font-mono">
            DEPLOYMENT RIGOR
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-neutral-950 tracking-[-0.035em] font-display mt-2">
            Real results. Measured in real deployments.
          </h2>
          <p className="text-sm sm:text-base text-neutral-500 mt-4 max-w-xl mx-auto leading-relaxed">
            Engineering truth over vanity metrics.
          </p>
          <div className="mt-6 inline-flex items-center space-x-2 text-xs font-mono text-neutral-400 bg-neutral-50 px-3.5 py-1.5 rounded-full border border-neutral-200">
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-400"></span>
            <span>Engineering truth over vanity metrics.</span>
          </div>
        </div>
      </section>

      {/* 20 — PRICING: RESTRAINED & MINIMAL */}
      <section id="pricing" data-reveal-section className="py-20 md:py-28 bg-white border-b border-neutral-100">
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          <div className="motion-content bg-neutral-50/70 border border-neutral-200/90 rounded-3xl p-8 sm:p-12">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 pb-8 border-b border-neutral-200/80">
              <div>
                <span className="text-xs font-semibold tracking-widest text-neutral-400 uppercase font-mono">
                  TRANSPARENT ENGAGEMENT
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold text-neutral-950 tracking-tight font-display mt-1">
                  Pricing Framework
                </h3>
                <p className="text-sm text-neutral-500 mt-2 max-w-md">
                  Clear setup. Managed automation.
                </p>
              </div>

              {/* Numbers */}
              <div className="space-y-3 bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs sm:min-w-[280px]">
                <div>
                  <div className="text-[11px] font-mono text-neutral-400 uppercase">Architecture & Integration</div>
                  <div className="text-2xl font-extrabold text-neutral-950 font-display">₹30,000 <span className="text-xs font-normal text-neutral-500">one-time setup</span></div>
                </div>

                <div className="pt-2 border-t border-neutral-100">
                  <div className="text-[11px] font-mono text-neutral-400 uppercase">Ongoing Operations</div>
                  <div className="text-xl font-bold text-neutral-950 font-display">~₹20,000<span className="text-xs font-normal text-neutral-500">/month managed automation</span></div>
                </div>
              </div>
            </div>

            <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="text-xs text-neutral-500 max-w-md leading-relaxed">
                <strong>Managed automation</strong> for the workflows your team depends on.
                <div className="text-[11px] text-neutral-400 mt-1">
                  * Pricing evolves with workflow complexity, integrations and message volume.
                </div>
              </div>

              <button
              onClick={onOpenDemo}
              data-magnetic
                className="inline-flex items-center space-x-2 px-6 py-3 bg-neutral-950 hover:bg-black text-white text-xs sm:text-sm font-medium rounded-full transition-all cursor-pointer shrink-0 shadow-xs"
              >
                <span>Discuss Your Workflow</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

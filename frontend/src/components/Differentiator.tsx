import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, ShieldAlert, Cpu, GitFork, Server } from 'lucide-react';

export const Differentiator: React.FC = () => {
  const [activeStage, setActiveStage] = useState<number>(1);

  return (
    <section data-reveal-section className="py-28 md:py-40 bg-white border-b border-neutral-100">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        {/* Brand Statement */}
        <div className="max-w-4xl mb-16 md:mb-24">
          <span className="motion-eyebrow text-xs font-semibold tracking-widest text-neutral-400 uppercase font-mono">
            CORE PHILOSOPHY
          </span>
          <h2 className="motion-title motion-mask text-4xl sm:text-6xl md:text-7xl font-extrabold text-neutral-950 tracking-[-0.035em] leading-[1.02] font-display mt-3">
            Complex inside.
            <br />
            <span className="text-neutral-400">Simple outside.</span>
          </h2>
          <p className="motion-copy text-lg sm:text-xl md:text-2xl text-neutral-600 font-normal leading-relaxed mt-6 max-w-3xl">
            AI understands. Logic verifies. Systems act.
          </p>
        </div>

        {/* 3-Stage Interactive Evolution */}
        <div className="motion-content bg-neutral-50/70 border border-neutral-200/90 rounded-3xl p-6 md:p-12 shadow-xs">
          <div className="flex flex-col sm:flex-row items-center justify-between pb-6 border-b border-neutral-200/80 gap-3">
            <span className="text-xs font-mono uppercase tracking-widest text-neutral-400">
              Deterministic Verification Architecture
            </span>
            <div className="flex items-center space-x-1">
              {[
                { id: 1, label: '01 AI' },
                { id: 2, label: '02 Workflow Logic' },
                { id: 3, label: '03 Database Write' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveStage(tab.id)}
                  className={`px-3 py-1 text-xs font-mono rounded-lg transition-all cursor-pointer ${
                    activeStage === tab.id
                      ? 'bg-neutral-950 text-white shadow-xs'
                      : 'bg-white border border-neutral-200 text-neutral-600 hover:border-neutral-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8">
            {/* Stage 1: AI */}
            <div
              onClick={() => setActiveStage(1)}
              className={`p-6 rounded-2xl border transition-all cursor-pointer ${
                activeStage === 1
                  ? 'bg-white border-neutral-900 shadow-md ring-1 ring-neutral-900'
                  : 'bg-white/60 border-neutral-200 hover:border-neutral-300'
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-900 mb-4 font-mono font-bold text-xs">
                01
              </div>
              <div className="text-xs font-mono text-neutral-400 uppercase tracking-wider mb-1">
                Natural Language
              </div>
              <h3 className="text-xl font-bold text-neutral-950 font-display">AI Understands</h3>
              <p className="text-xs text-neutral-600 mt-2 leading-relaxed">
                Ingests natural WhatsApp text and voice messages. Parses appointment dates, preferred doctors, and booking intents without rigid IVR or button menus. Includes automated text fallback if voice note audio is unclear.
              </p>

              <div className="mt-5 pt-3 border-t border-neutral-100 text-[11px] font-mono text-neutral-500">
                Input: “Can I book Dr. Sharma tomorrow at 5:30 PM?”
              </div>
            </div>

            {/* Stage 2: Business Logic */}
            <div
              onClick={() => setActiveStage(2)}
              className={`p-6 rounded-2xl border transition-all cursor-pointer ${
                activeStage === 2
                  ? 'bg-white border-neutral-950 shadow-md ring-1 ring-neutral-900'
                  : 'bg-white/60 border-neutral-200 hover:border-neutral-300'
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-neutral-900 text-white flex items-center justify-center mb-4 font-mono font-bold text-xs">
                02
              </div>
              <div className="text-xs font-mono text-neutral-400 uppercase tracking-wider mb-1">
                Zero Hallucination
              </div>
              <h3 className="text-xl font-bold text-neutral-950 font-display">n8n Logic Verifies</h3>
              <p className="text-xs text-neutral-600 mt-2 leading-relaxed">
                Deterministic n8n workflows check slot availability, active doctor schedules, and booking constraints in real time. If an inquiry exceeds verified FAQs, it triggers a human handoff.
              </p>

              <div className="mt-5 pt-3 border-t border-neutral-100 text-[11px] font-mono text-neutral-500">
                Rule Check: Doctor Available ✓ Slot Open in Supabase ✓
              </div>
            </div>

            {/* Stage 3: Verified Result */}
            <div
              onClick={() => setActiveStage(3)}
              className={`p-6 rounded-2xl border transition-all cursor-pointer ${
                activeStage === 3
                  ? 'bg-white border-neutral-950 shadow-md ring-1 ring-neutral-900'
                  : 'bg-white/60 border-neutral-200 hover:border-neutral-300'
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-neutral-950 text-white flex items-center justify-center mb-4 font-mono font-bold text-xs">
                03
              </div>
              <div className="text-xs font-mono text-neutral-400 uppercase tracking-wider mb-1">
                Database Write
              </div>
              <h3 className="text-xl font-bold text-neutral-950 font-display">Supabase Records</h3>
              <p className="text-xs text-neutral-600 mt-2 leading-relaxed">
                Direct write to Supabase PostgreSQL database, instant structured confirmation dispatched to the patient over WhatsApp, and receptionist handoff queued if required.
              </p>

              <div className="mt-5 pt-3 border-t border-neutral-100 text-[11px] font-mono text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Supabase Record #APT-9821 Created</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

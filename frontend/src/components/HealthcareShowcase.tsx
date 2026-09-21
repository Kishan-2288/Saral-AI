import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from '../animations/motion';
import { 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Database, 
  GitFork, 
  Bell, 
  ArrowRight,
  Sparkles,
  Mic,
  UserCheck
} from 'lucide-react';

interface Scenario {
  id: string;
  label: string;
  patientMsg: string;
  isVoice?: boolean;
  aiReply: string;
  actionTitle: string;
  actionDetail: string;
  workflowStage: string;
  dispatchStatus: string;
}

const scenarios: Scenario[] = [
  {
    id: 'booking',
    label: 'Book New Appointment',
    patientMsg: 'Can I book an appointment with Dr. Sharma for tomorrow evening at 5:30 PM?',
    aiReply: 'Yes! Dr. Sharma has an open cardiology slot tomorrow at 5:30 PM. I have reserved it for you in our appointment schedule.',
    actionTitle: 'Supabase Database',
    actionDetail: 'New row created in appointments table (Dr. Sharma • 5:30 PM • Confirmed)',
    workflowStage: 'n8n Slot Validation ✓',
    dispatchStatus: 'WhatsApp Confirmation Sent',
  },
  {
    id: 'reschedule',
    label: 'Reschedule / Cancel',
    patientMsg: 'I have an appointment with Dr. Sharma tomorrow. Can I move it to Friday morning instead?',
    aiReply: 'Certainly. I found your booking for tomorrow 5:30 PM. I have rescheduled you to Friday at 10:30 AM with Dr. Sharma.',
    actionTitle: 'Supabase Database',
    actionDetail: 'Appointment row updated: slot moved to Friday 10:30 AM',
    workflowStage: 'n8n Slot Reallocation ✓',
    dispatchStatus: 'Schedule Updated in Supabase',
  },
  {
    id: 'support_handoff',
    label: 'FAQ & Human Handoff',
    patientMsg: 'What should I bring for my first consultation? Also my mother has an unusual drug reaction, can doctor call her?',
    aiReply: 'Please bring prior medical records and a photo ID. Regarding your mother’s specific drug reaction, I have escalated this directly to our front desk team for immediate clinical follow-up.',
    actionTitle: 'Human Handoff Queue',
    actionDetail: 'Inquiry & patient contact routed to clinic reception staff',
    workflowStage: 'Boundary Safety Triggered ⚠️',
    dispatchStatus: 'Staff Escalation Alert Triggered',
  },
  {
    id: 'voice_note',
    label: 'Voice Note Audio',
    patientMsg: '🎤 Voice message (0:09): "Hi, mujhe Dr. Sharma ke sath kal ka appointment cancel karna hai."',
    isVoice: true,
    aiReply: 'Transcribed voice note: "Cancel appointment with Dr. Sharma for tomorrow." Your appointment has been cancelled successfully. Let me know if you would like to book a different date.',
    actionTitle: 'Voice AI Pipeline',
    actionDetail: 'Audio transcribed; text fallback ready if transcription confidence is low',
    workflowStage: 'n8n Audio Ingestion ✓',
    dispatchStatus: 'Cancellation Confirmed',
  },
];

interface HealthcareShowcaseProps {
  onOpenDemo: () => void;
}

export const HealthcareShowcase: React.FC<HealthcareShowcaseProps> = ({ onOpenDemo }) => {
  const [activeScenario, setActiveScenario] = useState<Scenario>(scenarios[0]);
  const sectionRef = useRef<HTMLElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !visualRef.current || prefersReducedMotion()) return;
    const media = gsap.matchMedia();
    media.add('(min-width: 1024px)', () => {
      const trigger = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top+=96',
        end: 'bottom bottom-=96',
        pin: visualRef.current,
        pinSpacing: false,
        scrub: true,
        onUpdate: (self) => {
          const next = scenarios[Math.min(scenarios.length - 1, Math.floor(self.progress * scenarios.length))];
          setActiveScenario((current) => current.id === next.id ? current : next);
        },
      });
      return () => trigger.kill();
    });
    return () => media.revert();
  }, []);

  return (
    <section ref={sectionRef} id="solutions" data-reveal-section className="py-24 md:py-36 bg-white border-b border-neutral-100">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Product copy */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <span className="motion-eyebrow text-xs font-semibold tracking-widest text-neutral-400 uppercase font-mono">
                WHATSAPP APPOINTMENT AUTOMATION
              </span>
              <h2 className="motion-title motion-mask text-4xl sm:text-5xl md:text-6xl font-bold text-neutral-950 tracking-[-0.035em] leading-[1.05] font-display mt-3">
                Built for healthcare first.
              </h2>
            </div>

            <p className="motion-copy text-lg md:text-xl text-neutral-600 font-normal leading-relaxed tracking-tight">
              Bookings, support and patient workflows — automated through WhatsApp.
            </p>

            {/* Interactive scenario toggles */}
            <div className="pt-2">
              <div className="text-xs font-mono uppercase text-neutral-400 mb-2.5">
                Try a workflow
              </div>
              <div className="flex flex-wrap gap-2">
                {scenarios.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setActiveScenario(s)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                      activeScenario.id === s.id
                        ? 'bg-neutral-950 text-white shadow-xs'
                        : 'bg-neutral-100/80 text-neutral-600 hover:bg-neutral-200/70'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Factual feature bullet list */}
            <div className="pt-4 space-y-3 text-sm text-neutral-700">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-900 shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span>WhatsApp → Saral AI → workflow.</span>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-900 shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span>Text and voice, without patient friction.</span>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-900 shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span>Human handoff when it matters.</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={onOpenDemo}
                className="inline-flex items-center space-x-2 text-sm font-semibold text-neutral-950 hover:text-neutral-700 transition-colors cursor-pointer group"
              >
                <span>Discuss WhatsApp automation for your clinic</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>

          {/* Right Column: Connected Multi-Interface Floating Canvas */}
          <div ref={visualRef} className="motion-content lg:col-span-7 relative">
            <div className="relative bg-neutral-50/60 rounded-3xl border border-neutral-200/80 p-6 md:p-8">
              {/* Header bar */}
              <div className="flex items-center justify-between pb-4 border-b border-neutral-200/80 mb-6">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-neutral-900"></span>
                  <span className="text-xs font-bold text-neutral-900 uppercase font-mono tracking-wider">
                    Live System Execution Pipeline
                  </span>
                </div>
                <div className="text-[11px] font-mono text-neutral-400">
                  WhatsApp → n8n → Supabase
                </div>
              </div>

              {/* Main Connected Canvas */}
              <div className="space-y-4">
                {/* 1. Patient Conversation Bubble */}
                <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs relative">
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-neutral-100">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px] font-bold">
                        W
                      </div>
                      <span className="text-xs font-semibold text-neutral-900">Patient WhatsApp Thread</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                      Live Flow
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-end">
                      <div className="bg-neutral-900 text-white px-3.5 py-2 rounded-xl rounded-tr-xs max-w-[85%]">
                        {activeScenario.patientMsg}
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="bg-neutral-50 border border-neutral-200 text-neutral-800 px-3.5 py-2 rounded-xl rounded-tl-xs max-w-[90%]">
                        <div className="flex items-center space-x-1 text-[10px] font-semibold text-neutral-500 mb-0.5">
                          <Sparkles className="w-2.5 h-2.5 text-neutral-900" />
                          <span>Saral AI Assistant</span>
                        </div>
                        {activeScenario.aiReply}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Visual execution bridge lines */}
                <div className="relative py-1 flex items-center justify-center">
                  <div className="w-full border-t border-dashed border-neutral-300"></div>
                  <span className="absolute bg-white px-3 py-0.5 text-[10px] font-mono text-neutral-500 rounded-full border border-neutral-200">
                    Verified Execution Layer
                  </span>
                </div>

                {/* 2. Three Connected Action Panels reflecting REAL stack */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {/* Supabase Store */}
                  <div className="bg-white rounded-xl p-4 border border-neutral-200/90 shadow-xs space-y-2 hover:border-neutral-400 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 font-mono">
                        Database
                      </span>
                      <Database className="w-3.5 h-3.5 text-neutral-700" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-neutral-950">{activeScenario.actionTitle}</div>
                      <div className="text-[11px] text-neutral-500 leading-snug">{activeScenario.actionDetail}</div>
                    </div>
                    <div className="pt-1.5 border-t border-neutral-100 flex items-center justify-between text-[11px]">
                      <span className="text-neutral-500 font-mono text-[10px]">Postgres / Store</span>
                      <span className="font-semibold text-emerald-700 flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Synced
                      </span>
                    </div>
                  </div>

                  {/* n8n Workflow */}
                  <div className="bg-white rounded-xl p-4 border border-neutral-200/90 shadow-xs space-y-2 hover:border-neutral-400 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 font-mono">
                        Orchestration
                      </span>
                      <GitFork className="w-3.5 h-3.5 text-neutral-700" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-neutral-950">n8n Workflow</div>
                      <div className="text-[11px] text-neutral-500 leading-snug">{activeScenario.workflowStage}</div>
                    </div>
                    <div className="pt-1.5 border-t border-neutral-100 flex items-center justify-between text-[11px]">
                      <span className="text-neutral-500 font-mono text-[10px]">Deterministic Logic</span>
                      <span className="font-semibold text-emerald-700 flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Executed
                      </span>
                    </div>
                  </div>

                  {/* WhatsApp Confirmation / Escalation */}
                  <div className="bg-white rounded-xl p-4 border border-neutral-200/90 shadow-xs space-y-2 hover:border-neutral-400 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 font-mono">
                        Result Action
                      </span>
                      <Bell className="w-3.5 h-3.5 text-neutral-700" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-neutral-950">Patient & Staff Dispatch</div>
                      <div className="text-[11px] text-neutral-500 leading-snug">{activeScenario.dispatchStatus}</div>
                    </div>
                    <div className="pt-1.5 border-t border-neutral-100 flex items-center justify-between text-[11px]">
                      <span className="text-neutral-500 font-mono text-[10px]">WhatsApp API</span>
                      <span className="font-semibold text-emerald-700 flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Dispatched
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

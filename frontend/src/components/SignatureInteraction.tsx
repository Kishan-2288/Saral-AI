import React, { useState } from 'react';
import { 
  ArrowRight, 
  Calendar, 
  Clock, 
  UserCheck, 
  Mic, 
  CheckCircle2, 
  RotateCcw,
  CalendarCheck2
} from 'lucide-react';
import { CapabilityItem } from '../types';

const capabilities: CapabilityItem[] = [
  {
    id: 'booking',
    title: 'New Bookings',
    actions: ['Natural Language Intake', 'Slot Matching', 'Doctor Selection', 'Instant Confirmation'],
    description: 'Conversational booking on WhatsApp. The assistant understands department, doctor, and date preferences, checks real-time slot availability in Supabase, and confirms the visit.',
    badge: '100% WhatsApp Native',
    sampleTrigger: '“Can I schedule a consultation with Dr. Sharma tomorrow evening?”',
    resultingAction: 'Slot reserved in Supabase database; formatted confirmation sent on WhatsApp.',
  },
  {
    id: 'view-appointments',
    title: 'View Upcoming',
    actions: ['Phone Lookup', 'Schedule Retrieval', 'Doctor & Room Info', 'Directions'],
    description: 'Allows patients to instantly check their upcoming appointments and scheduled consultation times without calling clinic reception.',
    badge: 'Instant Lookup',
    sampleTrigger: '“Do I have any appointments scheduled this week?”',
    resultingAction: 'Queries Supabase by verified phone number; returns appointment time and clinic details.',
  },
  {
    id: 'reschedule-cancel',
    title: 'Reschedule & Cancel',
    actions: ['Slot Modification', 'Cancellation Confirmation', 'Database Reallocation', 'Zero Friction'],
    description: 'Patients can reschedule to another available slot or cancel with zero front-desk friction. Database is instantly updated in real-time.',
    badge: 'Self-Serve',
    sampleTrigger: '“I can’t make it tomorrow at 5:30 PM. Can I move to Friday morning?”',
    resultingAction: 'Existing slot released in Supabase; new Friday slot confirmed via WhatsApp.',
  },
  {
    id: 'patient-support',
    title: 'FAQ & Human Handoff',
    actions: ['Clinic Hours', 'Doctor Timings', 'Strict Boundary Guardrails', 'Immediate Staff Escalation'],
    description: 'Answers routine questions on clinic timings, doctor schedules, and consultation guidelines. When a question exceeds verified knowledge, it escalates seamlessly to human reception.',
    badge: 'Safe & Scoped',
    sampleTrigger: '“My child has a specific allergic rash, should we see Dr. Joshi today?”',
    resultingAction: 'Recognizes out-of-scope clinical query; alerts clinic front desk for immediate human follow-up.',
  },
  {
    id: 'voice-notes',
    title: 'Voice Notes & Audio',
    actions: ['Audio Note Ingestion', 'Speech Transcription', 'Intent Parsing', 'Text Fallback Guardrail'],
    description: 'Patients who prefer speaking can send voice notes. The system transcribes the audio and executes the requested appointment action. If transcription fails, it gracefully falls back to text.',
    badge: 'Speech AI + Fallback',
    sampleTrigger: '🎤 Audio note (0:08): “Dr. Sharma se kal milna tha, appointment book kar do.”',
    resultingAction: 'Audio transcribed via pipeline; appointment booking workflow executed with text fallback guardrail.',
  },
];

const messageJourneySteps = [
  { step: '01', label: 'Inbound Message', detail: 'WhatsApp text or audio note received', status: 'WhatsApp Webhook' },
  { step: '02', label: 'Intent Extraction', detail: 'Identifies: New Booking, Reschedule, Cancel, or FAQ', status: 'NLU Parsed' },
  { step: '03', label: 'n8n Logic Engine', detail: 'Validates doctor schedule and checks open slot in database', status: 'n8n Workflow' },
  { step: '04', label: 'Supabase Update', detail: 'Appointment row created/modified in Supabase PostgreSQL', status: 'Supabase Synced' },
  { step: '05', label: 'Safety & Triage', detail: 'Checks FAQ bounds; initiates staff handoff if uncertain', status: 'Guardrail Cleared' },
  { step: '06', label: 'WhatsApp Dispatched', detail: 'Formatted confirmation or staff alert sent to patient', status: 'Complete ✓' },
];

export const SignatureInteraction: React.FC = () => {
  const [selectedCapability, setSelectedCapability] = useState<CapabilityItem>(capabilities[0]);
  const [activeJourneyStep, setActiveJourneyStep] = useState<number>(5);

  return (
    <section id="capabilities" data-reveal-section className="py-24 md:py-36 bg-white border-b border-neutral-100">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Editorial Heading */}
        <div className="max-w-3xl mb-16 md:mb-20">
          <span className="motion-eyebrow text-xs font-semibold tracking-widest text-neutral-400 uppercase font-mono">
            CAPABILITY ARCHITECTURE
          </span>
          <h2 className="motion-title text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-neutral-950 tracking-[-0.035em] leading-[1.02] font-display mt-3">
            Watch a booking
            <br />
            <span className="text-neutral-400">complete itself.</span>
          </h2>
          <p className="motion-copy text-lg md:text-xl text-neutral-600 font-normal leading-relaxed mt-4 max-w-xl">
            Message → availability → confirmation.
          </p>
        </div>

        {/* 5 Real Capabilities Minimal Vertical List */}
        <div data-motion-cards className="motion-content border-t border-neutral-200 divide-y divide-neutral-100 mb-20">
          {capabilities.map((cap) => {
            const isSelected = selectedCapability.id === cap.id;
            return (
              <div
                key={cap.id}
                onMouseEnter={() => setSelectedCapability(cap)}
                onClick={() => setSelectedCapability(cap)}
                className={`group py-6 md:py-8 transition-all cursor-pointer ${
                  isSelected ? 'bg-neutral-50/70 -mx-4 px-4 sm:-mx-6 sm:px-6 rounded-2xl' : ''
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-baseline space-x-6">
                    <h3
                      className={`text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight transition-colors font-display ${
                        isSelected ? 'text-neutral-950' : 'text-neutral-400 group-hover:text-neutral-900'
                      }`}
                    >
                      {cap.title}
                    </h3>
                  </div>

                  {/* Actions Chips */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    {cap.actions.map((act) => (
                      <span
                        key={act}
                        className={`text-xs sm:text-sm font-medium px-3 py-1 rounded-full transition-all ${
                          isSelected
                            ? 'bg-white border border-neutral-300 text-neutral-900 shadow-xs'
                            : 'bg-neutral-100 text-neutral-500'
                        }`}
                      >
                        {act}
                      </span>
                    ))}
                    <span className="text-neutral-400 group-hover:text-neutral-950 group-hover:translate-x-1 transition-all">
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </span>
                  </div>
                </div>

                {/* Contextual Reveal when selected */}
                {isSelected && (
                  <div className="mt-5 pt-4 border-t border-neutral-200/60 grid grid-cols-1 md:grid-cols-12 gap-4 animate-in fade-in duration-300">
                    <div className="md:col-span-7">
                      <p className="text-sm text-neutral-600 leading-relaxed">
                        {cap.description}
                      </p>
                      <div className="mt-2 inline-flex items-center text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-100">
                        {cap.badge}
                      </div>
                    </div>
                    <div className="md:col-span-5 bg-white p-3.5 rounded-xl border border-neutral-200/80 text-xs space-y-1.5 shadow-xs">
                      <div className="text-[10px] font-mono text-neutral-400 uppercase">
                        Sample Inbound Trigger
                      </div>
                      <div className="font-mono text-neutral-900 font-medium">
                        {cap.sampleTrigger}
                      </div>
                      <div className="text-neutral-500 text-[11px] flex items-center gap-1 pt-1 border-t border-neutral-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span>{cap.resultingAction}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Section 24: Signature Interaction - Message Traveling Through Saral AI */}
        <div className="bg-neutral-50/80 rounded-3xl border border-neutral-200/90 p-6 md:p-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-neutral-200 gap-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-neutral-400">
                SIGNATURE INTERACTION
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-950 font-display mt-1">
                The Anatomy of a WhatsApp Request
              </h3>
              <p className="text-sm text-neutral-500 mt-1">
                Follow a patient appointment message as it moves through NLU, n8n orchestration, and Supabase persistence.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono text-neutral-400">Step:</span>
              <div className="flex space-x-1">
                {messageJourneySteps.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveJourneyStep(idx)}
                    className={`w-7 h-7 rounded-md text-xs font-mono font-medium transition-all cursor-pointer ${
                      activeJourneyStep === idx
                        ? 'bg-neutral-950 text-white shadow-xs'
                        : 'bg-white border border-neutral-200 text-neutral-600 hover:border-neutral-400'
                    }`}
                  >
                    0{idx + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Continuous Journey Ribbon */}
          <div className="pt-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
              {messageJourneySteps.map((item, index) => {
                const isPassed = index <= activeJourneyStep;
                const isCurrent = index === activeJourneyStep;
                return (
                  <div
                    key={item.step}
                    onClick={() => setActiveJourneyStep(index)}
                    className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                      isCurrent
                        ? 'bg-white border-neutral-950 shadow-md ring-1 ring-neutral-950'
                        : isPassed
                        ? 'bg-white border-neutral-200 text-neutral-800'
                        : 'bg-white/40 border-neutral-100 text-neutral-400 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono text-neutral-400">{item.step}</span>
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                          isPassed
                            ? 'bg-neutral-100 text-neutral-800 font-medium'
                            : 'bg-neutral-50 text-neutral-400'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-neutral-950 mb-1 leading-snug">
                      {item.label}
                    </div>

                    <div className="text-[11px] text-neutral-600 leading-snug">
                      {item.detail}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Current Active Step Details banner */}
            <div className="mt-6 p-4 bg-white rounded-xl border border-neutral-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-neutral-950 text-white flex items-center justify-center font-mono text-xs font-bold shrink-0">
                  {messageJourneySteps[activeJourneyStep].step}
                </div>
                <div>
                  <div className="text-xs font-bold text-neutral-900">
                    {messageJourneySteps[activeJourneyStep].label} — {messageJourneySteps[activeJourneyStep].status}
                  </div>
                  <div className="text-xs text-neutral-500">
                    {messageJourneySteps[activeJourneyStep].detail}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                <button
                  disabled={activeJourneyStep === 0}
                  onClick={() => setActiveJourneyStep((prev) => Math.max(0, prev - 1))}
                  className="px-3 py-1.5 text-xs font-medium bg-neutral-100 rounded-md disabled:opacity-30 hover:bg-neutral-200 transition-colors"
                >
                  Previous
                </button>
                <button
                  disabled={activeJourneyStep === messageJourneySteps.length - 1}
                  onClick={() => setActiveJourneyStep((prev) => Math.min(messageJourneySteps.length - 1, prev + 1))}
                  className="px-3 py-1.5 text-xs font-medium bg-neutral-950 text-white rounded-md disabled:opacity-30 hover:bg-black transition-colors"
                >
                  Next Step
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from '../animations/motion';
import { 
  Check, 
  Calendar, 
  Clock, 
  User, 
  ShieldCheck, 
  CreditCard, 
  ArrowRight,
  Activity,
  ChevronRight
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export const HeroVisualScroll: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const [activePhase, setActivePhase] = useState<number>(1);
  const [isManualOverride, setIsManualOverride] = useState<boolean>(false);

  useEffect(() => {
    if (!containerRef.current || !pinRef.current) return;
    if (prefersReducedMotion()) return;

    // GSAP ScrollTrigger timeline
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '+=2800',
          pin: pinRef.current,
          scrub: 0.8,
          onUpdate: (self) => {
            if (!isManualOverride) {
              const progress = self.progress;
              if (progress < 0.16) setActivePhase(1);
              else if (progress < 0.33) setActivePhase(2);
              else if (progress < 0.50) setActivePhase(3);
              else if (progress < 0.68) setActivePhase(4);
              else if (progress < 0.85) setActivePhase(5);
              else setActivePhase(6);
            }
          },
        },
      });

      // Subtle phone 3D transformations & scale along timeline
      tl.to('.phone-viewport', {
        rotationY: -12,
        rotationX: 8,
        scale: 1.02,
        duration: 2,
        ease: 'power1.inOut',
      })
      .to('.conversation-step-2', {
        opacity: 1,
        y: 0,
        duration: 1.5,
      })
      .to('.conversation-step-3', {
        opacity: 1,
        y: 0,
        duration: 1.5,
      })
      .to('.conversation-step-4', {
        opacity: 1,
        y: 0,
        duration: 1.5,
      })
      .to('.automation-trace-path', {
        opacity: 1,
        strokeDashoffset: 0,
        duration: 2,
      })
      .to('.execution-node-cards', {
        opacity: 1,
        y: 0,
        stagger: 0.2,
        duration: 2,
      })
      .to('.dashboard-preview-card', {
        opacity: 1,
        scale: 1,
        duration: 2,
      });
    }, containerRef);

    return () => ctx.revert();
  }, [isManualOverride]);

  useEffect(() => {
    if (!containerRef.current || !pinRef.current || prefersReducedMotion()) return;
    const phone = pinRef.current.querySelector<HTMLElement>('.phone-viewport');
    if (!phone) return;

    const ctx = gsap.context(() => {
      gsap.to(phone, {
        y: -7,
        rotationZ: 0.22,
        duration: 3.8,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });
      gsap.to(pinRef.current, {
        yPercent: -3,
        scale: 0.987,
        autoAlpha: 0.84,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleManualPhaseSelect = (phase: number) => {
    setIsManualOverride(true);
    setActivePhase(phase);
    setTimeout(() => setIsManualOverride(false), 2500);
  };

  return (
    <div
      ref={containerRef}
      id="hero-scroll-experience"
      className="relative w-full bg-white border-y border-neutral-100/80"
    >
      <div
        ref={pinRef}
        className="w-full min-h-screen py-10 md:py-16 flex flex-col justify-between overflow-hidden bg-white"
      >
        {/* Phase Header & Interactive Stepper */}
        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full pt-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-neutral-100 pb-5 gap-4">
            <div>
              <div className="flex items-center space-x-2 text-[11px] font-mono tracking-widest text-neutral-400 uppercase">
                <span>Phase 0{activePhase} of 06</span>
                <span>/</span>
                <span className="text-neutral-900 font-semibold">
                  {activePhase === 1 && 'Standby Device Canvas'}
                  {activePhase === 2 && 'Perspective & Real-Time Intent'}
                  {activePhase === 3 && 'WhatsApp Patient Interaction'}
                  {activePhase === 4 && 'Autonomous Workflow Path'}
                  {activePhase === 5 && 'Multi-System Verified Actions'}
                  {activePhase === 6 && 'Hospital Operations Interface'}
                </span>
              </div>
              <h2 className="text-lg md:text-xl font-medium tracking-tight text-neutral-900 mt-1">
                {activePhase <= 3
                  ? 'A patient sends a natural WhatsApp message.'
                  : activePhase <= 5
                  ? 'Saral AI orchestrates doctor schedule, n8n logic, and Supabase updates.'
                  : 'Hospital front desk operates with complete transparency.'}
              </h2>
            </div>

            {/* Step navigation pills */}
            <div className="flex items-center space-x-1.5 overflow-x-auto py-1">
              {[
                { phase: 1, label: 'Device' },
                { phase: 2, label: 'Perspective' },
                { phase: 3, label: 'Conversation' },
                { phase: 4, label: 'Workflow' },
                { phase: 5, label: 'Actions' },
                { phase: 6, label: 'Dashboard' },
              ].map((step) => (
                <button
                  key={step.phase}
                  onClick={() => handleManualPhaseSelect(step.phase)}
                  className={`px-3 py-1 text-xs font-mono rounded-full transition-all cursor-pointer whitespace-nowrap ${
                    activePhase === step.phase
                      ? 'bg-neutral-950 text-white shadow-xs'
                      : 'bg-neutral-100/70 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200/60'
                  }`}
                >
                  0{step.phase} {step.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Central Visual Stage */}
        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full my-auto py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left/Center Device Canvas */}
            <div className="lg:col-span-6 flex justify-center perspective-[1200px]">
              <div
                className={`phone-viewport relative w-[310px] sm:w-[350px] h-[640px] bg-white rounded-[44px] p-3.5 border-[6px] border-neutral-900 shadow-[0_24px_64px_-16px_rgba(0,0,0,0.12)] transition-all duration-700 ${
                  activePhase >= 2 ? 'rotate-y-[-6deg] rotate-x-[4deg]' : ''
                }`}
                style={{
                  transformStyle: 'preserve-3d',
                }}
              >
                {/* Hardware Speaker / Dynamic Island */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-4 bg-neutral-950 rounded-full z-30 flex items-center justify-end px-2">
                  <span className="w-2 h-2 rounded-full bg-neutral-800"></span>
                </div>

                {/* WhatsApp Screen Content */}
                <div className="w-full h-full bg-[#f9fafb] rounded-[34px] overflow-hidden flex flex-col border border-neutral-100 text-xs">
                  {/* WhatsApp App Header */}
                  <div className="bg-white border-b border-neutral-200/80 px-4 pt-8 pb-3 flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-[11px]">
                        +
                      </div>
                      <div>
                        <div className="font-semibold text-neutral-900 text-[13px] flex items-center space-x-1">
                          <span>City Care Hospital</span>
                          <ShieldCheck className="w-3.5 h-3.5 text-neutral-900" />
                        </div>
                        <div className="text-[10px] text-emerald-600 font-medium flex items-center space-x-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                          <span>Saral AI Front Desk • Verified</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Chat Stream */}
                  <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-[#fdfdfd]">
                    {/* Timestamp */}
                    <div className="text-center my-1">
                      <span className="text-[10px] text-neutral-400 bg-neutral-100/70 px-2.5 py-0.5 rounded-full">
                        Today 10:14 AM
                      </span>
                    </div>

                    {/* Step 1: Patient asks to book */}
                    <div className="flex justify-end">
                      <div className="max-w-[82%] bg-neutral-900 text-white rounded-2xl rounded-tr-xs px-3.5 py-2.5 shadow-xs">
                        <p className="text-xs leading-snug">Hi, I want to book an appointment.</p>
                        <span className="text-[9px] text-neutral-400 block text-right mt-1">10:14 AM</span>
                      </div>
                    </div>

                    {/* Step 2: AI Assistant responds */}
                    <div className={`conversation-step-2 flex justify-start transition-all duration-500 ${activePhase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                      <div className="max-w-[85%] bg-white border border-neutral-200/90 text-neutral-900 rounded-2xl rounded-tl-xs px-3.5 py-2.5 shadow-xs">
                        <p className="text-xs leading-snug text-neutral-800">
                          Of course. Which department would you like to visit?
                        </p>
                        
                        {/* Department Pills */}
                        <div className="flex flex-wrap gap-1.5 mt-2.5">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-neutral-900 text-white">
                            Cardiology ✓
                          </span>
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-neutral-100 text-neutral-500">
                            Orthopedics
                          </span>
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-neutral-100 text-neutral-500">
                            Pediatrics
                          </span>
                        </div>
                        <span className="text-[9px] text-neutral-400 block text-right mt-1.5">10:14 AM</span>
                      </div>
                    </div>

                    {/* Step 3: Doctor & Slot selection */}
                    <div className={`conversation-step-3 flex justify-start transition-all duration-500 ${activePhase >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                      <div className="max-w-[88%] bg-white border border-neutral-200/90 text-neutral-900 rounded-2xl rounded-tl-xs px-3.5 py-2.5 shadow-xs">
                        <p className="text-xs text-neutral-800 leading-snug">
                          <strong>Dr. Sharma</strong> is available tomorrow:
                        </p>
                        <div className="mt-2 p-2 bg-neutral-50 rounded-lg border border-neutral-100 flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-neutral-900 text-[11px]">Dr. Sharma, MD</div>
                            <div className="text-[10px] text-neutral-500">Cardiology • Room 204</div>
                          </div>
                          <span className="px-2 py-0.5 bg-neutral-950 text-white rounded text-[10px] font-mono">
                            5:30 PM
                          </span>
                        </div>
                        <span className="text-[9px] text-neutral-400 block text-right mt-1">10:15 AM</span>
                      </div>
                    </div>

                    {/* Step 4: Patient Confirms */}
                    <div className={`conversation-step-4 flex justify-end transition-all duration-500 ${activePhase >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                      <div className="max-w-[75%] bg-neutral-900 text-white rounded-2xl rounded-tr-xs px-3.5 py-2 shadow-xs">
                        <p className="text-xs">Yes, 5:30 PM works. Confirm it.</p>
                        <span className="text-[9px] text-neutral-400 block text-right mt-0.5">10:15 AM</span>
                      </div>
                    </div>

                    {/* Step 5: Appointment Confirmed Ticket */}
                    <div className={`conversation-step-4 flex justify-start transition-all duration-500 ${activePhase >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                      <div className="w-full bg-white border border-neutral-900/15 rounded-xl p-3 shadow-xs">
                        <div className="flex items-center justify-between border-b border-neutral-100 pb-2 mb-2">
                          <span className="text-[11px] font-bold text-neutral-950 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            Appointment Confirmed
                          </span>
                          <span className="text-[9px] font-mono bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded">
                            #SRL-9102
                          </span>
                        </div>
                        <div className="text-[10px] space-y-1 text-neutral-600">
                          <div className="flex justify-between">
                            <span>Doctor:</span>
                            <span className="font-semibold text-neutral-900">Dr. Sharma</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Slot:</span>
                            <span className="font-semibold text-neutral-900">Tomorrow, 5:30 PM</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Status:</span>
                            <span className="text-emerald-700 font-medium">Slot Confirmed in Database</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Input bar */}
                  <div className="p-2.5 bg-white border-t border-neutral-200 flex items-center space-x-2">
                    <div className="flex-1 bg-neutral-100 text-neutral-400 text-[11px] px-3 py-1.5 rounded-full">
                      Type a reply...
                    </div>
                    <div className="w-6 h-6 rounded-full bg-neutral-900 text-white flex items-center justify-center">
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side: Emerging Automation & System Architecture */}
            <div className="lg:col-span-6 space-y-6">
              {/* Sequential Architecture Pipe */}
              <div className="bg-neutral-50/70 border border-neutral-200/80 rounded-2xl p-6 md:p-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono uppercase tracking-widest text-neutral-400">
                    Execution Pipeline
                  </span>
                  <span className="text-xs font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                    Live Pipeline
                  </span>
                </div>

                {/* 4-Step Pipeline */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { step: '01', title: 'Message', desc: 'WhatsApp Text/Audio', active: activePhase >= 1 },
                    { step: '02', title: 'AI Intent', desc: 'Department & Slot', active: activePhase >= 3 },
                    { step: '03', title: 'Workflow', desc: 'n8n State Machine', active: activePhase >= 4 },
                    { step: '04', title: 'Action', desc: 'Supabase & Dispatch', active: activePhase >= 5 },
                  ].map((node) => (
                    <div
                      key={node.step}
                      className={`p-3.5 rounded-xl border transition-all duration-300 ${
                        node.active
                          ? 'bg-white border-neutral-900 shadow-xs text-neutral-900'
                          : 'bg-white/40 border-neutral-200 text-neutral-400'
                      }`}
                    >
                      <div className="text-[10px] font-mono text-neutral-400 mb-1">{node.step}</div>
                      <div className="text-xs font-bold leading-tight">{node.title}</div>
                      <div className="text-[10px] text-neutral-500 mt-0.5">{node.desc}</div>
                    </div>
                  ))}
                </div>

                {/* Multi-System Action Nodes */}
                <div className="execution-node-cards mt-5 pt-5 border-t border-neutral-200/70 space-y-3">
                  <div className="text-xs font-semibold text-neutral-800 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-neutral-600" />
                    Verified System Execution Triggered:
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                    <div className={`p-3 bg-white rounded-lg border transition-all ${activePhase >= 4 ? 'border-neutral-300 text-neutral-900 shadow-xs' : 'border-neutral-100 text-neutral-300'}`}>
                      <div className="flex items-center space-x-1.5 font-medium mb-1">
                        <Calendar className="w-3.5 h-3.5 text-neutral-700" />
                        <span>Supabase DB</span>
                      </div>
                      <p className="text-[11px] text-neutral-500 leading-snug">
                        Dr. Sharma 5:30 PM slot reserved in appointments table.
                      </p>
                    </div>

                    <div className={`p-3 bg-white rounded-lg border transition-all ${activePhase >= 5 ? 'border-neutral-300 text-neutral-900 shadow-xs' : 'border-neutral-100 text-neutral-300'}`}>
                      <div className="flex items-center space-x-1.5 font-medium mb-1">
                        <Activity className="w-3.5 h-3.5 text-neutral-700" />
                        <span>n8n Engine</span>
                      </div>
                      <p className="text-[11px] text-neutral-500 leading-snug">
                        Deterministic slot validation and conflict checking completed.
                      </p>
                    </div>

                    <div className={`p-3 bg-white rounded-lg border transition-all ${activePhase >= 5 ? 'border-neutral-300 text-neutral-900 shadow-xs' : 'border-neutral-100 text-neutral-300'}`}>
                      <div className="flex items-center space-x-1.5 font-medium mb-1">
                        <Clock className="w-3.5 h-3.5 text-neutral-700" />
                        <span>WhatsApp Reply</span>
                      </div>
                      <p className="text-[11px] text-neutral-500 leading-snug">
                        Instant formatted booking confirmation sent to patient.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Simplified Dashboard transformation preview */}
              <div
                className={`dashboard-preview-card bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-xs transition-all duration-500 ${
                  activePhase >= 6 ? 'opacity-100 translate-y-0' : 'opacity-80'
                }`}
              >
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-neutral-900"></span>
                    <span className="text-xs font-semibold text-neutral-900">
                      Hospital Admin Real-Time Feed
                    </span>
                  </div>
                  <span className="text-[11px] text-neutral-400 font-mono">Synced with Supabase</span>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs py-2 px-3 bg-neutral-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-7 h-7 rounded-full bg-neutral-200 flex items-center justify-center font-bold text-neutral-700 text-[10px]">
                      AK
                    </div>
                    <div>
                      <div className="font-medium text-neutral-900">Ananya K. — Cardiology</div>
                      <div className="text-[10px] text-neutral-500">Autonomous booking via WhatsApp</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-neutral-900">Tomorrow, 5:30 PM</div>
                    <div className="text-[10px] text-emerald-600 font-medium">Verified • Zero Staff Touch</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom indicator */}
        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full text-center pb-2">
          <span className="text-xs text-neutral-400 font-mono tracking-wider">
            SCROLL TO EXPLORE WORKFLOW TRANSFORMATION ↓
          </span>
        </div>
      </div>
    </div>
  );
};

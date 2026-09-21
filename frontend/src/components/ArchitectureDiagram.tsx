import React from 'react';
import { ArrowDown, Check, Database, GitBranch, Layers, MessageSquare, Mic, UserCheck } from 'lucide-react';

export const ArchitectureDiagram: React.FC = () => {
  return (
    <section id="architecture" data-reveal-section className="py-24 md:py-36 bg-white border-b border-neutral-100">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-16 md:mb-20">
          <span className="motion-eyebrow text-xs font-semibold tracking-widest text-neutral-400 uppercase font-mono">
            SYSTEM ARCHITECTURE
          </span>
          <h2 className="motion-title text-3xl sm:text-4xl md:text-5xl font-bold text-neutral-950 tracking-[-0.035em] font-display mt-2">
            How the system acts.
          </h2>
          <p className="motion-copy text-sm md:text-base text-neutral-500 mt-3 leading-relaxed">
            Conversation in. Verified action out.
          </p>
        </div>

        {/* Infrastructure Topology Diagram */}
        <div data-flow-diagram className="motion-content w-full bg-white border border-neutral-200/90 rounded-3xl p-6 md:p-12 shadow-xs">
          {/* Top: Inbound Channels */}
          <div data-flow-node className="flex flex-col items-center">
            <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest mb-3">
              01 / WhatsApp
            </div>
            <div data-flow-node className="inline-flex items-center gap-3 px-6 py-2.5 bg-neutral-50 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-800">
              <span className="flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-neutral-700" />
                WhatsApp Cloud Webhook (Text)
              </span>
              <span className="text-neutral-300">•</span>
              <span className="flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5 text-neutral-700" />
                WhatsApp Voice Notes (Audio Pipeline)
              </span>
            </div>

            {/* Connecting thin line */}
            <div data-flow-line className="w-px h-8 bg-neutral-300 my-1"></div>
            <ArrowDown className="w-3 h-3 text-neutral-400 -mt-1 mb-1" />

            {/* Step 2: AI Intent */}
            <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest mb-2">
              02 / AI intent
            </div>
            <div data-flow-node className="px-7 py-2.5 bg-white border border-neutral-900 rounded-xl text-xs font-mono font-bold text-neutral-950 shadow-xs flex items-center gap-2">
              <span>Intent Extraction & FAQ Boundary Verification</span>
              <span className="text-[10px] text-neutral-400 font-normal">(Voice Transcription with Text Fallback)</span>
            </div>

            {/* Connecting thin line */}
            <div data-flow-line className="w-px h-8 bg-neutral-300 my-1"></div>
            <ArrowDown className="w-3 h-3 text-neutral-400 -mt-1 mb-1" />

            {/* Center Core: SARAL AI Engine */}
            <div data-flow-node className="my-2 w-full max-w-xl text-center">
              <div className="relative p-6 sm:p-8 bg-neutral-950 text-white rounded-2xl shadow-lg border border-neutral-900">
                <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest mb-1">
                  Orchestration Core
                </div>
                <div className="text-xl sm:text-2xl font-extrabold tracking-tight font-display">
                  n8n WORKFLOW ENGINE
                </div>
                <p className="text-xs text-neutral-400 mt-1 max-w-md mx-auto">
                  State-machine verification • Doctor slot availability checks • Error recovery • Human escalation triggers
                </p>

                <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-center gap-4 text-[11px] font-mono text-neutral-300">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
                    Verified Logic Rules
                  </span>
                  <span className="text-neutral-700">•</span>
                  <span>Human Reception Handoff</span>
                </div>
              </div>
            </div>

            {/* Connecting thin line */}
            <div data-flow-line className="w-px h-8 bg-neutral-300 my-1"></div>
            <ArrowDown className="w-3 h-3 text-neutral-400 -mt-1 mb-1" />

            {/* Step 3: Outputs / Multi-System execution */}
            <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest mb-3">
              03 / Actions
            </div>

            <div data-flow-node data-motion-cards className="w-full grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl">
              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 text-center space-y-1">
                <div className="text-[10px] font-mono text-neutral-400 uppercase">Supabase DB</div>
                <div className="text-xs font-bold text-neutral-950">Book New Slot</div>
                <div className="text-[10px] text-neutral-500">Row inserted & confirmed</div>
              </div>

              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 text-center space-y-1">
                <div className="text-[10px] font-mono text-neutral-400 uppercase">Supabase DB</div>
                <div className="text-xs font-bold text-neutral-950">Modify / Cancel</div>
                <div className="text-[10px] text-neutral-500">Slot released or moved</div>
              </div>

              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 text-center space-y-1">
                <div className="text-[10px] font-mono text-neutral-400 uppercase">Front Desk</div>
                <div className="text-xs font-bold text-neutral-950">Staff Escalation</div>
                <div className="text-[10px] text-neutral-500">Unhandled query forwarded</div>
              </div>

              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 text-center space-y-1">
                <div className="text-[10px] font-mono text-neutral-400 uppercase">WhatsApp Cloud</div>
                <div className="text-xs font-bold text-neutral-950">Patient Reply</div>
                <div className="text-[10px] text-neutral-500">Instant formatted response</div>
              </div>
            </div>

            {/* Bottom Foundation Layer: Supabase · n8n */}
            <div className="mt-10 pt-6 border-t border-neutral-200/80 w-full max-w-4xl flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 font-mono gap-3">
              <div className="flex items-center gap-2">
                <Database className="w-3.5 h-3.5 text-neutral-400" />
                <span>Production Stack:</span>
                <strong className="text-neutral-900 font-medium">WhatsApp Cloud API · n8n Orchestrator · Supabase (PostgreSQL)</strong>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Active Clinical Architecture</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

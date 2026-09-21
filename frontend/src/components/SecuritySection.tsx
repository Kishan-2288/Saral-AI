import React, { useState } from 'react';
import { Shield, Lock, Key, FileCheck, ChevronRight } from 'lucide-react';
import { SecurityPrinciple } from '../types';

const principles: SecurityPrinciple[] = [
  {
    title: 'Tenant Isolation',
    summary: 'Strict data partitioning across hospital instances.',
    detail: 'Each healthcare organization operates within isolated database schemas and encrypted storage buckets. Data from one hospital never mixes or trains another client’s models.',
  },
  {
    title: 'Role-Based Access',
    summary: 'Granular permissions for doctors, staff, and automations.',
    detail: 'Staff accounts, receptionists, doctors, and API agents have strictly scoped authorization. Only assigned medical personnel can inspect confidential patient records.',
  },
  {
    title: 'Secure Authentication',
    summary: 'End-to-end cryptographic handshake and token validation.',
    detail: 'Meta Webhooks are cryptographically signed and verified using HMAC SHA-256. API calls between automation pipelines and hospital backends run over encrypted TLS 1.3 tunnels.',
  },
  {
    title: 'Audit Logging',
    summary: 'Tamper-evident logs of every transaction and action.',
    detail: 'Every webhook received, slot booked, reschedule requested, or staff escalation triggered is logged with timestamp and reference ID for auditable governance.',
  },
];

export const SecuritySection: React.FC = () => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <section id="security" data-reveal-section className="py-24 md:py-36 bg-white border-b border-neutral-100">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Section Heading */}
        <div className="max-w-2xl mb-16 md:mb-20">
          <span className="motion-eyebrow text-xs font-semibold tracking-widest text-neutral-400 uppercase font-mono">
            SECURITY & GOVERNANCE
          </span>
          <h2 className="motion-title text-4xl sm:text-5xl md:text-6xl font-bold text-neutral-950 tracking-[-0.035em] font-display mt-2">
            Built for sensitive workflows.
          </h2>
          <p className="motion-copy text-base sm:text-lg text-neutral-500 mt-3 leading-relaxed">
            Verified workflows. Controlled access.
          </p>
        </div>

        {/* 4 Minimal Principles Grid */}
        <div data-motion-cards className="motion-content grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {principles.map((item, index) => {
            const isExpanded = expandedIndex === index;
            return (
              <button
                key={item.title}
                type="button"
                onClick={() => setExpandedIndex(isExpanded ? null : index)}
                aria-expanded={isExpanded}
                className={`w-full p-6 sm:p-7 rounded-2xl border text-left transition-all cursor-pointer ${
                  isExpanded
                    ? 'bg-neutral-50 border-neutral-950 shadow-xs'
                    : 'bg-white border-neutral-200/90 hover:border-neutral-300'
                }`}
              >
                <div className="text-[11px] font-mono text-neutral-400 uppercase mb-3">
                  Principle 0{index + 1}
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-neutral-950 font-display">
                  {item.title}
                </h3>
                <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                  {item.summary}
                </p>

                {/* Expansion detail */}
                <div className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                  <div className="overflow-hidden">
                    <div className="mt-4 pt-4 border-t border-neutral-200/60 text-xs text-neutral-600 leading-relaxed">{item.detail}</div>
                  </div>
                </div>

                <div className="mt-4 flex items-center text-[11px] font-medium text-neutral-900 group">
                  <span>{isExpanded ? 'Hide details' : 'View architecture detail'}</span>
                  <ChevronRight
                    className={`w-3.5 h-3.5 ml-1 transition-transform ${
                      isExpanded ? 'rotate-90' : ''
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

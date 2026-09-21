import React, { useState } from 'react';

interface FooterProps {
  onOpenDemo: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenDemo }) => {
  const [modalText, setModalText] = useState<string | null>(null);

  const navigateTo = (e: React.MouseEvent, route: string) => {
    e.preventDefault();
    window.location.hash = route;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-white border-t border-neutral-100 py-12 md:py-16 text-neutral-500 text-xs">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-10 border-b border-neutral-100 gap-6">
          {/* Left: Brand */}
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 rounded bg-neutral-950 text-white flex items-center justify-center font-mono text-[10px] font-bold">
                S
              </div>
              <span className="text-base font-bold text-neutral-950 tracking-tight font-display">Saral AI</span>
            </div>
            <p className="text-xs text-neutral-400">
              Built by our team. Minimal interface. Powerful technology.
            </p>
          </div>

          {/* Right: Minimal Navigation */}
          <div className="flex flex-wrap items-center gap-6 text-neutral-600">
            <a
              href="#/services"
              onClick={(e) => navigateTo(e, '/services')}
              className="hover:text-neutral-950 transition-colors"
            >
              Services
            </a>
            <a
              href="#/solutions"
              onClick={(e) => navigateTo(e, '/solutions')}
              className="hover:text-neutral-950 transition-colors"
            >
              Solutions
            </a>
            <a
              href="#/about"
              onClick={(e) => navigateTo(e, '/about')}
              className="hover:text-neutral-950 transition-colors"
            >
              About
            </a>
            <button
              onClick={onOpenDemo}
              className="hover:text-neutral-950 transition-colors cursor-pointer text-neutral-900 font-medium"
            >
              Contact & Demo
            </button>
          </div>
        </div>

        {/* Bottom Line */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-400">
          <div>
            © {new Date().getFullYear()} Saral AI Technologies. All rights reserved.
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() =>
                setModalText(
                  'Privacy Commitment: Saral AI strictly enforces tenant isolation. Patient and enterprise conversations are processed via direct API tunnels and are never retained for model re-training without explicit enterprise authorization.'
                )
              }
              className="hover:text-neutral-800 transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <span>•</span>
            <button
              onClick={() =>
                setModalText(
                  'Terms of Service: Saral AI provides managed infrastructure and deterministic automation workflows with SLA uptime commitments for contracted healthcare and enterprise clients.'
                )
              }
              className="hover:text-neutral-800 transition-colors cursor-pointer"
            >
              Terms of Service
            </button>
            <span>•</span>
            <span className="font-mono">Zero AI Slop</span>
          </div>
        </div>
      </div>

      {/* Lightweight Policy Modal */}
      {modalText && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs"
          onClick={() => setModalText(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-md border border-neutral-200 shadow-xl text-neutral-800 text-xs leading-relaxed space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="font-bold text-sm text-neutral-950 font-display">Legal & Security Governance</div>
            <p>{modalText}</p>
            <button
              onClick={() => setModalText(null)}
              className="px-4 py-1.5 bg-neutral-900 text-white rounded-lg text-xs font-medium hover:bg-black"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </footer>
  );
};

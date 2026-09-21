import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { gsap } from 'gsap';
import { prefersReducedMotion } from '../animations/motion';

interface NavbarProps {
  onOpenDemo: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenDemo }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useLayoutEffect(() => {
    if (!mobileMenuOpen || !drawerRef.current || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(drawerRef.current, { autoAlpha: 0, y: -10 }, { autoAlpha: 1, y: 0, duration: 0.28, ease: 'power3.out' });
      gsap.fromTo(drawerRef.current!.querySelectorAll('a, button'), { autoAlpha: 0, y: -6 }, { autoAlpha: 1, y: 0, duration: 0.22, stagger: 0.045, ease: 'power2.out', delay: 0.06 });
    }, drawerRef);
    return () => ctx.revert();
  }, [mobileMenuOpen]);

  useEffect(() => {
    const button = ctaRef.current;
    if (!button || prefersReducedMotion() || !window.matchMedia('(pointer: fine)').matches) return;
    const move = (event: MouseEvent) => {
      const rect = button.getBoundingClientRect();
      gsap.to(button, { x: (event.clientX - rect.left - rect.width / 2) * 0.1, y: (event.clientY - rect.top - rect.height / 2) * 0.1, scale: 1.02, duration: 0.24, ease: 'power3.out', overwrite: true });
    };
    const leave = () => gsap.to(button, { x: 0, y: 0, scale: 1, duration: 0.4, ease: 'power3.out', overwrite: true });
    button.addEventListener('mousemove', move);
    button.addEventListener('mouseleave', leave);
    return () => {
      button.removeEventListener('mousemove', move);
      button.removeEventListener('mouseleave', leave);
    };
  }, []);

  const navLinks = [
    { name: 'Home', href: '#/' },
    { name: 'Services', href: '#/services' },
    { name: 'Solutions', href: '#/solutions' },
    { name: 'Saral Booking', href: '#/saral-booking' },
    { name: 'Case Studies', href: '#/case-studies' },
    { name: 'About', href: '#/about' },
    { name: 'Contact', href: '#/contact' },
  ];

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (href.startsWith('#/')) {
      window.location.hash = href.slice(1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      id="main-navbar"
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-white/85 backdrop-blur-md border-b border-neutral-200/60 py-3.5 shadow-xs'
          : 'bg-white/60 backdrop-blur-xs border-b border-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Brand */}
        <a
          href="#"
          id="navbar-brand-logo"
          className="flex items-center space-x-2.5 text-neutral-950 font-semibold tracking-tight group"
        >
          <div className="w-6 h-6 rounded-md bg-neutral-950 text-white flex items-center justify-center font-mono text-xs font-bold transition-transform group-hover:scale-105">
            S
          </div>
          <span className="text-lg font-bold tracking-tighter font-display">Saral AI</span>
        </a>

        {/* Minimal Nav items */}
        <nav className="hidden md:flex items-center space-x-9" aria-label="Main Navigation">
          {navLinks.map((link) => (
            <a
              key={link.name}
              id={`nav-link-${link.name.toLowerCase()}`}
              href={link.href}
              onClick={(e) => handleLinkClick(e, link.href)}
              className="text-[14px] font-medium text-neutral-600 hover:text-neutral-950 transition-colors tracking-normal"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Action */}
        <div className="hidden md:flex items-center space-x-4">
          <button
            id="nav-book-demo-btn"
            ref={ctaRef}
            onClick={onOpenDemo}
            className="group inline-flex items-center space-x-1.5 px-4 py-2 text-[14px] font-semibold text-white bg-neutral-950 hover:bg-black rounded-full transition-all duration-200 shadow-xs cursor-pointer"
          >
            <span>Book a Demo</span>
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
        </div>

        {/* Mobile toggle */}
        <div className="flex md:hidden items-center space-x-3">
          <button
            id="nav-book-demo-mobile-cta"
            onClick={onOpenDemo}
            className="px-3 py-1.5 text-xs font-medium text-white bg-neutral-950 rounded-full"
          >
            Book Demo
          </button>
          <button
            id="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-neutral-700 hover:text-neutral-950 focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation-drawer" ref={drawerRef}
          className="md:hidden bg-white border-b border-neutral-200 px-6 py-5 shadow-lg space-y-4 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className="text-base font-medium text-neutral-800 py-1.5 border-b border-neutral-100"
              >
                {link.name}
              </a>
            ))}
          </div>
          <div className="pt-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenDemo();
              }}
              className="w-full py-2.5 bg-neutral-950 text-white text-sm font-medium rounded-lg flex items-center justify-center space-x-2"
            >
              <span>Book a Demo</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

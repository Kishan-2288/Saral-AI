import { useEffect, useRef, useState } from 'react';
import { usePageMotion } from './animations/motion';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { CoreMessage } from './components/CoreMessage';
import { SignatureInteraction } from './components/SignatureInteraction';
import { Industries } from './components/Industries';
import { HowItWorks } from './components/HowItWorks';
import { FinalCTA } from './components/FinalCTA';
import { Footer } from './components/Footer';
import { BookDemoModal } from './components/BookDemoModal';
import { AboutPage, BookingPage, CaseStudiesPage, ContactPage, DemoPage, ServicesPage, SolutionsPage } from './components/Pages';
import { BookingSessionPage } from './components/BookingSessionPage';

export default function App() {
  const mainRef = useRef<HTMLElement>(null);
  usePageMotion(mainRef);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState('Healthcare');
  const bookingToken = window.location.pathname.match(/^\/book\/([^/]+)/)?.[1];
  const [route, setRoute] = useState(() => bookingToken ? 'booking-session' : window.location.hash.replace('#/', '') || 'home');

  useEffect(() => {
    const syncRoute = () => setRoute(window.location.hash.replace('#/', '') || 'home');
    window.addEventListener('hashchange', syncRoute);
    return () => window.removeEventListener('hashchange', syncRoute);
  }, []);

  const handleOpenDemo = (industry = 'Healthcare') => {
    setSelectedIndustry(industry);
    setIsDemoModalOpen(true);
  };
  const goToDemo = () => {
    window.location.hash = '/book-demo';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const handleExploreScroll = () => document.getElementById('hero-scroll-experience')?.scrollIntoView({ behavior: 'smooth' });

  const page = {
    services: <ServicesPage onBookDemo={handleOpenDemo} />,
    solutions: <SolutionsPage />,
    'saral-booking': <BookingPage />,
    'case-studies': <CaseStudiesPage />,
    about: <AboutPage />,
    contact: <ContactPage onBookDemo={goToDemo} />,
    'book-demo': <DemoPage onBookDemo={handleOpenDemo} />,
  }[route];
  const isBookingPage = route === 'saral-booking' || route === 'booking-session';

  if (route === 'booking-session' && bookingToken) {
    return <BookingSessionPage token={decodeURIComponent(bookingToken)} />;
  }

  return <div className="min-h-screen bg-white text-neutral-900 font-sans selection:bg-neutral-900 selection:text-white">
    {!isBookingPage && <Navbar onOpenDemo={goToDemo} />}
    <main ref={mainRef}>
      {page ?? <>
        <Hero onOpenDemo={goToDemo} onExploreScroll={handleExploreScroll} />
        <CoreMessage />
        <SignatureInteraction />
        <HowItWorks />
        <Industries onOpenDemo={(industry) => handleOpenDemo(industry || 'Healthcare')} />
        <FinalCTA onOpenDemo={goToDemo} />
      </>}
    </main>
    {!isBookingPage && <Footer onOpenDemo={goToDemo} />}
    {!isBookingPage && <BookDemoModal isOpen={isDemoModalOpen} onClose={() => setIsDemoModalOpen(false)} defaultIndustry={selectedIndustry} />}
  </div>;
}

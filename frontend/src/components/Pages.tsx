import { ArrowRight, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Clock3, MapPin, Phone, UserRound } from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';

type PageProps = { onBookDemo: () => void };

const PageHero = ({ eyebrow, title, copy, onBookDemo }: { eyebrow: string; title: string; copy: string; onBookDemo?: () => void }) => (
  <section className="border-b border-neutral-100 bg-neutral-50/60 pt-32 pb-18 md:pt-40 md:pb-24">
    <div className="mx-auto max-w-7xl px-6 md:px-12">
      <p className="text-label mb-5 text-neutral-500">{eyebrow}</p>
      <h1 className="max-w-4xl text-neutral-950">{title}</h1>
      <p className="mt-6 max-w-[600px] text-[17px] leading-[1.65] text-neutral-600">{copy}</p>
      {onBookDemo && <button onClick={onBookDemo} className="mt-8 inline-flex items-center gap-2 rounded-full bg-neutral-950 px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-black">Book a Demo <ArrowRight className="h-4 w-4" /></button>}
    </div>
  </section>
);

const Section = ({ eyebrow, title, children }: { key?: string; eyebrow?: string; title: string; children: ReactNode }) => (
  <section className="border-b border-neutral-100 py-20 md:py-28">
    <div className="mx-auto max-w-7xl px-6 md:px-12">
      {eyebrow && <p className="text-label mb-3 text-neutral-400">{eyebrow}</p>}
      <h2 className="max-w-3xl text-neutral-950">{title}</h2>
      <div className="mt-10">{children}</div>
    </div>
  </section>
);

const BulletList = ({ items }: { items: string[] }) => <ul className="grid gap-3 text-[16px] leading-[1.7] text-neutral-600 sm:grid-cols-2">{items.map((item) => <li key={item} className="flex gap-3"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-neutral-900" />{item}</li>)}</ul>;

const Flow = ({ children }: { children: string }) => <p className="rounded-2xl border border-neutral-200 bg-neutral-50 px-5 py-4 text-[15px] font-medium leading-[1.65] text-neutral-800">{children}</p>;

export function ServicesPage({ onBookDemo }: PageProps) {
  const services = [
    ['AI Agents', 'Intelligent agents for customer enquiries, lead qualification, appointment booking, FAQs, payments, follow-ups, customer support, and internal workflows.'],
    ['WhatsApp Automation', 'Turn WhatsApp into a 24/7 business assistant for questions, service information, availability, reminders, payments, support, and human handoff.'],
    ['Instagram Automation', 'Turn Instagram DMs into structured customer journeys that understand intent, answer, capture, qualify, follow up, and convert.'],
    ['Lead Automation', 'Capture, organize, qualify, and follow up with every lead—without missed conversations or manual tracking.'],
    ['Appointment & Booking Automation', 'Move customers from WhatsApp or Instagram to a confirmed appointment, consultation, site visit, reservation, or session—with server-verified availability, optional Razorpay payment, and instant confirmation.'],
    ['Payment Automation', 'Connect payment requests, links, confirmations, fee reminders, and order workflows to the customer journey.'],
    ['Customer Support', 'Let AI answer routine questions instantly and route complex conversations to the right person.'],
    ['Workflow Automation', 'Connect customers, AI, business logic, databases, APIs, and actions across your existing systems.'],
  ];
  return <><PageHero eyebrow="AI Automation Services" title="We Automate the Work That Slows Your Business Down." copy="From customer conversations to internal workflows, Saral AI helps businesses reduce repetitive work and build smarter operations." onBookDemo={onBookDemo} /><Section title="Intelligent agents for real business tasks"><div className="grid gap-5 md:grid-cols-2">{services.map(([name, description]) => <article key={name} className="rounded-2xl border border-neutral-200 p-6"><h3 className="text-neutral-950">{name}</h3><p className="mt-3 text-[15px] leading-[1.65] text-neutral-600">{description}</p></article>)}</div></Section><Section eyebrow="Workflow Automation" title="Connect your business processes."><Flow>Customer → AI → Business Logic → Database/API → Action → Customer</Flow><p className="mt-5 max-w-2xl text-neutral-600">The goal is not simply to add AI. The goal is to make your business operate more efficiently.</p></Section></>;
}

const industries: Array<[string, string, string[], string]> = [
  ['Healthcare', 'Automate Patient Communication', ['Appointment booking', 'Doctor availability', 'Patient enquiries', 'FAQs', 'Appointment reminders', 'Follow-ups', 'Payment workflows', 'Report notifications', 'Human handoff'], 'Patient → WhatsApp → Saral AI → Appointment Agent → Availability → Confirmation'],
  ['Real Estate', 'Turn Property Enquiries Into Opportunities', ['Property enquiries', 'Lead qualification', 'Property information', 'Site visit scheduling', 'Lead capture', 'Follow-ups', 'Customer support'], 'Lead → Property Enquiry → AI Qualification → Property Match → Site Visit → Follow-Up'],
  ['Education', 'Automate Student Enquiries and Admissions', ['Course enquiries', 'Batch information', 'Fee information', 'Class schedules', 'Demo-class booking', 'Admission enquiries', 'Counselling', 'Student registration', 'Fee reminders', 'Follow-ups'], 'Student → WhatsApp → Course Enquiry → AI Assistant → Counselling → Registration → Follow-Up'],
  ['Restaurants', 'Make Customer Communication Effortless', ['Table reservations', 'Restaurant information', 'Menu enquiries', 'Booking confirmations', 'Customer questions', 'Promotions', 'Order-related communication', 'Feedback'], 'Customer → WhatsApp → Reservation Request → Availability → Confirmation'],
];

export function SolutionsPage() {
  return <><PageHero eyebrow="Solutions Built Around Your Industry" title="One AI Automation Platform. Multiple Industries." copy="Every industry has different customers, processes, and challenges. Saral AI adapts automation to the way your business actually works." />{industries.map(([industry, title, useCases, flow]) => <Section key={industry} eyebrow={industry} title={title}><BulletList items={useCases as string[]} /><div className="mt-8 max-w-4xl"><Flow>{flow as string}</Flow></div></Section>)}<Section eyebrow="Other Businesses" title="If your business has repetitive work, we can automate it."><p className="max-w-2xl text-neutral-600">Saral AI is not limited to predefined industries. Your workflow is unique, and your automation should be too.</p><div className="mt-7"><BulletList items={['Customer enquiries', 'Lead management', 'Bookings and reminders', 'Payments and follow-ups', 'Customer support', 'Internal processes']} /></div></Section></>;
}

const bookingServices = [
  { name: 'Cardiology Consultation', description: 'Heart health consultation and follow-up care.' },
  { name: 'General Physician', description: 'Routine care, symptoms, and health guidance.' },
  { name: 'Dermatology Consultation', description: 'Skin, hair, and nail health consultation.' },
  { name: 'Follow-up Consultation', description: 'Continue care with your treating specialist.' },
];

const doctors = [
  { name: 'Dr. Rahul Sharma', role: 'Cardiologist', initials: 'RS' },
  { name: 'Dr. Priya Singh', role: 'General Physician', initials: 'PS' },
  { name: 'Dr. Aman Verma', role: 'Dermatologist', initials: 'AV' },
];

const slots = ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM', '03:00 PM'];

export function BookingPage() {
  const [service, setService] = useState('Cardiology Consultation');
  const [doctor, setDoctor] = useState('Dr. Rahul Sharma');
  const [selectedDay, setSelectedDay] = useState(18);
  const [slot, setSlot] = useState('11:00 AM');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const days = useMemo(() => [14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26], []);
  const formattedDate = `${selectedDay} September 2026`;

  if (confirmed) return <>
    <PageHero eyebrow="Saral Booking" title="Appointment Confirmed." copy="Your appointment has been reserved. We have also sent the details back to your conversation channel." />
    <Section title="Your appointment details"><div className="max-w-2xl rounded-3xl border border-neutral-200 bg-neutral-50 p-7 md:p-9"><div className="flex items-center gap-3 text-neutral-950"><span className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-950 text-white"><CheckCircle2 className="h-5 w-5" /></span><div><p className="font-display text-xl font-semibold">ABC Hospital</p><p className="text-sm text-neutral-500">Appointment ID · SARAL-2026-001284</p></div></div><div className="mt-8 grid gap-6 border-y border-neutral-200 py-7 sm:grid-cols-2"><div><p className="text-label text-neutral-400">Service</p><p className="mt-1 font-medium">{service}</p></div><div><p className="text-label text-neutral-400">Doctor</p><p className="mt-1 font-medium">{doctor}</p></div><div><p className="text-label text-neutral-400">Date</p><p className="mt-1 font-medium">{formattedDate}</p></div><div><p className="text-label text-neutral-400">Time</p><p className="mt-1 font-medium">{slot}</p></div></div><div className="mt-7 flex flex-wrap gap-3"><button className="rounded-full bg-neutral-950 px-5 py-3 text-white">Add to Calendar</button><button onClick={() => setConfirmed(false)} className="rounded-full border border-neutral-300 px-5 py-3 text-neutral-800">Edit appointment</button></div></div></Section>
  </>;

  return <>
    <PageHero eyebrow="Saral Booking" title="From WhatsApp to a Confirmed Appointment." copy="Patients can choose a department, doctor, date, and verified available slot, then pay through Razorpay when required. The same engine also supports counselling, site visits, and reservations." />
    <section className="py-14 md:py-20"><div className="mx-auto grid max-w-7xl gap-10 px-6 md:px-12 lg:grid-cols-[1.45fr_.75fr]"><div className="space-y-10"><div className="rounded-3xl border border-neutral-200 p-6 md:p-8"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-label text-neutral-400">Booking with</p><h3 className="mt-1">ABC Hospital</h3></div><span className="rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-600">Powered by Saral AI</span></div><div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-neutral-500"><span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />Greater Noida</span><span className="flex items-center gap-1.5"><Phone className="h-4 w-4" />+91 98765 43210</span></div></div>
      <BookingStep number="01" title="What would you like to book?"><div className="grid gap-3 sm:grid-cols-2">{bookingServices.map((item) => <button key={item.name} onClick={() => setService(item.name)} className={`rounded-2xl border p-4 text-left transition-colors ${service === item.name ? 'border-neutral-950 bg-neutral-950 text-white' : 'border-neutral-200 hover:border-neutral-400'}`}><p className="font-display font-semibold">{item.name}</p><p className={`mt-1 text-sm leading-5 ${service === item.name ? 'text-neutral-300' : 'text-neutral-500'}`}>{item.description}</p></button>)}</div></BookingStep>
      <BookingStep number="02" title="Select your doctor"><div className="grid gap-3 sm:grid-cols-3">{doctors.map((item) => <button key={item.name} onClick={() => setDoctor(item.name)} className={`rounded-2xl border p-4 text-left ${doctor === item.name ? 'border-neutral-950 bg-neutral-50' : 'border-neutral-200 hover:border-neutral-400'}`}><span className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-neutral-900 text-xs font-semibold text-white">{item.initials}</span><p className="font-medium text-neutral-950">{item.name}</p><p className="mt-1 text-sm text-neutral-500">{item.role}</p></button>)}</div></BookingStep>
      <BookingStep number="03" title="Select date and time"><div className="rounded-2xl border border-neutral-200 p-4 md:p-5"><div className="flex items-center justify-between"><button className="rounded-lg p-2 hover:bg-neutral-100" aria-label="Previous month"><ChevronLeft className="h-4 w-4" /></button><p className="font-display font-semibold">September 2026</p><button className="rounded-lg p-2 hover:bg-neutral-100" aria-label="Next month"><ChevronRight className="h-4 w-4" /></button></div><div className="mt-5 grid grid-cols-7 gap-1 text-center text-xs text-neutral-400">{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(day => <span key={day} className="py-2">{day}</span>)}{days.map(day => <button key={day} onClick={() => setSelectedDay(day)} className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm transition-colors ${selectedDay === day ? 'bg-neutral-950 text-white' : 'text-neutral-700 hover:bg-neutral-100'}`}>{day}</button>)}</div></div><p className="mt-7 text-sm font-medium text-neutral-700">Available slots for {formattedDate}</p><div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">{slots.map((time, index) => <button key={time} disabled={index === 1 || index === 6} onClick={() => setSlot(time)} className={`rounded-xl border px-3 py-3 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:border-neutral-100 disabled:bg-neutral-50 disabled:text-neutral-300 ${slot === time ? 'border-neutral-950 bg-neutral-950 text-white' : 'border-neutral-200 text-neutral-700 hover:border-neutral-400'}`}>{time}</button>)}</div></BookingStep>
      <BookingStep number="04" title="Tell us about yourself"><div className="grid gap-4 sm:grid-cols-2"><BookingInput label="Full name" value={name} onChange={setName} placeholder="Your full name" /><BookingInput label="Phone number" value={phone} onChange={setPhone} placeholder="+91 00000 00000" /><div className="sm:col-span-2"><BookingInput label="Email address" value={email} onChange={setEmail} placeholder="you@example.com" /></div></div></BookingStep>
    </div><aside className="h-fit rounded-3xl border border-neutral-200 bg-neutral-50 p-6 lg:sticky lg:top-28"><p className="text-label text-neutral-400">Your appointment</p><h3 className="mt-2">Almost there.</h3><div className="mt-6 space-y-5 border-y border-neutral-200 py-6 text-sm"><SummaryItem icon={<UserRound />} label="Service" value={service} /><SummaryItem icon={<UserRound />} label="Doctor" value={doctor} /><SummaryItem icon={<CalendarDays />} label="Date" value={formattedDate} /><SummaryItem icon={<Clock3 />} label="Time" value={slot} /></div><button onClick={() => setConfirmed(true)} disabled={!name.trim() || !phone.trim()} className="mt-6 w-full rounded-full bg-neutral-950 px-5 py-3 text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:bg-neutral-300">Continue to Payment · ₹800 <ArrowRight className="ml-1 inline h-4 w-4" /></button><p className="mt-3 text-center text-xs leading-5 text-neutral-500">Payment is handled securely through Razorpay when required.</p></aside></div></section>
  </>;
}

function BookingStep({ number, title, children }: { number: string; title: string; children: ReactNode }) { return <section><div className="mb-5 flex items-center gap-3"><span className="text-label rounded-full bg-neutral-100 px-2.5 py-1 text-neutral-500">{number}</span><h3>{title}</h3></div>{children}</section>; }
function BookingInput({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) { return <label className="block text-sm font-medium text-neutral-700">{label}<input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3 text-[15px] outline-none transition-colors placeholder:text-neutral-400 focus:border-neutral-950" /></label>; }
function SummaryItem({ icon, label, value }: { icon: ReactNode; label: string; value: string }) { return <div className="flex gap-3"><span className="mt-0.5 text-neutral-400">{icon}</span><div><p className="text-xs text-neutral-400">{label}</p><p className="mt-0.5 font-medium text-neutral-800">{value}</p></div></div>; }

const studies: Array<[string, string, string, string[], string]> = [
  ['Education — Coaching Institute', 'The institute receives frequent course, fee, batch, schedule, and admission enquiries through WhatsApp and Instagram.', 'Enquiry → AI Assistant → Course Information → Lead Capture → Counselling → Follow-Up', ['Course FAQs', 'Batch information', 'Fee enquiries', 'Lead capture', 'Counselling requests', 'Follow-ups'], 'A structured enquiry journey that reduces repetitive communication for the team.'],
  ['Healthcare — Appointment Automation', 'Patients repeatedly contact staff about doctors, availability, dates, and appointment slots.', 'Patient → WhatsApp → AI Assistant → Doctor Selection → Availability → Booking → Confirmation → Reminder', ['Doctor information', 'Availability', 'Appointment booking', 'Confirmation', 'Reminders', 'Rescheduling'], 'A smoother appointment journey with less repetitive work for staff.'],
  ['Real Estate — Lead Qualification', 'Property enquiries arrive from multiple channels, making it difficult to respond and follow up consistently.', 'Enquiry → AI Assistant → Requirement Capture → Lead Qualification → Property Information → Site Visit → Follow-Up', ['Lead capture', 'Requirement collection', 'Property enquiries', 'Qualification', 'Site visit scheduling', 'Follow-ups'], 'A structured lead journey from first conversation to sales follow-up.'],
];

export function CaseStudiesPage() {
  return <><PageHero eyebrow="Real Problems. Practical Automation." title="See What AI Automation Can Look Like." copy="Every business has different processes. Saral AI designs workflows around specific operational problems instead of forcing businesses into generic automation." />{studies.map(([title, challenge, flow, tasks, result], index) => <Section key={title} eyebrow={`Use Case ${String(index + 1).padStart(2, '0')}`} title={title}><div className="grid gap-9 lg:grid-cols-2"><div><p className="text-label text-neutral-400">Challenge</p><p className="mt-2 text-neutral-600">{challenge}</p><p className="text-label mt-7 text-neutral-400">Saral AI Workflow</p><div className="mt-2"><Flow>{flow}</Flow></div></div><div><p className="text-label text-neutral-400">Automated Tasks</p><div className="mt-3"><BulletList items={tasks as string[]} /></div><p className="text-label mt-7 text-neutral-400">Result</p><p className="mt-2 text-neutral-600">{result}</p></div></div></Section>)}<Section title="We don't invent metrics."><p className="mb-7 max-w-2xl text-neutral-600">We measure what matters to your business and workflow.</p><BulletList items={['Leads captured', 'Response time', 'Appointments booked', 'Follow-ups completed', 'Automated conversations', 'Human handoffs', 'Payment conversions', 'Workflow completion']} /></Section></>;
}

export function AboutPage() {
  return <><PageHero eyebrow="About Saral AI" title="Making Business Automation Simple." copy="Saral AI makes automation simple, practical, and accessible for businesses of different sizes and industries." /><Section eyebrow="Our Mission" title="Make Automation Accessible to Every Business."><p className="max-w-2xl text-neutral-600">Growing businesses, coaching institutes, restaurants, healthcare providers, and service businesses deserve the same operational advantage that automation gives large organizations.</p></Section><Section eyebrow="What We Believe" title="AI should work with your business, not against it."><div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">{[['AI Intelligence', 'Understands what the customer wants.'], ['Business Logic', 'Determines what actions are allowed.'], ['Automation', 'Executes the required workflow.'], ['Human Support', 'Takes over when human judgment is required.']].map(([title, copy]) => <article key={title} className="rounded-2xl border border-neutral-200 p-5"><h3>{title}</h3><p className="mt-2 text-[15px] leading-[1.65] text-neutral-600">{copy}</p></article>)}</div></Section><Section eyebrow="Our Approach" title="Understand. Design. Build. Test. Launch. Improve."><BulletList items={['Understand your business, customers, and existing workflows.', 'Identify repetitive processes that can be automated.', 'Connect AI with your systems and build the required workflows.', 'Test conversations, edge cases, and human handoffs.', 'Deploy, monitor, and improve based on real usage.']} /></Section><Section eyebrow="Our Philosophy" title="Simple for the customer. Powerful behind the scenes."><p className="max-w-2xl text-neutral-600">Customers should simply be able to say what they need. Saral AI handles the complexity behind the conversation.</p></Section></>;
}

export function ContactPage({ onBookDemo }: PageProps) {
  return <><PageHero eyebrow="Let's Talk About Your Business" title="Have a Workflow You Want to Automate?" copy="Tell us what takes too much time in your business. We'll explore where AI and automation can make the biggest difference." /><Section title="Let's build something smarter."><div className="max-w-2xl rounded-3xl border border-neutral-200 bg-neutral-50 p-7"><p className="text-neutral-600">For general enquiries, tell us about your business and workflow. For a conversion-focused consultation, book a demo with our team.</p><button onClick={onBookDemo} className="mt-6 inline-flex items-center gap-2 rounded-full bg-neutral-950 px-6 py-3 text-white">Book a Demo <ArrowRight className="h-4 w-4" /></button></div></Section><Section eyebrow="Direct Contact" title="Have a question?"><p className="max-w-2xl text-neutral-600">Whether you are exploring automation for the first time or already have a workflow in mind, we'd love to hear from you.</p><a className="mt-5 inline-block font-semibold text-neutral-950 underline underline-offset-4" href="mailto:hello@saralai.com">hello@saralai.com</a></Section></>;
}

export function DemoPage({ onBookDemo }: PageProps) {
  return <><PageHero eyebrow="See Saral AI in Action" title="Let's Automate Your Business." copy="Tell us about your business and the repetitive workflows you want to automate. We'll show you how Saral AI can fit into your existing operations." onBookDemo={onBookDemo} /><Section title="What we'll discuss"><div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{[['Your Business', 'How you currently handle customers, leads, and operations.'], ['Your Workflow', 'The repetitive processes that consume your team’s time.'], ['Automation Opportunities', 'Where AI and workflow automation create the most value.'], ['Your Systems', 'The tools, databases, channels, and APIs you already use.'], ['Your Automation Plan', 'A practical roadmap for implementation.']].map(([title, copy]) => <article key={title} className="rounded-2xl border border-neutral-200 p-6"><h3>{title}</h3><p className="mt-2 text-[15px] leading-[1.65] text-neutral-600">{copy}</p></article>)}</div><button onClick={onBookDemo} className="mt-10 inline-flex items-center gap-2 rounded-full bg-neutral-950 px-6 py-3 text-white">Book My Demo <ArrowRight className="h-4 w-4" /></button></Section></>;
}

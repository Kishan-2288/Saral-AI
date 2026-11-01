import type { Dictionary } from "../types";

// Copy rules: headline ≤ 8 words, support text ≤ 2 lines, no invented claims.
// Anything unverified is marked TODO(owner) and listed in README.

export const en: Dictionary = {
  siteName: "Saral AI",
  meta: {
    home: {
      title: "Saral AI: WhatsApp AI appointment assistant for clinics and hospitals",
      description:
        "Saral AI books, reschedules and cancels appointments on WhatsApp, answers routine patient questions, and hands over to your staff whenever a human touch is needed.",
    },
    features: {
      title: "Features: booking, rescheduling, FAQs and handoff",
      description:
        "Everything Saral AI does on WhatsApp for clinics and hospitals: booking, upcoming appointments, rescheduling, cancellations, FAQs, voice notes, reminders and human handoff.",
    },
    howItWorks: {
      title: "How Saral AI works: from a WhatsApp message to a booked slot",
      description:
        "A patient messages on WhatsApp, Saral AI understands the request, books an open slot and confirms. Staff take over whenever needed.",
    },
    clinics: {
      title: "WhatsApp appointment booking for clinics",
      description:
        "Let patients book, change and cancel clinic appointments on WhatsApp, and free your front desk from repeat calls.",
    },
    hospitals: {
      title: "AI appointment assistant for hospitals",
      description:
        "Appointment workflows on WhatsApp for hospitals, diagnostic centres and IVF centres, with safe handoff to staff.",
    },
    security: {
      title: "Security and trust",
      description:
        "How Saral AI separates clinic data, controls access, verifies WhatsApp webhooks and logs every action. No patient data is collected on this website.",
    },
    pricing: {
      title: "Pricing: talk to us",
      description: "Saral AI pricing depends on your workflows, integrations and message volume. Talk to us for a quote.",
    },
    demo: {
      title: "Book a demo",
      description: "Tell us about your clinic or hospital and we will set up a Saral AI demo.",
    },
    about: {
      title: "About Saral AI",
      description: "Saral means simple. We make healthcare scheduling simple for patients and for front-desk teams.",
    },
    privacy: { title: "Privacy policy (draft)", description: "How the Saral AI website handles information." },
    terms: { title: "Terms of use (draft)", description: "Terms for using the Saral AI website." },
    cookies: { title: "Cookie policy (draft)", description: "What the Saral AI website stores in your browser." },
  },
  nav: {
    features: "Features", howItWorks: "How it works", security: "Security", pricing: "Pricing", about: "About",
    clinics: "Clinics", hospitals: "Hospitals", solutions: "Solutions", demo: "Book a Demo",
    skip: "Skip to content", menu: "Open menu", closeMenu: "Close menu", primary: "Main navigation",
    footerNav: "Footer navigation", legalNav: "Legal", home: "Saral AI home",
  },
  cta: { demo: "Book a Demo", whatsapp: "Chat on WhatsApp", talk: "Talk to us" },
  hero: {
    title: "Appointments on WhatsApp. Made Saral.",
    lead: "Saral AI books, reschedules and cancels appointments on WhatsApp, and hands over to your staff whenever a human touch is needed.",
    demoHint: "Try the chat demo",
    posterAlt: "A phone showing a WhatsApp-style chat where a patient books an appointment.",
  },
  problem: {
    title: "The phone rings. The front desk can’t keep up.",
    lead: "Every missed call is a patient who may book somewhere else.",
    items: [
      { title: "Overloaded front desk", text: "The same questions, all day, on the phone." },
      { title: "Missed calls", text: "A missed call can be a lost appointment." },
      { title: "No-shows", text: "Without reminders, patients forget." },
      { title: "After-hours questions", text: "Messages sit unanswered until morning." },
      { title: "Scheduling errors", text: "Manual booking leads to mistakes." },
    ],
  },
  how: {
    title: "From a message to a booked slot.",
    lead: "Four steps. The patient never leaves WhatsApp.",
    steps: [
      { title: "Patient messages", text: "A patient writes on WhatsApp, in text or as a voice note." },
      { title: "Saral AI understands", text: "It works out what they need: a new booking, a change, a cancellation or a question." },
      { title: "Slot is booked", text: "It checks your availability and offers slots that are actually open." },
      { title: "Patient is confirmed", text: "The confirmation arrives on WhatsApp, with the details the patient needs." },
    ],
  },
  features: {
    title: "Everything the front desk repeats, handled.",
    lead: "Six things patients ask for most, in one chat.",
    patientLabel: "Example",
    resultLabel: "What happens",
    items: [
      {
        id: "booking", title: "Booking",
        text: "Patients ask in their own words. Saral AI finds the doctor and an open slot, then confirms.",
        detail: "It understands department, doctor and date preferences, checks availability, and confirms the visit on WhatsApp.",
        example: { label: "Patient writes", text: "“Can I schedule a consultation with Dr. Sharma tomorrow evening?”", result: "A slot is held and a confirmation is sent on WhatsApp." },
      },
      {
        id: "upcoming", title: "Upcoming appointments",
        text: "Patients check their next visit without calling the front desk.",
        detail: "Patients can ask when their appointment is and get the time and clinic details in the chat.",
        example: { label: "Patient writes", text: "“Do I have any appointments scheduled this week?”", result: "Saral AI finds the patient’s appointment and replies with the time and clinic details." },
      },
      {
        id: "reschedule", title: "Rescheduling and cancellation",
        text: "Changes happen in the chat. A cancelled slot is released for someone else.",
        detail: "Patients move to another open slot or cancel, with no phone call and no manual update by your team.",
        example: { label: "Patient writes", text: "“I can’t make it tomorrow at 5:30 PM. Can I move to Friday morning?”", result: "The old slot is released and the new one is confirmed on WhatsApp." },
      },
      {
        id: "support", title: "FAQs and handoff",
        text: "Clinic hours, doctor timings, visit guidelines. Anything beyond that goes to your staff.",
        detail: "Saral AI answers routine questions. When a question is outside what it should answer, it alerts your front desk.",
        example: { label: "Patient writes", text: "“My child has a specific allergic rash, should we see Dr. Joshi today?”", result: "Saral AI doesn’t answer clinical questions. It alerts the front desk for a human follow-up." },
      },
      {
        id: "voice", title: "Voice notes",
        text: "Patients can send a voice note, including in Hindi or Hinglish.",
        detail: "The note is transcribed and the request is handled like a typed message. If transcription fails, the chat falls back to text.",
        example: { label: "Patient sends", text: "🎤 Voice note (0:08): “Dr. Sharma se kal milna tha, appointment book kar do.”", result: "The note is transcribed and the booking flow runs." },
      },
      {
        id: "reminders", title: "Reminders",
        text: "Appointment reminders and follow-ups go out on WhatsApp.",
        detail: "Patients get reminded before the visit, which helps reduce no-shows.",
        example: { label: "Saral AI sends", text: "“Reminder: Dr. Sharma, tomorrow at 5:30 PM.”", result: "The patient is reminded on WhatsApp, where they already are." },
      },
    ],
  },
  chat: {
    title: "Try a conversation.",
    lead: "Pick a scenario, then tap the patient’s message to send it.",
    clinicName: "Demo Clinic",
    assistantName: "Saral AI",
    online: "AI assistant",
    notice: "Scripted demo with sample data. Nothing you do here is sent anywhere.",
    intro: "Hi, I’m Saral AI, the virtual assistant for Demo Clinic. I can help with appointments. You can ask for a person at any time.",
    chooseFlow: "Choose a scenario",
    tapToSend: "Tap to send",
    replay: "Replay",
    typing: "Saral AI is typing",
    handoffBadge: "Human takes over",
    inputPlaceholder: "Message",
    flowsLabel: "Demo scenarios",
    sampleData: "Sample data",
    alertLabel: "Urgent",
    flows: [
      {
        id: "book", label: "Book",
        turns: [
          { prompt: "Can I book Dr. Sharma tomorrow evening?", patient: { from: "patient", text: "Can I book Dr. Sharma tomorrow evening?" },
            replies: [{ from: "bot", text: "Dr. Sharma (Cardiology) has these open slots tomorrow:", buttons: ["5:30 PM", "6:15 PM", "7:00 PM"] }] },
          { prompt: "5:30 PM", patient: { from: "patient", text: "5:30 PM" },
            replies: [{ from: "bot", text: "Please confirm: Dr. Sharma, tomorrow at 5:30 PM. Shall I book it?", buttons: ["Yes, book it", "Change"] }] },
          { prompt: "Yes, book it", patient: { from: "patient", text: "Yes, book it" },
            replies: [{ from: "bot", text: "Booked. Dr. Sharma, tomorrow at 5:30 PM. I’ll remind you before the visit. To change it, just message me here." }] },
        ],
      },
      {
        id: "reschedule", label: "Reschedule",
        turns: [
          { prompt: "I can’t make it tomorrow at 5:30 PM. Can I move to Friday morning?", patient: { from: "patient", text: "I can’t make it tomorrow at 5:30 PM. Can I move to Friday morning?" },
            replies: [{ from: "bot", text: "Sure. Dr. Sharma has these slots on Friday morning:", buttons: ["9:30 AM", "10:15 AM", "11:00 AM"] }] },
          { prompt: "10:15 AM", patient: { from: "patient", text: "10:15 AM" },
            replies: [{ from: "bot", text: "Please confirm: move your visit from tomorrow 5:30 PM to Friday 10:15 AM?", buttons: ["Yes, move it", "Keep it"] }] },
          { prompt: "Yes, move it", patient: { from: "patient", text: "Yes, move it" },
            replies: [{ from: "bot", text: "Done. Your appointment is now Friday at 10:15 AM. The old slot has been released." }] },
        ],
      },
      {
        id: "cancel", label: "Cancel",
        turns: [
          { prompt: "Please cancel my appointment", patient: { from: "patient", text: "Please cancel my appointment" },
            replies: [{ from: "bot", text: "You have an appointment with Dr. Sharma on Friday at 10:15 AM. Cancel it?", buttons: ["Yes, cancel", "Keep it"] }] },
          { prompt: "Yes, cancel", patient: { from: "patient", text: "Yes, cancel" },
            replies: [{ from: "bot", text: "Cancelled. The slot is open for someone else. Message me any time to book again." }] },
        ],
      },
      {
        id: "voice", label: "Voice note",
        turns: [
          { prompt: "🎤 Send a voice note (0:08)", patient: { from: "patient", kind: "voice", voiceLength: "0:08", text: "Dr. Sharma se kal milna tha, appointment book kar do." },
            replies: [{ from: "bot", text: "I understood: “Dr. Sharma se kal milna tha, appointment book kar do.” Dr. Sharma has these slots tomorrow:", buttons: ["5:30 PM", "6:15 PM"] }] },
          { prompt: "5:30 PM", patient: { from: "patient", text: "5:30 PM" },
            replies: [{ from: "bot", text: "Booked. Dr. Sharma, tomorrow at 5:30 PM." }] },
        ],
      },
      {
        id: "rash", label: "Health question",
        turns: [
          { prompt: "My child has a specific allergic rash. Should we see Dr. Joshi today?", patient: { from: "patient", text: "My child has a specific allergic rash. Should we see Dr. Joshi today?" },
            replies: [
              { from: "bot", text: "I can’t give medical advice, so I won’t guess. I’m passing this to our front desk now." },
              { event: "handoff" },
              { from: "staff", text: "Hi, this is the front desk at Demo Clinic. I’ve read your message and I’ll help you from here." },
            ] },
        ],
      },
      {
        id: "emergency", label: "Emergency",
        turns: [
          { prompt: "My father has chest pain and trouble breathing", patient: { from: "patient", text: "My father has chest pain and trouble breathing" },
            replies: [
              { from: "bot", kind: "alert", text: "This may be an emergency. I can’t give medical advice. Please call your local emergency number now (112 in India) or go to the nearest emergency room." },
              { event: "handoff" },
              { from: "staff", text: "Front desk here. We’ve been alerted. Please call emergency services if you haven’t already." },
            ] },
        ],
      },
    ],
  },
  handoff: {
    title: "A human, whenever it matters.",
    lead: "When a chat needs a person, it moves to your staff with the conversation attached.",
    triggersTitle: "Saral AI hands over when",
    triggers: [
      "the patient asks for a person",
      "it isn’t sure of the answer",
      "the question is clinical",
      "emergency words appear",
    ],
    from: "Saral AI", to: "Your staff", badge: "Human takes over",
  },
  dashboard: {
    title: "A clear view for your team.",
    lead: "Appointments and handed-over chats in one place.",
    badge: "Illustrative · sample data",
    caption: "Illustrative mockup. Not a screenshot of a live clinic.",
    columns: { time: "Time", patient: "Patient", doctor: "Doctor", status: "Status" },
    rows: [
      { time: "09:30", patient: "Patient A", doctor: "Dr. Sharma", status: "Confirmed" },
      { time: "10:15", patient: "Patient B", doctor: "Dr. Joshi", status: "Confirmed" },
      { time: "11:00", patient: "Patient C", doctor: "Dr. Sharma", status: "Rescheduled" },
      { time: "11:45", patient: "Patient D", doctor: "Dr. Joshi", status: "Cancelled" },
    ],
    handoffRow: "Chat handed to staff",
  },
  security: {
    title: "Built for sensitive conversations.",
    lead: "Healthcare is private. The platform is designed around that.",
    items: [
      { title: "Tenant isolation", text: "Each clinic’s data is kept separate from every other clinic’s." },
      { title: "Role-based access", text: "Staff, doctors and automations get only the access their role needs." },
      { title: "Verified webhooks", text: "Incoming WhatsApp messages are checked with HMAC signatures before anything runs." },
      { title: "Audit logs", text: "Every booking, change and handoff is logged with a time and a reference." },
    ],
    siteTitle: "No patient data on this website",
    siteText: "This marketing site doesn’t collect patient information. The chat demo is scripted and runs in your browser.",
    aiTitle: "How the assistant behaves",
    aiItems: [
      "It says it is an AI assistant and offers a person at any time.",
      "It doesn’t diagnose or give medical advice.",
      "On emergency words it shares emergency guidance and hands over to staff.",
      "It confirms the details before it books.",
    ],
  },
  useCases: {
    title: "Built for healthcare front desks.",
    lead: "Wherever patients book by phone today.",
    items: [
      { title: "Clinics", text: "Patient support and booking, without the phone queue." },
      { title: "Hospitals", text: "Appointment workflows across departments and doctors." },
      { title: "IVF centres", text: "Smart intake before the first visit." },
      { title: "Diagnostic labs", text: "Scheduling for tests and visits." },
    ],
    more: "Learn more",
  },
  faq: {
    title: "Questions, answered.",
    lead: "Short answers to what clinics ask first.",
    items: [
      { q: "What is Saral AI?", a: "A WhatsApp AI assistant for clinics and hospitals. It books, reschedules and cancels appointments, answers routine questions, and hands over to your staff when a human is needed." },
      { q: "Does it give medical advice?", a: "No. It doesn’t diagnose or advise. For clinical questions it alerts your staff, and on emergency words it shares emergency guidance and hands over right away." },
      { q: "What happens when the AI can’t answer?", a: "The chat moves to your staff. Patients can also ask for a person at any time." },
      { q: "Does it tell patients it is an AI?", a: "Yes. The assistant introduces itself as an AI assistant and offers a person." },
      { q: "Does it understand voice notes?", a: "Yes. It understands Hindi and Hinglish voice notes. If transcription fails, the chat falls back to text." },
      { q: "Do you collect patient data on this website?", a: "No. This website doesn’t collect patient information. The chat demo is scripted and runs in your browser." },
      { q: "How much does it cost?", a: "It depends on your workflows, integrations and message volume. Talk to us and we’ll scope it with you." },
      { q: "How do we get started?", a: "Book a demo. We’ll learn how your front desk works and show you Saral AI on your use case." },
    ],
  },
  finalCta: { title: "Make scheduling simple.", lead: "See Saral AI on your clinic’s workflow, or start a chat with us now." },
  footer: {
    tagline: "WhatsApp AI appointment assistant for clinics and hospitals.",
    product: "Product", solutions: "Solutions", company: "Company", legal: "Legal", contact: "Contact",
    rights: "All rights reserved.", privacy: "Privacy", terms: "Terms", cookies: "Cookies", emailLabel: "Email us", social: "Follow us",
  },
  ui: {
    theme: { label: "Theme", light: "Light", dark: "Dark", system: "System" },
    language: { label: "Language", en: "English", hi: "हिन्दी" },
    motion: { pause: "Pause animation", resume: "Resume animation" },
    cookie: {
      title: "Cookies and analytics",
      text: "We store your theme and this choice in your browser. With your permission we also measure visits to improve the site.",
      accept: "Accept analytics", reject: "Only essentials", policy: "Cookie policy",
    },
    whatsappFloat: "Chat on WhatsApp", progress: "Scroll progress", sections: "Page sections",
    opensNewTab: "(opens in a new tab)", loading: "Loading",
  },
  form: {
    title: "Book a demo",
    lead: "Tell us about your clinic or hospital. We’ll reply to set up a demo.",
    privacyNote: "Please don’t include patient information in this form.",
    labels: {
      name: "Your name", email: "Work email", phone: "Phone (with country code)", organization: "Clinic or hospital",
      industry: "Type of facility", volume: "Monthly bookings", challenge: "What would you like to fix?",
      consent: "I agree to be contacted about Saral AI. See the privacy policy.",
    },
    placeholders: { name: "Full name", email: "name@clinic.com", phone: "+91 98765 43210", organization: "Clinic or hospital name", challenge: "For example: too many calls, missed bookings, no-shows" },
    industries: [
      { value: "Healthcare", label: "Hospital / OPD" },
      { value: "Clinic", label: "Clinic" },
      { value: "Diagnostic & Lab", label: "Diagnostic centre or specialty clinic" },
      { value: "IVF & Specialty", label: "IVF centre or specialised practice" },
      { value: "Enterprise / Other", label: "Other" },
    ],
    volumes: [
      { value: "Under 500", label: "Under 500 bookings a month" },
      { value: "500 – 2,000", label: "500 – 2,000 bookings a month" },
      { value: "2,000 – 10,000", label: "2,000 – 10,000 bookings a month" },
      { value: "10,000+", label: "10,000+ bookings a month" },
    ],
    submit: "Request a demo", submitting: "Sending…", retry: "Try again",
    successTitle: "Request received",
    successText: "Thanks. We’ll contact you to set up your demo.",
    reference: "Reference",
    errors: {
      name: "Enter your name (at least 2 characters).",
      email: "Enter a valid email address.",
      phone: "Enter a valid phone number, for example +91 98765 43210.",
      organization: "Enter your clinic or hospital name.",
      industry: "Choose a facility type.",
      volume: "Choose a monthly volume.",
      challenge: "Keep this under 1,000 characters.",
      consent: "Please agree so we can contact you.",
      captcha: "Complete the spam check and try again.",
    },
    server: {
      rate_limited: "Too many attempts. Please wait a few minutes and try again.",
      captcha: "The spam check failed. Please try again.",
      unavailable: "We couldn’t send your request. Nothing was saved. Please try again.",
      validation: "Some details need fixing. Please check the form.",
      unknown: "Something went wrong. Nothing was saved. Please try again.",
      network: "No connection. Your request was not sent. Check your network and try again.",
    },
    captchaMissing: "Spam protection isn’t configured on this environment.",
    or: "or",
  },
  pages: {
    features: { title: "What Saral AI does on WhatsApp.", lead: "Booking, changes, answers and handoff, in the chat patients already use." },
    howItWorks: {
      title: "How Saral AI works.", lead: "One message in. One confirmed appointment out.",
      safetyTitle: "Safe by design",
      safetyItems: [
        "It introduces itself as an AI assistant and offers a person at any time.",
        "It doesn’t diagnose or give medical advice.",
        "On emergency words it shares emergency guidance and hands over to staff.",
        "It confirms every booking detail before finalising.",
      ],
    },
    clinics: {
      title: "WhatsApp booking for clinics.",
      lead: "Single-doctor or multi-doctor, your front desk can stop answering the same calls all day.",
      points: [
        { title: "Patients book without calling", text: "They message on WhatsApp and get an open slot." },
        { title: "Routine questions answered", text: "Clinic hours, doctor timings and visit guidelines." },
        { title: "Clinical questions go to staff", text: "Saral AI doesn’t give medical advice. It hands over." },
      ],
      closing: "See it on your clinic’s workflow.",
    },
    hospitals: {
      title: "Appointment workflows for hospitals.",
      lead: "Patients choose a department and a doctor in the chat, and get a slot that is actually open.",
      points: [
        { title: "Departments and doctors", text: "Booking follows how your OPD is organised." },
        { title: "Changes without calls", text: "Rescheduling and cancellations happen in the chat." },
        { title: "Safe handoff", text: "Uncertain, clinical or urgent chats move to your staff." },
      ],
      closing: "Diagnostic centres and IVF centres use the same workflows. Talk to us.",
    },
    security: { title: "Security and trust.", lead: "How Saral AI protects sensitive healthcare conversations." },
    pricing: {
      title: "Pricing that fits your workflow.",
      lead: "Talk to us.",
      body: "Pricing depends on your workflows, integrations and message volume. Tell us how your front desk works and we’ll scope it with you.",
    },
    demo: {
      title: "Book a demo.", lead: "Tell us about your clinic or hospital.",
      whatNext: ["We read your request.", "We reach out to learn how your front desk works.", "We show Saral AI on your use case."],
    },
    about: {
      title: "Saral means simple.",
      lead: "We make healthcare scheduling simple for patients and for the people who run the front desk.",
      blocks: [
        { title: "Simple for patients", text: "A friendly WhatsApp chat instead of a phone queue." },
        { title: "Disciplined for operations", text: "Clear rules, verified slots and a human whenever it matters." },
      ],
    },
    notFound: { title: "Page not found.", text: "That page doesn’t exist or has moved.", back: "Back to home" },
    legalNotice: "Draft text. This page needs legal review before it is relied on.",
    book: { eyebrow: "Saral Booking" },
  },
};

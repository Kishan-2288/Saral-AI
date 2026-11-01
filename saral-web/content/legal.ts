// DRAFT legal text. English only. NOT legal advice. Needs review by the owner's counsel before launch.
// TODO(owner/legal): controller entity name & address, retention periods, DPDP Act 2023 notice wording,
// grievance officer details, governing law and jurisdiction.

export interface LegalSection { title: string; body: string[] }

export const privacy: LegalSection[] = [
  { title: "What this website collects", body: [
    "If you fill in the demo form we receive your name, work email, phone number, organization, facility type, approximate monthly bookings and any message you write. We use it to contact you about Saral AI.",
    "This website does not collect patient information. Please don’t put patient details in the demo form.",
  ] },
  { title: "What is stored in your browser", body: [
    "Your theme choice, your animation preference and your cookie choice are stored in your browser’s local storage. They never leave your device.",
    "The chat demo is scripted and runs in your browser. Nothing you tap there is sent to us.",
  ] },
  { title: "Analytics", body: [
    "Analytics is off unless you accept it in the cookie banner and analytics is configured for the site. Accepting lets us count visits and button clicks.",
  ] },
  { title: "Spam protection", body: [
    "The demo form uses Cloudflare Turnstile to block automated submissions. Turnstile may process technical information such as your IP address and browser details to do this.",
  ] },
  { title: "Who sees your information", body: [
    "Demo requests are sent to Saral AI’s backend systems and read by the Saral AI team. [TODO(legal): list processors and any international transfers.]",
  ] },
  { title: "Your choices", body: [
    "You can ask us to access, correct or delete the details you sent through the demo form. [TODO(legal): add contact and response timeline.]",
  ] },
  { title: "Patient conversations on WhatsApp", body: [
    "The Saral AI assistant handles conversations on behalf of each clinic or hospital that uses it. That processing is covered by the agreement with that clinic or hospital, not by this website policy. [TODO(legal): add a short pointer to the product privacy notice.]",
  ] },
];

export const terms: LegalSection[] = [
  { title: "Using this website", body: [
    "This website describes Saral AI. You may browse it and send a demo request. Don’t misuse it, attempt to disrupt it, or submit false or automated requests.",
  ] },
  { title: "No medical advice", body: [
    "Nothing on this website is medical advice. The chat demo is a scripted illustration with sample data. In an emergency, call your local emergency number (112 in India).",
  ] },
  { title: "The Saral AI service", body: [
    "Use of the Saral AI service itself is governed by a separate agreement with each clinic or hospital. [TODO(legal): reference the service agreement.]",
  ] },
  { title: "Content and trademarks", body: [
    "The Saral AI name, logo and website content belong to Saral AI. WhatsApp is a trademark of its owner and is referenced only to describe where the service works.",
  ] },
  { title: "Liability", body: [
    "The website is provided as is. [TODO(legal): limitation of liability, governing law and jurisdiction.]",
  ] },
];

export const cookies: LegalSection[] = [
  { title: "Essential storage", body: [
    "saral-theme: remembers Light, Dark or System.",
    "saral-motion: remembers if you paused animation.",
    "saral-consent: remembers your analytics choice.",
    "These are kept in your browser’s local storage and are needed for the site to behave as you chose.",
  ] },
  { title: "Analytics (optional)", body: [
    "If analytics is configured and you accept, a privacy-friendly analytics script is loaded to count visits and button clicks. Decline and nothing is loaded.",
  ] },
  { title: "Spam protection", body: [
    "On the demo page, Cloudflare Turnstile loads to check that a person is submitting the form.",
  ] },
  { title: "Changing your choice", body: [
    "Clear this site’s data in your browser settings and the banner will ask again.",
  ] },
];

export interface ServiceItem {
  id: string;
  number: string;
  title: string;
  shortDesc: string;
  detail: string;
  category: string;
}

export interface CapabilityItem {
  id: string;
  title: string;
  actions: string[];
  description: string;
  badge: string;
  sampleTrigger: string;
  resultingAction: string;
}

export interface SecurityPrinciple {
  title: string;
  summary: string;
  detail: string;
}

export interface BookingFormData {
  name: string;
  email: string;
  phone: string;
  organization: string;
  industry: string;
  monthlyConversations: string;
  primaryChallenge: string;
}

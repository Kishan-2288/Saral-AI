import { z } from "zod";

/** Messages are error KEYS; the UI maps them to localized strings. */
export const demoRequestSchema = z.object({
  name: z.string().trim().min(2, "name").max(80, "name"),
  email: z.string().trim().email("email").max(120, "email"),
  phone: z.string().trim().regex(/^\+?[0-9][0-9\s-]{7,17}$/, "phone"),
  organization: z.string().trim().min(2, "organization").max(120, "organization"),
  industry: z.string().trim().min(1, "industry").max(60, "industry"),
  monthlyConversations: z.string().trim().min(1, "volume").max(40, "volume"),
  primaryChallenge: z.string().trim().max(1000, "challenge").default(""),
});
export type DemoRequest = z.infer<typeof demoRequestSchema>;

/** Client form adds consent (never sent to the backend). */
export const demoFormSchema = demoRequestSchema.extend({
  primaryChallenge: z.string().trim().max(1000, "challenge"),
  consent: z.literal(true, { errorMap: () => ({ message: "consent" }) }),
});
export type DemoFormValues = z.infer<typeof demoFormSchema>;

/** Server payload: form values + captcha token + honeypot. */
export const demoServerSchema = demoRequestSchema.extend({
  turnstileToken: z.string().max(4096).optional().default(""),
  website: z.string().max(200).optional().default(""), // honeypot
});

export type DemoApiError = "validation" | "rate_limited" | "captcha" | "unavailable" | "unknown";
export type DemoApiResponse =
  | { ok: true; leadId?: string }
  | { ok: false; error: DemoApiError; fieldErrors?: Record<string, string> };

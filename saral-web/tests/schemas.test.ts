import { describe, expect, it } from "vitest";
import { demoFormSchema, demoServerSchema } from "@/lib/schemas";

const valid = { name: "Asha Rao", email: "asha@clinic.com", phone: "+91 98765 43210", organization: "Rao Clinic", industry: "Clinic", monthlyConversations: "Under 500", primaryChallenge: "Too many calls" };

describe("demo form schema", () => {
  it("accepts a valid submission with consent", () => {
    expect(demoFormSchema.safeParse({ ...valid, consent: true }).success).toBe(true);
  });
  it("rejects missing consent with the 'consent' key", () => {
    const r = demoFormSchema.safeParse({ ...valid, consent: false });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].message).toBe("consent");
  });
  it("rejects bad email, phone and short names with stable error keys", () => {
    const r = demoFormSchema.safeParse({ ...valid, name: "A", email: "nope", phone: "abc", consent: true });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues.map((i) => i.message).sort()).toEqual(["email", "name", "phone"]);
  });
  it("caps the challenge text at 1000 characters", () => {
    expect(demoFormSchema.safeParse({ ...valid, primaryChallenge: "x".repeat(1001), consent: true }).success).toBe(false);
  });
});

describe("demo server schema", () => {
  it("defaults the honeypot and captcha token, and strips unknown fields", () => {
    const r = demoServerSchema.parse({ ...valid, extra: "x" });
    expect(r.website).toBe("");
    expect(r.turnstileToken).toBe("");
    expect("extra" in r).toBe(false);
  });
});

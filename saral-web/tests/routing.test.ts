import { describe, expect, it } from "vitest";
import { mapLegacyHash } from "@/lib/legacy-routes";
import { localePath, stripLocale, getDictionary, locales } from "@/lib/i18n";
import { rateLimit, resetRateLimit } from "@/lib/rate-limit";

describe("legacy hash redirects", () => {
  it("maps old hash routes to the new routes", () => {
    expect(mapLegacyHash("#/services")).toBe("/features");
    expect(mapLegacyHash("#/solutions")).toBe("/solutions/clinics");
    expect(mapLegacyHash("#/saral-booking")).toBe("/demo");
    expect(mapLegacyHash("#/contact")).toBe("/demo");
    expect(mapLegacyHash("#/book-demo")).toBe("/demo");
    expect(mapLegacyHash("#/about")).toBe("/about");
    expect(mapLegacyHash("#/case-studies")).toBe("/about");
    expect(mapLegacyHash("#/")).toBe("/");
  });
  it("ignores normal in-page anchors and unknown routes", () => {
    expect(mapLegacyHash("#how")).toBeNull();
    expect(mapLegacyHash("")).toBeNull();
    expect(mapLegacyHash("#/does-not-exist")).toBeNull();
  });
});

describe("locale paths", () => {
  it("keeps English at the root and Hindi under /hi", () => {
    expect(localePath("en", "/features")).toBe("/features");
    expect(localePath("en", "/")).toBe("/");
    expect(localePath("hi", "/")).toBe("/hi");
    expect(localePath("hi", "/features")).toBe("/hi/features");
  });
  it("strips locale prefixes", () => {
    expect(stripLocale("/hi/features")).toEqual({ locale: "hi", path: "/features" });
    expect(stripLocale("/hi")).toEqual({ locale: "hi", path: "/" });
    expect(stripLocale("/features")).toEqual({ locale: "en", path: "/features" });
  });
});

describe("content parity", () => {
  it("English and Hindi have identical structure for the chat demo and lists", () => {
    const [en, hi] = locales.map(getDictionary);
    expect(hi.chat.flows.map((f) => f.id)).toEqual(en.chat.flows.map((f) => f.id));
    expect(hi.chat.flows.map((f) => f.turns.length)).toEqual(en.chat.flows.map((f) => f.turns.length));
    expect(hi.features.items.length).toBe(en.features.items.length);
    expect(hi.faq.items.length).toBe(en.faq.items.length);
    expect(hi.problem.items.length).toBe(en.problem.items.length);
  });
  it("every demo flow that touches health ends in a human handoff", () => {
    for (const l of locales) {
      const flows = getDictionary(l).chat.flows;
      for (const id of ["rash", "emergency"] as const) {
        const f = flows.find((x) => x.id === id)!;
        const replies = f.turns.flatMap((t) => t.replies);
        expect(replies.some((r) => "event" in r)).toBe(true);
        expect(replies.some((r) => !("event" in r) && r.from === "staff")).toBe(true);
      }
    }
  });
});

describe("rate limiter", () => {
  it("allows up to the limit then blocks, and recovers after the window", () => {
    resetRateLimit();
    for (let i = 0; i < 5; i++) expect(rateLimit("ip", 5, 1000, 1000 + i).allowed).toBe(true);
    expect(rateLimit("ip", 5, 1000, 1010).allowed).toBe(false);
    expect(rateLimit("ip", 5, 1000, 2500).allowed).toBe(true);
  });
});

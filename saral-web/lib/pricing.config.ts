/**
 * Pricing is intentionally hidden ("Talk to us"). To show prices later:
 *   1. set `show: true`
 *   2. uncomment `plans` below
 *   3. render them in app/[locale]/pricing/page.tsx (a slot is already wired to PRICING.plans)
 *
 * Figures come from the old site's unrendered pricing component; confirm with the owner before enabling.
 */
export interface PricingPlan { id: string; label: string; amountInr: number; approx?: boolean; note: string }

export const PRICING: { show: boolean; plans?: PricingPlan[] } = {
  show: false,
  // plans: [
  //   { id: "setup",   label: "Architecture & integration", amountInr: 30000, note: "one-time setup" },
  //   { id: "managed", label: "Ongoing operations",         amountInr: 20000, approx: true, note: "per month, managed automation" },
  // ],
  // Footnote used on the old site: "Pricing evolves with workflow complexity, integrations and message volume."
};

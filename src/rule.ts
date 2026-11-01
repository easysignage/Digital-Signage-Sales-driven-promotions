export type Action = "enable" | "disable";

/**
 * What to do for a sales value. `promoActive` is whether the promo is on now, or `null` when it is
 * unknown (at startup, or after a failed call), in which case the rule always acts.
 * Returns `null` when nothing needs to change, so no API call is made.
 */
export function decide(sales: number, threshold: number, promoActive: boolean | null): Action | null {
  if (sales > threshold) return promoActive === true ? null : "enable";
  if (sales < threshold) return promoActive === false ? null : "disable";
  return null;
}

// Shared charter-rate logic for every yacht card/detail view: a yacht is
// only ever priced on one of these three tiers depending on its provider
// (hourly for most Dubai charter fleets, daily for others, weekly for
// week-only superyachts) — never assume priceDay is the one that's set.
export type CharterRateUnit = 'hour' | 'day' | 'week'

export interface CharterRateInfo {
  amount: number
  unit: CharterRateUnit
}

// Picks whichever price tier is actually set, hour first, then day, then
// week — returns null when none are, so the caller can show "Price on
// request" instead of silently rendering nothing.
export function getCharterRateInfo(yacht: {
  priceHour?: number | null
  priceDay?: number | null
  priceWeek?: number | null
}): CharterRateInfo | null {
  if (yacht.priceHour) return { amount: yacht.priceHour, unit: 'hour' }
  if (yacht.priceDay) return { amount: yacht.priceDay, unit: 'day' }
  if (yacht.priceWeek) return { amount: yacht.priceWeek, unit: 'week' }
  return null
}

// One-line "€1,300/day" (or "Price on request") for compact card display.
export function formatCharterRate(
  yacht: { priceHour?: number | null; priceDay?: number | null; priceWeek?: number | null },
  opts: { currencySymbol?: string; locale?: string } = {}
): string {
  const { currencySymbol = '€', locale = 'en-US' } = opts
  const rate = getCharterRateInfo(yacht)
  if (!rate) return 'Price on request'
  return `${currencySymbol}${rate.amount.toLocaleString(locale)}/${rate.unit}`
}

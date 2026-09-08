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

// Renders an amount in the yacht's own currency (AED for the Dubai fleets,
// EUR for most of the rest, ...). The `currency` column isn't consistently
// an ISO 4217 code — some rows store "EUR"/"AED", others store the raw
// symbol "€" — so only hand a real 3-letter code to Intl (which throws on
// anything else) and just prefix a symbol directly otherwise.
// Exported on its own (not just via formatCharterRate) for the few spots
// that render the amount and the "/hour" unit as two separately styled
// elements instead of one plain string.
export function formatAmount(amount: number, currency: string, locale = 'en-US'): string {
  const plain = amount.toLocaleString(locale)
  if (!/^[A-Za-z]{3}$/.test(currency)) return `${currency}${plain}`
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount)
  } catch {
    return `${currency} ${plain}`
  }
}

// One-line "€1,300/day" / "AED 1,300/hour" (or "Price on request") for
// compact card display — currency comes from the yacht's own `currency`
// field, never hardcoded, since it differs per fleet/region.
export function formatCharterRate(
  yacht: { priceHour?: number | null; priceDay?: number | null; priceWeek?: number | null; currency?: string | null },
  opts: { locale?: string } = {}
): string {
  const { locale = 'en-US' } = opts
  const rate = getCharterRateInfo(yacht)
  if (!rate) return 'Price on request'
  return `${formatAmount(rate.amount, yacht.currency || 'EUR', locale)}/${rate.unit}`
}

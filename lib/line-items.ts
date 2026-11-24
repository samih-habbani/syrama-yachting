// Free-form line items shared by quotes (devis) and invoices: the charter
// itself plus any hand-written extras (catering, sea toys…).
export interface LineItem {
  description: string
  quantity: number
  unitPrice: number
}

// Defensive parse of a Json column / request body into clean LineItem[] —
// drops blank rows, coerces numbers.
export function parseLineItems(raw: unknown): LineItem[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((r) => {
      const o = (r ?? {}) as Record<string, unknown>
      return {
        description: String(o.description ?? '').trim(),
        quantity: Number(o.quantity) > 0 ? Number(o.quantity) : 1,
        unitPrice: Number(o.unitPrice) || 0,
      }
    })
    .filter((i) => i.description)
}

export const lineTotal = (i: LineItem) => i.quantity * i.unitPrice
export const itemsSubtotal = (items: LineItem[]) => items.reduce((n, i) => n + lineTotal(i), 0)

// `toLocaleString('fr-FR', ...)` groups thousands with a narrow no-break
// space (U+202F) that the standard Helvetica PDF font can't render —
// group manually with a plain ASCII space, comma as decimal separator.
export function formatMoney(n: number | null | undefined) {
  if (n == null) return null
  const [intPart, decPart] = n.toFixed(2).split('.')
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  return `${grouped},${decPart}`
}

export function formatDMY(d: Date | null | undefined) {
  if (!d) return null
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

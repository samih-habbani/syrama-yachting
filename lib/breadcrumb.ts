// Builds a BreadcrumbList JSON-LD payload from the same items a page
// renders through components/Breadcrumbs.tsx, so the visible trail and the
// structured data can never drift apart.
const SITE_URL = 'https://www.syrama-yachting.com'

export interface BreadcrumbEntry {
  label: string
  href?: string
}

export function breadcrumbJsonLd(items: BreadcrumbEntry[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.label,
      // The last item (current page) intentionally has no `item` URL —
      // that's how Google's own BreadcrumbList examples represent "you are
      // here" for the final crumb.
      ...(item.href ? { item: `${SITE_URL}${item.href}` } : {}),
    })),
  }
}

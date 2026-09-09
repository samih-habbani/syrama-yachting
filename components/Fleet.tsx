'use client'
import { useState, useEffect, useMemo, useRef, useTransition, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import FleetFilters, { FilterState } from './FleetFilters'
import Breadcrumbs, { type BreadcrumbItem } from './Breadcrumbs'
import AvailabilityModal from './AvailabilityModal'
import BrokerContactModal from './BrokerContactModal'
import { yachtHref } from '@/lib/slug'
import { formatCharterRate } from '@/lib/yacht-price'

interface Media {
  id: number
  url: string | null
  alt: string | null
}

export interface Yacht {
  id: number
  name?: string
  builder: string | null
  model: string
  length: number
  lengthUnit?: string
  maxGuests: number | null
  cabins: number
  year?: number | null
  region: string | null
  city?: string | null
  priceDay: number | null
  priceHour: number | null
  priceWeek: number | null
  priceSale: number | null
  currency?: string | null
  status: string | null
  available?: boolean
  rating?: number | null
  reviewsCount?: number | null
  mapIframeSrc?: string | null
  media?: Media[]
  // Resolved server-side (see lib/yacht-service.ts's getYachts) — may
  // include a DB-backed destination match, which a client component can't
  // compute itself. yachtHref(yacht) below is only the flat-URL fallback.
  href?: string
}

// Destination-specific header content — see app/yacht-charter/destination-page-shared.tsx.
// When provided, this replaces the generic "Exclusive Fleet / Our vessels."
// header with unique, page-specific copy (a real page needs its own H1),
// while every filter, the yacht grid and the cards themselves stay exactly
// the same component as the plain /yachting/fleet page — the destination
// pages are additive content on top of the existing fleet, not a redesign.
export interface FleetSeoContent {
  eyebrow: string
  h1: string
  intro: string[]
  // Used for the "Yachts for Charter/Sale in {name}" heading above the
  // grid — kept separate from h1 since it reacts to the Charter/Sale
  // toggle, which only exists client-side.
  name: string
  // Optional full-bleed background image behind the eyebrow/H1 — when set,
  // it replaces the plain-text header with the image treatment (dark
  // gradient, text overlaid at the bottom) instead of duplicating the H1.
  heroImage?: string
}

interface FleetProps {
  showFilters?: boolean
  limit?: number
  // Server-fetched starting data (see app/yachting/fleet/page.tsx) — lets the
  // fleet render on first paint instead of showing an empty grid while the
  // client re-fetches the same 500 yachts over the network, which is what
  // made this page feel slow to open on mobile/cellular.
  initialYachts?: Yacht[]
  seo?: FleetSeoContent
  // Pre-selects the Destination (and, when set, City) filter on first
  // render — used by the destination landing pages so they open already
  // scoped to that region, while the filter stays fully editable, same as
  // any other filter selection.
  initialRegion?: string
  initialCity?: string | null
  // Every destination's {region, city, path} — see lib/destinations.ts's
  // getDestinationLinks(). When set, changing the Destination/City filter
  // to a combination with its own dedicated page navigates there instead
  // of only filtering the grid client-side.
  destinationLinks?: { kind: 'charter' | 'sale'; region: string; city: string | null; path: string }[]
  // Rendered over the hero image (see below) instead of in the page's
  // normal flow above it — sitting on plain dark background it read as an
  // afterthought; over the photo, styled for contrast, it's part of the
  // hero itself.
  breadcrumbItems?: BreadcrumbItem[]
  // Set by a destination page (charter or sale) to fix which tab shows,
  // ignoring the URL's own `?tab=` — a destination's title/H1/intro/FAQ are
  // tied to one specific kind, so there's no correct page for a toggle to
  // switch to. The Charter/Sale toggle itself is hidden whenever `seo` is
  // set (see the Toggle block below) — this prop is what makes that fixed
  // kind take effect even if `?tab=` is present in the URL.
  defaultTab?: 'charter' | 'sale'
}

const PAGE_SIZE = 12

export default function Fleet({ showFilters = true, limit, initialYachts, seo, initialRegion, initialCity, destinationLinks, breadcrumbItems, defaultTab }: FleetProps) {
  const router = useRouter()
  const pathname = usePathname()
  // `?region=`/`?tab=` are read via the isolated <FleetSearchParamsSync>
  // below rather than a top-level useSearchParams() call — that hook forces
  // Next.js to bail the whole subtree using it out of static rendering
  // unless wrapped in its own Suspense, and here that would mean every
  // yacht card (and its crawlable <a href>) never makes it into the actual
  // static HTML — only into a post-hydration client render. Isolating it in
  // a tiny leaf component keeps that dynamic hole to just those two values,
  // so the grid itself stays static — same pattern already used in
  // Navbar.tsx's TabParamReader for the same reason. `null` here just means
  // "not read from the URL yet" — real state comes from initialRegion/
  // initialCity/'charter' immediately, and is corrected client-side a tick
  // after hydration if the URL actually has ?region=/?tab=.
  const [regionParam, setRegionParam] = useState<string | null>(null)
  const [tabParam, setTabParam] = useState<string | null>(null)

  const [activeTab, setActiveTab] = useState<'charter' | 'sale'>(defaultTab ?? (tabParam === 'sale' ? 'sale' : 'charter'))
  const [allYachts, setAllYachts] = useState<Yacht[]>(initialYachts ?? [])
  const [loading, setLoading] = useState(!initialYachts)
  const [availabilityYacht, setAvailabilityYacht] = useState<Yacht | null>(null)
  const [brokerYacht, setBrokerYacht] = useState<Yacht | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const gridTopRef = useRef<HTMLDivElement>(null)
  // Tracks the router.push triggered by a Destination/City filter change
  // (see handleFiltersChange below) so a spinner can cover the page while
  // the new destination's title/H1/intro/grid load in — without this,
  // picking a new city gave no feedback until the new page suddenly
  // appeared. `isPending` is the real signal, but these destination pages
  // are statically pre-rendered and cached (see app/sitemap.ts and the
  // route files' generateStaticParams) so the transition itself typically
  // resolves in a few milliseconds — too fast for a spinner to actually be
  // seen. `showNavSpinner` below adds a short minimum-visible floor on top
  // of that real signal so the feedback the user asked for is always
  // perceivable, not just technically present.
  const [isPending, startDestinationTransition] = useTransition()
  const [showNavSpinner, setShowNavSpinner] = useState(false)
  const navSpinnerShownAt = useRef<number | null>(null)

  const NAV_SPINNER_MIN_VISIBLE_MS = 350
  useEffect(() => {
    if (isPending) {
      navSpinnerShownAt.current = Date.now()
      setShowNavSpinner(true)
      return
    }
    if (navSpinnerShownAt.current === null) return
    const elapsed = Date.now() - navSpinnerShownAt.current
    const remaining = Math.max(0, NAV_SPINNER_MIN_VISIBLE_MS - elapsed)
    const timeout = setTimeout(() => {
      setShowNavSpinner(false)
      navSpinnerShownAt.current = null
    }, remaining)
    return () => clearTimeout(timeout)
  }, [isPending])

  // Un seul appel réseau pour toute la flotte — tout le filtrage / tri qui suit
  // se fait ensuite en mémoire, côté client, sans jamais retoucher la BDD.
  // Skipped entirely when the server already handed us the fleet as
  // `initialYachts` (see app/yachting/fleet/page.tsx) — no point re-fetching
  // over the network what we already have.
  useEffect(() => {
    if (initialYachts) return
    const fetchAllYachts = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/yachts?type=all&limit=500')
        const data = await response.json()
        setAllYachts(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Error fetching yachts:', error)
        setAllYachts([])
      } finally {
        setLoading(false)
      }
    }
    fetchAllYachts()
    // Intentionally mount-only — initialYachts is a one-time seed from the
    // server, not something that should re-trigger this effect if it were
    // ever to change identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const bounds = useMemo(() => {
    const lengths = allYachts.map(y => y.length).filter((v): v is number => typeof v === 'number')
    const guests = allYachts.map(y => y.maxGuests).filter((v): v is number => typeof v === 'number')
    const prices = allYachts.map(y => y.priceDay).filter((v): v is number => typeof v === 'number')
    return {
      minLength: lengths.length ? Math.floor(Math.min(...lengths)) : 0,
      maxLength: lengths.length ? Math.ceil(Math.max(...lengths)) : 200,
      minGuests: guests.length ? Math.floor(Math.min(...guests)) : 0,
      maxGuests: guests.length ? Math.ceil(Math.max(...guests)) : 100,
      minPrice: prices.length ? Math.floor(Math.min(...prices)) : 0,
      maxPrice: prices.length ? Math.ceil(Math.max(...prices)) : 50000,
    }
  }, [allYachts])

  const regions = useMemo(
    () => Array.from(new Set(allYachts.map(y => y.region).filter(Boolean))).sort() as string[],
    [allYachts]
  )
  // One option per distinct builder+model combination actually present in the
  // fleet (not just per builder) — shown as "Builder - Model" in the select,
  // same format as the Search a Yacht results. The option's value is a
  // composite key so picking it can match the exact model, not just the brand.
  // A few imported legacy rows have a dash-only builder ('-') used as a "no
  // value" placeholder (same convention as lib/invoice.ts's isPlaceholder) —
  // treated as no builder, same as null.
  const builders = useMemo(() => {
    const seen = new Map<string, string>() // key -> label
    allYachts.forEach(y => {
      if (!y.builder || /^-+$/.test(y.builder.trim())) return
      const key = `${y.builder}|||${y.model}`
      if (!seen.has(key)) seen.set(key, `${y.builder} - ${y.model}`)
    })
    return Array.from(seen, ([value, label]) => ({ value, label })).sort((a, b) => a.label.localeCompare(b.label))
  }, [allYachts])

  // Seeded straight from `bounds` (not hardcoded fallback numbers like
  // maxGuests: 100) whenever initialYachts is known up front — otherwise a
  // real yacht outside those arbitrary defaults (e.g. a data-entry outlier
  // with maxGuests well above 100) would be silently filtered out of the
  // very first render, which for a statically-generated destination page
  // means it never makes it into the crawlable static HTML at all — only
  // appearing after the boundsInitialized effect corrects it client-side,
  // post-hydration. bounds() already falls back to the same sensible
  // defaults when allYachts is still empty (the client-only-fetch case),
  // so this changes nothing there.
  const [filters, setFilters] = useState<FilterState>(() => ({
    region: regionParam ?? initialRegion ?? null,
    city: regionParam ? null : (initialCity ?? null),
    builder: null,
    minLength: bounds.minLength,
    maxLength: bounds.maxLength,
    minGuests: bounds.minGuests,
    maxGuests: bounds.maxGuests,
    minPrice: bounds.minPrice,
    maxPrice: bounds.maxPrice,
    sortBy: 'default',
  }))

  // Cities scoped to the currently selected region — no region selected
  // means every city in the fleet, same idea as the builder list.
  const cities = useMemo(
    () => Array.from(new Set(
      allYachts
        .filter(y => !filters.region || (y.region || '').toLowerCase() === filters.region.toLowerCase())
        .map(y => y.city)
        .filter(Boolean)
    )).sort() as string[],
    [allYachts, filters.region]
  )

  // Une fois les bornes réelles connues, on initialise les curseurs dessus (une seule fois)
  const boundsInitialized = useRef(false)
  useEffect(() => {
    if (!boundsInitialized.current && allYachts.length > 0) {
      boundsInitialized.current = true
      setFilters(prev => ({
        ...prev,
        minLength: bounds.minLength,
        maxLength: bounds.maxLength,
        minGuests: bounds.minGuests,
        maxGuests: bounds.maxGuests,
        minPrice: bounds.minPrice,
        maxPrice: bounds.maxPrice,
      }))
    }
  }, [allYachts, bounds])

  useEffect(() => {
    // Destination pages ignore the URL's own ?tab= entirely — their kind
    // is fixed (see the defaultTab prop comment above).
    if (defaultTab) return
    setActiveTab(tabParam === 'sale' ? 'sale' : 'charter')
  }, [tabParam, defaultTab])

  // Reacts to the URL's own `?region=` (still used by a few older links)
  // changing after mount. On a destination page there is no such param, so
  // this falls back to the same initialRegion/initialCity the component
  // opened with instead of wiping them out.
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      region: regionParam ?? initialRegion ?? null,
      city: regionParam ? null : (initialCity ?? null),
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regionParam])

  const yachts = useMemo(() => {
    const statusMatches = (status: string | null) => {
      const s = (status || '').toLowerCase()
      return activeTab === 'charter' ? s === 'location' : s === 'vente'
    }

    const filtered = allYachts.filter(y => {
      if (!statusMatches(y.status)) return false
      if (filters.region && (y.region || '').toLowerCase() !== filters.region.toLowerCase()) return false
      if (filters.city && (y.city || '').toLowerCase() !== filters.city.toLowerCase()) return false
      if (filters.builder && `${y.builder || ''}|||${y.model}`.toLowerCase() !== filters.builder.toLowerCase()) return false
      if (filters.minLength && y.length < filters.minLength) return false
      if (filters.maxLength && y.length > filters.maxLength) return false
      // Guests/price sliders only make sense for yachts that actually have
      // that data (sale listings in particular rarely have a day rate, and
      // often no guest count either). Coercing a missing value to 0 would
      // make it fail the minimum bound and hide the yacht entirely — a
      // yacht with no data on a field must never be excluded by that field.
      if (filters.minGuests && y.maxGuests !== null && y.maxGuests < filters.minGuests) return false
      if (filters.maxGuests && y.maxGuests !== null && y.maxGuests > filters.maxGuests) return false
      if (filters.minPrice && y.priceDay !== null && y.priceDay < filters.minPrice) return false
      if (filters.maxPrice && y.priceDay !== null && y.priceDay > filters.maxPrice) return false
      return true
    })

    const sorted = [...filtered]
    if (filters.sortBy === 'price-asc') sorted.sort((a, b) => (a.priceDay ?? Infinity) - (b.priceDay ?? Infinity))
    else if (filters.sortBy === 'price-desc') sorted.sort((a, b) => (b.priceDay ?? -Infinity) - (a.priceDay ?? -Infinity))
    else if (filters.sortBy === 'length-asc') sorted.sort((a, b) => a.length - b.length)
    else if (filters.sortBy === 'length-desc') sorted.sort((a, b) => b.length - a.length)

    return limit ? sorted.slice(0, limit) : sorted
  }, [allYachts, activeTab, filters, limit])

  const totalPages = Math.max(1, Math.ceil(yachts.length / PAGE_SIZE))
  const visibleYachts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return yachts.slice(start, start + PAGE_SIZE)
  }, [yachts, currentPage])

  // Revient à la page 1 à chaque changement de résultats (tab, filtres...)
  // — sans ça, changer de filtre pourrait laisser l'utilisateur bloqué sur
  // une page qui n'existe plus pour le nouveau résultat.
  useEffect(() => {
    setCurrentPage(1)
  }, [yachts])

  const goToPage = (page: number) => {
    const clamped = Math.min(Math.max(page, 1), totalPages)
    setCurrentPage(clamped)
    gridTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const resetFilters = () => {
    setFilters({
      region: null,
      city: null,
      builder: null,
      minLength: bounds.minLength,
      maxLength: bounds.maxLength,
      minGuests: bounds.minGuests,
      maxGuests: bounds.maxGuests,
      minPrice: bounds.minPrice,
      maxPrice: bounds.maxPrice,
      sortBy: 'default',
    })
  }

  // Every other filter just narrows the currently-loaded grid — but the
  // Destination/City selects double as this page's own identity (its
  // title, H1, intro and FAQ all come from whichever /yacht-charter page
  // matches them). When a change lands on a combination with its own
  // dedicated page, navigate there instead of only filtering client-side,
  // so picking "Cannes" while on the Beaulieu-sur-Mer page actually takes
  // you to the Cannes page rather than leaving Beaulieu's copy on screen
  // above a Cannes-filtered grid.
  const handleFiltersChange = (next: FilterState) => {
    const identityChanged = next.region !== filters.region || next.city !== filters.city
    if (identityChanged && destinationLinks) {
      // On a destination page (defaultTab set), only match a destination of
      // that same fixed kind — a charter page's City filter must never
      // navigate to a sale destination page, or vice versa. On the plain
      // /yachting/fleet page (no fixed kind), match whichever kind the
      // Charter/Sale toggle currently shows, same as today.
      const matchKind = defaultTab ?? activeTab
      const match = destinationLinks.find((d) =>
        d.kind === matchKind
        && d.region.toLowerCase() === (next.region || '').toLowerCase()
        && (d.city || '').toLowerCase() === (next.city || '').toLowerCase()
      )
      if (match && match.path !== pathname) {
        startDestinationTransition(() => {
          router.push(match.path)
        })
        return
      }
    }
    setFilters(next)
  }

  // Répercute le choix charter/vente dans l'URL (?tab=) pour que la nav
  // du haut (CHARTERS / SALES) reste synchronisée avec ce toggle. Reads the
  // current query string directly from the browser (window.location) rather
  // than useSearchParams() — this only runs inside a click handler, after
  // hydration, so it doesn't need the render-time hook that would force
  // this component out of static rendering (see the comment above regionParam).
  const handleTabChange = (tab: 'charter' | 'sale') => {
    setActiveTab(tab)
    const params = new URLSearchParams(window.location.search)
    if (tab === 'sale') params.set('tab', 'sale')
    else params.delete('tab')
    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  return (
    <section style={{ background: '#06090f', minHeight: '100vh', paddingTop: 80, paddingBottom: 80 }}>
      <style>{spinnerKeyframes}</style>

      {/* Covers the page while a Destination/City filter change navigates
          to that destination's own page (see handleFiltersChange) — that
          navigation swaps the title, hero, intro and grid all at once, so
          without this the change could otherwise look like nothing
          happened until the new page suddenly appeared. */}
      <AnimatePresence>
        {showNavSpinner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 300,
              background: 'rgba(6,9,15,0.7)',
              backdropFilter: 'blur(2px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div className="fleet-nav-spinner" style={{ width: 42, height: 42, borderRadius: '50%', border: '3px solid rgba(184,151,74,0.2)', borderTopColor: '#b8974a' }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Renders nothing — just reports ?region=/?tab= once read on the
          client, a tick after hydration. Isolated in its own Suspense so
          only this (invisible) leaf is dynamic-per-request; everything
          below stays static. */}
      <Suspense fallback={null}>
        <FleetSearchParamsSync onRegionChange={setRegionParam} onTabChange={setTabParam} />
      </Suspense>

      {/* Hero — full-bleed background image behind the eyebrow/H1, only on
          destination pages that pass one. Outside the padded wrapper below
          so the image runs edge-to-edge, same as the very first version of
          these pages. This is the only place seo.h1 is rendered when a hero
          image is set — the plain-text header further down skips it so the
          page still has exactly one H1. */}
      {seo?.heroImage && (
        <div style={{ position: 'relative', height: 'clamp(320px, 46vw, 560px)', overflow: 'hidden', marginBottom: 56 }}>
          <Image
            src={seo.heroImage}
            alt={`Luxury yacht charter in ${seo.name}`}
            fill
            priority
            sizes="100vw"
            quality={82}
            style={{ objectFit: 'cover', filter: 'brightness(0.55)' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(6,9,15,0.95) 0%, rgba(6,9,15,0.35) 55%, transparent 100%)' }} />
          {breadcrumbItems && breadcrumbItems.length > 0 && (
            <>
              {/* Extra top-down darkening — the main gradient above fades to
                  transparent near the top, which isn't enough contrast for
                  text sitting directly on the photo. */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '35%', background: 'linear-gradient(to bottom, rgba(6,9,15,0.75) 0%, transparent 100%)' }} />
              <div style={{ position: 'absolute', top: 20, left: 0, right: 0, padding: '0 clamp(24px, 6vw, 96px)' }}>
                <Breadcrumbs items={breadcrumbItems} overlay />
              </div>
            </>
          )}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 clamp(24px, 6vw, 96px) 48px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <div style={{ width: 32, height: 1, background: '#b8974a' }} />
              <span style={{ fontFamily: 'var(--font-tenor)', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#b8974a' }}>{seo.eyebrow}</span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 300, fontSize: 'clamp(36px, 5.5vw, 76px)', lineHeight: 1.05, color: '#f5eedd', margin: 0 }}>
              {seo.h1}
            </h1>
          </div>
        </div>
      )}

      <div style={{ paddingLeft: 'clamp(32px, 6vw, 96px)', paddingRight: 'clamp(32px, 6vw, 96px)' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          style={{ marginBottom: 60 }}
        >
          {!seo?.heroImage && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <div style={{ width: 32, height: 1, background: '#b8974a' }} />
              <span style={{ fontFamily: 'var(--font-tenor)', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#b8974a' }}>{seo?.eyebrow || 'Exclusive Fleet'}</span>
            </div>
          )}

          {seo?.heroImage ? (
            // H1 already shown in the hero above — just the intro, single
            // column, matching the original destination page's Intro block.
            <div style={{ maxWidth: 920, marginBottom: 40 }}>
              {seo.intro.map((paragraph, i) => (
                <p key={i} style={{ fontFamily: 'var(--font-tenor)', fontSize: 13, lineHeight: 2, color: '#8f8f7f', margin: i < seo.intro.length - 1 ? '0 0 24px' : 0 }}>
                  {paragraph}
                </p>
              ))}
            </div>
          ) : (
            // Stacks on mobile/tablet, side-by-side from lg up
            <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: '20px 80px', alignItems: 'end', marginBottom: 40 }}>
              <div>
                <h1 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 300, fontSize: 'clamp(40px, 6vw, 88px)', lineHeight: 1.05, color: '#f5eedd', margin: 0 }}>{seo?.h1 || 'Our vessels.'}</h1>
                {!seo && filters.region && (
                  <p style={{ fontFamily: 'var(--font-tenor)', fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#b8974a', margin: '12px 0 0 0' }}>
                    {filters.region}
                  </p>
                )}
              </div>
              <div>
                {seo
                  ? seo.intro.map((paragraph, i) => (
                      <p key={i} style={{ fontFamily: 'var(--font-tenor)', fontSize: 13, lineHeight: 1.9, color: '#8f8f7f', margin: i < seo.intro.length - 1 ? '0 0 16px' : 0 }}>
                        {paragraph}
                      </p>
                    ))
                  : (
                    <p style={{ fontFamily: 'var(--font-tenor)', fontSize: 13, lineHeight: 1.9, color: '#8f8f7f', margin: '0 0 20px' }}>Handpicked superyachts for charter and acquisition. Each vessel represents the pinnacle of maritime luxury, impeccably maintained and staffed by elite crews.</p>
                  )}
              </div>
            </div>
          )}

          {/* Discreet, low-commitment CTA for a visitor who already knows
              what they want and would rather message someone than browse —
              same treatment as the /charters destination-picker page.
              Charter-only, so it disappears if they switch to the Sale tab. */}
          {activeTab === 'charter' && (
            <a
              href={`https://wa.me/971505548034?text=${encodeURIComponent("Hello Syrama Yachting! I'd like help finding the right yacht for my charter.")}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                fontFamily: 'var(--font-tenor)',
                fontSize: 10,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: '#b8974a',
                border: '1px solid rgba(184,151,74,0.3)',
                padding: '13px 22px',
                textDecoration: 'none',
                marginBottom: 32,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/whatsapp.png" alt="" style={{ width: 15, height: 15 }} />
              Speak to a Yacht Advisor
            </a>
          )}

          {/* Toggle — hidden on a destination page (seo set): its
              title/H1/intro/FAQ are tied to one specific kind (defaultTab),
              and there's no matching page on the other side for this to
              switch to. Only the plain /yachting/fleet page (no fixed
              identity) shows it. */}
          {!seo && (
            <div style={{ display: 'flex', gap: 24 }}>
              {(['charter', 'sale'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => handleTabChange(tab)}
                  style={{
                    fontFamily: 'var(--font-tenor)',
                    fontSize: 11,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    background: 'transparent',
                    border: 'none',
                    padding: '12px 0',
                    color: activeTab === tab ? '#b8974a' : '#8f8f7f',
                    cursor: 'pointer',
                    borderBottom: activeTab === tab ? '2px solid #b8974a' : '2px solid transparent',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {tab === 'charter' ? 'Charter' : 'For Sale'}
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Scroll anchor — pagination jumps back here instead of leaving the
            page scrolled down among cards that just changed underneath it.
            Also a plain #fleet-filters target: the "Other Destinations"
            links append this hash so a click jumps straight to the filters
            on the new page, via native browser anchor scrolling — no JS. */}
        <div id="fleet-filters" ref={gridTopRef} />

        {seo && (
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontFamily: 'var(--font-tenor)', fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#b8974a', marginBottom: 12 }}>
              Available Now
            </div>
            <h2 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(26px, 3.5vw, 44px)', fontWeight: 300, color: '#f5eedd', margin: 0 }}>
              Yachts for {activeTab === 'charter' ? 'Charter' : 'Sale'} in {seo.name}
            </h2>
          </div>
        )}

        {/* Filters */}
        {showFilters && (
          <FleetFilters
            filters={filters}
            bounds={bounds}
            regions={regions}
            cities={cities}
            builders={builders}
            yachts={allYachts}
            resultCount={yachts.length}
            onFiltersChange={handleFiltersChange}
            onReset={resetFilters}
          />
        )}

        {/* Yacht Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 40, marginBottom: 80 }}>
          {loading ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontFamily: 'var(--font-tenor)', fontSize: 14, color: '#b8974a' }}>Loading yachts...</div>
            </div>
          ) : yachts.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontFamily: 'var(--font-tenor)', fontSize: 14, color: '#8f8f7f' }}>No yachts found matching your criteria.</div>
            </div>
          ) : (
            visibleYachts.map((yacht, i) => (
              <motion.div
                key={yacht.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: (i % PAGE_SIZE) * 0.04, ease: 'easeOut' }}
              >
                <Link href={yacht.href ?? yachtHref(yacht)} style={{ textDecoration: 'none', display: 'block' }}>
                  <div
                    style={{ position: 'relative', overflow: 'hidden', aspectRatio: '4/3', background: '#1a1a1a' }}
                    onMouseEnter={(e) => {
                      const img = e.currentTarget.querySelector('img')
                      if (img) img.style.transform = 'scale(1.05)'
                      const badge = e.currentTarget.querySelector<HTMLDivElement>('.view-badge')
                      if (badge) { badge.style.transform = 'translateX(0)'; badge.style.opacity = '1' }
                    }}
                    onMouseLeave={(e) => {
                      const img = e.currentTarget.querySelector('img')
                      if (img) img.style.transform = 'scale(1)'
                      const badge = e.currentTarget.querySelector<HTMLDivElement>('.view-badge')
                      if (badge) { badge.style.transform = 'translateX(130%)'; badge.style.opacity = '0' }
                    }}
                  >
                    {yacht.media?.[0]?.url && (
                      <Image
                        src={`/uploads/yachts/${yacht.media[0].url}`}
                        alt={yacht.media?.[0]?.alt || yacht.model}
                        fill
                        loading="lazy"
                        sizes="(max-width: 767px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        quality={75}
                        style={{
                          objectFit: 'cover',
                          filter: 'brightness(0.75)',
                          transition: 'transform 0.9s cubic-bezier(0.25, 0.1, 0, 1)',
                          cursor: 'pointer',
                        }}
                      />
                    )}
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(6,9,15,0.85) 0%, transparent 60%)', pointerEvents: 'none' }} />

                    <div style={{ position: 'absolute', bottom: 20, left: 24, right: 24 }}>
                      <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: 26, fontWeight: 300, color: '#f5eedd', lineHeight: 1.2 }}>
                        {yacht.model}
                      </div>
                      <div style={{ fontFamily: 'var(--font-tenor)', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#b8974a', marginTop: 4 }}>
                        {yacht.length}{yacht.lengthUnit || 'm'}{yacht.builder ? ` · ${yacht.builder}` : ''}
                      </div>
                    </div>

                    <div
                      className="view-badge"
                      style={{
                        position: 'absolute', top: 20, right: 20,
                        fontFamily: 'var(--font-tenor)', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase',
                        color: 'rgba(245,238,221,0.6)', background: 'rgba(6,9,15,0.5)', padding: '6px 10px',
                        transform: 'translateX(130%)', opacity: 0,
                        transition: 'transform 0.4s cubic-bezier(0.25, 0.1, 0, 1), opacity 0.4s ease',
                        pointerEvents: 'none',
                      }}
                    >
                      View →
                    </div>

                    {yacht.region && (
                      <div style={{ position: 'absolute', bottom: 20, right: 20, fontFamily: 'var(--font-tenor)', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#06090f', background: '#b8974a', padding: '8px 12px' }}>
                        {yacht.region}
                      </div>
                    )}
                  </div>

                  <div style={{ padding: '18px 0', borderBottom: '1px solid rgba(184,151,74,0.12)' }}>
                    <div style={{ fontFamily: 'var(--font-tenor)', fontSize: 12, letterSpacing: '0.1em', color: '#a0a090', marginBottom: 16 }}>
                      {yacht.maxGuests && `${yacht.maxGuests} guests`} {yacht.cabins && `· ${yacht.cabins} cabins`}
                    </div>
                    <div style={{ display: 'flex', gap: 32 }}>
                      <div>
                        <div style={{ fontFamily: 'var(--font-tenor)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(245,238,221,0.7)', marginBottom: 6, fontWeight: 600 }}>Length</div>
                        <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: 18, fontWeight: 300, color: '#d4b472' }}>{yacht.length}{yacht.lengthUnit || 'm'}</div>
                      </div>
                      {yacht.maxGuests && (
                        <div>
                          <div style={{ fontFamily: 'var(--font-tenor)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(245,238,221,0.7)', marginBottom: 6, fontWeight: 600 }}>Guests</div>
                          <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: 18, fontWeight: 300, color: '#d4b472' }}>{yacht.maxGuests}</div>
                        </div>
                      )}
                      <div>
                        <div style={{ fontFamily: 'var(--font-tenor)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(245,238,221,0.7)', marginBottom: 6, fontWeight: 600 }}>
                          {activeTab === 'charter' ? 'Rate' : 'Price'}
                        </div>
                        <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: 18, fontWeight: 300, color: '#d4b472' }}>
                          {activeTab === 'charter'
                            ? formatCharterRate(yacht)
                            : (yacht.priceSale ? `€${yacht.priceSale.toLocaleString('en-US')}` : 'Price on request')}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>

                <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                  {activeTab === 'charter' ? (
                    <button
                      type="button"
                      onClick={() => setAvailabilityYacht(yacht)}
                      style={{
                        flex: 1,
                        fontFamily: 'var(--font-tenor)',
                        fontSize: 10,
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase',
                        color: '#06090f',
                        background: '#b8974a',
                        border: 'none',
                        padding: '13px 16px',
                        cursor: 'pointer',
                        transition: 'background 0.3s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#d4b472')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = '#b8974a')}
                    >
                      Check Availability
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setBrokerYacht(yacht)}
                      style={{
                        flex: 1,
                        fontFamily: 'var(--font-tenor)',
                        fontSize: 10,
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase',
                        color: '#06090f',
                        background: '#b8974a',
                        border: 'none',
                        padding: '13px 16px',
                        cursor: 'pointer',
                        transition: 'background 0.3s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#d4b472')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = '#b8974a')}
                    >
                      Contact Broker
                    </button>
                  )}
                  <Link
                    href={yacht.href ?? yachtHref(yacht)}
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      fontFamily: 'var(--font-tenor)',
                      fontSize: 10,
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase',
                      color: '#b8974a',
                      background: 'transparent',
                      border: '1px solid rgba(184,151,74,0.4)',
                      padding: '13px 16px',
                      textDecoration: 'none',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(184,151,74,0.1)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                  >
                    View Details
                  </Link>
                </div>
              </motion.div>
            ))
          )}
        </div>

        <Pagination currentPage={currentPage} totalPages={totalPages} onChange={goToPage} />

        <AvailabilityModal
          isOpen={availabilityYacht !== null}
          onClose={() => setAvailabilityYacht(null)}
          yacht={availabilityYacht ? {
            model: availabilityYacht.model,
            builder: availabilityYacht.builder,
            length: availabilityYacht.length,
            imageUrl: availabilityYacht.media?.[0]?.url ? `/uploads/yachts/${availabilityYacht.media[0].url}` : null,
          } : { model: '' }}
        />

        <BrokerContactModal
          isOpen={brokerYacht !== null}
          onClose={() => setBrokerYacht(null)}
          yacht={brokerYacht ? {
            model: brokerYacht.model,
            builder: brokerYacht.builder,
            length: brokerYacht.length,
            imageUrl: brokerYacht.media?.[0]?.url ? `/uploads/yachts/${brokerYacht.media[0].url}` : null,
          } : { model: '' }}
        />

        {/* CTA — the highest-intent moment on this page: someone who just
            looked through the grid and still hasn't found the right fit.
            Same "Can't find the right yacht?" treatment as the /charters
            destination-picker page, WhatsApp/email led, charter-only; the
            Sale tab keeps its own brokerage-focused pitch. */}
        {activeTab === 'charter' ? (
          <div
            style={{
              padding: 'clamp(40px, 6vw, 64px)',
              textAlign: 'center',
              border: '1px solid rgba(184,151,74,0.2)',
              background: 'linear-gradient(135deg, rgba(184,151,74,0.06) 0%, rgba(212,180,114,0.02) 100%)',
            }}
          >
            <div style={{ fontFamily: 'var(--font-tenor)', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#b8974a', marginBottom: 16 }}>
              Can&apos;t Find The Right Yacht?
            </div>
            <h2 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 300, fontSize: 'clamp(28px, 4vw, 44px)', color: '#f5eedd', margin: '0 0 20px' }}>
              Let Us Source It For You.
            </h2>
            <p style={{ fontFamily: 'var(--font-tenor)', fontSize: 13, lineHeight: 1.8, color: '#8f8f7f', maxWidth: 560, margin: '0 auto 36px' }}>
              Tell us your dates, number of guests and preferred itinerary. Our team will source the most suitable options for you.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a
                href={`https://wa.me/971505548034?text=${encodeURIComponent("Hello Syrama Yachting! I'd like a tailored yacht selection. Here are my dates, guest count and preferred itinerary:")}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 12,
                  fontFamily: 'var(--font-tenor)',
                  fontSize: 10,
                  letterSpacing: '0.25em',
                  textTransform: 'uppercase',
                  color: '#06090f',
                  background: 'linear-gradient(135deg, #b8974a, #d4b472)',
                  padding: '16px 32px',
                  textDecoration: 'none',
                  boxShadow: '0 4px 20px rgba(184,151,74,0.35)',
                }}
              >
                Request a Selection
                <svg width="16" height="5" viewBox="0 0 16 5" fill="none"><line x1="0" y1="2.5" x2="12" y2="2.5" stroke="currentColor" /><polyline points="9,1 14,2.5 9,4" stroke="currentColor" strokeWidth="0.8" fill="none" /></svg>
              </a>
              <a
                href="mailto:contact@syrama-services.com?subject=Yacht%20Selection%20Request&body=Hello%20Syrama%20Yachting%2C%0A%0AI'd%20like%20a%20tailored%20yacht%20selection.%20Here%20are%20my%20dates%2C%20guest%20count%20and%20preferred%20itinerary%3A%0A"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 12,
                  fontFamily: 'var(--font-tenor)',
                  fontSize: 10,
                  letterSpacing: '0.25em',
                  textTransform: 'uppercase',
                  color: '#b8974a',
                  border: '1px solid rgba(184,151,74,0.35)',
                  padding: '16px 32px',
                  textDecoration: 'none',
                }}
              >
                Email Us
              </a>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(24px, 3vw, 38px)', fontWeight: 300, color: '#f5eedd', marginBottom: 16 }}>
              Interested in acquisition?
            </div>
            <p style={{ fontFamily: 'var(--font-tenor)', fontSize: 12, lineHeight: 1.8, color: '#8f8f7f', maxWidth: 480, margin: '0 auto 32px' }}>
              Speak with our brokers about purchasing opportunities and investment potential.
            </p>
            <a
              href="#contact"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 14,
                fontFamily: 'var(--font-tenor)',
                fontSize: 10,
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                color: '#06090f',
                background: '#b8974a',
                padding: '16px 36px',
                textDecoration: 'none',
                transition: 'background 0.3s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#d4b472')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#b8974a')}
            >
              Get in touch
            </a>
          </div>
        )}
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────
// Isolates the one hook (useSearchParams) that would otherwise force this
// whole component out of static rendering — same fix already used in
// Navbar.tsx's TabParamReader. Renders nothing; just reports the current
// ?region=/?tab= up to the parent once read on the client.
// ─────────────────────────────────────────────────────────────
function FleetSearchParamsSync({ onRegionChange, onTabChange }: { onRegionChange: (v: string | null) => void; onTabChange: (v: string | null) => void }) {
  const searchParams = useSearchParams()
  const region = searchParams.get('region')
  const tab = searchParams.get('tab')
  useEffect(() => { onRegionChange(region) }, [region, onRegionChange])
  useEffect(() => { onTabChange(tab) }, [tab, onTabChange])
  return null
}

// ─────────────────────────────────────────────────────────────
// Numbered pagination — replaces the old "load more on scroll" behaviour so
// a destination page (intro + grid + FAQ) stays a bounded length instead of
// growing indefinitely. Always reflects the currently active filters, since
// the parent resets to page 1 whenever the filtered result set changes.
// ─────────────────────────────────────────────────────────────
function buildPageList(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const keep = new Set<number>([1, total, current - 1, current, current + 1])
  const sorted = [...keep].filter(p => p >= 1 && p <= total).sort((a, b) => a - b)
  const result: (number | 'ellipsis')[] = []
  let prev = 0
  for (const p of sorted) {
    if (p - prev > 1) result.push('ellipsis')
    result.push(p)
    prev = p
  }
  return result
}

function Pagination({ currentPage, totalPages, onChange }: { currentPage: number; totalPages: number; onChange: (page: number) => void }) {
  if (totalPages <= 1) return null

  const btnBase: React.CSSProperties = {
    fontFamily: 'var(--font-tenor)',
    fontSize: 12,
    minWidth: 40,
    height: 40,
    padding: '0 6px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
    border: '1px solid rgba(184,151,74,0.25)',
    color: '#8f8f7f',
    transition: 'all 0.2s ease',
  }

  return (
    <nav aria-label="Pagination" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: 8, padding: '20px 0 60px' }}>
      <button
        type="button"
        onClick={() => onChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
        style={{ ...btnBase, opacity: currentPage === 1 ? 0.35 : 1, cursor: currentPage === 1 ? 'default' : 'pointer' }}
      >
        ‹
      </button>
      {buildPageList(currentPage, totalPages).map((p, i) =>
        p === 'ellipsis' ? (
          <span key={`e-${i}`} style={{ color: 'rgba(143,143,127,0.6)', padding: '0 4px', fontFamily: 'var(--font-tenor)', fontSize: 12 }}>···</span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            aria-current={p === currentPage ? 'page' : undefined}
            style={{
              ...btnBase,
              cursor: 'pointer',
              color: p === currentPage ? '#06090f' : '#8f8f7f',
              background: p === currentPage ? '#b8974a' : 'transparent',
              borderColor: p === currentPage ? '#b8974a' : 'rgba(184,151,74,0.25)',
            }}
          >
            {p}
          </button>
        )
      )}
      <button
        type="button"
        onClick={() => onChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
        style={{ ...btnBase, opacity: currentPage === totalPages ? 0.35 : 1, cursor: currentPage === totalPages ? 'default' : 'pointer' }}
      >
        ›
      </button>
    </nav>
  )
}

// Rotation for the Destination/City navigation spinner above — plain CSS
// since a spin animation is simpler and cheaper as a keyframe loop than
// driving it through Framer Motion frame-by-frame.
const spinnerKeyframes = `
  .fleet-nav-spinner {
    animation: fleet-nav-spin 0.7s linear infinite;
  }
  @keyframes fleet-nav-spin {
    to { transform: rotate(360deg); }
  }
`

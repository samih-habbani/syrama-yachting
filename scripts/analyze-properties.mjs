// Read-only analysis — groups near-duplicate values (accents/case-insensitive)
// for type/status/city/region, and flags likely duplicate listings.
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

function normalize(v) {
  if (!v) return ''
  return v.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase().replace(/\s+/g, ' ')
}
function isPlaceholder(v) { return !v || /^-+$/.test(v.trim()) }

function groupField(rows, field) {
  const groups = new Map()
  for (const r of rows) {
    const raw = r[field]
    if (isPlaceholder(raw)) continue
    const norm = normalize(raw)
    if (!groups.has(norm)) groups.set(norm, new Map())
    const variants = groups.get(norm)
    variants.set(raw, (variants.get(raw) || 0) + 1)
  }
  const dupes = []
  for (const [norm, variants] of groups.entries()) {
    if (variants.size > 1) {
      dupes.push({ norm, variants: [...variants.entries()].sort((a, b) => b[1] - a[1]) })
    }
  }
  return dupes
}

async function main() {
  const rows = await prisma.property.findMany({
    select: { id: true, title: true, reference: true, city: true, region: true, type: true, status: true, price: true, priceDay: true },
  })
  console.log(`Total properties: ${rows.length}\n`)

  for (const field of ['type', 'status', 'city', 'region']) {
    const dupes = groupField(rows, field)
    console.log(`=== ${field.toUpperCase()} — ${dupes.length} groupe(s) avec variantes ===`)
    for (const d of dupes) {
      console.log('  ' + d.variants.map(([v, c]) => `"${v}" (${c})`).join('  vs  '))
    }
    console.log()
  }

  // Distinct raw values for full visibility
  for (const field of ['type', 'status']) {
    const distinct = [...new Set(rows.map(r => r[field]).filter(v => !isPlaceholder(v)))].sort()
    console.log(`Valeurs distinctes ${field}: ${JSON.stringify(distinct)}`)
  }

  // Duplicate listings by reference
  console.log('\n=== DOUBLONS PAR REFERENCE ===')
  const byRef = new Map()
  for (const r of rows) {
    if (isPlaceholder(r.reference)) continue
    const key = r.reference.trim().toLowerCase()
    if (!byRef.has(key)) byRef.set(key, [])
    byRef.get(key).push(r)
  }
  let refDupes = 0
  for (const [ref, group] of byRef.entries()) {
    if (group.length > 1) { refDupes++; console.log(`  "${ref}" — ${group.length}x: ` + group.map(r => `#${r.id} ${r.title}`).join(' | ')) }
  }
  console.log(`Total: ${refDupes}`)

  // Duplicate listings by title+city (possible re-entry)
  console.log('\n=== DOUBLONS PAR TITRE + VILLE ===')
  const byTitleCity = new Map()
  for (const r of rows) {
    const key = normalize(r.title) + '|' + normalize(r.city)
    if (!byTitleCity.has(key)) byTitleCity.set(key, [])
    byTitleCity.get(key).push(r)
  }
  let titleDupes = 0
  for (const [key, group] of byTitleCity.entries()) {
    if (group.length > 1) { titleDupes++; console.log(`  "${key}" — ${group.length}x: ` + group.map(r => `#${r.id}`).join(' | ')) }
  }
  console.log(`Total: ${titleDupes}`)

  // Empty field stats
  console.log('\n=== CHAMPS VIDES ===')
  for (const field of ['city', 'region', 'type', 'reference']) {
    const empties = rows.filter(r => isPlaceholder(r[field])).length
    console.log(`  ${field}: ${empties}/${rows.length}`)
  }

  await prisma.$disconnect()
}

main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1) })

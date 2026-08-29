// Read-only analysis script — no writes to the DB.
// Groups near-duplicate values (accents/case/whitespace-insensitive) for
// type/region/city/country, and flags likely duplicate contacts.

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

function normalize(v) {
  if (!v) return ''
  return v
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // strip accents
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
}

function isPlaceholder(v) {
  return !v || /^-+$/.test(v.trim())
}

function groupField(rows, field) {
  const groups = new Map() // normKey -> Map(originalValue -> count)
  for (const r of rows) {
    const raw = r[field]
    if (isPlaceholder(raw)) continue
    const norm = normalize(raw)
    if (!groups.has(norm)) groups.set(norm, new Map())
    const variants = groups.get(norm)
    variants.set(raw, (variants.get(raw) || 0) + 1)
  }
  // Only keep groups that have more than one distinct raw spelling
  const dupes = []
  for (const [norm, variants] of groups.entries()) {
    if (variants.size > 1) {
      dupes.push({
        norm,
        variants: [...variants.entries()].sort((a, b) => b[1] - a[1]),
        total: [...variants.values()].reduce((a, b) => a + b, 0),
      })
    }
  }
  dupes.sort((a, b) => b.total - a.total)
  return dupes
}

function normalizePhone(v) {
  if (!v) return ''
  return v.replace(/[^\d]/g, '').replace(/^0+/, '') // strip non-digits, leading zeros
}

async function main() {
  const rows = await prisma.provider.findMany({
    select: {
      id: true, name: true, firstName: true, company: true, email: true, phone: true,
      city: true, region: true, country: true, type: true,
    },
  })

  console.log(`Total providers: ${rows.length}\n`)

  for (const field of ['city', 'region', 'country', 'type']) {
    const dupes = groupField(rows, field)
    console.log(`\n=== ${field.toUpperCase()} — ${dupes.length} groupes avec variantes ===`)
    for (const d of dupes) {
      console.log(`  [${d.total}x] ` + d.variants.map(([v, c]) => `"${v}" (${c})`).join('  vs  '))
    }
  }

  // Duplicate contacts by email (case-insensitive, trimmed)
  console.log(`\n\n=== DOUBLONS PAR EMAIL ===`)
  const byEmail = new Map()
  for (const r of rows) {
    if (isPlaceholder(r.email)) continue
    const key = r.email.trim().toLowerCase()
    if (!byEmail.has(key)) byEmail.set(key, [])
    byEmail.get(key).push(r)
  }
  let emailDupeCount = 0
  for (const [email, group] of byEmail.entries()) {
    if (group.length > 1) {
      emailDupeCount++
      console.log(`  "${email}" — ${group.length}x: ` + group.map(r => `#${r.id} ${r.name || r.firstName || '?'} (${r.company || '-'})`).join(' | '))
    }
  }
  console.log(`Total groupes email dupliqués: ${emailDupeCount}`)

  // Duplicate contacts by phone (digits only)
  console.log(`\n=== DOUBLONS PAR TÉLÉPHONE ===`)
  const byPhone = new Map()
  for (const r of rows) {
    if (isPlaceholder(r.phone)) continue
    const key = normalizePhone(r.phone)
    if (!key || key.length < 6) continue
    if (!byPhone.has(key)) byPhone.set(key, [])
    byPhone.get(key).push(r)
  }
  let phoneDupeCount = 0
  for (const [phone, group] of byPhone.entries()) {
    if (group.length > 1) {
      phoneDupeCount++
      console.log(`  "${phone}" — ${group.length}x: ` + group.map(r => `#${r.id} ${r.name || r.firstName || '?'} (${r.company || '-'})`).join(' | '))
    }
  }
  console.log(`Total groupes téléphone dupliqués: ${phoneDupeCount}`)

  // Duplicate contacts by normalized name+company (same person, possibly no email/phone match)
  console.log(`\n=== DOUBLONS PAR NOM + SOCIÉTÉ ===`)
  const byNameCompany = new Map()
  for (const r of rows) {
    const nameRaw = r.name || r.firstName
    if (isPlaceholder(nameRaw)) continue
    const key = normalize(nameRaw) + '|' + normalize(r.company)
    if (!byNameCompany.has(key)) byNameCompany.set(key, [])
    byNameCompany.get(key).push(r)
  }
  let nameDupeCount = 0
  for (const [key, group] of byNameCompany.entries()) {
    if (group.length > 1) {
      nameDupeCount++
      console.log(`  "${key}" — ${group.length}x: ` + group.map(r => `#${r.id} email=${r.email || '-'} tel=${r.phone || '-'}`).join(' | '))
    }
  }
  console.log(`Total groupes nom+société dupliqués: ${nameDupeCount}`)

  // Empty / placeholder stats per field
  console.log(`\n\n=== CHAMPS VIDES / PLACEHOLDER ("-", "--", null) ===`)
  for (const field of ['city', 'region', 'country', 'type', 'email', 'phone', 'company']) {
    const empties = rows.filter(r => isPlaceholder(r[field])).length
    console.log(`  ${field}: ${empties}/${rows.length} vides`)
  }

  await prisma.$disconnect()
}

main().catch(async (e) => {
  console.error(e)
  await prisma.$disconnect()
  process.exit(1)
})

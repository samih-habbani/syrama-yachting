// One-off import: parses ~/Downloads/property.sql (MySQL dump) and inserts
// every row into the new `property` table via Prisma.
// - the dump is split into several `INSERT INTO` statements (phpMyAdmin does
//   this for large tables) — all of them are read and combined
// - converts amenities/bed_distribution from JSON-string columns into real
//   JSON values (Prisma `Json` fields)
// - converts the tinyint(1) flag columns into booleans
//
// Usage:  node scripts/import-properties.mjs /absolute/path/to/property.sql
import { readFileSync } from 'fs'
import { PrismaClient } from '@prisma/client'

const filePath = process.argv[2] || '/Users/samihhabbani/Downloads/property.sql'
const sql = readFileSync(filePath, 'utf8')

// --- Column order, exactly as in the dump's INSERT column list ---
const columns = [
  'id', 'title', 'description', 'city', 'zip_code', 'type', 'surface', 'rooms',
  'bedrooms', 'bathrooms', 'price', 'reference', 'year', 'for_sale',
  'is_off_market', 'region', 'available', 'status', 'rating', 'reviews_count',
  'surface_unit', 'currency', 'map_iframe_src', 'provider_id', 'price_day',
  'max_guests', 'beds', 'terrace_surface', 'has_terrace', 'has_balcony',
  'pets_allowed', 'parties_allowed', 'check_in_from', 'check_out_before',
  'amenities', 'bed_distribution', 'price_week', 'price_month',
]

// Same tuple parser as import-providers.mjs / import-customers.mjs.
function parseValuesFrom(text, startIndex) {
  const rows = []
  let i = startIndex
  const n = text.length
  while (i < n) {
    while (i < n && /[\s,]/.test(text[i])) i++
    if (i >= n || text[i] !== '(') break
    i++
    const row = []
    while (true) {
      while (i < n && /\s/.test(text[i])) i++
      if (text[i] === "'") {
        i++
        let buf = ''
        while (true) {
          const c = text[i]
          if (c === '\\') {
            const nc = text[i + 1]
            const map = { n: '\n', t: '\t', r: '\r', "'": "'", '"': '"', '\\': '\\', '0': '\0' }
            buf += map[nc] !== undefined ? map[nc] : nc
            i += 2
            continue
          }
          if (c === "'") {
            if (text[i + 1] === "'") { buf += "'"; i += 2; continue }
            i++
            break
          }
          buf += c
          i++
        }
        row.push(buf)
      } else if (text.slice(i, i + 4) === 'NULL') {
        row.push(null)
        i += 4
      } else {
        let j = i
        while (j < n && text[j] !== ',' && text[j] !== ')') j++
        row.push(text.slice(i, j).trim())
        i = j
      }
      while (i < n && /\s/.test(text[i])) i++
      if (text[i] === ',') { i++; continue }
      if (text[i] === ')') { i++; break }
      throw new Error(`Unexpected character ${JSON.stringify(text[i])} at position ${i}`)
    }
    rows.push(row)
  }
  return { rows, endIndex: i }
}

// --- Walk every `INSERT INTO \`property\`` statement in the file ---
let rawRows = []
let searchFrom = 0
let statementCount = 0
while (true) {
  const insertStart = sql.indexOf('INSERT INTO `property`', searchFrom)
  if (insertStart === -1) break
  statementCount++
  const valuesStart = sql.indexOf('VALUES', insertStart) + 'VALUES'.length
  const { rows, endIndex } = parseValuesFrom(sql, valuesStart)
  rawRows = rawRows.concat(rows)
  searchFrom = endIndex
}
console.log(`Parsed ${rawRows.length} rows from ${statementCount} INSERT statement(s).`)

const toFloat = (v) => (v === null ? null : parseFloat(v))
const toInt = (v) => (v === null ? null : parseInt(v, 10))
const toBool = (v) => v === '1'
const toJson = (v) => {
  if (v === null) return null
  try { return JSON.parse(v) } catch { return null }
}

// --- Map each tuple to a Prisma-ready object ---
const records = rawRows.map((values) => {
  const obj = {}
  columns.forEach((col, idx) => { obj[col] = values[idx] })

  return {
    id: toInt(obj.id),
    title: obj.title,
    description: obj.description,
    city: obj.city,
    zipCode: obj.zip_code,
    type: obj.type,
    surface: toFloat(obj.surface),
    rooms: toInt(obj.rooms),
    bedrooms: toInt(obj.bedrooms),
    bathrooms: toInt(obj.bathrooms),
    price: toFloat(obj.price),
    reference: obj.reference,
    year: toInt(obj.year),
    forSale: toBool(obj.for_sale),
    isOffMarket: toBool(obj.is_off_market),
    region: obj.region,
    available: toBool(obj.available),
    status: obj.status,
    rating: toFloat(obj.rating),
    reviewsCount: toInt(obj.reviews_count),
    surfaceUnit: obj.surface_unit,
    currency: obj.currency,
    mapIframeSrc: obj.map_iframe_src,
    providerId: toInt(obj.provider_id),
    priceDay: toFloat(obj.price_day),
    maxGuests: toInt(obj.max_guests),
    beds: toInt(obj.beds),
    terraceSurface: toFloat(obj.terrace_surface),
    hasTerrace: toBool(obj.has_terrace),
    hasBalcony: toBool(obj.has_balcony),
    petsAllowed: toBool(obj.pets_allowed),
    partiesAllowed: toBool(obj.parties_allowed),
    checkInFrom: obj.check_in_from,
    checkOutBefore: obj.check_out_before,
    amenities: toJson(obj.amenities),
    bedDistribution: toJson(obj.bed_distribution),
    priceWeek: toFloat(obj.price_week),
    priceMonth: toFloat(obj.price_month),
  }
})

if (process.env.DRY_RUN) {
  console.log(JSON.stringify(records, null, 2))
  process.exit(0)
}

// --- Insert ---
const prisma = new PrismaClient()

async function main() {
  let inserted = 0
  for (const record of records) {
    await prisma.property.create({ data: record })
    inserted++
  }
  console.log(`Inserted ${inserted} properties.`)

  // Keep the id sequence ahead of the highest imported id.
  const maxId = Math.max(...records.map((r) => r.id))
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('property', 'id'), ${maxId}, true);`
  )
  console.log(`Sequence advanced past id ${maxId}.`)
}

main()
  .catch((e) => { console.error(e); process.exitCode = 1 })
  .finally(() => prisma.$disconnect())

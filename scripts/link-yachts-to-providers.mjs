// One-off: parses ~/Downloads/yacht (2).sql (the MySQL source dump) and
// backfills Yacht.providerId in Postgres from its provider_id column.
// The `yacht` table and its provider_id column already exist here — this
// just extracts id -> provider_id pairs from the dump and applies them.
//
// Usage:  node scripts/link-yachts-to-providers.mjs "/path/to/yacht (2).sql"
import { readFileSync } from 'fs'
import { PrismaClient } from '@prisma/client'

const filePath = process.argv[2] || '/Users/samihhabbani/Downloads/yacht (2).sql'
const sql = readFileSync(filePath, 'utf8')

const columns = [
  'id', 'builder', 'model', 'engines', 'length', 'beam', 'beam_open_platform',
  'draft', 'cruise_speed', 'max_speed', 'cabins', 'max_guests', 'max_sleeping',
  'consumption', 'autonomy', 'fuel_capacity', 'water_capacity',
  'navigation_class', 'dry_weight', 'hull', 'status', 'available', 'rating',
  'reviews_count', 'city', 'provider_id', 'price_day', 'year', 'region',
  'currency', 'length_unit', 'map_iframe_src', 'price_hour', 'price_week',
  'created_at',
]

// Same tuple parser as the other import scripts (import-providers.mjs etc.)
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

let rawRows = []
let searchFrom = 0
let statementCount = 0
while (true) {
  const insertStart = sql.indexOf('INSERT INTO `yacht`', searchFrom)
  if (insertStart === -1) break
  statementCount++
  const valuesStart = sql.indexOf('VALUES', insertStart) + 'VALUES'.length
  const { rows, endIndex } = parseValuesFrom(sql, valuesStart)
  rawRows = rawRows.concat(rows)
  searchFrom = endIndex
}
console.log(`Parsed ${rawRows.length} rows from ${statementCount} INSERT statement(s).`)

const idIdx = columns.indexOf('id')
const providerIdx = columns.indexOf('provider_id')

const pairs = rawRows.map((values) => ({
  id: parseInt(values[idIdx], 10),
  providerId: values[providerIdx] === null ? null : parseInt(values[providerIdx], 10),
}))

const withProvider = pairs.filter((p) => p.providerId !== null)
console.log(`Rows with a provider_id in the dump: ${withProvider.length} / ${pairs.length}`)

if (process.env.DRY_RUN) {
  console.log(JSON.stringify(pairs, null, 2))
  process.exit(0)
}

const prisma = new PrismaClient()

async function main() {
  // Sanity check first: compare against what's already in the DB, so any
  // disagreement is visible before writing anything.
  const existing = await prisma.yacht.findMany({ select: { id: true, providerId: true } })
  const existingMap = new Map(existing.map((y) => [y.id, y.providerId]))

  let filled = 0
  let alreadyMatching = 0
  let conflicts = []
  let unknownYachtId = []
  let unknownProviderId = []

  const providerIds = new Set((await prisma.provider.findMany({ select: { id: true } })).map((p) => p.id))

  for (const { id, providerId } of withProvider) {
    if (!existingMap.has(id)) { unknownYachtId.push(id); continue }
    if (!providerIds.has(providerId)) { unknownProviderId.push({ id, providerId }); continue }
    const current = existingMap.get(id)
    if (current === providerId) { alreadyMatching++; continue }
    if (current !== null && current !== providerId) {
      conflicts.push({ id, current, dump: providerId })
      continue
    }
    await prisma.yacht.update({ where: { id }, data: { providerId } })
    filled++
  }

  console.log(`Already matching: ${alreadyMatching}`)
  console.log(`Filled (was null): ${filled}`)
  console.log(`Conflicts (DB had a different providerId, left untouched): ${conflicts.length}`)
  if (conflicts.length) console.log(conflicts)
  console.log(`Yacht ids in dump not found in DB: ${unknownYachtId.length}`, unknownYachtId)
  console.log(`Provider ids in dump not found in DB: ${unknownProviderId.length}`, unknownProviderId)

  const stillNull = await prisma.yacht.count({ where: { providerId: null } })
  console.log(`\nYachts still without a providerId: ${stillNull}`)

  await prisma.$disconnect()
}

main().catch(async (e) => {
  console.error(e)
  await prisma.$disconnect()
  process.exitCode = 1
})

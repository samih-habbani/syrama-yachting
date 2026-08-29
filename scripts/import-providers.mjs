// One-off import: parses public/../Downloads/provider.sql (MySQL dump) and
// inserts every row into the new `provider` table via Prisma.
// - the dump is split into several `INSERT INTO` statements (phpMyAdmin does
//   this for large tables) — all of them are read and combined
// - drops `to_follow_up` (removed from the schema on request)
// - converts `services` from a JSON string ('["Vente","Location"]') into a
//   real string array, matching the Prisma `services String[]` field
// - converts `is_active` (0/1) into a boolean
//
// Usage:  node scripts/import-providers.mjs /absolute/path/to/provider.sql
import { readFileSync } from 'fs'
import { PrismaClient } from '@prisma/client'

const filePath = process.argv[2] || '/Users/samihhabbani/Downloads/provider.sql'
const sql = readFileSync(filePath, 'utf8')

// --- Column order, exactly as in the dump's INSERT column list ---
const columns = [
  'id', 'name', 'company', 'email', 'phone', 'city', 'country', 'type',
  'services', 'description', 'is_active', 'website', 'instagram', 'notes',
  'position', 'first_contact', 'first_name', 'region', 'to_follow_up',
  'updated_at', 'manager', 'address', 'postal_code',
]

// --- Minimal MySQL value-tuple parser (handles '...' strings with
//     backslash escapes, NULL, and bare numeric tokens). Parses tuples
//     starting at `startIndex` until the next thing that isn't a '(' —
//     which is exactly where a statement's own terminating ';' sits, even
//     when a data value itself contains an embedded ';' (those are consumed
//     inside the quoted-string branch, never seen at the top level). ---
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

// --- Walk every `INSERT INTO \`provider\`` statement in the file ---
let rawRows = []
let searchFrom = 0
let statementCount = 0
while (true) {
  const insertStart = sql.indexOf('INSERT INTO `provider`', searchFrom)
  if (insertStart === -1) break
  statementCount++
  const valuesStart = sql.indexOf('VALUES', insertStart) + 'VALUES'.length
  const { rows, endIndex } = parseValuesFrom(sql, valuesStart)
  rawRows = rawRows.concat(rows)
  searchFrom = endIndex
}
console.log(`Parsed ${rawRows.length} rows from ${statementCount} INSERT statement(s).`)

// --- Map each tuple to a Prisma-ready object ---
const records = rawRows.map((values) => {
  const obj = {}
  columns.forEach((col, idx) => { obj[col] = values[idx] })

  let services = []
  if (obj.services) {
    try {
      const parsed = JSON.parse(obj.services)
      if (Array.isArray(parsed)) services = parsed.map(String)
    } catch {
      services = []
    }
  }

  return {
    id: parseInt(obj.id, 10),
    name: obj.name,
    company: obj.company,
    email: obj.email,
    phone: obj.phone,
    city: obj.city,
    country: obj.country,
    type: obj.type,
    services,
    description: obj.description,
    isActive: obj.is_active === '1',
    website: obj.website,
    instagram: obj.instagram,
    notes: obj.notes,
    position: obj.position,
    firstContact: obj.first_contact,
    firstName: obj.first_name,
    region: obj.region,
    updatedAt: obj.updated_at ? new Date(obj.updated_at.replace(' ', 'T') + 'Z') : null,
    manager: obj.manager,
    address: obj.address,
    postalCode: obj.postal_code,
    // to_follow_up intentionally dropped
  }
})

// --- Insert ---
const prisma = new PrismaClient()

async function main() {
  let inserted = 0
  for (const record of records) {
    await prisma.provider.create({ data: record })
    inserted++
  }
  console.log(`Inserted ${inserted} providers.`)

  // Keep the id sequence ahead of the highest imported id, so future
  // auto-increments (new providers added later) never collide.
  const maxId = Math.max(...records.map((r) => r.id))
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('provider', 'id'), ${maxId}, true);`
  )
  console.log(`Sequence advanced past id ${maxId}.`)
}

main()
  .catch((e) => { console.error(e); process.exitCode = 1 })
  .finally(() => prisma.$disconnect())

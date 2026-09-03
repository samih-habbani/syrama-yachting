// One-off import: parses ~/Downloads/reservation.sql (MySQL dump) and
// inserts every legitimate row into the `reservation` table.
// - the dump's own `customer_id` refers to the OLD MySQL customer table's
//   ids, which were NOT preserved when that table was imported into
//   Postgres `client` (see scripts/import-customers.mjs) — so clients are
//   matched by EMAIL instead, which is reliable and unique.
// - `yacht_id` IS directly usable: the yacht bulk import preserved the
//   original ids, verified against this dump before writing anything.
// - excludes obvious dev-test rows (fake @mail.com addresses, no customer/
//   provider linkage) and spam (matches the same pattern excluded from
//   customer.sql: fake "message" scam text, disposable email domain)
// - creates a new Client (matching the live booking flow's own behaviour)
//   for any reservation contact not already found by email
//
// Usage:  node scripts/import-reservations.mjs /absolute/path/to/reservation.sql
import { readFileSync } from 'fs'
import { PrismaClient } from '@prisma/client'

const filePath = process.argv[2] || '/Users/samihhabbani/Downloads/reservation.sql'
const sql = readFileSync(filePath, 'utf8')

const columns = [
  'id', 'type', 'object_id', 'object_title', 'object_city', 'start_date',
  'end_date', 'first_name', 'last_name', 'email', 'phone', 'message',
  'status', 'created_at', 'image', 'customer_id', 'provider_id',
  'price_total', 'commission_rate', 'currency', 'property_id', 'yacht_id',
]

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
  const insertStart = sql.indexOf('INSERT INTO `reservation`', searchFrom)
  if (insertStart === -1) break
  statementCount++
  const valuesStart = sql.indexOf('VALUES', insertStart) + 'VALUES'.length
  const { rows, endIndex } = parseValuesFrom(sql, valuesStart)
  rawRows = rawRows.concat(rows)
  searchFrom = endIndex
}
console.log(`Parsed ${rawRows.length} rows from ${statementCount} INSERT statement(s).`)

const SPAM_DOMAIN = /@(immenseignite\.info|web-library\.net|emalupe\.com|merepost\.com)$/i
const DEV_TEST_DOMAIN = /@mail\.com$/i

function classify(row) {
  const obj = {}
  columns.forEach((col, idx) => { obj[col] = row[idx] })
  const email = obj.email || ''
  if (/https?:\/\/|graph\.org|linkspree/i.test(obj.first_name || '') || /https?:\/\/|graph\.org|linkspree/i.test(obj.message || '')) return 'spam'
  if (SPAM_DOMAIN.test(email)) return 'spam'
  if (DEV_TEST_DOMAIN.test(email) && !obj.customer_id && !obj.provider_id) return 'test'
  return 'keep'
}

const kept = []
const skipped = { spam: [], test: [] }
for (const row of rawRows) {
  const verdict = classify(row)
  if (verdict === 'keep') kept.push(row)
  else skipped[verdict].push(row[columns.indexOf('id')])
}
console.log(`Kept ${kept.length}, skipped ${skipped.test.length} dev-test row(s) (ids: ${skipped.test.join(', ')}), ${skipped.spam.length} spam row(s) (ids: ${skipped.spam.join(', ')}).`)

const toFloat = (v) => (v === null ? null : parseFloat(v))
const toInt = (v) => (v === null ? null : parseInt(v, 10))
const toDate = (v) => (v === null ? null : new Date(v.replace(' ', 'T') + 'Z'))

const records = kept.map((values) => {
  const obj = {}
  columns.forEach((col, idx) => { obj[col] = values[idx] })
  return {
    origId: toInt(obj.id),
    type: obj.type,
    objectId: toInt(obj.object_id),
    objectTitle: obj.object_title,
    location: obj.object_city,
    date: toDate(obj.start_date),
    endDate: toDate(obj.end_date),
    firstName: obj.first_name,
    lastName: obj.last_name,
    fullName: [obj.first_name, obj.last_name].filter(Boolean).join(' ').trim() || null,
    email: obj.email,
    phone: obj.phone,
    message: obj.message,
    status: obj.status || 'pending',
    createdAt: toDate(obj.created_at),
    image: obj.image,
    providerId: toInt(obj.provider_id),
    priceTotal: toFloat(obj.price_total),
    commissionRate: toFloat(obj.commission_rate),
    currency: obj.currency && obj.currency.trim() !== '' ? obj.currency : null,
    propertyId: toInt(obj.property_id),
    yachtId: toInt(obj.yacht_id),
  }
})

if (process.env.DRY_RUN) {
  console.log(JSON.stringify(records, null, 2))
  process.exit(0)
}

const prisma = new PrismaClient()

async function main() {
  // Verify every yacht_id in the kept rows actually exists (the bulk yacht
  // import preserved ids, but self-validate rather than assume).
  const yachtIds = [...new Set(records.map((r) => r.yachtId).filter((v) => v !== null))]
  const existingYachts = new Set((await prisma.yacht.findMany({ where: { id: { in: yachtIds } }, select: { id: true } })).map((y) => y.id))
  const missingYachtIds = yachtIds.filter((id) => !existingYachts.has(id))
  if (missingYachtIds.length > 0) {
    console.log(`WARNING — yacht ids referenced in the dump but not found in DB (will import with yachtId=null instead): ${missingYachtIds.join(', ')}`)
  }

  let created = 0
  let matchedClient = 0
  let newClient = 0

  for (const r of records) {
    let clientId = null
    if (r.email) {
      const existing = await prisma.client.findFirst({ where: { email: { equals: r.email, mode: 'insensitive' } }, select: { id: true } })
      if (existing) {
        clientId = existing.id
        matchedClient++
      }
    }
    if (!clientId) {
      const newC = await prisma.client.create({
        data: {
          fullName: r.fullName || 'Unknown',
          email: r.email,
          phone: r.phone,
        },
      })
      clientId = newC.id
      newClient++
    }

    const yachtId = r.yachtId !== null && existingYachts.has(r.yachtId) ? r.yachtId : null

    // Historical import doesn't know numberOfPeople (not in the legacy
    // schema at all) — left null, same as location when object_city was
    // itself empty.
    await prisma.reservation.create({
      data: {
        clientId,
        yachtId,
        date: r.date,
        endDate: r.endDate,
        location: r.location,
        price: r.priceTotal,
        status: r.status,
        createdAt: r.createdAt || undefined,
        type: r.type,
        objectId: r.objectId,
        objectTitle: r.objectTitle,
        firstName: r.firstName,
        lastName: r.lastName,
        email: r.email,
        phone: r.phone,
        message: r.message,
        image: r.image,
        providerId: r.providerId,
        priceTotal: r.priceTotal,
        commissionRate: r.commissionRate,
        currency: r.currency,
        propertyId: r.propertyId,
      },
    })
    created++
  }

  console.log(`\nInserted ${created} reservations.`)
  console.log(`Clients matched by email: ${matchedClient} | New clients created: ${newClient}`)

  await prisma.$disconnect()
}

main().catch(async (e) => {
  console.error(e)
  await prisma.$disconnect()
  process.exitCode = 1
})

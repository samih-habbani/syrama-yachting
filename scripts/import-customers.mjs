// One-off import: parses ~/Downloads/customer.sql (MySQL dump) and inserts
// every legitimate row into the `client` table via Prisma.
// - drops manager/is_active/to_follow_up/business_field/meeting_place/
//   instagram/description (not part of the Client model, per request)
// - concatenates first_name + last_name into fullName
// - clears placeholder emails ('no@no.no' etc.) and placeholder phones
//   ('0000000000') to null, same convention as the provider cleanup
// - excludes obvious spam/bot rows (fake "transfer/deposit" scam links with
//   emoji, or random-gibberish name pairs from a bot-spammed contact form)
// - does NOT reuse the dump's original ids (the client table already has a
//   live row referenced by a real reservation) — Postgres assigns fresh ids
//
// Usage:  node scripts/import-customers.mjs /absolute/path/to/customer.sql
import { readFileSync } from 'fs'
import { PrismaClient } from '@prisma/client'

const filePath = process.argv[2] || '/Users/samihhabbani/Downloads/customer.sql'
const sql = readFileSync(filePath, 'utf8')

const columns = [
  'id', 'first_name', 'last_name', 'phone', 'address', 'email', 'city',
  'meeting_place', 'business_field', 'to_follow_up', 'updated_at', 'manager',
  'is_active', 'country', 'notes', 'description', 'instagram', 'region',
]

// Same tuple parser as import-providers.mjs.
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
  const insertStart = sql.indexOf('INSERT INTO `customer`', searchFrom)
  if (insertStart === -1) break
  statementCount++
  const valuesStart = sql.indexOf('VALUES', insertStart) + 'VALUES'.length
  const { rows, endIndex } = parseValuesFrom(sql, valuesStart)
  rawRows = rawRows.concat(rows)
  searchFrom = endIndex
}
console.log(`Parsed ${rawRows.length} rows from ${statementCount} INSERT statement(s).`)

// --- Spam filter: obvious scam-link rows (emoji + "transfer/deposit/message"
// bait) and bot-form gibberish (random-letter first+last name pairs sharing
// the same disposable-looking domain). Real leads are kept even without a
// phone number. ---
const SPAM_DOMAIN = /@(immenseignite\.info|web-library\.net|emalupe\.com|merepost\.com)$/i
function isGibberishToken(s) {
  return typeof s === 'string' && /^[a-z]{6,12}$/.test(s) // lowercase-only random string, no vowunderstanding needed—just the shape
}
function looksLikeSpam(row) {
  const obj = {}
  columns.forEach((col, idx) => { obj[col] = row[idx] })
  const first = obj.first_name || ''
  const email = obj.email || ''
  if (/https?:\/\/|graph\.org|linkspree|<a href/i.test(first)) return true
  if (SPAM_DOMAIN.test(email)) return true
  if (isGibberishToken(obj.first_name) && isGibberishToken(obj.last_name)) return true
  return false
}

const isPlaceholder = (v) => !v || v.trim() === '-' || /^-+$/.test(v.trim())
const isPlaceholderEmail = (v) => !v || /^(no@no\.(no|co|com)|null@mail\.com)$/i.test(v.trim())
const isPlaceholderPhone = (v) => !v || /^0+$/.test(v.replace(/\s/g, ''))

const kept = []
const skipped = []
for (const row of rawRows) {
  if (looksLikeSpam(row)) { skipped.push(row[0]); continue }
  kept.push(row)
}
console.log(`Kept ${kept.length} rows, skipped ${skipped.length} spam rows (ids: ${skipped.join(', ')}).`)

const records = kept.map((values) => {
  const obj = {}
  columns.forEach((col, idx) => { obj[col] = values[idx] })

  const first = isPlaceholder(obj.first_name) ? '' : obj.first_name
  const last = isPlaceholder(obj.last_name) ? '' : obj.last_name
  const fullName = [first, last].filter(Boolean).join(' ').trim() || 'Sans nom'

  return {
    origId: parseInt(obj.id, 10),
    fullName,
    email: isPlaceholderEmail(obj.email) ? null : obj.email.trim(),
    phone: isPlaceholderPhone(obj.phone) ? null : obj.phone,
    address: isPlaceholder(obj.address) ? null : obj.address,
    city: isPlaceholder(obj.city) ? null : obj.city,
    country: isPlaceholder(obj.country) ? null : obj.country,
    region: isPlaceholder(obj.region) ? null : obj.region,
    notes: isPlaceholder(obj.notes) ? null : obj.notes,
    updatedAt: obj.updated_at ? new Date(obj.updated_at.replace(' ', 'T') + 'Z') : null,
  }
})

// Duplicate-email guard: @unique only allows one non-null occurrence — keep
// the first, null out the email on later duplicates rather than failing.
const seenEmails = new Set()
for (const r of records) {
  if (r.email) {
    const key = r.email.toLowerCase()
    if (seenEmails.has(key)) { console.log(`Duplicate email "${r.email}" on orig id ${r.origId} — clearing it to avoid a unique-constraint clash.`); r.email = null }
    else seenEmails.add(key)
  }
}

if (process.env.DRY_RUN) {
  console.log(JSON.stringify(records, null, 2))
  process.exit(0)
}

const prisma = new PrismaClient()

async function main() {
  let inserted = 0
  for (const record of records) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- destructured only to exclude it from `data`
    const { origId, ...data } = record
    await prisma.client.create({ data })
    inserted++
  }
  console.log(`Inserted ${inserted} clients.`)
  await prisma.$disconnect()
}

main().catch(async (e) => {
  console.error(e)
  await prisma.$disconnect()
  process.exitCode = 1
})

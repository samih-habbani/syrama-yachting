import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import ExcelJS from 'exceljs'

async function checkAuth() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value
  if (!userId) {
    throw new Error('Unauthorized')
  }
}

// Every Provider column, in the same order as the Prisma model — kept as one
// explicit list (rather than Object.keys on a row) so the column order stays
// stable even if a row happens to omit a key.
const COLUMNS: { key: string; header: string; width: number }[] = [
  { key: 'id', header: 'ID', width: 8 },
  { key: 'name', header: 'Nom', width: 22 },
  { key: 'firstName', header: 'Prénom', width: 18 },
  { key: 'company', header: 'Société', width: 30 },
  { key: 'position', header: 'Poste', width: 20 },
  { key: 'type', header: 'Type', width: 22 },
  { key: 'services', header: 'Services', width: 40 },
  { key: 'email', header: 'Email', width: 30 },
  { key: 'phone', header: 'Téléphone', width: 20 },
  { key: 'website', header: 'Site web', width: 28 },
  { key: 'instagram', header: 'Instagram', width: 20 },
  { key: 'address', header: 'Adresse', width: 30 },
  { key: 'postalCode', header: 'Code postal', width: 14 },
  { key: 'city', header: 'Ville', width: 20 },
  { key: 'region', header: 'Région', width: 18 },
  { key: 'country', header: 'Pays', width: 20 },
  { key: 'manager', header: 'Manager', width: 18 },
  { key: 'isActive', header: 'Actif', width: 10 },
  { key: 'firstContact', header: 'Premier contact', width: 18 },
  { key: 'updatedAt', header: 'Mis à jour le', width: 18 },
  { key: 'description', header: 'Description', width: 40 },
  { key: 'notes', header: 'Notes', width: 40 },
]

export async function GET() {
  try {
    await checkAuth()

    const providers = await prisma.provider.findMany({ orderBy: { id: 'asc' } })

    const workbook = new ExcelJS.Workbook()
    const sheet = workbook.addWorksheet('Providers')

    sheet.columns = COLUMNS.map((c) => ({ key: c.key, header: c.header, width: c.width }))
    sheet.getRow(1).font = { bold: true }
    sheet.getRow(1).alignment = { vertical: 'middle' }

    for (const p of providers) {
      sheet.addRow({
        id: p.id,
        name: p.name ?? '',
        firstName: p.firstName ?? '',
        company: p.company ?? '',
        position: p.position ?? '',
        type: p.type ?? '',
        services: p.services.join(', '),
        email: p.email ?? '',
        phone: p.phone ?? '',
        website: p.website ?? '',
        instagram: p.instagram ?? '',
        address: p.address ?? '',
        postalCode: p.postalCode ?? '',
        city: p.city ?? '',
        region: p.region ?? '',
        country: p.country ?? '',
        manager: p.manager ?? '',
        isActive: p.isActive === null ? '' : p.isActive ? 'Oui' : 'Non',
        firstContact: p.firstContact ?? '',
        updatedAt: p.updatedAt ? p.updatedAt.toISOString().slice(0, 10) : '',
        description: p.description ?? '',
        notes: p.notes ?? '',
      })
    }

    sheet.autoFilter = { from: 'A1', to: { row: 1, column: COLUMNS.length } }
    sheet.views = [{ state: 'frozen', ySplit: 1 }]

    const buffer = await workbook.xlsx.writeBuffer()
    const date = new Date().toISOString().slice(0, 10)

    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="syrama-providers-${date}.xlsx"`,
      },
    })
  } catch (error) {
    console.error('Export providers error:', error)
    return Response.json({ error: 'Failed to export providers' }, { status: 500 })
  }
}

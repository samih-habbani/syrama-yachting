import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import BookingLinkForm from '@/components/BookingLinkForm'

// Personal, one-off links shared over WhatsApp — never meant to be indexed
// or cached across requests (status must always reflect the latest state).
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Confirm Your Charter | Syrama Yachting',
  robots: { index: false, follow: false },
}

export default async function BookingLinkPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  const link = await prisma.bookingLink.findUnique({
    where: { token },
    include: {
      yacht: {
        select: {
          id: true,
          model: true,
          builder: true,
          length: true,
          region: true,
          city: true,
          media: { select: { url: true, alt: true }, take: 1 },
        },
      },
    },
  })

  if (!link) notFound()

  // A link generated "from" an existing reservation already knows who the
  // client is — pre-fill the form with their details instead of asking
  // them to retype everything.
  let initialClient = null
  if (link.reservationId) {
    const reservation = await prisma.reservation.findUnique({
      where: { id: link.reservationId },
      select: {
        firstName: true, lastName: true, email: true, phone: true,
        client: { select: { fullName: true, email: true, phone: true, country: true } },
      },
    })
    if (reservation) {
      const [fullNameFirst, ...fullNameRest] = (reservation.client.fullName || '').trim().split(/\s+/)
      initialClient = {
        firstName: reservation.firstName || fullNameFirst || '',
        lastName: reservation.lastName || fullNameRest.join(' ') || '',
        email: reservation.email || reservation.client.email || '',
        phone: reservation.phone || reservation.client.phone || '',
        country: reservation.client.country || '',
      }
    }
  }

  return (
    <main id="main-content" style={{ background: '#06090f', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingTop: 100 }}>
        <BookingLinkForm
          token={token}
          yacht={link.yacht}
          date={link.date.toISOString()}
          endDate={link.endDate ? link.endDate.toISOString() : null}
          startTime={link.startTime}
          endTime={link.endTime}
          completed={link.status === 'completed'}
          initialClient={initialClient}
        />
      </div>
      <Footer />
    </main>
  )
}

import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { firstName, lastName, email, phone, subject, message, destination, preferredDate, numberOfGuests } = data

    if (!firstName || !lastName || !email || !subject || !message) {
      return Response.json(
        { error: 'First name, last name, email, subject and message are required' },
        { status: 400 }
      )
    }

    const newMessage = await prisma.message.create({
      data: {
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        email,
        phone: phone || null,
        subject,
        message,
        destination: destination || null,
        preferredDate: preferredDate || null,
        numberOfGuests: numberOfGuests ? parseInt(numberOfGuests) : null,
        status: 'unread'
      }
    })

    // Send email asynchronously without blocking the response
    sendEmail(
      'contact@syrama-services.com',
      `New Message: ${subject}`,
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #b8974a;">New Contact Message</h2>

          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>From:</strong> ${firstName} ${lastName}</p>
            <p><strong>Email:</strong> ${email}</p>
            ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
            <p><strong>Request Type:</strong> ${subject}</p>
            ${destination ? `<p><strong>Destination:</strong> ${destination}</p>` : ''}
            ${preferredDate ? `<p><strong>Preferred Date:</strong> ${preferredDate}</p>` : ''}
            ${numberOfGuests ? `<p><strong>Number of Guests:</strong> ${numberOfGuests}</p>` : ''}
          </div>

          <div style="background-color: #f9f9f9; padding: 20px; border-left: 4px solid #b8974a; margin: 20px 0;">
            <p style="white-space: pre-wrap; color: #333;">${message}</p>
          </div>

          <p style="color: #999; font-size: 12px; margin-top: 30px;">
            This message was sent from your website contact form.
          </p>
        </div>
      `
    ).catch(err => console.error('Email sending error:', err))

    return Response.json(
      {
        success: true,
        message: 'Thank you! Your message has been received and we will get back to you soon.',
        data: newMessage
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Message creation error:', error)
    return Response.json(
      { error: 'Failed to create message' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const status = searchParams.get('status')
    const email = searchParams.get('email')

    const where: any = {}
    if (status) where.status = status
    if (email) where.email = { contains: email, mode: 'insensitive' }

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          subject: true,
          message: true,
          status: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.message.count({ where })
    ])

    const totalPages = Math.ceil(total / limit)

    return Response.json({
      messages,
      currentPage: page,
      totalPages,
      total
    })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return Response.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json()
    const { id, status } = data

    if (!id || !status) {
      return Response.json(
        { error: 'ID and status are required' },
        { status: 400 }
      )
    }

    const message = await prisma.message.update({
      where: { id: parseInt(id) },
      data: { status }
    })

    return Response.json(message)
  } catch (error) {
    console.error('Update message error:', error)
    return Response.json(
      { error: 'Failed to update message' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const data = await request.json()
    const { id } = data

    if (!id) {
      return Response.json(
        { error: 'ID is required' },
        { status: 400 }
      )
    }

    await prisma.message.delete({
      where: { id: parseInt(id) }
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error('Delete message error:', error)
    return Response.json(
      { error: 'Failed to delete message' },
      { status: 500 }
    )
  }
}

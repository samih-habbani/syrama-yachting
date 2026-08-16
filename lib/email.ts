import nodemailer from 'nodemailer'

// Debug: Check if env variables are loaded
console.log('[Email Config] GMAIL_EMAIL:', process.env.GMAIL_EMAIL ? 'SET' : 'MISSING')
console.log('[Email Config] GMAIL_APP_PASSWORD:', process.env.GMAIL_APP_PASSWORD ? 'SET' : 'MISSING')

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_APP_PASSWORD
  }
})

export async function sendEmail(to: string, subject: string, html: string) {
  try {
    // Verify configuration before sending
    if (!process.env.GMAIL_EMAIL || !process.env.GMAIL_APP_PASSWORD) {
      throw new Error('Gmail credentials not configured. Please set GMAIL_EMAIL and GMAIL_APP_PASSWORD environment variables.')
    }

    console.log('[Email] Sending email to:', to)
    const result = await transporter.sendMail({
      from: process.env.GMAIL_EMAIL,
      to,
      subject,
      html
    })

    console.log('[Email] Successfully sent:', result.messageId)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error('[Email ERROR]', error instanceof Error ? error.message : error)
    throw error
  }
}

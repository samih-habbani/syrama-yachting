import nodemailer from 'nodemailer'

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_APP_PASSWORD
  }
})

export async function sendEmail(to: string, subject: string, html: string) {
  try {
    await transporter.sendMail({
      from: process.env.GMAIL_EMAIL,
      to,
      subject,
      html
    })
    return { success: true }
  } catch (error) {
    console.error('Email error:', error)
    throw error
  }
}

import 'server-only'
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendVerificationEmail(to: string, token: string) {
  const link = `${process.env.APP_URL}/api/verify?token=${token}`

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: 'Verify your email',
    html: `
      <p>Click the link below to verify your email address. It expires in 24 hours.</p>
      <a href="${link}">${link}</a>
    `,
  })
}

export async function sendBalanceInvoiceEmail(
  to: string,
  details: { studentName: string; schoolName: string; balance: string }
) {
  const { studentName, schoolName, balance } = details

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: `Outstanding balance for ${studentName} — ${schoolName}`,
    html: `
      <p>This is a notice from ${schoolName} regarding an outstanding balance on ${studentName}'s account.</p>
      <p><strong>Amount due: ${balance}</strong></p>
      <p>This balance must be settled before a Transfer Certificate can be issued. Please contact the school to arrange payment.</p>
    `,
  })
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const link = `${process.env.APP_URL}/reset-password?token=${token}`

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: 'Reset your password',
    html: `
      <p>Click the link below to reset your password. It expires in 1 hour.</p>
      <a href="${link}">${link}</a>
      <p>If you didn't request this, you can safely ignore this email.</p>
    `,
  })
}

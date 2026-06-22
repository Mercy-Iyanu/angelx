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

const appUrl =
  process.env.APP_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

export async function sendPasswordResetEmail(to: string, token: string) {
  const url = `${appUrl}/reset-password?token=${token}`

  await transporter.sendMail({
    from: `"AngelX" <${process.env.SMTP_FROM}>`,
    to,
    subject: 'Reset your password — AngelX',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#171717">Reset your password</h2>
        <p style="color:#555">Click the button below to choose a new password. This link expires in 1 hour.</p>
        <a href="${url}" style="display:inline-block;margin:16px 0;padding:12px 24px;background:#171717;color:#fff;text-decoration:none;border-radius:6px;font-weight:600">
          Reset password
        </a>
        <p style="color:#999;font-size:13px">If you didn't request a password reset, you can safely ignore this email.</p>
      </div>
    `,
  })
}

export async function sendVerificationEmail(to: string, token: string) {
  const url = `${appUrl}/api/verify?token=${token}`

  await transporter.sendMail({
    from: `"AngelX" <${process.env.SMTP_FROM}>`,
    to,
    subject: 'Verify your email — AngelX',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#171717">Verify your email</h2>
        <p style="color:#555">Click the button below to confirm your email address. This link expires in 24 hours.</p>
        <a href="${url}" style="display:inline-block;margin:16px 0;padding:12px 24px;background:#171717;color:#fff;text-decoration:none;border-radius:6px;font-weight:600">
          Verify email
        </a>
        <p style="color:#999;font-size:13px">If you didn't create an AngelX account, you can safely ignore this email.</p>
      </div>
    `,
  })
}

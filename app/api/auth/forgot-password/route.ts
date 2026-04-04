import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { findUserByEmail } from '../../../lib/auth/userStore'
import { execute, query } from '../../../lib/db'
import nodemailer from 'nodemailer'

const TURNSTILE_SECRET = '0x4AAAAAAC0gHMKrCpLcA1ExsjVubUZZhUY'

async function verifyTurnstile(token: string): Promise<boolean> {
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret: TURNSTILE_SECRET, response: token }),
    })
    const data = await res.json()
    return data.success === true
  } catch {
    return false
  }
}

const transporter = nodemailer.createTransport({
  host: 'cpsrv1.ugurlubilisim.com',
  port: 587,
  secure: false,
  requireTLS: true,
  auth: { user: 'no-reply@merumy.com.tr', pass: 'tahribat1907' },
  tls: { rejectUnauthorized: false },
})

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, turnstileToken } = body || {}

    if (!email) {
      return NextResponse.json({ error: 'MISSING_EMAIL' }, { status: 400 })
    }

    // Turnstile doğrulama
    if (!turnstileToken || !(await verifyTurnstile(turnstileToken))) {
      return NextResponse.json({ error: 'CAPTCHA_FAILED' }, { status: 400 })
    }

    // Kullanıcıyı DB'de ara
    const user = await findUserByEmail(String(email))

    // Güvenlik: kullanıcı bulunsun ya da bulunmasın aynı yanıtı ver
    if (!user) {
      return NextResponse.json({ ok: true })
    }

    // Eski tokenları temizle
    await execute('DELETE FROM password_reset_tokens WHERE user_id = ? OR expires_at < NOW()', [user.id])

    // Yeni token oluştur
    const rawToken = crypto.randomBytes(32).toString('hex')
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 saat

    await execute(
      'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [user.id, hashedToken, expiresAt]
    )

    const resetLink = `https://merumy.com/reset-password?token=${rawToken}`

    // Mail gönder
    await transporter.sendMail({
      from: 'Merumy <no-reply@merumy.com.tr>',
      to: user.email,
      subject: 'Merumy — Şifre Sıfırlama',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#f9f9f9;border-radius:12px;">
          <img src="https://merumy.com/footerlogo.png" alt="Merumy" style="height:40px;margin-bottom:24px;" />
          <h2 style="color:#2d5a27;margin-bottom:12px;">Şifre Sıfırlama</h2>
          <p style="color:#444;line-height:1.6;">Merhaba <strong>${user.name}</strong>,</p>
          <p style="color:#444;line-height:1.6;">Şifrenizi sıfırlamak için aşağıdaki butona tıklayın. Bu bağlantı <strong>1 saat</strong> geçerlidir.</p>
          <a href="${resetLink}" style="display:inline-block;margin:24px 0;padding:14px 28px;background:#2d5a27;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;font-size:16px;">
            Şifremi Sıfırla
          </a>
          <p style="color:#888;font-size:13px;">Bu isteği siz yapmadıysanız bu e-postayı görmezden gelebilirsiniz.</p>
          <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
          <p style="color:#aaa;font-size:12px;">Merumy K-Beauty — merumy.com</p>
        </div>
      `,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Forgot password error:', err)
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 })
  }
}

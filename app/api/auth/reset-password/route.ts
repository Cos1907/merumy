import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { updateUserPassword } from '../../../lib/auth/userStore'
import { execute, queryOne } from '../../../lib/db'

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

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { token, password, turnstileToken } = body || {}

    if (!token || !password) {
      return NextResponse.json({ error: 'MISSING_FIELDS' }, { status: 400 })
    }

    if (String(password).length < 8) {
      return NextResponse.json({ error: 'WEAK_PASSWORD' }, { status: 400 })
    }

    // Turnstile doğrulama
    if (!turnstileToken || !(await verifyTurnstile(turnstileToken))) {
      return NextResponse.json({ error: 'CAPTCHA_FAILED' }, { status: 400 })
    }

    // Token'ı hashle ve DB'de ara
    const hashedToken = crypto.createHash('sha256').update(String(token)).digest('hex')
    const record = await queryOne<any>(
      'SELECT id, user_id FROM password_reset_tokens WHERE token = ? AND expires_at > NOW()',
      [hashedToken]
    )

    if (!record) {
      return NextResponse.json({ error: 'INVALID_OR_EXPIRED_TOKEN' }, { status: 400 })
    }

    // Şifreyi güncelle
    await updateUserPassword(record.user_id, String(password))

    // Kullanılan token'ı sil
    await execute('DELETE FROM password_reset_tokens WHERE id = ?', [record.id])

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Reset password error:', err)
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { createUser } from '../../../lib/auth/userStore'
import { createSession } from '../../../lib/auth/session'
import { sendWelcomeEmail, sendAdminNewUserNotification } from '../../../lib/mail'

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

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password, firstName, lastName, phone, turnstileToken } = body || {}

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: 'MISSING_FIELDS' }, { status: 400 })
    }
    if (String(password).length < 8) {
      return NextResponse.json({ error: 'WEAK_PASSWORD' }, { status: 400 })
    }

    // Turnstile doğrulama
    if (!turnstileToken || !(await verifyTurnstile(turnstileToken))) {
      return NextResponse.json({ error: 'CAPTCHA_FAILED' }, { status: 400 })
    }

    const user = await createUser({
      email: String(email),
      password: String(password),
      firstName: String(firstName),
      lastName: String(lastName),
      phone: phone ? String(phone) : '',
    })

    // Auto-login
    createSession(user)

    // Send welcome email to user
    sendWelcomeEmail(String(email), String(firstName)).catch(console.error)
    
    // Send notification to admin
    sendAdminNewUserNotification({
      firstName: String(firstName),
      lastName: String(lastName),
      email: String(email),
      phone: phone ? String(phone) : '',
    }).catch(console.error)

    return NextResponse.json({ user }, { status: 201 })
  } catch (e: any) {
    if (e?.message === 'EMAIL_EXISTS') {
      return NextResponse.json({ error: 'EMAIL_EXISTS' }, { status: 409 })
    }
    console.error('Signup error:', e)
    return NextResponse.json({ error: 'UNKNOWN_ERROR' }, { status: 500 })
  }
}

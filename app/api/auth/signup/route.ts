import { NextResponse } from 'next/server'
import { createUser } from '../../../lib/auth/userStore'
import { createSession } from '../../../lib/auth/session'
import { sendWelcomeEmail, sendAdminNewUserNotification } from '../../../lib/mail'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password, firstName, lastName, phone } = body || {}

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: 'MISSING_FIELDS' }, { status: 400 })
    }
    if (String(password).length < 8) {
      return NextResponse.json({ error: 'WEAK_PASSWORD' }, { status: 400 })
    }

    const user = await createUser({
      email: String(email),
      password: String(password),
      firstName: String(firstName),
      lastName: String(lastName),
      phone: phone ? String(phone) : '',
    })

    // auto-login
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
    return NextResponse.json({ error: 'UNKNOWN_ERROR' }, { status: 500 })
  }
}



import { NextResponse } from 'next/server'
import { authenticateUser } from '../../../lib/auth/userStore'
import { createSession } from '../../../lib/auth/session'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password } = body || {}
    if (!email || !password) {
      return NextResponse.json({ error: 'MISSING_FIELDS' }, { status: 400 })
    }

    const user = await authenticateUser({ email: String(email), password: String(password) })
    createSession(user)
    return NextResponse.json({ user }, { status: 200 })
  } catch (e: any) {
    if (e?.message === 'INVALID_CREDENTIALS') {
      return NextResponse.json({ error: 'INVALID_CREDENTIALS' }, { status: 401 })
    }
    return NextResponse.json({ error: 'UNKNOWN_ERROR' }, { status: 500 })
  }
}



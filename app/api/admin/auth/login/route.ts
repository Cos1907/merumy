import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { queryOne, execute } from '../../../../lib/db'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json({ error: 'Kullanıcı adı ve şifre gerekli' }, { status: 400 })
    }

    // Check admin credentials from environment or hardcoded
    const adminUsername = process.env.ADMIN_USERNAME || 'admin'
    const adminPassword = process.env.ADMIN_PASSWORD || 'Merumy2024!'

    if (username !== adminUsername || password !== adminPassword) {
      return NextResponse.json({ error: 'Geçersiz kullanıcı adı veya şifre' }, { status: 401 })
    }

    // Create session token
    const sessionToken = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    // Try to store session in DB
    try {
      await execute(
        `INSERT INTO admin_sessions (session_token, expires_at, created_at) VALUES (?, ?, NOW())`,
        [sessionToken, expiresAt.toISOString().slice(0, 19).replace('T', ' ')]
      )
    } catch (dbError) {
      console.error('Failed to store admin session in DB:', dbError)
      // Continue anyway - session stored in cookie
    }

    const cookieStore = await cookies()
    cookieStore.set('admin_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json({ error: 'Giriş hatası' }, { status: 500 })
  }
}

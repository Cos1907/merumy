import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { queryOne, execute } from '../../../../lib/db'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, username, password } = body

    const loginEmail = email || username
    if (!loginEmail || !password) {
      return NextResponse.json({ error: 'E-posta ve şifre gerekli' }, { status: 400 })
    }

    // Hash the password with SHA256 (same as stored in DB)
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex')

    // Check admin credentials from DB
    const adminUser = await queryOne<any>(
      'SELECT * FROM admin_users WHERE email = ? AND password_hash = ? AND is_active = 1',
      [loginEmail, passwordHash]
    )

    if (!adminUser) {
      return NextResponse.json({ error: 'Geçersiz e-posta veya şifre' }, { status: 401 })
    }

    // Create session token
    const sessionToken = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    // Store session in DB
    await execute(
      `INSERT INTO admin_sessions (session_token, user_id, expires_at, created_at) VALUES (?, ?, ?, NOW())`,
      [sessionToken, adminUser.id, expiresAt.toISOString().slice(0, 19).replace('T', ' ')]
    )

    const cookieStore = await cookies()
    cookieStore.set('admin_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    })

    return NextResponse.json({
      success: true,
      user: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role,
      }
    })
  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json({ error: 'Giriş hatası' }, { status: 500 })
  }
}

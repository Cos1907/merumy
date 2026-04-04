import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { queryOne } from '../../../../lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('admin_session')?.value
    if (!sessionToken) {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
    }

    const session = await queryOne<any>(
      `SELECT s.*, u.email, u.name, u.role, u.allowed_sections, u.must_change_password
       FROM admin_sessions s
       LEFT JOIN admin_users u ON u.id = s.user_id
       WHERE s.session_token = ? AND s.expires_at > NOW()`,
      [sessionToken]
    )

    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
    }

    return NextResponse.json({
      ok: true,
      user: {
        id: session.user_id,
        email: session.email || '',
        name: session.name || '',
        role: session.role || 'admin',
        allowedSections: session.allowed_sections ? JSON.parse(session.allowed_sections) : null,
        mustChangePassword: session.must_change_password === 1,
      }
    })
  } catch {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

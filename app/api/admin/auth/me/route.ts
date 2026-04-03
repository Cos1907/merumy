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
      'SELECT * FROM admin_sessions WHERE session_token = ? AND expires_at > NOW()',
      [sessionToken]
    )
    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
    }
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

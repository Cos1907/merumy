import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { execute } from '../../../../lib/db'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('admin_session')?.value

    if (sessionToken) {
      try {
        await execute('DELETE FROM admin_sessions WHERE session_token = ?', [sessionToken])
      } catch {
        // Ignore DB error
      }
      cookieStore.delete('admin_session')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Çıkış hatası' }, { status: 500 })
  }
}

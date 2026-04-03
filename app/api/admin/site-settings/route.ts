import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { queryOne } from '../../../lib/db'
import fs from 'fs'
import path from 'path'

const SETTINGS_PATH = path.join(process.cwd(), 'data', 'site-settings.json')

const defaultSettings = {
  topbarEnabled: true,
  topbarText: 'AÇILIŞA ÖZEL %30 İNDİRİM',
  topbarBgColor: '#92D0AA',
  topbarTextColor: '#ffffff',
}

async function checkAdminSession(): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('admin_session')?.value
    if (!sessionToken) return false
    const session = await queryOne<any>(
      'SELECT * FROM admin_sessions WHERE session_token = ? AND expires_at > NOW()',
      [sessionToken]
    )
    return !!session
  } catch {
    return false
  }
}

function getSettings() {
  try {
    if (fs.existsSync(SETTINGS_PATH)) {
      return { ...defaultSettings, ...JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf-8')) }
    }
  } catch {
    // ignore
  }
  return defaultSettings
}

export async function GET() {
  return NextResponse.json(getSettings())
}

export async function PUT(request: NextRequest) {
  const isAdmin = await checkAdminSession()
  if (!isAdmin) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  try {
    const body = await request.json()
    const current = getSettings()
    const updated = { ...current, ...body }
    const dir = path.dirname(SETTINGS_PATH)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(SETTINGS_PATH, JSON.stringify(updated, null, 2))
    return NextResponse.json({ success: true, settings: updated })
  } catch (error) {
    console.error('Save settings error:', error)
    return NextResponse.json({ error: 'Kayıt hatası' }, { status: 500 })
  }
}

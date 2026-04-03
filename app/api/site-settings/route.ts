import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

const SETTINGS_PATH = path.join(process.cwd(), 'data', 'site-settings.json')

const defaultSettings = {
  topbarEnabled: true,
  topbarText: 'AÇILIŞA ÖZEL %30 İNDİRİM',
  topbarBgColor: '#92D0AA',
  topbarTextColor: '#ffffff',
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

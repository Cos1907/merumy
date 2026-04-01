import { NextRequest, NextResponse } from 'next/server';
import { execute, query } from '../../../lib/db';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

const DEFAULT_SETTINGS = {
  topbarEnabled: true,
  topbarText: '1000 TL VE ÜZERİ ALIŞVERIŞLERDE ÜCRETSİZ KARGO',
  topbarBgColor: '#000000',
  topbarTextColor: '#ffffff',
  maintenanceMode: false,
};

async function ensureTable() {
  await execute(`CREATE TABLE IF NOT EXISTS site_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`, []);
}

async function checkAdmin(): Promise<boolean> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('admin_session')?.value;
    if (!token) return false;
    const rows = await query<any[]>(
      'SELECT s.user_id FROM admin_sessions s WHERE s.session_token = ? AND s.expires_at > NOW()',
      [token]
    );
    return rows.length > 0;
  } catch { return false; }
}

export async function GET() {
  try {
    await ensureTable();
    const rows = await query<any[]>('SELECT setting_key, setting_value FROM site_settings', []);
    const map: any = { ...DEFAULT_SETTINGS };
    for (const row of rows) {
      try {
        map[row.setting_key] = JSON.parse(row.setting_value);
      } catch {
        map[row.setting_key] = row.setting_value;
      }
    }
    return NextResponse.json({ settings: map });
  } catch (e) {
    return NextResponse.json({ settings: DEFAULT_SETTINGS });
  }
}

export async function PUT(request: NextRequest) {
  const isAdmin = await checkAdmin();
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await ensureTable();
  const { settings } = await request.json();
  for (const [key, value] of Object.entries(settings)) {
    await execute(
      'INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)',
      [key, JSON.stringify(value)]
    );
  }
  return NextResponse.json({ success: true });
}

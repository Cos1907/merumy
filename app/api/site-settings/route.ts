import { NextResponse } from 'next/server';
import { query } from '../../lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const DEFAULT_SETTINGS = {
  topbarEnabled: true,
  topbarText: '1000 TL VE ÜZERİ ALIŞVERIŞLERDE ÜCRETSİZ KARGO',
  topbarBgColor: '#000000',
  topbarTextColor: '#ffffff',
  maintenanceMode: false,
};

export async function GET() {
  try {
    const rows = await query<any[]>(
      'SELECT setting_key, setting_value FROM site_settings',
      []
    );
    const map: any = { ...DEFAULT_SETTINGS };
    for (const row of rows) {
      try {
        map[row.setting_key] = JSON.parse(row.setting_value);
      } catch {
        map[row.setting_key] = row.setting_value;
      }
    }
    return NextResponse.json({ settings: map });
  } catch {
    return NextResponse.json({ settings: DEFAULT_SETTINGS });
  }
}

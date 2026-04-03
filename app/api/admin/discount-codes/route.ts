import { NextRequest, NextResponse } from 'next/server';
import { query, execute } from '../../../lib/db';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

async function checkAdmin(): Promise<boolean> {
  try {
    const cookieStore = cookies();
    const sessionToken = cookieStore.get('admin_session')?.value;
    if (!sessionToken) return false;
    const rows = await query<any[]>(
      'SELECT s.user_id FROM admin_sessions s JOIN users u ON s.user_id = u.id WHERE s.session_token = ? AND s.expires_at > NOW()',
      [sessionToken]
    );
    return rows.length > 0;
  } catch {
    return false;
  }
}

async function ensureTable() {
  await execute(`
    CREATE TABLE IF NOT EXISTS discount_codes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      code VARCHAR(50) NOT NULL UNIQUE,
      type ENUM('amount','percent') NOT NULL DEFAULT 'amount',
      value DECIMAL(10,2) NOT NULL,
      min_amount DECIMAL(10,2) DEFAULT 0,
      max_uses INT DEFAULT NULL,
      used_count INT DEFAULT 0,
      is_active TINYINT(1) DEFAULT 1,
      brand VARCHAR(100) DEFAULT NULL,
      expires_at DATETIME DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      notes VARCHAR(255) DEFAULT NULL
    )
  `, []);
}

export async function GET() {
  const isAdmin = await checkAdmin();
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await ensureTable();
  const codes = await query<any[]>('SELECT * FROM discount_codes ORDER BY created_at DESC', []);
  return NextResponse.json({ codes });
}

export async function POST(request: NextRequest) {
  const isAdmin = await checkAdmin();
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await ensureTable();
  const body = await request.json();
  const { code, type, value, minAmount, maxUses, expiresAt, notes } = body;
  if (!code || !type || value === undefined) {
    return NextResponse.json({ error: 'Kod, tip ve değer zorunlu' }, { status: 400 });
  }
  try {
    const { brand } = body;
  await execute(
      'INSERT INTO discount_codes (code, type, value, min_amount, max_uses, brand, expires_at, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [code.toUpperCase().trim(), type, value, minAmount || 0, maxUses || null, brand || null, expiresAt || null, notes || null]
    );
    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'Bu kod zaten mevcut' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Kod eklenemedi' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const isAdmin = await checkAdmin();
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json();
  const { id, isActive } = body;
  await execute('UPDATE discount_codes SET is_active = ? WHERE id = ?', [isActive ? 1 : 0, id]);
  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const isAdmin = await checkAdmin();
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID gerekli' }, { status: 400 });
  await execute('DELETE FROM discount_codes WHERE id = ?', [id]);
  return NextResponse.json({ success: true });
}

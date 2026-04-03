import { NextRequest, NextResponse } from 'next/server';
import { query, execute, queryOne } from '../../../lib/db';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

async function getAdminUser(): Promise<{ isAdmin: boolean; userId?: number; email?: string }> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('admin_session')?.value;
    if (!sessionToken) return { isAdmin: false };
    const session = await queryOne<any>(
      `SELECT s.user_id, u.email FROM admin_sessions s
       JOIN admin_users u ON s.user_id = u.id
       WHERE s.session_token = ? AND s.expires_at > NOW()`,
      [sessionToken]
    );
    if (session) return { isAdmin: true, userId: session.user_id, email: session.email };
    return { isAdmin: false };
  } catch {
    return { isAdmin: false };
  }
}

// GET - Fetch activity logs (admin@merumy.com only)
export async function GET(request: NextRequest) {
  try {
    const { isAdmin, email } = await getAdminUser();
    if (!isAdmin) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    if (email !== 'admin@merumy.com') {
      return NextResponse.json({ error: 'Bu özellik sadece admin kullanıcısına özeldir' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '25'), 500);
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);
    const offset = (page - 1) * limit;
    const userEmail = searchParams.get('userEmail') || '';
    const dateFrom = searchParams.get('dateFrom') || '';
    const dateTo = searchParams.get('dateTo') || '';

    // Build WHERE clause
    const conditions: string[] = [];
    const queryParams: any[] = [];

    if (userEmail) {
      conditions.push('user_email LIKE ?');
      queryParams.push(`%${userEmail}%`);
    }
    if (dateFrom) {
      conditions.push('created_at >= ?');
      queryParams.push(`${dateFrom} 00:00:00`);
    }
    if (dateTo) {
      conditions.push('created_at <= ?');
      queryParams.push(`${dateTo} 23:59:59`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const logs = await query<any[]>(
      `SELECT id, user_email, action, description, entity_type, entity_id, created_at
       FROM admin_activity_logs
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT ${limit} OFFSET ${offset}`,
      queryParams
    );

    const countResult = await query<any[]>(
      `SELECT COUNT(*) as total FROM admin_activity_logs ${whereClause}`,
      queryParams
    );
    const total = Number(countResult?.[0]?.total) || 0;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      logs: logs || [],
      pagination: { total, totalPages, page, limit },
    });
  } catch (error) {
    console.error('Activity GET error:', error);
    return NextResponse.json({ error: 'Loglar getirilemedi' }, { status: 500 });
  }
}

// POST - Log an activity
export async function POST(request: NextRequest) {
  try {
    const { isAdmin, userId, email } = await getAdminUser();
    if (!isAdmin || !userId || !email) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });

    const body = await request.json();
    const { action, description, entityType, entityId } = body;

    if (!action) return NextResponse.json({ error: 'Action gerekli' }, { status: 400 });

    await execute(
      `INSERT INTO admin_activity_logs (user_id, user_email, action, description, entity_type, entity_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, email, action, description || null, entityType || null, entityId || null]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Activity POST error:', error);
    return NextResponse.json({ error: 'Log kaydedilemedi' }, { status: 500 });
  }
}

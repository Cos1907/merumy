import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '../../../lib/db';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

const MAIL_MARKETING_ALLOWED = [
  'admin@merumy.com',
  'sena@merumy.com',
  'serap@merumy.com',
  'buse@merumy.com',
];

async function getAdminEmail(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('admin_session')?.value;
    if (!sessionToken) return null;
    const session = await queryOne<any>(
      `SELECT u.email FROM admin_sessions s
       JOIN admin_users u ON s.user_id = u.id
       WHERE s.session_token = ? AND s.expires_at > NOW()`,
      [sessionToken]
    );
    return session?.email || null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const adminEmail = await getAdminEmail();
    if (!adminEmail) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
    if (!MAIL_MARKETING_ALLOWED.includes(adminEmail)) {
      return NextResponse.json({ error: 'Bu özelliğe erişim yetkiniz yok' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all';
    const search = searchParams.get('search') || '';
    const dateFrom = searchParams.get('dateFrom') || '';
    const dateTo = searchParams.get('dateTo') || '';
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);
    const limit = Math.min(parseInt(searchParams.get('limit') || '500'), 2000);
    const offset = (page - 1) * limit;

    // Base query: users with order aggregates
    const conditions: string[] = [];
    const params: any[] = [];

    if (search) {
      conditions.push('(u.name LIKE ? OR u.email LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    if (dateFrom) {
      conditions.push('DATE(u.created_at) >= ?');
      params.push(dateFrom);
    }
    if (dateTo) {
      conditions.push('DATE(u.created_at) <= ?');
      params.push(dateTo);
    }

    // Filter-specific conditions
    switch (filter) {
      case 'with_orders':
        conditions.push('orderCount > 0');
        break;
      case 'no_orders':
        conditions.push('orderCount = 0');
        break;
      case 'multiple_orders':
        conditions.push('orderCount > 1');
        break;
      case 'high_value':
        conditions.push('totalSpent >= 1000');
        break;
      case 'recent_30':
        conditions.push('u.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)');
        break;
      case 'recent_90':
        conditions.push('u.created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)');
        break;
    }

    const whereClause = conditions.length > 0 ? `HAVING ${conditions.join(' AND ')}` : '';

    // We use HAVING because some conditions reference aggregates
    const baseQuery = `
      SELECT
        u.id,
        u.name,
        u.email,
        u.phone,
        u.created_at,
        COUNT(DISTINCT o.id)        AS orderCount,
        COALESCE(SUM(o.total), 0)   AS totalSpent,
        MAX(o.created_at)           AS lastOrderAt
      FROM users u
      LEFT JOIN orders o ON o.customer_email = u.email AND o.status != 'cancelled'
      GROUP BY u.id, u.name, u.email, u.phone, u.created_at
      ${whereClause}
      ORDER BY u.created_at DESC
    `;

    const allRows = await query<any[]>(baseQuery, params);
    const total = allRows?.length || 0;
    const users = (allRows || []).slice(offset, offset + limit);

    return NextResponse.json({
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Mail marketing error:', error);
    return NextResponse.json({ error: 'Kullanıcılar alınamadı' }, { status: 500 });
  }
}

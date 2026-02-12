import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '../../../lib/db';
import { cookies } from 'next/headers';

// Session check helper
async function checkAdminSession(): Promise<boolean> {
  try {
    const cookieStore = cookies();
    const sessionToken = cookieStore.get('admin_session')?.value;
    
    if (!sessionToken) return false;
    
    const session = await queryOne<any>(
      'SELECT * FROM admin_sessions WHERE session_token = ? AND expires_at > NOW()',
      [sessionToken]
    );
    
    return !!session;
  } catch {
    return false;
  }
}

// GET - Fetch all users with pagination
export async function GET(request: NextRequest) {
  try {
    const isAdmin = await checkAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    
    const offset = (page - 1) * limit;
    
    let whereConditions: string[] = [];
    let params: any[] = [];
    
    if (search) {
      whereConditions.push('(name LIKE ? OR email LIKE ? OR phone LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    if (role) {
      whereConditions.push('role = ?');
      params.push(role);
    }
    
    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';
    
    // Get total count
    const [countResult] = await query<any[]>(`SELECT COUNT(*) as total FROM users ${whereClause}`, params);
    const total = countResult?.total || 0;
    
    // Get users
    const usersQuery = `
      SELECT 
        id,
        uuid,
        email,
        name,
        phone,
        role,
        is_active as isActive,
        email_verified as emailVerified,
        created_at as createdAt,
        last_login as lastLogin,
        (SELECT COUNT(*) FROM orders WHERE customer_email = users.email) as orderCount,
        (SELECT COALESCE(SUM(total), 0) FROM orders WHERE customer_email = users.email AND status != 'cancelled') as totalSpent
      FROM users
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ${Number(limit)} OFFSET ${Number(offset)}
    `;
    
    const users = await query<any[]>(usersQuery, params);
    
    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Kullanıcılar getirilemedi' }, { status: 500 });
  }
}


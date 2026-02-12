import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute } from '../../../../lib/db';
import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'admin_session';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionToken) {
      return NextResponse.json({ isAuthenticated: false }, { status: 401 });
    }

    // Check session in database
    const session = await queryOne<any>(
      `SELECT s.*, u.email, u.name, u.role 
       FROM admin_sessions s
       JOIN users u ON s.user_id = u.id
       WHERE s.session_token = ? AND s.expires_at > NOW()`,
      [sessionToken]
    );

    if (!session) {
      // Clean up expired session
      await execute('DELETE FROM admin_sessions WHERE session_token = ?', [sessionToken]);
      return NextResponse.json({ isAuthenticated: false }, { status: 401 });
    }

    return NextResponse.json({
      isAuthenticated: true,
      user: {
        id: session.user_id,
        email: session.email,
        name: session.name,
        role: session.role
      }
    });
  } catch (error) {
    console.error('Admin auth check error:', error);
    return NextResponse.json({ isAuthenticated: false, error: 'Oturum kontrolü sırasında hata oluştu' }, { status: 500 });
  }
}

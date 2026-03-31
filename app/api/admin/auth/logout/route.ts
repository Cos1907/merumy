import { NextRequest, NextResponse } from 'next/server';
import { execute } from '../../../../lib/db';
import { serialize } from 'cookie';
import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'admin_session';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (sessionToken) {
      // Delete session from database
      await execute('DELETE FROM admin_sessions WHERE session_token = ?', [sessionToken]);
    }

    // Clear the session cookie
    const cookie = serialize(SESSION_COOKIE_NAME, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0, // Expire immediately
    });

    return NextResponse.json({ success: true }, {
      headers: {
        'Set-Cookie': cookie,
      },
    });
  } catch (error) {
    console.error('Admin logout error:', error);
    return NextResponse.json({ success: false, error: 'Çıkış sırasında hata oluştu' }, { status: 500 });
  }
}

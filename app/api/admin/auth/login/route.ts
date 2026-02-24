import { NextRequest, NextResponse } from 'next/server';
import { query, execute, queryOne } from '../../../../lib/db';
import { serialize } from 'cookie';
import crypto from 'crypto';

const SESSION_COOKIE_NAME = 'admin_session';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'E-posta ve şifre gerekli' }, { status: 400 });
    }

    // Find admin user
    const user = await queryOne<any>(
      'SELECT id, uuid, email, password_hash, name, role FROM users WHERE email = ? AND role = "admin"',
      [email]
    );

    if (!user) {
      return NextResponse.json({ error: 'Geçersiz kimlik bilgileri' }, { status: 401 });
    }

    // Check password (currently plain text comparison - in production should use bcrypt)
    if (user.password_hash !== password) {
      return NextResponse.json({ error: 'Geçersiz kimlik bilgileri' }, { status: 401 });
    }

    // Generate session token
    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Get IP address safely (handle long X-Forwarded-For headers)
    let ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    // X-Forwarded-For can contain multiple IPs, take the first one
    if (ipAddress.includes(',')) {
      ipAddress = ipAddress.split(',')[0].trim();
    }
    // Truncate to 250 chars max to prevent database errors
    ipAddress = ipAddress.substring(0, 250);

    // Store session in database
    await execute(
      `INSERT INTO admin_sessions (session_token, user_id, ip_address, expires_at)
       VALUES (?, ?, ?, ?)`,
      [
        sessionToken,
        user.id,
        ipAddress,
        expiresAt
      ]
    );

    // Update last login
    await execute('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

    // Set session cookie
    const cookie = serialize(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60, // 24 hours
    });

    return NextResponse.json(
      { 
        success: true, 
        user: {
          id: user.uuid,
          email: user.email,
          name: user.name,
          role: user.role
        }
      },
      {
        headers: {
          'Set-Cookie': cookie,
        },
      }
    );
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json({ error: 'Giriş sırasında bir hata oluştu' }, { status: 500 });
  }
}

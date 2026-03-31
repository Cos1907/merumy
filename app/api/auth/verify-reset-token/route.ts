import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '../../../lib/db';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ valid: false }, { status: 400 });
    }

    // Hash the token to compare
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Check if token exists and is not expired
    const resetToken = await queryOne<any>(
      'SELECT id FROM password_reset_tokens WHERE token = ? AND expires_at > NOW()',
      [hashedToken]
    );

    if (!resetToken) {
      return NextResponse.json({ valid: false }, { status: 400 });
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error('Verify reset token error:', error);
    return NextResponse.json({ valid: false }, { status: 500 });
  }
}





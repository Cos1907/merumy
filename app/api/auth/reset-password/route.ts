import { NextRequest, NextResponse } from 'next/server';
import { query, execute, queryOne } from '../../../lib/db';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json({ error: 'Token ve şifre gerekli' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Şifre en az 6 karakter olmalıdır' }, { status: 400 });
    }

    // Hash the token to compare
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find valid reset token
    const resetToken = await queryOne<any>(
      'SELECT id, user_id FROM password_reset_tokens WHERE token = ? AND expires_at > NOW()',
      [hashedToken]
    );

    if (!resetToken) {
      return NextResponse.json({ error: 'Geçersiz veya süresi dolmuş bağlantı' }, { status: 400 });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password
    await execute(
      'UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?',
      [hashedPassword, resetToken.user_id]
    );

    // Delete the used reset token
    await execute('DELETE FROM password_reset_tokens WHERE id = ?', [resetToken.id]);

    // Delete all other reset tokens for this user (security)
    await execute('DELETE FROM password_reset_tokens WHERE user_id = ?', [resetToken.user_id]);

    return NextResponse.json({ 
      success: true, 
      message: 'Şifreniz başarıyla güncellendi' 
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Bir hata oluştu, lütfen tekrar deneyin' }, { status: 500 });
  }
}


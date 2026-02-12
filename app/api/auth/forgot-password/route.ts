import { NextRequest, NextResponse } from 'next/server';
import { query, execute, queryOne } from '../../../lib/db';
import { sendPasswordResetEmail } from '../../../lib/mail';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'E-posta adresi gerekli' }, { status: 400 });
    }

    // Find user by email
    const user = await queryOne<any>(
      'SELECT id, email, name FROM users WHERE email = ?',
      [email.toLowerCase()]
    );

    // Always return success even if user not found (security best practice)
    if (!user) {
      return NextResponse.json({ 
        success: true, 
        message: 'Eğer bu e-posta kayıtlıysa, şifre sıfırlama bağlantısı gönderilecektir.' 
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Delete any existing reset tokens for this user
    await execute('DELETE FROM password_reset_tokens WHERE user_id = ?', [user.id]);

    // Create password_reset_tokens table if not exists
    await execute(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        token VARCHAR(255) NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Save new reset token
    await execute(
      'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [user.id, hashedToken, expiresAt]
    );

    // Get first name from full name
    const firstName = user.name?.split(' ')[0] || 'Değerli Müşterimiz';

    // Send reset email
    await sendPasswordResetEmail(user.email, firstName, resetToken);

    return NextResponse.json({ 
      success: true, 
      message: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.' 
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Bir hata oluştu, lütfen tekrar deneyin' }, { status: 500 });
  }
}


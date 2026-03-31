import { NextRequest, NextResponse } from 'next/server';
import { execute, queryOne } from '../../../lib/db';
import { hashPassword } from '../../../lib/auth/password';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');

// JSON dosyasındaki kullanıcının şifresini güncelle (JSON-based auth için)
async function updatePasswordInJson(email: string, newPassword: string): Promise<void> {
  try {
    const raw = await fs.readFile(USERS_FILE, 'utf-8');
    const db = JSON.parse(raw);
    const users = db.users || [];
    const userIndex = users.findIndex((u: any) => u.email?.toLowerCase() === email.toLowerCase());

    if (userIndex !== -1) {
      users[userIndex].password = hashPassword(newPassword);
      await fs.writeFile(USERS_FILE, JSON.stringify(db, null, 2), 'utf-8');
      console.log('JSON şifresi güncellendi:', email);
    }
  } catch (error) {
    console.error('JSON şifresi güncellenirken hata:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json({ error: 'Token ve şifre gerekli' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Şifre en az 6 karakter olmalıdır' }, { status: 400 });
    }

    // Token'ı hash'le ve veritabanında ara
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Geçerli reset token'ı bul
    const resetToken = await queryOne<any>(
      'SELECT id, user_id FROM password_reset_tokens WHERE token = ? AND expires_at > NOW()',
      [hashedToken]
    );

    if (!resetToken) {
      return NextResponse.json({ error: 'Geçersiz veya süresi dolmuş bağlantı' }, { status: 400 });
    }

    // Kullanıcının email adresini al (JSON güncelleme için)
    const userRecord = await queryOne<any>(
      'SELECT email FROM users WHERE id = ?',
      [resetToken.user_id]
    );

    // Yeni şifreyi SHA256 ile hashle (authenticateUser ile uyumlu)
    const sha256Password = crypto.createHash('sha256').update(password).digest('hex');

    // MySQL'deki şifreyi güncelle
    await execute(
      'UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?',
      [sha256Password, resetToken.user_id]
    );

    // JSON dosyasındaki şifreyi de güncelle (JSON-based auth için)
    if (userRecord?.email) {
      await updatePasswordInJson(userRecord.email, password);
    }

    // Kullanılan reset token'ı sil
    await execute('DELETE FROM password_reset_tokens WHERE id = ?', [resetToken.id]);

    // Bu kullanıcıya ait diğer reset token'ları da sil (güvenlik)
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

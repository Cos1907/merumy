import { NextRequest, NextResponse } from 'next/server';
import { query, execute, queryOne } from '../../../lib/db';
import { sendPasswordResetEmail } from '../../../lib/mail';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// JSON'dan kullanıcı ara
function findUserInJson(email: string): { id: string; email: string; firstName: string; lastName: string } | null {
  try {
    const usersPath = path.join(process.cwd(), 'data', 'users.json');
    if (!fs.existsSync(usersPath)) return null;
    
    const data = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
    const users = data.users || [];
    const user = users.find((u: any) => u.email?.toLowerCase() === email.toLowerCase());
    
    if (user) {
      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || ''
      };
    }
    return null;
  } catch (error) {
    console.error('Error reading users.json:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'E-posta adresi gerekli' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    let user: { id: string | number; email: string; name?: string; firstName?: string; lastName?: string } | null = null;
    let userId: number | null = null;
    let firstName = 'Değerli Müşterimiz';

    // 1. MySQL'den ara
    try {
      const mysqlUser = await queryOne<any>(
        'SELECT id, email, name FROM users WHERE email = ?',
        [normalizedEmail]
      );
      
      if (mysqlUser) {
        user = mysqlUser;
        userId = mysqlUser.id;
        firstName = mysqlUser.name?.split(' ')[0] || 'Değerli Müşterimiz';
      }
    } catch (dbError) {
      console.error('MySQL query error:', dbError);
    }

    // 2. MySQL'de yoksa JSON'dan ara
    if (!user) {
      const jsonUser = findUserInJson(normalizedEmail);
      if (jsonUser) {
        user = jsonUser;
        firstName = jsonUser.firstName || 'Değerli Müşterimiz';
        
        // JSON kullanıcısını MySQL'e ekle (eğer yoksa)
        try {
          const result = await execute(
            `INSERT IGNORE INTO users (uuid, email, name, created_at) VALUES (?, ?, ?, NOW())`,
            [jsonUser.id, jsonUser.email, `${jsonUser.firstName} ${jsonUser.lastName}`]
          );
          
          if (result.insertId) {
            userId = result.insertId;
          } else {
            // Zaten varsa ID'yi al
            const existing = await queryOne<any>('SELECT id FROM users WHERE email = ?', [normalizedEmail]);
            userId = existing?.id || null;
          }
        } catch (insertError) {
          console.error('Error syncing user to MySQL:', insertError);
        }
      }
    }

    // Kullanıcı bulunamadıysa hata döndür
    if (!user) {
      return NextResponse.json({ 
        error: 'Bu e-posta adresi ile kayıtlı bir üye bulunamadı.',
        notFound: true
      }, { status: 404 });
    }

    // userId yoksa işlem yapamayız
    if (!userId) {
      console.error('User found but no MySQL ID available');
      return NextResponse.json({ 
        error: 'Bir hata oluştu, lütfen tekrar deneyin'
      }, { status: 500 });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Delete any existing reset tokens for this user
    await execute('DELETE FROM password_reset_tokens WHERE user_id = ?', [userId]);

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
      [userId, hashedToken, expiresAt]
    );

    // Send reset email
    try {
      await sendPasswordResetEmail(user.email, firstName, resetToken);
      console.log('Password reset email sent to:', user.email);
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      return NextResponse.json({ 
        error: 'E-posta gönderilemedi, lütfen tekrar deneyin'
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.' 
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Bir hata oluştu, lütfen tekrar deneyin' }, { status: 500 });
  }
}

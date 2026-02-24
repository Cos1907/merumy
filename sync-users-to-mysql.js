const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'merumy'
};

async function main() {
  console.log('JSON kullanıcılarını MySQL\'e senkronize ediliyor...\n');
  
  const connection = await mysql.createConnection(dbConfig);
  
  // JSON dosyasını oku
  const usersPath = path.join(__dirname, 'data', 'users.json');
  if (!fs.existsSync(usersPath)) {
    console.log('users.json bulunamadı');
    await connection.end();
    return;
  }
  
  const data = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
  const users = data.users || [];
  
  console.log(`Toplam ${users.length} kullanıcı bulundu\n`);
  
  let synced = 0;
  let skipped = 0;
  let errors = 0;
  
  for (const user of users) {
    try {
      // MySQL'de var mı kontrol et
      const [existing] = await connection.execute(
        'SELECT id FROM users WHERE email = ? OR uuid = ?',
        [user.email?.toLowerCase(), user.id]
      );
      
      if (existing.length > 0) {
        console.log(`[SKIP] ${user.email} zaten MySQL'de var`);
        skipped++;
        continue;
      }
      
      // Şifre hash'ini oluştur (varsa orijinal şifreyi kullan, yoksa random)
      let passwordHash = '';
      if (user.password?.hash) {
        // Argon2 hash'i varsa, yeni bir SHA256 hash oluştur (geçici çözüm)
        // Not: Kullanıcının şifresini bilmediğimiz için bu sadece kaydı oluşturur
        // Kullanıcı şifre sıfırlama yapmalı
        passwordHash = crypto.createHash('sha256').update(crypto.randomBytes(16).toString('hex')).digest('hex');
      } else if (user.passwordHash) {
        passwordHash = user.passwordHash;
      } else {
        passwordHash = crypto.createHash('sha256').update(crypto.randomBytes(16).toString('hex')).digest('hex');
      }
      
      const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
      
      await connection.execute(
        `INSERT INTO users (uuid, email, name, phone, password_hash, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          user.id,
          user.email?.toLowerCase(),
          fullName,
          user.phone || null,
          passwordHash,
          user.createdAt || new Date().toISOString()
        ]
      );
      
      console.log(`[SYNC] ${user.email} - ${fullName}`);
      synced++;
    } catch (error) {
      console.log(`[ERROR] ${user.email}: ${error.message}`);
      errors++;
    }
  }
  
  console.log(`\n=== SONUÇ ===`);
  console.log(`Senkronize: ${synced}`);
  console.log(`Atlanan: ${skipped}`);
  console.log(`Hata: ${errors}`);
  
  // MySQL'deki toplam kullanıcı sayısını göster
  const [countResult] = await connection.execute('SELECT COUNT(*) as total FROM users');
  console.log(`\nMySQL\'deki toplam kullanıcı: ${countResult[0].total}`);
  
  await connection.end();
}

main().catch(console.error);






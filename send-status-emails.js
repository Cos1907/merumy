const mysql = require('mysql2/promise');
const nodemailer = require('nodemailer');

// SMTP Configuration
const transporter = nodemailer.createTransport({
  host: 'cpsrv1.ugurlubilisim.com',
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: 'no-reply@merumy.com.tr',
    pass: 'tahribat1907'
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Database Configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  database: 'merumy',
  socketPath: '/var/run/mysqld/mysqld.sock'
};

// Status labels - Özel eşleştirmeler
// processing -> hazırlanıyor olarak gösterilecek
// shipped -> kargoya teslim edildi olarak gösterilecek
const STATUS_LABELS = {
  pending: { label: 'Beklemede', emoji: '⏳', color: '#f59e0b' },
  processing: { label: 'Hazırlanıyor', emoji: '📦', color: '#f97316' },  // İşleniyor -> Hazırlanıyor
  confirmed: { label: 'Onaylandı', emoji: '✅', color: '#6366f1' },
  preparing: { label: 'Hazırlanıyor', emoji: '📦', color: '#f97316' },
  shipped: { label: 'Kargoya Teslim Edildi', emoji: '🚚', color: '#8b5cf6' },  // Kargoda -> Kargoya Teslim Edildi
  delivered: { label: 'Teslim Edildi', emoji: '✨', color: '#10b981' },
  cancelled: { label: 'İptal Edildi', emoji: '❌', color: '#ef4444' }
};

function getStatusMessage(status) {
  switch (status) {
    case 'pending': return 'Siparişiniz sistemimize alındı ve değerlendirilmeyi bekliyor.';
    case 'processing': return 'Siparişiniz hazırlanıyor! En kısa sürede kargoya verilecektir.';  // Hazırlanıyor mesajı
    case 'confirmed': return 'Siparişiniz onaylandı ve hazırlık aşamasına geçti.';
    case 'preparing': return 'Siparişiniz şu anda hazırlanıyor.';
    case 'shipped': return 'Siparişiniz kargoya teslim edildi! 🎉 Kargonuz en kısa sürede size ulaşacak.';  // Kargoya teslim edildi
    case 'delivered': return 'Siparişiniz teslim edildi! Alışverişiniz için teşekkür ederiz.';
    case 'cancelled': return 'Siparişiniz iptal edilmiştir.';
    default: return 'Siparişinizin durumu güncellendi.';
  }
}

async function sendStatusEmail(order) {
  const status = STATUS_LABELS[order.status] || { label: order.status, emoji: '📋', color: '#666' };
  const statusMessage = getStatusMessage(order.status);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding: 20px 0; background: linear-gradient(135deg, #92D0AA 0%, #7BC496 100%); border-radius: 12px 12px 0 0; }
        .content { padding: 30px; background: #fff; border: 1px solid #e0e0e0; }
        .footer { text-align: center; padding: 20px; background: #f9f9f9; border-radius: 0 0 12px 12px; font-size: 12px; color: #666; }
        .status-badge { display: inline-block; padding: 10px 25px; border-radius: 50px; font-weight: bold; font-size: 16px; }
        .btn { display: inline-block; padding: 14px 30px; background: #92D0AA; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="color: white;">MERUMY</h1>
        </div>
        <div class="content">
          <div style="text-align: center; margin-bottom: 25px;">
            <div style="font-size: 50px; margin-bottom: 10px;">${status.emoji}</div>
            <span class="status-badge" style="background: ${status.color}; color: white;">
              ${status.label}
            </span>
          </div>
          
          <p>Merhaba ${order.customer_name || 'Değerli Müşterimiz'},</p>
          <p>${statusMessage}</p>
          
          <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Sipariş No:</strong> #${(order.order_id || '').slice(-8).toUpperCase()}</p>
            <p style="margin: 10px 0 0 0;"><strong>Sipariş Tarihi:</strong> ${new Date(order.created_at).toLocaleDateString('tr-TR')}</p>
            ${order.total ? `<p style="margin: 10px 0 0 0;"><strong>Toplam:</strong> ₺${Number(order.total).toFixed(2)}</p>` : ''}
          </div>
          
          <p style="text-align: center; margin: 30px 0;">
            <a href="https://merumy.com" class="btn">Sipariş Takibi</a>
          </p>
          
          <p>Sorularınız için bizimle iletişime geçebilirsiniz.</p>
          <p>Sevgilerle,<br><strong>Merumy Ekibi</strong></p>
        </div>
        <div class="footer">
          <p>© 2026 Merumy. Tüm hakları saklıdır.</p>
          <p>Bu e-posta ${order.customer_email} adresine gönderilmiştir.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const result = await transporter.sendMail({
      from: 'Merumy <no-reply@merumy.com.tr>',
      to: order.customer_email,
      subject: `${status.emoji} Sipariş Durumu: ${status.label} - #${(order.order_id || '').slice(-8).toUpperCase()}`,
      html
    });
    console.log(`✅ ${order.order_id.slice(-8)} -> ${order.customer_email} (${status.label})`);
    return true;
  } catch (error) {
    console.error(`❌ ${order.order_id.slice(-8)} -> ${order.customer_email}: ${error.message}`);
    return false;
  }
}

async function main() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Veritabanına bağlandı.\n');

    // Tüm aktif siparişleri al (iptal edilmemiş ve teslim edilmemiş olanlar hariç)
    const [orders] = await connection.execute(`
      SELECT id, order_id, customer_name, customer_email, status, total, created_at
      FROM orders 
      WHERE customer_email IS NOT NULL 
        AND customer_email != ''
        AND status NOT IN ('cancelled', 'delivered')
      ORDER BY created_at DESC
    `);

    console.log(`Toplam ${orders.length} aktif sipariş bulundu.\n`);

    // Durum bazlı grupla
    const byStatus = {};
    for (const order of orders) {
      if (!byStatus[order.status]) byStatus[order.status] = [];
      byStatus[order.status].push(order);
    }

    console.log('Sipariş Durumları (Gönderilecek):');
    for (const [status, list] of Object.entries(byStatus)) {
      const label = STATUS_LABELS[status]?.label || status;
      console.log(`  ${label}: ${list.length} sipariş`);
    }

    console.log('\n==========================================');
    console.log('HATIRLATMA:');
    console.log('- processing (İşleniyor) -> "Hazırlanıyor" olarak gidecek');
    console.log('- shipped (Kargoda) -> "Kargoya Teslim Edildi" olarak gidecek');
    console.log('- cancelled ve delivered siparişlere mail GİTMEYECEK');
    console.log('==========================================\n');

    let successCount = 0;
    let failCount = 0;

    console.log('Mail gönderimi başlıyor...\n');

    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];
      process.stdout.write(`[${i + 1}/${orders.length}] `);
      
      const success = await sendStatusEmail(order);
      if (success) successCount++;
      else failCount++;
      
      // Rate limiting - 500ms bekle
      await new Promise(r => setTimeout(r, 500));
    }

    console.log('\n===================================');
    console.log(`Gönderim tamamlandı!`);
    console.log(`Başarılı: ${successCount}`);
    console.log(`Başarısız: ${failCount}`);
    console.log('===================================');

  } catch (error) {
    console.error('Hata:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
    process.exit(0);
  }
}

main();

const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const transporter = nodemailer.createTransport({
  host: 'cpsrv1.ugurlubilisim.com',
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: 'no-reply@merumy.com.tr',
    pass: 'tahribat1907'
  },
  connectionTimeout: 60000,
  greetingTimeout: 30000
});

const ordersPath = path.join(process.cwd(), 'orders-export.json');
const orders = JSON.parse(fs.readFileSync(ordersPath, 'utf-8'));

const csvHeader = 'Sipariş No,Dekont ID,Müşteri Adı,Email,Telefon,Ürünler,Ara Toplam,Kargo,Toplam,Adres,Durum,Tarih\n';
const csvRows = orders.map(order => {
  const items = (order.items || []).map(item => 
    `${item.name} x${item.quantity} (${item.price} TL)`
  ).join(' | ');
  return [
    order.orderId || order.id || '',
    order.dekontId || '',
    (order.customerName || '').replace(/,/g, ' '),
    order.customerEmail || '',
    order.customerPhone || '',
    items.replace(/,/g, ';'),
    order.subtotal || order.total || 0,
    order.shipping || 0,
    order.total || 0,
    (order.address || '').replace(/,/g, ' ').replace(/\n/g, ' '),
    order.status || 'processing',
    order.createdAt || ''
  ].join(',');
}).join('\n');

const csvContent = csvHeader + csvRows;

transporter.sendMail({
  from: 'Merumy <no-reply@merumy.com.tr>',
  to: 'huseyinkulekci0@gmail.com',
  subject: `Merumy Sipariş Raporu - ${new Date().toLocaleDateString('tr-TR')} (${orders.length} sipariş)`,
  html: `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>📊 Merumy Sipariş Raporu</h2>
      <p>Merhaba,</p>
      <p>Sipariş raporunuz ektedir.</p>
      <table style="border-collapse: collapse; margin: 15px 0;">
        <tr>
          <th style="padding: 10px; border: 1px solid #ddd; background: #92D0AA; color: white;">Toplam Sipariş</th>
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>${orders.length}</strong></td>
        </tr>
        <tr>
          <th style="padding: 10px; border: 1px solid #ddd; background: #92D0AA; color: white;">Toplam Gelir</th>
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>₺${orders.reduce((sum, o) => sum + (o.total || 0), 0).toLocaleString('tr-TR')}</strong></td>
        </tr>
      </table>
      <p>Detaylı sipariş listesi ekte CSV formatında bulunmaktadır.</p>
      <p>Sevgilerle,<br><strong>Merumy Sistem</strong></p>
    </div>
  `,
  attachments: [{
    filename: `merumy-siparisler-${new Date().toISOString().split('T')[0]}.csv`,
    content: '\uFEFF' + csvContent,
    contentType: 'text/csv; charset=utf-8'
  }]
}).then(() => {
  console.log('✅ Mail başarıyla gönderildi: huseyinkulekci0@gmail.com');
  process.exit(0);
}).catch(err => {
  console.error('❌ Mail hatası:', err);
  process.exit(1);
});


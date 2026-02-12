import nodemailer from 'nodemailer'

// SMTP Configuration - merumy.com.tr mail server
const transporter = nodemailer.createTransport({
  host: 'cpsrv1.ugurlubilisim.com',
  port: 465,
  secure: true, // SSL
  auth: {
    user: 'no-reply@merumy.com.tr',
    pass: 'tahribat1907'
  }
})

const FROM_EMAIL = 'Merumy <no-reply@merumy.com.tr>'

// Test sipariş verisi
const testOrder = {
  orderId: 'TEST-' + Date.now(),
  dekontId: 'DEKONT-TEST-123',
  customerName: 'Test Kullanıcı',
  customerEmail: 'huseyinkulekci0@gmail.com',
  customerPhone: '05551234567',
  items: [
    { name: 'Medicube AGE-R Booster Pro Black', quantity: 1, price: 16499 },
    { name: 'Celimax Jojoba Cleansing Oil', quantity: 2, price: 900 }
  ],
  subtotal: 18299,
  shipping: 0,
  total: 18299,
  address: 'Test Mahallesi, Test Caddesi No: 123 Daire: 4, Kadıköy/İstanbul'
}

async function sendTestEmails() {
  console.log('Mail testi başlıyor...\n')

  // 1. Müşteriye sipariş onay maili
  try {
    const itemsHtml = testOrder.items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₺${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('')

    await transporter.sendMail({
      from: FROM_EMAIL,
      to: 'huseyinkulekci0@gmail.com',
      subject: `[TEST] Siparişiniz Alındı! #${testOrder.orderId} ✅`,
      html: `
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
            .order-box { background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .success-icon { font-size: 48px; color: #4CAF50; }
            table { width: 100%; border-collapse: collapse; }
            th { background: #92D0AA; color: white; padding: 12px; text-align: left; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="color: white;">MERUMY</h1>
            </div>
            <div class="content">
              <p style="background: #ffeb3b; padding: 10px; text-align: center; font-weight: bold;">⚠️ BU BİR TEST MAİLİDİR ⚠️</p>
              <div style="text-align: center; margin-bottom: 20px;">
                <div class="success-icon">✅</div>
                <h2 style="color: #4CAF50;">Ödeme Başarılı!</h2>
              </div>
              
              <p>Merhaba ${testOrder.customerName},</p>
              <p>Siparişiniz başarıyla alındı. Teşekkür ederiz!</p>
              
              <div class="order-box">
                <p><strong>Sipariş No:</strong> ${testOrder.orderId}</p>
                <p><strong>Dekont ID:</strong> ${testOrder.dekontId}</p>
              </div>
              
              <h3>Sipariş Detayı</h3>
              <table>
                <thead>
                  <tr>
                    <th>Ürün</th>
                    <th style="text-align: center;">Adet</th>
                    <th style="text-align: right;">Fiyat</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
              
              <div style="margin-top: 20px; text-align: right;">
                <p>Ara Toplam: <strong>₺${testOrder.subtotal.toFixed(2)}</strong></p>
                <p>Kargo: <strong>Ücretsiz</strong></p>
                <p style="font-size: 18px; color: #92D0AA;">Toplam: <strong>₺${testOrder.total.toFixed(2)}</strong></p>
              </div>
              
              <div class="order-box">
                <h4>Teslimat Adresi</h4>
                <p>${testOrder.address}</p>
              </div>
              
              <p>Tahmini teslimat süresi: <strong>5-7 iş günü</strong></p>
              
              <p>Sevgilerle,<br><strong>Merumy Ekibi</strong></p>
            </div>
            <div class="footer">
              <p>© 2026 Merumy. Tüm hakları saklıdır.</p>
            </div>
          </div>
        </body>
        </html>
      `
    })
    console.log('✅ Test sipariş maili gönderildi: huseyinkulekci0@gmail.com')
  } catch (error) {
    console.error('❌ Sipariş maili gönderilemedi:', error)
  }

  // 2. Admin'e sipariş bildirimi (info@merumy.com ve huseyinkulekci0@gmail.com)
  try {
    const itemsHtml = testOrder.items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₺${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('')

    await transporter.sendMail({
      from: FROM_EMAIL,
      to: 'info@merumy.com, huseyinkulekci0@gmail.com',
      subject: `[TEST] 🛒 Yeni Sipariş! #${testOrder.orderId} - ₺${testOrder.total.toFixed(2)}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; padding: 20px 0; background: #333; border-radius: 12px 12px 0 0; }
            .content { padding: 30px; background: #fff; border: 1px solid #e0e0e0; }
            .footer { text-align: center; padding: 20px; background: #f9f9f9; border-radius: 0 0 12px 12px; font-size: 12px; color: #666; }
            .info-box { background: #e8f5e9; padding: 15px; border-radius: 8px; margin: 15px 0; }
            table { width: 100%; border-collapse: collapse; }
            th { background: #333; color: white; padding: 12px; text-align: left; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="color: white;">YENİ SİPARİŞ 🎉</h1>
            </div>
            <div class="content">
              <p style="background: #ffeb3b; padding: 10px; text-align: center; font-weight: bold;">⚠️ BU BİR TEST MAİLİDİR ⚠️</p>
              <div class="info-box">
                <h3 style="margin: 0 0 10px 0;">Sipariş Bilgileri</h3>
                <p><strong>Sipariş No:</strong> ${testOrder.orderId}</p>
                <p><strong>Dekont ID:</strong> ${testOrder.dekontId}</p>
                <p><strong>Tarih:</strong> ${new Date().toLocaleString('tr-TR')}</p>
              </div>
              
              <div class="info-box" style="background: #e3f2fd;">
                <h3 style="margin: 0 0 10px 0;">Müşteri Bilgileri</h3>
                <p><strong>Ad Soyad:</strong> ${testOrder.customerName}</p>
                <p><strong>E-posta:</strong> ${testOrder.customerEmail}</p>
                <p><strong>Telefon:</strong> ${testOrder.customerPhone}</p>
              </div>
              
              <h3>Sipariş Detayı</h3>
              <table>
                <thead>
                  <tr>
                    <th>Ürün</th>
                    <th style="text-align: center;">Adet</th>
                    <th style="text-align: right;">Fiyat</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
              
              <div style="margin-top: 20px; text-align: right; padding: 15px; background: #f5f5f5; border-radius: 8px;">
                <p>Ara Toplam: <strong>₺${testOrder.subtotal.toFixed(2)}</strong></p>
                <p>Kargo: <strong>Ücretsiz</strong></p>
                <p style="font-size: 20px; color: #4CAF50;">TOPLAM: <strong>₺${testOrder.total.toFixed(2)}</strong></p>
              </div>
              
              <div class="info-box" style="background: #fff3e0;">
                <h3 style="margin: 0 0 10px 0;">Teslimat Adresi</h3>
                <p>${testOrder.address}</p>
              </div>
            </div>
            <div class="footer">
              <p>Bu bildirim Merumy sipariş sistemi tarafından otomatik olarak gönderilmiştir.</p>
            </div>
          </div>
        </body>
        </html>
      `
    })
    console.log('✅ Admin sipariş bildirimi gönderildi: info@merumy.com, huseyinkulekci0@gmail.com')
  } catch (error) {
    console.error('❌ Admin bildirimi gönderilemedi:', error)
  }

  console.log('\n✅ Mail testi tamamlandı!')
}

sendTestEmails()


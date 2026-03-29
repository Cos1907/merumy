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
const ADMIN_EMAIL = 'info@merumy.com'

// Mail Templates
export async function sendWelcomeEmail(to: string, firstName: string) {
  try {
    await transporter.sendMail({
      from: FROM_EMAIL,
      to,
      subject: 'Merumy\'ye Hoş Geldiniz! 🎉',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; padding: 20px 0; background: linear-gradient(135deg, #92D0AA 0%, #7BC496 100%); border-radius: 12px 12px 0 0; }
            .header img { height: 50px; }
            .content { padding: 30px; background: #fff; border: 1px solid #e0e0e0; }
            .footer { text-align: center; padding: 20px; background: #f9f9f9; border-radius: 0 0 12px 12px; font-size: 12px; color: #666; }
            .btn { display: inline-block; padding: 14px 30px; background: #92D0AA; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; }
            h1 { color: #92D0AA; margin: 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="color: white;">MERUMY</h1>
            </div>
            <div class="content">
              <h2>Merhaba ${firstName}! 👋</h2>
              <p>Merumy ailesine hoş geldiniz! Üyeliğiniz başarıyla oluşturuldu.</p>
              <p>Artık Kore'nin en iyi kozmetik ürünlerine kolayca ulaşabilir, kampanyalardan ve indirimlerden ilk siz haberdar olabilirsiniz.</p>
              <p style="text-align: center; margin: 30px 0;">
                <a href="https://merumy.com/shop" class="btn">Alışverişe Başla</a>
              </p>
              <p>Herhangi bir sorunuz olursa bizimle iletişime geçmekten çekinmeyin.</p>
              <p>Sevgilerle,<br><strong>Merumy Ekibi</strong></p>
            </div>
            <div class="footer">
              <p>© 2026 Merumy. Tüm hakları saklıdır.</p>
              <p>Bu e-posta ${to} adresine gönderilmiştir.</p>
            </div>
          </div>
        </body>
        </html>
      `
    })
    console.log('Welcome email sent to:', to)
    return true
  } catch (error) {
    console.error('Failed to send welcome email:', error)
    return false
  }
}

export async function sendOrderSuccessEmail(
  to: string,
  orderData: {
    orderId: string
    dekontId?: string
    customerName: string
    items: Array<{ name: string; quantity: number; price: number }>
    subtotal: number
    shipping: number
    total: number
    address: string
  }
) {
  try {
    const itemsHtml = orderData.items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₺${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('')

    await transporter.sendMail({
      from: FROM_EMAIL,
      to,
      subject: `Siparişiniz Alındı! #${orderData.orderId} ✅`,
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
              <div style="text-align: center; margin-bottom: 20px;">
                <div class="success-icon">✅</div>
                <h2 style="color: #4CAF50;">Ödeme Başarılı!</h2>
              </div>
              
              <p>Merhaba ${orderData.customerName},</p>
              <p>Siparişiniz başarıyla alındı. Teşekkür ederiz!</p>
              
              <div class="order-box">
                <p><strong>Sipariş No:</strong> ${orderData.orderId}</p>
                ${orderData.dekontId ? `<p><strong>Dekont ID:</strong> ${orderData.dekontId}</p>` : ''}
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
                <p>Ara Toplam: <strong>₺${orderData.subtotal.toFixed(2)}</strong></p>
                <p>Kargo: <strong>${orderData.shipping === 0 ? 'Ücretsiz' : '₺' + orderData.shipping.toFixed(2)}</strong></p>
                <p style="font-size: 18px; color: #92D0AA;">Toplam: <strong>₺${orderData.total.toFixed(2)}</strong></p>
              </div>
              
              <div class="order-box">
                <h4>Teslimat Adresi</h4>
                <p>${orderData.address}</p>
              </div>
              
              <p>Siparişiniz hazırlandığında kargo takip bilgisi tarafınıza iletilecektir.</p>
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
    console.log('Order success email sent to:', to)
    return true
  } catch (error) {
    console.error('Failed to send order success email:', error)
    return false
  }
}

export async function sendOrderFailedEmail(to: string, customerName: string, errorMessage?: string) {
  try {
    await transporter.sendMail({
      from: FROM_EMAIL,
      to,
      subject: 'Ödeme İşlemi Başarısız ❌',
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
            .error-box { background: #fff3f3; padding: 20px; border-radius: 8px; border-left: 4px solid #e74c3c; margin: 20px 0; }
            .btn { display: inline-block; padding: 14px 30px; background: #92D0AA; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="color: white;">MERUMY</h1>
            </div>
            <div class="content">
              <div style="text-align: center; margin-bottom: 20px;">
                <div style="font-size: 48px;">❌</div>
                <h2 style="color: #e74c3c;">Ödeme Başarısız</h2>
              </div>
              
              <p>Merhaba ${customerName},</p>
              <p>Maalesef ödeme işleminiz tamamlanamadı.</p>
              
              ${errorMessage ? `
              <div class="error-box">
                <strong>Hata Detayı:</strong>
                <p>${errorMessage}</p>
              </div>
              ` : ''}
              
              <p><strong>Olası nedenler:</strong></p>
              <ul>
                <li>Kart bilgileri hatalı girilmiş olabilir</li>
                <li>Kart limitiniz yetersiz olabilir</li>
                <li>3D Secure doğrulaması başarısız olmuş olabilir</li>
                <li>Bankanız işlemi reddetmiş olabilir</li>
              </ul>
              
              <p>Sepetinizdeki ürünler hâlâ saklıdır. Dilediğiniz zaman tekrar deneyebilirsiniz.</p>
              
              <p style="text-align: center; margin: 30px 0;">
                <a href="https://merumy.com/checkout" class="btn">Tekrar Dene</a>
              </p>
              
              <p>Yardıma ihtiyacınız varsa bizimle iletişime geçebilirsiniz.</p>
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
    console.log('Order failed email sent to:', to)
    return true
  } catch (error) {
    console.error('Failed to send order failed email:', error)
    return false
  }
}

// Admin notification
export async function sendAdminOrderNotification(orderData: {
  orderId: string
  dekontId?: string
  customerName: string
  customerEmail: string
  customerPhone: string
  items: Array<{ name: string; quantity: number; price: number }>
  subtotal: number
  shipping: number
  total: number
  address: string
}) {
  try {
    const itemsHtml = orderData.items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₺${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('')

    await transporter.sendMail({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `🛒 Yeni Sipariş! #${orderData.orderId} - ₺${orderData.total.toFixed(2)}`,
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
              <div class="info-box">
                <h3 style="margin: 0 0 10px 0;">Sipariş Bilgileri</h3>
                <p><strong>Sipariş No:</strong> ${orderData.orderId}</p>
                ${orderData.dekontId ? `<p><strong>Dekont ID:</strong> ${orderData.dekontId}</p>` : ''}
                <p><strong>Tarih:</strong> ${new Date().toLocaleString('tr-TR')}</p>
              </div>
              
              <div class="info-box" style="background: #e3f2fd;">
                <h3 style="margin: 0 0 10px 0;">Müşteri Bilgileri</h3>
                <p><strong>Ad Soyad:</strong> ${orderData.customerName}</p>
                <p><strong>E-posta:</strong> ${orderData.customerEmail}</p>
                <p><strong>Telefon:</strong> ${orderData.customerPhone}</p>
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
                <p>Ara Toplam: <strong>₺${orderData.subtotal.toFixed(2)}</strong></p>
                <p>Kargo: <strong>${orderData.shipping === 0 ? 'Ücretsiz' : '₺' + orderData.shipping.toFixed(2)}</strong></p>
                <p style="font-size: 20px; color: #4CAF50;">TOPLAM: <strong>₺${orderData.total.toFixed(2)}</strong></p>
              </div>
              
              <div class="info-box" style="background: #fff3e0;">
                <h3 style="margin: 0 0 10px 0;">Teslimat Adresi</h3>
                <p>${orderData.address}</p>
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
    console.log('Admin notification sent for order:', orderData.orderId)
    return true
  } catch (error) {
    console.error('Failed to send admin notification:', error)
    return false
  }
}

export async function sendAdminNewUserNotification(userData: {
  firstName: string
  lastName: string
  email: string
  phone: string
}) {
  try {
    await transporter.sendMail({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `👤 Yeni Üye Kaydı - ${userData.firstName} ${userData.lastName}`,
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
            .info-box { background: #e8f5e9; padding: 20px; border-radius: 8px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="color: white;">YENİ ÜYE 👤</h1>
            </div>
            <div class="content">
              <div class="info-box">
                <h3 style="margin: 0 0 15px 0;">Üye Bilgileri</h3>
                <p><strong>Ad Soyad:</strong> ${userData.firstName} ${userData.lastName}</p>
                <p><strong>E-posta:</strong> ${userData.email}</p>
                <p><strong>Telefon:</strong> ${userData.phone}</p>
                <p><strong>Kayıt Tarihi:</strong> ${new Date().toLocaleString('tr-TR')}</p>
              </div>
            </div>
            <div class="footer">
              <p>Bu bildirim Merumy üyelik sistemi tarafından otomatik olarak gönderilmiştir.</p>
            </div>
          </div>
        </body>
        </html>
      `
    })
    console.log('Admin new user notification sent for:', userData.email)
    return true
  } catch (error) {
    console.error('Failed to send admin new user notification:', error)
    return false
  }
}


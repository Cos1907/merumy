import nodemailer from 'nodemailer'

// SMTP Configuration - TLS 587 port (STARTTLS)
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
  },
  connectionTimeout: 60000,
  greetingTimeout: 60000,
  socketTimeout: 60000,
  pool: true,
  maxConnections: 3,
  maxMessages: 10,
  rateDelta: 2000,
  rateLimit: 3
})

const FROM_EMAIL = 'Merumy <no-reply@merumy.com.tr>'
const ADMIN_EMAILS = ['info@merumy.com', 'huseyinkulekci0@gmail.com']

// Retry ile mail gönderme fonksiyonu
async function sendMailWithRetry(mailOptions: nodemailer.SendMailOptions, retries = 3, delay = 2000): Promise<boolean> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await transporter.sendMail(mailOptions)
      return true
    } catch (error: any) {
      console.error(`Mail gönderim hatası (deneme ${attempt}/${retries}):`, error.message)
      
      // 451 hatası veya geçici hata ise bekleyip tekrar dene
      if (attempt < retries && (error.message?.includes('451') || error.message?.includes('Temporary'))) {
        console.log(`${delay}ms bekleyip tekrar deneniyor...`)
        await new Promise(resolve => setTimeout(resolve, delay * attempt))
      } else if (attempt >= retries) {
        throw error
      }
    }
  }
  return false
}

// Sipariş durumu etiketleri
const STATUS_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  pending: { label: 'Beklemede', emoji: '⏳', color: '#f59e0b' },
  processing: { label: 'İşleniyor', emoji: '🔄', color: '#3b82f6' },
  confirmed: { label: 'Onaylandı', emoji: '✅', color: '#6366f1' },
  preparing: { label: 'Hazırlanıyor', emoji: '📦', color: '#f97316' },
  shipped: { label: 'Kargoda', emoji: '🚚', color: '#8b5cf6' },
  delivered: { label: 'Teslim Edildi', emoji: '✨', color: '#10b981' },
  cancelled: { label: 'İptal Edildi', emoji: '❌', color: '#ef4444' }
}

// Mail Templates
export async function sendWelcomeEmail(to: string, firstName: string) {
  try {
    const result = await sendMailWithRetry({
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
    if (result) {
      console.log('Welcome email sent to:', to)
    }
    return result
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
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₺${(Number(item.price) * Number(item.quantity)).toFixed(2)}</td>
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
                <p>Ara Toplam: <strong>₺${Number(orderData.subtotal).toFixed(2)}</strong></p>
                <p>Kargo: <strong>${Number(orderData.shipping) === 0 ? 'Ücretsiz' : '₺' + Number(orderData.shipping).toFixed(2)}</strong></p>
                <p style="font-size: 18px; color: #92D0AA;">Toplam: <strong>₺${Number(orderData.total).toFixed(2)}</strong></p>
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

// Sipariş durumu değişikliği maili
export async function sendOrderStatusUpdateEmail(
  to: string,
  orderData: {
    orderId: string
    customerName: string
    newStatus: string
    trackingNumber?: string
    items?: Array<{ name: string; quantity: number; price: number }>
    total?: number
  }
) {
  try {
    const status = STATUS_LABELS[orderData.newStatus] || { label: orderData.newStatus, emoji: '📋', color: '#666' }
    
    let trackingInfo = ''
    if (orderData.newStatus === 'shipped' && orderData.trackingNumber) {
      trackingInfo = `
        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 20px 0;">
          <h4 style="margin: 0 0 10px 0; color: #1e40af;">🚚 Kargo Takip Bilgisi</h4>
          <p style="margin: 0;"><strong>Takip No:</strong> ${orderData.trackingNumber}</p>
          <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">
            Kargonuzu takip etmek için <a href="https://merumy.com" style="color: #3b82f6;">merumy.com</a> adresini ziyaret edebilirsiniz.
          </p>
        </div>
      `
    }

    let itemsHtml = ''
    if (orderData.items && orderData.items.length > 0) {
      itemsHtml = `
        <h4>Sipariş İçeriği</h4>
        <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 15px 0;">
          ${orderData.items.map(item => `<p style="margin: 5px 0;">• ${item.name} x${item.quantity}</p>`).join('')}
          ${orderData.total ? `<p style="margin-top: 15px; font-weight: bold; color: #92D0AA;">Toplam: ₺${Number(orderData.total).toFixed(2)}</p>` : ''}
        </div>
      `
    }

    let statusMessage = ''
    switch (orderData.newStatus) {
      case 'confirmed':
        statusMessage = 'Siparişiniz onaylandı ve hazırlık aşamasına geçti.'
        break
      case 'preparing':
        statusMessage = 'Siparişiniz şu anda hazırlanıyor.'
        break
      case 'shipped':
        statusMessage = 'Siparişiniz kargoya verildi! Kargonuz en kısa sürede size ulaşacak.'
        break
      case 'delivered':
        statusMessage = 'Siparişiniz teslim edildi! Alışverişiniz için teşekkür ederiz.'
        break
      case 'cancelled':
        statusMessage = 'Siparişiniz iptal edilmiştir. Sorularınız için bizimle iletişime geçebilirsiniz.'
        break
      default:
        statusMessage = 'Siparişinizin durumu güncellendi.'
    }

    await transporter.sendMail({
      from: FROM_EMAIL,
      to,
      subject: `${status.emoji} Sipariş Durumu: ${status.label} - #${orderData.orderId?.slice(-8).toUpperCase()}`,
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
              
              <p>Merhaba ${orderData.customerName},</p>
              <p>${statusMessage}</p>
              
              <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0;"><strong>Sipariş No:</strong> #${orderData.orderId?.slice(-8).toUpperCase()}</p>
              </div>
              
              ${trackingInfo}
              ${itemsHtml}
              
              <p style="text-align: center; margin: 30px 0;">
                <a href="https://merumy.com" class="btn">Sipariş Takibi</a>
              </p>
              
              <p>Sorularınız için bizimle iletişime geçebilirsiniz.</p>
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
    console.log('Order status update email sent to:', to)
    return true
  } catch (error) {
    console.error('Failed to send order status update email:', error)
    return false
  }
}

// Şifre sıfırlama maili
export async function sendPasswordResetEmail(to: string, firstName: string, resetToken: string) {
  try {
    const resetLink = `https://merumy.com/reset-password?token=${resetToken}`
    
    await transporter.sendMail({
      from: FROM_EMAIL,
      to,
      subject: '🔐 Şifre Sıfırlama Talebi - Merumy',
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
            .btn { display: inline-block; padding: 16px 40px; background: #92D0AA; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; }
            .warning-box { background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="color: white;">MERUMY</h1>
            </div>
            <div class="content">
              <div style="text-align: center; margin-bottom: 25px;">
                <div style="font-size: 50px;">🔐</div>
                <h2 style="color: #333;">Şifre Sıfırlama</h2>
              </div>
              
              <p>Merhaba ${firstName},</p>
              <p>Hesabınız için bir şifre sıfırlama talebi aldık.</p>
              <p>Şifrenizi sıfırlamak için aşağıdaki butona tıklayın:</p>
              
              <p style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}" class="btn">Şifremi Sıfırla</a>
              </p>
              
              <div class="warning-box">
                <strong>⚠️ Önemli:</strong>
                <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                  <li>Bu bağlantı <strong>1 saat</strong> geçerlidir.</li>
                  <li>Eğer bu talebi siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.</li>
                  <li>Şifreniz değiştirilmeyecektir.</li>
                </ul>
              </div>
              
              <p style="font-size: 14px; color: #666;">
                Eğer buton çalışmazsa, aşağıdaki linki tarayıcınıza kopyalayın:<br>
                <a href="${resetLink}" style="color: #92D0AA; word-break: break-all;">${resetLink}</a>
              </p>
              
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
    console.log('Password reset email sent to:', to)
    return true
  } catch (error) {
    console.error('Failed to send password reset email:', error)
    return false
  }
}

// Admin notification - birden fazla adrese
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
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₺${(Number(item.price) * Number(item.quantity)).toFixed(2)}</td>
      </tr>
    `).join('')

    await transporter.sendMail({
      from: FROM_EMAIL,
      to: ADMIN_EMAILS.join(', '),
      subject: `🛒 Yeni Sipariş! #${orderData.orderId} - ₺${Number(orderData.total).toFixed(2)}`,
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
                <p>Ara Toplam: <strong>₺${Number(orderData.subtotal).toFixed(2)}</strong></p>
                <p>Kargo: <strong>${Number(orderData.shipping) === 0 ? 'Ücretsiz' : '₺' + Number(orderData.shipping).toFixed(2)}</strong></p>
                <p style="font-size: 20px; color: #4CAF50;">TOPLAM: <strong>₺${Number(orderData.total).toFixed(2)}</strong></p>
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
      to: ADMIN_EMAILS.join(', '),
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

// Hesap Bilgileri Güncelleme E-postası
export async function sendAccountUpdateEmail(to: string, firstName: string, options?: { passwordChanged?: boolean }) {
  try {
    const passwordNote = options?.passwordChanged 
      ? '<p style="color: #d97706; font-weight: bold;">⚠️ Şifreniz de değiştirildi. Eğer bu işlemi siz yapmadıysanız, lütfen hemen bizimle iletişime geçin.</p>'
      : ''
    
    await transporter.sendMail({
      from: FROM_EMAIL,
      to,
      subject: 'Hesap Bilgileriniz Güncellendi ✅',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; }
            .header { text-align: center; padding: 30px 20px; background: linear-gradient(135deg, #92D0AA 0%, #7BC496 100%); border-radius: 12px 12px 0 0; }
            .header h1 { color: white; margin: 0; font-size: 24px; }
            .content { background: #ffffff; padding: 30px; }
            .success-box { background: #dcfce7; border: 1px solid #86efac; padding: 20px; border-radius: 12px; margin: 20px 0; text-align: center; }
            .success-icon { font-size: 48px; margin-bottom: 10px; }
            .info-text { color: #166534; font-weight: 500; }
            .details { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .details p { margin: 8px 0; color: #4b5563; }
            .footer { text-align: center; padding: 20px; background: #f8f9fa; border-radius: 0 0 12px 12px; }
            .footer p { color: #6b7280; font-size: 12px; margin: 5px 0; }
            .button { display: inline-block; background: #92D0AA; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Hesap Bilgileriniz Güncellendi</h1>
            </div>
            <div class="content">
              <p>Merhaba <strong>${firstName}</strong>,</p>
              
              <div class="success-box">
                <div class="success-icon">✅</div>
                <p class="info-text">Hesap bilgileriniz başarıyla güncellendi!</p>
              </div>
              
              ${passwordNote}
              
              <div class="details">
                <p><strong>📅 İşlem Tarihi:</strong> ${new Date().toLocaleString('tr-TR', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</p>
                <p><strong>📧 E-posta:</strong> ${to}</p>
              </div>
              
              <p>Hesabınıza giriş yaparak güncel bilgilerinizi görüntüleyebilirsiniz.</p>
              
              <div style="text-align: center;">
                <a href="https://www.merumy.com/hesabim" class="button">Hesabıma Git</a>
              </div>
              
              <p style="color: #6b7280; font-size: 13px; margin-top: 25px;">
                Bu işlemi siz yapmadıysanız, lütfen hemen 
                <a href="mailto:info@merumy.com" style="color: #92D0AA;">info@merumy.com</a> 
                adresinden bizimle iletişime geçin.
              </p>
            </div>
            <div class="footer">
              <p><strong>Merumy</strong> - Kore Kozmetik</p>
              <p>www.merumy.com</p>
            </div>
          </div>
        </body>
        </html>
      `
    })
    console.log('Account update email sent to:', to)
    return true
  } catch (error) {
    console.error('Failed to send account update email:', error)
    return false
  }
}

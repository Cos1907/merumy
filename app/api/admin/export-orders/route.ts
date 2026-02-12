import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import fs from 'fs'
import path from 'path'

// SMTP Configuration
const transporter = nodemailer.createTransport({
  host: 'cpsrv1.ugurlubilisim.com',
  port: 465,
  secure: true,
  auth: {
    user: 'no-reply@merumy.com.tr',
    pass: 'tahribat1907'
  }
})

export async function GET(request: Request) {
  try {
    // Admin şifresi kontrolü (basit güvenlik)
    const { searchParams } = new URL(request.url)
    const adminKey = searchParams.get('key')
    
    if (adminKey !== 'merumy2026admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Orders dosyasını oku
    const ordersPath = path.join(process.cwd(), 'data', 'orders.json')
    let orders: any[] = []
    
    if (fs.existsSync(ordersPath)) {
      const data = fs.readFileSync(ordersPath, 'utf-8')
      orders = JSON.parse(data)
    }
    
    if (orders.length === 0) {
      return NextResponse.json({ 
        message: 'Henüz kayıtlı sipariş bulunmuyor.',
        orderCount: 0 
      })
    }
    
    // CSV oluştur
    const csvHeader = 'Sipariş No,Dekont ID,Müşteri Adı,Email,Telefon,Ürünler,Ara Toplam,Kargo,Toplam,Adres,Durum,Tarih\n'
    
    const csvRows = orders.map(order => {
      const items = (order.items || []).map((item: any) => 
        `${item.name} x${item.quantity} (${item.price} TL)`
      ).join(' | ')
      
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
      ].join(',')
    }).join('\n')
    
    const csvContent = csvHeader + csvRows
    
    // Admin'lere mail gönder
    const adminEmails = ['info@merumy.com', 'huseyinkulekci0@gmail.com']
    
    await transporter.sendMail({
      from: 'Merumy <no-reply@merumy.com.tr>',
      to: adminEmails.join(', '),
      subject: `Merumy Sipariş Raporu - ${new Date().toLocaleDateString('tr-TR')} (${orders.length} sipariş)`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #92D0AA; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { padding: 20px; background: #f9f9f9; }
            .footer { text-align: center; padding: 15px; font-size: 12px; color: #666; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            th, td { padding: 10px; border: 1px solid #ddd; text-align: left; }
            th { background: #92D0AA; color: white; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📊 Sipariş Raporu</h1>
            </div>
            <div class="content">
              <p>Merhaba,</p>
              <p>Merumy.com sipariş raporunuz ektedir.</p>
              
              <table>
                <tr>
                  <th>Toplam Sipariş</th>
                  <td><strong>${orders.length}</strong></td>
                </tr>
                <tr>
                  <th>Toplam Gelir</th>
                  <td><strong>₺${orders.reduce((sum: number, o: any) => sum + (o.total || 0), 0).toLocaleString('tr-TR')}</strong></td>
                </tr>
                <tr>
                  <th>Rapor Tarihi</th>
                  <td>${new Date().toLocaleString('tr-TR')}</td>
                </tr>
              </table>
              
              <p>Detaylı sipariş listesi ekte CSV formatında bulunmaktadır.</p>
              
              <p>Sevgilerle,<br><strong>Merumy Sistem</strong></p>
            </div>
            <div class="footer">
              <p>Bu mail otomatik olarak oluşturulmuştur.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      attachments: [
        {
          filename: `merumy-siparisler-${new Date().toISOString().split('T')[0]}.csv`,
          content: '\uFEFF' + csvContent, // BOM for Excel UTF-8
          contentType: 'text/csv; charset=utf-8'
        }
      ]
    })
    
    return NextResponse.json({ 
      message: `Sipariş raporu ${adminEmails.join(' ve ')} adreslerine gönderildi.`,
      orderCount: orders.length,
      totalRevenue: orders.reduce((sum: number, o: any) => sum + (o.total || 0), 0)
    })
    
  } catch (error: any) {
    console.error('Export orders error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}


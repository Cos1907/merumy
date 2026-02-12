import { NextRequest, NextResponse } from 'next/server'
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

const FROM_EMAIL = 'Merumy <no-reply@merumy.com.tr>'
const ADMIN_EMAIL = 'info@merumy.com'

// Newsletter aboneleri dosyası
const SUBSCRIBERS_PATH = path.join(process.cwd(), 'data', 'newsletter_subscribers.json')

function getSubscribers(): Array<{ email: string; subscribedAt: string }> {
  try {
    if (fs.existsSync(SUBSCRIBERS_PATH)) {
      return JSON.parse(fs.readFileSync(SUBSCRIBERS_PATH, 'utf-8'))
    }
  } catch (e) {
    console.error('Failed to read subscribers:', e)
  }
  return []
}

function saveSubscribers(subscribers: Array<{ email: string; subscribedAt: string }>) {
  try {
    const dir = path.dirname(SUBSCRIBERS_PATH)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(SUBSCRIBERS_PATH, JSON.stringify(subscribers, null, 2))
  } catch (e) {
    console.error('Failed to save subscribers:', e)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'E-posta adresi gereklidir' }, { status: 400 })
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Geçerli bir e-posta adresi giriniz' }, { status: 400 })
    }

    const subscribers = getSubscribers()
    
    // Zaten abone mi kontrol et
    const existingSubscriber = subscribers.find(s => s.email.toLowerCase() === email.toLowerCase())
    if (existingSubscriber) {
      return NextResponse.json({ message: 'Bu e-posta adresi zaten bültenimize kayıtlı', alreadySubscribed: true }, { status: 200 })
    }

    // Yeni abone ekle
    const newSubscriber = {
      email: email.toLowerCase(),
      subscribedAt: new Date().toISOString()
    }
    subscribers.push(newSubscriber)
    saveSubscribers(subscribers)

    // Admin'e bildirim gönder
    try {
      await transporter.sendMail({
        from: FROM_EMAIL,
        to: ADMIN_EMAIL,
        subject: `📬 Yeni Bülten Abonesi - ${email}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #92D0AA; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0;">Yeni Bülten Abonesi</h1>
            </div>
            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px;">
              <p><strong>E-posta:</strong> <a href="mailto:${email}">${email}</a></p>
              <p><strong>Tarih:</strong> ${new Date().toLocaleString('tr-TR')}</p>
              <p style="margin-top: 20px;"><strong>Toplam Abone Sayısı:</strong> ${subscribers.length}</p>
            </div>
          </div>
        `
      })
    } catch (emailError) {
      console.error('Failed to send admin notification:', emailError)
    }

    return NextResponse.json({ 
      message: 'Bültenimize başarıyla abone oldunuz!',
      success: true 
    }, { status: 200 })

  } catch (error) {
    console.error('Newsletter subscription error:', error)
    return NextResponse.json({ error: 'Bir hata oluştu, lütfen tekrar deneyin' }, { status: 500 })
  }
}

// GET - Abone listesini getir (admin için)
export async function GET() {
  try {
    const subscribers = getSubscribers()
    return NextResponse.json({ subscribers, count: subscribers.length })
  } catch (error) {
    console.error('Failed to get subscribers:', error)
    return NextResponse.json({ error: 'Failed to get subscribers' }, { status: 500 })
  }
}


/**
 * Ödeme Başlatma API Endpoint
 * nodejs-client-main/example_code/odeme.js örneği birebir kullanılmıştır
 * soap kütüphanesi kullanılarak implementasyon yapılmıştır
 */

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { 
  config,
  version,
  generateSiparisId,
  formatAmount,
  formatPhone,
  Odeme,
  extractUCDHTML,
  extractResult
} from '../../../lib/param'
import fs from 'fs'
import path from 'path'

// Pending orders dosya yolu
const PENDING_ORDERS_PATH = path.join(process.cwd(), 'data', 'pending_orders.json')

// Session'dan user ID al
function getUserIdFromSession(): string | null {
  try {
    const cookieStore = cookies()
    const sessionId = cookieStore.get('session_id')?.value
    if (!sessionId) return null
    
    const sessionsPath = path.join(process.cwd(), 'data', 'sessions.json')
    if (fs.existsSync(sessionsPath)) {
      const sessions = JSON.parse(fs.readFileSync(sessionsPath, 'utf-8'))
      const session = sessions[sessionId]
      if (session && session.userId) {
        return session.userId
      }
    }
  } catch (e) {
    console.error('Failed to get user from session:', e)
  }
  return null
}

// Pending order kaydet
function savePendingOrder(siparisId: string, orderData: any) {
  try {
    let orders: Record<string, any> = {}
    if (fs.existsSync(PENDING_ORDERS_PATH)) {
      orders = JSON.parse(fs.readFileSync(PENDING_ORDERS_PATH, 'utf-8'))
    }
    orders[siparisId] = { ...orderData, createdAt: new Date().toISOString() }
    fs.writeFileSync(PENDING_ORDERS_PATH, JSON.stringify(orders, null, 2))
  } catch (e) {
    console.error('Failed to save pending order:', e)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      cardHolder,      // KK_Sahibi
      cardNumber,      // KK_No
      expiryMonth,     // KK_SK_Ay (2 hane)
      expiryYear,      // KK_SK_Yil (2 hane)
      cvv,             // KK_CVC
      phone,           // KK_Sahibi_GSM
      totalAmount,     // Toplam tutar (sayı)
      installment = 1, // Taksit
      // Müşteri ve sipariş bilgileri (mail için)
      customerName,
      customerEmail,
      customerPhone,
      address,
      items,
      subtotal,
      shipping,
    } = body

    // Validasyonlar
    if (!cardHolder || !cardNumber || !expiryMonth || !expiryYear || !cvv) {
      return NextResponse.json({ 
        success: false, 
        error: 'Eksik kart bilgileri' 
      }, { status: 400 })
    }

    if (!totalAmount || totalAmount <= 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Geçersiz tutar' 
      }, { status: 400 })
    }

    // Request origin ve callback URL'leri
    const origin = request.headers.get('origin') || 'https://merumy.com'
    const basariliUrl = `${origin}/api/payment/callback?status=success`
    const hataUrl = `${origin}/api/payment/callback?status=fail`

    // Siparis ID oluştur
    const siparisId = generateSiparisId()
    
    // Tutar formatı
    const islemTutar = formatAmount(totalAmount)
    const toplamTutar = islemTutar
    
    // Taksit string olarak
    const taksitStr = String(installment)

    // Son kullanma yılı 2 hane olmalı
    const kkSkYil = String(expiryYear).slice(-2)
    
    // Telefon formatla
    const kkSahibiGsm = formatPhone(phone || '')

    // Client IP
    const forwardedFor = request.headers.get('x-forwarded-for')
    const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1'

    console.log('=== API PAYMENT INITIATE ===')
    console.log('Siparis ID:', siparisId)
    console.log('Tutar:', islemTutar)
    console.log('Taksit:', taksitStr)
    console.log('Kart:', cardNumber.slice(0, 6) + '******' + cardNumber.slice(-4))
    console.log('Basarili URL:', basariliUrl)
    console.log('Hata URL:', hataUrl)
    console.log('Client IP:', clientIp)

    // SOAP Request parametreleri (odeme.js'deki gibi birebir)
    const response = await Odeme({
      KK_Sahibi: cardHolder,
      KK_No: cardNumber,
      KK_SK_Ay: expiryMonth,
      KK_SK_Yil: kkSkYil,
      KK_CVC: cvv,
      KK_Sahibi_GSM: kkSahibiGsm,
      Hata_URL: hataUrl,
      Basarili_URL: basariliUrl,
      Siparis_ID: siparisId,
      Siparis_Aciklama: 'Merumy Online Siparis',
      Taksit: taksitStr,
      Islem_Tutar: islemTutar,
      Toplam_Tutar: toplamTutar,
      Islem_Guvenlik_Tip: '3D',
      Islem_ID: '1',
      IPAdr: clientIp,
      Ref_URL: origin,
      Data1: '1',
      Data2: '1',
      Data3: '2',
      Data4: '3',
      Data5: '4',
    })

    // Response'u parse et
    const result = extractResult(response)
    const ucdHtml = extractUCDHTML(response)

    console.log('=== ODEME RESULT ===')
    console.log('Sonuc:', result.Sonuc)
    console.log('Sonuc_Str:', result.Sonuc_Str)
    console.log('Islem_GUID:', result.Islem_GUID)
    console.log('UCD_HTML:', ucdHtml ? 'Var' : 'Yok')

    // Başarılı ise 3D HTML döndür
    if (result.Sonuc === 1 && ucdHtml) {
      // HTML entity decode
      let htmlContent = ucdHtml
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")

      // Kullanıcı ID'sini al
      const userId = getUserIdFromSession()
      
      // Sipariş bilgilerini kaydet (callback'te mail için kullanılacak)
      savePendingOrder(siparisId, {
        userId: userId || '',
        customerName: customerName || cardHolder,
        customerEmail: customerEmail || '',
        customerPhone: customerPhone || phone || '',
        address: address || '',
        items: items || [],
        subtotal: subtotal || totalAmount,
        shipping: shipping || 0,
        total: totalAmount,
      })

      return NextResponse.json({
        success: true,
        siparisId,
        islemGuid: result.Islem_GUID,
        htmlContent,
        message: '3D Secure sayfasına yönlendiriliyorsunuz...'
      })
    }

    // Hata durumu
    return NextResponse.json({
      success: false,
      error: result.Sonuc_Str || 'Ödeme başlatılamadı',
      errorCode: result.Sonuc
    }, { status: 400 })

  } catch (error: any) {
    console.error('Payment Initiate Error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Sunucu hatası'
    }, { status: 500 })
  }
}

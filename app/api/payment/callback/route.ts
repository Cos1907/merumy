/**
 * 3D Secure Callback API Endpoint
 * nodejs-client-main/example_code/threds_tamamla.js örneği birebir kullanılmıştır
 * soap kütüphanesi kullanılarak implementasyon yapılmıştır
 */

import { NextRequest, NextResponse } from 'next/server'
import { 
  ThreeDSTamamla,
  extractThreeDSResult
} from '../../../lib/param'
import { sendAdminOrderNotification, sendOrderSuccessEmail } from '../../../lib/mail'
import fs from 'fs'
import path from 'path'

// Pending orders dosya yolu
const PENDING_ORDERS_PATH = path.join(process.cwd(), 'data', 'pending_orders.json')

// Pending order oku
function getPendingOrder(siparisId: string): any | null {
  try {
    if (fs.existsSync(PENDING_ORDERS_PATH)) {
      const orders = JSON.parse(fs.readFileSync(PENDING_ORDERS_PATH, 'utf-8'))
      return orders[siparisId] || null
    }
  } catch (e) {
    console.error('Failed to read pending order:', e)
  }
  return null
}

// Pending order sil
function deletePendingOrder(siparisId: string) {
  try {
    if (fs.existsSync(PENDING_ORDERS_PATH)) {
      const orders = JSON.parse(fs.readFileSync(PENDING_ORDERS_PATH, 'utf-8'))
      delete orders[siparisId]
      fs.writeFileSync(PENDING_ORDERS_PATH, JSON.stringify(orders, null, 2))
    }
  } catch (e) {
    console.error('Failed to delete pending order:', e)
  }
}

// Base URL'i oluştur
function getBaseUrl(request: NextRequest): string {
  // Önce environment variable kontrol et
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL
  }
  // Production'da her zaman HTTPS kullan
  const host = request.headers.get('host') || 'merumy.com'
  // merumy.com için her zaman HTTPS zorla
  if (host.includes('merumy.com')) {
    return `https://www.merumy.com`
  }
  const protocol = request.headers.get('x-forwarded-proto') || 'https'
  return `${protocol}://${host}`
}

// GET handler - 3D Secure sonrası yönlendirme
export async function GET(request: NextRequest) {
  const baseUrl = getBaseUrl(request)
  const { searchParams } = new URL(request.url, baseUrl)
  const status = searchParams.get('status')
  
  // Başarısız durum
  if (status === 'fail') {
    return NextResponse.redirect(`${baseUrl}/checkout/fail`)
  }
  
  // Başarılı durumda success sayfasına yönlendir
  return NextResponse.redirect(`${baseUrl}/checkout/success`)
}

// POST handler - 3D Secure callback (Param'dan gelen veriler)
export async function POST(request: NextRequest) {
  const baseUrl = getBaseUrl(request)
  
  try {
    // Form data olarak gelir
    const formData = await request.formData()
    
    // Param'dan gelen veriler
    const ucdMd = formData.get('UCD_MD') as string || formData.get('md') as string
    const islemGuid = formData.get('Islem_GUID') as string || formData.get('islemGUID') as string
    const siparisId = formData.get('Siparis_ID') as string || formData.get('orderId') as string
    const mdStatus = formData.get('mdStatus') as string
    const sonuc = formData.get('Sonuc') as string

    console.log('=== 3D CALLBACK DATA ===')
    console.log('Base URL:', baseUrl)
    console.log('UCD_MD:', ucdMd)
    console.log('Islem_GUID:', islemGuid)
    console.log('Siparis_ID:', siparisId)
    console.log('mdStatus:', mdStatus)
    console.log('Sonuc:', sonuc)

    // 3D doğrulama başarısız
    if (mdStatus && mdStatus !== '1') {
      console.log('3D doğrulama başarısız - mdStatus:', mdStatus)
      return NextResponse.redirect(`${baseUrl}/checkout/fail?error=3d_failed`, { status: 303 })
    }

    // UCD_MD yoksa direkt sonuca bak
    if (!ucdMd) {
      // Sonuc 1 ise başarılı (Non-Secure işlem)
      if (sonuc === '1') {
        return NextResponse.redirect(`${baseUrl}/checkout/success?orderId=${siparisId || ''}`, { status: 303 })
      }
      console.log('UCD_MD bulunamadı')
      return NextResponse.redirect(`${baseUrl}/checkout/fail?error=missing_data`, { status: 303 })
    }

    // 3D işlemi tamamla - TP_WMD_Pay (threds_tamamla.js'deki gibi birebir)
    console.log('=== THREEDS TAMAMLA REQUEST ===')
    console.log('UCD_MD:', ucdMd)
    console.log('Islem_GUID:', islemGuid)
    console.log('Siparis_ID:', siparisId)

    const response = await ThreeDSTamamla({
      UCD_MD: ucdMd,
      Islem_GUID: islemGuid || '',
      Siparis_ID: siparisId || '',
    })
    
    // Response'u parse et
    const result = extractThreeDSResult(response)

    console.log('=== THREEDS RESPONSE ===')
    console.log('Sonuc:', result.Sonuc)
    console.log('Sonuc_Str:', result.Sonuc_Str)
    console.log('Dekont_ID:', result.Dekont_ID)

    // Başarılı
    if (result.Sonuc === 1) {
      // Pending order bilgilerini al
      const orderData = getPendingOrder(siparisId || '')
      
      if (orderData) {
        // Admin'e sipariş bildirimi gönder
        sendAdminOrderNotification({
          orderId: siparisId || '',
          dekontId: result.Dekont_ID || '',
          customerName: orderData.customerName || '',
          customerEmail: orderData.customerEmail || '',
          customerPhone: orderData.customerPhone || '',
          items: orderData.items || [],
          subtotal: orderData.subtotal || orderData.total,
          shipping: orderData.shipping || 0,
          total: orderData.total || 0,
          address: orderData.address || '',
        }).catch(console.error)
        
        // Müşteriye sipariş onay maili gönder
        if (orderData.customerEmail) {
          sendOrderSuccessEmail(orderData.customerEmail, {
            orderId: siparisId || '',
            dekontId: result.Dekont_ID || '',
            customerName: orderData.customerName || '',
            items: orderData.items || [],
            subtotal: orderData.subtotal || orderData.total,
            shipping: orderData.shipping || 0,
            total: orderData.total || 0,
            address: orderData.address || '',
          }).catch(console.error)
        }
        
        // Siparişi kalıcı olarak kaydet
        try {
          const ordersPath = path.join(process.cwd(), 'data', 'orders.json')
          let orders: any[] = []
          if (fs.existsSync(ordersPath)) {
            orders = JSON.parse(fs.readFileSync(ordersPath, 'utf-8'))
          }
          
          const newOrder = {
            id: Date.now().toString(),
            orderId: siparisId || '',
            dekontId: result.Dekont_ID || '',
            userId: orderData.userId || '',
            customerName: orderData.customerName || '',
            customerEmail: orderData.customerEmail || '',
            customerPhone: orderData.customerPhone || '',
            items: orderData.items || [],
            subtotal: orderData.subtotal || orderData.total,
            shipping: orderData.shipping || 0,
            total: orderData.total || 0,
            address: orderData.address || '',
            status: 'processing',
            createdAt: new Date().toISOString(),
          }
          
          orders.push(newOrder)
          fs.writeFileSync(ordersPath, JSON.stringify(orders, null, 2))
          console.log('Order saved:', newOrder.orderId)
        } catch (e) {
          console.error('Failed to save order:', e)
        }
        
        // Pending order'ı sil
        deletePendingOrder(siparisId || '')
      }
      
      const params = new URLSearchParams()
      params.set('orderId', siparisId || '')
      params.set('dekontId', result.Dekont_ID || '')
      return NextResponse.redirect(`${baseUrl}/checkout/success?${params.toString()}`, { status: 303 })
    }

    // Başarısız - sadece pending order'ı sil (müşteriye mail gönderilmiyor)
    deletePendingOrder(siparisId || '')
    
    const errorMsg = encodeURIComponent(result.Sonuc_Str || 'Ödeme başarısız')
    return NextResponse.redirect(`${baseUrl}/checkout/fail?error=${errorMsg}`, { status: 303 })

  } catch (error: any) {
    console.error('Callback Error:', error)
    return NextResponse.redirect(`${baseUrl}/checkout/fail?error=server_error`, { status: 303 })
  }
}

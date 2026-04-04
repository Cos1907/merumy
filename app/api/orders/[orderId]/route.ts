import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import fs from 'fs'
import path from 'path'
import { query, queryOne } from '../../../lib/db'

const ORDERS_PATH = path.join(process.cwd(), 'data', 'orders.json')
const SESSIONS_PATH = path.join(process.cwd(), 'data', 'sessions.json')
const SESSION_COOKIE_NAME = 'merumy_session'

function getUserFromSession(sessionToken: string | undefined): { userId: string | null; email: string | null } {
  if (!sessionToken) return { userId: null, email: null }
  try {
    if (fs.existsSync(SESSIONS_PATH)) {
      const sessions = JSON.parse(fs.readFileSync(SESSIONS_PATH, 'utf-8'))
      const session = sessions[sessionToken]
      if (session?.user) {
        return {
          userId: session.user.id || null,
          email: session.user.email || null,
        }
      }
    }
  } catch (e) {
    console.error('Session read error:', e)
  }
  return { userId: null, email: null }
}

function getOrders(): any[] {
  try {
    if (fs.existsSync(ORDERS_PATH)) {
      return JSON.parse(fs.readFileSync(ORDERS_PATH, 'utf-8'))
    }
  } catch {
    // ignore
  }
  return []
}

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value
    const { userId, email } = getUserFromSession(sessionToken)

    const { orderId } = params

    // 1. DB'den siparişi ara (status her zaman güncel)
    let order: any = null
    try {
      const dbOrder = await queryOne<any>(
        `SELECT o.id, o.order_id, o.dekont_id, o.customer_name, o.customer_email,
                o.customer_phone, o.shipping_address, o.shipping_city, o.shipping_district,
                o.subtotal, o.shipping_cost, o.discount_amount, o.total,
                o.status, o.payment_method, o.payment_status,
                o.tracking_number, o.admin_notes, o.notes,
                o.created_at, o.updated_at
         FROM orders o
         WHERE o.order_id = ?`,
        [orderId]
      )

      if (dbOrder) {
        // Sipariş ürünlerini çek
        const items = await query<any[]>(
          `SELECT oi.product_name, oi.quantity, oi.unit_price,
                  oi.product_barcode, oi.product_snapshot
           FROM order_items oi WHERE oi.order_id = ?`,
          [dbOrder.id]
        )

        const mappedItems = (items || []).map((item: any) => {
          let snapshot: any = {}
          try { snapshot = typeof item.product_snapshot === 'string' ? JSON.parse(item.product_snapshot) : (item.product_snapshot || {}) } catch {}
          return {
            name: item.product_name,
            quantity: item.quantity,
            price: Number(item.unit_price),
            barcode: item.product_barcode,
            image: snapshot.image || snapshot.imageUrl || '',
            brand: snapshot.brand || '',
            slug: snapshot.slug || '',
          }
        })

        order = {
          id: dbOrder.id,
          orderId: dbOrder.order_id,
          dekontId: dbOrder.dekont_id,
          customerName: dbOrder.customer_name,
          customerEmail: dbOrder.customer_email,
          customerPhone: dbOrder.customer_phone,
          address: [dbOrder.shipping_address, dbOrder.shipping_city, dbOrder.shipping_district].filter(Boolean).join(', '),
          subtotal: Number(dbOrder.subtotal),
          shipping: Number(dbOrder.shipping_cost || 0),
          discountAmount: Number(dbOrder.discount_amount || 0),
          total: Number(dbOrder.total),
          status: dbOrder.status,
          paymentMethod: dbOrder.payment_method,
          paymentStatus: dbOrder.payment_status,
          trackingNumber: dbOrder.tracking_number,
          adminNotes: dbOrder.admin_notes,
          notes: dbOrder.notes,
          items: mappedItems,
          createdAt: dbOrder.created_at,
          updatedAt: dbOrder.updated_at,
        }
      }
    } catch (dbErr) {
      console.error('DB order fetch error:', dbErr)
    }

    // 2. DB'de yoksa JSON'a bak (eski siparişler için fallback)
    if (!order) {
      const orders = getOrders()
      const jsonOrder = orders.find((o) => o.orderId === orderId || o.id === orderId)
      if (jsonOrder) {
        order = jsonOrder
      }
    }

    if (!order) {
      return NextResponse.json({ error: 'Sipariş bulunamadı' }, { status: 404 })
    }

    // Security: sipariş bu kullanıcıya mı ait?
    if (userId || email) {
      const isOwner =
        (userId && order.userId === userId) ||
        (email && order.customerEmail?.toLowerCase() === email.toLowerCase())

      if (!isOwner) {
        return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 })
      }
    }

    // Ürün görseli eksikse DB'den bul
    if (order.items && order.items.length > 0) {
      const enrichedItems = await Promise.all(order.items.map(async (item: any) => {
        if (item.image && item.image !== 'null' && item.image !== '') return item
        try {
          const rows = await query<any[]>(
            `SELECT pi.image_url FROM products p
             LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = 1
             WHERE p.name = ? OR p.barcode = ?
             LIMIT 1`,
            [item.name || '', item.barcode || item.id || '']
          )
          if (rows && rows.length > 0 && rows[0].image_url) {
            return { ...item, image: rows[0].image_url }
          }
        } catch { /* ignore */ }
        return item
      }))
      order = { ...order, items: enrichedItems }
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Order detail error:', error)
    return NextResponse.json({ error: 'Sipariş getirilemedi' }, { status: 500 })
  }
}

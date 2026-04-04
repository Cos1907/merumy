import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { cookies } from 'next/headers'
import { query } from '../../lib/db'

const ORDERS_PATH = path.join(process.cwd(), 'data', 'orders.json')
const USERS_PATH = path.join(process.cwd(), 'data', 'users.json')
const SESSIONS_PATH = path.join(process.cwd(), 'data', 'sessions.json')
const SESSION_COOKIE_NAME = 'merumy_session'

interface Order {
  id: string
  orderId: string
  dekontId: string
  userId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  items: any[]
  subtotal: number
  shipping: number
  total: number
  address: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  createdAt: string
}

// Siparişleri oku
function getOrders(): Order[] {
  try {
    if (fs.existsSync(ORDERS_PATH)) {
      return JSON.parse(fs.readFileSync(ORDERS_PATH, 'utf-8'))
    }
  } catch (e) {
    console.error('Failed to read orders:', e)
  }
  return []
}

// Siparişleri kaydet
function saveOrders(orders: Order[]) {
  try {
    const dir = path.dirname(ORDERS_PATH)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(ORDERS_PATH, JSON.stringify(orders, null, 2))
  } catch (e) {
    console.error('Failed to save orders:', e)
  }
}

// Session'dan user bilgilerini al (merumy_session cookie'sini kullanır)
function getUserFromSession(sessionToken: string | undefined): { userId: string | null, email: string | null } {
  if (!sessionToken) return { userId: null, email: null }
  try {
    if (fs.existsSync(SESSIONS_PATH)) {
      const sessions = JSON.parse(fs.readFileSync(SESSIONS_PATH, 'utf-8'))
      const session = sessions[sessionToken]
      if (session && session.user) {
        return { 
          userId: session.user.id || null, 
          email: session.user.email || null 
        }
      }
    }
  } catch (e) {
    console.error('Failed to get user from session:', e)
  }
  return { userId: null, email: null }
}

// GET - Kullanıcının siparişlerini getir
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    // merumy_session cookie'sini kullan (auth sistemiyle aynı)
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value
    const { userId, email: userEmail } = getUserFromSession(sessionToken)
    
    if (!userId && !userEmail) {
      return NextResponse.json({ orders: [] })
    }
    
    // 1. JSON'dan siparişleri al
    const orders = getOrders()
    const userOrders = orders.filter(o => {
      if (userId && o.userId === userId) return true
      if (userEmail && o.customerEmail && o.customerEmail.toLowerCase() === userEmail.toLowerCase()) return true
      return false
    })

    // 2. Veritabanından da siparişleri al
    let dbOrders: any[] = []
    try {
      const conditions: string[] = []
      const params: any[] = []
      if (userEmail) {
        conditions.push('o.customer_email = ?')
        params.push(userEmail)
      }
      if (conditions.length > 0) {
        const ordersRaw = await query<any[]>(
          `SELECT o.id, o.order_id, o.dekont_id, o.customer_name, o.customer_email,
                  o.customer_phone, o.shipping_address, o.shipping_city, o.shipping_district,
                  o.subtotal, o.shipping_cost, o.discount_amount, o.total,
                  o.status, o.created_at
           FROM orders o WHERE ${conditions.join(' AND ')}
           ORDER BY o.created_at DESC LIMIT 50`,
          params
        )
        if (ordersRaw && ordersRaw.length > 0) {
          const orderIds = ordersRaw.map((o: any) => o.id)
          let itemsByOrderId: Record<number, any[]> = {}
          if (orderIds.length > 0) {
            const placeholders = orderIds.map(() => '?').join(',')
            const items = await query<any[]>(
              `SELECT oi.order_id, oi.product_name, oi.quantity, oi.unit_price,
                      oi.product_barcode, oi.product_snapshot
               FROM order_items oi WHERE oi.order_id IN (${placeholders})`,
              orderIds
            )
            for (const item of (items || [])) {
              if (!itemsByOrderId[item.order_id]) itemsByOrderId[item.order_id] = []
              let snapshot: any = {}
              try { snapshot = typeof item.product_snapshot === 'string' ? JSON.parse(item.product_snapshot) : (item.product_snapshot || {}) } catch {}
              itemsByOrderId[item.order_id].push({
                name: item.product_name,
                quantity: item.quantity,
                price: Number(item.unit_price),
                barcode: item.product_barcode,
                image: snapshot.image || snapshot.imageUrl || '',
                brand: snapshot.brand || '',
                slug: snapshot.slug || '',
              })
            }
          }
          dbOrders = ordersRaw.map((o: any) => ({
            id: o.id,
            orderId: o.order_id,
            dekontId: o.dekont_id,
            userId: userEmail || '',
            customerName: o.customer_name,
            customerEmail: o.customer_email,
            customerPhone: o.customer_phone,
            address: [o.shipping_address, o.shipping_city, o.shipping_district].filter(Boolean).join(', '),
            subtotal: Number(o.subtotal),
            shipping: Number(o.shipping_cost || 0),
            total: Number(o.total),
            status: o.status,
            items: itemsByOrderId[o.id] || [],
            createdAt: o.created_at,
          }))
        }
      }
    } catch (dbErr) {
      console.error('Failed to fetch orders from DB:', dbErr)
    }

    // 3. Merge JSON and DB orders - DB takes priority (status is always up-to-date in DB)
    const seenOrderIds = new Set<string>()
    const mergedOrders: any[] = []

    // DB orders first — status, tracking etc. are always updated here
    for (const o of dbOrders) {
      if (!seenOrderIds.has(o.orderId)) {
        seenOrderIds.add(o.orderId)
        mergedOrders.push(o)
      }
    }

    // JSON orders only if not already covered by DB
    for (const o of userOrders) {
      if (!seenOrderIds.has(o.orderId)) {
        seenOrderIds.add(o.orderId)
        mergedOrders.push(o)
      }
    }
    
    // En yeni siparişler önce
    mergedOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    // Enrich items with images from DB where missing
    const enrichedOrders = await Promise.all(mergedOrders.map(async (order) => {
      if (!order.items || order.items.length === 0) return order
      const enrichedItems = await Promise.all(order.items.map(async (item: any) => {
        if (item.image && item.image !== 'null' && item.image !== '') return item
        try {
          // Try to find product image from DB by name or barcode
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
      return { ...order, items: enrichedItems }
    }))

    return NextResponse.json({ orders: enrichedOrders })
  } catch (error) {
    console.error('Get orders error:', error)
    return NextResponse.json({ orders: [] })
  }
}

// POST - Yeni sipariş oluştur (internal use)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      orderId,
      dekontId,
      userId,
      customerName,
      customerEmail,
      customerPhone,
      items,
      subtotal,
      shipping,
      total,
      address,
    } = body
    
    const orders = getOrders()
    
    // Aynı orderId ile sipariş var mı kontrol et
    const existingIndex = orders.findIndex(o => o.orderId === orderId)
    
    const newOrder: Order = {
      id: existingIndex >= 0 ? orders[existingIndex].id : Date.now().toString(),
      orderId,
      dekontId: dekontId || '',
      userId: userId || '',
      customerName,
      customerEmail,
      customerPhone,
      items,
      subtotal,
      shipping,
      total,
      address,
      status: 'processing',
      createdAt: existingIndex >= 0 ? orders[existingIndex].createdAt : new Date().toISOString(),
    }
    
    if (existingIndex >= 0) {
      orders[existingIndex] = newOrder
    } else {
      orders.push(newOrder)
    }
    
    saveOrders(orders)
    
    return NextResponse.json({ success: true, order: newOrder })
  } catch (error) {
    console.error('Create order error:', error)
    return NextResponse.json({ success: false, error: 'Failed to create order' })
  }
}


import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { queryOne, query, execute } from '../../../lib/db'

async function checkAdminSession(): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('admin_session')?.value
    if (!sessionToken) return false
    const session = await queryOne<any>(
      'SELECT * FROM admin_sessions WHERE session_token = ? AND expires_at > NOW()',
      [sessionToken]
    )
    return !!session
  } catch {
    return false
  }
}

export async function GET(request: NextRequest) {
  const isAdmin = await checkAdminSession()
  if (!isAdmin) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') || ''
  const search = searchParams.get('search') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '50')
  const offset = (page - 1) * limit

  try {
    // Build WHERE conditions
    const conditions: string[] = []
    const params: any[] = []

    if (status) {
      conditions.push('o.status = ?')
      params.push(status)
    }
    if (search) {
      conditions.push('(o.order_id LIKE ? OR o.customer_name LIKE ? OR o.customer_email LIKE ? OR o.dekont_id LIKE ?)')
      const s = `%${search}%`
      params.push(s, s, s, s)
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    // Count total
    const countResult = await queryOne<any>(
      `SELECT COUNT(*) as total FROM orders o ${whereClause}`,
      params
    )
    const total = countResult?.total || 0

    // Fetch orders with limit inlined to avoid mysql2 prepared statement issue
    const ordersRaw = await query<any[]>(
      `SELECT o.id, o.order_id, o.dekont_id, o.customer_name, o.customer_email,
              o.customer_phone, o.shipping_address, o.shipping_city, o.shipping_district,
              o.subtotal, o.shipping_cost, o.discount_amount, o.total,
              o.status, o.payment_method, o.payment_status,
              o.tracking_number, o.admin_notes, o.notes,
              o.created_at, o.updated_at
       FROM orders o
       ${whereClause}
       ORDER BY o.created_at DESC
       LIMIT ${limit} OFFSET ${offset}`,
      params
    )

    // Fetch order items for all orders
    const orderIds = ordersRaw.map((o: any) => o.id)

    let itemsByOrderId: Record<number, any[]> = {}
    if (orderIds.length > 0) {
      const placeholders = orderIds.map(() => '?').join(',')
      const items = await query<any[]>(
        `SELECT oi.order_id, oi.product_name, oi.quantity, oi.unit_price, oi.total_price,
                oi.product_barcode, oi.product_snapshot
         FROM order_items oi
         WHERE oi.order_id IN (${placeholders})`,
        orderIds
      )
      for (const item of items) {
        if (!itemsByOrderId[item.order_id]) itemsByOrderId[item.order_id] = []
        let snapshot: any = {}
        try {
          snapshot = typeof item.product_snapshot === 'string'
            ? JSON.parse(item.product_snapshot)
            : (item.product_snapshot || {})
        } catch {}
        itemsByOrderId[item.order_id].push({
          name: item.product_name,
          quantity: item.quantity,
          price: Number(item.unit_price),
          total: Number(item.total_price),
          barcode: item.product_barcode,
          brand: snapshot.brand || snapshot.brandName || '',
          image: snapshot.image || snapshot.imageUrl || '',
          slug: snapshot.slug || '',
        })
      }
    }

    // Map to camelCase for frontend
    const orders = ordersRaw.map((o: any) => ({
      id: o.id,
      orderId: o.order_id,
      dekontId: o.dekont_id,
      customerName: o.customer_name,
      customerEmail: o.customer_email,
      customerPhone: o.customer_phone,
      address: [o.shipping_address, o.shipping_city, o.shipping_district].filter(Boolean).join(', '),
      shippingAddress: o.shipping_address,
      shippingCity: o.shipping_city,
      shippingDistrict: o.shipping_district,
      subtotal: Number(o.subtotal),
      shippingCost: Number(o.shipping_cost || 0),
      discountAmount: Number(o.discount_amount || 0),
      total: Number(o.total),
      status: o.status,
      paymentMethod: o.payment_method,
      paymentStatus: o.payment_status,
      trackingNumber: o.tracking_number || '',
      adminNotes: o.admin_notes || '',
      notes: o.notes || '',
      createdAt: o.created_at,
      updatedAt: o.updated_at,
      items: itemsByOrderId[o.id] || [],
    }))

    return NextResponse.json({ orders, total, page, limit })
  } catch (error) {
    console.error('Admin orders GET error:', error)
    return NextResponse.json({ error: 'Veritabanı hatası' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const isAdmin = await checkAdminSession()
  if (!isAdmin) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  try {
    const body = await request.json()
    const { orderId, status, trackingNumber, adminNotes } = body

    if (!orderId) return NextResponse.json({ error: 'orderId gerekli' }, { status: 400 })

    const updates: string[] = ['updated_at = NOW()']
    const params: any[] = []

    if (status !== undefined) {
      updates.push('status = ?')
      params.push(status)
    }
    if (trackingNumber !== undefined) {
      updates.push('tracking_number = ?')
      params.push(trackingNumber)
    }
    if (adminNotes !== undefined) {
      updates.push('admin_notes = ?')
      params.push(adminNotes)
    }

    if (updates.length === 1) {
      return NextResponse.json({ error: 'Güncellenecek alan yok' }, { status: 400 })
    }

    params.push(orderId)
    await execute(
      `UPDATE orders SET ${updates.join(', ')} WHERE order_id = ?`,
      params
    )

    // Return the updated order
    const updated = await queryOne<any>(
      `SELECT o.id, o.order_id, o.customer_name, o.customer_email, o.customer_phone,
              o.shipping_address, o.shipping_city, o.shipping_district,
              o.total, o.status, o.tracking_number, o.admin_notes, o.created_at
       FROM orders o WHERE o.order_id = ?`,
      [orderId]
    )

    return NextResponse.json({
      success: true,
      order: updated ? {
        id: updated.id,
        orderId: updated.order_id,
        customerName: updated.customer_name,
        status: updated.status,
        trackingNumber: updated.tracking_number || '',
      } : null
    })
  } catch (error) {
    console.error('Admin orders PUT error:', error)
    return NextResponse.json({ error: 'Güncelleme hatası' }, { status: 500 })
  }
}

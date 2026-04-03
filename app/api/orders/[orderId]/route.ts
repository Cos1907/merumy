import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { query, queryOne } from '../../../lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest, { params }: { params: { orderId: string } }) {
  try {
    const cookieStore = cookies()
    const sessionToken = cookieStore.get('merumy_session')?.value
    if (!sessionToken) return NextResponse.json({ error: 'Giriş yapınız' }, { status: 401 })

    const session = await queryOne<any>(
      `SELECT s.user_id FROM sessions s WHERE s.token = ? AND s.expires_at > NOW()`,
      [sessionToken]
    )
    if (!session) return NextResponse.json({ error: 'Oturum geçersiz' }, { status: 401 })

    const orderId = params.orderId
    const order = await queryOne<any>(
      `SELECT o.*, o.order_id as orderId, o.created_at as createdAt,
              o.shipping_address as shippingAddress, o.promo_discount as promoDiscount,
              o.shipping_fee as shippingFee
       FROM orders o
       WHERE (o.order_id = ? OR o.id = ?) AND o.user_id = ?`,
      [orderId, orderId, session.user_id]
    )
    if (!order) return NextResponse.json({ error: 'Sipariş bulunamadı' }, { status: 404 })

    // Parse items
    let items: any[] = []
    try {
      const rawItems = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || [])
      items = Array.isArray(rawItems) ? rawItems : []
    } catch { items = [] }

    // Parse shipping address
    let shippingAddress = order.shippingAddress
    try {
      if (typeof shippingAddress === 'string' && shippingAddress.startsWith('{')) {
        shippingAddress = JSON.parse(shippingAddress)
      }
    } catch { /* keep as string */ }

    return NextResponse.json({
      order: {
        ...order,
        items,
        shippingAddress,
        total: Number(order.total || 0),
        subtotal: Number(order.subtotal || order.total || 0),
        promoDiscount: Number(order.promoDiscount || 0),
        shippingFee: Number(order.shippingFee || 0),
      }
    })
  } catch (error) {
    console.error('Order detail error:', error)
    return NextResponse.json({ error: 'Sipariş alınamadı' }, { status: 500 })
  }
}

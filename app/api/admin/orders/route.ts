import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { queryOne } from '../../../lib/db'
import fs from 'fs'
import path from 'path'

const ORDERS_PATH = path.join(process.cwd(), 'data', 'orders.json')

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

function getOrders(): any[] {
  try {
    if (fs.existsSync(ORDERS_PATH)) {
      return JSON.parse(fs.readFileSync(ORDERS_PATH, 'utf-8'))
    }
  } catch (e) {
    console.error('Failed to read orders:', e)
  }
  return []
}

function saveOrders(orders: any[]) {
  try {
    const dir = path.dirname(ORDERS_PATH)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(ORDERS_PATH, JSON.stringify(orders, null, 2))
  } catch (e) {
    console.error('Failed to save orders:', e)
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

  let orders = getOrders()

  // Sort newest first
  orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  // Filter
  if (status) {
    orders = orders.filter((o) => o.status === status)
  }
  if (search) {
    const s = search.toLowerCase()
    orders = orders.filter(
      (o) =>
        o.orderId?.toLowerCase().includes(s) ||
        o.customerName?.toLowerCase().includes(s) ||
        o.customerEmail?.toLowerCase().includes(s) ||
        o.dekontId?.toLowerCase().includes(s)
    )
  }

  const total = orders.length
  const paginated = orders.slice((page - 1) * limit, page * limit)

  return NextResponse.json({ orders: paginated, total, page, limit })
}

export async function PUT(request: NextRequest) {
  const isAdmin = await checkAdminSession()
  if (!isAdmin) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  try {
    const body = await request.json()
    const { orderId, status, adminNotes } = body

    const orders = getOrders()
    const idx = orders.findIndex((o) => o.orderId === orderId || o.id === orderId)
    if (idx === -1) return NextResponse.json({ error: 'Sipariş bulunamadı' }, { status: 404 })

    if (status) orders[idx].status = status
    if (adminNotes !== undefined) orders[idx].adminNotes = adminNotes
    orders[idx].updatedAt = new Date().toISOString()

    saveOrders(orders)
    return NextResponse.json({ success: true, order: orders[idx] })
  } catch (error) {
    console.error('Admin orders PUT error:', error)
    return NextResponse.json({ error: 'Güncelleme hatası' }, { status: 500 })
  }
}

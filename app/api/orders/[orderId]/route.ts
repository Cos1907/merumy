import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import fs from 'fs'
import path from 'path'

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
    const orders = getOrders()

    const order = orders.find(
      (o) =>
        o.orderId === orderId ||
        o.id === orderId
    )

    if (!order) {
      return NextResponse.json({ error: 'Sipariş bulunamadı' }, { status: 404 })
    }

    // Security: ensure the order belongs to this user (unless no user info)
    if (userId || email) {
      const isOwner =
        (userId && order.userId === userId) ||
        (email && order.customerEmail?.toLowerCase() === email.toLowerCase())

      if (!isOwner) {
        return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 })
      }
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Order detail error:', error)
    return NextResponse.json({ error: 'Sipariş getirilemedi' }, { status: 500 })
  }
}

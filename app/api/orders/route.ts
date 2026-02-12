import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { cookies } from 'next/headers'

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
    
    const orders = getOrders()
    
    // userId veya email ile eşleşen siparişleri getir
    const userOrders = orders.filter(o => {
      // userId eşleşmesi
      if (userId && o.userId === userId) return true
      // Email eşleşmesi (hem userId hem de email ile kontrol et)
      if (userEmail && o.customerEmail && o.customerEmail.toLowerCase() === userEmail.toLowerCase()) return true
      return false
    })
    
    // En yeni siparişler önce
    userOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    
    return NextResponse.json({ orders: userOrders })
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


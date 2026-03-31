import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { cookies } from 'next/headers';

const ORDERS_PATH = path.join(process.cwd(), 'data', 'orders.json');
const SESSIONS_PATH = path.join(process.cwd(), 'data', 'admin-sessions.json');
const SESSION_COOKIE_NAME = 'admin_session';

interface Order {
  id: string;
  orderId?: string;
  status: string;
  [key: string]: any;
}

interface AdminSession {
  userId: string;
  expiresAt: string;
}

function getOrders(): Order[] {
  try {
    if (fs.existsSync(ORDERS_PATH)) {
      return JSON.parse(fs.readFileSync(ORDERS_PATH, 'utf-8'));
    }
  } catch (e) {
    console.error('Failed to read orders:', e);
  }
  return [];
}

function saveOrders(orders: Order[]) {
  try {
    const dir = path.dirname(ORDERS_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(ORDERS_PATH, JSON.stringify(orders, null, 2));
  } catch (e) {
    console.error('Failed to save orders:', e);
  }
}

function getAdminUserFromSession(sessionToken: string | undefined): { userId: string | null } {
  if (!sessionToken) return { userId: null };
  try {
    if (fs.existsSync(SESSIONS_PATH)) {
      const sessions = JSON.parse(fs.readFileSync(SESSIONS_PATH, 'utf-8'));
      const session: AdminSession = sessions[sessionToken];
      if (session && new Date(session.expiresAt) > new Date()) {
        return { userId: session.userId };
      }
    }
  } catch (e) {
    console.error('Failed to get admin user from session:', e);
  }
  return { userId: null };
}

// PATCH - Toplu sipariş durumu güncelle
export async function PATCH(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    const { userId: adminUserId } = getAdminUserFromSession(sessionToken);

    if (!adminUserId) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { orderIds, status } = await request.json();

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json({ error: 'Sipariş ID\'leri gereklidir' }, { status: 400 });
    }

    if (!status) {
      return NextResponse.json({ error: 'Durum gereklidir' }, { status: 400 });
    }

    const orders = getOrders();
    const orderIdSet = new Set(orderIds);
    let updatedCount = 0;

    for (let i = 0; i < orders.length; i++) {
      const orderId = orders[i].orderId || orders[i].id;
      if (orderIdSet.has(orderId)) {
        orders[i].status = status;
        orders[i].updatedAt = new Date().toISOString();
        updatedCount++;
      }
    }

    saveOrders(orders);

    return NextResponse.json({ 
      success: true, 
      message: `${updatedCount} sipariş güncellendi`,
      updatedCount 
    });
  } catch (error) {
    console.error('Bulk update orders error:', error);
    return NextResponse.json({ error: 'Toplu güncelleme başarısız oldu' }, { status: 500 });
  }
}


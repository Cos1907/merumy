import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const ORDERS_PATH = path.join(process.cwd(), 'data', 'orders.json');

interface Order {
  id: string;
  orderId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: string;
  createdAt: string;
  address?: string;
}

// Siparişleri oku
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

// Telefon numarasını normalize et (sadece rakamları al)
function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '').slice(-10); // Son 10 haneyi al
}

export async function POST(request: NextRequest) {
  try {
    const { email, phone } = await request.json();

    if (!email || !phone) {
      return NextResponse.json(
        { error: 'E-posta ve telefon numarası gereklidir' },
        { status: 400 }
      );
    }

    const orders = getOrders();
    const normalizedPhone = normalizePhone(phone);

    // E-posta ve telefon numarası ile sipariş bul
    const matchingOrders = orders.filter(order => {
      const orderPhone = normalizePhone(order.customerPhone || '');
      const orderEmail = (order.customerEmail || '').toLowerCase().trim();
      const inputEmail = email.toLowerCase().trim();

      return orderPhone === normalizedPhone && orderEmail === inputEmail;
    });

    if (matchingOrders.length === 0) {
      return NextResponse.json(
        { error: 'Bu bilgilerle eşleşen sipariş bulunamadı' },
        { status: 404 }
      );
    }

    // Siparişleri tarihe göre sırala (en yeni önce)
    matchingOrders.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Hassas bilgileri çıkararak döndür
    const safeOrders = matchingOrders.map(order => ({
      orderId: order.orderId || order.id,
      customerName: order.customerName,
      items: order.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
      })),
      itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
      total: order.total,
      status: order.status,
      createdAt: order.createdAt,
    }));

    return NextResponse.json({ orders: safeOrders });
  } catch (error) {
    console.error('Track order error:', error);
    return NextResponse.json(
      { error: 'Sipariş takibi sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
}


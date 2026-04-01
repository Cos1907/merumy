import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../lib/db';

interface OrderResult {
  id: number;  // orders.id (INTEGER) - order_items ile eşleşir
  order_id: string;  // orders.order_id (VARCHAR) - sipariş numarası
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  total: number;
  status: string;
  created_at: Date;
  shipping_address: string;
  shipping_city: string;
}

interface OrderItem {
  product_name: string;
  quantity: number;
  unit_price: number;
}

// Telefon numarasını normalize et (sadece rakamları al)
function normalizePhone(phone: string): string {
  if (!phone) return '';
  // Sadece rakamları al ve son 10 haneyi kullan
  const digits = phone.replace(/\D/g, '');
  return digits.slice(-10);
}

export async function POST(request: NextRequest) {
  try {
    const { email, phone } = await request.json();

    // En az birisi gerekli
    if (!email && !phone) {
      return NextResponse.json(
        { error: 'E-posta veya telefon numarası gereklidir' },
        { status: 400 }
      );
    }

    // MySQL'den sipariş ara
    let orders: OrderResult[] = [];
    const normalizedPhone = normalizePhone(phone || '');
    const normalizedEmail = (email || '').toLowerCase().trim();

    // E-posta ve telefon ile ara (her ikisi de varsa)
    if (normalizedEmail && normalizedPhone) {
      orders = await query<OrderResult[]>(
        `SELECT id, order_id, customer_name, customer_email, customer_phone, 
                total, status, created_at, shipping_address, shipping_city
         FROM orders 
         WHERE (LOWER(customer_email) = ? OR RIGHT(REPLACE(REPLACE(REPLACE(customer_phone, ' ', ''), '-', ''), '(', ''), 10) = ?)
         ORDER BY created_at DESC
         LIMIT 20`,
        [normalizedEmail, normalizedPhone]
      );
    } 
    // Sadece e-posta ile ara
    else if (normalizedEmail) {
      orders = await query<OrderResult[]>(
        `SELECT id, order_id, customer_name, customer_email, customer_phone, 
                total, status, created_at, shipping_address, shipping_city
         FROM orders 
         WHERE LOWER(customer_email) = ?
         ORDER BY created_at DESC
         LIMIT 20`,
        [normalizedEmail]
      );
    }
    // Sadece telefon ile ara
    else if (normalizedPhone) {
      orders = await query<OrderResult[]>(
        `SELECT id, order_id, customer_name, customer_email, customer_phone, 
                total, status, created_at, shipping_address, shipping_city
         FROM orders 
         WHERE RIGHT(REPLACE(REPLACE(REPLACE(customer_phone, ' ', ''), '-', ''), '(', ''), 10) = ?
         ORDER BY created_at DESC
         LIMIT 20`,
        [normalizedPhone]
      );
    }

    if (orders.length === 0) {
      return NextResponse.json(
        { error: 'Bu bilgilerle eşleşen sipariş bulunamadı' },
        { status: 404 }
      );
    }

    // Her sipariş için ürünleri getir
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        // order_items.order_id = orders.id (INTEGER) kullanılmalı
        const items = await query<OrderItem[]>(
          `SELECT product_name, quantity, unit_price FROM order_items WHERE order_id = ?`,
          [order.id]  // orders.id kullan, orders.order_id değil
        );

        return {
          orderId: order.order_id,  // Görüntülemek için VARCHAR sipariş numarası
          customerName: order.customer_name,
          items: items.map(item => ({
            name: item.product_name,
            quantity: item.quantity,
            price: item.unit_price
          })),
          itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
          total: order.total,
          status: order.status || 'pending',
          createdAt: order.created_at,
          shippingCity: order.shipping_city,
        };
      })
    );

    return NextResponse.json({ orders: ordersWithItems });
  } catch (error) {
    console.error('Track order error:', error);
    return NextResponse.json(
      { error: 'Sipariş takibi sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
}

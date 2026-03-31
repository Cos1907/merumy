import { NextRequest, NextResponse } from 'next/server';
import { query, execute, queryOne } from '../../../lib/db';
import { cookies } from 'next/headers';
import { sendOrderStatusUpdateEmail } from '../../../lib/mail';

// Session check helper
async function checkAdminSession(): Promise<{ isAdmin: boolean; userId?: number }> {
  try {
    const cookieStore = cookies();
    const sessionToken = cookieStore.get('admin_session')?.value;
    
    if (!sessionToken) return { isAdmin: false };
    
    const session = await queryOne<any>(
      'SELECT user_id FROM admin_sessions WHERE session_token = ? AND expires_at > NOW()',
      [sessionToken]
    );
    
    if (session) {
      return { isAdmin: true, userId: session.user_id };
    }
    return { isAdmin: false };
  } catch {
    return { isAdmin: false };
  }
}

// GET - Fetch all orders with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const { isAdmin } = await checkAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const dateFrom = searchParams.get('dateFrom') || '';
    const dateTo = searchParams.get('dateTo') || '';
    
    const offset = (page - 1) * limit;
    
    let whereConditions: string[] = [];
    let params: any[] = [];
    
    if (search) {
      whereConditions.push('(order_id LIKE ? OR customer_name LIKE ? OR customer_email LIKE ? OR customer_phone LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    if (status && status !== 'all') {
      whereConditions.push('status = ?');
      params.push(status);
    }
    
    if (dateFrom) {
      whereConditions.push('DATE(created_at) >= ?');
      params.push(dateFrom);
    }
    
    if (dateTo) {
      whereConditions.push('DATE(created_at) <= ?');
      params.push(dateTo);
    }
    
    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';
    
    // Get total count
    const [countResult] = await query<any[]>(`SELECT COUNT(*) as total FROM orders ${whereClause}`, params);
    const total = countResult?.total || 0;
    
    // Get orders
    const ordersQuery = `
      SELECT 
        id,
        order_id as orderId,
        dekont_id as dekontId,
        customer_name as customerName,
        customer_email as customerEmail,
        customer_phone as customerPhone,
        shipping_address as address,
        subtotal,
        shipping_cost as shipping,
        discount_amount as discount,
        total,
        status,
        payment_status as paymentStatus,
        tracking_number as trackingNumber,
        shipping_carrier as shippingCarrier,
        notes,
        admin_notes as adminNotes,
        created_at as createdAt,
        updated_at as updatedAt,
        shipped_at as shippedAt,
        delivered_at as deliveredAt
      FROM orders
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ${Number(limit)} OFFSET ${Number(offset)}
    `;
    
    const orders = await query<any[]>(ordersQuery, params);
    
    // Get order items for each order
    for (const order of orders) {
      const items = await query<any[]>(
        `SELECT 
          product_name as name,
          quantity,
          unit_price as price,
          total_price as totalPrice
        FROM order_items 
        WHERE order_id = ?`,
        [order.id]
      );
      order.items = items;
    }
    
    // Get statistics
    const stats = await queryOne<any>(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing,
        SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed,
        SUM(CASE WHEN status = 'preparing' THEN 1 ELSE 0 END) as preparing,
        SUM(CASE WHEN status = 'shipped' THEN 1 ELSE 0 END) as shipped,
        SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
        SUM(CASE WHEN status != 'cancelled' THEN total ELSE 0 END) as totalRevenue
      FROM orders
    `);
    
    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      stats
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Siparişler getirilemedi' }, { status: 500 });
  }
}

// PUT - Update order status (single or bulk)
export async function PUT(request: NextRequest) {
  try {
    const { isAdmin, userId } = await checkAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const body = await request.json();
    const { orderId, orderIds, status, trackingNumber, shippingCarrier, adminNotes, sendEmail = true } = body;
    
    // Toplu güncelleme
    if (orderIds && Array.isArray(orderIds) && orderIds.length > 0) {
      const results = { success: 0, failed: 0, emailsSent: 0 };
      
      for (const id of orderIds) {
        try {
          const currentOrder = await queryOne<any>(
            'SELECT id, order_id, status, customer_name, customer_email, total FROM orders WHERE order_id = ? OR id = ?',
            [id, id]
          );
          
          if (!currentOrder) continue;
          
          const oldStatus = currentOrder.status;
          
          let updateFields: string[] = ['updated_at = NOW()'];
          let updateParams: any[] = [];
          
          if (status) {
            updateFields.push('status = ?');
            updateParams.push(status);
            
            if (status === 'shipped') {
              updateFields.push('shipped_at = NOW()');
            } else if (status === 'delivered') {
              updateFields.push('delivered_at = NOW()');
            }
          }
          
          if (trackingNumber !== undefined) {
            updateFields.push('tracking_number = ?');
            updateParams.push(trackingNumber);
          }
          
          updateParams.push(currentOrder.id);
          
          await execute(
            `UPDATE orders SET ${updateFields.join(', ')} WHERE id = ?`,
            updateParams
          );
          
          // Log status change
          if (status && status !== oldStatus) {
            await execute(
              `INSERT INTO order_status_history (order_id, old_status, new_status, changed_by, notes)
               VALUES (?, ?, ?, ?, ?)`,
              [currentOrder.id, oldStatus, status, userId || null, adminNotes || null]
            );
            
            // Send email notification
            if (sendEmail && currentOrder.customer_email) {
              try {
                // Get order items for email
                const items = await query<any[]>(
                  `SELECT product_name as name, quantity, unit_price as price FROM order_items WHERE order_id = ?`,
                  [currentOrder.id]
                );
                
                await sendOrderStatusUpdateEmail(currentOrder.customer_email, {
                  orderId: currentOrder.order_id,
                  customerName: currentOrder.customer_name,
                  newStatus: status,
                  trackingNumber: trackingNumber || undefined,
                  items: items,
                  total: currentOrder.total
                });
                results.emailsSent++;
              } catch (emailError) {
                console.error('Email send error for order:', currentOrder.order_id, emailError);
              }
            }
          }
          
          results.success++;
        } catch (err) {
          console.error('Error updating order:', id, err);
          results.failed++;
        }
      }
      
      return NextResponse.json({ 
        success: true, 
        message: `${results.success} sipariş güncellendi, ${results.emailsSent} mail gönderildi`,
        results 
      });
    }
    
    // Tekli güncelleme
    if (!orderId) {
      return NextResponse.json({ error: 'Sipariş ID gerekli' }, { status: 400 });
    }
    
    // Get current order
    const currentOrder = await queryOne<any>(
      'SELECT id, order_id, status, customer_name, customer_email, total FROM orders WHERE order_id = ? OR id = ?',
      [orderId, orderId]
    );
    
    if (!currentOrder) {
      return NextResponse.json({ error: 'Sipariş bulunamadı' }, { status: 404 });
    }
    
    const oldStatus = currentOrder.status;
    
    // Build update query
    let updateFields: string[] = ['updated_at = NOW()'];
    let updateParams: any[] = [];
    
    if (status) {
      updateFields.push('status = ?');
      updateParams.push(status);
      
      // Set shipped_at or delivered_at if applicable
      if (status === 'shipped') {
        updateFields.push('shipped_at = NOW()');
      } else if (status === 'delivered') {
        updateFields.push('delivered_at = NOW()');
      }
    }
    
    if (trackingNumber !== undefined) {
      updateFields.push('tracking_number = ?');
      updateParams.push(trackingNumber);
    }
    
    if (shippingCarrier !== undefined) {
      updateFields.push('shipping_carrier = ?');
      updateParams.push(shippingCarrier);
    }
    
    if (adminNotes !== undefined) {
      updateFields.push('admin_notes = ?');
      updateParams.push(adminNotes);
    }
    
    updateParams.push(currentOrder.id);
    
    await execute(
      `UPDATE orders SET ${updateFields.join(', ')} WHERE id = ?`,
      updateParams
    );
    
    // Log status change and send email
    if (status && status !== oldStatus) {
      await execute(
        `INSERT INTO order_status_history (order_id, old_status, new_status, changed_by, notes)
         VALUES (?, ?, ?, ?, ?)`,
        [currentOrder.id, oldStatus, status, userId || null, adminNotes || null]
      );
      
      // Send email notification
      if (sendEmail && currentOrder.customer_email) {
        try {
          // Get order items for email
          const items = await query<any[]>(
            `SELECT product_name as name, quantity, unit_price as price FROM order_items WHERE order_id = ?`,
            [currentOrder.id]
          );
          
          await sendOrderStatusUpdateEmail(currentOrder.customer_email, {
            orderId: currentOrder.order_id,
            customerName: currentOrder.customer_name,
            newStatus: status,
            trackingNumber: trackingNumber || undefined,
            items: items,
            total: currentOrder.total
          });
          console.log('Status update email sent to:', currentOrder.customer_email);
        } catch (emailError) {
          console.error('Failed to send status update email:', emailError);
        }
      }
    }
    
    // Get updated order
    const updatedOrder = await queryOne<any>(
      `SELECT 
        id,
        order_id as orderId,
        customer_name as customerName,
        customer_email as customerEmail,
        status,
        tracking_number as trackingNumber,
        shipping_carrier as shippingCarrier,
        admin_notes as adminNotes,
        updated_at as updatedAt
      FROM orders WHERE id = ?`,
      [currentOrder.id]
    );
    
    return NextResponse.json({ success: true, order: updatedOrder, emailSent: sendEmail && status !== oldStatus });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Sipariş güncellenemedi' }, { status: 500 });
  }
}

// PATCH - Alias for PUT (for backward compatibility)
export async function PATCH(request: NextRequest) {
  return PUT(request);
}

import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '../../../lib/db';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

async function getAdminEmail(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('admin_session')?.value;
    if (!sessionToken) return null;
    const session = await queryOne<any>(
      `SELECT u.email FROM admin_sessions s
       JOIN admin_users u ON s.user_id = u.id
       WHERE s.session_token = ? AND s.expires_at > NOW()`,
      [sessionToken]
    );
    return session?.email || null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const adminEmail = await getAdminEmail();
    if (!adminEmail) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
    if (adminEmail !== 'admin@merumy.com') return NextResponse.json({ error: 'Bu özellik sadece admin kullanıcısına özeldir' }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const dateFrom = searchParams.get('dateFrom') || '';
    const dateTo = searchParams.get('dateTo') || '';

    // Build date condition
    const dateConditions: string[] = ["o.status != 'cancelled'"];
    const dateParams: any[] = [];
    if (dateFrom) { dateConditions.push('DATE(o.created_at) >= ?'); dateParams.push(dateFrom); }
    if (dateTo) { dateConditions.push('DATE(o.created_at) <= ?'); dateParams.push(dateTo); }
    const where = dateConditions.join(' AND ');

    // ── 1. Summary KPIs ──
    const summary = await queryOne<any>(
      `SELECT
         COUNT(DISTINCT o.id)                       AS totalOrders,
         COALESCE(SUM(o.total), 0)                  AS totalRevenue,
         COALESCE(SUM(oi.quantity), 0)              AS totalItemsSold,
         COUNT(DISTINCT o.customer_email)           AS uniqueCustomers,
         COALESCE(AVG(o.total), 0)                  AS avgOrderValue,
         SUM(CASE WHEN o.status IN ('shipped','delivered') THEN 1 ELSE 0 END) AS shippedOrders,
         SUM(CASE WHEN o.status IN ('pending','processing','preparing','confirmed') THEN 1 ELSE 0 END) AS activeOrders
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       WHERE ${where}`,
      dateParams
    );

    // ── 2. Daily breakdown ──
    const dailyRows = await query<any[]>(
      `SELECT
         DATE(o.created_at)                                           AS date,
         COUNT(DISTINCT o.id)                                         AS orderCount,
         COALESCE(SUM(o.total), 0)                                    AS revenue,
         COALESCE(SUM(oi.quantity), 0)                                AS itemsSold,
         SUM(CASE WHEN o.status IN ('shipped','delivered') THEN 1 ELSE 0 END) AS shippedCount,
         SUM(CASE WHEN o.status = 'pending' THEN 1 ELSE 0 END)        AS pendingCount,
         SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END)      AS cancelledCount
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       WHERE ${where}
       GROUP BY DATE(o.created_at)
       ORDER BY date DESC
       LIMIT 90`,
      dateParams
    );

    // ── 3. Status breakdown ──
    const statusRows = await query<any[]>(
      `SELECT status, COUNT(*) AS count, COALESCE(SUM(total), 0) AS revenue
       FROM orders o
       WHERE ${where}
       GROUP BY status
       ORDER BY count DESC`,
      dateParams
    );

    // ── 4. Top products in range ──
    const topProducts = await query<any[]>(
      `SELECT
         p.name,
         b.name  AS brand,
         COALESCE(SUM(oi.quantity), 0)    AS qty,
         COALESCE(SUM(oi.total_price), 0) AS revenue
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       JOIN products p ON oi.product_id = p.id
       LEFT JOIN brands b ON p.brand_id = b.id
       WHERE ${where}
       GROUP BY p.id, p.name, b.name
       ORDER BY qty DESC
       LIMIT 10`,
      dateParams
    );

    // ── 5. Today's quick stats (always current day) ──
    const today = await queryOne<any>(
      `SELECT
         COUNT(DISTINCT o.id)                                         AS ordersToday,
         COALESCE(SUM(o.total), 0)                                    AS revenueToday,
         COALESCE(SUM(oi.quantity), 0)                                AS itemsToday,
         SUM(CASE WHEN o.status IN ('shipped','delivered') THEN 1 ELSE 0 END) AS shippedToday
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       WHERE DATE(o.created_at) = CURDATE() AND o.status != 'cancelled'`,
      []
    );

    return NextResponse.json({
      summary: {
        totalOrders: Number(summary?.totalOrders) || 0,
        totalRevenue: Number(summary?.totalRevenue) || 0,
        totalItemsSold: Number(summary?.totalItemsSold) || 0,
        uniqueCustomers: Number(summary?.uniqueCustomers) || 0,
        avgOrderValue: Number(summary?.avgOrderValue) || 0,
        shippedOrders: Number(summary?.shippedOrders) || 0,
        activeOrders: Number(summary?.activeOrders) || 0,
      },
      today: {
        ordersToday: Number(today?.ordersToday) || 0,
        revenueToday: Number(today?.revenueToday) || 0,
        itemsToday: Number(today?.itemsToday) || 0,
        shippedToday: Number(today?.shippedToday) || 0,
      },
      daily: dailyRows || [],
      statusBreakdown: statusRows || [],
      topProducts: topProducts || [],
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Analiz verileri alınamadı' }, { status: 500 });
  }
}

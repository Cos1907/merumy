import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '../../../lib/db';
import { cookies } from 'next/headers';

// Session check helper
async function checkAdminSession(): Promise<boolean> {
  try {
    const cookieStore = cookies();
    const sessionToken = cookieStore.get('admin_session')?.value;
    
    if (!sessionToken) return false;
    
    const session = await queryOne<any>(
      'SELECT * FROM admin_sessions WHERE session_token = ? AND expires_at > NOW()',
      [sessionToken]
    );
    
    return !!session;
  } catch {
    return false;
  }
}

// GET - Get sales reports
export async function GET(request: NextRequest) {
  try {
    const isAdmin = await checkAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json'; // json, csv, excel
    const dateFrom = searchParams.get('dateFrom') || '';
    const dateTo = searchParams.get('dateTo') || '';
    
    let dateCondition = '';
    let dateParams: any[] = [];
    
    if (dateFrom) {
      dateCondition += ' AND o.created_at >= ?';
      dateParams.push(dateFrom);
    }
    if (dateTo) {
      dateCondition += ' AND o.created_at <= ?';
      dateParams.push(dateTo + ' 23:59:59');
    }

    // Product sales report
    const productSalesQuery = `
      SELECT 
        p.id,
        p.barcode,
        p.sku,
        p.name as productName,
        b.name as brand,
        c.name as category,
        p.price as unitPrice,
        COALESCE(SUM(oi.quantity), 0) as totalQuantitySold,
        COALESCE(SUM(oi.total_price), 0) as totalRevenue,
        COUNT(DISTINCT o.id) as orderCount,
        p.stock as currentStock,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = TRUE LIMIT 1) as image
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN order_items oi ON oi.product_id = p.id
      LEFT JOIN orders o ON oi.order_id = o.id AND o.status != 'cancelled' ${dateCondition}
      GROUP BY p.id, p.barcode, p.sku, p.name, b.name, c.name, p.price, p.stock
      ORDER BY totalQuantitySold DESC
    `;

    const productSales = await query<any[]>(productSalesQuery, dateParams);

    // Summary stats
    const summaryQuery = `
      SELECT 
        COUNT(DISTINCT o.id) as totalOrders,
        COALESCE(SUM(o.total), 0) as totalRevenue,
        COALESCE(SUM(oi.quantity), 0) as totalItemsSold,
        COUNT(DISTINCT o.customer_email) as uniqueCustomers
      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id = o.id
      WHERE o.status != 'cancelled' ${dateCondition}
    `;
    
    const summary = await queryOne<any>(summaryQuery, dateParams);

    // Top 10 best sellers
    const topSellersQuery = `
      SELECT 
        p.name as productName,
        b.name as brand,
        COALESCE(SUM(oi.quantity), 0) as quantitySold,
        COALESCE(SUM(oi.total_price), 0) as revenue
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN order_items oi ON oi.product_id = p.id
      LEFT JOIN orders o ON oi.order_id = o.id AND o.status != 'cancelled' ${dateCondition}
      GROUP BY p.id, p.name, b.name
      HAVING quantitySold > 0
      ORDER BY quantitySold DESC
      LIMIT 10
    `;
    
    const topSellers = await query<any[]>(topSellersQuery, dateParams);

    // Brand performance
    const brandPerformanceQuery = `
      SELECT 
        b.name as brand,
        COUNT(DISTINCT p.id) as productCount,
        COALESCE(SUM(oi.quantity), 0) as totalQuantitySold,
        COALESCE(SUM(oi.total_price), 0) as totalRevenue
      FROM brands b
      LEFT JOIN products p ON p.brand_id = b.id
      LEFT JOIN order_items oi ON oi.product_id = p.id
      LEFT JOIN orders o ON oi.order_id = o.id AND o.status != 'cancelled' ${dateCondition}
      GROUP BY b.id, b.name
      ORDER BY totalRevenue DESC
    `;
    
    const brandPerformance = await query<any[]>(brandPerformanceQuery, dateParams);

    // Category performance
    const categoryPerformanceQuery = `
      SELECT 
        c.name as category,
        COUNT(DISTINCT p.id) as productCount,
        COALESCE(SUM(oi.quantity), 0) as totalQuantitySold,
        COALESCE(SUM(oi.total_price), 0) as totalRevenue
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id
      LEFT JOIN order_items oi ON oi.product_id = p.id
      LEFT JOIN orders o ON oi.order_id = o.id AND o.status != 'cancelled' ${dateCondition}
      GROUP BY c.id, c.name
      ORDER BY totalRevenue DESC
    `;
    
    const categoryPerformance = await query<any[]>(categoryPerformanceQuery, dateParams);

    // Daily sales for the last 30 days
    const dailySalesQuery = `
      SELECT 
        DATE(o.created_at) as date,
        COUNT(DISTINCT o.id) as orderCount,
        COALESCE(SUM(o.total), 0) as revenue
      FROM orders o
      WHERE o.status != 'cancelled' 
        AND o.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY DATE(o.created_at)
      ORDER BY date ASC
    `;
    
    const dailySales = await query<any[]>(dailySalesQuery, []);

    const reportData = {
      generatedAt: new Date().toISOString(),
      dateRange: { from: dateFrom || 'Tüm zamanlar', to: dateTo || 'Bugün' },
      summary: {
        totalOrders: summary?.totalOrders || 0,
        totalRevenue: summary?.totalRevenue || 0,
        totalItemsSold: summary?.totalItemsSold || 0,
        uniqueCustomers: summary?.uniqueCustomers || 0
      },
      productSales,
      topSellers,
      brandPerformance,
      categoryPerformance,
      dailySales
    };

    // Return based on format
    if (format === 'csv') {
      const csvRows = [
        ['Ürün ID', 'Barkod', 'SKU', 'Ürün Adı', 'Marka', 'Kategori', 'Birim Fiyat', 'Satış Adedi', 'Toplam Gelir', 'Sipariş Sayısı', 'Mevcut Stok'].join(',')
      ];
      
      for (const product of productSales) {
        csvRows.push([
          product.id,
          product.barcode || '',
          product.sku || '',
          `"${(product.productName || '').replace(/"/g, '""')}"`,
          `"${(product.brand || '').replace(/"/g, '""')}"`,
          `"${(product.category || '').replace(/"/g, '""')}"`,
          product.unitPrice,
          product.totalQuantitySold,
          product.totalRevenue,
          product.orderCount,
          product.currentStock
        ].join(','));
      }
      
      const csvContent = csvRows.join('\n');
      
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="urun-satis-raporu-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    return NextResponse.json(reportData);
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json({ error: 'Rapor oluşturulamadı' }, { status: 500 });
  }
}





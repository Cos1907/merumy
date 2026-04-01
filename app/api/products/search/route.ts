import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';
    const brand = searchParams.get('brand') || '';
    const sort = searchParams.get('sort') || '';

    let sql = `
      SELECT 
        p.id, p.name, p.slug, p.price, p.compare_price as originalPrice, 
        p.image, p.brand, p.category, p.stock_status as stockStatus, 
        p.stock, p.description,
        CASE WHEN p.stock_status = 'out_of_stock' OR p.stock = 0 THEN 1 ELSE 0 END as is_out_of_stock
      FROM products p
      WHERE p.is_active = 1
    `;
    const params: (string | number)[] = [];

    if (q) {
      const searchTerm = '%' + q.toLowerCase() + '%';
      sql += ' AND (LOWER(p.name) LIKE ? OR LOWER(p.description) LIKE ? OR LOWER(p.brand) LIKE ? OR LOWER(p.category) LIKE ?)';
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    if (category) {
      sql += ' AND p.category = ?';
      params.push(category);
    }
    if (brand) {
      sql += ' AND LOWER(p.brand) = LOWER(?)';
      params.push(brand);
    }

    // Sort: always put out-of-stock last
    if (sort === 'price_asc') {
      sql += ' ORDER BY is_out_of_stock ASC, p.price ASC';
    } else if (sort === 'price_desc') {
      sql += ' ORDER BY is_out_of_stock ASC, p.price DESC';
    } else if (sort === 'name_asc') {
      sql += ' ORDER BY is_out_of_stock ASC, p.name ASC';
    } else {
      sql += ' ORDER BY is_out_of_stock ASC, p.name ASC';
    }
    sql += ' LIMIT 200';

    const products = await query<any[]>(sql, params);

    const productsFormatted = products.map(p => ({
      ...p,
      inStock: p.stockStatus !== 'out_of_stock' && p.stock > 0,
      price: Number(p.price),
      originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
    }));

    return NextResponse.json({ products: productsFormatted });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: 'Arama yapılamadı' }, { status: 500 });
  }
}

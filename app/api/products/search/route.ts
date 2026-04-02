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
    const limit = Math.min(Number(searchParams.get('limit') || 60), 200);

    let sql = `
      SELECT 
        p.id, p.name, p.slug, p.price, p.compare_price as originalPrice, 
        p.image_path as image, p.brand, p.category, 
        p.stock_status as stockStatus, p.stock, p.description, p.barcode,
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

    if (sort === 'price_asc') {
      sql += ' ORDER BY is_out_of_stock ASC, p.price ASC';
    } else if (sort === 'price_desc') {
      sql += ' ORDER BY is_out_of_stock ASC, p.price DESC';
    } else {
      sql += ' ORDER BY is_out_of_stock ASC, p.name ASC';
    }
    sql += ` LIMIT ${limit}`;

    const products = await query<any[]>(sql, params);

    const productsFormatted = products.map(p => ({
      id: String(p.id || p.barcode),
      name: p.name || '',
      slug: p.slug || '',
      price: Number(p.price),
      originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
      image: p.image || '',
      brand: p.brand || '',
      category: p.category || '',
      inStock: p.stockStatus !== 'out_of_stock' && p.stock > 0,
      stock: Number(p.stock) || 0,
      description: p.description || '',
    }));

    // Get matching brands
    let brandRows: any[] = [];
    if (q) {
      brandRows = await query<any[]>(
        `SELECT DISTINCT brand FROM products WHERE brand LIKE ? AND is_active = 1 ORDER BY brand LIMIT 10`,
        ['%' + q + '%']
      );
    }
    const brands = brandRows.map((r: any) => r.brand);

    return NextResponse.json({ products: productsFormatted, brands });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ products: [], brands: [] }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get('q') || '').trim();
    const brand = (searchParams.get('brand') || '').trim();
    const category = (searchParams.get('category') || '').trim();
    const sort = searchParams.get('sort') || '';
    const limit = Math.min(Number(searchParams.get('limit') || 60), 200);

    const where: string[] = [ 'p.is_active = 1' ];
    const params: any[] = [];

    if (q) {
      const like = '%' + q.toLowerCase() + '%';
      where.push('(LOWER(p.name) LIKE ? OR LOWER(p.description) LIKE ? OR LOWER(b.name) LIKE ? OR LOWER(p.category) LIKE ? )');
      params.push(like, like, like, like);
    }
    if (brand) {
      where.push('LOWER(b.name) = LOWER(?)');
      params.push(brand);
    }
    if (category) {
      where.push('LOWER(p.category) = LOWER(?)');
      params.push(category);
    }

    let order = 'ORDER BY is_out_of_stock ASC, p.name ASC';
    if (sort === 'price_asc') order = 'ORDER BY is_out_of_stock ASC, p.price ASC';
    if (sort === 'price_desc') order = 'ORDER BY is_out_of_stock ASC, p.price DESC';

    const sql = `
      SELECT 
        p.id,
        p.name,
        p.slug,
        p.price,
        p.compare_price AS originalPrice,
        COALESCE(pi.image_url, '') AS image,
        COALESCE(b.name, '') AS brand,
        p.category,
        p.stock_status AS stockStatus,
        p.stock,
        p.description,
        p.barcode,
        CASE WHEN p.stock_status = 'out_of_stock' OR p.stock = 0 THEN 1 ELSE 0 END AS is_out_of_stock
      FROM products p
      LEFT JOIN brands b ON b.id = p.brand_id AND b.is_active = 1
      LEFT JOIN (
        SELECT x.product_id, x.image_url
        FROM product_images x
        WHERE x.is_primary = 1
      ) pi ON pi.product_id = p.id
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
      ${order}
      LIMIT ${limit}
    `;

    const rows = await query<any[]>(sql, params);

    const products = rows.map(p => ({
      id: String(p.id || p.barcode),
      name: p.name || '',
      slug: p.slug || '',
      price: Number(p.price || 0),
      originalPrice: p.originalPrice != null ? Number(p.originalPrice) : null,
      image: p.image || '',
      brand: p.brand || '',
      category: p.category || '',
      inStock: p.stockStatus !== 'out_of_stock' && Number(p.stock || 0) > 0,
      stock: Number(p.stock || 0),
      description: p.description || '',
    }));

    // Brand suggestions
    let brands: string[] = [];
    if (q) {
      const bRows = await query<any[]>(
        `SELECT DISTINCT name FROM brands WHERE is_active = 1 AND LOWER(name) LIKE ? ORDER BY name LIMIT 10`,
        ['%' + q.toLowerCase() + '%']
      );
      brands = bRows.map(b => b.name);
    }

    return NextResponse.json({ products, brands });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ products: [], brands: [] }, { status: 500 });
  }
}

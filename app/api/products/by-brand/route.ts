import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const brandName = searchParams.get('brand');

    if (!brandName) {
      return NextResponse.json({ error: 'Marka adı gerekli' }, { status: 400 });
    }

    const products = await query<any[]>(
      `SELECT p.id, p.name, p.slug, p.price, p.compare_price as originalPrice,
              p.stock_status as stockStatus, p.stock, p.description, p.category,
              b.name as brand,
              (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id AND pi.is_primary = 1 LIMIT 1) as image,
              CASE WHEN p.stock_status = 'out_of_stock' OR p.stock = 0 THEN 1 ELSE 0 END as is_out_of_stock
       FROM products p
       LEFT JOIN brands b ON b.id = p.brand_id
       WHERE LOWER(b.name) = LOWER(?) AND p.is_active = 1
       ORDER BY is_out_of_stock ASC, p.name ASC`,
      [brandName]
    );

    const productsFormatted = products.map(p => ({
      ...p,
      inStock: p.stockStatus !== 'out_of_stock' && p.stock > 0,
      price: Number(p.price),
      originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
    }));

    return NextResponse.json({ products: productsFormatted });
  } catch (error) {
    console.error('Products by Brand API error:', error);
    return NextResponse.json({ error: 'Ürünler getirilemedi' }, { status: 500 });
  }
}

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
      `SELECT id, name, slug, price, compare_price as originalPrice, image, brand, category,
              stock_status as stockStatus, stock, description,
              CASE WHEN stock_status = 'out_of_stock' OR stock = 0 THEN 1 ELSE 0 END as is_out_of_stock
       FROM products
       WHERE LOWER(brand) = LOWER(?) AND is_active = 1
       ORDER BY is_out_of_stock ASC, name ASC`,
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

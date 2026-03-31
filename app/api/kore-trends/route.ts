import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section') || 'kore_trend';
    const limit = parseInt(searchParams.get('limit') || '30');

    const products = await query<any[]>(
      `SELECT 
        p.id, p.slug, p.name, p.price, p.compare_price as originalPrice,
        p.stock_status as stockStatus, p.stock,
        b.name as brand,
        p.barcode,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = TRUE LIMIT 1) as primaryImage,
        (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC LIMIT 1) as anyImage
       FROM kore_trend_products k
       JOIN products p ON k.product_id = p.id
       LEFT JOIN brands b ON p.brand_id = b.id
       WHERE k.section = ? AND p.is_active = 1
       ORDER BY RAND()
       LIMIT ${limit}`,
      [section]
    );

    // Map to frontend product format
    const mapped = products.map((p: any) => {
      const imageUrl = p.primaryImage || p.anyImage || null;
      return {
        id: String(p.barcode),
        slug: p.slug,
        name: p.name,
        price: Number(p.price),
        originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
        inStock: p.stockStatus !== 'out_of_stock',
        stock: p.stock,
        brand: p.brand || '',
        barcode: p.barcode || '',
        image: imageUrl,
        images: imageUrl ? [imageUrl] : [],
      };
    });

    const response = NextResponse.json({ products: mapped, total: mapped.length });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    return response;
  } catch (error) {
    console.error('Error fetching kore trends:', error);
    return NextResponse.json({ products: [], total: 0 }, { status: 500 });
  }
}


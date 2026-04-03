import { NextRequest, NextResponse } from 'next/server'
import { query } from '../../lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const section = searchParams.get('section') || 'kore-trendleri'
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 50)

    // Map section names to tag values in the database
    const sectionTagMap: Record<string, string> = {
      'kore-trendleri': 'kore-trendleri',
      'kore_trend': 'kore_trend',
      'bestsellers': 'bestseller',
      'bestseller': 'bestseller',
      'new-arrivals': 'new-arrival',
      'exclusive': 'exclusive',
      'special-offers': 'special-offer',
    }

    const tag = sectionTagMap[section] || section

    // Fetch products with this section tag, or fallback to featured/latest
    let products = await query<any[]>(
      `SELECT p.barcode, p.name, b.name as brand, b.logo_url as brandLogo,
              p.category, p.price, p.compare_price,
              (SELECT pi.image_url FROM product_images pi
               WHERE pi.product_id = p.id AND pi.is_primary = 1 LIMIT 1) as image,
              p.slug, p.description, p.stock_status, p.stock
       FROM products p
       LEFT JOIN brands b ON b.id = p.brand_id
       WHERE p.is_active = 1 AND (p.tags LIKE ? OR FIND_IN_SET(?, p.tags))
       ORDER BY CASE WHEN p.stock_status = 'out_of_stock' THEN 1 ELSE 0 END ASC, p.id DESC
       LIMIT ${limit}`,
      [`%${tag}%`, tag]
    )

    // Fallback: if no tagged products, return featured or latest products
    if (!products || products.length === 0) {
      if (section === 'bestsellers') {
        products = await query<any[]>(
          `SELECT p.barcode, p.name, b.name as brand, b.logo_url as brandLogo,
                  p.category, p.price, p.compare_price,
                  (SELECT pi.image_url FROM product_images pi
                   WHERE pi.product_id = p.id AND pi.is_primary = 1 LIMIT 1) as image,
                  p.slug, p.description, p.stock_status, p.stock
           FROM products p
           LEFT JOIN brands b ON b.id = p.brand_id
           WHERE p.is_active = 1 AND p.is_featured = 1
           ORDER BY CASE WHEN p.stock_status = 'out_of_stock' THEN 1 ELSE 0 END ASC, p.id DESC
           LIMIT ${limit}`
        )
      } else {
        products = await query<any[]>(
          `SELECT p.barcode, p.name, b.name as brand, b.logo_url as brandLogo,
                  p.category, p.price, p.compare_price,
                  (SELECT pi.image_url FROM product_images pi
                   WHERE pi.product_id = p.id AND pi.is_primary = 1 LIMIT 1) as image,
                  p.slug, p.description, p.stock_status, p.stock
           FROM products p
           LEFT JOIN brands b ON b.id = p.brand_id
           WHERE p.is_active = 1
           ORDER BY CASE WHEN p.stock_status = 'out_of_stock' THEN 1 ELSE 0 END ASC, p.id DESC
           LIMIT ${limit}`
        )
      }
    }

    const mapped = (products || []).map((p: any) => ({
      id: String(p.barcode || p.id || ''),
      name: p.name || '',
      brand: p.brand || '',
      brandLogo: p.brandLogo || null,
      category: p.category || '',
      price: Number(p.price) || 0,
      originalPrice: Number(p.compare_price) || 0,
      image: p.image || '',
      slug: p.slug || String(p.barcode || ''),
      description: p.description || '',
      inStock: p.stock_status !== 'out_of_stock',
      stock: Number(p.stock) || 0,
    }))

    return NextResponse.json({ products: mapped })
  } catch (error) {
    console.error('Kore trends API error:', error)
    return NextResponse.json({ products: [] })
  }
}

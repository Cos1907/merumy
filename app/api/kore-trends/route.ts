import { NextRequest, NextResponse } from 'next/server'
import { query } from '../../lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const section = searchParams.get('section') || 'kore_trend'
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 200)

    // Map incoming section names to DB section names in kore_trend_products
    const sectionMap: Record<string, string> = {
      'kore-trendleri': 'kore_trend',
      'kore_trend': 'kore_trend',
      'makeup': 'makeup',
      'bestsellers': 'bestsellers',
      'bestseller': 'bestsellers',
      'exclusive': 'exclusive',
      'merumy_exclusive': 'exclusive',
      'special-offers': 'special-offer',
    }
    const dbSection = sectionMap[section] || section

    // First try: read from curated kore_trend_products table (admin panel managed)
    let products = await query<any[]>(
      `SELECT k.product_id, k.added_at,
              p.barcode, p.name, b.name as brand, b.logo_url as brandLogo,
              p.category, p.price, p.compare_price,
              (SELECT pi.image_url FROM product_images pi
               WHERE pi.product_id = p.id AND pi.is_primary = 1 LIMIT 1) as image,
              p.slug, p.description, p.stock_status, p.stock
       FROM kore_trend_products k
       JOIN products p ON k.product_id = p.id AND p.is_active = 1
       LEFT JOIN brands b ON b.id = p.brand_id
       WHERE k.section = ?
       ORDER BY CASE WHEN p.stock_status = 'out_of_stock' THEN 1 ELSE 0 END ASC, RAND()
       LIMIT ${limit}`,
      [dbSection]
    )

    // Fallback: if no curated products, use tag-based search or featured/latest
    if (!products || products.length === 0) {
      const tagFallback: Record<string, string> = {
        'kore_trend': 'kore_trend',
        'bestsellers': 'bestseller',
        'exclusive': 'exclusive',
        'makeup': 'makeup',
      }
      const tag = tagFallback[dbSection] || dbSection

      products = await query<any[]>(
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
    }

    // Last resort: return featured or latest products
    if (!products || products.length === 0) {
      products = await query<any[]>(
        `SELECT p.barcode, p.name, b.name as brand, b.logo_url as brandLogo,
                p.category, p.price, p.compare_price,
                (SELECT pi.image_url FROM product_images pi
                 WHERE pi.product_id = p.id AND pi.is_primary = 1 LIMIT 1) as image,
                p.slug, p.description, p.stock_status, p.stock
         FROM products p
         LEFT JOIN brands b ON b.id = p.brand_id
         WHERE p.is_active = 1
         ORDER BY CASE WHEN p.stock_status = 'out_of_stock' THEN 1 ELSE 0 END ASC,
                  p.is_featured DESC, p.id DESC
         LIMIT ${limit}`
      )
    }

    const mapped = (products || []).map((p: any) => ({
      id: String(p.barcode || p.id || ''),
      name: p.name || '',
      brand: p.brand || '',
      brandLogo: p.brandLogo || null,
      category: p.category || '',
      price: Number(p.price) || 0,
      originalPrice: p.compare_price && Number(p.compare_price) > 0 ? Number(p.compare_price) : null,
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

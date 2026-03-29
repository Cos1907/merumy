import { NextResponse } from 'next/server'
import { query } from '../../../lib/db'

export const dynamic = 'force-dynamic'

// URL slug → DB'deki category varchar değeri
const SLUG_TO_DB_CATEGORY: Record<string, string> = {
  'cilt-bakimi':            'Cilt Bakımı',
  'sac-bakimi':             'Saç Bakımı',
  'makyaj':                 'Makyaj',
  'kisisel-bakim':          'Kişisel Bakım',
  'mask-bar':               'Mask Bar',
  'bebek-ve-cocuk-bakimi':  'Bebek ve Çocuk Bakımı',
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const categorySlug = searchParams.get('category') || ''

    if (!categorySlug) {
      return NextResponse.json({ products: [], brands: [] }, { status: 400 })
    }

    const dbCategory = SLUG_TO_DB_CATEGORY[categorySlug]
    if (!dbCategory) {
      return NextResponse.json({ products: [], brands: [] }, { status: 200 })
    }

    // DB'den ürünleri çek
    const rows = await query<any[]>(
      `SELECT
         p.id,
         p.slug,
         p.name,
         p.description,
         p.price,
         p.compare_price    AS originalPrice,
         p.stock,
         p.stock_status,
         p.category,
         b.name             AS brand,
         (
           SELECT pi2.image_url
           FROM product_images pi2
           WHERE pi2.product_id = p.id
           ORDER BY pi2.is_primary DESC, pi2.sort_order ASC, pi2.id ASC
           LIMIT 1
         ) AS image
       FROM products p
       LEFT JOIN brands b ON b.id = p.brand_id
       WHERE p.category = ?
         AND p.is_active = 1
       ORDER BY p.name ASC`,
      [dbCategory]
    )

    const products = rows.map((r: any) => ({
      id: String(r.id),
      slug: r.slug || '',
      name: r.name || '',
      description: r.description || '',
      price: Number(r.price) || 0,
      originalPrice: r.originalPrice ? Number(r.originalPrice) : null,
      stock: Number(r.stock) || 0,
      inStock: r.stock_status !== 'out_of_stock' && Number(r.stock) > 0,
      brand: r.brand || '',
      category: categorySlug,
      image: r.image || '',
      barcode: '',
    }))

    const brands = Array.from(new Set(products.map((p: any) => p.brand).filter(Boolean))).sort() as string[]

    return NextResponse.json(
      { products, brands },
      { status: 200, headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' } }
    )
  } catch (err) {
    console.error('by-category API error:', err)
    return NextResponse.json({ products: [], brands: [], error: String(err) }, { status: 500 })
  }
}

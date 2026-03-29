import { NextResponse } from 'next/server'
import { query } from '../../../lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const categorySlug = searchParams.get('category') || ''

    if (!categorySlug) {
      return NextResponse.json({ products: [], brands: [] }, { status: 400 })
    }

    // Ürünleri DB'den çek: ürün + marka + kategori + birincil görsel
    const rows = await query<any[]>(
      `SELECT
         p.id,
         p.slug,
         p.name,
         p.description,
         p.price,
         p.compare_price        AS originalPrice,
         p.stock,
         p.stock_status,
         b.name                 AS brand,
         c.slug                 AS category,
         (
           SELECT pi2.image_url
           FROM product_images pi2
           WHERE pi2.product_id = p.id
           ORDER BY pi2.is_primary DESC, pi2.sort_order ASC, pi2.id ASC
           LIMIT 1
         ) AS image
       FROM products p
       LEFT JOIN brands    b ON b.id = p.brand_id
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE c.slug = ?
         AND p.is_active = 1
       ORDER BY p.name ASC`,
      [categorySlug]
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
      category: r.category || categorySlug,
      image: r.image || '',
      barcode: '',
    }))

    // Marka listesini çıkar
    const brands = Array.from(new Set(products.map((p: any) => p.brand).filter(Boolean))).sort()

    return NextResponse.json(
      { products, brands },
      {
        status: 200,
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
      }
    )
  } catch (err) {
    console.error('by-category API error:', err)
    return NextResponse.json({ products: [], brands: [], error: String(err) }, { status: 500 })
  }
}

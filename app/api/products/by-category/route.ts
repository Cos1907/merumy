import { NextResponse } from 'next/server'
import { query } from '../../../lib/db'
import productsJson from '../../../data/products.json'

export const dynamic = 'force-dynamic'

interface JsonProduct {
  id: string
  slug: string
  name: string
  brand: string
  category: string
  price: number
  originalPrice: number | null
  image: string
  description?: string
  inStock?: boolean
  stock?: number
  barcode?: string
}

const allJsonProducts = productsJson as JsonProduct[]

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const categorySlug = searchParams.get('category') || ''

    if (!categorySlug) {
      return NextResponse.json({ products: [], brands: [] }, { status: 400 })
    }

    // 1. JSON'dan bu kategoriye ait ürün slug'larını al
    const jsonInCategory = allJsonProducts.filter((p) => p.category === categorySlug)

    if (jsonInCategory.length === 0) {
      return NextResponse.json({ products: [], brands: [] }, { status: 200 })
    }

    const slugList = jsonInCategory.map((p) => p.slug)

    // 2. DB'den bu slug'lara ait canlı veriyi çek (fiyat, stok, marka, görsel)
    //    Slug sayısı fazla olabilir, chunklara böl (MySQL IN limit)
    const CHUNK = 200
    const dbRows: any[] = []
    for (let i = 0; i < slugList.length; i += CHUNK) {
      const chunk = slugList.slice(i, i + CHUNK)
      const placeholders = chunk.map(() => '?').join(',')
      const rows = await query<any[]>(
        `SELECT
           p.slug,
           p.name,
           p.description,
           p.price,
           p.compare_price    AS originalPrice,
           p.stock,
           p.stock_status,
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
         WHERE p.slug IN (${placeholders})
           AND p.is_active = 1`,
        chunk
      )
      dbRows.push(...rows)
    }

    // DB verilerini slug'a göre map'e al
    const dbMap: Record<string, any> = {}
    for (const row of dbRows) {
      dbMap[row.slug] = row
    }

    // 3. JSON + DB merge: DB'de varsa DB verisini kullan, yoksa JSON verisini
    const products = jsonInCategory.map((jp) => {
      const db = dbMap[jp.slug]
      return {
        id: jp.id,
        slug: jp.slug,
        name: db?.name ?? jp.name,
        description: db?.description ?? jp.description ?? '',
        price: db ? Number(db.price) : jp.price,
        originalPrice: db ? (db.originalPrice ? Number(db.originalPrice) : null) : jp.originalPrice,
        stock: db ? Number(db.stock) : (jp.stock ?? 0),
        inStock: db
          ? db.stock_status !== 'out_of_stock' && Number(db.stock) > 0
          : (jp.inStock !== false),
        brand: db?.brand ?? jp.brand,
        category: categorySlug,
        image: db?.image ?? jp.image ?? '',
        barcode: jp.barcode ?? '',
      }
    })

    // Marka listesini çıkar (brand'a göre sırala)
    const brands = Array.from(new Set(products.map((p) => p.brand).filter(Boolean))).sort()

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

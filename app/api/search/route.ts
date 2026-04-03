import { NextRequest, NextResponse } from 'next/server'
import { query } from '../../lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = (searchParams.get('q') || '').trim()
    const brand = searchParams.get('brand') || ''
    const category = searchParams.get('category') || ''
    // Inline limit in SQL to avoid mysql2 prepared statement LIMIT parameter issue
    const limitRaw = parseInt(searchParams.get('limit') || '60', 10)
    const limit = Math.min(isNaN(limitRaw) ? 60 : limitRaw, 200)

    let products: any[] = []

    // Fetch all brands with product count and logo
    const brandRows = await query<any[]>(
      `SELECT b.name, b.slug, b.logo_url, COUNT(*) as count,
              SUM(CASE WHEN p.stock_status = 'out_of_stock' THEN 0 ELSE 1 END) as inStock
       FROM brands b
       JOIN products p ON p.brand_id = b.id AND p.is_active = 1
       GROUP BY b.id, b.name, b.slug, b.logo_url
       ORDER BY count DESC`
    )
    const brands = brandRows

    if (brand) {
      // Brand filter - show all products from that brand (limit inlined for prepared statement compat)
      const rows = await query<any[]>(
        `SELECT p.barcode, p.name, b.name as brand, b.logo_url as brandLogo,
                p.category, p.price, p.compare_price,
                (SELECT pi.image_url FROM product_images pi 
                 WHERE pi.product_id = p.id AND pi.is_primary = 1 LIMIT 1) as image,
                p.slug, p.description, p.stock_status, p.stock
         FROM products p
         JOIN brands b ON b.id = p.brand_id
         WHERE p.is_active = 1 AND b.name = ?
         ORDER BY CASE WHEN p.stock_status = 'out_of_stock' THEN 1 ELSE 0 END ASC, p.id DESC
         LIMIT ${limit}`,
        [brand]
      )
      products = rows
    } else if (category) {
      // Category filter
      const rows = await query<any[]>(
        `SELECT p.barcode, p.name, b.name as brand, b.logo_url as brandLogo,
                p.category, p.price, p.compare_price,
                (SELECT pi.image_url FROM product_images pi 
                 WHERE pi.product_id = p.id AND pi.is_primary = 1 LIMIT 1) as image,
                p.slug, p.description, p.stock_status, p.stock
         FROM products p
         LEFT JOIN brands b ON b.id = p.brand_id
         WHERE p.is_active = 1 AND p.category = ?
         ORDER BY CASE WHEN p.stock_status = 'out_of_stock' THEN 1 ELSE 0 END ASC, p.id DESC
         LIMIT ${limit}`,
        [category]
      )
      products = rows
    } else if (q) {
      // Search query - search in name, brand name, description, category
      const searchTerm = '%' + q + '%'
      const rows = await query<any[]>(
        `SELECT p.barcode, p.name, b.name as brand, b.logo_url as brandLogo,
                p.category, p.price, p.compare_price,
                (SELECT pi.image_url FROM product_images pi 
                 WHERE pi.product_id = p.id AND pi.is_primary = 1 LIMIT 1) as image,
                p.slug, p.description, p.stock_status, p.stock,
                CASE
                  WHEN p.name LIKE ? THEN 3
                  WHEN b.name LIKE ? THEN 2
                  WHEN p.description LIKE ? THEN 1
                  ELSE 0
                END as relevance
         FROM products p
         LEFT JOIN brands b ON b.id = p.brand_id
         WHERE p.is_active = 1
           AND (p.name LIKE ? OR b.name LIKE ? OR p.description LIKE ? OR p.category LIKE ?)
         ORDER BY CASE WHEN p.stock_status = 'out_of_stock' THEN 1 ELSE 0 END ASC,
                  relevance DESC, p.id DESC
         LIMIT ${limit}`,
        [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm]
      )
      products = rows
    } else {
      // No query - return popular/latest products
      const rows = await query<any[]>(
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
      products = rows
    }

    // Map products
    const mapped = products.map((p: any) => ({
      id: String(p.barcode || p.id),
      name: p.name || '',
      brand: p.brand || '',
      brandLogo: p.brandLogo || null,
      category: p.category || '',
      price: Number(p.price) || 0,
      originalPrice: Number(p.compare_price) || 0,
      image: p.image || '',
      slug: p.slug || String(p.barcode),
      description: p.description || '',
      inStock: p.stock_status !== 'out_of_stock',
      stock: Number(p.stock) || 0,
    }))

    return NextResponse.json({ products: mapped, brands })
  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json({ products: [], brands: [] }, { status: 500 })
  }
}

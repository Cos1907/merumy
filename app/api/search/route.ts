import { NextRequest, NextResponse } from 'next/server'
import { query } from '../../lib/db'

export const dynamic = 'force-dynamic'

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/\u0131/g, 'i')
    .replace(/\u0130/g, 'i')
    .replace(/\u015f/g, 's')
    .replace(/\u015e/g, 's')
    .replace(/\u011f/g, 'g')
    .replace(/\u011e/g, 'g')
    .replace(/\u00fc/g, 'u')
    .replace(/\u00dc/g, 'u')
    .replace(/\u00f6/g, 'o')
    .replace(/\u00d6/g, 'o')
    .replace(/\u00e7/g, 'c')
    .replace(/\u00c7/g, 'c')
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = (searchParams.get('q') || '').trim()
    const brand = searchParams.get('brand') || ''
    const limit = Math.min(Number(searchParams.get('limit') || 60), 200)

    let products: any[] = []
    let brands: any[] = []

    // Fetch all brands with product count
    const brandRows = await query<any[]>(
      `SELECT brand, COUNT(*) as count, 
              SUM(CASE WHEN stock_status = 'out_of_stock' THEN 0 ELSE 1 END) as inStock
       FROM products WHERE brand IS NOT NULL AND brand != '' 
       GROUP BY brand ORDER BY count DESC`
    )
    brands = brandRows

    if (brand) {
      // Brand filter - show all products from that brand
      const rows = await query<any[]>(
        `SELECT barcode, name, brand, category, price, compare_price as originalPrice, 
                image_path as image, slug, description,
                CASE WHEN stock_status = 'in_stock' OR (stock > 0 AND stock_status != 'out_of_stock') THEN TRUE ELSE FALSE END as inStock,
                stock
         FROM products WHERE brand = ? ORDER BY stock_status ASC, id DESC LIMIT ?`,
        [brand, limit]
      )
      products = rows
    } else if (q) {
      // Search query - search in name, brand, description, category
      const searchTerm = '%' + q + '%'
      const rows = await query<any[]>(
        `SELECT barcode, name, brand, category, price, compare_price as originalPrice,
                image_path as image, slug, description,
                CASE WHEN stock_status = 'in_stock' OR (stock > 0 AND stock_status != 'out_of_stock') THEN TRUE ELSE FALSE END as inStock,
                stock,
                CASE 
                  WHEN name LIKE ? THEN 3
                  WHEN brand LIKE ? THEN 2
                  WHEN description LIKE ? THEN 1
                  ELSE 0
                END as relevance
         FROM products 
         WHERE name LIKE ? OR brand LIKE ? OR description LIKE ? OR category LIKE ?
         ORDER BY CASE WHEN stock_status = 'out_of_stock' THEN 1 ELSE 0 END ASC, relevance DESC, id DESC
         LIMIT ?`,
        [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, limit]
      )
      products = rows
    } else {
      // No query - return popular/latest products
      const rows = await query<any[]>(
        `SELECT barcode, name, brand, category, price, compare_price as originalPrice,
                image_path as image, slug, description,
                CASE WHEN stock_status = 'in_stock' OR (stock > 0 AND stock_status != 'out_of_stock') THEN TRUE ELSE FALSE END as inStock,
                stock
         FROM products 
         ORDER BY CASE WHEN stock_status = 'out_of_stock' THEN 1 ELSE 0 END ASC, id DESC
         LIMIT ?`,
        [limit]
      )
      products = rows
    }

    // Map products
    const mapped = products.map((p: any) => ({
      id: String(p.barcode),
      name: p.name || '',
      brand: p.brand || '',
      category: p.category || '',
      price: Number(p.price) || 0,
      originalPrice: Number(p.originalPrice) || 0,
      image: p.image || '',
      slug: p.slug || String(p.barcode),
      description: p.description || '',
      inStock: Boolean(p.inStock),
      stock: Number(p.stock) || 0,
    }))

    return NextResponse.json({ products: mapped, brands })
  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json({ products: [], brands: [] }, { status: 500 })
  }
}

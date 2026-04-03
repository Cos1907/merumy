import { NextResponse } from 'next/server'
import { query } from '../../lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Fetch categories with their brands from DB
    const rows = await query<any[]>(
      `SELECT DISTINCT p.category, b.name as brand, b.logo_url, b.slug as brandSlug
       FROM products p
       JOIN brands b ON b.id = p.brand_id
       WHERE p.is_active = 1 AND p.category IS NOT NULL AND b.is_active = 1
       ORDER BY p.category, b.name`
    )

    // Group brands by category
    const categoryMap: Record<string, { brand: string; logo_url: string; brandSlug: string }[]> = {}
    for (const row of rows) {
      if (!categoryMap[row.category]) {
        categoryMap[row.category] = []
      }
      // Avoid duplicates
      if (!categoryMap[row.category].find((b) => b.brand === row.brand)) {
        categoryMap[row.category].push({
          brand: row.brand,
          logo_url: row.logo_url || '',
          brandSlug: row.brandSlug || '',
        })
      }
    }

    // Top brands for carousel (by product count)
    const topBrands = await query<any[]>(
      `SELECT b.name, b.slug, b.logo_url, COUNT(p.id) as productCount
       FROM brands b
       JOIN products p ON p.brand_id = b.id AND p.is_active = 1
       WHERE b.is_active = 1
       GROUP BY b.id, b.name, b.slug, b.logo_url
       ORDER BY productCount DESC
       LIMIT 20`
    )

    return NextResponse.json({ categories: categoryMap, topBrands })
  } catch (error) {
    console.error('Nav data error:', error)
    return NextResponse.json({ categories: {}, topBrands: [] })
  }
}

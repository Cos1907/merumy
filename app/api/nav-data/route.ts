import { NextResponse } from 'next/server'
import { query } from '../../lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Get categories with their brands from DB
    const rows = await query<any[]>(
      `SELECT p.category, b.name as brand, COUNT(*) as cnt
       FROM products p
       LEFT JOIN brands b ON b.id = p.brand_id AND b.is_active = 1
       WHERE p.is_active = 1 AND p.category IS NOT NULL AND p.category != ''
         AND b.name IS NOT NULL AND b.name != ''
       GROUP BY p.category, b.name
       ORDER BY p.category, cnt DESC`,
      []
    )

    const categoryBrands: Record<string, string[]> = {}
    for (const row of rows) {
      if (!categoryBrands[row.category]) categoryBrands[row.category] = []
      if (categoryBrands[row.category].length < 8) {
        categoryBrands[row.category].push(row.brand)
      }
    }

    // Get top brands for carousel
    const brandRows = await query<any[]>(
      `SELECT b.name, COUNT(*) as cnt
       FROM products p
       JOIN brands b ON b.id = p.brand_id AND b.is_active = 1
       WHERE p.is_active = 1
       GROUP BY b.name
       ORDER BY cnt DESC
       LIMIT 40`,
      []
    )
    const brands = brandRows.map(b => ({ name: b.name, count: Number(b.cnt) }))

    return NextResponse.json({ categoryBrands, brands })
  } catch (error) {
    console.error('Nav data error:', error)
    return NextResponse.json({ categoryBrands: {}, brands: [] })
  }
}

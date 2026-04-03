import { NextResponse } from 'next/server'
import { query } from '../../lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const brands = await query<any[]>(
      `SELECT b.name, b.slug, b.logo_url, COUNT(p.id) as productCount
       FROM brands b
       LEFT JOIN products p ON p.brand_id = b.id AND p.is_active = 1
       WHERE b.is_active = 1
       GROUP BY b.id, b.name, b.slug, b.logo_url
       ORDER BY productCount DESC`
    )
    return NextResponse.json({ brands })
  } catch (error) {
    console.error('Brands API error:', error)
    return NextResponse.json({ brands: [] })
  }
}

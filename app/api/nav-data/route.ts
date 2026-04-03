import { NextResponse } from 'next/server'
import { query } from '../../lib/db'

export const dynamic = 'force-dynamic'

// Kategori adına göre slug oluştur
function categoryToSlug(name: string): string {
  const mapping: Record<string, string> = {
    'Cilt Bakımı': 'cilt-bakimi',
    'Saç Bakımı': 'sac-bakimi',
    'Makyaj': 'makyaj',
    'Kişisel Bakım': 'kisisel-bakim',
    'Mask Bar': 'mask-bar',
    'Bebek ve Çocuk Bakımı': 'bebek-ve-cocuk-bakimi',
  }
  if (mapping[name]) return mapping[name]
  // Fallback: convert to slug manually
  return name
    .toLowerCase()
    .replace(/ş/g, 's').replace(/ğ/g, 'g').replace(/ü/g, 'u')
    .replace(/ö/g, 'o').replace(/ı/g, 'i').replace(/ç/g, 'c')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

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

    // Group brands by category (keeping insertion order for predictable sort)
    const categoryMap: Record<string, { name: string; logo_url: string }[]> = {}
    for (const row of rows) {
      if (!categoryMap[row.category]) {
        categoryMap[row.category] = []
      }
      if (!categoryMap[row.category].find((b) => b.name === row.brand)) {
        categoryMap[row.category].push({
          name: row.brand,
          logo_url: row.logo_url || '',
        })
      }
    }

    // Define desired category order
    const categoryOrder = [
      'Cilt Bakımı',
      'Saç Bakımı',
      'Makyaj',
      'Kişisel Bakım',
      'Mask Bar',
      'Bebek ve Çocuk Bakımı',
    ]

    // Build categories array in the format Header expects
    const allCategoryNames = [
      ...categoryOrder.filter((c) => categoryMap[c]),
      ...Object.keys(categoryMap).filter((c) => !categoryOrder.includes(c)),
    ]

    const categories = allCategoryNames.map((name, idx) => ({
      id: idx + 1,
      name,
      slug: categoryToSlug(name),
      brands: (categoryMap[name] || []).map((b) => ({
        name: b.name,
        logo_url: b.logo_url || null,
      })),
    }))

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

    return NextResponse.json({ categories, topBrands })
  } catch (error) {
    console.error('Nav data error:', error)
    return NextResponse.json({ categories: [], topBrands: [] })
  }
}

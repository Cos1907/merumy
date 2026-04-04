import { NextRequest, NextResponse } from 'next/server'
import { query, execute, queryOne } from '../../../lib/db'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

async function checkAdminSession() {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('admin_session')?.value
    if (!sessionToken) return null
    const session = await queryOne<any>(
      `SELECT s.*, u.email, u.name, u.role, u.allowed_sections
       FROM admin_sessions s
       LEFT JOIN admin_users u ON u.id = s.user_id
       WHERE s.session_token = ? AND s.expires_at > NOW()`,
      [sessionToken]
    )
    return session || null
  } catch {
    return null
  }
}

// GET - List all coupons
export async function GET(request: NextRequest) {
  try {
    const session = await checkAdminSession()
    if (!session) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const active = searchParams.get('active')

    let whereClause = ''
    const params: any[] = []
    if (active === 'true') {
      whereClause = 'WHERE is_active = 1 AND (expires_at IS NULL OR expires_at > NOW())'
    } else if (active === 'false') {
      whereClause = 'WHERE is_active = 0 OR (expires_at IS NOT NULL AND expires_at <= NOW())'
    }

    const coupons = await query<any[]>(
      `SELECT c.*,
              b.name as brand_name,
              u.name as user_name, u.email as user_email
       FROM coupons c
       LEFT JOIN brands b ON b.id = c.brand_id
       LEFT JOIN users u ON u.id = c.user_id
       ${whereClause}
       ORDER BY c.created_at DESC`
    , params)

    return NextResponse.json({ coupons })
  } catch (error) {
    console.error('Coupons GET error:', error)
    return NextResponse.json({ error: 'Kuponlar getirilemedi' }, { status: 500 })
  }
}

// POST - Create new coupon
export async function POST(request: NextRequest) {
  try {
    const session = await checkAdminSession()
    if (!session) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

    const body = await request.json()
    const {
      code, description, discountType, discountValue,
      minOrderAmount, maxDiscountAmount,
      usageLimit, brandId, userId,
      expiresAt, isActive,
    } = body

    if (!code || !discountType || discountValue === undefined) {
      return NextResponse.json({ error: 'Kod, indirim tipi ve değer zorunludur' }, { status: 400 })
    }

    // Check duplicate
    const existing = await queryOne<any>('SELECT id FROM coupons WHERE code = ?', [code.toUpperCase()])
    if (existing) return NextResponse.json({ error: 'Bu kupon kodu zaten mevcut' }, { status: 409 })

    await execute(
      `INSERT INTO coupons (code, description, discount_type, discount_value,
        min_order_amount, max_discount_amount, usage_limit, brand_id, user_id,
        expires_at, is_active, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        code.toUpperCase(),
        description || null,
        discountType,
        discountValue,
        minOrderAmount || null,
        maxDiscountAmount || null,
        usageLimit || null,
        brandId || null,
        userId || null,
        expiresAt || null,
        isActive !== false ? 1 : 0,
        session.user_id || null,
      ]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Coupons POST error:', error)
    return NextResponse.json({ error: 'Kupon oluşturulamadı' }, { status: 500 })
  }
}

// PATCH - Update coupon
export async function PATCH(request: NextRequest) {
  try {
    const session = await checkAdminSession()
    if (!session) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

    const body = await request.json()
    const { id, isActive } = body

    if (!id) return NextResponse.json({ error: 'ID gerekli' }, { status: 400 })

    if (isActive !== undefined) {
      await execute('UPDATE coupons SET is_active = ? WHERE id = ?', [isActive ? 1 : 0, id])
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Coupons PATCH error:', error)
    return NextResponse.json({ error: 'Güncelleme başarısız' }, { status: 500 })
  }
}

// DELETE - Delete coupon
export async function DELETE(request: NextRequest) {
  try {
    const session = await checkAdminSession()
    if (!session) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID gerekli' }, { status: 400 })

    await execute('DELETE FROM coupons WHERE id = ?', [id])
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Coupons DELETE error:', error)
    return NextResponse.json({ error: 'Silme başarısız' }, { status: 500 })
  }
}

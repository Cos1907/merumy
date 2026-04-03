import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { query, execute, queryOne } from '../../../lib/db'

async function checkAdminSession(): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('admin_session')?.value
    if (!sessionToken) return false
    const session = await queryOne<any>(
      'SELECT * FROM admin_sessions WHERE session_token = ? AND expires_at > NOW()',
      [sessionToken]
    )
    return !!session
  } catch {
    return false
  }
}

export async function GET(request: NextRequest) {
  const isAdmin = await checkAdminSession()
  if (!isAdmin) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  try {
    const codes = await query<any[]>(
      `SELECT dc.*, b.name as brandName
       FROM discount_codes dc
       LEFT JOIN brands b ON b.id = dc.brand_id
       ORDER BY dc.created_at DESC`
    )
    return NextResponse.json({ codes })
  } catch (error) {
    console.error('Discount codes GET error:', error)
    // Try without join if table structure is different
    try {
      const codes = await query<any[]>('SELECT * FROM discount_codes ORDER BY created_at DESC')
      return NextResponse.json({ codes })
    } catch {
      return NextResponse.json({ codes: [] })
    }
  }
}

export async function POST(request: NextRequest) {
  const isAdmin = await checkAdminSession()
  if (!isAdmin) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  try {
    const body = await request.json()
    const {
      code, type, value, minOrderAmount, maxDiscountAmount,
      brandId, usageLimit, userEmail, expiresAt, isActive
    } = body

    if (!code || !type || value === undefined) {
      return NextResponse.json({ error: 'Kod, tür ve değer zorunludur' }, { status: 400 })
    }

    // Check if code already exists
    const existing = await queryOne<any>('SELECT id FROM discount_codes WHERE code = ?', [code.toUpperCase()])
    if (existing) {
      return NextResponse.json({ error: 'Bu kod zaten kullanılıyor' }, { status: 409 })
    }

    const result = await execute(
      `INSERT INTO discount_codes 
       (code, type, value, min_order_amount, max_discount_amount, brand_id, usage_limit, user_email, expires_at, is_active, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        code.toUpperCase(), type, value,
        minOrderAmount || null, maxDiscountAmount || null,
        brandId || null, usageLimit || null, userEmail || null,
        expiresAt || null, isActive ?? true
      ]
    )

    return NextResponse.json({ success: true, id: result.insertId })
  } catch (error) {
    console.error('Discount codes POST error:', error)
    return NextResponse.json({ error: 'Oluşturma hatası' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const isAdmin = await checkAdminSession()
  if (!isAdmin) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  try {
    const body = await request.json()
    const {
      id, code, type, value, minOrderAmount, maxDiscountAmount,
      brandId, usageLimit, userEmail, expiresAt, isActive
    } = body

    if (!id) return NextResponse.json({ error: 'ID gerekli' }, { status: 400 })

    await execute(
      `UPDATE discount_codes SET
       code=?, type=?, value=?, min_order_amount=?, max_discount_amount=?,
       brand_id=?, usage_limit=?, user_email=?, expires_at=?, is_active=?
       WHERE id=?`,
      [
        code.toUpperCase(), type, value,
        minOrderAmount || null, maxDiscountAmount || null,
        brandId || null, usageLimit || null, userEmail || null,
        expiresAt || null, isActive ?? true, id
      ]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Discount codes PUT error:', error)
    return NextResponse.json({ error: 'Güncelleme hatası' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const isAdmin = await checkAdminSession()
  if (!isAdmin) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID gerekli' }, { status: 400 })

    await execute('DELETE FROM discount_codes WHERE id = ?', [id])
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Discount codes DELETE error:', error)
    return NextResponse.json({ error: 'Silme hatası' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { queryOne } from '../../../lib/db'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { code, cartTotal, userId } = await request.json()
    if (!code) return NextResponse.json({ error: 'Kupon kodu gerekli' }, { status: 400 })

    const coupon = await queryOne<any>(
      `SELECT c.*, b.name as brand_name
       FROM coupons c
       LEFT JOIN brands b ON b.id = c.brand_id
       WHERE c.code = ? AND c.is_active = 1
         AND (c.expires_at IS NULL OR c.expires_at > NOW())`,
      [code.toUpperCase()]
    )

    if (!coupon) return NextResponse.json({ error: 'Geçersiz veya süresi dolmuş kupon kodu' }, { status: 404 })

    // Check usage limit
    if (coupon.usage_limit !== null && coupon.used_count >= coupon.usage_limit) {
      return NextResponse.json({ error: 'Bu kupon kodunun kullanım limiti dolmuştur' }, { status: 400 })
    }

    // Check user restriction
    if (coupon.user_id && userId && coupon.user_id !== userId) {
      return NextResponse.json({ error: 'Bu kupon kodu size özel değildir' }, { status: 400 })
    }

    // Check min order amount
    if (coupon.min_order_amount && cartTotal < Number(coupon.min_order_amount)) {
      return NextResponse.json({
        error: `Bu kupon için minimum sepet tutarı ₺${Number(coupon.min_order_amount).toFixed(0)} olmalıdır`
      }, { status: 400 })
    }

    // Calculate discount
    let discountAmount = 0
    if (coupon.discount_type === 'fixed') {
      discountAmount = Number(coupon.discount_value)
    } else if (coupon.discount_type === 'percentage') {
      discountAmount = (cartTotal * Number(coupon.discount_value)) / 100
      if (coupon.max_discount_amount) {
        discountAmount = Math.min(discountAmount, Number(coupon.max_discount_amount))
      }
    }

    discountAmount = Math.min(discountAmount, cartTotal)

    return NextResponse.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discount_type,
        discountValue: Number(coupon.discount_value),
        discountAmount,
        minOrderAmount: coupon.min_order_amount ? Number(coupon.min_order_amount) : null,
        maxDiscountAmount: coupon.max_discount_amount ? Number(coupon.max_discount_amount) : null,
        brandName: coupon.brand_name || null,
      }
    })
  } catch (error) {
    console.error('Coupon validate error:', error)
    return NextResponse.json({ error: 'Kupon doğrulanamadı' }, { status: 500 })
  }
}

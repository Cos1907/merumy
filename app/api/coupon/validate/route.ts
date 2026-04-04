import { NextRequest, NextResponse } from 'next/server'
import { queryOne } from '../../../lib/db'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { code, cartTotal, userId } = await request.json()
    if (!code) return NextResponse.json({ error: 'Kupon kodu gerekli' }, { status: 400 })

    // Sadece admin panelinin yönettiği coupons tablosuna bak
    const coupon = await queryOne<any>(
      `SELECT c.*, b.name as brand_name
       FROM coupons c
       LEFT JOIN brands b ON b.id = c.brand_id
       WHERE c.code = ? AND c.is_active = 1
         AND (c.expires_at IS NULL OR c.expires_at > NOW())`,
      [code.toUpperCase()]
    )

    if (!coupon) {
      return NextResponse.json({ error: 'Geçersiz veya süresi dolmuş kupon kodu' }, { status: 404 })
    }

    // Kullanım limiti kontrolü
    const usageLimit = coupon.usage_limit ?? coupon.max_uses ?? null
    const usedCount = coupon.used_count ?? 0
    if (usageLimit !== null && usedCount >= usageLimit) {
      return NextResponse.json({ error: 'Bu kupon kodunun kullanım limiti dolmuştur' }, { status: 400 })
    }

    // Kullanıcıya özel kod kontrolü
    if (coupon.user_id && userId && coupon.user_id !== userId) {
      return NextResponse.json({ error: 'Bu kupon kodu size özel değildir' }, { status: 400 })
    }

    // Minimum sipariş tutarı kontrolü
    const minAmount = coupon.min_order_amount ?? coupon.min_amount ?? 0
    if (minAmount && cartTotal < Number(minAmount)) {
      return NextResponse.json({
        error: `Bu kupon için minimum sepet tutarı ₺${Number(minAmount).toFixed(0)} olmalıdır`
      }, { status: 400 })
    }

    // İndirim hesapla
    const discountType = coupon.discount_type || coupon.type || 'fixed'
    const discountValue = Number(coupon.discount_value ?? coupon.value ?? 0)

    let discountAmount = 0
    if (discountType === 'fixed' || discountType === 'amount') {
      discountAmount = discountValue
    } else if (discountType === 'percentage' || discountType === 'percent') {
      discountAmount = (cartTotal * discountValue) / 100
      const maxDiscount = coupon.max_discount_amount ?? null
      if (maxDiscount) {
        discountAmount = Math.min(discountAmount, Number(maxDiscount))
      }
    }

    discountAmount = Math.min(discountAmount, cartTotal)

    return NextResponse.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        description: coupon.description || null,
        discountType,
        discountValue,
        discountAmount,
        minOrderAmount: minAmount ? Number(minAmount) : null,
        maxDiscountAmount: coupon.max_discount_amount ? Number(coupon.max_discount_amount) : null,
        brandName: coupon.brand_name || null,
      }
    })
  } catch (error) {
    console.error('Coupon validate error:', error)
    return NextResponse.json({ error: 'Kupon doğrulanamadı' }, { status: 500 })
  }
}

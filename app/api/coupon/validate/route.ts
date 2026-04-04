import { NextRequest, NextResponse } from 'next/server'
import { queryOne } from '../../../lib/db'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { code, cartTotal, userId } = await request.json()
    if (!code) return NextResponse.json({ error: 'Kupon kodu gerekli' }, { status: 400 })

    // Önce admin panelinin yönettiği discount_codes tablosuna bak
    const discountCode = await queryOne<any>(
      `SELECT dc.*, b.name as brand_name
       FROM discount_codes dc
       LEFT JOIN brands b ON b.id = dc.brand_id
       WHERE dc.code = ? AND dc.is_active = 1
         AND (dc.expires_at IS NULL OR dc.expires_at > NOW())`,
      [code.toUpperCase()]
    )

    if (discountCode) {
      // Kullanım limiti kontrolü
      if (
        discountCode.usage_limit !== null &&
        discountCode.usage_limit !== undefined &&
        (discountCode.used_count || 0) >= Number(discountCode.usage_limit)
      ) {
        return NextResponse.json({ error: 'Bu kupon kodunun kullanım limiti dolmuştur' }, { status: 400 })
      }

      // E-posta bazlı kişisel kod kontrolü
      if (discountCode.user_email) {
        // userId varsa user'ın e-postasını DB'den çek
        if (userId) {
          const user = await queryOne<any>('SELECT email FROM users WHERE uuid = ? OR id = ? LIMIT 1', [userId, userId])
          if (!user || user.email.toLowerCase() !== discountCode.user_email.toLowerCase()) {
            return NextResponse.json({ error: 'Bu kupon kodu size özel değildir' }, { status: 400 })
          }
        } else {
          return NextResponse.json({ error: 'Bu kupon kodu size özel değildir' }, { status: 400 })
        }
      }

      // Minimum sipariş tutarı kontrolü
      if (discountCode.min_order_amount && cartTotal < Number(discountCode.min_order_amount)) {
        return NextResponse.json({
          error: `Bu kupon için minimum sepet tutarı ₺${Number(discountCode.min_order_amount).toFixed(0)} olmalıdır`
        }, { status: 400 })
      }

      // İndirim hesapla (discount_codes tablosu: type/value alanları)
      let discountAmount = 0
      const dtype = discountCode.type || discountCode.discount_type || 'fixed'
      const dvalue = Number(discountCode.value ?? discountCode.discount_value ?? 0)

      if (dtype === 'fixed') {
        discountAmount = dvalue
      } else if (dtype === 'percentage') {
        discountAmount = (cartTotal * dvalue) / 100
        if (discountCode.max_discount_amount) {
          discountAmount = Math.min(discountAmount, Number(discountCode.max_discount_amount))
        }
      }

      discountAmount = Math.min(discountAmount, cartTotal)

      return NextResponse.json({
        valid: true,
        coupon: {
          id: discountCode.id,
          code: discountCode.code,
          description: discountCode.description || null,
          discountType: dtype,
          discountValue: dvalue,
          discountAmount,
          minOrderAmount: discountCode.min_order_amount ? Number(discountCode.min_order_amount) : null,
          maxDiscountAmount: discountCode.max_discount_amount ? Number(discountCode.max_discount_amount) : null,
          brandName: discountCode.brand_name || null,
        }
      })
    }

    // Eski coupons tablosuna da bak (backward compat)
    const coupon = await queryOne<any>(
      `SELECT c.*, b.name as brand_name
       FROM coupons c
       LEFT JOIN brands b ON b.id = c.brand_id
       WHERE c.code = ? AND c.is_active = 1
         AND (c.expires_at IS NULL OR c.expires_at > NOW())`,
      [code.toUpperCase()]
    ).catch(() => null)

    if (!coupon) {
      return NextResponse.json({ error: 'Geçersiz veya süresi dolmuş kupon kodu' }, { status: 404 })
    }

    if (coupon.usage_limit !== null && coupon.used_count >= coupon.usage_limit) {
      return NextResponse.json({ error: 'Bu kupon kodunun kullanım limiti dolmuştur' }, { status: 400 })
    }

    if (coupon.user_id && userId && coupon.user_id !== userId) {
      return NextResponse.json({ error: 'Bu kupon kodu size özel değildir' }, { status: 400 })
    }

    if (coupon.min_order_amount && cartTotal < Number(coupon.min_order_amount)) {
      return NextResponse.json({
        error: `Bu kupon için minimum sepet tutarı ₺${Number(coupon.min_order_amount).toFixed(0)} olmalıdır`
      }, { status: 400 })
    }

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

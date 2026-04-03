import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { queryOne, execute } from '../../../../lib/db'

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

// PATCH - Toplu sipariş durumu güncelle
export async function PATCH(request: NextRequest) {
  try {
    const isAdmin = await checkAdminSession()
    if (!isAdmin) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })

    const { orderIds, status, trackingNumber } = await request.json()

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json({ error: 'Sipariş ID\'leri gereklidir' }, { status: 400 })
    }
    if (!status) {
      return NextResponse.json({ error: 'Durum gereklidir' }, { status: 400 })
    }

    const updates: string[] = ['status = ?', 'updated_at = NOW()']
    const baseParams: any[] = [status]

    if (trackingNumber) {
      updates.push('tracking_number = ?')
      baseParams.push(trackingNumber)
    }

    let updatedCount = 0
    for (const orderId of orderIds) {
      await execute(
        `UPDATE orders SET ${updates.join(', ')} WHERE order_id = ?`,
        [...baseParams, orderId]
      )
      updatedCount++
    }

    return NextResponse.json({
      success: true,
      message: `${updatedCount} sipariş güncellendi`,
      updatedCount
    })
  } catch (error) {
    console.error('Bulk update orders error:', error)
    return NextResponse.json({ error: 'Toplu güncelleme başarısız oldu' }, { status: 500 })
  }
}

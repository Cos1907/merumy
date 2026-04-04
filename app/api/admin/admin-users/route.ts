import { NextRequest, NextResponse } from 'next/server'
import { query, execute, queryOne } from '../../../lib/db'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

async function getCallerAdminUser() {
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

function isSuperAdmin(session: any) {
  return session && (session.role === 'super_admin' || session.email === 'admin@merumy.com' || session.email === 'huseyin@merumy.com')
}

// GET - List all admin users
export async function GET(request: NextRequest) {
  try {
    const session = await getCallerAdminUser()
    if (!session) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
    if (!isSuperAdmin(session)) return NextResponse.json({ error: 'Yetersiz yetki' }, { status: 403 })

    const adminUsers = await query<any[]>(
      `SELECT id, name, email, role, allowed_sections, must_change_password, created_at
       FROM admin_users ORDER BY id ASC`
    )

    return NextResponse.json({ users: adminUsers.map(u => ({
      ...u,
      allowedSections: u.allowed_sections ? JSON.parse(u.allowed_sections) : null,
    })) })
  } catch (error) {
    console.error('Admin users GET error:', error)
    return NextResponse.json({ error: 'Kullanıcılar getirilemedi' }, { status: 500 })
  }
}

// POST - Create new admin user
export async function POST(request: NextRequest) {
  try {
    const session = await getCallerAdminUser()
    if (!session) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
    if (!isSuperAdmin(session)) return NextResponse.json({ error: 'Yetersiz yetki' }, { status: 403 })

    const { name, email, password, role, allowedSections } = await request.json()
    if (!name || !email || !password) return NextResponse.json({ error: 'Ad, e-posta ve şifre zorunludur' }, { status: 400 })

    // Check if email already exists
    const existing = await queryOne<any>('SELECT id FROM admin_users WHERE email = ?', [email])
    if (existing) return NextResponse.json({ error: 'Bu e-posta zaten kayıtlı' }, { status: 409 })

    const passwordHash = await bcrypt.hash(password, 12)
    const sectionsJson = allowedSections && allowedSections.length > 0 ? JSON.stringify(allowedSections) : null

    await execute(
      `INSERT INTO admin_users (name, email, password_hash, role, allowed_sections, must_change_password)
       VALUES (?, ?, ?, ?, ?, 1)`,
      [name, email, passwordHash, role || 'admin', sectionsJson]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin users POST error:', error)
    return NextResponse.json({ error: 'Kullanıcı oluşturulamadı' }, { status: 500 })
  }
}

// PATCH - Update admin user (password, permissions)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getCallerAdminUser()
    if (!session) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

    const body = await request.json()
    const { id, action } = body

    if (action === 'change_own_password') {
      // User changing their own password (must_change_password flow)
      const { newPassword } = body
      if (!newPassword || newPassword.length < 6) return NextResponse.json({ error: 'Şifre en az 6 karakter olmalıdır' }, { status: 400 })
      const passwordHash = await bcrypt.hash(newPassword, 12)
      await execute(
        'UPDATE admin_users SET password_hash = ?, must_change_password = 0 WHERE id = ?',
        [passwordHash, session.user_id]
      )
      return NextResponse.json({ success: true })
    }

    // For other actions, must be super admin
    if (!isSuperAdmin(session)) return NextResponse.json({ error: 'Yetersiz yetki' }, { status: 403 })

    if (action === 'update_password') {
      const { newPassword } = body
      if (!newPassword || newPassword.length < 6) return NextResponse.json({ error: 'Şifre en az 6 karakter olmalıdır' }, { status: 400 })
      const passwordHash = await bcrypt.hash(newPassword, 12)
      await execute(
        'UPDATE admin_users SET password_hash = ?, must_change_password = 0 WHERE id = ?',
        [passwordHash, id]
      )
      return NextResponse.json({ success: true })
    }

    if (action === 'update_permissions') {
      const { allowedSections, role } = body
      const sectionsJson = allowedSections && allowedSections.length > 0 ? JSON.stringify(allowedSections) : null
      await execute(
        'UPDATE admin_users SET allowed_sections = ?, role = ? WHERE id = ?',
        [sectionsJson, role || 'admin', id]
      )
      return NextResponse.json({ success: true })
    }

    if (action === 'force_password_change') {
      await execute('UPDATE admin_users SET must_change_password = 1 WHERE id = ?', [id])
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Geçersiz işlem' }, { status: 400 })
  } catch (error) {
    console.error('Admin users PATCH error:', error)
    return NextResponse.json({ error: 'Güncelleme başarısız' }, { status: 500 })
  }
}

// DELETE - Delete admin user
export async function DELETE(request: NextRequest) {
  try {
    const session = await getCallerAdminUser()
    if (!session) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
    if (!isSuperAdmin(session)) return NextResponse.json({ error: 'Yetersiz yetki' }, { status: 403 })

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID gerekli' }, { status: 400 })

    // Prevent deleting yourself
    if (Number(id) === session.user_id) return NextResponse.json({ error: 'Kendinizi silemezsiniz' }, { status: 400 })

    await execute('DELETE FROM admin_sessions WHERE user_id = ?', [id])
    await execute('DELETE FROM admin_users WHERE id = ?', [id])
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin users DELETE error:', error)
    return NextResponse.json({ error: 'Silme başarısız' }, { status: 500 })
  }
}

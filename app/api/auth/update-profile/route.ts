import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import fs from 'fs'
import path from 'path'
import bcrypt from 'bcryptjs'
import { execute, query } from '../../../lib/db'
import { sendAccountUpdateEmail } from '../../../lib/mail'

const SESSION_COOKIE_NAME = 'merumy_session'
const DATA_DIR = path.join(process.cwd(), 'data')
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json')

function getUserFromSession(): any | null {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
    if (!token) return null
    if (fs.existsSync(SESSIONS_FILE)) {
      const sessionsData = JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf-8'))
      const session = sessionsData[token]
      if (session?.user) return session.user
    }
    return null
  } catch {
    return null
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = getUserFromSession()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Oturum bulunamadı. Lütfen tekrar giriş yapın.' }, { status: 401 })
    }

    const body = await request.json()
    const { firstName, lastName, phone, currentPassword, newPassword } = body

    if (!firstName || !lastName) {
      return NextResponse.json({ success: false, error: 'Ad ve soyad zorunludur' }, { status: 400 })
    }

    const userId = user.id
    const userEmail = user.email
    const fullName = `${firstName.trim()} ${lastName.trim()}`
    let passwordChanged = false

    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ success: false, error: 'Şifre değiştirmek için mevcut şifrenizi girmelisiniz' }, { status: 400 })
      }
      if (newPassword.length < 8) {
        return NextResponse.json({ success: false, error: 'Yeni şifre en az 8 karakter olmalıdır' }, { status: 400 })
      }
    }

    // DB güncelleme
    const existingUsers = await query<any[]>('SELECT password_hash FROM users WHERE uuid = ?', [userId])
    if (!existingUsers || existingUsers.length === 0) {
      return NextResponse.json({ success: false, error: 'Kullanıcı bulunamadı' }, { status: 404 })
    }

    if (currentPassword && newPassword) {
      const storedHash = existingUsers[0].password_hash || ''
      // bcrypt veya boş şifre kontrolü (OAuth kullanıcıları için)
      if (!storedHash) {
        return NextResponse.json({ success: false, error: 'Bu hesap sosyal giriş ile oluşturulmuştur. Şifre değiştirilemiyor.' }, { status: 400 })
      }
      const ok = await bcrypt.compare(currentPassword, storedHash)
      if (!ok) {
        return NextResponse.json({ success: false, error: 'Mevcut şifre yanlış' }, { status: 400 })
      }
      const newHash = await bcrypt.hash(newPassword, 12)
      await execute('UPDATE users SET name = ?, phone = ?, password_hash = ?, updated_at = NOW() WHERE uuid = ?',
        [fullName, phone || null, newHash, userId])
      passwordChanged = true
    } else {
      await execute('UPDATE users SET name = ?, phone = ?, updated_at = NOW() WHERE uuid = ?',
        [fullName, phone || null, userId])
    }

    // Session'ı güncelle
    try {
      const cookieStore = cookies()
      const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
      if (token && fs.existsSync(SESSIONS_FILE)) {
        const sessionsData = JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf-8'))
        if (sessionsData[token]) {
          sessionsData[token].user.firstName = firstName.trim()
          sessionsData[token].user.lastName = lastName.trim()
          sessionsData[token].user.phone = phone || sessionsData[token].user.phone
          fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessionsData, null, 2))
        }
      }
    } catch {}

    if (userEmail) {
      sendAccountUpdateEmail(userEmail, firstName.trim(), { passwordChanged }).catch(console.error)
    }

    return NextResponse.json({
      success: true,
      message: 'Hesap bilgileriniz güncellendi',
      user: { firstName: firstName.trim(), lastName: lastName.trim(), phone, email: userEmail }
    })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ success: false, error: 'Bir hata oluştu' }, { status: 500 })
  }
}

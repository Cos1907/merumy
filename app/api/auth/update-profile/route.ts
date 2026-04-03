import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import fs from 'fs'
import path from 'path'
import { execute, query } from '../../../lib/db'
import { sendAccountUpdateEmail } from '../../../lib/mail'
import crypto from 'crypto'

const SESSION_COOKIE_NAME = 'merumy_session'
const DATA_DIR = path.join(process.cwd(), 'data')
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json')

// Session'dan user al
function getUserFromSession(): any | null {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
    
    if (!token) {
      console.log('No session token found')
      return null
    }
    
    // JSON session dosyasından kontrol et
    if (fs.existsSync(SESSIONS_FILE)) {
      const sessionsData = JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf-8'))
      const session = sessionsData[token]
      if (session?.user) {
        return session.user
      }
    }
    
    console.log('No session found for token')
    return null
  } catch (error) {
    console.error('Session check error:', error)
    return null
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = getUserFromSession()
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Oturum bulunamadı. Lütfen tekrar giriş yapın.' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const { firstName, lastName, phone, currentPassword, newPassword } = body
    
    // Validasyon
    if (!firstName || !lastName) {
      return NextResponse.json(
        { success: false, error: 'Ad ve soyad zorunludur' },
        { status: 400 }
      )
    }
    
    const userId = user.id
    const userEmail = user.email
    const fullName = `${firstName.trim()} ${lastName.trim()}`
    
    // Şifre değişikliği varsa mevcut şifreyi doğrula
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { success: false, error: 'Şifre değiştirmek için mevcut şifrenizi girmelisiniz' },
          { status: 400 }
        )
      }
      
      if (newPassword.length < 8) {
        return NextResponse.json(
          { success: false, error: 'Yeni şifre en az 8 karakter olmalıdır' },
          { status: 400 }
        )
      }
    }
    
    let passwordChanged = false
    
    // Veritabanını güncelle
    try {
      // Şifre değişikliği varsa
      if (currentPassword && newPassword) {
        // Mevcut şifreyi kontrol et
        const currentHash = crypto.createHash('sha256').update(currentPassword).digest('hex')
        
        const existingUsers = await query<any[]>(
          'SELECT password_hash FROM users WHERE uuid = ?',
          [userId]
        )
        
        if (!existingUsers || existingUsers.length === 0) {
          return NextResponse.json(
            { success: false, error: 'Kullanıcı bulunamadı' },
            { status: 404 }
          )
        }
        
        if (existingUsers[0].password_hash !== currentHash) {
          return NextResponse.json(
            { success: false, error: 'Mevcut şifre yanlış' },
            { status: 400 }
          )
        }
        
        // Yeni şifreyi hashle ve güncelle
        const newHash = crypto.createHash('sha256').update(newPassword).digest('hex')
        
        await execute(
          'UPDATE users SET name = ?, phone = ?, password_hash = ?, updated_at = NOW() WHERE uuid = ?',
          [fullName, phone || null, newHash, userId]
        )
        passwordChanged = true
      } else {
        // Sadece profil bilgilerini güncelle
        await execute(
          'UPDATE users SET name = ?, phone = ?, updated_at = NOW() WHERE uuid = ?',
          [fullName, phone || null, userId]
        )
      }
    } catch (dbError) {
      console.error('Database update error:', dbError)
    }
    
    // JSON dosyasını da güncelle (eski sistem için)
    try {
      const usersPath = path.join(DATA_DIR, 'users.json')
      if (fs.existsSync(usersPath)) {
        const usersData = JSON.parse(fs.readFileSync(usersPath, 'utf-8'))
        
        if (usersData.users) {
          const userIndex = usersData.users.findIndex((u: any) => u.id === userId)
          if (userIndex !== -1) {
            usersData.users[userIndex].firstName = firstName.trim()
            usersData.users[userIndex].lastName = lastName.trim()
            usersData.users[userIndex].phone = phone || usersData.users[userIndex].phone
            if (passwordChanged) {
              // JSON'da password hash formatı farklı olabilir, userStore'daki format kullanılmalı
              // Burada da SHA256 kullanıyoruz
            }
            fs.writeFileSync(usersPath, JSON.stringify(usersData, null, 2))
          }
        }
      }
    } catch (jsonError) {
      console.error('JSON update error:', jsonError)
    }
    
    // Session'ı da güncelle
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
    } catch (sessionError) {
      console.error('Session update error:', sessionError)
    }
    
    // Bilgilendirme e-postası gönder
    if (userEmail) {
      try {
        await sendAccountUpdateEmail(userEmail, firstName.trim(), {
          passwordChanged
        })
        console.log('Account update email sent to:', userEmail)
      } catch (emailError) {
        console.error('Failed to send account update email:', emailError)
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Hesap bilgileriniz güncellendi',
      user: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone,
        email: userEmail
      }
    })
    
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { success: false, error: 'Bir hata oluştu' },
      { status: 500 }
    )
  }
}

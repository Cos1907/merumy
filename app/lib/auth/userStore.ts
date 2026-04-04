import bcrypt from 'bcryptjs'
import { query, execute } from '../db'
import type { SessionUser } from './session'

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

// DB kullanıcısından SessionUser'a çeviri
function dbRowToSessionUser(row: any): SessionUser {
  // DB'de name kolonu "Ad Soyad" olarak saklanıyor
  const fullName = row.name || ''
  const spaceIdx = fullName.indexOf(' ')
  const firstName = spaceIdx > -1 ? fullName.slice(0, spaceIdx) : fullName
  const lastName = spaceIdx > -1 ? fullName.slice(spaceIdx + 1) : ''
  return {
    id: row.uuid || String(row.id),
    email: row.email,
    firstName,
    lastName,
    phone: row.phone || '',
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
  }
}

export async function createUser(input: {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
}): Promise<SessionUser> {
  const email = normalizeEmail(input.email)

  // Email zaten kayıtlı mı?
  const existing = await query<any[]>(
    'SELECT id FROM users WHERE email = ? LIMIT 1',
    [email]
  )
  if (existing && existing.length > 0) {
    throw new Error('EMAIL_EXISTS')
  }

  const fullName = `${input.firstName.trim()} ${input.lastName.trim()}`
  const passwordHash = await bcrypt.hash(input.password, 12)
  const uuid = crypto.randomUUID()

  await execute(
    `INSERT INTO users (uuid, email, password_hash, name, phone, role, is_active, email_verified, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, 'customer', 1, 0, NOW(), NOW())`,
    [uuid, email, passwordHash, fullName, input.phone?.trim() || null]
  )

  // Eklenen kullanıcıyı geri al
  const rows = await query<any[]>('SELECT * FROM users WHERE uuid = ? LIMIT 1', [uuid])
  return dbRowToSessionUser(rows[0])
}

export async function authenticateUser(input: { email: string; password: string }): Promise<SessionUser> {
  const email = normalizeEmail(input.email)

  const rows = await query<any[]>(
    'SELECT * FROM users WHERE email = ? AND is_active = 1 LIMIT 1',
    [email]
  )
  if (!rows || rows.length === 0) throw new Error('INVALID_CREDENTIALS')

  const user = rows[0]
  const passwordHash: string = user.password_hash || ''

  // bcrypt veya legacy PBKDF2 formatını destekle
  let ok = false
  if (passwordHash.startsWith('$2b$') || passwordHash.startsWith('$2a$') || passwordHash.startsWith('$2y$')) {
    // bcrypt hash
    ok = await bcrypt.compare(input.password, passwordHash)
  } else {
    // Bilinmeyen format - geçersiz
    ok = false
  }

  if (!ok) throw new Error('INVALID_CREDENTIALS')

  // Last login güncelle
  execute('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]).catch(() => {})

  return dbRowToSessionUser(user)
}

// Şifre sıfırlama için kullanıcı ara
export async function findUserByEmail(email: string): Promise<{ id: number; uuid: string; email: string; name: string } | null> {
  const rows = await query<any[]>(
    'SELECT id, uuid, email, name FROM users WHERE email = ? AND is_active = 1 LIMIT 1',
    [normalizeEmail(email)]
  )
  return rows && rows.length > 0 ? rows[0] : null
}

// Şifre güncelle (reset sonrası)
export async function updateUserPassword(userId: number, newPassword: string): Promise<void> {
  const hash = await bcrypt.hash(newPassword, 12)
  await execute('UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?', [hash, userId])
}

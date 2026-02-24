import crypto from 'crypto'
import fs from 'fs/promises'
import path from 'path'
import { hashPassword, type PasswordHash, verifyPassword } from './password'
import type { SessionUser } from './session'
import { execute, query, queryOne } from '../db'

export type StoredUser = SessionUser & {
  password: PasswordHash
}

type DBShape = {
  users: StoredUser[]
}

const DATA_DIR = path.join(process.cwd(), 'data')
const USERS_FILE = path.join(DATA_DIR, 'users.json')

async function ensureDataFile() {
  await fs.mkdir(DATA_DIR, { recursive: true })
  try {
    await fs.access(USERS_FILE)
  } catch {
    const initial: DBShape = { users: [] }
    await fs.writeFile(USERS_FILE, JSON.stringify(initial, null, 2), 'utf8')
  }
}

async function readDB(): Promise<DBShape> {
  await ensureDataFile()
  const raw = await fs.readFile(USERS_FILE, 'utf8')
  const parsed = JSON.parse(raw || '{}')
  return { users: Array.isArray(parsed.users) ? parsed.users : [] }
}

async function writeDB(db: DBShape) {
  await ensureDataFile()
  await fs.writeFile(USERS_FILE, JSON.stringify(db, null, 2), 'utf8')
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

// MySQL'e kullanıcı kaydet
async function saveUserToMySQL(user: {
  uuid: string
  email: string
  name: string
  phone: string
  passwordHash: string
  createdAt: string
}): Promise<number | null> {
  try {
    // ISO tarihini MySQL formatına çevir (YYYY-MM-DD HH:MM:SS)
    const mysqlDate = new Date(user.createdAt).toISOString().slice(0, 19).replace('T', ' ')
    
    const result = await execute(
      `INSERT INTO users (uuid, email, name, phone, password_hash, created_at) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [user.uuid, user.email, user.name, user.phone || null, user.passwordHash, mysqlDate]
    )
    console.log('User saved to MySQL:', user.email, 'ID:', result.insertId)
    return result.insertId
  } catch (error: any) {
    // Duplicate email
    if (error.code === 'ER_DUP_ENTRY') {
      console.log('User already exists in MySQL:', user.email)
      return null
    }
    console.error('Error saving user to MySQL:', error)
    return null
  }
}

// MySQL'de email kontrolü
async function checkEmailExistsInMySQL(email: string): Promise<boolean> {
  try {
    const user = await queryOne<any>(
      'SELECT id FROM users WHERE email = ?',
      [email.toLowerCase()]
    )
    return !!user
  } catch (error) {
    console.error('Error checking email in MySQL:', error)
    return false
  }
}

export async function createUser(input: {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
}): Promise<SessionUser> {
  const db = await readDB()
  const email = normalizeEmail(input.email)
  
  // JSON'da email kontrolü
  const existsInJson = db.users.find((u) => normalizeEmail(u.email) === email)
  if (existsInJson) {
    throw new Error('EMAIL_EXISTS')
  }
  
  // MySQL'de email kontrolü
  const existsInMySQL = await checkEmailExistsInMySQL(email)
  if (existsInMySQL) {
    throw new Error('EMAIL_EXISTS')
  }

  const userId = crypto.randomUUID()
  const createdAt = new Date().toISOString()
  const hashedPw = hashPassword(input.password)
  
  const user: StoredUser = {
    id: userId,
    email,
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    phone: input.phone?.trim() || '',
    createdAt,
    password: hashedPw,
  }

  // JSON'a kaydet
  db.users.push(user)
  await writeDB(db)

  // MySQL'e kaydet
  const mysqlPasswordHash = crypto.createHash('sha256').update(input.password).digest('hex')
  await saveUserToMySQL({
    uuid: userId,
    email,
    name: `${input.firstName.trim()} ${input.lastName.trim()}`,
    phone: input.phone?.trim() || '',
    passwordHash: mysqlPasswordHash,
    createdAt
  })

  // return safe shape
  const { password, ...safe } = user
  return safe
}

export async function authenticateUser(input: { email: string; password: string }): Promise<SessionUser> {
  const db = await readDB()
  const email = normalizeEmail(input.email)
  
  // Önce JSON'dan ara
  let user = db.users.find((u) => normalizeEmail(u.email) === email)
  
  if (user) {
    const ok = verifyPassword(input.password, user.password)
    if (!ok) throw new Error('INVALID_CREDENTIALS')
    const { password, ...safe } = user
    return safe
  }
  
  // JSON'da yoksa MySQL'den ara
  try {
    const mysqlUser = await queryOne<any>(
      'SELECT id, uuid, email, name, phone, password_hash, created_at FROM users WHERE email = ?',
      [email]
    )
    
    if (mysqlUser) {
      // SHA256 hash ile kontrol
      const inputHash = crypto.createHash('sha256').update(input.password).digest('hex')
      if (mysqlUser.password_hash === inputHash) {
        const nameParts = (mysqlUser.name || '').split(' ')
        return {
          id: mysqlUser.uuid || String(mysqlUser.id),
          email: mysqlUser.email,
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          phone: mysqlUser.phone || '',
          createdAt: mysqlUser.created_at?.toISOString() || new Date().toISOString()
        }
      }
    }
  } catch (error) {
    console.error('MySQL auth error:', error)
  }
  
  throw new Error('INVALID_CREDENTIALS')
}

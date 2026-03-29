import crypto from 'crypto'
import fs from 'fs/promises'
import path from 'path'
import { hashPassword, type PasswordHash, verifyPassword } from './password'
import type { SessionUser } from './session'

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

export async function createUser(input: {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
}): Promise<SessionUser> {
  const db = await readDB()
  const email = normalizeEmail(input.email)
  const exists = db.users.find((u) => normalizeEmail(u.email) === email)
  if (exists) {
    throw new Error('EMAIL_EXISTS')
  }

  const user: StoredUser = {
    id: crypto.randomUUID(),
    email,
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    phone: input.phone?.trim() || '',
    createdAt: new Date().toISOString(),
    password: hashPassword(input.password),
  }

  db.users.push(user)
  await writeDB(db)

  // return safe shape
  const { password, ...safe } = user
  return safe
}

export async function authenticateUser(input: { email: string; password: string }): Promise<SessionUser> {
  const db = await readDB()
  const email = normalizeEmail(input.email)
  const user = db.users.find((u) => normalizeEmail(u.email) === email)
  if (!user) throw new Error('INVALID_CREDENTIALS')
  const ok = verifyPassword(input.password, user.password)
  if (!ok) throw new Error('INVALID_CREDENTIALS')
  const { password, ...safe } = user
  return safe
}




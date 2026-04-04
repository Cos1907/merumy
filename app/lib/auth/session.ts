import crypto from 'crypto'
import { cookies } from 'next/headers'
import fs from 'fs'
import path from 'path'

export const SESSION_COOKIE_NAME = 'merumy_session'

export type SessionUser = {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  createdAt: string
}

type SessionRecord = {
  token: string
  user: SessionUser
  createdAt: number
}

// File-based session store for persistence
const DATA_DIR = path.join(process.cwd(), 'data')
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json')

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

function loadSessions(): Map<string, SessionRecord> {
  ensureDataDir()
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const data = fs.readFileSync(SESSIONS_FILE, 'utf-8')
      const sessions = JSON.parse(data)
      // Clean up old sessions (older than 30 days)
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000)
      const validSessions: Record<string, SessionRecord> = {}
      for (const [token, record] of Object.entries(sessions)) {
        const rec = record as SessionRecord
        if (rec.createdAt > thirtyDaysAgo) {
          validSessions[token] = rec
        }
      }
      return new Map(Object.entries(validSessions))
    }
  } catch (e) {
    console.error('Error loading sessions:', e)
  }
  return new Map()
}

function saveSessions(sessions: Map<string, SessionRecord>) {
  ensureDataDir()
  try {
    const obj: Record<string, SessionRecord> = {}
    sessions.forEach((value, key) => {
      obj[key] = value
    })
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(obj, null, 2))
  } catch (e) {
    console.error('Error saving sessions:', e)
  }
}

// Load sessions on startup
let sessionStore = loadSessions()

export function createSession(user: SessionUser) {
  // Reload sessions before adding new one
  sessionStore = loadSessions()
  
  const token = crypto.randomBytes(32).toString('hex')
  sessionStore.set(token, { token, user, createdAt: Date.now() })
  saveSessions(sessionStore)

  const cookieStore = cookies()
  cookieStore.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })
}

// OAuth callback'lerinde kullanmak için: token döner, cookie set ETMEz
// Cookie'yi doğrudan NextResponse.redirect() üzerine set edebilmek için
export function createSessionToken(user: SessionUser): string {
  sessionStore = loadSessions()
  const token = crypto.randomBytes(32).toString('hex')
  sessionStore.set(token, { token, user, createdAt: Date.now() })
  saveSessions(sessionStore)
  return token
}

export const SESSION_COOKIE_OPTIONS = {
  name: SESSION_COOKIE_NAME,
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: 60 * 60 * 24 * 30,
}

export function clearSession() {
  // Reload sessions before clearing
  sessionStore = loadSessions()
  
  const cookieStore = cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
  if (token) {
    sessionStore.delete(token)
    saveSessions(sessionStore)
  }
  cookieStore.set({
    name: SESSION_COOKIE_NAME,
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  })
}

export function getSessionUser(): SessionUser | null {
  // Always reload sessions from file to get latest data
  sessionStore = loadSessions()
  
  const cookieStore = cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
  if (!token) return null
  const rec = sessionStore.get(token)
  return rec?.user || null
}

import crypto from 'crypto'

export type PasswordHash = {
  salt: string
  hash: string
  iterations: number
  keylen: number
  digest: string
}

const DEFAULT_ITERATIONS = 150_000
const DEFAULT_KEYLEN = 32
const DEFAULT_DIGEST = 'sha256'

export function hashPassword(password: string): PasswordHash {
  const salt = crypto.randomBytes(16).toString('hex')
  const iterations = DEFAULT_ITERATIONS
  const keylen = DEFAULT_KEYLEN
  const digest = DEFAULT_DIGEST
  const hash = crypto.pbkdf2Sync(password, salt, iterations, keylen, digest).toString('hex')
  return { salt, hash, iterations, keylen, digest }
}

export function verifyPassword(password: string, stored: PasswordHash): boolean {
  const computed = crypto
    .pbkdf2Sync(password, stored.salt, stored.iterations, stored.keylen, stored.digest as any)
    .toString('hex')
  return crypto.timingSafeEqual(Buffer.from(computed, 'hex'), Buffer.from(stored.hash, 'hex'))
}




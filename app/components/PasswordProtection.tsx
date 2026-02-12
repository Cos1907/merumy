'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function PasswordProtection() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if user is already authenticated
    const auth = localStorage.getItem('merumy_authenticated')
    if (auth === 'true') {
      setIsAuthenticated(true)
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === 'merumy1907') {
      localStorage.setItem('merumy_authenticated', 'true')
      setIsAuthenticated(true)
      setError('')
      router.refresh()
    } else {
      setError('Yanlış şifre. Lütfen tekrar deneyin.')
      setPassword('')
    }
  }

  if (isAuthenticated) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-[100]">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl p-3 flex items-center gap-2 border border-gray-200">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Şifre"
          className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary font-engram"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-primary text-white rounded hover:bg-opacity-90 transition-colors text-sm font-engram font-medium whitespace-nowrap"
        >
          Giriş
        </button>
      </form>
      {error && (
        <div className="mt-2 text-red-600 text-xs bg-white p-2 rounded shadow-lg border border-red-200 font-engram">
          {error}
        </div>
      )}
    </div>
  )
}


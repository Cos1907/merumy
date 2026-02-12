'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { Product } from '../lib/products'

export interface CartItem {
  product: Product
  quantity: number
  expiresAt: number
}

interface CartContextType {
  items: CartItem[]
  addToCart: (product: Product, quantity: number) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  cartCount: number
  cartTotal: number
  cartSubtotal: number
  discountFromOriginal: number
  promoCode: string | null
  promoDiscount: number
  setPromoCode: (code: string) => Promise<{ ok: boolean; error?: string }>
  clearPromoCode: () => Promise<void>
  lastAddedAt: number
  toast: { title: string; message?: string } | null
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [cartSubtotal, setCartSubtotal] = useState(0)
  const [discountFromOriginal, setDiscountFromOriginal] = useState(0)
  const [promoCode, setPromoCodeState] = useState<string | null>(null)
  const [promoDiscount, setPromoDiscount] = useState(0)
  const [cartTotal, setCartTotal] = useState(0)
  const [lastAddedAt, setLastAddedAt] = useState(0)
  const [toast, setToast] = useState<{ title: string; message?: string } | null>(null)

  const sync = async () => {
    const res = await fetch('/api/cart', { cache: 'no-store', credentials: 'include' })
    const data = await res.json().catch(() => ({}))
    setItems(Array.isArray(data?.items) ? data.items : [])
    setCartSubtotal(Number(data?.subtotal || 0))
    setDiscountFromOriginal(Number(data?.discountFromOriginal || 0))
    setPromoCodeState(data?.promoCode || null)
    setPromoDiscount(Number(data?.promoDiscount || 0))
    setCartTotal(Number(data?.total || 0))
  }

  // Load cart from server on mount
  useEffect(() => {
    sync().catch(() => {})
  }, [])

  // Auto-prune every 30s (15 min TTL enforced on server)
  useEffect(() => {
    const t = setInterval(() => {
      sync().catch(() => {})
    }, 30_000)
    return () => clearInterval(t)
  }, [])

  const addToCart = (product: Product, quantity: number) => {
    ;(async () => {
      await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'add', productId: product.id, quantity }),
        credentials: 'include',
      })
      await sync()
      setLastAddedAt(Date.now())
      setToast({ title: 'Sepete eklendi', message: product.name })
      setTimeout(() => setToast(null), 2000)
    })().catch(() => {})
  }

  const removeFromCart = (productId: string) => {
    ;(async () => {
      await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'remove', productId }),
        credentials: 'include',
      })
      await sync()
    })().catch(() => {})
  }

  const updateQuantity = (productId: string, quantity: number) => {
    ;(async () => {
      await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'setQty', productId, quantity }),
        credentials: 'include',
      })
      await sync()
    })().catch(() => {})
  }

  const clearCart = () => {
    ;(async () => {
      await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'clear' }),
        credentials: 'include',
      })
      await sync()
    })().catch(() => {})
  }

  const cartCount = items.reduce((total, item) => total + item.quantity, 0)
  // cartTotal is server-computed (includes promo). Kept name for compatibility.

  const setPromoCode = async (code: string) => {
    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'setPromo', code }),
      credentials: 'include',
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      await sync().catch(() => {})
      return { ok: false, error: data?.error || 'INVALID_PROMO' }
    }
    await sync()
    return { ok: true }
  }

  const clearPromoCode = async () => {
    await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'clearPromo' }),
      credentials: 'include',
    })
    await sync()
  }

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
        cartSubtotal,
        discountFromOriginal,
        promoCode,
        promoDiscount,
        setPromoCode,
        clearPromoCode,
        lastAddedAt,
        toast,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}



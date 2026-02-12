'use client'

import { useCart } from '../context/CartContext'

export default function CartToast() {
  const { toast } = useCart()
  if (!toast) return null

  return (
    <div className="fixed right-6 top-28 z-[9999]">
      <div className="rounded-2xl border border-[#92D0AA]/30 bg-white shadow-xl px-5 py-4 min-w-[260px]">
        <div className="text-sm font-bold text-gray-900">{toast.title}</div>
        {toast.message && <div className="mt-1 text-xs text-gray-600 line-clamp-2">{toast.message}</div>}
        <div className="mt-3 h-1 w-full rounded-full bg-[#92D0AA]/20 overflow-hidden">
          <div className="h-full w-full bg-[#92D0AA] animate-toast-progress" />
        </div>
      </div>
    </div>
  )
}



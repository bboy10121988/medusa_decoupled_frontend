"use client"

import CartDropdown from "../cart-dropdown"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useEffect, useState, useCallback, useRef } from "react"
import { HttpTypes } from "@medusajs/types"

export default function CartButton() {
  const [cart, setCart] = useState<HttpTypes.StoreCart | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // 獨立的獲取購物車函數 - 使用 API 路由而非 Server Action
  const fetchCart = useCallback(async () => {
    try {
      const response = await fetch('/api/cart/get')
      const data = await response.json()
      setCart(data.cart)
    } catch (error) {
      console.error('Failed to fetch cart:', error)
      setCart(null)
    }
  }, [])

  // 點擊外部關閉下拉選單
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    if (showDropdown && typeof document !== 'undefined') {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      if (typeof document !== 'undefined') {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [showDropdown])

  useEffect(() => {
    fetchCart()

    // 添加全局事件監聽器來更新購物車
    if (typeof window !== 'undefined') {
      window.addEventListener('cartUpdate', fetchCart)
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('cartUpdate', fetchCart)
      }
    }
  }, [fetchCart])

  const totalItems = cart?.items?.reduce((acc: number, item: any) => {
    return acc + item.quantity
  }, 0) || 0

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 桌機版 - 按鈕顯示下拉選單 */}
      <button 
        onClick={() => setShowDropdown(!showDropdown)}
        className="hidden lg:flex items-center gap-2 text-[13px] tracking-wider uppercase font-medium hover:text-black/70 transition-colors duration-200"
        aria-label="購物車"
      >
        <div className="relative">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
          {/* 桌機版數字徽章 - 覆蓋在 icon 上 */}
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
              {totalItems}
            </span>
          )}
        </div>
        <span className="!text-[13px] !font-medium !leading-none">
          購物車
        </span>
      </button>

      {/* 手機版 - 連結直接跳轉到購物車頁面 */}
      <LocalizedClientLink
        href="/cart"
        className="lg:hidden flex items-center gap-2 text-[13px] tracking-wider uppercase font-medium hover:text-black/70 transition-colors duration-200"
        aria-label="購物車"
      >
        <div className="relative">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
          {/* 手機版數字徽章 - 覆蓋在 icon 上 */}
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
              {totalItems}
            </span>
          )}
        </div>
      </LocalizedClientLink>
      
      {/* 桌機版下拉選單 */}
      {showDropdown && (
        <div className="hidden lg:block absolute top-[calc(100%+1px)] right-0 bg-white border-x border-b border-gray-200 w-[420px] text-gray-900 z-50 shadow-lg">
          <CartDropdown cart={cart} onClose={() => setShowDropdown(false)} />
        </div>
      )}
    </div>
  )
}

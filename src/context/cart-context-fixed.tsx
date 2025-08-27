"use client"

import { HttpTypes } from "@medusajs/types"
import { createContext, ReactNode, useContext, useState } from "react"

interface CartContextType {
  cart: HttpTypes.StoreCart | null
  setCart: (cart: HttpTypes.StoreCart | null) => void
  addToCart: (variantId: string, quantity: number) => void
  removeFromCart: (lineItemId: string) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextType | null>(null)

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<HttpTypes.StoreCart | null>(null)

  const addToCart = (variantId: string, quantity: number) => {
    // 實作加入購物車邏輯
  }

  const removeFromCart = (lineItemId: string) => {
    // 實作移除商品邏輯
  }

  const clearCart = () => {
    setCart(null)
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        setCart,
        addToCart,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}

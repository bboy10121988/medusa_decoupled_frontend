"use client"

import { HttpTypes } from "@medusajs/types"
import { createContext, useContext, useState, useCallback } from "react"

interface ProductActionContext {
  addToCart: (input: { variantId: string; quantity: number; countryCode: string }) => Promise<void>
  inStock: boolean
  isAdding: boolean
  options: Record<string, string>
  setOptions: React.Dispatch<React.SetStateAction<Record<string, string>>>
  selectedVariant: HttpTypes.StoreProductVariant | undefined
  setSelectedVariant: React.Dispatch<React.SetStateAction<HttpTypes.StoreProductVariant | undefined>>
}

const ProductActionContext = createContext<ProductActionContext | undefined>(undefined)

export function ProductActionProvider({ children }: { children: React.ReactNode }) {
  const [options, setOptions] = useState<Record<string, string>>({})
  const [selectedVariant, setSelectedVariant] = useState<HttpTypes.StoreProductVariant>()
  const [isAdding, setIsAdding] = useState(false)
  const [inStock, setInStock] = useState(true) // 預設為可購買狀態

  const addToCart = useCallback(async (input: { variantId: string; quantity: number; countryCode: string }) => {
    setIsAdding(true)
    try {
      console.log("🛒 ProductActionContext 開始加入購物車:", input)
      
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log("✅ ProductActionContext 加入購物車成功:", result)
      
      // 觸發全局購物車更新事件
      window.dispatchEvent(new Event('cartUpdate'))
    } catch (error) {
      console.error("❌ ProductActionContext 加入購物車失敗:", error)
      throw error
    } finally {
      setIsAdding(false)
    }
  }, [])

  return (
    <ProductActionContext.Provider
      value={{
        addToCart,
        inStock,
        isAdding,
        options,
        setOptions,
        selectedVariant,
        setSelectedVariant,
      }}
    >
      {children}
    </ProductActionContext.Provider>
  )
}

export function useProductActions() {
  const context = useContext(ProductActionContext)
  if (!context) {
    throw new Error("useProductActions must be used within a ProductActionProvider")
  }
  return context
}

"use client"

import { HttpTypes } from "@medusajs/types"

export const retrieveOrderClient = async (id: string): Promise<HttpTypes.StoreOrder> => {
  // console.log("🔍 retrieveOrderClient 開始獲取訂單:", id)
  
  try {
    const response = await fetch(`/api/orders/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      // console.error("❌ API 響應錯誤:", response.status, errorText)
      throw new Error(`Failed to fetch order: ${response.status} ${errorText}`)
    }

    const data = await response.json()
    // console.log("✅ retrieveOrderClient 成功獲取訂單:", data)
    
    return data.order || data
  } catch (error) {
    // console.error("❌ retrieveOrderClient 錯誤:", error)
    throw error
  }
}

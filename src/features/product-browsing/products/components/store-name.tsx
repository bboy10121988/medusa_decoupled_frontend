"use client"

import React, { useEffect, useState } from "react"

// 客戶端店名顯示組件
const StoreName = () => {
  const [storeName, setStoreName] = useState("Loading...")

  useEffect(() => {
    const fetchStoreName = async () => {
      try {
        const response = await fetch('/api/store-name')
        if (response.ok) {
          const data = await response.json()
          setStoreName(data.name)
        } else {
          console.error('獲取店名失敗')
          setStoreName("SALON")
        }
      } catch (error) {
        console.error('獲取店名時出錯:', error)
        setStoreName("SALON")
      }
    }

    fetchStoreName()
  }, [])

  return (
    <div className="uppercase text-xs tracking-widest text-gray-500">{storeName}</div>
  )
}

export default StoreName

"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { sdk } from "@lib/config"


export default function AccountPage() {
  const params = useParams()
  const router = useRouter()
  const countryCode = params.countryCode as string
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkCustomer = async () => {
      try {
        const response = await sdk.store.customer.retrieve()
        
        if (response?.customer) {
          // 如果已登入，重定向到儀表板
          router.push(`/${countryCode}/account/profile`)
        } else {
          // 如果沒有登入，重定向到登入頁面
          router.push(`/${countryCode}/account/login`)
        }
      } catch (error) {
        console.error('檢查客戶狀態失敗:', error)
        // 無法驗證狀態，重定向到登入頁面
        router.push(`/${countryCode}/account/login`)
      } finally {
        setLoading(false)
      }
    }

    checkCustomer()
  }, [countryCode, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  // 這個組件主要用於重定向，不應該顯示任何內容
  return null
}
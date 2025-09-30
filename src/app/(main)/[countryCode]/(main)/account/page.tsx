"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"

export default function AccountPage() {
  const params = useParams()
  const router = useRouter()
  const countryCode = params.countryCode as string
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkCustomer = async () => {
      try {
        // 使用 API 路由來檢查認證狀態，這樣會包含 cookies
        const response = await fetch('/api/auth/customer', {
          method: 'GET',
          credentials: 'include', // 確保包含 cookies
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.customer) {
            console.log('客戶已認證，重定向到 profile:', data.customer)
            router.push(`/${countryCode}/account/profile`)
          } else {
            console.log('客戶未認證，重定向到 login')
            router.push(`/${countryCode}/login`)
          }
        } else {
          console.log('認證檢查失敗，重定向到 login')
          router.push(`/${countryCode}/login`)
        }
      } catch (error) {
        console.error('檢查客戶狀態失敗:', error)
        router.push(`/${countryCode}/login`)
      } finally {
        setLoading(false)
      }
    }

    checkCustomer()
  }, [countryCode, router])

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return null
}

"use client"

import { useEffect, useState } from "react"
import { Toaster } from "@medusajs/ui"
import AccountLayout from "@modules/account/templates/account-layout"
import { HttpTypes } from "@medusajs/types"

export const dynamic = 'force-dynamic'

export default function AccountPageLayout({
  dashboard,
  login,
}: {
  dashboard?: React.ReactNode
  login?: React.ReactNode
}) {
  const [customer, setCustomer] = useState<HttpTypes.StoreCustomer | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        // 使用我們自己的 API 端點，並包含 cookies
        const response = await fetch('/api/auth/customer', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data?.customer) {
            setCustomer(data.customer)
          }
        }
      } catch (err) {
        console.error('獲取客戶資料失敗:', err)
        // 不設置客戶資料，保持 null 狀態
      } finally {
        setLoading(false)
      }
    }

    fetchCustomer()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <AccountLayout customer={customer}>
      {customer ? dashboard : login}
      <Toaster />
    </AccountLayout>
  )
}

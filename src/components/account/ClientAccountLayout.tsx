'use client'

import { useEffect, useState } from 'react'
import { Toaster } from "@medusajs/ui"
import AccountLayout from "@modules/account/templates/account-layout"
import { HttpTypes } from "@medusajs/types"

interface ClientAccountLayoutProps {
  dashboard?: React.ReactNode
  login?: React.ReactNode
  initialCustomer?: HttpTypes.StoreCustomer | null
}

export default function ClientAccountLayout({
  dashboard,
  login,
  initialCustomer = null
}: ClientAccountLayoutProps) {
  const [customer, setCustomer] = useState<HttpTypes.StoreCustomer | null>(initialCustomer)
  const [isLoading, setIsLoading] = useState(!initialCustomer)

  useEffect(() => {
    // 在客戶端檢索用戶資料
    const fetchCustomer = async () => {
      try {
        const response = await fetch('/api/auth/customer')
        if (response.ok) {
          const customerData = await response.json()
          setCustomer(customerData)
        }
      } catch (error) {
        console.error('獲取用戶資料失敗:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (!initialCustomer) {
      fetchCustomer()
    }
  }, [initialCustomer])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
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
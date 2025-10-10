"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode, useMemo } from 'react'
import { HttpTypes } from '@medusajs/types'

interface AccountContextType {
  customer: HttpTypes.StoreCustomer | null
  loading: boolean
  refreshCustomer: () => Promise<void>
  isAuthenticated: boolean
}

const AccountContext = createContext<AccountContextType | undefined>(undefined)

export function AccountProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<HttpTypes.StoreCustomer | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchCustomer = async () => {
    try {
      console.log('🔍 檢查用戶認證狀態...')
      const response = await fetch('/api/auth/customer', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-cache'
      })
      
      console.log('📡 用戶認證 API 回應:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        const customerData = data?.customer || null
        console.log('✅ 用戶狀態:', customerData ? `已登入 (${customerData.email})` : '未登入')
        setCustomer(customerData)
      } else {
        console.log('❌ 用戶認證失敗:', response.status)
        setCustomer(null)
      }
    } catch (err) {
      console.error('❌ 獲取客戶資料失敗:', err)
      setCustomer(null)
    } finally {
      setLoading(false)
    }
  }

  const refreshCustomer = async () => {
    setLoading(true)
    await fetchCustomer()
  }

  useEffect(() => {
    fetchCustomer()
    
    // SDK 版本不需要特殊的重定向處理，所以我們也移除這部分
  }, [])

  const value = useMemo<AccountContextType>(() => ({
    customer,
    loading,
    refreshCustomer,
    isAuthenticated: !!customer
  }), [customer, loading, refreshCustomer])

  return (
    <AccountContext.Provider value={value}>
      {children}
    </AccountContext.Provider>
  )
}

export function useAccount() {
  const context = useContext(AccountContext)
  if (context === undefined) {
    throw new Error('useAccount must be used within an AccountProvider')
  }
  return context
}
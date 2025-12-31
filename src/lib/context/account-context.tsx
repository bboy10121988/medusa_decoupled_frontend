"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode, useMemo } from 'react'
import { HttpTypes } from '@medusajs/types'
import { sdk } from '@/lib/config'

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

    sdk.store.customer.retrieve()
      .then(({ customer }) => {
        console.log("Fetched customer:", customer)
        setCustomer(customer)
      })
      .catch((e) => {
        console.error("Failed to fetch customer:", e)
        setCustomer(null)
      })
      .finally(() => {
        setLoading(false)
      })


    // try {
    //   const response = await fetch('/api/auth/customer', {
    //     method: 'GET',
    //     credentials: 'include',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     cache: 'no-cache'
    //   })
      
    //   if (response.ok) {
    //     const data = await response.json()
    //     const customerData = data?.customer || null
    //     setCustomer(customerData)
    //   } else {
    //     setCustomer(null)
    //   }
    // } catch (err) {
    //   // console.error('Failed to fetch customer:', err)
    //   setCustomer(null)
    // } finally {
    //   setLoading(false)
    // }
  }

  const refreshCustomer = async () => {
    setLoading(true)
    await fetchCustomer()
  }

  useEffect(() => {
    fetchCustomer()
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
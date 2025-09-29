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
          router.push(`/${countryCode}/account/profile`)
        } else {
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

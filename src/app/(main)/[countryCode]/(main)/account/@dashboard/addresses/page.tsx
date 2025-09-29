"use client"

import { useEffect, useState } from "react"
import { useParams, notFound } from "next/navigation"
import AddressBook from "@modules/account/components/address-book"
import { HttpTypes } from "@medusajs/types"
import { sdk } from "@lib/config"

export const dynamic = 'force-dynamic'

export default function Addresses() {
  const params = useParams()
  const countryCode = params.countryCode as string
  const [customer, setCustomer] = useState<HttpTypes.StoreCustomer | null>(null)
  const [region, setRegion] = useState<HttpTypes.StoreRegion | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const response = await sdk.store.customer.retrieve()
        if (response?.customer) {
          setCustomer(response.customer)
        }
      } catch (err) {
        console.error('獲取客戶資料失敗:', err)
      }
    }

    const fetchRegions = async () => {
      try {
        const response = await sdk.store.region.list({ fields: "*countries" })
        if (response?.regions) {
          // 簡化 region 選擇邏輯
          const defaultRegion = response.regions[0]
          setRegion(defaultRegion)
        }
      } catch (err) {
        console.error('獲取地區資料失敗:', err)
      }
    }

    const loadData = async () => {
      await Promise.all([fetchCustomer(), fetchRegions()])
      setLoading(false)
    }

    loadData().catch(() => {
      setError('無法載入資料')
      setLoading(false)
    })
  }, [countryCode])

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error || !customer || !region) {
    notFound()
  }

  return (
    <div className="w-full" data-testid="addresses-page-wrapper">
      <div className="mb-8 flex flex-col gap-y-4">
        <h1 className="text-2xl-semi">Shipping Addresses</h1>
        <p className="text-base-regular">
          View and update your shipping addresses, you can add as many as you
          like. Saving your addresses will make them available during checkout.
        </p>
      </div>
      <AddressBook customer={customer} region={region} />
    </div>
  )
}

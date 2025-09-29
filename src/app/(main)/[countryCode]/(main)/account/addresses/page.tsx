"use client"

import { useEffect, useState } from "react"
import { useParams, notFound } from "next/navigation"
import AddressBook from "@modules/account/components/address-book"
import AccountLayout from "@modules/account/templates/account-layout"
import { HttpTypes } from "@medusajs/types"
import { sdk } from "@lib/config"

export default function Addresses() {
  const params = useParams()
  const countryCode = params.countryCode as string
  const [customer, setCustomer] = useState<HttpTypes.StoreCustomer | null>(null)
  const [region, setRegion] = useState<HttpTypes.StoreRegion | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customerResponse, regionsResponse] = await Promise.all([
          sdk.store.customer.retrieve().catch(() => null),
          sdk.store.region.list({ fields: "*countries" }).catch(() => null)
        ])

        if (customerResponse?.customer) {
          setCustomer(customerResponse.customer)
        }
        
        if (regionsResponse?.regions) {
          const defaultRegion = regionsResponse.regions[0]
          setRegion(defaultRegion)
        }
      } catch (err) {
        console.error('獲取資料失敗:', err)
        setError('無法載入資料')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [countryCode])

  if (loading) {
    return (
      <AccountLayout customer={customer}>
        <div className="w-full flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </AccountLayout>
    )
  }

  if (error || !customer || !region) {
    notFound()
  }

  return (
    <AccountLayout customer={customer}>
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
    </AccountLayout>
  )
}

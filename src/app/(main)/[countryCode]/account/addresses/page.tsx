"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import AddressBook from "@modules/account/components/address-book"
import { HttpTypes } from "@medusajs/types"

export default function Addresses() {
  const params = useParams()
  const countryCode = params.countryCode as string
  const [customer, setCustomer] = useState<HttpTypes.StoreCustomer | null>(null)
  const [region, setRegion] = useState<HttpTypes.StoreRegion | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customerResponse, regionsResponse] = await Promise.all([
          fetch('/api/auth/customer', {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
          }),
          fetch('/api/regions', {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
          })
        ])

        if (customerResponse.ok) {
          const customerData = await customerResponse.json()
          setCustomer(customerData.customer)
        }
        
        if (regionsResponse.ok) {
          const regionsData = await regionsResponse.json()
          const regions = regionsData.regions || []
          const currentRegion = regions.find((r: any) => 
            r.countries?.some((c: any) => c.iso_2 === countryCode)
          )
          setRegion(currentRegion || regions[0] || null)
        }
      } catch (err) {
        console.error('獲取地址資料失敗:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [countryCode])

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!customer || !region) {
    return (
      <div className="w-full flex items-center justify-center py-12">
        <div className="text-red-500">載入資料時發生錯誤</div>
      </div>
    )
  }

  return (
    <div className="flex-1" data-testid="addresses-page-wrapper">
      <div className="mb-8 flex flex-col gap-y-4">
        <h1 className="text-2xl-semi">地址簿</h1>
        <p className="text-base-regular">
          查看和更新您的送貨地址，您可以新增多個地址來加速結帳流程。
        </p>
      </div>
      <AddressBook customer={customer} region={region} />
    </div>
  )
}

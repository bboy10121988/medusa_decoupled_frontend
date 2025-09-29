"use client"

import { useEffect, useState } from "react"
import { notFound } from "next/navigation"
import ProfilePhone from "@modules/account/components/profile-phone"
import ProfileBillingAddress from "@modules/account/components/profile-billing-address"
import ProfileEmail from "@modules/account/components/profile-email"
import ProfileName from "@modules/account/components/profile-name"
import AccountLayout from "@modules/account/templates/account-layout"
import { HttpTypes } from "@medusajs/types"
import { sdk } from "@lib/config"

export default function Profile() {
  const [customer, setCustomer] = useState<HttpTypes.StoreCustomer | null>(null)
  const [regions, setRegions] = useState<HttpTypes.StoreRegion[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customerResponse, regionsResponse] = await Promise.all([
          sdk.store.customer.retrieve().catch(() => null),
          sdk.store.region.list().catch(() => null)
        ])

        if (customerResponse?.customer) {
          setCustomer(customerResponse.customer)
        }
        
        if (regionsResponse?.regions) {
          setRegions(regionsResponse.regions)
        }
      } catch (err) {
        console.error('獲取資料失敗:', err)
        setError('無法載入資料')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <AccountLayout customer={customer}>
        <div className="w-full flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </AccountLayout>
    )
  }

  if (error || !customer || !regions) {
    notFound()
  }

  return (
    <AccountLayout customer={customer}>
      <div className="w-full" data-testid="profile-page-wrapper">
        <div className="mb-8 flex flex-col gap-y-4">
          <h1 className="text-2xl-semi">Profile</h1>
          <p className="text-base-regular">
            View and update your profile information, including your name, email,
            and phone number. You can also update your billing address.
          </p>
        </div>
        <div className="flex flex-col gap-y-8 w-full">
          <ProfileName customer={customer} />
          <Divider />
          <ProfileEmail customer={customer} />
          <Divider />
          <ProfilePhone customer={customer} />
          <Divider />
          <ProfileBillingAddress customer={customer} regions={regions} />
        </div>
      </div>
    </AccountLayout>
  )
}

const Divider = () => {
  return <div className="w-full h-px bg-gray-200" />
}

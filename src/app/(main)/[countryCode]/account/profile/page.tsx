"use client"

import { useEffect, useState } from "react"
import ProfilePhone from "@modules/account/components/profile-phone"
import ProfileBillingAddress from "@modules/account/components/profile-billing-address"
import ProfileEmail from "@modules/account/components/profile-email"
import ProfileName from "@modules/account/components/profile-name"
import { useAccount } from "@lib/context/account-context"
import { HttpTypes } from "@medusajs/types"

export default function Profile() {
  const { customer, loading: customerLoading } = useAccount()
  const [regions, setRegions] = useState<HttpTypes.StoreRegion[] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const regionsResponse = await fetch('/api/regions', {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        })

        if (regionsResponse.ok) {
          const regionsData = await regionsResponse.json()
          setRegions(regionsData.regions || [])
        }
      } catch (err) {
        // console.error('獲取區域資料失敗:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchRegions()
  }, [])

  if (loading || !customer) {
    return (
      <div className="w-full flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!regions) {
    return (
      <div className="w-full flex items-center justify-center py-12">
        <div className="text-red-500">載入區域資料失敗</div>
      </div>
    )
  }

  return (
    <div className="flex-1" data-testid="profile-page-wrapper">
      <div className="mb-8 flex flex-col gap-y-4">
        <h1 className="text-2xl-semi">個人檔案</h1>
        <p className="text-base-regular">
          查看和更新您的個人檔案資訊，包括姓名、電子郵件和電話號碼。您也可以更新帳單地址，或變更密碼。
        </p>
      </div>
      <div className="w-full">
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
    </div>
  )
}

const Divider = () => {
  return <div className="w-full h-px bg-gray-200" />
}

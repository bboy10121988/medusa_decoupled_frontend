"use client"

import { useParams } from 'next/navigation'

export default function AffiliateAdminLogoutButton() {
  const params = useParams<{ countryCode: string }>()
  const countryCode = params?.countryCode || 'tw'

  const handleLogout = async () => {
    try {
      // 直接導向 API 路由，讓伺服器處理登出邏輯
      window.location.href = `/api/affiliate-admin/signout?countryCode=${countryCode}`
    } catch (error) {
      console.error('登出失敗:', error)
    }
  }

  return (
    <button
      onClick={handleLogout}
      className="hover:underline text-sm text-gray-500 p-0 m-0 bg-transparent border-none"
    >
      登出
    </button>
  )
}

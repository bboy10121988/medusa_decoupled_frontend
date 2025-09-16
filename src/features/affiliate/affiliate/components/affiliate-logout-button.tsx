"use client"

import { useParams } from 'next/navigation'
import { affiliateSignout } from '@lib/data/affiliate-auth'

export default function AffiliateLogoutButton() {
  const params = useParams<{ countryCode: string }>()
  const countryCode = params?.countryCode || 'tw'

  const handleLogout = async () => {
    try {
      await affiliateSignout(countryCode)
    } catch (error) {
      console.error('登出失敗:', error)
    }
  }

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700 border border-red-200 hover:bg-red-100 hover:text-red-800 transition-colors"
    >
      <svg 
        className="h-4 w-4" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
        />
      </svg>
      登出
    </button>
  )
}

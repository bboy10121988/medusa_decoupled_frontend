"use client"

import { useRouter } from 'next/navigation'
import { sdk } from "@lib/config"

interface SignoutButtonProps {
  countryCode: string
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export default function SignoutButton({ 
  countryCode, 
  children, 
  className,
  onClick 
}: SignoutButtonProps) {
  const router = useRouter()

  const handleSignout = async () => {
    try {
      console.log('🔄 客戶端登出：開始登出流程')
      
      // 使用 Medusa SDK 登出
      await sdk.auth.logout()
      console.log('✅ 客戶端登出：SDK 登出成功')
      
      // 可選：執行額外的回調
      if (onClick) {
        onClick()
      }
      
      // 重定向到首頁並強制刷新
      console.log('🏠 重定向到首頁')
      router.push(`/${countryCode}`)
      router.refresh()
    } catch (error) {
      console.error('❌ 客戶端登出：錯誤', error)
      
      // 即使 SDK 登出失敗，也嘗試重定向
      if (onClick) {
        onClick()
      }
      router.push(`/${countryCode}`)
      router.refresh()
    }
  }

  return (
    <button
      type="button"
      className={className}
      onClick={handleSignout}
      data-testid="logout-button"
    >
      {children}
    </button>
  )
}
"use client"

import { useRouter } from 'next/navigation'

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
      
      // 調用登出 API
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        console.log('✅ 客戶端登出：API 調用成功')
        
        // 可選：執行額外的回調
        if (onClick) {
          onClick()
        }
        
        // 重定向到首頁並強制刷新
        console.log('🏠 重定向到首頁')
        router.push(`/${countryCode}`)
        router.refresh()
      } else {
        console.error('❌ 客戶端登出：API 調用失敗')
      }
    } catch (error) {
      console.error('❌ 客戶端登出：錯誤', error)
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
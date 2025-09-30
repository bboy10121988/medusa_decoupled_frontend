"use client"

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
}: Readonly<SignoutButtonProps>) {

  const handleSignout = async () => {
    try {
      console.log('🔄 客戶端登出：開始登出流程')
      
      // 調用登出 API 來清除所有狀態
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        console.log('✅ 登出 API 調用成功')
        
        // 檢查是否有重定向標頭
        const redirectUrl = response.headers.get('X-Redirect-URL')
        if (redirectUrl) {
          console.log('🔍 收到重定向標頭:', redirectUrl)
        }
      } else {
        console.log('⚠️ 登出 API 返回錯誤，但繼續清理流程')
      }
      
      // 清除本地存儲
      if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()
      }
      
      // 可選：執行額外的回調
      if (onClick) {
        onClick()
      }
      
      // 等待一小段時間確保 cookies 完全清除
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // 重定向到帳戶頁面並強制完全重新載入
      console.log('👤 重定向到帳戶頁面')
      window.location.replace(`/${countryCode}/account`)
      
    } catch (error) {
      console.error('❌ 客戶端登出：錯誤', error)
      
      // 即使登出失敗，也嘗試清除本地狀態並重定向
      if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()
      }
      
      if (onClick) {
        onClick()
      }
      
      window.location.replace(`/${countryCode}/account`)
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
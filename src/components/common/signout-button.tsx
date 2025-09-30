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

  const handleSignout = async (e?: React.MouseEvent) => {
    // 防止事件冒泡和預設行為
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
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
      
      // 立即執行重定向
      const redirectUrl = `/${countryCode}/account`
      console.log('🔍 重定向目標:', redirectUrl)
      console.log('🔍 當前 URL:', window.location.href)
      console.log('🚀 立即執行重定向...')
      
      // 使用最強制的方法
      window.location.replace(redirectUrl)
      
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
      
      const redirectUrl = `/${countryCode}/account`
      console.log('🚀 錯誤情況下執行重定向到:', redirectUrl)
      window.location.href = redirectUrl
    }
  }

  return (
    <button
      type="button"
      className={className}
      onClick={(e) => handleSignout(e)}
      data-testid="logout-button"
    >
      {children}
    </button>
  )
}
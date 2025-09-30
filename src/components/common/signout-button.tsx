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

  const handleSignout = (e?: React.MouseEvent) => {
    // 防止事件冒泡和預設行為
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    console.log('🔄 客戶端登出：開始登出流程')
    
    // 調用登出 API
    fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then(response => {
      if (response.ok) {
        console.log('✅ 登出 API 調用成功')
      } else {
        console.log('⚠️ 登出 API 返回錯誤，但繼續清理流程')
      }
    }).catch(error => {
      console.error('❌ 客戶端登出：錯誤', error)
    }).finally(() => {
      // 清除本地存儲
      if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()
      }
      
      // 可選：執行額外的回調
      if (onClick) {
        onClick()
      }
      
      // 執行重定向
      const redirectUrl = `/${countryCode}/account`
      console.log('🔍 重定向目標:', redirectUrl)
      console.log('🔍 當前 URL:', window.location.href)
      console.log('🚀 執行重定向...')
      window.location.replace(redirectUrl)
    })
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
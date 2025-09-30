"use client"

// 客戶端登出函數
export async function clientSignout(countryCode: string) {
  try {
    console.log('🚪 開始客戶端登出流程...')
    
    // 1. 呼叫我們的登出 API 來清除 cookies
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
      console.error('⚠️ 登出 API 失敗:', response.status)
    }
  } catch (error) {
    console.error('❌ 登出請求失敗:', error)
  }

  // 2. 清除本地存儲
  try {
    localStorage.clear()
    sessionStorage.clear()
  } catch (error) {
    console.warn('⚠️ 清除本地存儲失敗:', error)
  }

  // 3. 重定向到主頁並重新載入頁面
  console.log('🔄 重定向到主頁...')
  window.location.href = `/${countryCode}`
}
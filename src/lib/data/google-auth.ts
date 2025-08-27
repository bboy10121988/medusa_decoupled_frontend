"use client"

// 客戶端專用的 Google 登入函數
export async function loginWithGoogle() {
  try {
    console.log('開始 Google 登入流程')
    
    // 使用前端代理路徑來避免 CORS 問題
    const apiUrl = '/api/medusa/auth/google'
    console.log('請求 API URL:', apiUrl)
    
    // 從後端獲取 Google OAuth 授權 URL（確保 callback URL 一致）
    const response = await fetch(apiUrl)
    
    if (!response.ok) {
      console.error('HTTP 錯誤:', response.status, response.statusText)
      throw new Error(`無法獲取 Google 授權 URL (${response.status})`)
    }
    
    const data = await response.json()
    console.log('後端回應:', data)
    
    if (!data.authUrl) {
      throw new Error('後端未返回授權 URL')
    }
    
    console.log('重定向到 Google:', data.authUrl)
    // 重定向到 Google 授權頁面
    window.location.href = data.authUrl
  } catch (error: any) {
    console.error("Google 登入錯誤:", error)
    throw new Error("Google 登入失敗，請稍後再試")
  }
}

// 處理 Google 登入回調（客戶端）
export async function handleGoogleCallback(code: string) {
  try {
    console.log('處理 Google 回調')
    
    // 驗證授權碼
    if (!code) {
      throw new Error('缺少授權碼')
    }
    
    // 使用前端代理路徑來避免 CORS 問題
    const apiUrl = '/api/medusa/auth/google/callback'
    
    // 使用固定的 callback URL（與後端環境變數一致）
    const redirectUri = "http://localhost:8000/tw/auth/google/callback"
    
    console.log('發送回調請求到後端:', { code: code.substring(0, 10) + '...', redirectUri })
    
    // 將授權碼和 redirect_uri 發送到後端進行處理
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code, redirect_uri: redirectUri }),
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('後端回調錯誤:', response.status, errorText)
      
      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { error: `HTTP ${response.status}: ${errorText}` }
      }
      
      throw new Error(errorData.error || `Google 登入失敗 (${response.status})`)
    }
    
    const { token, customer } = await response.json()
    console.log('登入成功，客戶:', customer?.email || customer?.id)
    
    if (!token) {
      throw new Error('後端未返回認證令牌')
    }
    
    // 以前是 fetch('/api/auth/set-token', ...)
    // 改成 redirect 讓 server action 設 cookie
    window.location.href = `/api/auth/set-token-redirect?token=${encodeURIComponent(token)}&redirect=/tw/account`
    // 下面的程式碼不再執行，因為會 redirect
    // return { success: true, customer }
  } catch (error: any) {
    console.error("Google 回調處理錯誤:", error)
    return { success: false, error: error.message }
  }
}

// 客戶端專用的普通登入函數
export async function loginWithEmailPassword(email: string, password: string) {
  try {
    // 驗證必填欄位
    if (!email || !password) {
      return { success: false, error: "請輸入電子郵件和密碼" }
    }

    // 驗證電子郵件格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { success: false, error: "請輸入有效的電子郵件地址" }
    }

    // 直接調用前端登入 API 而不使用 Server Action
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return { 
        success: false, 
        error: errorData.error || "登入失敗，請稍後再試" 
      }
    }

    return { success: true }
  } catch (error: any) {
    console.error("登入錯誤:", error)
    return { 
      success: false, 
      error: "登入失敗，請稍後再試" 
    }
  }
}

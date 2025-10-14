/**
 * 客戶端認證 API 工具
 * 這個檔案純粹用於客戶端，通過 API 端點與伺服器端通訊
 * 避免直接導入 next/headers
 */

interface AuthResponse {
  authenticated: boolean
  customer: any | null
  error?: string
  hasToken?: boolean
  method?: string
}

/**
 * 檢查用戶認證狀態（通過 API）
 */
export async function checkAuthenticationAPI(): Promise<AuthResponse> {
  try {
    console.log("🔍 ClientAuth: 通過 API 檢查認證狀態")
    
    const response = await fetch('/api/auth/check', {
      credentials: 'include',
      cache: 'no-cache',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    const result = await response.json()
    
    console.log("✅ ClientAuth: 基礎認證檢查完成", {
      authenticated: result.authenticated
    })
    
    return result
  } catch (error) {
    console.error("❌ ClientAuth: 認證檢查失敗", error)
    return {
      authenticated: false,
      customer: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * 獲取完整客戶資料（通過 API）
 */
export async function getCustomerAPI(): Promise<AuthResponse> {
  try {
    console.log("🔍 ClientAuth: 通過 API 獲取客戶資料")
    
    const response = await fetch('/api/auth/customer', {
      credentials: 'include',
      cache: 'no-cache',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    const result = await response.json()
    
    console.log("✅ ClientAuth: 客戶資料獲取完成", {
      authenticated: result.authenticated,
      hasCustomer: !!result.customer,
      method: result.method
    })
    
    return result
  } catch (error) {
    console.error("❌ ClientAuth: 客戶資料獲取失敗", error)
    return {
      authenticated: false,
      customer: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * 登出用戶（通過 API）
 */
export async function logoutAPI(): Promise<{ success: boolean; error?: string }> {
  try {
    console.log("🚪 ClientAuth: 通過 API 登出")
    
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    console.log("✅ ClientAuth: 登出成功")
    
    return { success: true }
  } catch (error) {
    console.error("❌ ClientAuth: 登出失敗", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * 等待認證狀態穩定的工具函數
 */
export async function waitForAuthentication(
  maxAttempts: number = 5,
  delayMs: number = 1000
): Promise<AuthResponse> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`🔄 ClientAuth: 等待認證穩定 (嘗試 ${attempt}/${maxAttempts})`)
    
    const authResult = await getCustomerAPI()
    
    if (authResult.authenticated && authResult.customer) {
      console.log("✅ ClientAuth: 認證狀態已穩定")
      return authResult
    }
    
    if (attempt < maxAttempts) {
      console.log(`⏳ ClientAuth: 等待 ${delayMs}ms 後重試...`)
      await new Promise(resolve => setTimeout(resolve, delayMs))
    }
  }
  
  console.log("❌ ClientAuth: 認證狀態等待超時")
  return {
    authenticated: false,
    customer: null,
    error: 'Authentication timeout'
  }
}
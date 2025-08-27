/**
 * 優化的 Medusa API 客戶端
 * 處理 CORS 和網路請求的最佳實踐
 */

// 獲取後端 URL
const getBackendUrl = () => {
  if (typeof window !== 'undefined') {
    // 瀏覽器環境 - 使用代理路由避免 CORS
    return '/api/medusa'
  }
  
  // 伺服器端渲染 - 直接訪問後端
  return process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 
         process.env.MEDUSA_BACKEND_URL || 
         'http://localhost:9000'
}

// 創建優化的 fetch 函數
export const medusaFetch = async (endpoint: string, options: RequestInit = {}) => {
  const baseUrl = getBackendUrl()
  const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`
  
  // 預設 headers
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...(typeof window !== 'undefined' && {
      'X-Requested-With': 'XMLHttpRequest',
    }),
  }
  
  // 合併 options
  const fetchOptions: RequestInit = {
    mode: 'cors',
    credentials: 'include',
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  }
  
  try {
    const response = await fetch(url, fetchOptions)
    
    // 檢查 CORS 錯誤
    if (!response.ok) {
      if (response.status === 0) {
        throw new Error('CORS error: Unable to connect to backend')
      }
      
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    return response
  } catch (error) {
    console.error('Medusa API 請求失敗:', error)
    
    // 提供有用的錯誤信息
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new Error('網路連接失敗，請檢查 CORS 設置和後端連接')
    }
    
    throw error
  }
}

// 便利方法
export const medusaAPI = {
  get: (endpoint: string, options?: RequestInit) => 
    medusaFetch(endpoint, { ...options, method: 'GET' }),
    
  post: (endpoint: string, data?: any, options?: RequestInit) =>
    medusaFetch(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),
    
  put: (endpoint: string, data?: any, options?: RequestInit) =>
    medusaFetch(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),
    
  delete: (endpoint: string, options?: RequestInit) =>
    medusaFetch(endpoint, { ...options, method: 'DELETE' }),
}

// CORS 檢查工具
export const checkCORS = async () => {
  try {
    const response = await medusaAPI.get('/store/products', {
      mode: 'cors',
    })
    
    console.log('✅ CORS 設置正確，API 連接正常')
    return true
  } catch (error) {
    console.error('❌ CORS 設置有問題:', error)
    return false
  }
}

// 開發環境下自動檢查 CORS
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  // 延遲檢查，等待頁面載入完成
  setTimeout(() => {
    checkCORS()
  }, 2000)
}

export default medusaAPI

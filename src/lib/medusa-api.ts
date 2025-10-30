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
  return process.env.MEDUSA_BACKEND_URL || 
         process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 
         'http://localhost:9000'
}

// 創建優化的 fetch 函數
const __isDev = process.env.NODE_ENV === 'development'
export const medusaFetch = async (endpoint: string, options: RequestInit = {}) => {
  const baseUrl = getBackendUrl()
  const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`
  const isProxy = baseUrl.startsWith('/api/medusa')
  const backendUrl = typeof window === 'undefined' ? (process.env.MEDUSA_BACKEND_URL || process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000') : ''
  const publishableKey = !isProxy
    ? (await import('./medusa-publishable-key')).getPublishableKeyForBackend(backendUrl)
    : undefined
  
  // 開發環境除錯
  if (__isDev) {
    console.log('🌐 medusaFetch debug:', {
      endpoint,
      baseUrl,
      url,
      isProxy,
      backendUrl,
      publishableKey: publishableKey ? `${publishableKey.slice(0, 10)}...` : 'undefined',
      windowDefined: typeof window !== 'undefined'
    })
  }
  
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
      ...(publishableKey ? { 'x-publishable-api-key': publishableKey } : {}),
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
    if (__isDev) console.error('Medusa API 請求失敗:', error)
    
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
      ...(data ? { body: JSON.stringify(data) } : {}),
    }),
    
  put: (endpoint: string, data?: any, options?: RequestInit) =>
    medusaFetch(endpoint, {
      ...options,
      method: 'PUT',
      ...(data ? { body: JSON.stringify(data) } : {}),
    }),
    
  delete: (endpoint: string, options?: RequestInit) =>
    medusaFetch(endpoint, { ...options, method: 'DELETE' }),
}

// CORS 檢查工具
export const checkCORS = async () => {
  try {
    await medusaAPI.get('/store/products', {
      mode: 'cors',
    })
    
    if (__isDev) console.log('✅ CORS 設置正確，API 連接正常')
    return true
  } catch (error) {
    if (__isDev) console.error('❌ CORS 設置有問題:', error)
    return false
  }
}

// 開發環境下自動檢查 CORS（暫時禁用以除錯 publishable key 問題）
// if (process.env.NODE_ENGINE === 'development' && typeof window !== 'undefined') {
//   // 延遲檢查，等待頁面載入完成
//   setTimeout(() => {
//     checkCORS()
//   }, 2000)
// }

export default medusaAPI

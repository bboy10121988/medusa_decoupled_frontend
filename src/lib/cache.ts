// 前端快取工具
class APICache {
  private cache = new Map()
  private readonly TTL = 60 * 1000 // 1分鐘

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null
    
    if (Date.now() - entry.timestamp > this.TTL) {
      this.cache.delete(key)
      return null
    }
    
    return entry.data
  }

  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  clear(): void {
    this.cache.clear()
  }

  // 自動清理過期項目
  cleanup(): void {
    const now = Date.now()
    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > this.TTL * 2) {
        this.cache.delete(key)
      }
    })
  }
}

const apiCache = new APICache()

// 定期清理快取
if (typeof window !== 'undefined') {
  setInterval(() => apiCache.cleanup(), 2 * 60 * 1000) // 每2分鐘清理一次
}

// 快取包裝的 fetch 函數
export async function cachedFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const cacheKey = `${url}${JSON.stringify(options?.body || '')}`
  
  // 檢查快取
  const cached = apiCache.get<T>(cacheKey)
  if (cached) {
    return cached
  }

  // 發起請求
  const response = await fetch(url, options)
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const data = await response.json()
  
  // 只快取 GET 請求
  if (!options?.method || options.method === 'GET') {
    apiCache.set(cacheKey, data)
  }

  return data
}

// Medusa API 呼叫助手 - 服務端版本
export async function medusaFetchServer<T>(endpoint: string): Promise<T> {
  const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'
  const fullUrl = new URL(endpoint, backendUrl)
  
  const response = await fetch(fullUrl.toString(), {
    headers: {
      'Content-Type': 'application/json',
    },
    next: { revalidate: 60 } // Next.js 快取
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}

// Medusa API 呼叫助手 - 客戶端版本
export async function medusaFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `/api/medusa-proxy?endpoint=${encodeURIComponent(endpoint)}`
  return cachedFetch<T>(url, options)
}

export { apiCache }

import { createClient } from "@sanity/client"

// 確保環境變數有值
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET

if (!projectId || !dataset) {
  throw new Error('Missing required Sanity environment variables: NEXT_PUBLIC_SANITY_PROJECT_ID and NEXT_PUBLIC_SANITY_DATASET')
}

const clientConfig: any = {
  projectId,
  dataset,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2022-03-25",
  useCdn: true,
  // 啟用 HTTP 快取
  requestTagPrefix: 'sanity',
  // 設定重試機制
  maxRetries: 3,
  retryDelay: (attemptNumber: number) => Math.min(300 * attemptNumber, 2000),
}

// 只有在 token 存在時才添加
if (process.env.SANITY_API_TOKEN) {
  clientConfig.token = process.env.SANITY_API_TOKEN
}

export const client = createClient(clientConfig)

// Helper to handle AbortError / user-abort gracefully for sanity fetches
export async function safeFetch<T = any>(query: string, params: any = {}, options: any = {}, fallback: T | null = null): Promise<any> {
  try {
    if (!projectId) {
      // console.error("Missing Sanity Project ID in environment variables")
      return fallback
    }
    
    // 增加超時設定
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10秒超時
    
    const mergedOptions = {
      ...options,
      signal: controller.signal,
    }
    
    const result = await client.fetch(query, params, mergedOptions)
    clearTimeout(timeoutId)
    return result
  } catch (error: any) {
    const msg = String(error?.message || error)
    // console.error("Sanity fetch error:", msg, "\nQuery:", query)
    
    if (error?.name === 'AbortError' || msg.includes('abort') || msg.includes('timeout')) {
      // if (isDev) console.warn('Sanity fetch aborted/timed out:', msg)
      return fallback
    }
    
    // if (isDev) console.error('Sanity fetch error details:', error)
    return fallback // 在生產環境中總是返回備用值，避免應用崩潰
  }
}

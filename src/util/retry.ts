/**
 * 重試機制工具函數
 * 用於網絡請求或其他可能失敗的異步操作
 */

/**
 * 使用重試機制執行異步函數
 * @param fn 需要重試的異步函數
 * @param options 重試選項
 * @returns 函數執行結果
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    retries?: number;          // 重試次數 (默認3次)
    initialDelay?: number;     // 初始延遲時間(毫秒) (默認300ms)
    backoffFactor?: number;    // 延遲時間增加係數 (默認1.5)
    maxDelay?: number;         // 最大延遲時間(毫秒) (默認10000ms)
    onRetry?: (attempt: number, error: any, delay: number) => void; // 重試回調
  } = {}
): Promise<T> {
  const {
    retries = 3,
    initialDelay = 300,
    backoffFactor = 1.5,
    maxDelay = 10000,
    onRetry,
  } = options

  let attempt = 0
  let delay = initialDelay

  while (true) {
    try {
      return await fn()
    } catch (error) {
      attempt++
      
      if (attempt > retries) {
        throw error
      }
      
      // 計算下一次重試的延遲時間
      delay = Math.min(delay * backoffFactor, maxDelay)
      
      // 執行重試回調（如果有）
      if (onRetry) {
        onRetry(attempt, error, delay)
      }
      
      // 等待指定時間後重試
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
}

/**
 * 使用重試機制的 fetch 函數
 * 
 * @param url 請求URL
 * @param options fetch選項
 * @param retryOptions 重試選項
 * @returns Response 對象
 */
export async function fetchWithRetry(
  url: string | URL | Request,
  options?: RequestInit,
  retryOptions?: {
    retries?: number;
    initialDelay?: number;
    backoffFactor?: number;
    maxDelay?: number;
    onRetry?: (attempt: number, error: any, delay: number) => void;
    shouldRetry?: (error: any, response?: Response) => boolean; // 判斷是否應該重試
  }
): Promise<Response> {
  const {
    shouldRetry = (error: any, response?: Response) => {
      // 默認重試所有網絡錯誤和5xx錯誤
      if (error) return true
      if (response && (response.status >= 500 || response.status === 429)) return true
      return false
    },
    onRetry,
    ...restOptions
  } = retryOptions || {}

  return withRetry(
    async () => {
      try {
        const response = await fetch(url, options)
        
        // 如果響應不成功且應該重試，則拋出錯誤
        if (!response.ok && shouldRetry(null, response)) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        return response
      } catch (error) {
        // 如果應該重試此錯誤，則重新拋出以觸發重試
        if (shouldRetry(error)) {
          throw error
        }
        // 否則，讓錯誤繼續傳播
        throw error
      }
    },
    {
      ...restOptions,
      onRetry: (attempt, error, delay) => {
        console.log(`重試請求 (${attempt}/${restOptions?.retries || 3}), 延遲: ${delay}ms, 錯誤: ${error?.message || 'Unknown error'}`)
        onRetry?.(attempt, error, delay)
      }
    }
  )
}

/**
 * 使用重試機制的 fetchJSON 函數
 * 
 * @param url 請求URL
 * @param options fetch選項
 * @param retryOptions 重試選項
 * @returns 解析後的JSON數據
 */
export async function fetchJSONWithRetry<T = any>(
  url: string | URL | Request,
  options?: RequestInit,
  retryOptions?: Parameters<typeof fetchWithRetry>[2]
): Promise<T> {
  const response = await fetchWithRetry(url, options, retryOptions)
  return response.json() as Promise<T>
}

export default {
  withRetry,
  fetchWithRetry,
  fetchJSONWithRetry
}

// API 去重器 - 防止相同請求重複執行
class RequestDeduplicator {
  private pendingRequests = new Map<string, Promise<any>>()

  async dedupe<T>(key: string, fn: () => Promise<T>): Promise<T> {
    // 如果已有相同請求在進行中，返回該 Promise
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key)!
    }

    // 執行新請求
    const promise = fn().finally(() => {
      // 請求完成後清除記錄
      this.pendingRequests.delete(key)
    })

    this.pendingRequests.set(key, promise)
    return promise
  }

  // 清除所有待處理請求
  clear() {
    this.pendingRequests.clear()
  }

  // 獲取當前待處理請求數量
  get pendingCount() {
    return this.pendingRequests.size
  }
}

// 全域去重器實例
export const requestDeduplicator = new RequestDeduplicator()

// 批次請求工具
export class BatchRequest<T> {
  private batch: Array<{ key: string; resolve: (value: T) => void; reject: (error: any) => void }> = []
  private timer: NodeJS.Timeout | null = null
  private readonly delay: number

  constructor(delay: number = 50) {
    this.delay = delay
  }

  async add(key: string, fetcher: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.batch.push({ key, resolve, reject })

      if (this.timer) {
        clearTimeout(this.timer)
      }

      this.timer = setTimeout(async () => {
        await this.flush(fetcher)
      }, this.delay)
    })
  }

  private async flush(fetcher: () => Promise<T>) {
    const currentBatch = [...this.batch]
    this.batch = []
    this.timer = null

    try {
      // 去重相同的 key
      const uniqueKeys = Array.from(new Set(currentBatch.map(item => item.key)))
      
      // 這裡可以根據需要實現批次邏輯
      // 目前簡單地執行第一個請求並將結果分發給所有相同 key 的請求
      const results = new Map<string, T>()
      
      for (const key of uniqueKeys) {
        try {
          const result = await fetcher()
          results.set(key, result)
        } catch (error) {
          // 處理單個請求錯誤
          currentBatch
            .filter(item => item.key === key)
            .forEach(item => item.reject(error))
        }
      }

      // 分發結果
      currentBatch.forEach(item => {
        const result = results.get(item.key)
        if (result !== undefined) {
          item.resolve(result)
        }
      })

    } catch (error) {
      // 處理整體錯誤
      currentBatch.forEach(item => item.reject(error))
    }
  }
}

export default requestDeduplicator

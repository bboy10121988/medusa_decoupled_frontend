// 全域錯誤處理，特別針對 Sanity 的 AbortError
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // 保存原始的 console.error 方法
  const originalConsoleError = console.error

  // 覆蓋 console.error 來過濾 Sanity AbortError
  console.error = function(...args) {
    const errorMessage = args[0]?.toString() || ''
    const errorStack = args[0]?.stack || ''
    
    // 檢查是否為 Sanity 相關的 AbortError
    if (errorMessage.includes('AbortError: signal is aborted without reason') ||
        errorStack.includes('EventSourcePolyfill.close') ||
        errorStack.includes('@sanity/client') ||
        errorStack.includes('useTasksStore.useEffect')) {
      // 將錯誤降級為警告
      // console.warn('Sanity EventSource AbortError (handled):', errorMessage)
      return
    }
    
    // 對於其他錯誤，使用原始的 console.error
    originalConsoleError.apply(console, args)
  }

  // 捕獲未處理的 Promise rejection
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason?.name === 'AbortError' && 
        event.reason?.message?.includes('signal is aborted')) {
      // console.warn('Sanity EventSource AbortError caught and ignored:', event.reason)
      event.preventDefault() // 防止錯誤在控制台中顯示
    }
  })

  // 捕獲一般錯誤
  window.addEventListener('error', (event) => {
    if (event.error?.name === 'AbortError' && 
        event.error?.message?.includes('signal is aborted')) {
      // console.warn('Sanity EventSource AbortError caught and ignored:', event.error)
      event.preventDefault()
    }
  })

  // 監聽 EventSource 錯誤並添加更好的清理邏輯
  const originalEventSource = window.EventSource
  if (originalEventSource) {
    window.EventSource = class extends originalEventSource {
      constructor(url: string | URL, eventSourceInitDict?: EventSourceInit) {
        super(url, eventSourceInitDict)
        
        // 添加錯誤處理
        this.addEventListener('error', () => {
          // console.warn('EventSource error (possibly Sanity related):', e)
        })

        // 設置超時自動關閉連接
        const timeout = setTimeout(() => {
          if (this.readyState !== this.CLOSED) {
            // console.warn('Auto-closing EventSource connection after timeout')
            this.close()
          }
        }, 30000) // 30秒超時

        this.addEventListener('open', () => {
          clearTimeout(timeout)
        })

        // 保存引用以供清理
        const sources = (window as any).__sanityEventSources || []
        sources.push(this)
        ;(window as any).__sanityEventSources = sources
        
        // 限制最大連接數
        if (sources.length > 5) {
          const oldSource = sources.shift()
          if (oldSource && oldSource.readyState !== oldSource.CLOSED) {
            oldSource.close()
          }
        }
      }

      close() {
        try {
          super.close()
        } catch (error) {
          // 忽略關閉時的錯誤
          // console.warn('Error closing EventSource (ignored):', error)
        }
      }
    }
  }

  // 定期清理舊的 EventSource 連接
  setInterval(() => {
    const sources = (window as any).__sanityEventSources || []
    const activeSources = sources.filter((source: EventSource) => {
      if (source.readyState === source.CLOSED) {
        return false
      }
      return true
    })
    ;(window as any).__sanityEventSources = activeSources
  }, 60000) // 每分鐘清理一次
}

export {}

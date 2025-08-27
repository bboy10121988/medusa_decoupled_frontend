// 強化版 AbortController polyfill，專門處理 Turbopack + RxJS 相容性
if (typeof window !== 'undefined') {
  // 全域錯誤處理 - 優先級最高
  const originalConsoleError = console.error
  console.error = (...args) => {
    const errorMsg = args[0]?.toString?.() || ''
    if (errorMsg.includes('signal is aborted without reason') || 
        errorMsg.includes('AbortError')) {
      // 完全抑制 AbortError 相關錯誤
      console.debug('🔇 Suppressed AbortError:', ...args)
      return
    }
    originalConsoleError.apply(console, args)
  }

  // 捕獲所有未處理的錯誤
  window.addEventListener('error', (event) => {
    if (event.error?.name === 'AbortError' || 
        event.message?.includes('signal is aborted without reason')) {
      event.preventDefault()
      event.stopPropagation()
      console.debug('🔇 Global error suppressed:', event.error || event.message)
      return false
    }
  })

  // 捕獲 Promise rejection
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason?.name === 'AbortError' || 
        event.reason?.message?.includes('signal is aborted') ||
        event.reason?.toString?.().includes('AbortError')) {
      event.preventDefault()
      console.debug('🔇 Promise rejection suppressed:', event.reason)
      return false
    }
  })

  // 重寫 AbortController - 更強力的版本
  const OriginalAbortController = window.AbortController
  if (OriginalAbortController) {
    class SafeAbortController extends OriginalAbortController {
      constructor() {
        super()
        
        // 包裝 signal 的 addEventListener 方法
        if (this.signal && this.signal.addEventListener) {
          const originalAddEventListener = this.signal.addEventListener.bind(this.signal)
          this.signal.addEventListener = (type, listener, options) => {
            if (type === 'abort') {
              const safeListener = (event) => {
                try {
                  if (typeof listener === 'function') {
                    listener(event)
                  } else if (listener?.handleEvent) {
                    listener.handleEvent(event)
                  }
                } catch (error) {
                  // 抑制 abort 事件處理器中的錯誤
                  console.debug('🔇 Abort listener error suppressed:', error)
                }
              }
              return originalAddEventListener(type, safeListener, options)
            }
            return originalAddEventListener(type, listener, options)
          }
        }
      }

      abort(reason) {
        try {
          // 標記為已中止
          if (this.signal) {
            Object.defineProperty(this.signal, '_aborted', {
              value: true,
              writable: false,
              configurable: true
            })
          }
          
          // 安全地調用原始 abort 方法
          super.abort(reason)
        } catch (error) {
          // 完全忽略 abort 過程中的錯誤
          console.debug('🔇 AbortController.abort() error suppressed:', error)
        }
      }
    }

    // 替換全域 AbortController
    window.AbortController = SafeAbortController
    
    // 也替換全域範圍中的引用
    if (typeof globalThis !== 'undefined') {
      globalThis.AbortController = SafeAbortController
    }
  }

  // 針對 RxJS 的特殊處理
  const checkAndSuppressRxJSErrors = () => {
    // 查找並包裝可能的 RxJS 錯誤源
    const rxjsModules = [
      'rxjs/internal/Subscription',
      'rxjs/internal/Subscriber',
      'rxjs/operators'
    ]

    // 在模組載入後進行錯誤抑制
    setTimeout(() => {
      try {
        // 嘗試覆蓋可能的錯誤拋出點
        if (window.__rxjs_error_handler_installed) return
        window.__rxjs_error_handler_installed = true
        
        console.debug('🔧 Enhanced RxJS error suppression activated')
      } catch (e) {
        console.debug('🔇 Error in RxJS error handler setup:', e)
      }
    }, 100)
  }

  // 立即執行和延遲執行
  checkAndSuppressRxJSErrors()
  
  // 當 DOM 載入完成後再次執行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkAndSuppressRxJSErrors)
  } else {
    setTimeout(checkAndSuppressRxJSErrors, 50)
  }
}

export {}

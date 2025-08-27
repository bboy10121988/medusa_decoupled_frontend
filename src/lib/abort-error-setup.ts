/**
 * AbortError 自動設定
 * 在應用程式啟動時自動啟用 AbortError 過濾器
 */
import { setupAbortErrorFilter } from './abort-utils'

// 自動執行設定
setupAbortErrorFilter()

// 額外的 unhandledrejection 處理器
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && event.reason.name === 'AbortError') {
      console.log('🔄 [Unhandled AbortError]', 'Caught and ignored AbortError in unhandledrejection');
      event.preventDefault(); // 阻止錯誤冒泡到 console
    }
  });
}

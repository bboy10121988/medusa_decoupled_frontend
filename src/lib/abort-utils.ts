/**
 * AbortError 檢測與處理工具
 * 用於 Turbopack + Next.js 環境下正確處理請求中止
 */

/**
 * 檢測是否為 AbortError
 * @param err 錯誤對象
 * @returns boolean
 */
export function isAbortError(err: unknown): boolean {
  return (
    (err as any)?.name === 'AbortError' ||
    (err as any)?.code === 'ABORT_ERR' ||
    (typeof (err as any)?.message === 'string' &&
      /(aborted|AbortError|signal is aborted)/i.test((err as any).message))
  );
}

/**
 * AbortError 安全處理器 - 通用版本
 * 可用於 Promise.catch() 或一般錯誤處理
 */
export function handleAbortError<T>(fallbackValue: T) {
  return (err: unknown): T | never => {
    if (isAbortError(err)) {
      console.log('🔄 [Request Cancelled]', 'Request was cancelled (normal behavior)');
      return fallbackValue;
    }
    throw err;
  };
}

/**
 * 創建具有超時和中止能力的 AbortController
 * @param timeoutMs 超時毫秒數 (可選)
 * @returns AbortController
 */
export function createAbortController(timeoutMs?: number): AbortController {
  const controller = new AbortController();
  
  if (timeoutMs && timeoutMs > 0) {
    const timeoutId = setTimeout(() => {
      if (!controller.signal.aborted) {
        controller.abort('Request timeout');
      }
    }, timeoutMs);
    
    // 當請求完成時清理計時器
    controller.signal.addEventListener('abort', () => {
      clearTimeout(timeoutId);
    });
  }
  
  return controller;
}

/**
 * 全域錯誤過濾器 - 過濾 console 中的 AbortError
 * 只在開發環境啟用
 */
export function setupAbortErrorFilter() {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    const originalError = console.error;
    const originalWarn = console.warn;
    
    console.error = (...args: any[]) => {
      const errorMessage = args.join(' ');
      if (/(AbortError|signal is aborted|aborted without reason)/i.test(errorMessage)) {
        console.log('🔄 [Request Cancelled]', 'Request was cancelled (normal in development mode)');
        return;
      }
      originalError.apply(console, args);
    };
    
    console.warn = (...args: any[]) => {
      const warnMessage = args.join(' ');
      if (/(AbortError|signal is aborted|aborted without reason)/i.test(warnMessage)) {
        return; // 完全忽略 AbortError 警告
      }
      originalWarn.apply(console, args);
    };
    
    console.log('🛡️ AbortError filter activated (development mode)');
  }
}

/**
 * React Hook: 用於組件卸載時自動中止請求
 * @param deps 依賴數組
 * @returns AbortController
 */
export function useAbortController(deps: any[] = []) {
  // 動態導入 React hooks 以避免服務端渲染問題
  if (typeof window !== 'undefined') {
    try {
      const { useEffect, useMemo } = require('react');
      
      const controller = useMemo(() => new AbortController(), deps);
      
      useEffect(() => {
        return () => {
          if (!controller.signal.aborted) {
            controller.abort('Component unmounted');
          }
        };
      }, [controller]);
      
      return controller;
    } catch (e) {
      console.warn('React hooks not available, returning basic AbortController');
    }
  }
  
  // 服務端或無 React 時的 fallback
  return new AbortController();
}

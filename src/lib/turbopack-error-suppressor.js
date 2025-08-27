// 簡單但有效的 AbortError 抑制器 - 專為 Turbopack 設計
(function() {
  'use strict';
  
  if (typeof window === 'undefined') return;

  // 方法 1: 直接抑制 console.error 中的 AbortError
  const originalError = console.error;
  console.error = function(...args) {
    const message = args.join(' ').toString();
    if (message.includes('signal is aborted without reason') || 
        message.includes('AbortError')) {
      // 改為 debug 級別輸出，不會顯示紅色錯誤
      console.debug('🔇 [Suppressed AbortError]:', ...args);
      return;
    }
    originalError.apply(console, args);
  };

  // 方法 2: 全域錯誤捕獲
  window.addEventListener('error', function(event) {
    if (event.error?.name === 'AbortError' || 
        event.message?.includes('signal is aborted')) {
      event.preventDefault();
      event.stopPropagation();
      console.debug('🔇 [Global AbortError suppressed]:', event.error);
      return false;
    }
  }, true); // 使用 capture 階段

  // 方法 3: Promise rejection 捕獲
  window.addEventListener('unhandledrejection', function(event) {
    const reason = event.reason;
    if (reason?.name === 'AbortError' || 
        (reason && reason.toString().includes('AbortError')) ||
        (reason?.message && reason.message.includes('signal is aborted'))) {
      event.preventDefault();
      console.debug('🔇 [Promise AbortError suppressed]:', reason);
      return false;
    }
  }, true);

  // 方法 4: 設定標記表示錯誤抑制已啟用
  window.__abort_error_suppressor_active = true;
  console.debug('🛡️ AbortError suppressor activated for Turbopack');

})();

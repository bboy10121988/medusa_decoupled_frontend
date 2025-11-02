"use client"

import { sdk } from "@lib/config"

// 客戶端登出函數
export async function clientSignout(countryCode: string) {
  try {
    // console.log('🚪 開始客戶端登出流程...')
    
    // 使用 Medusa SDK 登出
    await sdk.auth.logout()
    // console.log('✅ SDK 登出成功')
  } catch (error) {
    // console.error('❌ SDK 登出失敗:', error)
  }

  // 清除本地存儲（可選的額外清理）
  try {
    localStorage.clear()
    sessionStorage.clear()
  } catch (error) {
    // console.warn('⚠️ 清除本地存儲失敗:', error)
  }

  // 重定向到主頁並重新載入頁面
  // console.log('🔄 重定向到主頁...')
  window.location.href = `/${countryCode}`
}
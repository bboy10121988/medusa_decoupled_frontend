// ⚠️ 這個API路由已廢棄 - 根據 google_login_mermaid.md 流程圖
// Google OAuth 應該完全由 Medusa 後端處理，前端使用 sdk.auth.login("customer", "google", {})
// 保留此檔案僅供參考，建議移除

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  return NextResponse.json({ 
    error: '此API已廢棄',
    message: 'Google OAuth 由 Medusa 後端處理，請使用前端組件中的 sdk.auth.login("customer", "google", {}) 方法',
    documentation: '請參考 google_login_mermaid.md 了解正確的實作流程'
  }, { status: 410 }) // 410 Gone - 資源已不再可用
}

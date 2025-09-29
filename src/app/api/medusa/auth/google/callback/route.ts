// ⚠️ 這個API路由已廢棄 - 根據 google_login_mermaid.md 流程圖
// Google OAuth callback 應該完全由 Medusa 後端處理
// 前端應該使用 src/app/tw/auth/google/callback/page.tsx 處理回調

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  return NextResponse.json({ 
    error: '此API已廢棄',
    message: 'Google OAuth callback 由 Medusa 後端處理，請使用頁面路由 /tw/auth/google/callback',
    documentation: '請參考 google_login_mermaid.md 了解正確的實作流程'
  }, { status: 410 }) // 410 Gone - 資源已不再可用
}

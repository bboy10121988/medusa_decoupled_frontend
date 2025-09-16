import { affiliateSignout } from '@lib/data/affiliate-auth'
import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // 默認國家代碼
    const countryCode = 'tw'
    
    await affiliateSignout(countryCode)
    
    return Response.json({ success: true })
  } catch (error: any) {
    // 檢查是否是 Next.js redirect 錯誤
    if (error?.digest?.startsWith?.('NEXT_REDIRECT')) {
      // 這是正常的重定向，重新拋出讓 Next.js 處理
      throw error
    }
    
    console.error('Affiliate signout error:', error)
    return Response.json({ error: '登出失敗' }, { status: 500 })
  }
}

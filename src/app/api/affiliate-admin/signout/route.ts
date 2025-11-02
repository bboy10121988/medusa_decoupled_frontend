import { affiliateAdminSignout } from '../../../../lib/data/affiliate-admin-auth'
import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // 從請求參數獲取國家代碼，預設為 tw
    const { searchParams } = new URL(request.url)
    const countryCode = searchParams.get('countryCode') || 'tw'
    
    await affiliateAdminSignout(countryCode)
    
    return Response.json({ success: true })
  } catch (error: any) {
    // 檢查是否是 Next.js redirect 錯誤
    if (error?.digest?.startsWith?.('NEXT_REDIRECT')) {
      // 這是正常的重定向，重新拋出讓 Next.js 處理
      throw error
    }
    
    // console.error('Affiliate admin signout error:', error)
    return Response.json({ error: '登出失敗' }, { status: 500 })
  }
}

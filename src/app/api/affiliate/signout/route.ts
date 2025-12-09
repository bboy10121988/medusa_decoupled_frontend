import { affiliateSignout } from '../../../../lib/data/affiliate-auth'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // 從請求參數獲取國家代碼，預設為 tw
    const { searchParams } = new URL(request.url)
    const countryCode = searchParams.get('countryCode') || 'tw'
    
    await affiliateSignout(countryCode)
    
    // 這裡的代碼不會被執行，因為 affiliateSignout 會拋出 redirect 錯誤
    return Response.json({ success: true })
  } catch (error: any) {
    // 檢查是否是 Next.js redirect 錯誤
    if (error?.digest?.startsWith?.('NEXT_REDIRECT') || error?.message === 'NEXT_REDIRECT') {
      // 這是正常的重定向，重新拋出讓 Next.js 處理
      throw error
    }
    
    console.error('Affiliate signout error:', error)
    return Response.json({ error: 'Signout failed' }, { status: 500 })
  }
}

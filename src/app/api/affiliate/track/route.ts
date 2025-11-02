import { NextRequest, NextResponse } from 'next/server'
import { recordClick } from '../../../../lib/data/affiliate-stats'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const ref = searchParams.get('ref')
  const affiliateId = searchParams.get('affiliate_id')
  const linkId = searchParams.get('linkId')
  const targetUrl = searchParams.get('target') || '/'

  // 記錄點擊
  if (ref || affiliateId) {
    try {
      // 獲取請求資訊
      const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
      const userAgent = request.headers.get('user-agent') || 'unknown'
      const referrer = request.headers.get('referer') || undefined

      // 記錄到 JSON 檔案
      const clickId = await recordClick(
        ref || affiliateId || 'unknown',
        linkId || 'direct',
        ip,
        userAgent,
        referrer
      )

      // console.log('✅ 聯盟連結點擊已記錄:', {
        // clickId,
        // affiliateId: ref || affiliateId,
        // linkId,
        // timestamp: new Date().toISOString(),
        // ip,
        // targetUrl
      // })

      // 設置響應 headers 來追蹤轉換
      const response = NextResponse.redirect(new URL(targetUrl, request.url))
      
      // 設置 cookie 來追蹤這個用戶的聯盟來源
      if (ref) {
        response.cookies.set('affiliate_ref', ref, {
          maxAge: 30 * 24 * 60 * 60, // 30 天
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        })
      }

      if (affiliateId) {
        response.cookies.set('affiliate_id', affiliateId, {
          maxAge: 30 * 24 * 60 * 60, // 30 天  
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        })
      }

      return response

    } catch (error) {
      // console.error('追蹤聯盟點擊失敗:', error)
    }
  }

  // 如果沒有聯盟參數，直接重定向到目標頁面
  return NextResponse.redirect(new URL(targetUrl, request.url))
}

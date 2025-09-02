import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 聯盟追蹤中介軟體
export function affiliateTrackingMiddleware(request: NextRequest) {
  const response = NextResponse.next()
  const url = request.nextUrl.clone()
  
  // 檢查 URL 中是否包含聯盟參數
  const affiliateRef = url.searchParams.get('ref')
  const affiliateId = url.searchParams.get('affiliate_id')
  const utmSource = url.searchParams.get('utm_source')
  const utmMedium = url.searchParams.get('utm_medium')
  const utmCampaign = url.searchParams.get('utm_campaign')
  
  // 如果有聯盟參數，設定追蹤 cookies
  if (affiliateRef || affiliateId) {
    // 設定聯盟 ID cookie（30天過期）
    if (affiliateRef) {
      response.cookies.set('affiliate_ref', affiliateRef, {
        maxAge: 30 * 24 * 60 * 60, // 30 天
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
      })
    }
    
    if (affiliateId && affiliateId !== affiliateRef) {
      response.cookies.set('affiliate_id', affiliateId, {
        maxAge: 30 * 24 * 60 * 60,
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
      })
    }
    
    // 設定 UTM 參數 cookies
    if (utmSource) {
      response.cookies.set('utm_source', utmSource, {
        maxAge: 30 * 24 * 60 * 60,
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
      })
    }
    
    if (utmMedium) {
      response.cookies.set('utm_medium', utmMedium, {
        maxAge: 30 * 24 * 60 * 60,
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
      })
    }
    
    if (utmCampaign) {
      response.cookies.set('utm_campaign', utmCampaign, {
        maxAge: 30 * 24 * 60 * 60,
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
      })
    }
    
    // 記錄點擊追蹤
    const trackingData = {
      affiliateId: affiliateRef || affiliateId,
      timestamp: Date.now(),
      referrer: request.headers.get('referer'),
      userAgent: request.headers.get('user-agent'),
      ip: request.ip || request.headers.get('x-forwarded-for'),
      utmSource,
      utmMedium,
      utmCampaign,
      path: url.pathname
    }
    
    // 在生產環境中，這裡應該儲存到資料庫
    console.log('聯盟點擊追蹤:', trackingData)
    
    // 移除 URL 中的聯盟參數，避免顯示在網址列
    url.searchParams.delete('ref')
    url.searchParams.delete('affiliate_id')
    url.searchParams.delete('utm_source')
    url.searchParams.delete('utm_medium')
    url.searchParams.delete('utm_campaign')
    url.searchParams.delete('utm_content')
    url.searchParams.delete('utm_term')
    url.searchParams.delete('t') // 時間戳
    
    // 如果 URL 有變化，重新導向到乾淨的 URL
    if (url.href !== request.url) {
      return NextResponse.redirect(url.href)
    }
  }
  
  return response
}

// 聯盟轉換追蹤函數（在訂單完成時呼叫）
export async function trackAffiliateConversion(
  orderId: string, 
  orderTotal: number, 
  customerEmail: string
) {
  try {
    // 在實際應用中，這個函數應該在伺服器端呼叫
    const response = await fetch('/api/affiliate/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderId,
        orderTotal,
        customerEmail,
        timestamp: Date.now()
      }),
    })
    
    if (response.ok) {
      const result = await response.json()
      console.log('聯盟轉換追蹤成功:', result)
      return result
    } else {
      console.error('聯盟轉換追蹤失敗:', response.statusText)
    }
  } catch (error) {
    console.error('聯盟轉換追蹤錯誤:', error)
  }
}

// 佣金計算函數
export function calculateAffiliateCommission(
  orderTotal: number, 
  affiliateLevel: 'bronze' | 'silver' | 'gold' | 'platinum' = 'bronze'
): number {
  const commissionRates = {
    bronze: 0.05,    // 5%
    silver: 0.08,    // 8%
    gold: 0.12,      // 12%
    platinum: 0.15   // 15%
  }
  
  const rate = commissionRates[affiliateLevel]
  return Math.round(orderTotal * rate * 100) / 100
}

// 客戶端聯盟追蹤工具
export const clientAffiliateUtils = {
  // 從 Cookie 讀取聯盟資訊
  getAffiliateInfo(): {
    affiliateRef?: string
    affiliateId?: string
    utmSource?: string
    utmMedium?: string
    utmCampaign?: string
  } | null {
    if (typeof document === 'undefined') return null
    
    try {
      const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=')
        acc[key] = decodeURIComponent(value || '')
        return acc
      }, {} as Record<string, string>)
      
      const affiliateRef = cookies.affiliate_ref
      const affiliateId = cookies.affiliate_id
      
      if (!affiliateRef && !affiliateId) return null
      
      return {
        affiliateRef,
        affiliateId,
        utmSource: cookies.utm_source,
        utmMedium: cookies.utm_medium,
        utmCampaign: cookies.utm_campaign
      }
    } catch (error) {
      console.error('讀取聯盟資訊失敗:', error)
      return null
    }
  },
  
  // 清除聯盟追蹤 Cookie
  clearTracking() {
    const cookiesToClear = [
      'affiliate_ref',
      'affiliate_id', 
      'utm_source',
      'utm_medium',
      'utm_campaign'
    ]
    
    cookiesToClear.forEach(name => {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
    })
  }
}

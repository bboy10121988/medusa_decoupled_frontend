import { cookies } from 'next/headers'

export async function trackAffiliateConversion(orderId: string, orderTotal: number) {
  try {
    const cookieStore = await cookies()
    const affiliateRef = cookieStore.get('affiliate_ref')?.value
    const affiliateId = cookieStore.get('affiliate_id')?.value

    if (affiliateRef || affiliateId) {
      // 在實際應用中，這裡應該：
      // 1. 計算佣金金額（基於訂單總額和佣金率）
      // 2. 記錄轉換到資料庫
      // 3. 更新聯盟會員的統計數據
      // 4. 發送通知給聯盟會員

      const commissionRate = 0.05 // 5% 佣金率
      const commissionAmount = orderTotal * commissionRate

      console.log('聯盟轉換追蹤:', {
        orderId,
        orderTotal,
        affiliateRef,
        affiliateId,
        commissionAmount,
        timestamp: new Date().toISOString()
      })

      // 模擬發送到後端 API
      const conversionData = {
        orderId,
        orderTotal,
        affiliateRef,
        affiliateId,
        commissionAmount,
        timestamp: new Date().toISOString()
      }

      // 在真實環境中，這裡會發送到後端 API
      console.log('佣金記錄:', conversionData)

      // 清除追蹤 cookies（轉換已完成）
      const response = new Response()
      response.headers.set('Set-Cookie', 'affiliate_ref=; Max-Age=0; Path=/')
      response.headers.set('Set-Cookie', 'affiliate_id=; Max-Age=0; Path=/')

      return conversionData
    }

    return null
  } catch (error) {
    console.error('追蹤聯盟轉換失敗:', error)
    return null
  }
}

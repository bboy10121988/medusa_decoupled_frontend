import { NextRequest, NextResponse } from 'next/server'

// GET /api/store-policies - 前端獲取商店政策
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    // 從 Medusa 後端 store API 獲取政策（無需認證）
    const backendUrl = process.env.MEDUSA_BACKEND_URL || process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'
    const { getPublishableKeyForBackend } = await import('@lib/medusa-publishable-key')
    const publishableKey = getPublishableKeyForBackend(process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL)
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    
    if (publishableKey) {
      headers['x-publishable-api-key'] = publishableKey
    }
    
    const response = await fetch(`${backendUrl}/store/store-policies`, {
      cache: 'no-store', // 確保獲取最新資料
      headers
    })

    if (response.ok) {
      const data = await response.json()
      return NextResponse.json({ policies: data.policies })
    }

    // 如果後端 API 失敗，返回預設值
    const defaultPolicies = {
      shipping: {
        title: "快速配送",
        description: "週一至週五 14:00 前下單，隔日送達 (假日順延)。全台灣本島地區免運費，離島地區需額外運費。"
      },
      inventory: {
        title: "庫存政策", 
        description: "我們的庫存數量實時更新。商品頁面上標示的庫存數量為目前可購買的確切數量。"
      },
      exchange: {
        title: "簡單換貨",
        description: "尺寸不合適？收到商品後7天內可申請換貨，商品需保持全新狀態且包裝完整。"
      },
      return: {
        title: "輕鬆退貨",
        description: "收到商品後7天內可申請退貨。只需退回您的產品，我們將退還您的款項。客製化商品、特價商品不適用退換貨政策。"
      },
      notice: {
        title: "特殊注意事項",
        description: "因拍攝光線和顯示器設定不同，實際商品顏色可能與圖片略有差異。尺寸資訊供參考，實際尺寸可能有±1-2cm誤差。"
      }
    }

    return NextResponse.json({ policies: defaultPolicies })
  } catch (error) {
    console.error('Failed to fetch store policies from backend:', error)
    
    // 發生錯誤時返回預設值
    const defaultPolicies = {
      shipping: {
        title: "快速配送",
        description: "週一至週五 14:00 前下單，隔日送達 (假日順延)。全台灣本島地區免運費，離島地區需額外運費。"
      },
      inventory: {
        title: "庫存政策", 
        description: "我們的庫存數量實時更新。商品頁面上標示的庫存數量為目前可購買的確切數量。"
      },
      exchange: {
        title: "簡單換貨",
        description: "尺寸不合適？收到商品後7天內可申請換貨，商品需保持全新狀態且包裝完整。"
      },
      return: {
        title: "輕鬆退貨",
        description: "收到商品後7天內可申請退貨。只需退回您的產品，我們將退還您的款項。客製化商品、特價商品不適用退換貨政策。"
      },
      notice: {
        title: "特殊注意事項",
        description: "因拍攝光線和顯示器設定不同，實際商品顏色可能與圖片略有差異。尺寸資訊供參考，實際尺寸可能有±1-2cm誤差。"
      }
    }

    return NextResponse.json({ policies: defaultPolicies })
  }
}

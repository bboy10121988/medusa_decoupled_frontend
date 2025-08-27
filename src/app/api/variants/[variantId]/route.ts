import { NextRequest, NextResponse } from "next/server"
import { MEDUSA_BACKEND_URL } from "@lib/config"

/**
 * 重試機制封裝函數
 * @param fn 需要重試的異步函數
 * @param retries 重試次數
 * @param delay 重試延遲(ms)
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 300
): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    if (retries <= 0) throw error
    await new Promise(resolve => setTimeout(resolve, delay))
    return withRetry(fn, retries - 1, delay * 1.5)
  }
}

/**
 * API 路由處理程序 - 獲取變體庫存
 * 
 * 此路由代理請求到 Medusa 後端以避免 CORS 和環境變數問題
 * 包含重試機制，提高穩定性
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { variantId: string } }
) {
  try {
    const { variantId } = params
    
    if (!variantId) {
      return NextResponse.json(
        { error: "Missing variant ID" },
        { status: 400 }
      )
    }
    
    // 獲取 Medusa 後端 URL
    const baseUrl = MEDUSA_BACKEND_URL || process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
    
    // 從 Medusa 獲取變體數據 (使用重試機制)
    const fetchVariant = async () => {
      const response = await fetch(`${baseUrl}/store/variants/${variantId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Error fetching variant: ${response.status} ${errorText}`)
        throw new Error(`Failed to fetch variant: ${response.statusText}`)
      }
      
      return response.json()
    }
    
    // 使用重試機制獲取變體數據
    const data = await withRetry(fetchVariant)
    
    // 擴展響應數據，增加更多有用信息
    return NextResponse.json({
      ...data,
      _meta: {
        timestamp: new Date().toISOString(),
        source: baseUrl
      }
    })
  } catch (error) {
    console.error("Error in variant API route:", error)
    
    return NextResponse.json(
      { 
        error: "Internal server error", 
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

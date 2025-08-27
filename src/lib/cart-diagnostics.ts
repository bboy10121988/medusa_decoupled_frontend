/**
 * 購物車診斷工具
 * 用於調試購物車功能問題
 */

export interface CartDiagnostics {
  checkAddToCart: () => Promise<DiagnosticResult>
  checkCartState: () => Promise<DiagnosticResult>
  testVariantPrice: (variantId: string) => Promise<DiagnosticResult>
}

interface DiagnosticResult {
  success: boolean
  message: string
  data?: any
  error?: any
}

export class CartDiagnostics {
  
  /**
   * 檢查加入購物車功能
   */
  static async checkAddToCart(): Promise<DiagnosticResult> {
    try {
      // 測試加入購物車 API
      const testVariantId = "variant_01K3JG502K06HX2K6F7DJATDYZ" // 使用你提到的變體 ID
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          variantId: testVariantId,
          quantity: 1,
          countryCode: 'tw'
        })
      })
      
      const data = await response.json()
      
      if (response.ok && data.success) {
        return {
          success: true,
          message: '✅ 加入購物車 API 正常工作',
          data
        }
      } else {
        return {
          success: false,
          message: '❌ 加入購物車 API 失敗',
          error: data
        }
      }
    } catch (error) {
      return {
        success: false,
        message: '❌ 加入購物車 API 請求失敗',
        error
      }
    }
  }

  /**
   * 檢查購物車狀態
   */
  static async checkCartState(): Promise<DiagnosticResult> {
    try {
      const response = await fetch('/api/cart/get', {
        method: 'GET',
      })
      
      const data = await response.json()
      
      return {
        success: response.ok,
        message: response.ok ? '✅ 購物車狀態檢查成功' : '❌ 購物車狀態檢查失敗',
        data
      }
    } catch (error) {
      return {
        success: false,
        message: '❌ 購物車狀態檢查請求失敗',
        error
      }
    }
  }

  /**
   * 測試變體價格問題
   */
  static async testVariantPrice(variantId: string): Promise<DiagnosticResult> {
    try {
      // 直接從 Medusa API 檢查變體信息
      const medusaBaseUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://35.236.182.29:9000'
      const response = await fetch(`${medusaBaseUrl}/store/products/${variantId.replace('variant_', 'prod_')}`)
      
      if (!response.ok) {
        return {
          success: false,
          message: '❌ 無法從 Medusa 獲取變體信息',
          error: `HTTP ${response.status}`
        }
      }

      const data = await response.json()
      const product = data.product
      const variant = product?.variants?.find((v: any) => v.id === variantId)
      
      if (!variant) {
        return {
          success: false,
          message: '❌ 找不到指定的變體',
          data: { variantId, availableVariants: product?.variants?.map((v: any) => v.id) }
        }
      }
      
      // 檢查價格
      if (!variant.prices || variant.prices.length === 0) {
        return {
          success: false,
          message: '❌ 變體沒有配置價格',
          data: { variant }
        }
      }
      
      return {
        success: true,
        message: '✅ 變體價格配置正常',
        data: {
          variantId: variant.id,
          title: variant.title,
          prices: variant.prices,
          inventory_quantity: variant.inventory_quantity
        }
      }
    } catch (error) {
      return {
        success: false,
        message: '❌ 變體價格檢查失敗',
        error
      }
    }
  }

  /**
   * 運行完整診斷
   */
  static async runFullDiagnostic(): Promise<{
    addToCart: DiagnosticResult
    cartState: DiagnosticResult
    variantPrice: DiagnosticResult
  }> {
    console.log('🔍 開始購物車診斷...')
    
    const [addToCart, cartState, variantPrice] = await Promise.all([
      this.checkAddToCart(),
      this.checkCartState(),
      this.testVariantPrice("variant_01K3JG502K06HX2K6F7DJATDYZ")
    ])
    
    console.log('📊 診斷結果:')
    console.log('加入購物車:', addToCart.message)
    console.log('購物車狀態:', cartState.message)
    console.log('變體價格:', variantPrice.message)
    
    return {
      addToCart,
      cartState,
      variantPrice
    }
  }
}

// 全域診斷函數，可在瀏覽器 console 中調用
if (typeof window !== 'undefined') {
  (window as any).diagnoseCart = CartDiagnostics.runFullDiagnostic.bind(CartDiagnostics)
  console.log('🛠️ 購物車診斷工具已載入，在 console 中執行 diagnoseCart() 來運行診斷')
}

import { sdk } from "@/lib/config"

/**
 * 認證感知的 SDK 包裝器
 * 自動為所有 SDK 請求附加認證標頭
 */
class AuthenticatedSDK {
  
  /**
   * 獲取已認證的客戶資料
   */
  async getCustomer() {
    try {
      // console.log("🔍 AuthenticatedSDK: 獲取客戶資料...")
      
      // 首先嘗試使用伺服器端 API，它可以正確讀取 httpOnly cookies
      try {
        const response = await fetch('/api/auth/customer', {
          credentials: 'include',
          cache: 'no-cache'
        })
        
        if (response.ok) {
          const result = await response.json()
          
          if (result.authenticated && result.customer) {
            // console.log("✅ AuthenticatedSDK: 通過 API 獲取客戶資料成功", {
              // customerId: result.customer.id,
              // email: result.customer.email,
              // method: result.method
            // })
            
            return result.customer
          } else {
            // console.log("❌ AuthenticatedSDK: API 返回未認證狀態", result)
          }
        }
      } catch (apiError) {
        // console.warn("⚠️ AuthenticatedSDK: API 調用失敗，嘗試直接 SDK", apiError)
      }
      
      // 備用方案：直接調用 SDK
      // console.log("🔄 AuthenticatedSDK: 嘗試直接 SDK 調用")
      const { customer } = await sdk.store.customer.retrieve()
      
      // console.log("✅ AuthenticatedSDK: 直接 SDK 調用成功", {
        // hasCustomer: !!customer,
        // customerId: customer?.id,
        // email: customer?.email
      // })
      
      return customer
    } catch (error) {
      // console.error("❌ AuthenticatedSDK: 客戶資料獲取失敗", error)
      throw error
    }
  }

  /**
   * 創建新客戶
   */
  async createCustomer(customerData: {
    email: string
    first_name?: string
    last_name?: string
    phone?: string
  }) {
    try {
      // console.log("📝 AuthenticatedSDK: 創建客戶", customerData.email)
      
      const { customer } = await sdk.store.customer.create(customerData)
      
      // console.log("✅ AuthenticatedSDK: 客戶創建成功", {
        // customerId: customer?.id,
        // email: customer?.email
      // })
      
      return customer
    } catch (error) {
      // console.error("❌ AuthenticatedSDK: 客戶創建失敗", error)
      throw error
    }
  }

  /**
   * 更新客戶資料
   */
  async updateCustomer(customerData: {
    first_name?: string
    last_name?: string
    email?: string
    phone?: string
  }) {
    try {
      // console.log("📝 AuthenticatedSDK: 更新客戶資料")
      
      const { customer } = await sdk.store.customer.update(customerData)
      
      // console.log("✅ AuthenticatedSDK: 客戶資料更新成功")
      
      return customer
    } catch (error) {
      // console.error("❌ AuthenticatedSDK: 客戶資料更新失敗", error)
      throw error
    }
  }

  /**
   * 檢查認證狀態
   */
  async checkAuthentication() {
    try {
      // console.log("🔍 AuthenticatedSDK: 檢查認證狀態...")
      
      // 嘗試獲取客戶資料來驗證認證
      const customer = await this.getCustomer()
      
      // console.log("✅ AuthenticatedSDK: 認證狀態檢查完成", {
        // authenticated: !!customer,
        // customerId: customer?.id
      // })
      
      return {
        authenticated: !!customer,
        customer
      }
    } catch (error: any) {
      // console.log("❌ AuthenticatedSDK: 認證檢查失敗", {
        // error: error.message,
        // status: error.status || 'unknown'
      // })
      
      return {
        authenticated: false,
        customer: null,
        error: error.message
      }
    }
  }

  /**
   * 手動刷新 SDK 認證狀態
   * 透過 API 端點檢查認證狀態
   */
  async refreshAuthentication() {
    try {
      // console.log("🔄 AuthenticatedSDK: 通過 API 刷新認證狀態...")
      
      // 通過 API 端點檢查認證（這會在伺服器端處理 cookies）
      const response = await fetch('/api/auth/customer', {
        credentials: 'include',
        cache: 'no-cache'
      })
      
      const result = await response.json()
      
      // console.log("🔑 AuthenticatedSDK: API 認證狀態", {
        // authenticated: result.authenticated,
        // hasCustomer: !!result.customer,
        // method: result.method
      // })
      
      return {
        authenticated: result.authenticated,
        customer: result.customer
      }
    } catch (error) {
      // console.error("❌ AuthenticatedSDK: 認證刷新失敗", error)
      return {
        authenticated: false,
        customer: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * 獲取原始 SDK 實例（用於其他操作）
   */
  get raw() {
    return sdk
  }
}

// 導出單例實例
export const authenticatedSDK = new AuthenticatedSDK()
export default authenticatedSDK
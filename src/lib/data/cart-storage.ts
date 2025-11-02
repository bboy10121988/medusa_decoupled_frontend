// 混合儲存策略：同時使用 cookies 和 localStorage
export const setCartIdClient = (cartId: string) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('_medusa_cart_id', cartId)
      // if (process.env.NODE_ENV === 'development') console.log("📱 Cart ID 已儲存到 localStorage:", cartId)
      
      // 也嘗試設定 cookie (前端可讀取的)
      document.cookie = `_medusa_cart_id=${cartId}; max-age=${60 * 60 * 24 * 7}; path=/; samesite=lax`
      // if (process.env.NODE_ENV === 'development') console.log("🍪 Cart ID 已儲存到前端 cookie:", cartId)
    } catch (error) {
      // if (process.env.NODE_ENV === 'development') console.error("❌ 儲存 Cart ID 失敗:", error)
    }
  }
}

export const getCartIdClient = (): string | null => {
  if (typeof window !== 'undefined') {
    try {
      // 優先從 localStorage 取得
      const localStorageId = localStorage.getItem('_medusa_cart_id')
      if (localStorageId) {
        // if (process.env.NODE_ENV === 'development') console.log("📱 從 localStorage 取得 Cart ID:", localStorageId)
        return localStorageId
      }
      
      // 備用方案：從 cookie 取得
      const cookies = document.cookie.split(';')
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=')
        if (name === '_medusa_cart_id') {
          // if (process.env.NODE_ENV === 'development') console.log("🍪 從前端 cookie 取得 Cart ID:", value)
          return value
        }
      }
      
      // if (process.env.NODE_ENV === 'development') console.log("❌ 前端找不到 Cart ID")
      return null
    } catch (error) {
      // if (process.env.NODE_ENV === 'development') console.error("❌ 取得 Cart ID 失敗:", error)
      return null
    }
  }
  return null
}

export const removeCartIdClient = () => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('_medusa_cart_id')
      document.cookie = '_medusa_cart_id=; max-age=-1; path=/'
      // if (process.env.NODE_ENV === 'development') console.log("🗑️ 已清除前端 Cart ID")
    } catch (error) {
      // if (process.env.NODE_ENV === 'development') console.error("❌ 清除 Cart ID 失敗:", error)
    }
  }
}

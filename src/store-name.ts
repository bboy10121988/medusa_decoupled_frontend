import { getHeader } from "./sanity"

// 默認店名，當 Sanity 數據不可用時使用
const DEFAULT_STORE_NAME = "TIMS FANTACY WORLD"
const DEFAULT_LOGO_WIDTH = 150

/**
 * 獲取完整的 header 數據
 */
export async function getHeaderData() {
  try {
    const headerData = await getHeader()
    return headerData
  } catch (error) {
    console.error("獲取 header 數據時出錯:", error)
    return null
  }
}

/**
 * 獲取商店名稱的通用函數
 * 首先嘗試從 Sanity 獲取，如果失敗則使用默認值
 */
export async function getStoreName(): Promise<string> {
  try {
    const headerData = await getHeader()
    return headerData?.storeName || DEFAULT_STORE_NAME
  } catch (error) {
    console.error("獲取商店名稱時出錯:", error)
    return DEFAULT_STORE_NAME
  }
}

/**
 * 獲取 Logo 寬度設定
 */
export async function getLogoWidth(): Promise<number> {
  try {
    const headerData = await getHeader()
    return headerData?.logoWidth || DEFAULT_LOGO_WIDTH
  } catch (error) {
    console.error("獲取 Logo 寬度時出錯:", error)
    return DEFAULT_LOGO_WIDTH
  }
}

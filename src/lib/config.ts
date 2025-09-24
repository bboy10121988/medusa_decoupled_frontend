import Medusa from "@medusajs/js-sdk"
import { getPublishableKeyForBackend } from "./medusa-publishable-key"

// 網站基本配置
export const SITE_NAME = "Your Site Name"
export const DEFAULT_DESCRIPTION = "Default site description"
export const DEFAULT_OG_IMAGE = "/default-og-image.jpg"
export const DEFAULT_TWITTER_IMAGE = "/default-twitter-image.jpg"

// 確保在服務器端和客戶端都能獲取正確的 URL
export const MEDUSA_BACKEND_URL = 
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 
  process.env.MEDUSA_BACKEND_URL || 
  "http://35.236.182.29:9000"

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

// 創建 SDK 實例，確保使用正確的 URL
export const sdk = new Medusa({
  baseUrl: MEDUSA_BACKEND_URL,
  debug: process.env.NODE_ENV === "development",
  publishableKey: getPublishableKeyForBackend(MEDUSA_BACKEND_URL),
})

// 確保在用於 API 路由和伺服器組件時可以直接使用
export const getApiConfig = () => {
  return {
    baseUrl: MEDUSA_BACKEND_URL,
    publishableKey: getPublishableKeyForBackend(MEDUSA_BACKEND_URL),
  }
}

// SEO 相關配置
export const SEO_CONFIG = {
  siteName: SITE_NAME,
  description: DEFAULT_DESCRIPTION,
  ogImage: DEFAULT_OG_IMAGE,
  twitterImage: DEFAULT_TWITTER_IMAGE,
  siteUrl: SITE_URL
}

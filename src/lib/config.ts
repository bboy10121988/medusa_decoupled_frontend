import Medusa from "@medusajs/js-sdk"
import { getPublishableKeyForBackend } from "./medusa-publishable-key"

// -------------------- Helper --------------------

function requiredEnv(key: string, fallback?: string): string {
  const value = process.env[key] || fallback
  if (!value) {
    throw new Error(`Environment variable ${key} is required but was not provided.`)
  }
  return value
}

// -------------------- 基本設定 --------------------

export const SITE_NAME = "Your Site Name"
export const DEFAULT_DESCRIPTION = "Default site description"
export const DEFAULT_OG_IMAGE = "/default-og-image.jpg"
export const DEFAULT_TWITTER_IMAGE = "/default-twitter-image.jpg"

// -------------------- 環境變數 --------------------

export const MEDUSA_BACKEND_URL = requiredEnv(
  "NEXT_PUBLIC_MEDUSA_BACKEND_URL",
  process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"
)

export const SITE_URL = requiredEnv(
  "NEXT_PUBLIC_SITE_URL",
  "http://localhost:8000"
)

// -------------------- SDK 初始化 --------------------

// 創建一個支援動態認證的 SDK 實例
export const sdk = new Medusa({
  baseUrl: MEDUSA_BACKEND_URL,
  debug: process.env.NODE_ENV === "development",
  publishableKey: getPublishableKeyForBackend(MEDUSA_BACKEND_URL),
  auth: {
    type: "session"
  },
})

// -------------------- API Config --------------------

export const getApiConfig = () => {
  return {
    baseUrl: MEDUSA_BACKEND_URL,
    publishableKey: getPublishableKeyForBackend(MEDUSA_BACKEND_URL),
  }
}

// -------------------- SEO Config --------------------

export type SeoConfig = {
  siteName: string
  description: string
  ogImage: string
  twitterImage: string
  siteUrl: string
}

export const SEO_CONFIG: SeoConfig = {
  siteName: SITE_NAME,
  description: DEFAULT_DESCRIPTION,
  ogImage: DEFAULT_OG_IMAGE,
  twitterImage: DEFAULT_TWITTER_IMAGE,
  siteUrl: SITE_URL
}

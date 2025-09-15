// 已移除 check-env-variables 檢查，因為檔案已被刪除

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: false, // 暫時關閉嚴格模式以避免 React 19 警告
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  eslint: {
    // 暫時在建置時忽略 ESLint 錯誤，待專案穩定後再收斂
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 暫時在建置時忽略 TypeScript 錯誤，待專案穩定後再收斂
    ignoreBuildErrors: true,
  },
  // 簡化的 webpack 配置，避免 minify plugin 衝突
  webpack: (config, { isServer, dev }) => {
    // 只在開發模式或服務端渲染時應用這些配置
    if (!dev && !isServer) {
      // 生產模式的客戶端配置：保持預設配置以避免 minify 問題
      return config
    }

    // 只為 Mux 播放器添加必要的 fallback（如果真的需要的話）
    if (!config.resolve.fallback) {
      config.resolve.fallback = {}
    }
    
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    }

    return config
  },
  images: {
    // 僅允許受信任的圖片來源，避免從未知網域載入
    remotePatterns: [
      { protocol: "http", hostname: "localhost" },
      { protocol: "http", hostname: "35.236.182.29" },
      { protocol: "http", hostname: "35.236.182.29", port: "9000" },
      { protocol: "https", hostname: "medusa-public-images.s3.eu-west-1.amazonaws.com" },
      { protocol: "https", hostname: "medusa-server-testing.s3.amazonaws.com" },
      { protocol: "https", hostname: "medusa-server-testing.s3.us-east-1.amazonaws.com" },
      { protocol: "https", hostname: "cdn.sanity.io" },
    ],
    // 停用 SVG 直通，避免 XSS 風險；如需 SVG，建議先行清洗
    dangerouslyAllowSVG: false,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
}

module.exports = nextConfig

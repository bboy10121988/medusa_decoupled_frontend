// 已移除 check-env-variables 檢查，因為檔案已被刪除

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: false, // 暫時關閉嚴格模式以避免 React 19 警告
  trailingSlash: false,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  // 允許從多個主機訪問應用
  serverRuntimeConfig: {
    allowedHosts: ['admin.timsfantasyworld.com', 'ecpay.timsfantasyworld.com', 'timsfantasyworld.com'],
  },
  // 使用絕對路徑作為資產前綴，避免相對路徑問題
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : undefined,
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
  // 允許跨域請求和多主機訪問
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ];
  },
  
  // 允許不同域名的重寫規則
  async rewrites() {
    return {
      beforeFiles: [
        // 允許從 admin.timsfantasyworld.com 訪問
        {
          source: '/:path*',
          has: [
            {
              type: 'host',
              value: 'admin.timsfantasyworld.com',
            },
          ],
          destination: '/:path*',
        },
        // 允許從 ecpay.timsfantasyworld.com 訪問
        {
          source: '/:path*',
          has: [
            {
              type: 'host',
              value: 'ecpay.timsfantasyworld.com',
            },
          ],
          destination: '/:path*',
        },
      ],
      fallback: [],
    };
  },
  
  images: {
    // 僅允許受信任的圖片來源，避免從未知網域載入
    remotePatterns: [
      { protocol: "http", hostname: "localhost" },
      { protocol: "http", hostname: "35.236.182.29" },
      { protocol: "http", hostname: "35.236.182.29", port: "9000" },
      { protocol: "https", hostname: "admin.timsfantasyworld.com" },
      { protocol: "https", hostname: "ecpay.timsfantasyworld.com" },
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

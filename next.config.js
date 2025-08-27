const checkEnvVariables = require("./check-env-variables")

checkEnvVariables()

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // 修復配置警告 - 使用物件格式
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:8000'],
    },
  },
  // 暫時移除 RxJS 外部包設定以避免 Turbopack 衝突
  // serverExternalPackages: ['rxjs'],
  // 簡化的 Turbopack 配置
  turbopack: {
    resolveExtensions: [
      '.mdx',
      '.tsx',
      '.ts', 
      '.jsx',
      '.js',
      '.mjs',
      '.json',
    ],
  },
  // 加強 webpack 配置以支援 fallback 模式
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // 添加更多 fallback
      config.resolve.fallback = {
        ...config.resolve.fallback,
        "fs": false,
        "net": false,
        "tls": false,
        "crypto": false,
        "stream": false,
        "util": false,
        "url": false,
        "zlib": false,
        "http": false,
        "https": false,
        "assert": false,
        "os": false,
        "path": false,
      }
      
      // 添加插件來忽略特定錯誤
      const { IgnorePlugin } = require('webpack')
      config.plugins.push(
        new IgnorePlugin({
          checkResource: (resource, context) => {
            // 忽略可能導致 AbortError 的資源
            return resource.includes('rxjs') && resource.includes('internal') && 
                   (resource.includes('Subscription') || resource.includes('Subscriber'))
          }
        })
      )
    }
    
    return config
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "medusa-public-images.s3.eu-west-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "medusa-server-testing.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "medusa-server-testing.s3.us-east-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },
}

module.exports = nextConfig

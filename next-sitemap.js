const excludedPaths = ["/checkout", "/account/*", "/cms/*", "/sanity-setup", "/api/*", "/tw/auth/*"]

module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_BASE_URL || "https://timsfantasyworld.com",
  generateRobotsTxt: true,
  exclude: [...excludedPaths, "/[sitemap]"],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
      },
      {
        userAgent: "*",
        disallow: excludedPaths,
      },
    ],
    additionalSitemaps: [
      `${process.env.NEXT_PUBLIC_BASE_URL || "https://timsfantasyworld.com"}/sitemap.xml`,
    ],
  },
  changefreq: "daily",
  priority: 0.7,
  sitemapSize: 5000,
  transform: async (config, path) => {
    // 為不同頁面設置不同的優先級
    let priority = 0.7
    let changefreq = "daily"
    
    if (path === "/tw") {
      priority = 1.0
      changefreq = "daily"
    } else if (path.includes("/store") || path.includes("/products")) {
      priority = 0.8
      changefreq = "weekly"
    } else if (path.includes("/collections")) {
      priority = 0.6
      changefreq = "weekly"
    }
    
    return {
      loc: path,
      changefreq,
      priority,
      lastmod: new Date().toISOString(),
    }
  },
}

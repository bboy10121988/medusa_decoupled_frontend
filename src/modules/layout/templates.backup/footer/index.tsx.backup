import Link from "next/link"
import { getFooter } from "../../../../lib/sanity/index"
import { FooterData } from "../../../../lib/sanity/types"

// 預設資料作為後備
const defaultFooterData: FooterData = {
  copyright: `© ${new Date().getFullYear()} Medusa Store. All rights reserved.`,
  sections: [
    {
      title: "品牌",
      links: [
        { text: "所有商品", url: "/store" },
        { text: "特色商品", url: "/collections/featured" },
        { text: "限量商品", url: "/collections/limited" }
      ]
    },
    {
      title: "商品",
      links: [
        { text: "服飾", url: "/categories/apparel" },
        { text: "配件", url: "/categories/accessories" },
        { text: "居家用品", url: "/categories/home" }
      ]
    },
    {
      title: "服務資訊",
      links: [
        { text: "配送資訊", url: "/shipping" },
        { text: "退換貨政策", url: "/returns" },
        { text: "常見問題", url: "/faq" },
        { text: "尺寸指南", url: "/size-guide" }
      ]
    },
    {
      title: "關於我們",
      links: [
        { text: "品牌故事", url: "/about" },
        { text: "聯絡我們", url: "/contact" },
        { text: "隱私權政策", url: "/privacy" },
        { text: "服務條款", url: "/terms" }
      ]
    },
    {
      title: "客戶服務",
      links: [
        { text: "會員中心", url: "/account" },
        { text: "訂單查詢", url: "/orders" },
        { text: "客服中心", url: "/support" }
      ]
    }
  ],
  contactInfo: {
    phone: "+886-2-1234-5678",
    email: "service@medusastore.com"
  },
  socialMedia: {
    facebook: {
      enabled: true,
      url: "https://facebook.com/medusastore"
    },
    instagram: {
      enabled: true,
      url: "https://instagram.com/medusastore"
    },
    line: {
      enabled: true,
      url: "https://line.me/ti/p/~medusastore"
    },
    youtube: {
      enabled: true,
      url: "https://youtube.com/@medusastore"
    }
  }
}

export default async function Footer() {
  // 從 Sanity 獲取資料
  const footerData = await getFooter()

  // 安全地處理 sections，確保存在且不為空
  const sections = footerData?.sections || []
  const contactInfo = footerData?.contactInfo || { phone: "+886-2-1234-5678", email: "service@medusastore.com" }
  const socialMedia = footerData?.socialMedia || {
    facebook: { enabled: false, url: "" },
    instagram: { enabled: false, url: "" },
    line: { enabled: false, url: "" },
    youtube: { enabled: false, url: "" }
  }  // 模擬商品系列和分類數據
  const mockCollections = [
    { id: "1", handle: "featured", title: "精選商品" },
    { id: "2", handle: "new-arrivals", title: "新品上架" },
    { id: "3", handle: "bestsellers", title: "熱銷商品" }
  ]

  const mockCategories = [
    { id: "1", handle: "electronics", name: "電子產品" },
    { id: "2", handle: "clothing", name: "服飾" },
    { id: "3", handle: "home", name: "家居用品" }
  ]

  return (
    <footer className="border-t border-gray-200">
      <div className="max-w-[1440px] mx-auto px-5 md:px-10">
        <div className="py-12 md:py-20">
          {/* 使用 grid 來確保元素在一行內平均分布 */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-y-10 md:gap-x-4">
            {/* 品牌區塊 */}
            <div className="space-y-6">
              <Link href="/" className="block">
                <div className="w-40">
                  <div className="text-xl font-bold text-gray-900">
                    Medusa Store
                  </div>
                </div>
              </Link>
            </div>

            {/* 商品系列 */}
            <div className="space-y-6">
              <h3 className="text-base font-semibold text-gray-900">商品系列</h3>
              <ul className="space-y-4">
                {mockCollections.map((collection) => (
                  <li key={collection.id}>
                    <Link 
                      href={`/collections/${collection.handle}`}
                      className="text-sm text-gray-600 hover:text-black transition-colors"
                    >
                      {collection.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* 商品分類 */}
            <div className="space-y-6">
              <h3 className="text-base font-semibold text-gray-900">商品分類</h3>
              <ul className="space-y-4">
                {mockCategories.map((category) => (
                  <li key={category.id}>
                    <Link 
                      href={`/categories/${category.handle}`}
                      className="text-sm text-gray-600 hover:text-black transition-colors"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* 自定義區域 - 從配置獲取 */}
            {sections.map((section: any, index: number) => (
              <div key={index} className="space-y-6">
                <h3 className="text-base font-semibold text-gray-900">{section.title}</h3>
                {section.links && section.links.length > 0 && (
                  <ul className="space-y-4">
                    {section.links.map((link: any, linkIndex: number) => (
                      <li key={linkIndex}>
                        <Link 
                          href={link.url}
                          className="text-sm text-gray-600 hover:text-black transition-colors"
                        >
                          {link.text}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
                
                {/* 如果是最後一個區塊，在內容下方顯示聯絡資訊和社群媒體圖標 */}
                {index === sections.length - 1 && (
                  <div className="mt-6">
                    {/* 聯絡資訊 */}
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">
                        電話：<br />{contactInfo.phone}
                      </p>
                      <p className="text-sm text-gray-600 mb-4">
                        Email：<br />{contactInfo.email}
                      </p>
                    </div>

                    {/* 社群媒體圖標 */}
                    <div className="flex items-center space-x-4">
                      {socialMedia.facebook.enabled && (
                        <a href={socialMedia.facebook.url} className="text-gray-600 hover:text-black transition-colors" target="_blank" rel="noopener noreferrer">                          <span className="sr-only">Facebook</span>
                          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                            <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                          </svg>
                        </a>
                      )}
                      {socialMedia.instagram.enabled && (
                        <a href={socialMedia.instagram.url} className="text-gray-600 hover:text-black transition-colors" target="_blank" rel="noopener noreferrer">
                          <span className="sr-only">Instagram</span>
                          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                            <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                          </svg>
                        </a>
                      )}
                      {socialMedia.line.enabled && (
                        <a href={socialMedia.line.url} className="text-gray-600 hover:text-black transition-colors" target="_blank" rel="noopener noreferrer">
                          <span className="sr-only">Line</span>
                          <div className="h-6 w-6 flex items-center justify-center">
                            <span className="font-bold text-sm">LINE</span>
                          </div>
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Copyright */}
                {/* Copyright */}
        <div className="px-6 md:px-12 max-w-[1440px] mx-auto border-t border-ui-border-base pt-4 pb-4 text-xs text-gray-500 text-center">
          <span className="text-xs">
            {footerData?.title || `© ${new Date().getFullYear()} Medusa Store. All rights reserved.`}
          </span>
        </div>
      </div>
    </footer>
  )
}

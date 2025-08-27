import Link from "next/link"
import { getFooter } from "../../../../lib/sanity/index"

export default async function Footer() {
  // 從 Sanity 獲取資料
  let footerData
  try {
    footerData = await getFooter()
    console.log("Footer data from Sanity:", JSON.stringify(footerData, null, 2))
  } catch (error) {
    console.error("Error fetching footer data:", error)
    footerData = null
  }

  // 安全地處理所有資料，提供預設值
  const sections = Array.isArray(footerData?.sections) ? footerData.sections : [
    {
      title: "品牌",
      links: [
        { text: "所有商品", url: "/store" },
        { text: "特色商品", url: "/collections/featured" }
      ]
    },
    {
      title: "服務資訊", 
      links: [
        { text: "配送資訊", url: "/shipping" },
        { text: "退換貨政策", url: "/returns" }
      ]
    }
  ]

  const contactInfo = footerData?.contactInfo || {
    phone: "+886-2-1234-5678",
    email: "service@medusastore.com"
  }

  const socialMedia = footerData?.socialMedia || {
    facebook: { enabled: true, url: "https://facebook.com/medusastore" },
    instagram: { enabled: true, url: "https://instagram.com/medusastore" },
    line: { enabled: true, url: "https://line.me/ti/p/~medusastore" }
  }

  return (
    <>
      {/* Footer 主要內容 */}
      <footer className="bg-white border-t border-ui-border-base">
        <div className="mx-auto max-w-[1440px] px-6 md:px-12">
          {/* 上半部：內容區塊 */}
          <div className="grid grid-cols-1 gap-8 py-12 lg:grid-cols-6">
            
            {/* 品牌區塊 */}
            <div className="lg:col-span-2">
              <Link href="/" className="text-xl font-bold text-black">
                {footerData?.title || "Medusa Store"}
              </Link>
              <p className="mt-4 text-sm text-gray-600 leading-relaxed">
                打造優質生活，從選擇開始。我們提供精選商品，讓您的每一天都充滿品質與美好。
              </p>
            </div>

            {/* 動態內容區塊 */}
            {sections.map((section: any, index: number) => (
              <div key={index} className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
                  {section?.title || ""}
                </h3>
                {Array.isArray(section?.links) && (
                  <ul className="space-y-3">
                    {section.links.map((link: any, linkIndex: number) => (
                      <li key={linkIndex}>
                        <Link 
                          href={link?.url || "#"}
                          className="text-sm text-gray-600 hover:text-black transition-colors duration-200"
                        >
                          {link?.text || ""}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}

            {/* 聯絡資訊區塊 */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
                聯絡資訊
              </h3>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  電話: {contactInfo?.phone || "N/A"}
                </p>
                <p className="text-sm text-gray-600">
                  信箱: {contactInfo?.email || "N/A"}
                </p>
              </div>
              
              {/* 社群媒體圖標 */}
              <div className="flex space-x-4 pt-4">
                {socialMedia?.facebook?.enabled && socialMedia.facebook.url && (
                  <a 
                    href={socialMedia.facebook.url} 
                    className="text-gray-400 hover:text-blue-600 transition-colors"
                    target="_blank" 
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                )}
                
                {socialMedia?.instagram?.enabled && socialMedia.instagram.url && (
                  <a 
                    href={socialMedia.instagram.url} 
                    className="text-gray-400 hover:text-pink-600 transition-colors"
                    target="_blank" 
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987s11.987-5.367 11.987-11.987C24.014 5.367 18.647.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.366C4.25 14.747 3.76 13.596 3.76 12.3s.49-2.448 1.366-3.323C6.001 8.001 7.152 7.511 8.449 7.511s2.448.49 3.323 1.366c.875.875 1.366 2.026 1.366 3.323s-.49 2.448-1.366 3.323c-.875.875-2.026 1.365-3.323 1.365zm7.138 0c-1.297 0-2.448-.49-3.323-1.366-.875-.875-1.366-2.026-1.366-3.323s.49-2.448 1.366-3.323c.875-.875 2.026-1.366 3.323-1.366s2.448.49 3.323 1.366c.875.875 1.366 2.026 1.366 3.323s-.49 2.448-1.366 3.323c-.875.875-2.026 1.365-3.323 1.365z"/>
                    </svg>
                  </a>
                )}
                
                {socialMedia?.line?.enabled && socialMedia.line.url && (
                  <a 
                    href={socialMedia.line.url} 
                    className="text-gray-400 hover:text-green-500 transition-colors"
                    target="_blank" 
                    rel="noopener noreferrer"
                    aria-label="LINE"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.628-.629.628M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.070 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* 下半部：版權資訊 */}
          <div className="border-t border-ui-border-base py-4">
            <p className="text-xs text-gray-500 text-center">
              {footerData?.title 
                ? footerData.title 
                : `© ${new Date().getFullYear()} Medusa Store. All rights reserved.`
              }
            </p>
          </div>
        </div>
      </footer>
    </>
  )
}

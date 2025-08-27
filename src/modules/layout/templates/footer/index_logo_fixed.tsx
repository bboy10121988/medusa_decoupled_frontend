import Link from "next/link"
import Image from "next/image"
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
  ]
}

export default async function Footer() {
  // @ts-ignore
  const footerData: FooterData | null = await getFooter()
  
  // 使用 Sanity 資料，如果沒有則使用預設值
  const finalFooterData = {
    ...defaultFooterData,
    ...footerData
  }

  // 合併 sections，優先使用 Sanity 的資料，但保留預設的作為後備
  const sections = footerData?.sections && footerData.sections.length > 0 
    ? footerData.sections 
    : defaultFooterData.sections

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
                  {footerData?.logo?.url ? (
                    <Image
                      src={footerData.logo.url}
                      alt={footerData.logo.alt || "Store logo"}
                      width={footerData?.logoWidth || 160}
                      height={40}
                      className="w-auto h-auto object-contain"
                    />
                  ) : (
                    <div className="text-xl font-bold text-gray-900">
                      {footerData?.title || "Medusa Store"}
                    </div>
                  )}
                </div>
              </Link>
            </div>

            {/* 動態生成 sections */}
            {sections?.slice(0, 5).map((section, index) => (
              <div key={`section-${index}`} className="space-y-6">
                <h3 className="text-base font-semibold text-gray-900">{section.title}</h3>
                <ul className="space-y-3">
                  {section.links?.map((link, linkIndex) => (
                    <li key={`${section.title}-${linkIndex}`}>
                      <Link 
                        href={link.url} 
                        className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200"
                      >
                        {link.text}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* 分隔線 */}
          <div className="border-t border-gray-200 mt-16 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              {/* 版權資訊 */}
              <p className="text-sm text-gray-500 text-center md:text-left">
                {finalFooterData.copyright}
              </p>
              
              {/* 社群媒體連結 */}
              {footerData?.socialMedia && (
                <div className="flex items-center space-x-4">
                  {footerData.socialMedia.facebook?.enabled && footerData.socialMedia.facebook?.url && (
                    <a 
                      href={footerData.socialMedia.facebook.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </a>
                  )}
                  
                  {footerData.socialMedia.instagram?.enabled && footerData.socialMedia.instagram?.url && (
                    <a 
                      href={footerData.socialMedia.instagram.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.346-1.24-.898-.75-1.297-1.696-1.297-2.994 0-1.297.399-2.244 1.297-2.994.898-.75 2.049-1.24 3.346-1.24s2.448.49 3.346 1.24c.898.75 1.297 1.697 1.297 2.994 0 1.298-.399 2.244-1.297 2.994-.898.75-2.049 1.24-3.346 1.24zm7.719 0c-1.297 0-2.448-.49-3.346-1.24-.898-.75-1.297-1.696-1.297-2.994 0-1.297.399-2.244 1.297-2.994.898-.75 2.049-1.24 3.346-1.24s2.448.49 3.346 1.24c.898.75 1.297 1.697 1.297 2.994 0 1.298-.399 2.244-1.297 2.994-.898.75-2.049 1.24-3.346 1.24z"/>
                      </svg>
                    </a>
                  )}
                  
                  {footerData.socialMedia.line?.enabled && footerData.socialMedia.line?.url && (
                    <a 
                      href={footerData.socialMedia.line.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.628-.629.628M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                      </svg>
                    </a>
                  )}
                  
                  {footerData.socialMedia.youtube?.enabled && footerData.socialMedia.youtube?.url && (
                    <a 
                      href={footerData.socialMedia.youtube.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                    </a>
                  )}

                  {footerData.socialMedia.twitter?.enabled && footerData.socialMedia.twitter?.url && (
                    <a 
                      href={footerData.socialMedia.twitter.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                      </svg>
                    </a>
                  )}
                </div>
              )}

              {/* 聯絡資訊（改從第三個自訂區塊 customInfo 讀取） */}
              {sections && sections[2]?.customInfo && (
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  {sections[2].customInfo.phone && (
                    <span>電話: {sections[2].customInfo.phone}</span>
                  )}
                  {sections[2].customInfo.email && (
                    <>
                      {sections[2].customInfo.phone && <span>|</span>}
                      <span>Email: {sections[2].customInfo.email}</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

import { listCategories } from "@lib/data/categories"
import { listCollections } from "@lib/data/collections"
import { getFooter } from "@lib/sanity"
import Image from "next/image"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

// 簡化的型別定義，避免複雜的 union 型別
type SimpleFooter = {
  copyright?: string
  logo?: { url?: string; alt?: string }
  sections?: Array<{
    title?: string
    links?: Array<{ text?: string; url?: string }>
  }>
  contactInfo?: {
    phone?: string
    email?: string
  }
  socialMedia?: {
    facebook?: { enabled?: boolean; url?: string }
    instagram?: { enabled?: boolean; url?: string }
    line?: { enabled?: boolean; url?: string }
    youtube?: { enabled?: boolean; url?: string }
    twitter?: { enabled?: boolean; url?: string }
  }
} | null

export default async function Footer() {
  // @ts-ignore - 忽略 Medusa 複雜型別推斷
  const { collections } = await listCollections({
    fields: "*products",
  })
  // @ts-ignore - 忽略 Medusa 複雜型別推斷
  const productCategories = await listCategories()
  
  // 使用簡化型別，避免 TypeScript 複雜推斷
  const footer: SimpleFooter = await getFooter()

  // 處理版權資訊中的年份變數
  const copyright = footer?.copyright
    ? footer.copyright.replace(/{year}/g, new Date().getFullYear().toString())
    : `© ${new Date().getFullYear()} SALON. All rights reserved.`

  return (
    <footer className="border-t border-gray-200">
      <div className="max-w-[1440px] mx-auto px-5 md:px-10">
        <div className="py-12 md:py-20">
          {/* 使用 grid 來確保元素在一行內平均分布 */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-y-10 md:gap-x-4">
            {/* 品牌區塊 */}
            <div className="space-y-6">
              <LocalizedClientLink href="/" className="block">
                <div className="w-40">
                  <Image
                    src={footer?.logo?.url || "/images/44dto-bmpua.webp"}
                    alt={footer?.logo?.alt || "SALON"}
                    width={160}
                    height={60}
                    className="w-full"
                  />
                </div>
              </LocalizedClientLink>
            </div>

            {/* 商品系列 */}
            <div className="space-y-6">
              <h3 className="h4">商品系列</h3>
              <ul className="space-y-4">
                {(collections || []).slice(0, 3).map((collection: any) => (
                  <li key={collection.id}>
                    <LocalizedClientLink 
                      href={`/collections/${collection.handle}`}
                      className="text-body-small hover:text-black transition-colors"
                    >
                      {collection.title}
                    </LocalizedClientLink>
                  </li>
                ))}
              </ul>
            </div>

            {/* 商品分類 */}
            <div className="space-y-6">
              <h3 className="h4">商品分類</h3>
              <ul className="space-y-4">
                {(productCategories || []).slice(0, 4).map((category: any) => (
                  <li key={category.id}>
                    <LocalizedClientLink 
                      href={`/categories/${category.handle}`}
                      className="text-body-small hover:text-black transition-colors"
                    >
                      {category.name}
                    </LocalizedClientLink>
                  </li>
                ))}
              </ul>
            </div>

            {/* 自定義區塊 */}
            {footer?.sections && Array.isArray(footer.sections) && footer.sections.slice(0, 2).map((section: any, index: number) => (
              <div key={`section-${index}`} className="space-y-6">
                <h3 className="h4">{section.title || "服務"}</h3>
                <ul className="space-y-4">
                  {Array.isArray(section.links) && section.links.map((link: any, linkIndex: number) => (
                    <li key={`link-${index}-${linkIndex}`}>
                      <LocalizedClientLink 
                        href={link.url || "#"}
                        className="text-body-small hover:text-black transition-colors"
                      >
                        {link.text || ""}
                      </LocalizedClientLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* 聯絡資訊 */}
            <div className="space-y-6">
              <h3 className="h4">聯絡我們</h3>
              <div className="space-y-4">
                {footer?.contactInfo?.phone && (
                  <div className="text-body-small">
                    <span className="text-gray-600">電話: </span>
                    <a href={`tel:${footer.contactInfo.phone}`} className="hover:text-black transition-colors">
                      {footer.contactInfo.phone}
                    </a>
                  </div>
                )}
                {footer?.contactInfo?.email && (
                  <div className="text-body-small">
                    <span className="text-gray-600">信箱: </span>
                    <a href={`mailto:${footer.contactInfo.email}`} className="hover:text-black transition-colors">
                      {footer.contactInfo.email}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 社群媒體與版權 */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              {/* 社群媒體連結 */}
              <div className="flex space-x-6">
                {footer?.socialMedia?.facebook?.enabled && footer.socialMedia.facebook.url && (
                  <a 
                    href={footer.socialMedia.facebook.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-black transition-colors"
                    aria-label="Facebook"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                )}

                {footer?.socialMedia?.instagram?.enabled && footer.socialMedia.instagram.url && (
                  <a 
                    href={footer.socialMedia.instagram.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-black transition-colors"
                    aria-label="Instagram"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.621 5.367 11.988 11.988 11.988s11.987-5.367 11.987-11.988C24.004 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.55-3.257-1.434-.809-.884-1.297-2.081-1.297-3.378 0-1.297.488-2.494 1.297-3.378.809-.884 1.96-1.434 3.257-1.434s2.448.55 3.257 1.434c.809.884 1.297 2.081 1.297 3.378 0 1.297-.488 2.494-1.297 3.378-.809.884-1.96 1.434-3.257 1.434z"/>
                    </svg>
                  </a>
                )}

                {footer?.socialMedia?.line?.enabled && footer.socialMedia.line.url && (
                  <a 
                    href={footer.socialMedia.line.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-black transition-colors"
                    aria-label="LINE"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.630.63H17.61v1.125h1.755zm-3.875 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.736c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                    </svg>
                  </a>
                )}
              </div>

              {/* 版權資訊 */}
              <div className="text-body-small text-gray-500">
                {copyright}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

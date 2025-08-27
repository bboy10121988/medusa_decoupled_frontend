import { listCategories } from "@lib/data/categories"
import { listCollections } from "@lib/data/collections"
import { getFooter } from "@lib/sanity"
import Image from "next/image"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default async function Footer() {
  const { collections } = await listCollections({
    fields: "*products",
  })
  const productCategories = await listCategories()
  const footer = await getFooter()

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
                {collections.slice(0, 3).map((collection) => (
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
                {productCategories.slice(0, 3).map((category) => (
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

            {/* 自定義區域 - 從Sanity獲取 */}
            {footer?.sections?.map((section, index) => (
              <div key={index} className="space-y-6">
                <h3 className="h4">{section.title}</h3>
                {section.links && section.links.length > 0 && (
                  <ul className="space-y-4">
                    {section.links.map((link, linkIndex) => (
                      <li key={linkIndex}>
                        <a 
                          href={link.url}
                          className="text-body-small hover:text-black transition-colors"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {link.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
                
                {/* 如果是最後一個區塊，在內容下方顯示社群媒體圖標 */}
                {index === (footer?.sections?.length ?? 0) - 1 && (
                  <div className="mt-6">
                    {/* 聯絡資訊 */}
                    {(footer?.contactInfo?.phone || footer?.contactInfo?.email) && (
                      <div className="mb-4">
                        {footer.contactInfo.phone && (
                          <p className="text-body-small mb-2">
                            電話：<br />{footer.contactInfo.phone}
                          </p>
                        )}
                        {footer.contactInfo.email && (
                          <p className="text-body-small mb-4">
                            Email：<br />{footer.contactInfo.email}
                          </p>
                        )}
                      </div>
                    )}
                    
                    {/* 社群媒體圖標 */}
                    <div className="flex space-x-4">
                      {footer?.socialMedia?.facebook?.enabled && footer.socialMedia.facebook.url && (
                        <a href={footer.socialMedia.facebook.url} className="text-gray-600 hover:text-black transition-colors" target="_blank" rel="noopener noreferrer">
                          <span className="sr-only">Facebook</span>
                          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                            <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                          </svg>
                        </a>
                      )}
                      {footer?.socialMedia?.instagram?.enabled && footer.socialMedia.instagram.url && (
                        <a href={footer.socialMedia.instagram.url} className="text-gray-600 hover:text-black transition-colors" target="_blank" rel="noopener noreferrer">
                          <span className="sr-only">Instagram</span>
                          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                            <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                          </svg>
                        </a>
                      )}
                      {footer?.socialMedia?.line?.enabled && footer.socialMedia.line.url && (
                        <a href={footer.socialMedia.line.url} className="text-gray-600 hover:text-black transition-colors" target="_blank" rel="noopener noreferrer">
                          <span className="sr-only">Line</span>
                          <div className="h-6 w-6 flex items-center justify-center">
                            <span className="font-bold text-sm">LINE</span>
                          </div>
                        </a>
                      )}
                      {footer?.socialMedia?.youtube?.enabled && footer.socialMedia.youtube.url && (
                        <a href={footer.socialMedia.youtube.url} className="text-gray-600 hover:text-black transition-colors" target="_blank" rel="noopener noreferrer">
                          <span className="sr-only">YouTube</span>
                          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z" />
                          </svg>
                        </a>
                      )}
                      {footer?.socialMedia?.twitter?.enabled && footer.socialMedia.twitter.url && (
                        <a href={footer.socialMedia.twitter.url} className="text-gray-600 hover:text-black transition-colors" target="_blank" rel="noopener noreferrer">
                          <span className="sr-only">Twitter/X</span>
                          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                          </svg>
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
        <div className="border-t border-gray-200 py-8">
          <div className="text-body-small">
            {copyright}
          </div>
        </div>
      </div>
    </footer>
  )
}

import React, { Suspense } from "react"

import ImageGallery from "@modules/products/components/image-gallery"
import ProductActions from "@modules/products/components/product-actions"
import RelatedProducts from "@modules/products/components/related-products"
import ProductTabs from "@modules/products/components/product-tabs"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import { ProductActionProvider } from "@lib/context/product-context"
import StoreName from "../components/store-name"
import { getTranslation } from "@lib/translations"

type ProductTemplateProps = {
  product: any
  region: any
  countryCode: string
  detailContent?: string | null
  detailImages?: string[]
  detailBlocks?: any[]
  paddingX?: number | undefined
}

const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  region,
  countryCode,
  detailContent,
  detailImages,
  detailBlocks,
  paddingX
}) => {
  if (!product?.id) {
    return <div>Product not found</div>
  }

  const t = getTranslation(countryCode)

  const paddingStyle = paddingX ? {
    paddingLeft: `${paddingX / 2}%`,
    paddingRight: `${paddingX / 2}%`
  } : {}

  return (
    <div className="min-h-screen" style={paddingStyle}>
      {/* 麵包屑導航 - 緊湊設計 */}
      <div className="bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex text-sm" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              <li>
                <a href="/" className="text-gray-500 hover:text-gray-900 transition-colors">
                  {t.home || 'Home'}
                </a>
              </li>
              {product.collection && (
                <>
                  <li className="text-gray-400">/</li>
                  <li>
                    <a href={`/collections/${product.collection.handle}`} className="text-gray-500 hover:text-gray-900 transition-colors">
                      {product.collection.title}
                    </a>
                  </li>
                </>
              )}
              <li className="text-gray-400">/</li>
              <li>
                <span className="text-gray-900 font-medium">
                  {product.title}
                </span>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* 主要商品區塊 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="product-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-10">

          {/* 圖片區塊 - 左側 */}
          <div className="lg:sticky lg:top-16 lg:self-start">
            <ImageGallery images={product?.images || []} />
          </div>

          {/* 產品資訊區塊 - 右側 */}
          <div className="lg:max-w-lg">
            {/* 品牌 */}
            <div className="mb-4">
              <StoreName />
            </div>

            {/* 產品標題 */}
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
              {product.title}
            </h1>

            {/* 產品副標題 */}
            {product.subtitle && (
              <p className="text-lg text-gray-600 mb-6">{product.subtitle}</p>
            )}

            {/* 購買操作區塊 */}
            <div className="mb-8">
              <ProductActionProvider>
                <Suspense
                  fallback={
                    <div className="py-8 animate-pulse">
                      <div className="h-6 bg-gray-200 rounded mb-4"></div>
                      <div className="h-12 bg-gray-200 rounded mb-4"></div>
                      <div className="h-12 bg-gray-200 rounded"></div>
                    </div>
                  }
                >
                  <ProductActions product={product} region={region} />
                </Suspense>
              </ProductActionProvider>
            </div>

            {/* 產品詳細資訊選單 */}
            <div className="space-y-8">
              <div>
                <ProductTabs product={product} countryCode={countryCode} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 詳情與展示區塊 */}
      {(detailContent || (detailImages && detailImages.length > 0) || (detailBlocks && detailBlocks.length > 0)) && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" data-testid="product-details-container">
          {detailBlocks && detailBlocks.length > 0 ? (
            <div className="flex flex-col gap-0 w-full max-w-none mx-auto">
              {detailBlocks.map((block: any, index: number) => (
                <div key={index} className="w-full">
                  {block.type === 'text' ? (
                    <div
                      className="product-detail-content prose prose-sm sm:prose max-w-none py-6 px-4 md:px-0"
                      dangerouslySetInnerHTML={{ __html: block.content }}
                    />
                  ) : (
                    <img
                      src={block.content}
                      alt={`${product.title} detail ${index + 1}`}
                      className="w-full h-auto block"
                      loading="lazy"
                    />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="max-w-7xl mx-auto px-0 py-0 overflow-hidden">
              {detailContent && (
                <div
                  className="product-detail-content max-w-none mx-auto mb-8 prose prose-sm sm:prose"
                  dangerouslySetInnerHTML={{ __html: detailContent }}
                />
              )}
              {detailImages && detailImages.length > 0 && (
                <div className="flex flex-col gap-0 w-full">
                  {detailImages.map((src, index) => (
                    <img
                      key={index}
                      src={src}
                      alt={`${product.title} detail ${index + 1}`}
                      className="w-full h-auto block"
                      loading="lazy"
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 相關商品區塊 */}
      <div className="bg-gray-50 py-16 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" data-testid="related-products-container">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t.youMayAlsoLike || 'You May Also Like'}</h2>
            <p className="text-gray-600">{t.relatedProductsSubtitle || 'Handpicked products just for you'}</p>
          </div>
          <Suspense fallback={<SkeletonRelatedProducts />}>
            <RelatedProducts product={product} countryCode={countryCode} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

export default ProductTemplate
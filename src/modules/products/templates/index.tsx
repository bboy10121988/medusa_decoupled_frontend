import React, { Suspense } from "react"

import ImageGallery from "@modules/products/components/image-gallery"
import ProductActions from "@modules/products/components/product-actions"
import RelatedProducts from "@modules/products/components/related-products"
import ProductTabs from "@modules/products/components/product-tabs"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import { ProductActionProvider } from "@lib/context/product-context"
import StoreName from "../components/store-name"

type ProductTemplateProps = {
  product: any
  region: any
  countryCode: string
  detailContent?: string | null
}

const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  region,
  countryCode,
  detailContent,
}) => {
  if (!product?.id) {
    return <div>產品未找到</div>
  }

  return (
    <div className="min-h-screen">
      {/* 麵包屑導航 - 緊湊設計 */}
      <div className="bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex text-sm" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              <li>
                <a href="/" className="text-gray-500 hover:text-gray-900 transition-colors">
                  首頁
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
                <ProductTabs product={product} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 詳情圖容器 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" data-testid="product-details-images-container">
        {/* <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">商品詳情</h2>
          <p className="text-gray-600">更多關於此商品的圖片</p>
        </div> */}
        {/* 在這裡顯示詳情內容 */}
        {detailContent ? (
          <div 
            className="product-detail-content max-w-none mx-auto"
            dangerouslySetInnerHTML={{ __html: detailContent }}
          />
        ) : (
          <div className="bg-gray-100 h-96 flex items-center justify-center rounded-lg">
            <p className="text-gray-500">暫無詳情內容</p>
          </div>
        )}
      </div>

      {/* 相關商品區塊 */}
      <div className="bg-gray-50 py-16 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" data-testid="related-products-container">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">您可能也會喜歡</h2>
            <p className="text-gray-600">為您精心挑選的相關商品</p>
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
import { HttpTypes } from "@medusajs/types"
import type { FeaturedProductsSection } from "@lib/types/page-sections"
import { Text } from "@medusajs/ui"
import { Suspense } from "react"
import ProductPreviewGrid from "./product-rail"
import SkeletonProductPreview from "@modules/skeletons/components/skeleton-product-preview"

type FeaturedProductsProps = {
  collections: HttpTypes.StoreCollection[]
  region: HttpTypes.StoreRegion
  settings?: FeaturedProductsSection
}

export default function FeaturedProducts({
  collections,
  region,
  settings,
}: FeaturedProductsProps) {
  // 如果沒有收到必要的參數，返回 null
  if (!collections || !region) {
    console.error("FeaturedProducts - Missing required props:", { collections, region })
    return null
  }

  // 如果 collections 為空陣列，返回提示訊息
  if (collections.length === 0) {
    return (
      <div className="w-full py-8 text-center text-gray-500">
        目前沒有精選商品
      </div>
    )
  }

  const renderTitle = (settings?: FeaturedProductsSection) => {
    if (!settings) return null
    const { showHeading, heading } = settings

    if (!showHeading) return null

    return (
      <div className="mb-16 text-center px-4 md:px-8">
        {showHeading && heading && (
          <h1 className="h1">{heading}</h1>
        )}
      </div>
    )
  }

  return (
    <div className="w-full">
      {collections.map((collection) => (
        <section 
          key={collection.id} 
          className={settings?.showHeading ? "py-8 md:py-12" : "py-0"}
        >
          <div className="w-full">
            <div className="container mx-auto">
              {renderTitle(settings)}
            </div>
            <Suspense fallback={<SkeletonProductGrid />}>
              <ProductPreviewGrid collection={collection} region={region} />
            </Suspense>
          </div>
        </section>
      ))}
    </div>
  )
}

const SkeletonProductGrid = () => {
  return (
    <div className="grid grid-cols-2 small:grid-cols-4 gap-0 w-full bg-neutral-200">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="w-full bg-white">
          <SkeletonProductPreview />
        </div>
      ))}
    </div>
  )
}

import { HttpTypes } from "@medusajs/types"
import type { FeaturedProductsSection } from "@lib/types/page-sections"
import { Suspense } from "react"
import ProductPreviewGrid from "./product-rail"
import SkeletonProductPreview from "@modules/skeletons/components/skeleton-product-preview"

type FeaturedProductsProps = {
  collections: HttpTypes.StoreCollection[]
  region: HttpTypes.StoreRegion
  settings?: FeaturedProductsSection
  paddingX?: number | undefined
  countryCode: string
}

export default function FeaturedProducts({
  collections,
  region,
  settings,
  paddingX,
  countryCode
}: FeaturedProductsProps) {
  // 如果沒有收到必要的參數，返回 null
  if (!collections || !region) {
    // console.error("FeaturedProducts - Missing required props:", { collections, region })
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

  const paddingValue = paddingX ?? settings?.paddingX
  const paddingStyle = paddingValue ? {
    paddingLeft: `${paddingValue / 2}%`,
    paddingRight: `${paddingValue / 2}%`
  } : {}

  return (
    <div className="w-full pt-12 pb-6 md:pt-16 md:pb-12 xl:pt-20 xl:pb-16 2xl:pt-24 2xl:pb-20" style={paddingStyle}>
      {collections.map((collection) => (
        <section
          key={collection.id}
          className={settings?.showHeading ? "py-8 md:py-12" : "py-0"}
        >
          <div className="w-full">
            <div className="px-6 md:px-12 xl:px-16 2xl:px-20">
              {renderTitle(settings)}
            </div>
            <Suspense fallback={<SkeletonProductGrid />}>
              <ProductPreviewGrid collection={collection} region={region} countryCode={countryCode} />
            </Suspense>
          </div>
        </section>
      ))}
    </div>
  )
}

const SkeletonProductGrid = () => {
  return (
    <div className="px-6 md:px-12 xl:px-16 2xl:px-20">
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-0 w-full bg-neutral-200">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="w-full bg-white">
            <SkeletonProductPreview />
          </div>
        ))}
      </div>
    </div>
  )
}

import { HttpTypes } from "@medusajs/types"
import ProductPreview from "@modules/products/components/product-preview"
import { listProducts } from "@lib/data/products"

type ProductPreviewGridProps = {
  collection: HttpTypes.StoreCollection
  region: HttpTypes.StoreRegion
  countryCode: string
}

export default async function ProductPreviewGrid({
  collection,
  region,
  countryCode,
}: ProductPreviewGridProps) {
  const { response: { products } } = await listProducts({
    regionId: region.id,
    countryCode,
    queryParams: {
      collection_id: [collection.id],
      limit: 4
    } as any
  })

  if (products?.length === 0) {
    return null
  }

  // 轉換產品類型以匹配 HttpTypes.StoreProduct
  const standardProducts = products

  return (
    <div className="px-6 md:px-12 xl:px-16 2xl:px-20">
      <ul className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-0 w-full">
        {standardProducts.map(product => (
          <li key={product.id} className="w-full bg-white">
            <ProductPreview
              product={product}
              isFeatured={collection.handle === "featured"}
              countryCode={countryCode}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}

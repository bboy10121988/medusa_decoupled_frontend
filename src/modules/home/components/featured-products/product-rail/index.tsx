import { HttpTypes } from "@medusajs/types"
import ProductPreview from "@modules/products/components/product-preview"
import { listProducts } from "@lib/data/products"

type ProductPreviewGridProps = {
  collection: HttpTypes.StoreCollection
  region: HttpTypes.StoreRegion
}

export default async function ProductPreviewGrid({
  collection,
  region,
}: ProductPreviewGridProps) {
  const { response: { products } } = await listProducts({
    regionId: region.id,
    queryParams: {
      collection_id: [collection.id],
      limit: 4
    } as any
  })

  if (!products || products.length === 0) {
    return null
  }

  return (
    <ul className="grid grid-cols-2 small:grid-cols-4 gap-0 w-full">
      {products.map(product => (
        <li key={product.id} className="w-full bg-white">
          <ProductPreview 
            product={product}
            isFeatured={collection.handle === "featured"}
            countryCode="tw"
          />
        </li>
      ))}
    </ul>
  )
}

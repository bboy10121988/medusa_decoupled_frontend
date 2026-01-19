import { getTranslation } from "@lib/translations"

type CategoriesAndTagsTabProps = {
  product?: any
  countryCode?: string
}

const TagIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
  </svg>
)

const CategoryIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
)

const CollectionIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
)

const CategoriesAndTagsTab = ({ product, countryCode = 'tw' }: CategoriesAndTagsTabProps) => {
  const t = getTranslation(countryCode)

  return (
    <div className="text-small-regular py-8">
      <div className="grid grid-cols-1 gap-y-8">

        {/* 系列 (Collection) */}
        {product?.collection && (
          <div>
            <div className="flex items-center gap-x-2 mb-4">
              <CollectionIcon />
              <span className="font-semibold">{t.collection || "Collection"}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                {product.collection.handle === 'featured' ? (t.featured || product.collection.title) : product.collection.title}
              </span>
            </div>
            {product.collection.handle && (
              <p className="text-xs text-gray-500 mt-2">{t.collectionHandle || "Collection Code:"} {product.collection.handle}</p>
            )}
          </div>
        )}

        {/* 分類 (Categories) */}
        {product?.categories && product.categories.length > 0 && (
          <div>
            <div className="flex items-center gap-x-2 mb-4">
              <CategoryIcon />
              <span className="font-semibold">{t.categories || "Categories"}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.categories.map((category: any) => (
                <span
                  key={category.id}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                >
                  {category.name}
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {(t.totalCategories || "Total {count} categories").replace('{count}', product.categories.length.toString())}
            </p>
          </div>
        )}

        {/* 標籤 (Tags) */}
        {product?.tags && product.tags.length > 0 && (
          <div>
            <div className="flex items-center gap-x-2 mb-4">
              <TagIcon />
              <span className="font-semibold">{t.tags || "Tags"}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag: any) => (
                <span
                  key={tag.id}
                  className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                >
                  {tag.value}
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {(t.totalTags || "Total {count} tags").replace('{count}', product.tags.length.toString())}
            </p>
          </div>
        )}

        {/* 空狀態提示 */}
        {(!product?.collection && (!product?.categories || product.categories.length === 0) && (!product?.tags || product.tags.length === 0)) && (
          <div className="text-gray-500 text-center py-8">
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 text-gray-400">
                <CollectionIcon />
                <CategoryIcon />
                <TagIcon />
              </div>
              <p>{t.noProductMeta || "No collection, categories or tags set for this product."}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CategoriesAndTagsTab

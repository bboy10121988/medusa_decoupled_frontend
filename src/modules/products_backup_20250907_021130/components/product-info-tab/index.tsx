type ProductTabsProps = {
  product: any
}

const ProductInfoTab = ({ product }: ProductTabsProps) => {
  return (
    <div className="text-small-regular py-8">
      <div className="grid grid-cols-1 gap-y-6">
        {/* 商品描述 */}
        <div>
          <span className="font-semibold text-base">商品描述</span>
          <p className="mt-2 text-base text-gray-700 whitespace-pre-line">
            {product.description || "暫無商品描述"}
          </p>
        </div>

        {/* 基本規格和自定義屬性統一顯示 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 材質 */}
          {product.material && (
            <div>
              <span className="font-semibold text-base">材質</span>
              <p className="mt-2 text-base text-gray-700">{product.material}</p>
            </div>
          )}

          {/* 品牌 (從 metadata 取得) */}
          {product.metadata?.brand && (
            <div>
              <span className="font-semibold text-base">品牌</span>
              <p className="mt-2 text-base text-gray-700">{product.metadata.brand}</p>
            </div>
          )}

          {/* 重量 */}
          {product.weight && (
            <div>
              <span className="font-semibold text-base">重量</span>
              <p className="mt-2 text-base text-gray-700">{product.weight}g</p>
            </div>
          )}

          {/* 顏色 (從 metadata 取得) */}
          {product.metadata?.color && (
            <div>
              <span className="font-semibold text-base">顏色</span>
              <p className="mt-2 text-base text-gray-700">{product.metadata.color}</p>
            </div>
          )}

          {/* 尺寸 */}
          {(product.length && product.width && product.height) && (
            <div>
              <span className="font-semibold text-base">尺寸</span>
              <p className="mt-2 text-base text-gray-700">
                {product.length}L x {product.width}W x {product.height}H cm
              </p>
            </div>
          )}

          {/* 尺寸選項 (從 metadata 取得) */}
          {product.metadata?.size && (
            <div>
              <span className="font-semibold text-base">尺寸選項</span>
              <p className="mt-2 text-base text-gray-700">{product.metadata.size}</p>
            </div>
          )}

          {/* 產地 */}
          {product.origin_country && (
            <div>
              <span className="font-semibold text-base">產地</span>
              <p className="mt-2 text-base text-gray-700">{product.origin_country}</p>
            </div>
          )}

          {/* 商品類型 */}
          {product.type && (
            <div>
              <span className="font-semibold text-base">商品類型</span>
              <p className="mt-2 text-base text-gray-700">{product.type.value || product.type}</p>
            </div>
          )}

          {/* 商品狀態 */}
          {product.status && (
            <div>
              <span className="font-semibold text-base">狀態</span>
              <p className="mt-2 text-base text-gray-700">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  product.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {product.status === 'published' ? '已上架' : product.status === 'draft' ? '草稿' : product.status}
                </span>
              </p>
            </div>
          )}

          {/* 商品編號 */}
          {product.id && (
            <div>
              <span className="font-semibold text-base">商品編號</span>
              <p className="mt-2 text-sm text-gray-700 font-mono">{product.id}</p>
            </div>
          )}

          {/* 其他自定義屬性 (從 metadata) */}
          {product.metadata && Object.entries(product.metadata).filter(([key, value]) => 
            !['brand', 'color', 'size'].includes(key) && value
          ).map(([key, value]) => (
            <div key={key}>
              <span className="font-semibold text-base capitalize">{key.replace(/_/g, ' ')}</span>
              <p className="mt-2 text-base text-gray-700">{String(value)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ProductInfoTab

type ShippingInfoTabProps = {
  product?: any
}

const PackageIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
)

const ClockIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const ReturnIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
  </svg>
)

const ShippingInfoTab = ({ product }: ShippingInfoTabProps) => {
  return (
    <div className="text-small-regular py-8">
      <div className="grid grid-cols-1 gap-y-8">
        <div>
          <div className="flex items-center gap-x-2 mb-4">
            <PackageIcon />
            <span className="font-semibold">運送資訊</span>
          </div>
          <ul className="gap-y-2 list-disc ml-6">
            <li>全台灣免運費（限時優惠）</li>
            <li>一般宅配：1-3個工作天到貨</li>
            <li>超商取貨：2-4個工作天到貨</li>
            <li>台北地區可選擇當日配送服務</li>
          </ul>
        </div>
        
        <div>
          <div className="flex items-center gap-x-2 mb-4">
            <ReturnIcon />
            <span className="font-semibold">退換貨政策</span>
          </div>
          <ul className="gap-y-2 list-disc ml-6">
            <li>商品享有7天鑑賞期</li>
            <li>退貨商品須保持全新狀態</li>
            <li>個人衛生用品不可退換貨</li>
            <li>客製化商品不適用退換貨</li>
          </ul>
        </div>

        <div>
          <div className="flex items-center gap-x-2 mb-4">
            <ClockIcon />
            <span className="font-semibold">營業時間</span>
          </div>
          <ul className="gap-y-2 list-disc ml-6">
            <li>週一至週五：09:00 - 18:00</li>
            <li>週六：10:00 - 17:00</li>
            <li>週日及國定假日：休息</li>
            <li>客服專線：0800-123-456</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default ShippingInfoTab

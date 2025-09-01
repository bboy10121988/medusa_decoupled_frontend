"use client"

import { useState, useEffect } from "react"
import { Button } from "@medusajs/ui"
import { MapPin } from "@medusajs/icons"
import { toast } from "react-hot-toast"
import LogisticsSelectionDisplay from "../logistics-selection-display"

type EcpayStoreMapProps = {
  cart: any
  onStoreSelected?: (storeInfo: any) => void
}

const EcpayStoreMap: React.FC<EcpayStoreMapProps> = ({ 
  cart, 
  onStoreSelected 
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [hasSelection, setHasSelection] = useState(false)

  // 檢查是否已有物流選擇
  useEffect(() => {
    const checkLogisticsSelection = () => {
      const saved = localStorage.getItem('ecpay_logistics_selection')
      setHasSelection(!!saved)
    }

    checkLogisticsSelection()

    // 監聽物流選擇更新
    const handleUpdate = () => {
      checkLogisticsSelection()
    }

    window.addEventListener('logistics-selection-updated', handleUpdate)
    
    return () => {
      window.removeEventListener('logistics-selection-updated', handleUpdate)
    }
  }, [])

  const handleOpenStoreMap = async () => {
    setIsLoading(true)
    
    try {
      console.log('� 開啟綠界物流選擇頁面...')
      
      // 從購物車中取得商品資訊
      const cartTotal = cart?.total || 500
      const goodsName = cart?.items?.map((item: any) => item.title).join(', ') || '購物車商品'
      
      // 準備物流選擇參數
      const logisticsParams = {
        goodsAmount: Math.min(Math.max(cartTotal, 1), 20000), // 確保在1-20000範圍內
        goodsName: goodsName.length > 50 ? goodsName.substring(0, 47) + '...' : goodsName,
        senderName: '商店名稱', // 可以從設定中取得
        senderZipCode: '100',
        senderAddress: '台北市中正區重慶南路一段122號', // 可以從設定中取得
        isCollection: 'N', // 是否代收貨款
        temperature: '0001', // 常溫
        specification: '0001', // 60cm
        scheduledPickupTime: '4', // 不限時
        enableSelectDeliveryTime: 'N',
        remark: `訂單編號: ${cart?.id || 'Unknown'}`,
        eshopMemberID: cart?.customer?.id || '',
        // 必要的回調 URL
        serverReplyURL: `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'}/store/ecpay/logistics-callback`,
        clientReplyURL: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8000'}/api/ecpay/logistics/callback`
      }
      
      console.log('📦 物流參數:', logisticsParams)
      
      const response = await fetch('/api/ecpay/express-map', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logisticsParams)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '無法開啟物流選擇頁面')
      }

      // 檢查回應類型
      const contentType = response.headers.get('content-type')
      
      if (contentType && contentType.includes('text/html')) {
        // HTML 回應 - 在新視窗開啟物流選擇頁面
        const html = await response.text()
        const logisticsWindow = window.open('', '_blank', 'width=900,height=700,scrollbars=yes,resizable=yes')
        
        if (logisticsWindow) {
          logisticsWindow.document.write(html)
          logisticsWindow.document.close()
          
          // 監聽物流選擇完成事件
          const checkClosed = setInterval(() => {
            if (logisticsWindow.closed) {
              clearInterval(checkClosed)
              toast.success('物流選擇視窗已關閉，請檢查是否已完成選擇')
            }
          }, 1000)
          
          // 設置全域回調函數來接收選擇結果
          ;(window as any).onLogisticsSelected = (data: any) => {
            console.log('✅ 收到物流選擇結果:', data)
            
            // 儲存物流選擇資訊到 localStorage
            if (data.tempLogisticsID) {
              const logisticsInfo = {
                tempLogisticsID: data.tempLogisticsID,
                logisticsType: data.logisticsType,
                logisticsSubType: data.logisticsSubType,
                receiverName: data.receiverName,
                receiverPhone: data.receiverPhone,
                receiverCellPhone: data.receiverCellPhone,
                receiverAddress: data.receiverAddress,
                receiverStoreID: data.receiverStoreID,
                receiverStoreName: data.receiverStoreName,
                selectedAt: data.selectedAt
              }
              
              localStorage.setItem('ecpay_logistics_selection', JSON.stringify(logisticsInfo))
              
              // 觸發更新事件
              window.dispatchEvent(new CustomEvent('logistics-selection-updated'))
              
              // 通知父組件
              onStoreSelected?.(logisticsInfo)
              
              // 顯示成功訊息
              const storeText = data.receiverStoreName ? 
                `已選擇：${data.receiverStoreName}` : 
                `已完成物流選擇 (${data.logisticsSubType})`
              
              toast.success(storeText)
            }
          }
          
          // 監聽 PostMessage
          const handleMessage = (event: MessageEvent) => {
            if (event.data && event.data.type === 'LOGISTICS_SELECTED') {
              ;(window as any).onLogisticsSelected?.(event.data.data)
            }
          }
          
          window.addEventListener('message', handleMessage)
          
          // 清理函數
          setTimeout(() => {
            window.removeEventListener('message', handleMessage)
            delete (window as any).onLogisticsSelected
          }, 300000) // 5分鐘後清理
          
        } else {
          throw new Error('無法開啟物流選擇視窗，請檢查瀏覽器彈窗設定')
        }
      } else {
        // JSON 回應
        const result = await response.json()
        console.log('✅ 物流選擇 API 回應:', result)
        
        if (result.success) {
          toast.success('物流選擇頁面已準備完成')
        } else {
          throw new Error(result.message)
        }
      }
      
    } catch (error) {
      console.error('❌ 開啟物流選擇頁面失敗:', error)
      toast.error(error instanceof Error ? error.message : '開啟物流選擇頁面失敗')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* 顯示物流選擇結果 */}
      <LogisticsSelectionDisplay />
      
      <div className="p-4 border rounded-lg" style={{ 
        backgroundColor: "var(--bg-secondary)", 
        borderColor: "var(--border-primary)" 
      }}>
        <h4 className="font-medium mb-2" style={{ color: "var(--text-primary)" }}>
          超商取貨門市選擇
        </h4>
        <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
          點擊下方按鈕開啟綠界超商選擇頁面，可選擇 7-11、全家、萊爾富等超商門市
        </p>
        
        <Button
          onClick={handleOpenStoreMap}
          disabled={isLoading}
          className="w-full flex items-center gap-2"
          variant="secondary"
        >
          <MapPin className="w-4 h-4" />
          {isLoading ? '開啟中...' : '選擇超商門市'}
        </Button>
      </div>
      
      {/* 使用說明 */}
      <div className="text-xs space-y-1" style={{ color: "var(--text-tertiary)" }}>
        <div>• 點擊「選擇超商門市」會開啟綠界官方超商選擇頁面</div>
        <div>• 可選擇 7-11、全家、萊爾富等超商門市</div>
        <div>• 可進一步選擇指定門市位置</div>
        <div>• 選擇完成後關閉視窗即可繼續結帳流程</div>
      </div>
    </div>
  )
}

export default EcpayStoreMap

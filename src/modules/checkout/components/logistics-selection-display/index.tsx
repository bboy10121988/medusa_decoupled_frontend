"use client"

import React, { useState, useEffect } from 'react'
import { CheckCircleSolid, XMarkMini } from "@medusajs/icons"

interface LogisticsSelectionDisplayProps {
  onClear?: () => void
}

const LogisticsSelectionDisplay: React.FC<LogisticsSelectionDisplayProps> = ({ onClear }) => {
  const [logisticsInfo, setLogisticsInfo] = useState<any>(null)

  useEffect(() => {
    // 從 localStorage 讀取物流選擇資訊
    const loadLogisticsInfo = () => {
      const saved = localStorage.getItem('ecpay_logistics_selection')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          setLogisticsInfo(parsed)
        } catch (error) {
          console.error('解析物流選擇資訊失敗:', error)
        }
      }
    }

    // 初始載入
    loadLogisticsInfo()

    // 監聽 localStorage 變化
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'ecpay_logistics_selection') {
        loadLogisticsInfo()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    
    // 也監聽自定義事件（同一頁面內的更新）
    const handleCustomEvent = () => {
      loadLogisticsInfo()
    }
    
    window.addEventListener('logistics-selection-updated', handleCustomEvent)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('logistics-selection-updated', handleCustomEvent)
    }
  }, [])

  const handleClear = () => {
    localStorage.removeItem('ecpay_logistics_selection')
    setLogisticsInfo(null)
    onClear?.()
    
    // 觸發自定義事件
    window.dispatchEvent(new CustomEvent('logistics-selection-updated'))
  }

  const getLogisticsTypeText = (logisticsType: string, logisticsSubType: string) => {
    if (logisticsType === 'CVS') {
      if (logisticsSubType.includes('UNIMART')) return '7-ELEVEN 超商取貨'
      if (logisticsSubType.includes('FAMI')) return '全家便利商店取貨'
      if (logisticsSubType.includes('HILIFE')) return '萊爾富便利商店取貨'
      if (logisticsSubType.includes('OKMART')) return 'OK超商取貨'
      return '便利商店取貨'
    } else if (logisticsType === 'HOME') {
      return '宅配到府'
    }
    return logisticsSubType
  }

  if (!logisticsInfo) {
    return null
  }

  return (
    <div className="p-4 border rounded-lg bg-green-50 border-green-200">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <CheckCircleSolid className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          
          <div className="flex-1">
            <h4 className="font-medium text-green-800 mb-2">
              已選擇物流方式
            </h4>
            
            <div className="space-y-2 text-sm text-green-700">
              <div>
                <strong>配送方式：</strong>
                {getLogisticsTypeText(logisticsInfo.logisticsType, logisticsInfo.logisticsSubType)}
              </div>
              
              {logisticsInfo.receiverStoreName && (
                <div>
                  <strong>取貨門市：</strong>
                  {logisticsInfo.receiverStoreName}
                  {logisticsInfo.receiverStoreID && ` (${logisticsInfo.receiverStoreID})`}
                </div>
              )}
              
              {logisticsInfo.receiverName && (
                <div>
                  <strong>收件人：</strong>
                  {logisticsInfo.receiverName}
                </div>
              )}
              
              {logisticsInfo.receiverAddress && !logisticsInfo.receiverStoreName && (
                <div>
                  <strong>收件地址：</strong>
                  {logisticsInfo.receiverAddress}
                </div>
              )}
              
              {(logisticsInfo.receiverPhone || logisticsInfo.receiverCellPhone) && (
                <div>
                  <strong>聯絡電話：</strong>
                  {logisticsInfo.receiverCellPhone || logisticsInfo.receiverPhone}
                </div>
              )}
              
              {logisticsInfo.tempLogisticsID && (
                <div className="text-xs opacity-75">
                  物流訂單編號：{logisticsInfo.tempLogisticsID}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <button
          onClick={handleClear}
          className="p-1 hover:bg-green-100 rounded-full transition-colors"
          title="重新選擇"
        >
          <XMarkMini className="w-4 h-4 text-green-600" />
        </button>
      </div>
    </div>
  )
}

export default LogisticsSelectionDisplay

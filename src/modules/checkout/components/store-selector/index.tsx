import React, { useState, useEffect } from "react";

// 物流選項介面
interface LogisticsOption {
  value: string;
  label: string;
  description: string;
  icon: string;
}

// 選中門市資訊介面
interface SelectedStore {
  CVSStoreID?: string;
  CVSStoreName?: string;
  CVSAddress?: string;
  CVSTelephone?: string;
  logisticsSubType?: string;
}

interface StoreSelectionData {
  storeId: string;
  storeName: string;
  storeAddress: string;
  telephone?: string;
  logisticsSubType: string;
}

const StoreSelector: React.FC = () => {
  const [selectedLogistics, setSelectedLogistics] = useState<string>("FAMI");
  const [selectedStore, setSelectedStore] = useState<SelectedStore | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 物流選項
  const logisticsOptions: LogisticsOption[] = [
    {
      value: "FAMI",
      label: "全家便利商店",
      description: "全台據點最多，24小時營業",
      icon: "🏪"
    },
    {
      value: "UNIMART", 
      label: "7-ELEVEN",
      description: "全台最大便利商店連鎖",
      icon: "🏬"
    },
    {
      value: "HILIFE",
      label: "萊爾富",
      description: "社區型便利商店",
      icon: "🏪"
    },
    {
      value: "FAMIC2C",
      label: "全家店到店",
      description: "全家便利商店店到店服務",
      icon: "📦"
    },
    {
      value: "UNIMARTC2C",
      label: "7-ELEVEN交貨便",
      description: "7-ELEVEN超商交貨便",
      icon: "📦"
    },
    {
      value: "HILIFEC2C",
      label: "萊爾富店到店",
      description: "萊爾富便利商店店到店",
      icon: "📦"
    }
  ];

  // 使用物流選擇頁面代替電子地圖
  const openLogisticsSelection = async () => {
    try {
      setIsLoading(true);
      console.log('� 開啟物流選擇頁面:', selectedLogistics);

      // 呼叫後端物流選擇 API
      const baseUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'
      const response = await fetch(`${baseUrl}/store/ecpay/logistics-selection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ''
        },
        body: JSON.stringify({
          goodsAmount: 500,
          goodsName: "商品配送",
          senderName: "商家名稱",
          senderZipCode: "100", 
          senderAddress: "台北市中正區",
          logisticsType: "CVS",
          logisticsSubType: selectedLogistics
        })
      });

      if (response.ok) {
        const html = await response.text();
        
        // 在新視窗中開啟物流選擇頁面
        const logisticsWindow = window.open('', 'ecpay_logistics', 'width=900,height=700,scrollbars=yes,resizable=yes');
        if (logisticsWindow) {
          logisticsWindow.document.write(html);
          logisticsWindow.document.close();
        } else {
          alert('請允許彈出視窗以開啟物流選擇頁面');
        }
      } else {
        // 更好的錯誤處理
        let errorMessage = '物流選擇頁面生成失敗';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // 如果回應不是 JSON，使用狀態文字
          errorMessage = `${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

    } catch (error: any) {
      console.error('❌ 開啟物流選擇頁面失敗:', error);
      alert(`開啟物流選擇頁面失敗: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 注意：使用物流選擇頁面後，門市選擇結果將透過回調 URL 處理
  // 這裡不再需要監聽 postMessage 事件

  return (
    <div className="space-y-4">
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">選擇取貨方式</h3>
        
        <div className="space-y-3">
          {logisticsOptions.map((option) => (
            <label
              key={option.value}
              className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="radio"
                name="logistics"
                value={option.value}
                checked={selectedLogistics === option.value}
                onChange={(e) => setSelectedLogistics(e.target.value)}
                className="w-4 h-4 text-blue-600"
              />
              <div className="flex items-center space-x-3 flex-1">
                <span className="text-2xl">{option.icon}</span>
                <div>
                  <div className="font-medium">{option.label}</div>
                  <div className="text-sm text-gray-600">{option.description}</div>
                </div>
              </div>
            </label>
          ))}
        </div>

        <button
          onClick={openLogisticsSelection}
          disabled={isLoading}
          className="mt-4 w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 px-4 rounded-lg font-medium transition-colors"
        >
          {isLoading ? '開啟選擇頁面中...' : '� 選擇取貨門市'}
        </button>
      </div>

      {selectedStore && (
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center mt-1 flex-shrink-0">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="space-y-1">
              <h4 className="font-semibold text-green-800">已選擇門市</h4>
              <div className="text-sm text-green-700">
                <div className="font-medium">{selectedStore.CVSStoreName}</div>
                <div>門市編號: {selectedStore.CVSStoreID}</div>
                <div>地址: {selectedStore.CVSAddress}</div>
                {selectedStore.CVSTelephone && (
                  <div>電話: {selectedStore.CVSTelephone}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreSelector;

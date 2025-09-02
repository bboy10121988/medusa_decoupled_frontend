# 聯盟推廣連結儲存系統說明

## 🎯 功能概述

聯盟推廣連結儲存系統支援兩種儲存模式，可以根據需求自由切換：

### 📝 儲存模式

#### 1. 記憶體模式 (Memory)
- **優點**: 速度快，無需檔案讀寫
- **缺點**: 重啟伺服器後資料會消失
- **適用**: 開發測試環境

#### 2. JSON 檔案模式 (JSON)
- **優點**: 資料持久保存，重啟後仍然存在
- **缺點**: 檔案讀寫稍微較慢
- **適用**: 小型生產環境或需要持久化的開發環境
- **儲存位置**: `./data/affiliate-links/links.json`

## ⚙️ 設定方法

### 環境變數設定

在 `.env.local` 檔案中設定：

```bash
# 記憶體模式
AFFILIATE_STORAGE_MODE=memory

# JSON 檔案模式
AFFILIATE_STORAGE_MODE=json
```

### 使用管理工具切換

```bash
# 切換儲存模式
node manage-links.js switch

# 查看目前設定和所有連結
node manage-links.js show

# 清理所有連結資料
node manage-links.js clear
```

## 🔧 API 使用方式

### 創建連結

```bash
POST /api/affiliate/links
Content-Type: application/json
Cookie: _affiliate_jwt=<聯盟會員認證Token>

{
  "name": "首頁推廣",
  "targetUrl": "/tw",
  "utmParams": {
    "utm_source": "affiliate",
    "utm_medium": "referral",
    "utm_campaign": "homepage"
  }
}
```

**回應**:
```json
{
  "success": true,
  "link": {
    "id": "lnk_1234567890",
    "name": "首頁推廣",
    "url": "http://localhost:8000/tw?ref=aff_123&utm_source=affiliate&utm_medium=referral&utm_campaign=homepage",
    "createdAt": "2025-09-02T14:30:00.000Z",
    "clicks": 0,
    "conversions": 0
  },
  "message": "連結創建成功"
}
```

### 取得連結列表

```bash
GET /api/affiliate/links
Cookie: _affiliate_jwt=<聯盟會員認證Token>
```

**回應**:
```json
{
  "links": [
    {
      "id": "lnk_1234567890",
      "name": "首頁推廣",
      "url": "http://localhost:8000/tw?ref=aff_123&utm_source=affiliate&utm_medium=referral&utm_campaign=homepage",
      "createdAt": "2025-09-02T14:30:00.000Z",
      "clicks": 0,
      "conversions": 0
    }
  ]
}
```

### 刪除連結

```bash
DELETE /api/affiliate/links?id=lnk_1234567890
Cookie: _affiliate_jwt=<聯盟會員認證Token>
```

**回應**:
```json
{
  "success": true,
  "message": "連結已刪除"
}
```

## 🧪 測試方法

### 1. 使用測試腳本

```bash
# 執行完整的儲存功能測試
node test-link-storage.js
```

### 2. 使用測試帳號登入

在瀏覽器中訪問: `http://localhost:8000/tw/affiliate/login`

**測試帳號**:
- 電子郵件: `test@affiliate.com`
- 密碼: `test123`

登入後可訪問: `http://localhost:8000/tw/affiliate/links`

### 3. 使用管理工具檢視

```bash
# 查看所有儲存的連結
node manage-links.js show

# 切換儲存模式
node manage-links.js switch

# 清理測試資料
node manage-links.js clear
```

## 📁 檔案結構

```
frontend/
├── .env.local                    # 環境變數設定
├── data/
│   └── affiliate-links/
│       └── links.json           # JSON 模式儲存檔案
├── manage-links.js              # 連結管理工具
├── test-link-storage.js         # 儲存功能測試腳本
└── src/
    └── app/
        └── api/
            └── affiliate/
                └── links/
                    └── route.ts # API 路由實作
```

## 🔄 資料格式

### JSON 檔案格式

```json
{
  "aff_123": [
    {
      "id": "lnk_1234567890",
      "name": "首頁推廣",
      "url": "http://localhost:8000/tw?ref=aff_123&utm_source=affiliate&utm_medium=referral&utm_campaign=homepage",
      "createdAt": "2025-09-02T14:30:00.000Z",
      "clicks": 0,
      "conversions": 0
    }
  ],
  "aff_456": [
    // 其他聯盟夥伴的連結...
  ]
}
```

## 🚀 部署注意事項

### 開發環境
- 建議使用 **記憶體模式**，速度快且便於測試
- 不需要擔心檔案權限問題

### 生產環境
- 建議使用 **JSON 檔案模式**，確保資料不會丟失
- 確保 `data/affiliate-links/` 目錄有寫入權限
- 定期備份 `links.json` 檔案

### 未來擴展
當需要更強大的儲存能力時，可以輕鬆擴展到：
- PostgreSQL 資料庫
- MongoDB
- Redis
- 雲端儲存服務

只需修改 `src/app/api/affiliate/links/route.ts` 中的儲存函數即可。

## ✅ 功能檢查清單

- [x] 記憶體儲存模式
- [x] JSON 檔案儲存模式
- [x] 環境變數控制
- [x] API 路由 (GET, POST, DELETE)
- [x] 聯盟會員認證整合
- [x] UTM 參數自動生成
- [x] 連結統計 (點擊數、轉換數)
- [x] 管理工具
- [x] 測試腳本
- [x] 錯誤處理
- [x] 建置成功驗證

## 📞 支援

如需協助或回報問題，請檢查：
1. 環境變數是否正確設定
2. 開發伺服器是否正在運行
3. 聯盟會員是否已登入
4. JSON 檔案權限是否正確

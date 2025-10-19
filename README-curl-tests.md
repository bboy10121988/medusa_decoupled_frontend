# Tim's Fantasy World - cURL 測試套件使用指南

## 📋 概述

此測試套件提供全面的 cURL 測試，涵蓋你的 Tim's Fantasy World 網站的所有主要功能：

- **前端** (localhost:8000) - Next.js 應用程式
- **後端 API** (localhost:9000) - Medusa 電商後端
- **CMS** (localhost:8000/CMS) - Sanity 內容管理系統

## 🚀 快速開始

### 1. 準備環境

確保以下服務正在運行：

```bash
# 啟動 Medusa 後端 (端口 9000)
cd ../backend_vm/medusa-backend
npm run dev

# 啟動前端 (端口 8000)
cd frontend
npm run dev
```

### 2. 執行測試

```bash
# 賦予執行權限
chmod +x curl-test-suite.sh

# 執行完整測試套件
./curl-test-suite.sh

# 或者指定特定測試部分（見下方自定義選項）
```

## 📊 測試內容

### 1. 基礎連接測試
- 前端首頁連通性
- 後端 API 健康檢查
- CMS 頁面訪問

### 2. 前端頁面路由測試
- **主要頁面**: 首頁、商品、部落格、購物車
- **會員功能**: 登入、註冊、會員中心、訂單歷史
- **聯盟行銷**: 註冊、登入、後台管理
- **結帳流程**: 結帳頁面

### 3. Medusa Backend API 測試
- **商店資訊**: 基本資訊、區域、國家
- **產品管理**: 產品列表、分類、系列
- **購物車**: 建立和管理
- **客戶服務**: 密碼重設等

### 4. 前端 API 路由測試
- **客戶 API**: 個人資訊、訂單查詢
- **CMS API**: 頁面管理、Sanity webhook
- **Debug API**: 系統除錯端點
- **聯盟 API**: 統計和獎金

### 5. 搜尋功能測試
- 產品搜尋
- 部落格搜尋
- 全站搜尋

### 6. 表單提交測試
- 聯絡表單
- 電子報訂閱

### 7. 靜態資源測試
- robots.txt
- favicon.ico
- sitemap.xml

### 8. CMS 功能測試
- Sanity Studio 訪問
- CMS 管理介面

### 9. 效能測試
- 響應時間測量
- 多次測試取平均值

### 10. 錯誤處理測試
- 404 頁面
- API 錯誤處理

## 📈 測試結果解讀

### 狀態碼含義
- `200`: 成功
- `404`: 頁面或資源未找到
- `500`: 伺服器內部錯誤
- `302/301`: 重新導向

### 日誌分析
測試會產生詳細日誌文件 `curl-test-results-YYYYMMDD_HHMMSS.log`，包含：
- 每個測試的狀態碼
- 響應時間
- 時間戳記

## 🛠 自定義測試

### 環境變數配置
修改腳本開頭的配置：

```bash
FRONTEND_URL="http://localhost:8000"
BACKEND_URL="http://localhost:9000"  
CMS_URL="http://localhost:8000/CMS"
COUNTRY_CODE="tw"
```

### 添加自定義測試
在相應的測試區塊中添加：

```bash
# 基本頁面測試
run_curl_test "測試名稱" "$FRONTEND_URL/your-path"

# JSON API 測試  
test_json_api "API 測試名稱" "$BACKEND_URL/api/endpoint"

# 表單提交測試
test_form_submit "表單測試名稱" "$URL" "form_data=value"
```

## 🔧 故障排除

### 常見問題

1. **連接被拒絕**
   ```
   curl: (7) Failed to connect to localhost port 8000: Connection refused
   ```
   - 確認相應服務已啟動
   - 檢查端口是否正確

2. **權限被拒絕**
   ```
   Permission denied
   ```
   - 執行 `chmod +x curl-test-suite.sh`

3. **JSON 解析錯誤**
   - 檢查 API 端點是否返回有效的 JSON
   - 確認 Content-Type 標頭正確

### Debug 模式
添加 `-v` 參數到 curl 命令以獲得詳細輸出：

```bash
curl -v -X GET "$URL"
```

## 📝 測試報告

### 自動報告
腳本會自動生成：
- 控制台彩色輸出
- 統計總結
- 詳細日誌文件

### 手動分析
使用以下命令分析日誌：

```bash
# 查看失敗的測試
grep "FAIL" curl-test-results-*.log

# 查看響應時間超過 1 秒的測試
grep -E "Time: [1-9]\." curl-test-results-*.log

# 統計狀態碼分布
grep -o "Status: [0-9]*" curl-test-results-*.log | sort | uniq -c
```

## 🔄 持續整合

### 定期執行
設置 cron job 定期執行測試：

```bash
# 每天午夜執行測試
0 0 * * * cd /path/to/frontend && ./curl-test-suite.sh >> daily-tests.log 2>&1
```

### CI/CD 整合
在 GitHub Actions 或其他 CI/CD 平台中使用：

```yaml
- name: Run cURL Tests
  run: |
    chmod +x curl-test-suite.sh
    ./curl-test-suite.sh
```

## 📞 支援

如有問題或需要協助：
1. 檢查日誌文件中的詳細錯誤資訊
2. 確認所有服務都在正確的端口上運行
3. 驗證網路連接和防火牆設定

---

**注意**: 此測試套件設計用於開發和測試環境。在生產環境中使用前請適當調整 URL 和測試參數。
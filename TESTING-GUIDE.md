# 🎯 Tim's Fantasy World - cURL 測試套件

## 📋 完整的測試解決方案

我已經為你建立了一個全面的 cURL 測試套件，可以測試你的整個網站的所有按鈕和互動功能。

## 🗂️ 包含的文件

### 1. 主要測試腳本
- **`curl-test-suite.sh`** - 完整的網站測試套件 (60+ 項測試)
- **`interactive-test-suite.sh`** - 專門測試互動功能 (40+ 項測試)

### 2. 配置和工具
- **`Makefile`** - 自動化測試執行工具
- **`README-curl-tests.md`** - 詳細使用指南

### 3. 測試覆蓋範圍

#### 🌐 前端測試 (localhost:8000)
- ✅ 所有頁面路由 (首頁、商品、部落格、購物車等)
- ✅ 會員功能 (登入、註冊、個人資料、訂單)
- ✅ 聯盟行銷功能
- ✅ 搜尋功能
- ✅ 導航連結
- ✅ 表單提交

#### 🛠️ 後端 API 測試 (localhost:9000)
- ✅ Medusa 商店 API
- ✅ 產品管理 API
- ✅ 購物車 API
- ✅ 客戶管理 API
- ✅ 健康檢查

#### 📝 CMS 測試 (localhost:8000/CMS)
- ✅ Sanity Studio 訪問
- ✅ CMS API 端點
- ✅ Webhook 測試
- ✅ 內容管理功能

## 🚀 快速開始

### 1. 一鍵執行所有測試
```bash
make test-all
```

### 2. 執行特定測試類型
```bash
# 基礎連接測試
make test-basic

# 互動功能測試
make test-interactive

# 效能測試
make test-performance

# API 測試
make test-api

# 前端頁面測試
make test-frontend

# 後端服務測試
make test-backend

# CMS 功能測試
make test-cms
```

### 3. 健康檢查和監控
```bash
# 快速健康檢查
make health-check

# 連續監控
make monitor

# 查看服務狀態
make status
```

## 📊 測試結果說明

### 狀態碼含義
- **200-299**: ✅ 成功
- **300-399**: 🔄 重新導向 (通常正常)
- **400-499**: ❌ 客戶端錯誤
- **500-599**: ❌ 伺服器錯誤

### 測試報告
每次執行完整測試後會產生：
- 控制台彩色輸出
- 詳細日誌文件 (`curl-test-results-YYYYMMDD_HHMMSS.log`)
- 統計摘要

## 🎮 互動功能測試詳細說明

`interactive-test-suite.sh` 專門測試以下互動功能：

### 🧭 導航測試
- 主選單連結 (首頁、商品、部落格、購物車)
- 會員登入/註冊連結
- 麵包屑導航

### 🔍 搜尋功能
- 產品搜尋
- 部落格搜尋
- 全站搜尋

### 🛍️ 電商功能
- 產品瀏覽
- 分類篩選
- 購物車操作
- 結帳流程

### 👤 會員系統
- 登入表單
- 註冊表單
- 密碼重設
- 個人資料管理

### 🤝 聯盟行銷
- 聯盟註冊
- 聯盟登入
- 後台管理

### 📋 表單提交
- 聯絡表單
- 電子報訂閱
- 各種互動表單

## 📈 進階使用

### 自定義測試
在腳本中添加新的測試：

```bash
# 在 curl-test-suite.sh 中添加新測試
run_curl_test "測試名稱" "$URL" "GET" "" "" "200"

# 在 interactive-test-suite.sh 中添加互動測試
test_interaction "測試名稱" "描述" "$URL" "POST" "form_data=value"
```

### 環境配置
修改腳本開頭的配置變數：

```bash
FRONTEND_URL="http://localhost:8000"
BACKEND_URL="http://localhost:9000"
CMS_URL="http://localhost:8000/CMS"
COUNTRY_CODE="tw"
```

### 持續整合
在 CI/CD 中使用：

```yaml
- name: Run Website Tests
  run: |
    make test-all
```

## 🛠️ 故障排除

### 常見問題

1. **服務未啟動**
   ```bash
   make status  # 檢查服務狀態
   ```

2. **權限問題**
   ```bash
   chmod +x *.sh  # 給予執行權限
   ```

3. **端口衝突**
   - 確認 localhost:8000 (前端) 和 localhost:9000 (後端) 可用

4. **測試失敗**
   ```bash
   make logs  # 查看詳細日誌
   ```

### Debug 模式
在腳本中添加 `-v` 參數到 curl 命令：

```bash
curl -v -X GET "$URL"
```

## 📊 效能監控

### 響應時間測試
```bash
make test-performance
```

### 壓力測試
```bash
make stress-test
```

### 連續監控
```bash
make monitor  # 每 30 秒檢查一次
```

## 🧹 維護

### 清理測試文件
```bash
make clean
```

### 生成測試報告
```bash
make report
```

## 💡 使用建議

1. **開發期間**: 使用 `make health-check` 快速檢查
2. **功能測試**: 使用 `make test-interactive` 測試新功能
3. **部署前**: 使用 `make test-all` 完整測試
4. **生產監控**: 使用 `make monitor` 持續監控

## 🎉 總結

這個測試套件提供了：
- **60+ 項完整測試**
- **40+ 項互動功能測試**
- **自動化執行工具**
- **詳細報告和日誌**
- **效能監控**
- **錯誤診斷**

所有的按鈕、連結、表單、API 端點和互動功能都已涵蓋在測試範圍內！

---

**🚀 立即開始測試你的網站：**
```bash
make test-all
```
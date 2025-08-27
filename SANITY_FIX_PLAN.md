# 修復 medusa_decoupled Sanity 問題 - 執行計劃

## 🎯 目標：統一到最穩定的版本組合

### 第一階段：清理檔案結構
```bash
cd /Users/raychou/tim-web/medusa_decoupled/frontend

# 移除重複的 sanity 檔案
rm src/lib/sanity.new.ts
rm src/lib/sanity-optimized.ts  
rm src/lib/sanity_vm.ts

# 備份當前版本
cp src/lib/sanity.ts src/lib/sanity.backup.ts
```

### 第二階段：版本降級到穩定組合
```bash
# 安裝穩定版本組合
npm install --save-exact \
  sanity@4.5.0 \
  @sanity/client@7.6.0 \
  @sanity/vision@3.99.0 \
  next-sanity@9.12.3 \
  react@18.3.1 \
  react-dom@18.3.1

# 更新 TypeScript 類型
npm install --save-dev @types/react@18.3.1 @types/react-dom@18.3.1
```

### 第三階段：修復模組匯入
1. 統一使用 `src/lib/sanity/index.ts` 作為主要匯入點
2. 修復所有錯誤的匯入路徑
3. 更新 TypeScript 類型定義

### 第四階段：測試與驗證
```bash
# TypeScript 檢查
npm run type-check

# 建構測試
npm run build

# 開發環境測試
npm run dev
```

## 🔧 具體修復項目

### 1. 模組路徑問題
- [ ] 修復 `Cannot find module '@/lib/sanity'` 錯誤
- [ ] 統一 sanity 模組匯入路徑
- [ ] 移除重複的 sanity 檔案

### 2. TypeScript 錯誤
- [ ] 修復 SanityImageAsset._ref 錯誤  
- [ ] 修復 SanityContentProps.content 問題
- [ ] 更新 service_zone 到 service_zone_id

### 3. React 版本相容性  
- [ ] 降級 React 到 18.3.1 穩定版
- [ ] 更新相關類型定義
- [ ] 測試所有元件功能

## ⚠️  風險評估

**低風險**：
- Sanity 4.5.0 已在 VM 穩定運行
- React 18.3.1 是長期穩定版本
- next-sanity 9.12.3 與 medusa_0816 同步

**需要注意**：
- 可能需要微調 Sanity Studio 配置
- 部分最新 API 功能可能不可用
- 需要測試所有資料獲取功能

## 📊 成功指標

- [ ] TypeScript 無錯誤
- [ ] 專案建構成功  
- [ ] Sanity Studio 正常載入
- [ ] 所有頁面資料正確顯示
- [ ] 無 Runtime 錯誤

## 🚀 執行時間估計

- 版本安裝：5-10 分鐘
- 錯誤修復：15-30 分鐘  
- 測試驗證：10-15 分鐘
- **總計：30-55 分鐘**

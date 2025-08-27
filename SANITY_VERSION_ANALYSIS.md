# Sanity 版本分析與解決方案

## 當前版本狀況

### 版本對比表
| 專案位置 | Sanity | next-sanity | @sanity/vision | @sanity/client | React |
|---------|--------|-------------|-----------------|----------------|-------|
| medusa_decoupled (本地) | 4.6.0 | 10.0.14 | 4.5.0 | 7.9.0 | 19 RC |
| medusa_0816 (本地) | 3.99.0 | 9.12.3 | 3.99.0 | 7.6.0 | 18.3.1 |
| VM (/opt/frontend) | 4.5.0 | 10.0.14 | 4.5.0 | 7.9.0 | 19 RC |

## 主要問題

### 1. 版本不同步
- VM 版本 (4.5.0) 落後於本地最新版本 (4.6.0)
- medusa_0816 使用過舊的 Sanity v3 版本

### 2. React 版本衝突
- React 19 RC 版本可能導致穩定性問題
- Sanity v4 與 React 19 RC 的相容性未完全確定

### 3. API 破壞性變更
- Sanity v3 到 v4 有重大 API 變更
- 某些 schema 定義可能需要更新

## 建議解決方案

### 方案 A：統一到穩定版本 (推薦)
1. **降級到 Sanity v4.5.0 (與 VM 同步)**
2. **使用 React 18.3.1 穩定版**
3. **統一 next-sanity 到 10.0.14**

### 方案 B：升級 VM 到最新版本
1. **升級 VM 到 Sanity 4.6.0**
2. **保持 React 19 RC** (風險較高)

### 方案 C：回退到 Sanity v3 (不推薦)
- 穩定但功能較舊
- 缺乏最新功能支援

## 推薦執行步驟 (方案 A)

### 1. 更新本地 medusa_decoupled
```bash
cd /Users/raychou/tim-web/medusa_decoupled/frontend
npm install sanity@4.5.0 @sanity/vision@4.5.0
npm install react@18.3.1 react-dom@18.3.1
```

### 2. 更新 medusa_0816 到 v4
```bash
cd /Users/raychou/tim-web/medusa_0816/frontend
npm install sanity@4.5.0 @sanity/client@7.9.0 @sanity/vision@4.5.0 next-sanity@10.0.14
npm install react@18.3.1 react-dom@18.3.1
```

### 3. 檢查 schema 相容性
- 檢查所有 schema 文件是否與 Sanity v4 相容
- 更新任何使用已棄用 API 的代碼

### 4. 測試部署
- 本地測試所有功能
- 確認 Sanity Studio 正常運作
- 驗證資料獲取功能

## 潛在風險

1. **React 降級可能影響其他依賴**
2. **Sanity schema 可能需要微調**
3. **部分最新功能可能不可用**

## 監控指標

- [ ] Sanity Studio 載入正常
- [ ] 資料獲取功能正常
- [ ] 無 TypeScript 錯誤
- [ ] 生產環境部署成功

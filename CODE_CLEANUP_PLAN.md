# 🧹 代碼清理計劃 - Medusa Frontend

## ✅ 已完成清理

### 🎯 支付組件全面清理完成 - `src/modules/checkout/components/payment/index.tsx`
**進度: 28個ESLint問題 → 0個問題 (100%完成)**

1. **✅ 未使用的 imports 清理**
   - ✅ `initiatePaymentSession` - 已註解清理
   - ✅ `PaymentContainer, StripeCardContainer` - 已註解清理
   
2. **✅ 未使用的變數/函數清理**
   - ✅ `isEcpay` 函數 - 已註解清理
   - ✅ `availablePaymentMethods` 參數 - 已註解清理
   - ✅ `setCardBrand`, `setCardComplete` setters - 保留state，註解setter
   - ✅ `isEcpayMethod` 變數 - 已註解清理
   - ✅ `action` 變數 - 已註解清理（多個位置）

3. **✅ Nullish Coalescing 修復完成**
   - ✅ `activeSession?.provider_id || payment_method_ecpay_credit` → `??`
   - ✅ `paymentInfoMap[...]?.title || activeSession?.provider_id` → `??`
   - ✅ `err?.message || "error"` → 改用 `instanceof Error` 檢查
   - ✅ 邏輯OR操作符保留: `(isStripe && !cardComplete) || (!selectedPayment...)` (這是邏輯判斷，不是nullish)

4. **✅ 類型安全改進**
   - ✅ `cart: any` → 詳細類型定義
   - ✅ `paymentSession: any` → 移除any
   - ✅ `err: any` → `err: unknown` + 類型守衛
   - ✅ `Array<any>` → 具體類型定義

5. **✅ Console 語句清理**
   - ✅ 所有開發用console.log已註解 - 保留錯誤處理用途

## 📋 下一階段清理目標

4. **Console 語句清理**
   - 生產環境應移除或改為適當的日誌

## 📝 修復說明

### 🗑️ 註解標記說明
- `🗑️ 未使用 - 已註解清理`: 完全未使用的代碼
- `📝 setter未使用，保留state供XX`: state 有使用但 setter 未使用
- `🚧 TODO: 需要XX`: 需要補充的功能
- `✨ 使用 nullish coalescing`: 代碼改善

## 🎯 清理進度
- [x] 掃描問題
- [ ] 清理 payment/index.tsx
- [ ] 清理其他主要問題文件
- [ ] 執行最終測試

## 📊 預期效果
- ESLint 錯誤: 28個 → 目標 <10個
- TypeScript 錯誤: 321個 → 目標 <100個
- 代碼覆蓋率: 0% → 設置基礎架構
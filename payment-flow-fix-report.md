# 支付流程錯誤修復報告

## 問題描述
用戶遇到 "Error setting up the request: An unknown error occurred." 錯誤

## 根本原因
1. `initiatePaymentSession` 函數不存在
2. 環境變數未定義導致支付方式 ID 為 `undefined`
3. RadioGroup 受控/非受控狀態轉換錯誤

## 修復措施

### 1. 創建 `initiatePaymentSession` 函數
- 位置：`/src/lib/data/cart.ts`
- 功能：使用購物車更新 API 來保存支付方式選擇

### 2. 修復環境變數問題
- 將 `process.env.NEXT_PUBLIC_PAYMENT_METHOD_*` 替換為硬編碼值
- `ecpay_credit_card` 和 `manual_manual`

### 3. 修復 RadioGroup 狀態
- 確保 `selectedPaymentMethod` 始終有有效值
- 添加回退值防止 `undefined` 狀態

### 4. 修改支付流程
- 支付方式保存到購物車 metadata 中
- 審核頁面從 metadata 讀取支付方式
- PaymentButton 組件支持 metadata 方式

## 修復文件清單
1. `/src/lib/data/cart.ts` - 添加 `initiatePaymentSession` 函數
2. `/src/modules/checkout/components/payment/index.tsx` - 修復 RadioGroup 和支付邏輯
3. `/src/modules/checkout/components/review/index.tsx` - 支持 metadata 支付方式
4. `/src/modules/checkout/components/payment-button/index.tsx` - 支持 metadata 支付方式

## 測試步驟
1. 啟動前端和後端服務
2. 進入結帳流程
3. 選擇支付方式
4. 確認不再出現 "Error setting up the request" 錯誤
5. 驗證支付方式選擇正確傳遞到審核頁面

## 預期結果
- ✅ 支付方式選擇正常工作
- ✅ 不再出現 RadioGroup 錯誤
- ✅ 支付流程順利進行到審核步驟
- ✅ 支付按鈕根據選擇的方式正確顯示

---
修復完成時間: $(date)
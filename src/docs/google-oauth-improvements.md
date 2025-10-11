# Google OAuth 認證功能改進

## 實施概要

本次更新主要解決了 Google OAuth 登入時無法獲取真實用戶郵箱的問題。之前系統顯示的是預設郵箱 `example@medusajs.com`，現在已修正為顯示實際的 Google 帳戶郵箱。

## 技術實施細節

### 1. 資料庫查詢調整

- 修正了在 Medusa v2 中對 `provider_identity` 表的查詢，使用正確的欄位名稱（`entity_id` 替代舊版的 `provider_user_id`）
- 優化了資料庫查詢，能夠從 `user_metadata` 欄位中提取完整的 Google 用戶資訊

### 2. 後端 API 功能

- 實現了 `/store/auth/google/me` API 端點，用於從後端獲取 Google 身份資訊
- 改進了 JWT 驗證邏輯，確保正確解析 token 中的用戶資訊

### 3. 前端功能改進

- 實現了多層次的資料獲取策略，確保即使某一層失敗也能通過其他方式獲取用戶資訊：
  1. 首先嘗試從 JWT token 中提取
  2. 然後嘗試從資料庫直接查詢 Google 身份
  3. 最後嘗試透過 API 端點獲取
- 優化了用戶界面，顯示完整的用戶名稱、郵箱和頭像

### 4. 數據模型調整

- 擴展了 `GoogleIdentity` 介面，支持更多的 Google 身份資訊欄位
- 新增了對 `verified_email`、`locale` 等欄位的支持

## 使用流程

用戶通過 Google 按鈕登入後，系統現在會：

1. 接收 Google 的授權碼
2. 向後端發送此授權碼獲取 JWT token
3. 使用多層次的資料獲取策略取得真實的 Google 用戶資訊
4. 顯示正確的用戶名稱、郵箱和頭像（而非預設的 `example@medusajs.com`）

## 未來可能的改進

- 為了更徹底的解決方案，可考慮向 Medusa 後端添加一個攔截器，在創建客戶時直接使用 Google 的電子郵箱而非預設值
- 可進一步利用獲取的 Google 資訊自動填充用戶的姓名和頭像到 Medusa 客戶資料中
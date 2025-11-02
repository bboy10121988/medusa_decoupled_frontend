#!/bin/bash

echo "🔍 Google OAuth 前端整合檢查"
echo "================================"
echo ""

# 檢查前端是否運行
echo "1️⃣ 檢查前端服務..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/tw | grep -q "200"; then
    echo "   ✅ 前端服務正常運行"
else
    echo "   ❌ 前端服務未運行，請執行: npm run dev"
    exit 1
fi

echo ""
echo "2️⃣ 檢查關鍵文件..."

# 檢查 Google 登入按鈕組件
if [ -f "src/modules/account/components/google-login-button.tsx" ]; then
    echo "   ✅ Google 登入按鈕組件存在"
else
    echo "   ❌ 缺少 Google 登入按鈕組件"
fi

# 檢查 OAuth callback 頁面
if [ -f "src/app/(main)/[countryCode]/auth/google/callback/page.tsx" ]; then
    echo "   ✅ OAuth Callback 頁面存在"
else
    echo "   ❌ 缺少 OAuth Callback 頁面"
fi

# 檢查 Account Context
if [ -f "src/lib/context/account-context.tsx" ]; then
    echo "   ✅ Account Context 存在"
else
    echo "   ❌ 缺少 Account Context"
fi

# 檢查 API routes
echo ""
echo "3️⃣ 檢查 API Routes..."
if [ -f "src/app/api/auth/customer/route.ts" ]; then
    echo "   ✅ /api/auth/customer 存在"
else
    echo "   ❌ 缺少 /api/auth/customer"
fi

if [ -f "src/app/api/auth/check-email/route.ts" ]; then
    echo "   ✅ /api/auth/check-email 存在"
else
    echo "   ❌ 缺少 /api/auth/check-email"
fi

echo ""
echo "4️⃣ 測試登入頁面..."
LOGIN_PAGE=$(curl -s http://localhost:8000/tw/account)

if echo "$LOGIN_PAGE" | grep -q "google"; then
    echo "   ✅ 登入頁面包含 Google 相關內容"
else
    echo "   ⚠️  登入頁面可能缺少 Google 登入按鈕（或已被 JS 渲染）"
fi

echo ""
echo "5️⃣ 測試 API endpoints..."

# 測試 customer API
CUSTOMER_API=$(curl -s -w "\n%{http_code}" http://localhost:8000/api/auth/customer)
HTTP_CODE=$(echo "$CUSTOMER_API" | tail -1)

if [ "$HTTP_CODE" = "200" ]; then
    echo "   ✅ /api/auth/customer 回應正常"
else
    echo "   ⚠️  /api/auth/customer 回應碼: $HTTP_CODE（未登入時為正常）"
fi

echo ""
echo "================================"
echo "✅ 前端 Google OAuth 整合檢查完成"
echo ""
echo "📝 下一步:"
echo "   1. 確認後端 Google OAuth 已配置"
echo "   2. 訪問 http://localhost:8000/tw/account"
echo "   3. 點擊 '使用 Google 登入' 按鈕"
echo "   4. 完成 Google 認證流程"
echo ""
echo "📖 詳細文檔: GOOGLE_OAUTH_INTEGRATION_STATUS.md"

#!/bin/bash

# Google OAuth 配置檢查腳本
# 用於驗證前後端的 Google OAuth 設定是否正確

echo "🔍 Google OAuth 配置檢查"
echo "=========================="
echo ""

# 顏色設定
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 檢查函數
check_pass() {
    echo -e "${GREEN}✅ $1${NC}"
}

check_fail() {
    echo -e "${RED}❌ $1${NC}"
}

check_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# 1. 檢查後端環境變數
echo "1️⃣  檢查後端環境變數"
echo "-------------------"

BACKEND_DIR="../backend_vm/medusa-backend"

if [ ! -f "$BACKEND_DIR/.env" ]; then
    check_fail "後端 .env 文件不存在"
else
    check_pass "後端 .env 文件存在"
    
    # 檢查必要的環境變數
    if grep -q "GOOGLE_CLIENT_ID=" "$BACKEND_DIR/.env"; then
        CLIENT_ID=$(grep "GOOGLE_CLIENT_ID=" "$BACKEND_DIR/.env" | cut -d '=' -f2)
        if [ -n "$CLIENT_ID" ]; then
            check_pass "GOOGLE_CLIENT_ID 已設定"
        else
            check_fail "GOOGLE_CLIENT_ID 為空"
        fi
    else
        check_fail "GOOGLE_CLIENT_ID 未設定"
    fi
    
    if grep -q "GOOGLE_CLIENT_SECRET=" "$BACKEND_DIR/.env"; then
        CLIENT_SECRET=$(grep "GOOGLE_CLIENT_SECRET=" "$BACKEND_DIR/.env" | cut -d '=' -f2)
        if [ -n "$CLIENT_SECRET" ]; then
            check_pass "GOOGLE_CLIENT_SECRET 已設定"
        else
            check_fail "GOOGLE_CLIENT_SECRET 為空"
        fi
    else
        check_fail "GOOGLE_CLIENT_SECRET 未設定"
    fi
    
    if grep -q "GOOGLE_CALLBACK_URL=" "$BACKEND_DIR/.env"; then
        CALLBACK_URL=$(grep "GOOGLE_CALLBACK_URL=" "$BACKEND_DIR/.env" | cut -d '=' -f2)
        if [ -n "$CALLBACK_URL" ]; then
            check_pass "GOOGLE_CALLBACK_URL 已設定: $CALLBACK_URL"
        else
            check_warn "GOOGLE_CALLBACK_URL 為空 (將使用默認值)"
        fi
    else
        check_warn "GOOGLE_CALLBACK_URL 未設定 (將使用默認值)"
    fi
fi

echo ""

# 2. 檢查前端環境變數
echo "2️⃣  檢查前端環境變數"
echo "-------------------"

if [ ! -f ".env.local" ] && [ ! -f ".env" ]; then
    check_warn "前端環境變數文件不存在 (可能使用默認值)"
else
    check_pass "前端環境變數文件存在"
    
    ENV_FILE=".env.local"
    [ ! -f "$ENV_FILE" ] && ENV_FILE=".env"
    
    if grep -q "NEXT_PUBLIC_MEDUSA_BACKEND_URL=" "$ENV_FILE"; then
        BACKEND_URL=$(grep "NEXT_PUBLIC_MEDUSA_BACKEND_URL=" "$ENV_FILE" | cut -d '=' -f2)
        check_pass "NEXT_PUBLIC_MEDUSA_BACKEND_URL: $BACKEND_URL"
    else
        check_warn "NEXT_PUBLIC_MEDUSA_BACKEND_URL 未設定 (將使用默認值: http://localhost:9000)"
    fi
fi

echo ""

# 3. 檢查 medusa-config.ts
echo "3️⃣  檢查 medusa-config.ts"
echo "------------------------"

CONFIG_FILE="$BACKEND_DIR/medusa-config.ts"

if [ ! -f "$CONFIG_FILE" ]; then
    check_fail "medusa-config.ts 不存在"
else
    check_pass "medusa-config.ts 存在"
    
    if grep -q "@medusajs/auth-google" "$CONFIG_FILE"; then
        check_pass "Google Auth Provider 已配置"
    else
        check_fail "找不到 Google Auth Provider 配置"
    fi
    
    if grep -q "authMethodsPerActor" "$CONFIG_FILE"; then
        check_pass "authMethodsPerActor 已設定"
        
        if grep -A5 "customer:" "$CONFIG_FILE" | grep -q "google"; then
            check_pass "customer 角色可使用 Google 登入"
        else
            check_fail "customer 角色未啟用 Google 登入"
        fi
    else
        check_warn "authMethodsPerActor 未設定"
    fi
fi

echo ""

# 4. 檢查前端 Google Login 組件
echo "4️⃣  檢查前端 Google Login 組件"
echo "-----------------------------"

LOGIN_BUTTON="src/modules/account/components/google-login-button.tsx"

if [ ! -f "$LOGIN_BUTTON" ]; then
    check_fail "google-login-button.tsx 不存在"
else
    check_pass "google-login-button.tsx 存在"
    
    if grep -q "callback_url" "$LOGIN_BUTTON"; then
        check_pass "Login 方法包含 callback_url 參數 ✨"
    else
        check_fail "Login 方法缺少 callback_url 參數"
    fi
    
    if grep -q 'sdk.auth.login.*"customer".*"google"' "$LOGIN_BUTTON"; then
        check_pass "正確使用 sdk.auth.login()"
    else
        check_fail "sdk.auth.login() 調用不正確"
    fi
fi

echo ""

# 5. 檢查前端 Callback 頁面
echo "5️⃣  檢查前端 Callback 頁面"
echo "------------------------"

CALLBACK_PAGE="src/app/(main)/[countryCode]/account/google/callback/page.tsx"

if [ ! -f "$CALLBACK_PAGE" ]; then
    check_fail "Google callback 頁面不存在"
else
    check_pass "Google callback 頁面存在"
    
    if grep -q "sdk.auth.callback" "$CALLBACK_PAGE"; then
        check_pass "正確使用 sdk.auth.callback()"
    else
        check_fail "缺少 sdk.auth.callback() 調用"
    fi
fi

echo ""

# 6. 檢查後端 Callback Route
echo "6️⃣  檢查後端 Callback Route"
echo "--------------------------"

BACKEND_CALLBACK="$BACKEND_DIR/src/api/auth/google/callback/route.ts"

if [ ! -f "$BACKEND_CALLBACK" ]; then
    check_fail "後端 Google callback route 不存在"
else
    check_pass "後端 Google callback route 存在"
    
    if grep -q "validateCallback" "$BACKEND_CALLBACK"; then
        check_pass "包含 validateCallback 調用"
    else
        check_fail "缺少 validateCallback 調用"
    fi
    
    if grep -q "customerService" "$BACKEND_CALLBACK"; then
        check_pass "包含客戶服務處理"
    else
        check_warn "可能缺少客戶創建/查找邏輯"
    fi
fi

echo ""

# 7. 後端連接測試
echo "7️⃣  測試後端連接"
echo "----------------"

if curl -s http://localhost:9000/health > /dev/null 2>&1; then
    check_pass "後端正在運行 (http://localhost:9000)"
else
    check_warn "後端未運行或無法連接"
fi

echo ""

# 8. 前端連接測試
echo "8️⃣  測試前端連接"
echo "----------------"

if curl -s http://localhost:3000 > /dev/null 2>&1; then
    check_pass "前端正在運行 (http://localhost:3000)"
else
    check_warn "前端未運行或無法連接"
fi

echo ""
echo "=========================="
echo "✨ 檢查完成!"
echo ""
echo "📋 下一步:"
echo "  1. 確認所有 ✅ 項目都通過"
echo "  2. 修正所有 ❌ 項目"
echo "  3. 檢查 ⚠️  警告項目"
echo "  4. 啟動服務進行實際測試"
echo ""
echo "🚀 啟動命令:"
echo "  後端: cd $BACKEND_DIR && yarn dev"
echo "  前端: npm run dev"
echo ""

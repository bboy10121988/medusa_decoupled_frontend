#!/bin/bash

# Google OAuth 測試腳本
# 用途: 自動化測試 Google OAuth 登入流程

set -e

echo "======================================"
echo "Google OAuth 測試腳本"
echo "======================================"
echo ""

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 測試帳號 email（需要手動設定）
TEST_EMAIL=${1:-""}

if [ -z "$TEST_EMAIL" ]; then
    echo -e "${RED}❌ 請提供測試 email 作為參數${NC}"
    echo "用法: ./test-google-oauth.sh your-test-email@gmail.com"
    exit 1
fi

echo -e "${BLUE}📧 測試帳號: ${TEST_EMAIL}${NC}"
echo ""

# 步驟 1: 檢查數據庫中是否已存在該帳號
echo -e "${YELLOW}步驟 1: 檢查數據庫...${NC}"
CUSTOMER_EXISTS=$(gcloud compute ssh tims-web --zone=asia-east1-c --command="
    psql \$DATABASE_URL -t -c \"SELECT COUNT(*) FROM customer WHERE email = '${TEST_EMAIL}';\"
" 2>/dev/null | tr -d ' ')

if [ "$CUSTOMER_EXISTS" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  發現現有記錄，是否要刪除? (y/n)${NC}"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}🗑️  刪除現有記錄...${NC}"
        gcloud compute ssh tims-web --zone=asia-east1-c --command="
            psql \$DATABASE_URL -c \"DELETE FROM customer WHERE email = '${TEST_EMAIL}';\"
        "
        echo -e "${GREEN}✅ 已刪除現有記錄${NC}"
    else
        echo -e "${YELLOW}⏩ 保留現有記錄，將測試現有用戶登入${NC}"
    fi
else
    echo -e "${GREEN}✅ 數據庫中無此帳號，將測試新用戶註冊${NC}"
fi
echo ""

# 步驟 2: 提示進行手動測試
echo -e "${YELLOW}步驟 2: 請進行手動測試${NC}"
echo -e "${BLUE}1. 打開瀏覽器訪問: ${GREEN}https://timsfantasyworld.com/tw/account${NC}"
echo -e "${BLUE}2. 點擊 '使用 Google 登入' 按鈕${NC}"
echo -e "${BLUE}3. 選擇測試帳號: ${GREEN}${TEST_EMAIL}${NC}"
echo -e "${BLUE}4. 完成授權${NC}"
echo ""
echo -e "${YELLOW}測試完成後按 Enter 繼續...${NC}"
read -r

# 步驟 3: 檢查後端日誌
echo ""
echo -e "${YELLOW}步驟 3: 檢查後端日誌...${NC}"
echo -e "${BLUE}最近的 OAuth 相關日誌:${NC}"
gcloud compute ssh tims-web --zone=asia-east1-c --command="
    pm2 logs medusa-backend --lines 30 --nostream | grep -i 'google\|oauth\|customer' || echo '未找到相關日誌'
"
echo ""

# 步驟 4: 驗證數據庫
echo -e "${YELLOW}步驟 4: 驗證數據庫記錄...${NC}"
DB_RESULT=$(gcloud compute ssh tims-web --zone=asia-east1-c --command="
    psql \$DATABASE_URL -c \"
SELECT 
  id,
  email,
  first_name,
  last_name,
  has_account,
  metadata->>'auth_provider' as auth_provider,
  metadata->>'google_user_id' as google_user_id,
  created_at
FROM customer 
WHERE email = '${TEST_EMAIL}';
\"
")

echo "$DB_RESULT"
echo ""

# 步驟 5: 分析結果
echo -e "${YELLOW}步驟 5: 分析測試結果...${NC}"

if echo "$DB_RESULT" | grep -q "$TEST_EMAIL"; then
    echo -e "${GREEN}✅ 找到用戶記錄${NC}"
    
    if echo "$DB_RESULT" | grep -q "google"; then
        echo -e "${GREEN}✅ auth_provider 正確設為 'google'${NC}"
    else
        echo -e "${RED}❌ auth_provider 未設定為 'google'${NC}"
    fi
    
    if echo "$DB_RESULT" | grep -q "t"; then
        echo -e "${GREEN}✅ has_account 為 true${NC}"
    else
        echo -e "${RED}❌ has_account 未設為 true${NC}"
    fi
    
    if echo "$DB_RESULT" | grep -qE "[0-9]{10,}"; then
        echo -e "${GREEN}✅ google_user_id 已設定${NC}"
    else
        echo -e "${YELLOW}⚠️  google_user_id 未找到${NC}"
    fi
    
    echo ""
    echo -e "${GREEN}🎉 Google OAuth 測試成功！${NC}"
else
    echo -e "${RED}❌ 未找到用戶記錄 - Google OAuth 可能有問題${NC}"
    echo ""
    echo -e "${YELLOW}建議檢查:${NC}"
    echo "1. 後端日誌中的錯誤訊息"
    echo "2. 前端瀏覽器控制台的錯誤"
    echo "3. Google OAuth 配置是否正確"
fi

echo ""
echo "======================================"
echo "測試完成"
echo "======================================"

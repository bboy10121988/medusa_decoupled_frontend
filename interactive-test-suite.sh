#!/bin/bash

# ==================================================
# 互動功能專門測試腳本
# 專門測試所有按鈕、表單、搜尋等互動功能
# ==================================================

set -e

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

# 配置
FRONTEND_URL="http://localhost:8000"
BACKEND_URL="http://localhost:9000"
COUNTRY_CODE="tw"

# 會話管理
COOKIE_JAR="test-cookies.txt"
SESSION_TOKEN=""
CART_ID=""

# 測試結果
TOTAL_INTERACTIONS=0
PASSED_INTERACTIONS=0
FAILED_INTERACTIONS=0

echo -e "${PURPLE}"
echo "============================================================"
echo "🎯 Tim's Fantasy World - 互動功能專門測試"
echo "============================================================"
echo -e "${NC}"

# 清理舊的 cookie
rm -f "$COOKIE_JAR"

# 函數：執行互動測試
test_interaction() {
    local test_name="$1"
    local description="$2"
    local url="$3"
    local method="${4:-GET}"
    local data="$5"
    local expected_pattern="$6"
    
    TOTAL_INTERACTIONS=$((TOTAL_INTERACTIONS + 1))
    
    echo -e "\n${YELLOW}🔧 測試互動: $test_name${NC}"
    echo "   📝 說明: $description"
    echo "   🌐 URL: $url"
    echo "   📤 方法: $method"
    
    # 建構 curl 命令
    local curl_cmd="curl -s -w '\nHTTP_STATUS:%{http_code}\n' -c '$COOKIE_JAR' -b '$COOKIE_JAR'"
    
    # 添加常用標頭
    curl_cmd="$curl_cmd -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'"
    curl_cmd="$curl_cmd -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'"
    curl_cmd="$curl_cmd -H 'Accept-Language: zh-TW,zh;q=0.9,en;q=0.8'"
    
    if [[ "$method" == "POST" ]]; then
        curl_cmd="$curl_cmd -H 'Content-Type: application/x-www-form-urlencoded'"
        curl_cmd="$curl_cmd -X POST"
        if [[ -n "$data" ]]; then
            curl_cmd="$curl_cmd -d '$data'"
        fi
    elif [[ "$method" == "JSON" ]]; then
        curl_cmd="$curl_cmd -H 'Content-Type: application/json'"
        curl_cmd="$curl_cmd -X POST"
        if [[ -n "$data" ]]; then
            curl_cmd="$curl_cmd -d '$data'"
        fi
    fi
    
    curl_cmd="$curl_cmd '$url'"
    
    # 執行測試
    local result
    result=$(eval $curl_cmd 2>&1)
    
    # 提取狀態碼
    local status_code
    status_code=$(echo "$result" | grep "HTTP_STATUS:" | cut -d: -f2)
    
    # 檢查結果
    local success=false
    if [[ -n "$expected_pattern" ]]; then
        if echo "$result" | grep -q "$expected_pattern"; then
            success=true
        fi
    elif [[ "$status_code" =~ ^[23] ]]; then
        success=true
    fi
    
    if $success; then
        echo -e "   ${GREEN}✅ 成功 - 狀態碼: $status_code${NC}"
        PASSED_INTERACTIONS=$((PASSED_INTERACTIONS + 1))
    else
        echo -e "   ${RED}❌ 失敗 - 狀態碼: $status_code${NC}"
        FAILED_INTERACTIONS=$((FAILED_INTERACTIONS + 1))
    fi
}

# ==================================================
# 1. 導航和連結測試
# ==================================================
echo -e "\n${BLUE}==== 🧭 導航和連結測試 ====${NC}"

test_interaction \
    "主導航-首頁" \
    "點擊主選單中的首頁連結" \
    "$FRONTEND_URL/$COUNTRY_CODE"

test_interaction \
    "主導航-商品" \
    "點擊主選單中的商品連結" \
    "$FRONTEND_URL/$COUNTRY_CODE/store"

test_interaction \
    "主導航-部落格" \
    "點擊主選單中的部落格連結" \
    "$FRONTEND_URL/$COUNTRY_CODE/blog"

test_interaction \
    "主導航-購物車" \
    "點擊購物車圖示" \
    "$FRONTEND_URL/$COUNTRY_CODE/cart"

test_interaction \
    "會員導航-登入" \
    "點擊會員登入連結" \
    "$FRONTEND_URL/$COUNTRY_CODE/account/login"

test_interaction \
    "會員導航-註冊" \
    "點擊會員註冊連結" \
    "$FRONTEND_URL/$COUNTRY_CODE/account/register"

# ==================================================
# 2. 搜尋功能測試
# ==================================================
echo -e "\n${BLUE}==== 🔍 搜尋功能測試 ====${NC}"

test_interaction \
    "產品搜尋-關鍵字" \
    "在商品頁面搜尋關鍵字" \
    "$FRONTEND_URL/$COUNTRY_CODE/store?q=hair" \
    "GET" \
    "" \
    "search"

test_interaction \
    "部落格搜尋-關鍵字" \
    "在部落格頁面搜尋關鍵字" \
    "$FRONTEND_URL/$COUNTRY_CODE/blog?q=beauty" \
    "GET" \
    "" \
    "blog"

test_interaction \
    "全站搜尋" \
    "使用全站搜尋功能" \
    "$FRONTEND_URL/$COUNTRY_CODE/search?q=shampoo"

# ==================================================
# 3. 產品互動測試
# ==================================================
echo -e "\n${BLUE}==== 🛍️ 產品互動測試 ====${NC}"

test_interaction \
    "產品列表-分頁" \
    "產品列表分頁導航" \
    "$FRONTEND_URL/$COUNTRY_CODE/store?page=1"

test_interaction \
    "產品分類-篩選" \
    "按分類篩選產品" \
    "$FRONTEND_URL/$COUNTRY_CODE/categories"

test_interaction \
    "產品系列-篩選" \
    "按系列篩選產品" \
    "$FRONTEND_URL/$COUNTRY_CODE/collections"

# ==================================================
# 4. 會員功能測試
# ==================================================
echo -e "\n${BLUE}==== 👤 會員功能測試 ====${NC}"

test_interaction \
    "會員登入表單" \
    "提交會員登入表單" \
    "$FRONTEND_URL/$COUNTRY_CODE/account/login" \
    "POST" \
    "email=test@example.com&password=testpass"

test_interaction \
    "會員註冊表單" \
    "提交會員註冊表單" \
    "$FRONTEND_URL/$COUNTRY_CODE/account/register" \
    "POST" \
    "first_name=Test&last_name=User&email=newuser@example.com&password=testpass123"

test_interaction \
    "密碼重設請求" \
    "請求密碼重設" \
    "$FRONTEND_URL/$COUNTRY_CODE/forgot-password" \
    "POST" \
    "email=test@example.com"

test_interaction \
    "會員中心訪問" \
    "訪問會員中心頁面" \
    "$FRONTEND_URL/$COUNTRY_CODE/account"

test_interaction \
    "訂單歷史查詢" \
    "查看會員訂單歷史" \
    "$FRONTEND_URL/$COUNTRY_CODE/account/orders"

test_interaction \
    "地址管理" \
    "管理會員配送地址" \
    "$FRONTEND_URL/$COUNTRY_CODE/account/addresses"

# ==================================================
# 5. 購物車和結帳測試
# ==================================================
echo -e "\n${BLUE}==== 🛒 購物車和結帳測試 ====${NC}"

# 先建立購物車
test_interaction \
    "建立購物車" \
    "透過 API 建立新的購物車" \
    "$BACKEND_URL/store/carts" \
    "JSON" \
    '{"region_id":"reg_test"}'

test_interaction \
    "查看購物車" \
    "查看購物車內容" \
    "$FRONTEND_URL/$COUNTRY_CODE/cart"

test_interaction \
    "結帳頁面" \
    "進入結帳流程" \
    "$FRONTEND_URL/$COUNTRY_CODE/checkout"

# ==================================================
# 6. 聯盟行銷功能測試
# ==================================================
echo -e "\n${BLUE}==== 🤝 聯盟行銷功能測試 ====${NC}"

test_interaction \
    "聯盟註冊表單" \
    "提交聯盟註冊表單" \
    "$FRONTEND_URL/$COUNTRY_CODE/regitster-affiliate" \
    "POST" \
    "name=Test Affiliate&email=affiliate@example.com&phone=0912345678"

test_interaction \
    "聯盟登入" \
    "聯盟夥伴登入" \
    "$FRONTEND_URL/$COUNTRY_CODE/login-affiliate" \
    "POST" \
    "email=affiliate@example.com&password=testpass"

test_interaction \
    "聯盟後台" \
    "訪問聯盟後台頁面" \
    "$FRONTEND_URL/$COUNTRY_CODE/affiliate"

test_interaction \
    "聯盟管理後台" \
    "訪問聯盟管理後台" \
    "$FRONTEND_URL/$COUNTRY_CODE/affiliate-admin"

# ==================================================
# 7. CMS 和內容管理測試
# ==================================================
echo -e "\n${BLUE}==== 📝 CMS 和內容管理測試 ====${NC}"

test_interaction \
    "CMS 首頁" \
    "訪問 Sanity CMS 首頁" \
    "$FRONTEND_URL/CMS"

test_interaction \
    "CMS Vision" \
    "訪問 Sanity Vision 查詢介面" \
    "$FRONTEND_URL/CMS/vision"

test_interaction \
    "頁面列表 API" \
    "獲取所有頁面列表" \
    "$FRONTEND_URL/api/pages/list"

test_interaction \
    "Sanity Webhook" \
    "測試 Sanity webhook 接收" \
    "$FRONTEND_URL/api/sanity-webhook" \
    "JSON" \
    '{"_type":"test","_id":"test123"}'

# ==================================================
# 8. API 互動測試
# ==================================================
echo -e "\n${BLUE}==== 🔌 API 互動測試 ====${NC}"

test_interaction \
    "客戶 API - 個人資訊" \
    "獲取當前客戶資訊" \
    "$FRONTEND_URL/api/customer/me"

test_interaction \
    "客戶 API - 訂單查詢" \
    "查詢客戶訂單" \
    "$FRONTEND_URL/api/customer/orders"

test_interaction \
    "聯盟 API - 統計" \
    "獲取聯盟統計資料" \
    "$FRONTEND_URL/api/affiliate/stats"

test_interaction \
    "聯盟 API - 獎金" \
    "查詢聯盟獎金" \
    "$FRONTEND_URL/api/affiliate/payouts"

test_interaction \
    "上傳 API" \
    "測試檔案上傳功能" \
    "$FRONTEND_URL/api/upload"

# ==================================================
# 9. 表單提交測試
# ==================================================
echo -e "\n${BLUE}==== 📋 表單提交測試 ====${NC}"

test_interaction \
    "聯絡表單" \
    "提交聯絡我們表單" \
    "$FRONTEND_URL/api/contact" \
    "POST" \
    "name=Test User&email=test@example.com&subject=Test Subject&message=This is a test message"

test_interaction \
    "電子報訂閱" \
    "訂閱電子報" \
    "$FRONTEND_URL/api/newsletter" \
    "POST" \
    "email=subscriber@example.com"

# ==================================================
# 10. 頁面內互動元素測試
# ==================================================
echo -e "\n${BLUE}==== 🎮 頁面內互動元素測試 ====${NC}"

test_interaction \
    "首頁輪播" \
    "測試首頁輪播圖片載入" \
    "$FRONTEND_URL/$COUNTRY_CODE" \
    "GET" \
    "" \
    "slider\|carousel\|hero"

test_interaction \
    "服務卡片" \
    "測試服務卡片互動" \
    "$FRONTEND_URL/$COUNTRY_CODE" \
    "GET" \
    "" \
    "service\|card"

test_interaction \
    "社群媒體連結" \
    "檢查社群媒體連結" \
    "$FRONTEND_URL/$COUNTRY_CODE" \
    "GET" \
    "" \
    "instagram\|facebook\|social"

# ==================================================
# 測試結果總結
# ==================================================
echo -e "\n${PURPLE}============================================================"
echo "🎯 互動功能測試結果總結"
echo "============================================================${NC}"
echo -e "總互動測試數: ${YELLOW}$TOTAL_INTERACTIONS${NC}"
echo -e "成功測試數: ${GREEN}$PASSED_INTERACTIONS${NC}"
echo -e "失敗測試數: ${RED}$FAILED_INTERACTIONS${NC}"
echo -e "成功率: ${YELLOW}$(( PASSED_INTERACTIONS * 100 / TOTAL_INTERACTIONS ))%${NC}"

# 清理
rm -f "$COOKIE_JAR"

if [[ $FAILED_INTERACTIONS -gt 0 ]]; then
    echo -e "\n${RED}⚠️  有 $FAILED_INTERACTIONS 個互動功能測試失敗${NC}"
    echo -e "${YELLOW}💡 建議檢查：${NC}"
    echo "   1. 相關服務是否正在運行"
    echo "   2. 資料庫連接是否正常"
    echo "   3. API 端點是否配置正確"
    echo "   4. 前端路由是否設置正確"
    exit 1
else
    echo -e "\n${GREEN}🎉 所有互動功能測試都通過了！${NC}"
    echo -e "${GREEN}✨ 你的網站的所有按鈕和互動功能都運作正常${NC}"
fi
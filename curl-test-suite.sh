#!/bin/bash

# ==================================================
# 全網站 cURL 測試套件
# 測試 Tim's Fantasy World 的各種功能和 API
# ==================================================

set -e

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置
FRONTEND_URL="http://localhost:8000"
BACKEND_URL="http://localhost:9000"
CMS_URL="http://localhost:8000/CMS"
MEDUSA_API_KEY="pk_06a1d9f1e084ae6eaa1696b4b058f2dd37e80bdd84e7d0fec6a7a1d04dd9497b"
COUNTRY_CODE="tw"

# API 金鑰 (從 .env.local 讀取)
MEDUSA_API_KEY="pk_06a1d9f1e084ae6eaa1696b4b058f2dd37e80bdd84e7d0fec6a7a1d04dd9497b"

# 測試結果統計
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# 日誌文件
LOG_FILE="curl-test-results-$(date +%Y%m%d_%H%M%S).log"

# 函數：打印測試標題
print_test_header() {
    echo -e "\n${BLUE}===================================================${NC}"
    echo -e "${BLUE}🧪 $1${NC}"
    echo -e "${BLUE}===================================================${NC}"
}

# 函數：執行 cURL 測試
run_curl_test() {
    local test_name="$1"
    local url="$2"
    local method="${3:-GET}"
    local data="$4"
    local headers="$5"
    local expected_status="${6:-200}"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    echo -e "\n${YELLOW}🔄 測試: $test_name${NC}"
    echo "URL: $url"
    echo "Method: $method"
    
    # 建構 curl 命令
    local curl_cmd="curl -s -w 'HTTP_STATUS:%{http_code}\nTIME_TOTAL:%{time_total}\n' -X $method"
    
    if [[ -n "$headers" ]]; then
        curl_cmd="$curl_cmd $headers"
    fi
    
    if [[ -n "$data" && "$method" != "GET" ]]; then
        curl_cmd="$curl_cmd -d '$data'"
    fi
    
    curl_cmd="$curl_cmd '$url'"
    
    # 執行測試
    local result
    result=$(eval $curl_cmd 2>&1)
    
    # 提取 HTTP 狀態碼
    local status_code
    status_code=$(echo "$result" | grep "HTTP_STATUS:" | cut -d: -f2)
    
    # 提取響應時間
    local response_time
    response_time=$(echo "$result" | grep "TIME_TOTAL:" | cut -d: -f2)
    
    # 檢查結果 - 對於前端頁面，200 和 307 都視為成功
    local success=false
    if [[ "$expected_status" == "200" && ("$status_code" == "200" || "$status_code" == "307") ]]; then
        success=true
    elif [[ "$status_code" == "$expected_status" ]]; then
        success=true
    fi
    
    if $success; then
        echo -e "${GREEN}✅ PASS - Status: $status_code, Time: ${response_time}s${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}❌ FAIL - Expected: $expected_status, Got: $status_code, Time: ${response_time}s${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    
    # 記錄到日誌
    echo "[$(date)] $test_name - Status: $status_code, Expected: $expected_status, Time: ${response_time}s" >> "$LOG_FILE"
}

# 函數：測試 JSON API
test_json_api() {
    local test_name="$1"
    local url="$2"
    local method="${3:-GET}"
    local data="$4"
    local expected_status="${5:-200}"
    
    local headers="-H 'Content-Type: application/json' -H 'Accept: application/json'"
    
    # 如果是 Medusa API，添加 publishable key
    if [[ "$url" == *"$BACKEND_URL"* ]]; then
        headers="$headers -H 'x-publishable-api-key: $MEDUSA_API_KEY'"
    fi
    
    run_curl_test "$test_name" "$url" "$method" "$data" "$headers" "$expected_status"
}

# 函數：測試表單提交
test_form_submit() {
    local test_name="$1"
    local url="$2"
    local form_data="$3"
    local expected_status="${4:-200}"
    
    local headers="-H 'Content-Type: application/x-www-form-urlencoded'"
    run_curl_test "$test_name" "$url" "POST" "$form_data" "$headers" "$expected_status"
}

echo -e "${BLUE}"
echo "======================================================"
echo "🚀 Tim's Fantasy World - 全網站 cURL 測試套件"
echo "======================================================"
echo -e "${NC}"
echo "測試開始時間: $(date)"
echo "日誌文件: $LOG_FILE"

# ==================================================
# 1. 基礎連接測試
# ==================================================
print_test_header "基礎連接測試"

run_curl_test "前端首頁" "$FRONTEND_URL"
run_curl_test "後端健康檢查" "$BACKEND_URL/health"
run_curl_test "CMS 頁面" "$CMS_URL" "GET" "" "" "200"

# ==================================================
# 2. 前端頁面測試
# ==================================================
print_test_header "前端頁面路由測試"

# 主要頁面
run_curl_test "首頁 (tw)" "$FRONTEND_URL/$COUNTRY_CODE"
run_curl_test "商品頁面" "$FRONTEND_URL/$COUNTRY_CODE/store"
run_curl_test "部落格頁面" "$FRONTEND_URL/$COUNTRY_CODE/blog"
run_curl_test "購物車頁面" "$FRONTEND_URL/$COUNTRY_CODE/cart"
run_curl_test "登入頁面" "$FRONTEND_URL/$COUNTRY_CODE/account/login"
run_curl_test "註冊頁面" "$FRONTEND_URL/$COUNTRY_CODE/account/register"

# 會員相關頁面
run_curl_test "會員中心" "$FRONTEND_URL/$COUNTRY_CODE/account"
run_curl_test "會員資料" "$FRONTEND_URL/$COUNTRY_CODE/account/profile"
run_curl_test "訂單歷史" "$FRONTEND_URL/$COUNTRY_CODE/account/orders"
run_curl_test "地址管理" "$FRONTEND_URL/$COUNTRY_CODE/account/addresses"

# 聯盟行銷頁面
run_curl_test "聯盟註冊" "$FRONTEND_URL/$COUNTRY_CODE/regitster-affiliate"
run_curl_test "聯盟登入" "$FRONTEND_URL/$COUNTRY_CODE/login-affiliate"
run_curl_test "聯盟後台" "$FRONTEND_URL/$COUNTRY_CODE/affiliate"
run_curl_test "聯盟管理" "$FRONTEND_URL/$COUNTRY_CODE/affiliate-admin"

# 結帳流程
run_curl_test "結帳頁面" "$FRONTEND_URL/$COUNTRY_CODE/checkout"

# ==================================================
# 3. Medusa Backend API 測試
# ==================================================
print_test_header "Medusa Backend API 測試"

# 商店基本資訊
test_json_api "商店資訊" "$BACKEND_URL/store"
test_json_api "區域列表" "$BACKEND_URL/store/regions"
test_json_api "國家列表" "$BACKEND_URL/store/countries"

# 產品相關
# Check products API
test_api_call "GET /store/products" \
  "$BACKEND_URL/store/products" \
  "application/json" \
  "-H \"x-publishable-api-key: pk_06a1d9f1e084ae6eaa1696b4b058f2dd37e80bdd84e7d0fec6a7a1d04dd9497b\""
test_json_api "產品分類" "$BACKEND_URL/store/categories"
test_json_api "產品系列" "$BACKEND_URL/store/collections"

# 購物車 (需要先建立)
test_json_api "建立購物車" "$BACKEND_URL/store/carts" "POST" '{"region_id":"reg_01JDQKAG9JM4P8XRQP1QEW4W7F"}'

# 客戶相關 (公開端點)
test_json_api "密碼重設請求" "$BACKEND_URL/store/customers/password-token" "POST" '{"email":"test@example.com"}' "200"

# ==================================================
# 4. 前端 API 路由測試
# ==================================================
print_test_header "前端 API 路由測試"

# 客戶相關 API
test_json_api "客戶資訊 API" "$FRONTEND_URL/api/customer"
test_json_api "客戶訂單 API" "$FRONTEND_URL/api/customer/orders"

# CMS 相關 API
test_json_api "頁面列表 API" "$FRONTEND_URL/api/pages/list"
test_json_api "Sanity Webhook" "$FRONTEND_URL/api/sanity-webhook" "POST" '{"_type":"test"}' "200"

# Debug API
test_json_api "Medusa Debug" "$FRONTEND_URL/api/debug/medusa"
test_json_api "Cookies Debug" "$FRONTEND_URL/api/debug/cookies"

# 聯盟 API
test_json_api "聯盟統計" "$FRONTEND_URL/api/affiliate/stats"
test_json_api "聯盟獎金" "$FRONTEND_URL/api/affiliate/payouts"

# ==================================================
# 5. 搜尋功能測試
# ==================================================
print_test_header "搜尋功能測試"

# 產品搜尋
run_curl_test "產品搜尋" "$FRONTEND_URL/$COUNTRY_CODE/store?q=test"
run_curl_test "部落格搜尋" "$FRONTEND_URL/$COUNTRY_CODE/blog?q=test"
run_curl_test "搜尋頁面" "$FRONTEND_URL/$COUNTRY_CODE/search?q=test"

# ==================================================
# 6. 表單提交測試 (模擬)
# ==================================================
print_test_header "表單提交測試"

# 聯絡表單 (如果存在)
test_form_submit "聯絡表單" "$FRONTEND_URL/api/contact" "name=Test&email=test@example.com&message=Test message" "200"

# 訂閱電子報 (如果存在)
test_form_submit "電子報訂閱" "$FRONTEND_URL/api/newsletter" "email=test@example.com" "200"

# ==================================================
# 7. 靜態資源測試
# ==================================================
print_test_header "靜態資源測試"

run_curl_test "Robots.txt" "$FRONTEND_URL/robots.txt"
run_curl_test "Favicon" "$FRONTEND_URL/favicon.ico"
run_curl_test "Sitemap" "$FRONTEND_URL/sitemap.xml" "GET" "" "" "200"

# ==================================================
# 8. CMS 功能測試
# ==================================================
print_test_header "CMS 功能測試"

# Sanity Studio
run_curl_test "Sanity Studio" "$CMS_URL"
run_curl_test "Sanity Vision" "$CMS_URL/vision"
run_curl_test "Sanity 結構" "$CMS_URL/structure"

# ==================================================
# 9. 效能測試
# ==================================================
print_test_header "效能測試 (響應時間)"

echo -e "\n${YELLOW}🏃‍♂️ 執行 3 次效能測試...${NC}"
for i in {1..3}; do
    echo -e "\n--- 第 $i 次測試 ---"
    run_curl_test "首頁效能測試 #$i" "$FRONTEND_URL/$COUNTRY_CODE"
    run_curl_test "商品頁效能測試 #$i" "$FRONTEND_URL/$COUNTRY_CODE/store"
    run_curl_test "API 效能測試 #$i" "$BACKEND_URL/store/products"
done

# ==================================================
# 10. 錯誤頁面測試
# ==================================================
print_test_header "錯誤頁面測試"

run_curl_test "404 頁面" "$FRONTEND_URL/non-existent-page" "GET" "" "" "404"
run_curl_test "API 404" "$FRONTEND_URL/api/non-existent" "GET" "" "" "404"
run_curl_test "後端 404" "$BACKEND_URL/non-existent" "GET" "" "" "404"

# ==================================================
# 測試結果總結
# ==================================================
echo -e "\n${BLUE}======================================================"
echo "📊 測試結果總結"
echo "======================================================${NC}"
echo -e "總測試數: ${YELLOW}$TOTAL_TESTS${NC}"
echo -e "通過測試: ${GREEN}$PASSED_TESTS${NC}"
echo -e "失敗測試: ${RED}$FAILED_TESTS${NC}"
echo -e "成功率: ${YELLOW}$(( PASSED_TESTS * 100 / TOTAL_TESTS ))%${NC}"
echo "測試完成時間: $(date)"
echo "詳細日誌: $LOG_FILE"

if [[ $FAILED_TESTS -gt 0 ]]; then
    echo -e "\n${RED}⚠️  有 $FAILED_TESTS 個測試失敗，請檢查日誌文件${NC}"
    exit 1
else
    echo -e "\n${GREEN}🎉 所有測試都通過了！${NC}"
fi
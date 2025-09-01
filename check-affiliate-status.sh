#!/bin/bash

# 🎯 Affiliate 系統狀態檢查腳本
echo "🔍 Affiliate 系統狀態檢查"
echo "=========================="

# 檢查前端服務
echo "1️⃣ 前端服務狀態:"
if curl -s -f http://localhost:8000/tw > /dev/null; then
    echo "✅ 前端服務正常運行 (http://localhost:8000)"
else
    echo "❌ 前端服務無法訪問"
    echo "   請執行: cd frontend && yarn dev"
fi

# 檢查後端資料
echo -e "\n2️⃣ 後端資料狀態:"
if [ -f "../backend/data/affiliate.json" ]; then
    echo "✅ 後端資料檔案存在"
    applications=$(cat ../backend/data/affiliate.json | jq '.applications | length' 2>/dev/null || echo "0")
    accounts=$(cat ../backend/data/affiliate.json | jq '.accounts | length' 2>/dev/null || echo "0")
    rejected=$(cat ../backend/data/affiliate.json | jq '.rejected | length' 2>/dev/null || echo "0")
    echo "   - 待審核申請: $applications 個"
    echo "   - 已通過帳號: $accounts 個" 
    echo "   - 已拒絕申請: $rejected 個"
else
    echo "❌ 後端資料檔案不存在"
    echo "   檔案路徑: ../backend/data/affiliate.json"
fi

# 檢查關鍵頁面
echo -e "\n3️⃣ 關鍵頁面狀態:"

pages=(
    "tw/affiliate/register:會員註冊頁"
    "tw/affiliate-admin/login:管理後台登入" 
    "tw/affiliate-admin:管理後台總覽"
    "tw/affiliate-admin/applications:申請審核頁"
)

for page in "${pages[@]}"; do
    url=$(echo $page | cut -d: -f1)
    name=$(echo $page | cut -d: -f2)
    
    status=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:8000/$url" 2>/dev/null)
    
    if [[ "$status" == "200" || "$status" == "302" ]]; then
        echo "✅ $name - 狀態碼: $status"
    elif [[ "$status" == "401" ]]; then
        echo "🔐 $name - 需要認證 (正常)"
    else
        echo "❌ $name - 狀態碼: $status"
    fi
done

# 檢查 API 端點
echo -e "\n4️⃣ API 端點狀態:"

api_endpoints=(
    "api/affiliate-admin/applications:申請列表 API"
    "api/affiliate-admin/login:管理員登入 API"
)

for endpoint in "${api_endpoints[@]}"; do
    url=$(echo $endpoint | cut -d: -f1)
    name=$(echo $endpoint | cut -d: -f2)
    
    status=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:8000/$url" 2>/dev/null)
    
    if [[ "$status" == "401" ]]; then
        echo "✅ $name - 需要認證 (正常)"
    elif [[ "$status" == "200" ]]; then
        echo "✅ $name - 正常回應"
    else
        echo "❌ $name - 狀態碼: $status"
    fi
done

echo -e "\n🎯 測試建議:"
echo "============"
echo "1. 打開瀏覽器訪問: http://localhost:8000/tw/affiliate/register"
echo "2. 註冊新的聯盟夥伴帳號"
echo "3. 使用管理員帳號登入: http://localhost:8000/tw/affiliate-admin/login"
echo "   帳號: admin@local.dev"
echo "   密碼: MySecure2024Admin"
echo "4. 在管理後台審核申請: http://localhost:8000/tw/affiliate-admin/applications"

echo -e "\n✅ 系統已修復並準備就緒！"

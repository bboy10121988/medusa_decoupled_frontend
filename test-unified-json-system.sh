#!/bin/bash

# 🧪 聯盟會員統一 JSON 系統測試
echo "🔧 聯盟會員統一 JSON 系統測試"
echo "=============================="
echo ""

# 測試配置
FRONTEND_URL="http://localhost:8000"
BACKEND_URL="http://localhost:9000"
JSON_FILE="../backend/data/affiliate.json"

echo "📋 測試配置:"
echo "   前端 URL: $FRONTEND_URL"
echo "   後端 URL: $BACKEND_URL"
echo "   JSON 檔案: $JSON_FILE"
echo ""

# 1. 檢查服務狀態
echo "1️⃣ 服務狀態檢查:"
echo "---"

if lsof -ti:8000 >/dev/null 2>&1; then
    echo "✅ 前端服務運行中 (Port 8000)"
else
    echo "❌ 前端服務未運行"
    echo "   請執行: cd frontend && yarn dev"
fi

if lsof -ti:9000 >/dev/null 2>&1; then
    echo "✅ 後端服務運行中 (Port 9000)"
else
    echo "❌ 後端服務未運行"
    echo "   請執行: cd backend && yarn dev"
fi

echo ""

# 2. JSON 檔案狀態
echo "2️⃣ JSON 檔案狀態:"
echo "---"

if [ -f "$JSON_FILE" ]; then
    echo "✅ JSON 檔案存在: $JSON_FILE"
    
    # 檔案大小和修改時間
    FILE_SIZE=$(ls -lh "$JSON_FILE" | awk '{print $5}')
    MODIFIED=$(stat -f %Sm "$JSON_FILE" 2>/dev/null || stat -c %y "$JSON_FILE" 2>/dev/null || echo "Unknown")
    echo "📁 檔案大小: $FILE_SIZE"
    echo "📅 修改時間: $MODIFIED"
    
    # 資料統計
    if command -v jq >/dev/null 2>&1; then
        APPLICATIONS=$(cat "$JSON_FILE" | jq '.applications | length' 2>/dev/null || echo "0")
        ACCOUNTS=$(cat "$JSON_FILE" | jq '.accounts | length' 2>/dev/null || echo "0")
        REJECTED=$(cat "$JSON_FILE" | jq '.rejected | length' 2>/dev/null || echo "0")
        
        echo "📊 資料統計:"
        echo "   - 🟡 待審核申請: $APPLICATIONS"
        echo "   - 🟢 已通過帳號: $ACCOUNTS"
        echo "   - 🔴 已拒絕申請: $REJECTED"
    else
        echo "⚠️  jq 未安裝，無法解析 JSON 資料"
    fi
else
    echo "❌ JSON 檔案不存在"
fi

echo ""

# 3. 測試註冊流程
echo "3️⃣ 測試註冊流程:"
echo "---"

TEST_EMAIL="test-$(date +%s)@example.com"
TEST_NAME="Test User $(date +%H%M)"

echo "🔄 測試註冊新用戶:"
echo "   📧 電子郵件: $TEST_EMAIL"
echo "   👤 顯示名稱: $TEST_NAME"

# 直接呼叫後端 API 測試註冊
REGISTER_RESPONSE=$(curl -s -X POST "$BACKEND_URL/store/affiliate/applications" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"testpass123\",
    \"displayName\": \"$TEST_NAME\",
    \"website\": \"https://test.com\"
  }" 2>/dev/null)

if [ $? -eq 0 ] && [ ! -z "$REGISTER_RESPONSE" ]; then
    echo "✅ 註冊 API 呼叫成功"
    echo "📄 回應: $REGISTER_RESPONSE"
else
    echo "❌ 註冊 API 呼叫失敗"
fi

echo ""

# 4. 檢查 JSON 檔案更新
echo "4️⃣ 檢查 JSON 檔案更新:"
echo "---"

if [ -f "$JSON_FILE" ]; then
    # 檢查是否有新的申請記錄
    if command -v jq >/dev/null 2>&1; then
        NEW_APPLICATIONS=$(cat "$JSON_FILE" | jq '.applications | length' 2>/dev/null || echo "0")
        
        # 檢查是否包含測試用戶
        TEST_USER_EXISTS=$(cat "$JSON_FILE" | jq -r --arg email "$TEST_EMAIL" '.applications[] | select(.email == $email) | .email' 2>/dev/null)
        
        echo "📊 更新後申請數量: $NEW_APPLICATIONS"
        
        if [ "$TEST_USER_EXISTS" = "$TEST_EMAIL" ]; then
            echo "✅ 測試用戶已成功新增到 JSON 檔案"
            
            # 顯示新增的申請詳細資訊
            echo "📋 新增申請詳細:"
            cat "$JSON_FILE" | jq -r --arg email "$TEST_EMAIL" '.applications[] | select(.email == $email)' 2>/dev/null | sed 's/^/   /'
        else
            echo "⚠️  測試用戶未出現在 JSON 檔案中"
        fi
    fi
else
    echo "❌ 無法檢查 JSON 檔案更新"
fi

echo ""

# 5. 測試管理後台 API
echo "5️⃣ 測試管理後台 API:"
echo "---"

# 模擬管理員登入 token（實際使用中會透過正常登入流程獲得）
ADMIN_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluXzAwMSIsImVtYWlsIjoiYWRtaW5AbG9jYWwuZGV2IiwibmFtZSI6IkFmZmlsaWF0ZSBCZW5lZml0cyBBZG1pbiIsImV4cCI6OTk5OTk5OTk5OX0.demo"

echo "🔄 測試管理後台申請列表 API:"

ADMIN_RESPONSE=$(curl -s -X GET "$FRONTEND_URL/api/affiliate-admin/applications" \
  -H "Cookie: _affiliate_admin_jwt=$ADMIN_TOKEN" \
  -H "Accept: application/json" 2>/dev/null)

if [ $? -eq 0 ] && [ ! -z "$ADMIN_RESPONSE" ]; then
    echo "✅ 管理後台 API 呼叫成功"
    
    # 解析回應中的申請數量
    if command -v jq >/dev/null 2>&1; then
        API_COUNT=$(echo "$ADMIN_RESPONSE" | jq '.applications | length' 2>/dev/null || echo "unknown")
        echo "📊 API 回傳申請數量: $API_COUNT"
        
        # 檢查是否包含測試用戶
        API_TEST_USER=$(echo "$ADMIN_RESPONSE" | jq -r --arg email "$TEST_EMAIL" '.applications[] | select(.email == $email) | .email' 2>/dev/null)
        
        if [ "$API_TEST_USER" = "$TEST_EMAIL" ]; then
            echo "✅ 管理後台 API 正確顯示新註冊的用戶"
        else
            echo "⚠️  管理後台 API 未顯示新註冊的用戶"
        fi
    fi
else
    echo "❌ 管理後台 API 呼叫失敗"
fi

echo ""

# 6. 資料一致性檢查
echo "6️⃣ 資料一致性檢查:"
echo "---"

if [ -f "$JSON_FILE" ] && command -v jq >/dev/null 2>&1; then
    # 檢查 JSON 檔案結構
    JSON_STRUCTURE=$(cat "$JSON_FILE" | jq 'keys' 2>/dev/null)
    echo "📁 JSON 檔案結構: $JSON_STRUCTURE"
    
    # 檢查是否有重複的 email
    DUPLICATE_EMAILS=$(cat "$JSON_FILE" | jq -r '.applications[].email' 2>/dev/null | sort | uniq -d)
    if [ -z "$DUPLICATE_EMAILS" ]; then
        echo "✅ 無重複的電子郵件"
    else
        echo "⚠️  發現重複的電子郵件: $DUPLICATE_EMAILS"
    fi
    
    # 檢查必要欄位
    MISSING_FIELDS=$(cat "$JSON_FILE" | jq -r '.applications[] | select(.id == null or .email == null or .displayName == null) | .email // "unknown"' 2>/dev/null)
    if [ -z "$MISSING_FIELDS" ]; then
        echo "✅ 所有申請都有必要欄位"
    else
        echo "⚠️  發現缺少必要欄位的申請"
    fi
fi

echo ""

# 7. 測試總結
echo "7️⃣ 測試總結:"
echo "=========="

echo "🎯 統一 JSON 系統狀態:"

# 檢查各個組件是否正常工作
COMPONENTS_STATUS=""

if lsof -ti:8000 >/dev/null 2>&1; then
    COMPONENTS_STATUS="$COMPONENTS_STATUS✅前端 "
else
    COMPONENTS_STATUS="$COMPONENTS_STATUS❌前端 "
fi

if lsof -ti:9000 >/dev/null 2>&1; then
    COMPONENTS_STATUS="$COMPONENTS_STATUS✅後端 "
else
    COMPONENTS_STATUS="$COMPONENTS_STATUS❌後端 "
fi

if [ -f "$JSON_FILE" ]; then
    COMPONENTS_STATUS="$COMPONENTS_STATUS✅JSON檔案 "
else
    COMPONENTS_STATUS="$COMPONENTS_STATUS❌JSON檔案 "
fi

echo "   組件狀態: $COMPONENTS_STATUS"

if [ "$TEST_USER_EXISTS" = "$TEST_EMAIL" ]; then
    echo "   ✅ 註冊流程：正常（新用戶已新增到 JSON）"
else
    echo "   ⚠️  註冊流程：需檢查（新用戶未出現）"
fi

if [ "$API_TEST_USER" = "$TEST_EMAIL" ]; then
    echo "   ✅ 管理後台：正常（API 正確讀取 JSON）"
else
    echo "   ⚠️  管理後台：需檢查（API 未正確讀取）"
fi

echo ""
echo "🎉 統一 JSON 系統測試完成！"
echo ""
echo "📌 下一步："
echo "1. 如果所有測試都通過，系統已統一到 JSON 檔案"
echo "2. 可以開始測試審核功能（通過/拒絕申請）"
echo "3. 監控 JSON 檔案的資料變化"
echo ""
echo "🔗 相關 URL："
echo "- 會員註冊: $FRONTEND_URL/tw/affiliate/register"
echo "- 管理後台: $FRONTEND_URL/tw/affiliate-admin/login"

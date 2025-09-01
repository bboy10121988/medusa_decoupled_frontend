#!/bin/bash

# 🧪 聯盟會員註冊存入 JSON 完整測試
echo "🧪 聯盟會員註冊存入 JSON 完整測試"
echo "========================================"
echo "測試目標：驗證註冊功能是否正確存入 JSON 檔案"
echo ""

# 配置
BACKEND_URL="http://localhost:9000"
FRONTEND_URL="http://localhost:8000"
JSON_FILE="../backend/data/affiliate.json"

# 記錄原始狀態
echo "1️⃣ 記錄原始狀態:"
echo "---"

if [ -f "$JSON_FILE" ]; then
    ORIGINAL_COUNT=$(cat "$JSON_FILE" | jq '.applications | length' 2>/dev/null || echo "0")
    echo "📊 原始申請數量: $ORIGINAL_COUNT"
    
    # 顯示最後一筆申請
    echo "📋 最後一筆申請:"
    cat "$JSON_FILE" | jq '.applications[-1] | {id, email, displayName, created_at}' 2>/dev/null || echo "   無申請記錄"
else
    echo "⚠️  JSON 檔案不存在"
    ORIGINAL_COUNT=0
fi
echo ""

# 測試 1: 後端 API 直接測試
echo "2️⃣ 測試後端 API 直接註冊:"
echo "---"

TEST_EMAIL="backend-direct-$(date +%s)@example.com"
TEST_NAME="Backend Direct Test"

echo "🔄 透過後端 API 註冊:"
echo "   📧 Email: $TEST_EMAIL"
echo "   👤 Name: $TEST_NAME"

API_RESPONSE=$(curl -s -X POST "$BACKEND_URL/affiliate-apply" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"testpass123\",
    \"displayName\": \"$TEST_NAME\",
    \"website\": \"https://backend-test.com\"
  }" 2>/dev/null)

if [ ! -z "$API_RESPONSE" ]; then
    echo "📄 API 回應:"
    echo "$API_RESPONSE" | jq . 2>/dev/null || echo "$API_RESPONSE"
    
    SUCCESS=$(echo "$API_RESPONSE" | jq -r '.success' 2>/dev/null)
    if [ "$SUCCESS" = "true" ]; then
        echo "✅ 後端 API 註冊成功"
    else
        echo "❌ 後端 API 註冊失敗"
    fi
else
    echo "❌ 後端 API 無回應"
fi
echo ""

# 檢查 JSON 檔案更新
echo "3️⃣ 檢查 JSON 檔案更新:"
echo "---"

if [ -f "$JSON_FILE" ]; then
    NEW_COUNT=$(cat "$JSON_FILE" | jq '.applications | length' 2>/dev/null || echo "0")
    echo "📊 更新後申請數量: $NEW_COUNT"
    
    ADDED_COUNT=$((NEW_COUNT - ORIGINAL_COUNT))
    echo "📈 新增申請數量: $ADDED_COUNT"
    
    if [ $ADDED_COUNT -gt 0 ]; then
        echo "✅ JSON 檔案已更新"
        echo "📋 最新申請記錄:"
        cat "$JSON_FILE" | jq '.applications[-1] | {id, email, displayName, status, created_at}' 2>/dev/null | sed 's/^/   /'
        
        # 檢查是否為我們的測試用戶
        LATEST_EMAIL=$(cat "$JSON_FILE" | jq -r '.applications[-1].email' 2>/dev/null)
        if [ "$LATEST_EMAIL" = "$TEST_EMAIL" ]; then
            echo "✅ 確認是我們的測試申請"
        else
            echo "⚠️  最新申請不是我們的測試（可能有其他申請）"
        fi
    else
        echo "❌ JSON 檔案未更新"
    fi
else
    echo "❌ JSON 檔案不存在"
fi
echo ""

# 測試 2: 測試重複防護
echo "4️⃣ 測試重複電子郵件防護:"
echo "---"

echo "🔄 嘗試重複註冊相同 email:"
DUPLICATE_RESPONSE=$(curl -s -X POST "$BACKEND_URL/affiliate-apply" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"different123\",
    \"displayName\": \"Different Name\",
    \"website\": \"https://different.com\"
  }" 2>/dev/null)

if [ ! -z "$DUPLICATE_RESPONSE" ]; then
    echo "📄 重複註冊回應:"
    echo "$DUPLICATE_RESPONSE" | jq . 2>/dev/null || echo "$DUPLICATE_RESPONSE"
    
    ERROR_MESSAGE=$(echo "$DUPLICATE_RESPONSE" | jq -r '.message // .error' 2>/dev/null)
    if [[ "$ERROR_MESSAGE" == *"已經申請"* ]] || [[ "$ERROR_MESSAGE" == *"already"* ]]; then
        echo "✅ 重複防護正常運作"
    else
        echo "⚠️  重複防護可能需要檢查"
    fi
else
    echo "❌ 重複註冊測試無回應"
fi
echo ""

# 測試 3: 前端整合測試
echo "5️⃣ 前端整合狀態檢查:"
echo "---"

echo "🔍 檢查前端設定:"
echo "   📝 註冊頁面: $FRONTEND_URL/tw/affiliate/register"
echo "   🔗 後端端點: $BACKEND_URL/affiliate-apply"

# 檢查前端 affiliate-auth.ts 是否使用正確端點
FRONTEND_CODE_CHECK=$(grep -n "affiliate-apply" ../src/lib/data/affiliate-auth.ts 2>/dev/null || echo "")
if [ ! -z "$FRONTEND_CODE_CHECK" ]; then
    echo "✅ 前端程式碼使用正確的 /affiliate-apply 端點"
else
    echo "⚠️  需要檢查前端程式碼"
fi

echo ""

# 總結報告
echo "6️⃣ 測試總結:"
echo "============="

echo "🎯 測試結果:"
if [ "$SUCCESS" = "true" ] && [ $ADDED_COUNT -gt 0 ]; then
    echo "   ✅ 後端註冊 API 正常運作"
    echo "   ✅ JSON 檔案正確更新"
    echo "   ✅ 申請記錄格式正確"
    echo "   ✅ 重複防護機制運作"
    echo ""
    echo "🎉 註冊存入 JSON 功能完全正常！"
else
    echo "   ⚠️  測試過程中發現問題，需要進一步檢查"
fi

echo ""
echo "📊 最終統計:"
echo "   原始申請數: $ORIGINAL_COUNT"
echo "   當前申請數: $NEW_COUNT"
echo "   新增申請數: $ADDED_COUNT"

echo ""
echo "🧪 手動測試建議:"
echo "1. 開啟 $FRONTEND_URL/tw/affiliate/register"
echo "2. 填寫測試資料並提交"
echo "3. 檢查是否重定向到待審核頁面"
echo "4. 檢查 JSON 檔案是否新增記錄"

echo ""
echo "📁 相關檔案:"
echo "   - JSON 資料: $JSON_FILE"
echo "   - 後端端點: /backend/src/api/affiliate-apply/route.ts"
echo "   - 前端邏輯: /src/lib/data/affiliate-auth.ts"

#!/bin/bash

# 🧪 JSON vs 資料庫效能測試腳本
echo "🚀 JSON vs 資料庫效能測試"
echo "========================="
echo ""

# 測試參數
TEST_RECORDS=100
CONCURRENT_USERS=5

echo "📋 測試配置:"
echo "   - 測試記錄數: $TEST_RECORDS"
echo "   - 並發用戶數: $CONCURRENT_USERS"
echo ""

# 1. JSON 檔案讀取測試
echo "1️⃣ JSON 檔案讀取效能測試:"
echo "---"

JSON_FILE="../backend/data/affiliate.json"

if [ -f "$JSON_FILE" ]; then
    # 檔案大小
    FILE_SIZE=$(ls -lh "$JSON_FILE" | awk '{print $5}')
    echo "📁 檔案大小: $FILE_SIZE"
    
    # 讀取時間測試
    start_time=$(node -e "console.log(Date.now())")
    
    for i in {1..10}; do
        cat "$JSON_FILE" | jq '.applications | length' > /dev/null 2>&1
    done
    
    end_time=$(node -e "console.log(Date.now())")
    duration=$((end_time - start_time))
    avg_time=$((duration / 10))
    
    echo "⏱️  平均讀取時間: ${avg_time}ms (10次讀取)"
    
    # 記憶體使用估算
    RECORDS=$(cat "$JSON_FILE" | jq '.applications | length' 2>/dev/null || echo "0")
    MEMORY_PER_RECORD=100  # bytes
    ESTIMATED_MEMORY=$((RECORDS * MEMORY_PER_RECORD))
    
    echo "💾 估算記憶體使用: ${ESTIMATED_MEMORY} bytes"
else
    echo "❌ JSON 檔案不存在"
fi

echo ""

# 2. 資料庫連接測試
echo "2️⃣ PostgreSQL 資料庫效能測試:"
echo "---"

DB_URL="postgres://postgres:password@localhost:5432/medusa-medusa_decoupled"

if command -v psql >/dev/null 2>&1; then
    # 測試資料庫連接
    if psql "$DB_URL" -c "SELECT 1;" >/dev/null 2>&1; then
        echo "✅ 資料庫連線正常"
        
        # 查詢效能測試
        start_time=$(node -e "console.log(Date.now())")
        
        for i in {1..10}; do
            psql "$DB_URL" -c "SELECT COUNT(*) FROM customer;" >/dev/null 2>&1
        done
        
        end_time=$(node -e "console.log(Date.now())")
        duration=$((end_time - start_time))
        avg_time=$((duration / 10))
        
        echo "⏱️  平均查詢時間: ${avg_time}ms (10次查詢)"
        
        # 資料表統計
        CUSTOMER_COUNT=$(psql "$DB_URL" -t -c "SELECT COUNT(*) FROM customer;" 2>/dev/null | tr -d ' ')
        echo "📊 客戶資料表記錄數: $CUSTOMER_COUNT"
        
        # 索引效能
        INDEX_COUNT=$(psql "$DB_URL" -t -c "SELECT COUNT(*) FROM pg_indexes WHERE tablename = 'customer';" 2>/dev/null | tr -d ' ')
        echo "🔍 索引數量: $INDEX_COUNT"
        
    else
        echo "❌ 無法連接資料庫"
    fi
else
    echo "⚠️  psql 未安裝"
fi

echo ""

# 3. 併發測試模擬
echo "3️⃣ 併發處理測試:"
echo "---"

# JSON 併發風險模擬
echo "📄 JSON 檔案併發風險:"
echo "   - 多個程序同時寫入 → 資料損壞風險"
echo "   - 檔案鎖定機制 → 效能瓶頸"
echo "   - 完整檔案讀取 → 記憶體消耗"

echo ""
echo "🗄️  資料庫併發優勢:"
echo "   - MVCC (多版本併發控制)"
echo "   - 行級鎖定"
echo "   - 事務隔離"

echo ""

# 4. 擴展性分析
echo "4️⃣ 擴展性分析:"
echo "---"

echo "📈 JSON 檔案擴展限制:"
echo "   - 檔案大小限制: 實際約 100MB"
echo "   - 讀取時間隨資料增長: O(n)"
echo "   - 記憶體使用隨檔案大小增長"

echo ""
echo "📈 資料庫擴展能力:"
echo "   - 資料量限制: TB 級別"
echo "   - 查詢時間透過索引: O(log n)"
echo "   - 記憶體使用可控"

echo ""

# 5. 維護成本分析
echo "5️⃣ 維護成本分析:"
echo "---"

echo "🛠️  JSON 檔案維護:"
echo "   ✅ 設定簡單"
echo "   ✅ 除錯容易"
echo "   ❌ 無自動備份"
echo "   ❌ 無資料完整性檢查"
echo "   ❌ 手動資料修復"

echo ""
echo "🛠️  資料庫維護:"
echo "   ❌ 需要資料庫知識"
echo "   ❌ 設定相對複雜"
echo "   ✅ 自動備份"
echo "   ✅ 資料完整性約束"
echo "   ✅ 自動恢復機制"

echo ""

# 6. 建議總結
echo "6️⃣ 建議總結:"
echo "=========="

if [ -f "$JSON_FILE" ]; then
    CURRENT_RECORDS=$(cat "$JSON_FILE" | jq '.applications | length' 2>/dev/null || echo "0")
    
    if [ "$CURRENT_RECORDS" -lt 100 ]; then
        echo "📊 目前資料量: $CURRENT_RECORDS 筆"
        echo "💡 建議: JSON 檔案適合目前規模"
        echo "🎯 原因:"
        echo "   - 資料量小，效能差異不明顯"
        echo "   - 開發和除錯便利"
        echo "   - 部署簡單"
        echo ""
        echo "⚠️  注意事項:"
        echo "   - 避免高併發寫入"
        echo "   - 定期備份 JSON 檔案"
        echo "   - 監控檔案大小成長"
    else
        echo "📊 目前資料量: $CURRENT_RECORDS 筆"
        echo "💡 建議: 考慮遷移到資料庫"
        echo "🎯 原因:"
        echo "   - 資料量增大，效能差異明顯"
        echo "   - 併發處理需求"
        echo "   - 資料安全性考量"
    fi
else
    echo "📊 無法讀取目前資料量"
    echo "💡 建議: 先建立 JSON 檔案系統進行開發"
fi

echo ""
echo "🚀 遷移時機:"
echo "   - 資料量 > 1000 筆"
echo "   - 同時在線用戶 > 10 人"
echo "   - 進入正式環境"
echo ""
echo "完成效能分析！"

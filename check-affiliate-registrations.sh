#!/bin/bash

# 🔍 聯盟會員註冊檢查報告
echo "📊 聯盟會員註冊檢查報告"
echo "=========================="
echo "檢查時間: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# 1. 檢查後端資料檔案
echo "1️⃣ 後端資料檔案狀態:"
if [ -f "../backend/data/affiliate.json" ]; then
    echo "✅ 資料檔案存在: /backend/data/affiliate.json"
    
    # 檔案修改時間
    echo "📅 檔案修改時間: $(stat -f %Sm ../backend/data/affiliate.json)"
    
    # 統計申請數量
    applications=$(cat ../backend/data/affiliate.json | jq '.applications | length' 2>/dev/null || echo "0")
    accounts=$(cat ../backend/data/affiliate.json | jq '.accounts | length' 2>/dev/null || echo "0")
    rejected=$(cat ../backend/data/affiliate.json | jq '.rejected | length' 2>/dev/null || echo "0")
    
    echo "📈 申請統計:"
    echo "   - 🟡 待審核申請: $applications 個"
    echo "   - 🟢 已通過帳號: $accounts 個"
    echo "   - 🔴 已拒絕申請: $rejected 個"
    
    echo ""
    echo "📋 待審核申請詳細資料:"
    cat ../backend/data/affiliate.json | jq -r '.applications[] | "   • \(.displayName) (\(.email)) - 申請時間: \(.created_at)"' 2>/dev/null || echo "   無法讀取申請資料"
    
    if [ "$accounts" -gt 0 ]; then
        echo ""
        echo "📋 已通過帳號詳細資料:"
        cat ../backend/data/affiliate.json | jq -r '.accounts[] | "   • \(.displayName) (\(.email)) - 通過時間: \(.approved_at)"' 2>/dev/null || echo "   無法讀取帳號資料"
    fi
    
else
    echo "❌ 資料檔案不存在"
fi

echo ""

# 2. 檢查 PostgreSQL 資料庫
echo "2️⃣ PostgreSQL 資料庫檢查:"
if command -v psql >/dev/null 2>&1; then
    # 檢查資料庫連線
    if psql postgres://postgres:password@localhost:5432/medusa-medusa_decoupled -c "SELECT 1;" >/dev/null 2>&1; then
        echo "✅ 資料庫連線正常"
        
        # 檢查是否有 affiliate 相關資料表
        affiliate_tables=$(psql postgres://postgres:password@localhost:5432/medusa-medusa_decoupled -c "\dt" | grep -i affiliate | wc -l)
        echo "📊 Affiliate 相關資料表數量: $affiliate_tables"
        
        if [ "$affiliate_tables" -gt 0 ]; then
            echo "📋 Affiliate 相關資料表:"
            psql postgres://postgres:password@localhost:5432/medusa-medusa_decoupled -c "\dt" | grep -i affiliate
        else
            echo "ℹ️  目前沒有在 PostgreSQL 中建立 affiliate 專用資料表"
            echo "   聯盟會員系統使用檔案儲存 (JSON)"
        fi
        
    else
        echo "❌ 無法連接到資料庫"
    fi
else
    echo "⚠️  psql 工具不可用，無法檢查資料庫"
fi

echo ""

# 3. 檢查服務狀態
echo "3️⃣ 服務狀態檢查:"

# 前端服務
if lsof -ti:8000 >/dev/null 2>&1; then
    echo "✅ 前端服務運行中 (Port 8000)"
else
    echo "❌ 前端服務未運行"
fi

# 後端服務  
if lsof -ti:9000 >/dev/null 2>&1; then
    echo "✅ 後端服務運行中 (Port 9000)"
else
    echo "❌ 後端服務未運行"
fi

echo ""

# 4. 檢查最近活動
echo "4️⃣ 系統活動檢查:"

# 檢查最近的檔案修改
echo "📅 最近修改的相關檔案:"
find ../backend -name "*affiliate*" -type f -exec ls -la {} \; 2>/dev/null | head -5

echo ""

# 5. 新申請檢查
echo "5️⃣ 新申請檢查:"
if [ -f "../backend/data/affiliate.json" ]; then
    # 檢查今天的申請
    today=$(date '+%Y-%m-%d')
    new_today=$(cat ../backend/data/affiliate.json | jq --arg today "$today" '.applications[] | select(.created_at | startswith($today))' 2>/dev/null | jq -s length 2>/dev/null || echo "0")
    
    echo "📊 今日新申請數量: $new_today 個"
    
    if [ "$new_today" -gt 0 ]; then
        echo "📋 今日申請詳細:"
        cat ../backend/data/affiliate.json | jq --arg today "$today" -r '.applications[] | select(.created_at | startswith($today)) | "   • \(.displayName) (\(.email)) - \(.created_at)"' 2>/dev/null
    fi
    
    # 檢查過去24小時的申請
    yesterday=$(date -v-1d '+%Y-%m-%d' 2>/dev/null || date -d '1 day ago' '+%Y-%m-%d' 2>/dev/null || date '+%Y-%m-%d')
    recent=$(cat ../backend/data/affiliate.json | jq --arg yesterday "$yesterday" '.applications[] | select(.created_at >= $yesterday)' 2>/dev/null | jq -s length 2>/dev/null || echo "0")
    
    echo "📊 過去24小時申請數量: $recent 個"
else
    echo "❌ 無法檢查，資料檔案不存在"
fi

echo ""
echo "🎯 結論:"
echo "========"

if [ -f "../backend/data/affiliate.json" ] && [ "$applications" -gt 0 ]; then
    echo "📈 目前系統中有 $applications 個待審核的聯盟會員申請"
    echo "🔗 管理後台: http://localhost:8000/tw/affiliate-admin/login"
    echo "👤 管理員帳號: admin@local.dev / MySecure2024Admin"
    echo ""
    echo "待審核申請列表:"
    cat ../backend/data/affiliate.json | jq -r '.applications[] | "• \(.displayName) (\(.email))"' 2>/dev/null
else
    echo "📝 目前沒有新的聯盟會員申請"
    echo "🔗 註冊頁面: http://localhost:8000/tw/affiliate/register"
fi

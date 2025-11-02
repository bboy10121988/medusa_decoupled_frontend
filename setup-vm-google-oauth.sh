#!/bin/bash

# VM Google OAuth 測試指令
# 使用方式: 在 VM 上執行這個腳本

echo "🚀 開始在 VM 上部署和測試 Google OAuth"
echo "========================================="
echo ""

# 1. 進入前端目錄
echo "1️⃣ 進入前端目錄..."
cd ~/tim-web/medusa_decoupled/frontend || exit 1
echo "   ✅ 當前目錄: $(pwd)"
echo ""

# 2. 拉取最新代碼
echo "2️⃣ 拉取最新代碼..."
git pull origin main
echo ""

# 3. 檢查 commit
echo "3️⃣ 檢查最新 commit..."
git log -1 --oneline
echo ""

# 4. 安裝依賴（如果需要）
echo "4️⃣ 檢查依賴..."
if [ -f "package.json" ]; then
    echo "   發現 package.json，檢查是否需要安裝依賴..."
    # npm install --if-present
    echo "   ⏭️  跳過依賴安裝（假設已安裝）"
else
    echo "   ❌ 找不到 package.json"
    exit 1
fi
echo ""

# 5. 檢查環境變數
echo "5️⃣ 檢查環境變數..."
if [ -f ".env" ]; then
    echo "   ✅ .env 文件存在"
    echo "   檢查關鍵環境變數:"
    grep -E "NEXT_PUBLIC_MEDUSA_BACKEND_URL|NEXT_PUBLIC_BASE_URL" .env | sed 's/=.*/=***/'
else
    echo "   ❌ 找不到 .env 文件"
fi
echo ""

# 6. 重啟前端服務
echo "6️⃣ 重啟前端服務..."
echo "   請手動執行以下命令之一:"
echo ""
echo "   方式 1 - 使用 PM2:"
echo "   pm2 restart frontend"
echo ""
echo "   方式 2 - 使用 systemctl:"
echo "   sudo systemctl restart frontend"
echo ""
echo "   方式 3 - 開發模式:"
echo "   npm run dev"
echo ""

# 7. 等待服務啟動
echo "7️⃣ 等待服務啟動 (10秒)..."
sleep 10
echo ""

# 8. 測試服務
echo "8️⃣ 測試前端服務..."
FRONTEND_URL="http://localhost:3000"

# 測試首頁
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" $FRONTEND_URL/tw)
if [ "$HTTP_CODE" = "200" ]; then
    echo "   ✅ 前端服務運行正常 (HTTP $HTTP_CODE)"
else
    echo "   ⚠️  前端服務回應碼: HTTP $HTTP_CODE"
fi
echo ""

# 9. 測試 Google OAuth
echo "9️⃣ 測試 Google OAuth 整合..."
if [ -f "check-google-oauth.sh" ]; then
    echo "   執行 Google OAuth 檢查..."
    chmod +x check-google-oauth.sh
    ./check-google-oauth.sh
else
    echo "   ⚠️  找不到 check-google-oauth.sh"
fi
echo ""

# 10. 顯示測試 URL
echo "========================================="
echo "✅ 部署完成！"
echo ""
echo "📝 測試步驟:"
echo "   1. 打開瀏覽器訪問:"
echo "      https://your-vm-domain.com/tw/account"
echo ""
echo "   2. 點擊 '使用 Google 登入' 按鈕"
echo ""
echo "   3. 完成 Google 認證流程"
echo ""
echo "   4. 檢查是否成功登入並重定向到帳戶頁面"
echo ""
echo "📖 詳細文檔: GOOGLE_OAUTH_INTEGRATION_STATUS.md"
echo ""
echo "⚠️  重要提示:"
echo "   若遇到問題，請回到前一個 commit:"
echo "   git checkout HEAD~1"
echo ""

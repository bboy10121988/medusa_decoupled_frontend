#!/bin/bash

# 備用部署腳本 - 使用標準 SSH
VM_IP="35.236.182.29"
VM_PORT="8000"
VM_PATH="/tw"
VM_URL="http://${VM_IP}:${VM_PORT}${VM_PATH}"
SSH_USER="ubuntu"  # 或其他用戶名
VM_PROJECT_PATH="/var/www/medusa-frontend"

echo "🚀 開始部署到 VM: ${VM_URL}"
echo "=================================="

# 檢查 VM 連線狀態
echo "📡 檢查 VM 連線狀態..."
if curl -f -s "${VM_URL}" > /dev/null; then
    echo "✅ VM 連線正常"
else
    echo "⚠️  VM 連線可能有問題，但繼續部署..."
fi

# 首先本地建置
echo "🏗️  本地建置專案..."
npm run build

if [ ! -d ".next" ]; then
    echo "❌ 本地建置失敗，請檢查錯誤"
    exit 1
fi

echo "✅ 本地建置成功"

# 創建部署包
echo "📦 創建部署包..."
tar -czf deploy.tar.gz \
    .next \
    public \
    package.json \
    package-lock.json \
    next.config.js \
    schemas \
    sanity.config.ts \
    sanity.cli.ts \
    tailwind.config.js \
    postcss.config.js \
    tsconfig.json

echo "✅ 部署包創建完成"

# 上傳到 VM
echo "📤 上傳到 VM..."
scp -o StrictHostKeyChecking=no deploy.tar.gz ${SSH_USER}@${VM_IP}:~/

echo "🚀 在 VM 上執行部署..."
ssh -o StrictHostKeyChecking=no ${SSH_USER}@${VM_IP} << EOF
    set -e
    echo "📁 準備部署目錄..."
    
    # 創建備份
    if [ -d "${VM_PROJECT_PATH}" ]; then
        sudo cp -r "${VM_PROJECT_PATH}" "${VM_PROJECT_PATH}.backup.\$(date +%Y%m%d_%H%M%S)"
        echo "✅ 已創建備份"
    fi
    
    # 創建/準備目錄
    sudo mkdir -p "${VM_PROJECT_PATH}"
    sudo chown \$(whoami):\$(whoami) "${VM_PROJECT_PATH}"
    
    echo "📥 解壓部署包..."
    cd "${VM_PROJECT_PATH}"
    tar -xzf ~/deploy.tar.gz
    
    echo "📦 安裝生產依賴..."
    npm ci --production --silent
    
    echo "🔧 設定權限..."
    sudo chown -R www-data:www-data "${VM_PROJECT_PATH}" || true
    sudo chmod -R 755 "${VM_PROJECT_PATH}" || true
    
    echo "🔄 重啟服務..."
    sudo systemctl restart nginx || echo "Nginx 重啟失敗或不存在"
    sudo pm2 restart medusa-frontend || pm2 start npm --name "medusa-frontend" -- start || echo "PM2 重啟失敗"
    
    echo "✅ VM 部署完成"
    
    # 清理上傳的檔案
    rm -f ~/deploy.tar.gz
EOF

# 清理本地臨時文件
rm -f deploy.tar.gz

echo ""
echo "🎉 部署流程完成！"
echo "🌐 網站地址: ${VM_URL}"
echo ""
echo "🧪 測試部署..."
sleep 5

# 測試網站是否正常
if curl -f -s "${VM_URL}" > /dev/null; then
    echo "✅ 網站運行正常！"
    echo "🎊 聯盟會員系統部署成功"
else
    echo "⚠️  網站可能需要幾分鐘啟動，請稍後檢查"
    echo "🔍 如有問題，請檢查 VM 日誌"
fi

echo ""
echo "📋 部署後檢查清單:"
echo "  ✓ 檢查網站: ${VM_URL}"
echo "  ✓ 測試聯盟會員登入功能"
echo "  ✓ 檢查 VM 服務狀態"
echo "  ✓ 確認 SSL 憑證（如有使用）"

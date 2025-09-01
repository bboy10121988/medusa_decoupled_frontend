#!/bin/bash

# VM 問題診斷和修復腳本
GCLOUD_ZONE="asia-east1-c"
GCLOUD_INSTANCE="tim-web-dev"
GCLOUD_PROJECT="graphite-bliss-468913-c3"
VM_PROJECT_PATH="/var/www/medusa-frontend"

echo "🔍 診斷 VM 問題..."

# 連接到 VM 並檢查問題
gcloud compute ssh ${GCLOUD_INSTANCE} \
    --zone=${GCLOUD_ZONE} \
    --project=${GCLOUD_PROJECT} \
    --command="
        echo '🔍 檢查 Node.js 進程...'
        ps aux | grep node | head -5
        
        echo ''
        echo '🔍 檢查端口使用情況...'
        sudo netstat -tlnp | grep :8000 || echo 'Port 8000 not in use'
        sudo netstat -tlnp | grep :9000 || echo 'Port 9000 not in use'
        sudo netstat -tlnp | grep :3000 || echo 'Port 3000 not in use'
        
        echo ''
        echo '🔍 檢查專案目錄...'
        ls -la ${VM_PROJECT_PATH}/
        
        echo ''
        echo '🔍 檢查環境變數文件...'
        ls -la ${VM_PROJECT_PATH}/.env* || echo 'No .env files found'
        
        echo ''
        echo '🔍 檢查 PM2 狀態...'
        pm2 list || echo 'PM2 not installed or not running'
        
        echo ''
        echo '🔍 檢查系統服務...'
        sudo systemctl status nginx || echo 'Nginx not running'
        
        echo ''
        echo '🔍 檢查日誌 (最後 10 行)...'
        sudo journalctl -u nginx -n 10 || echo 'No nginx logs'
        
        echo ''
        echo '🔍 測試本地連接...'
        curl -I http://localhost:8000/tw/ || echo 'Cannot connect to port 8000'
        curl -I http://localhost:3000/tw/ || echo 'Cannot connect to port 3000'
    "

echo ""
echo "🔧 建議修復步驟："
echo "1. 安裝 PM2: npm install -g pm2"
echo "2. 啟動應用: pm2 start 'npm start' --name medusa-frontend"
echo "3. 配置環境變數"
echo "4. 檢查 Nginx 配置"

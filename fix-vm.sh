#!/bin/bash

# VM 修復腳本
GCLOUD_ZONE="asia-east1-c"
GCLOUD_INSTANCE="tim-web-dev"
GCLOUD_PROJECT="graphite-bliss-468913-c3"
VM_PROJECT_PATH="/var/www/medusa-frontend"

echo "🔧 修復 VM 上的問題..."

# 創建環境變數檔案
echo "📝 創建生產環境變數檔案..."
cat > .env.production << 'EOF'
# 生產環境變數
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_BASE_URL=http://35.236.182.29:8000
MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_DEFAULT_REGION=tw
NEXT_PUBLIC_STORE_NAME="Tim Web Store"

# Sanity 設定
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production

# 其他設定
NODE_ENV=production
PORT=3000
EOF

# 上傳環境變數和啟動腳本
echo "📤 上傳環境變數和配置..."
gcloud compute scp .env.production ${GCLOUD_INSTANCE}:~/.env.production \
    --zone=${GCLOUD_ZONE} \
    --project=${GCLOUD_PROJECT}

# 在 VM 上安裝 PM2 和啟動應用
echo "🚀 在 VM 上安裝 PM2 並啟動應用..."
gcloud compute ssh ${GCLOUD_INSTANCE} \
    --zone=${GCLOUD_ZONE} \
    --project=${GCLOUD_PROJECT} \
    --command="
        set -e
        
        echo '📦 安裝 PM2...'
        sudo npm install -g pm2
        
        echo '📝 設置環境變數...'
        sudo cp ~/.env.production ${VM_PROJECT_PATH}/.env.production
        sudo chown www-data:www-data ${VM_PROJECT_PATH}/.env.production
        
        echo '📁 進入專案目錄...'
        cd ${VM_PROJECT_PATH}
        
        echo '🔍 檢查 package.json 中的 scripts...'
        cat package.json | grep -A 5 '\"scripts\"'
        
        echo '🚀 使用 PM2 啟動應用...'
        sudo pm2 delete medusa-frontend || true
        sudo pm2 start npm --name 'medusa-frontend' -- start
        sudo pm2 save
        sudo pm2 startup
        
        echo '✅ PM2 狀態:'
        sudo pm2 list
        
        echo '🔍 測試應用是否運行...'
        sleep 5
        curl -I http://localhost:3000/ || echo 'Port 3000 not ready yet'
        
        echo '🔧 更新 Nginx 配置以代理到 Node.js...'
        sudo tee /etc/nginx/sites-available/medusa-frontend << 'NGINX_EOF'
server {
    listen 8000;
    server_name _;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \\\$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \\\$host;
        proxy_set_header X-Real-IP \\\$remote_addr;
        proxy_set_header X-Forwarded-For \\\$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \\\$scheme;
        proxy_cache_bypass \\\$http_upgrade;
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
    }
}
NGINX_EOF
        
        echo '🔗 啟用 Nginx 配置...'
        sudo ln -sf /etc/nginx/sites-available/medusa-frontend /etc/nginx/sites-enabled/
        sudo rm -f /etc/nginx/sites-enabled/default
        
        echo '🔄 重啟 Nginx...'
        sudo nginx -t
        sudo systemctl restart nginx
        
        echo '✅ 配置完成!'
    "

# 清理本地暫存檔案
rm -f .env.production

echo ""
echo "🎉 修復完成！等待 30 秒後測試..."
sleep 30

echo "🧪 測試網站..."
if curl -f -s "http://35.236.182.29:8000/tw" > /dev/null; then
    echo "✅ 網站正常運行!"
    
    echo "🧪 測試聯盟會員頁面..."
    curl -I "http://35.236.182.29:8000/tw/affiliate" | head -5
else
    echo "⚠️  網站可能需要更多時間啟動，請稍後檢查"
fi

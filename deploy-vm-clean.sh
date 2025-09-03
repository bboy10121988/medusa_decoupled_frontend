#!/bin/bash

# 清理和部署 VM - 極簡版本
set -e

echo "🧹 開始清理和部署 VM..."

VM_USER="raychou"
VM_HOST="35.236.182.29"
VM_PATH="/var/www/medusa-frontend"

echo "📦 創建乾淨的部署包..."
# 創建臨時目錄
TEMP_DIR=$(mktemp -d)
echo "臨時目錄: $TEMP_DIR"

# 複製必要檔案，排除不需要的檔案
rsync -av \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='*.log' \
  --exclude='.env.local' \
  --exclude='.DS_Store' \
  --exclude='._*' \
  --exclude='*.tmp' \
  --exclude='*.cache' \
  --exclude='.turbo' \
  --exclude='coverage' \
  --exclude='dist' \
  --exclude='build' \
  ./ "$TEMP_DIR/"

echo "🚀 部署到 VM..."

# 完全清理 VM 上的檔案
gcloud compute ssh tim-web-dev --command="
  sudo rm -rf $VM_PATH &&
  sudo mkdir -p $VM_PATH &&
  sudo chown -R $VM_USER:$VM_USER $VM_PATH
"

# 上傳乾淨的檔案
gcloud compute scp --recurse "$TEMP_DIR"/* tim-web-dev:$VM_PATH/

# 在 VM 上安裝依賴和建置
gcloud compute ssh tim-web-dev --command="
  cd $VM_PATH &&
  npm ci &&
  npm run build &&
  sudo chown -R www-data:www-data .next public &&
  sudo pm2 delete frontend-8000 || true &&
  sudo pm2 start npm --name 'frontend-8000' -- start -- --port 8000 &&
  sudo pm2 save
"

# 清理本地臨時檔案
rm -rf "$TEMP_DIR"

echo "✅ 部署完成！"
echo "🌐 網站: http://35.236.182.29:8000/tw"

# 測試連接
echo "🧪 測試連接..."
sleep 10
if curl -s -o /dev/null -w "%{http_code}" "http://35.236.182.29:8000/tw" | grep -q "200\|301\|302"; then
  echo "✅ 網站運行正常"
else
  echo "⚠️  網站可能還在啟動中，請稍後檢查"
fi

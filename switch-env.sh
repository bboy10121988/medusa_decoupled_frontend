#!/bin/bash

# 環境切換腳本
# 使用方法: ./switch-env.sh local 或 ./switch-env.sh vm

set -e

ENV_FILE=".env.local"

if [ "$1" = "local" ]; then
    echo "🔄 切換到本機環境..."
    
    # 更新環境模式
    sed -i '' 's/NEXT_PUBLIC_ENV_MODE=.*/NEXT_PUBLIC_ENV_MODE=local/' "$ENV_FILE"
    
    # 更新後端 URLs
    sed -i '' 's/MEDUSA_BACKEND_URL=.*/MEDUSA_BACKEND_URL=http:\/\/localhost:9000/' "$ENV_FILE"
    sed -i '' 's/NEXT_PUBLIC_MEDUSA_BACKEND_URL=.*/NEXT_PUBLIC_MEDUSA_BACKEND_URL=http:\/\/localhost:9000/' "$ENV_FILE"
    sed -i '' 's/NEXT_PUBLIC_MEDUSA_ADMIN_URL=.*/NEXT_PUBLIC_MEDUSA_ADMIN_URL=http:\/\/localhost:9000/' "$ENV_FILE"
    
    # 更新 Publishable Key
    LOCAL_KEY=$(grep "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY_LOCAL=" "$ENV_FILE" | cut -d'=' -f2)
    sed -i '' "s/NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_.*/NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=$LOCAL_KEY/" "$ENV_FILE"
    
    # 更新媒體 URL
    sed -i '' 's/NEXT_PUBLIC_MEDIA_URL=.*/NEXT_PUBLIC_MEDIA_URL=http:\/\/localhost:9000/' "$ENV_FILE"
    
    echo "✅ 已切換到本機環境 (localhost:9000)"
    
elif [ "$1" = "vm" ]; then
    echo "🔄 切換到 VM 環境..."
    
    # 檢查是否已設定 VM URLs（如果還有佔位符就退出）
    if grep -q "your-vm-ip" "$ENV_FILE"; then
        echo "⚠️  請先在 .env.local 中設定你的 VM IP 地址"
        exit 1
    fi
    
    # 更新環境模式
    sed -i '' 's/NEXT_PUBLIC_ENV_MODE=.*/NEXT_PUBLIC_ENV_MODE=vm/' "$ENV_FILE"
    
    # 從 VM 設定中讀取 URLs
    VM_URL=$(grep "MEDUSA_BACKEND_URL_VM=" "$ENV_FILE" | cut -d'=' -f2)
    VM_MEDIA_URL=$(grep "NEXT_PUBLIC_MEDIA_URL_VM=" "$ENV_FILE" | cut -d'=' -f2)
    
    # 更新當前使用的 URLs
    sed -i '' "s|MEDUSA_BACKEND_URL=.*|MEDUSA_BACKEND_URL=$VM_URL|" "$ENV_FILE"
    sed -i '' "s|NEXT_PUBLIC_MEDUSA_BACKEND_URL=.*|NEXT_PUBLIC_MEDUSA_BACKEND_URL=$VM_URL|" "$ENV_FILE"
    sed -i '' "s|NEXT_PUBLIC_MEDUSA_ADMIN_URL=.*|NEXT_PUBLIC_MEDUSA_ADMIN_URL=$VM_URL|" "$ENV_FILE"
    sed -i '' "s|NEXT_PUBLIC_MEDIA_URL=.*|NEXT_PUBLIC_MEDIA_URL=$VM_MEDIA_URL|" "$ENV_FILE"
    
    # 更新 Publishable Key
    VM_KEY=$(grep "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY_VM=" "$ENV_FILE" | cut -d'=' -f2)
    if [ "$VM_KEY" != "pk_your_vm_publishable_key_here" ]; then
        sed -i '' "s/NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_.*/NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=$VM_KEY/" "$ENV_FILE"
        echo "✅ 已切換到 VM 環境 ($VM_URL)"
    else
        echo "⚠️  請先在 .env.local 中設定 VM 的 Publishable Key"
    fi
    
else
    echo "使用方法:"
    echo "  ./switch-env.sh local  - 切換到本機環境"
    echo "  ./switch-env.sh vm     - 切換到 VM 環境"
    exit 1
fi

echo ""
echo "🔍 當前環境設定:"
echo "   後端: $(grep "NEXT_PUBLIC_MEDUSA_BACKEND_URL=" "$ENV_FILE" | cut -d'=' -f2)"
echo "   Key: $(grep "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=" "$ENV_FILE" | cut -d'=' -f2 | cut -c1-20)..."
echo ""
echo "💡 提示: 環境切換後請重新啟動前端服務"

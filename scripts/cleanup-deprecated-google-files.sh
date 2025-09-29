#!/bin/bash

echo "🧹 開始清理棄用的Google檔案..."

# 棄用的檔案列表
DEPRECATED_FILES=(
  "src/lib/data/google-auth.ts"
  "src/app/api/medusa/auth/google/route.ts" 
  "src/app/api/medusa/auth/google/callback/route.ts"
  "src/app/tw/auth/google/callback/page.tsx"
  "src/modules/account/components/google-login-button/index.tsx"
  "google_login.drawio"
)

# 備份目錄
BACKUP_DIR="backup/deprecated-google-files-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "📦 備份檔案到 $BACKUP_DIR"

for file in "${DEPRECATED_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "  備份: $file"
    mkdir -p "$BACKUP_DIR/$(dirname "$file")"
    cp "$file" "$BACKUP_DIR/$file"
  else
    echo "  跳過 (不存在): $file"
  fi
done

echo ""
echo "⚠️  準備刪除以下檔案："
for file in "${DEPRECATED_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "  - $file"
  fi
done

echo ""
read -p "確定要刪除這些檔案嗎? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
  for file in "${DEPRECATED_FILES[@]}"; do
    if [ -f "$file" ]; then
      echo "🗑️  刪除: $file"
      rm "$file"
    fi
  done
  
  echo ""
  echo "✅ 清理完成！"
  echo "📦 備份檔案已保存在: $BACKUP_DIR"
  echo ""
  echo "🔧 接下來需要手動更新："
  echo "  - src/modules/account/templates/login-template.tsx (移除GoogleLoginButton導入)"
else
  echo "❌ 取消清理"
fi

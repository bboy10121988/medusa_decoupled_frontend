#!/bin/bash

echo "🔥 停止所有 PM2 進程..."

# 複製到 VM 並執行
scp -o StrictHostKeyChecking=no << 'SCRIPT' raychou@35.236.182.29:/tmp/kill-pm2.sh
#!/bin/bash
pm2 kill
pm2 list
echo "✅ PM2 已清理完成"
SCRIPT

# 執行腳本
ssh -o StrictHostKeyChecking=no raychou@35.236.182.29 "chmod +x /tmp/kill-pm2.sh && /tmp/kill-pm2.sh"

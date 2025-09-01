# 環境切換指南

## 🚀 快速切換環境

### 方法 1：使用 npm 腳本（推薦）
```bash
# 切換到本機環境
npm run switch:local

# 切換到 VM 環境（需要先設定 VM 資訊）
npm run switch:vm

# 檢查當前環境
npm run env:status
```

### 方法 2：直接使用腳本
```bash
# 切換到本機環境
./switch-env.sh local

# 切換到 VM 環境
./switch-env.sh vm
```

## ⚙️ VM 環境設定

在 `.env.local` 中更新以下設定：

1. **設定你的 VM IP 或域名**：
```bash
# 將 "your-vm-ip" 替換成實際的 VM IP
MEDUSA_BACKEND_URL_VM=http://192.168.1.100:9000
NEXT_PUBLIC_MEDUSA_BACKEND_URL_VM=http://192.168.1.100:9000
NEXT_PUBLIC_MEDUSA_ADMIN_URL_VM=http://192.168.1.100:9000
NEXT_PUBLIC_MEDIA_URL_VM=http://192.168.1.100:9000
```

2. **從 VM 後台獲取 Publishable Key**：
   - 訪問 `http://你的VM-IP:9000/app`
   - 登入後台 → Settings → API Keys
   - 建立或複製 Publishable Key
   - 更新 `.env.local`：
```bash
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY_VM=pk_你從VM獲取的key
```

## 🔍 環境狀態檢查

### 本機環境
- 後端：http://localhost:9000
- 管理後台：http://localhost:9000/app
- 前端：http://localhost:8000
- Publishable Key：pk_06a1d9f1e084ae6eaa1696b4b058f2dd37e80bdd84e7d0fec6a7a1d04dd9497b

### VM 環境
- 後端：http://你的VM-IP:9000
- 管理後台：http://你的VM-IP:9000/app
- 前端：http://localhost:8000（前端仍在本機）
- Publishable Key：需要從 VM 後台獲取

## 🔄 切換流程

1. **執行切換命令**
2. **重新啟動前端服務**（重要！）
3. **驗證連接**

```bash
# 範例：切換到本機環境
npm run switch:local
npm run dev  # 重新啟動前端
```

## 💡 提示

- 每次切換環境後都需要重新啟動前端服務
- 可以使用 `npm run env:status` 快速檢查當前環境
- 建議在不同終端視窗中分別運行本機和 VM 後端

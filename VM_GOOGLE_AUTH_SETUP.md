# VM Google Cloud 驗證設定指南

## 適用對象
遠端工程師需要在 VM `tims-web` 上使用 Google Cloud 服務

## VM 資訊
- **專案**: social-login-341607
- **區域**: asia-east1-c
- **VM名稱**: tims-web

## 設定步驟

### 方法1：使用個人Google帳號（推薦）

#### 步驟1：連接到VM
```bash
gcloud compute ssh --zone "asia-east1-c" "tims-web" --project "social-login-341607"
```

#### 步驟2：在VM內執行授權
```bash
gcloud auth login --no-browser
```

#### 步驟3：在本地機器執行授權
系統會提供一個命令，類似：
```bash
gcloud auth login --remote-bootstrap="[長URL]"
```

將這個命令複製到你的**本地機器**（有瀏覽器的電腦）執行。

#### 步驟4：完成授權
- 瀏覽器會開啟Google授權頁面
- 使用你的Google帳號 `clubrabbit0408@gmail.com` 登入
- 複製授權完成後的URL回到VM的terminal

#### 步驟5：驗證授權
```bash
gcloud auth list
gcloud config set account clubrabbit0408@gmail.com
```

### 方法2：使用服務帳號金鑰（已設定好）

VM上已經有預設的服務帳號可以使用：

```bash
# 切換到clubrabbit服務帳號
gcloud config set account clubrabbit-service@social-login-341607.iam.gserviceaccount.com

# 或切換到textsence服務帳號
gcloud config set account textsence-service@social-login-341607.iam.gserviceaccount.com
```

### 方法3：設定應用程式預設憑證

如果需要讓應用程式自動使用你的憑證：

```bash
gcloud auth application-default login --no-browser
```

然後按照類似方法1的步驟完成授權。

## 常用命令

### 檢查目前授權狀態
```bash
gcloud auth list
gcloud config get-value account
```

### 切換帳號
```bash
gcloud config set account [EMAIL]
```

### 使用特定帳號執行命令
```bash
gcloud --account=[EMAIL] [COMMAND]
```

## 權限說明

目前VM上已授權的帳號：
- `bboy10121988@gmail.com`
- `textsence.ai@gmail.com` 
- `timsfantasyworld@gmail.com`
- `clubrabbit-service@social-login-341607.iam.gserviceaccount.com`
- `textsence-service@social-login-341607.iam.gserviceaccount.com`

## 注意事項

1. **安全性**: 在VM上使用個人帳號時要注意安全，建議使用服務帳號
2. **權限範圍**: 確保你的帳號有足夠的權限訪問需要的GCP服務
3. **金鑰管理**: 如果使用服務帳號金鑰，請妥善保管金鑰文件

## 疑難排解

### 問題：無法連接到VM
```bash
# 檢查VM狀態
gcloud compute instances list --project="social-login-341607"

# 啟動VM（如果已停止）
gcloud compute instances start tims-web --zone="asia-east1-c" --project="social-login-341607"
```

### 問題：授權失敗
1. 確保gcloud版本是最新的：`gcloud version`
2. 更新gcloud：`gcloud components update`
3. 清除舊的授權：`gcloud auth revoke [EMAIL]`

### 問題：權限不足
聯繫專案管理員為你的帳號添加必要的IAM角色。

## 聯繫資訊
如有問題請聯繫專案管理員。
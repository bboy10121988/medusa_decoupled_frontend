#!/bin/bash

# VM Google Cloud 授權自動化腳本
# 使用方法: ./setup-vm-auth.sh [EMAIL]

set -e

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# VM配置
PROJECT_ID="social-login-341607"
ZONE="asia-east1-c"
VM_NAME="tims-web"

# 函數：印出彩色訊息
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 檢查參數
if [ $# -eq 0 ]; then
    print_error "請提供Google帳號email"
    echo "使用方法: $0 your-email@gmail.com"
    exit 1
fi

USER_EMAIL="$1"

print_info "開始為 $USER_EMAIL 設定VM授權..."

# 檢查gcloud是否已安裝
if ! command -v gcloud &> /dev/null; then
    print_error "gcloud CLI未安裝，請先安裝Google Cloud SDK"
    exit 1
fi

# 檢查是否已登入gcloud
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    print_warning "你需要先在本地登入gcloud"
    print_info "執行: gcloud auth login"
    exit 1
fi

# 檢查VM是否存在且正在運行
print_info "檢查VM狀態..."
VM_STATUS=$(gcloud compute instances describe $VM_NAME --zone=$ZONE --project=$PROJECT_ID --format="value(status)" 2>/dev/null || echo "NOT_FOUND")

if [ "$VM_STATUS" = "NOT_FOUND" ]; then
    print_error "VM $VM_NAME 不存在"
    exit 1
elif [ "$VM_STATUS" != "RUNNING" ]; then
    print_warning "VM $VM_NAME 狀態: $VM_STATUS"
    print_info "嘗試啟動VM..."
    gcloud compute instances start $VM_NAME --zone=$ZONE --project=$PROJECT_ID
    print_info "等待VM啟動..."
    sleep 30
fi

# 檢查用戶是否有足夠權限
print_info "檢查IAM權限..."
if ! gcloud projects get-iam-policy $PROJECT_ID --flatten="bindings[].members" --format="table(bindings.role)" --filter="bindings.members:user:$USER_EMAIL" | grep -q "roles/editor\|roles/owner"; then
    print_warning "用戶 $USER_EMAIL 可能沒有足夠的權限"
    print_info "嘗試添加編輯者權限..."
    gcloud projects add-iam-policy-binding $PROJECT_ID --member="user:$USER_EMAIL" --role="roles/editor"
fi

# 提供授權指令
print_info "請按照以下步驟完成授權："
echo ""
echo "1. 連接到VM："
echo "   gcloud compute ssh --zone \"$ZONE\" \"$VM_NAME\" --project \"$PROJECT_ID\""
echo ""
echo "2. 在VM中執行："
echo "   gcloud auth login --no-browser --account=$USER_EMAIL"
echo ""
echo "3. 複製提供的遠端授權命令到你的本地機器執行"
echo ""
echo "4. 完成授權後，在VM中驗證："
echo "   gcloud auth list"
echo "   gcloud config set account $USER_EMAIL"
echo ""

# 建立一個臨時腳本檔案供用戶使用
TEMP_SCRIPT="/tmp/vm-auth-commands.sh"
cat > $TEMP_SCRIPT << EOF
#!/bin/bash
# VM授權命令腳本 - 在VM中執行

echo "在VM中執行授權..."
gcloud auth login --no-browser --account=$USER_EMAIL

echo "驗證授權結果..."
gcloud auth list

echo "設定預設帳號..."
gcloud config set account $USER_EMAIL

echo "顯示目前活躍帳號..."
gcloud config get-value account

echo "授權完成！"
EOF

chmod +x $TEMP_SCRIPT

print_info "已建立VM授權腳本: $TEMP_SCRIPT"
print_info "你可以將此腳本複製到VM中執行"

# 提供複製腳本到VM的命令
echo ""
echo "複製腳本到VM："
echo "gcloud compute scp $TEMP_SCRIPT $VM_NAME:/tmp/vm-auth.sh --zone=\"$ZONE\" --project=\"$PROJECT_ID\""
echo ""
echo "在VM中執行腳本："
echo "gcloud compute ssh --zone \"$ZONE\" \"$VM_NAME\" --project \"$PROJECT_ID\" --command=\"chmod +x /tmp/vm-auth.sh && /tmp/vm-auth.sh\""

print_info "設定完成！"
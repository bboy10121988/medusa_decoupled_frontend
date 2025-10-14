/**
 * 支付組件錯誤修復 - 確保 RadioGroup 不會從受控變為非受控
 * 
 * 修復項目:
 * 1. 硬編碼支付方式 ID，避免 undefined 值
 * 2. 增強 selectedPaymentMethod 初始化
 * 3. 在 RadioGroup 中添加回退值
 * 4. 在 setPaymentMethod 中添加空值檢查
 */

// 修復前的問題：
// - payment_method_default 和 payment_method_ecpay_credit 來自未定義的環境變數
// - selectedPaymentMethod 可能會變成 undefined
// - RadioGroup 從受控狀態變為非受控狀態

// 修復後的改進：
// 1. 使用硬編碼的支付方式 ID
const payment_method_default = "manual_manual"
const payment_method_ecpay_credit = "ecpay_credit_card"

// 2. 確保初始值不為空
const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
  activeSession?.provider_id || payment_method_ecpay_credit
)

// 3. RadioGroup 使用回退值
<RadioGroup 
  value={selectedPaymentMethod || payment_method_ecpay_credit} 
  onChange={setPaymentMethod}
>

// 4. setPaymentMethod 增加空值檢查
const setPaymentMethod = async (method: string) => {
  if (method) {
    setSelectedPaymentMethod(method)
  }
}

console.log("✅ 支付組件錯誤修復完成")
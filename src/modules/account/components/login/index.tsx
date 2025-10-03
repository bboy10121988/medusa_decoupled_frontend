import { login } from "@lib/data/customer"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import { useActionState, useState } from "react"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

interface EmailCheckResult {
  exists: boolean
  authProvider: 'password' | null
  message: string
}

const Login = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(login, null)
  const [emailCheckResult, setEmailCheckResult] = useState<EmailCheckResult | null>(null)
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)

  const checkEmail = async (email: string) => {
    if (!email || !email.includes('@')) {
      setEmailCheckResult(null)
      return
    }

    setIsCheckingEmail(true)
    try {
      const response = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        const result = await response.json()
        setEmailCheckResult(result)
      }
    } catch (error) {
      console.error('檢查 email 失敗:', error)
    } finally {
      setIsCheckingEmail(false)
    }
  }

  return (
    <div
      className="max-w-sm w-full flex flex-col items-center"
      data-testid="login-page"
    >
      {/* 移除重複的標題，因為在 LoginTemplate 中已經有了 */}
      <form className="w-full" action={formAction}>
        <div className="flex flex-col w-full gap-y-2">
          <Input
            label="電子郵件"
            name="email"
            type="email"
            title="請輸入有效的電子郵件地址。"
            autoComplete="email"
            required
            data-testid="email-input"
            onBlur={(e) => checkEmail(e.target.value)}
          />
          
          {/* 顯示 email 檢查結果 */}
          {isCheckingEmail && (
            <div className="text-sm text-gray-500">
              檢查帳戶狀態中...
            </div>
          )}
          
          {emailCheckResult?.exists && emailCheckResult.authProvider === 'password' && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <p className="text-sm text-green-700">
                ✅ 此電子郵件可使用密碼登入
              </p>
            </div>
          )}
          
          {emailCheckResult && !emailCheckResult.exists && (
            <div className="bg-orange-50 border border-orange-200 rounded-md p-3">
              <p className="text-sm text-orange-700">
                ℹ️ 此電子郵件尚未註冊，請先註冊帳戶
              </p>
            </div>
          )}
          
          <Input
            label="密碼"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            data-testid="password-input"
            disabled={false}
          />
        </div>
        <ErrorMessage error={message} data-testid="login-error-message" />
        
        <SubmitButton 
          data-testid="sign-in-button" 
          className="w-full mt-6"
        >
          登入
        </SubmitButton>
      </form>
      <span className="text-center text-ui-fg-base text-small-regular mt-6">
        還不是會員？{" "}
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.REGISTER)}
          className="underline"
          data-testid="register-button"
        >
          立即加入
        </button>
        。
      </span>
    </div>
  )
}

export default Login

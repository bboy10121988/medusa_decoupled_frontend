import { login } from "@lib/data/customer"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import { useActionState } from "react"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Login = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(login, null)

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
          />
          <Input
            label="密碼"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            data-testid="password-input"
          />
        </div>
        <ErrorMessage error={message} data-testid="login-error-message" />
        
        {/* 如果是 Google 登入相關錯誤，顯示特別提示 */}
        {message?.includes("Google") && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mt-2">
            <p className="text-sm text-blue-700">
              💡 提示：如果您之前使用 Google 登入註冊，請使用上方的「使用 Google 登入」按鈕。
            </p>
          </div>
        )}
        
        <SubmitButton data-testid="sign-in-button" className="w-full mt-6">
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

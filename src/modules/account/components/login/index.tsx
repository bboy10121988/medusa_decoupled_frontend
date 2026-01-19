import { login } from "@lib/data/customer"
import { accountTranslations, getTranslation } from "@/lib/translations"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import { useActionState, useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useAccount } from "@lib/context/account-context"

import GoogleLoginButton from "@modules/account/components/google-login-button"
type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

interface EmailCheckResult {
  exists: boolean
  authProvider: 'password' | null
  message: string
}

const Login = ({ setCurrentView }: Props) => {
  const [result, formAction] = useActionState(login, null)
  const { refreshCustomer } = useAccount()
  const params = useParams()
  const countryCode = (params.countryCode as string) || 'tw'

  const t = accountTranslations[countryCode as keyof typeof accountTranslations] || accountTranslations.tw
  const tCommon = getTranslation(countryCode)

  // 處理登入成功
  useEffect(() => {
    if (result === "login_success") {
      // console.log("🎉 登入成功，刷新客戶狀態並重定向")

      const handleSuccess = async () => {
        try {
          await refreshCustomer()
          // 給 cookie 一點時間生效
          setTimeout(() => {
            window.location.href = `/${countryCode}/account`
          }, 500)
        } catch (error) {
          // console.error("刷新客戶狀態失敗:", error)
          // 即使刷新失敗，也嘗試重定向
          setTimeout(() => {
            window.location.href = `/${countryCode}/account`
          }, 500)
        }
      }

      handleSuccess()
    }
  }, [result, refreshCustomer, countryCode])

  // 錯誤訊息：如果不是成功狀態，就當作錯誤訊息
  const errorMessage = result && result !== "login_success" ? result : null
  const [emailCheckResult, setEmailCheckResult] = useState<EmailCheckResult | null>(null)
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)

  const checkEmail = async (email: string) => {
    if (!email?.includes('@')) {
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
      // console.error('檢查 email 失敗:', error)
    } finally {
      setIsCheckingEmail(false)
    }
  }

  return (
    <div
      className="max-w-sm w-full flex flex-col items-center"
      data-testid="login-page"
    >
      {/* Google 登入按鈕與分隔線 */}
      <div className="w-full flex flex-col items-center mb-6">
        <GoogleLoginButton />
        <div className="w-full flex items-center gap-x-2 my-4">
          <div className="flex-grow h-px bg-gray-200"></div>
          <span className="text-ui-fg-base text-small-regular">{t.or}</span>
          <div className="flex-grow h-px bg-gray-200"></div>
        </div>
      </div>


      {/* 移除重複的標題，因為在 LoginTemplate 中已經有了 */}
      <form className="w-full" action={formAction}>
        <div className="flex flex-col w-full gap-y-2">
          <Input
            label={t.email}
            name="email"
            type="email"
            title={t.emailValidation}
            autoComplete="email"
            required
            data-testid="email-input"
            onBlur={(e) => checkEmail(e.target.value)}
          />

          {/* 顯示 email 檢查結果 */}
          {isCheckingEmail && (
            <div className="text-sm text-gray-500">
              {t.checkingAccount}
            </div>
          )}

          {emailCheckResult?.exists && emailCheckResult.authProvider === 'password' && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <p className="text-sm text-green-700">
                ✅ {t.emailCanLogin}
              </p>
            </div>
          )}

          {emailCheckResult && !emailCheckResult.exists && (
            <div className="bg-orange-50 border border-orange-200 rounded-md p-3">
              <p className="text-sm text-orange-700">
                ℹ️ {t.emailNotRegistered}
              </p>
            </div>
          )}

          <Input
            label={t.password}
            name="password"
            type="password"
            autoComplete="current-password"
            required
            data-testid="password-input"
            disabled={false}
          />
        </div>

        {/* 忘記密碼連結 */}
        <div className="flex justify-end mb-4">
          <button
            type="button"
            onClick={() => window.location.href = '/tw/forgot-password'}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            {t.forgotPassword}
          </button>
        </div>

        <ErrorMessage error={errorMessage} data-testid="login-error-message" />

        <SubmitButton
          data-testid="sign-in-button"
          className="w-full mt-6"
        >
          {t.signIn}
        </SubmitButton>
      </form>
      <span className="text-center text-ui-fg-base text-small-regular mt-6">
        {t.notAMember}{" "}
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.REGISTER)}
          className="underline"
          data-testid="register-button"
        >
          {t.joinNow}
        </button>
        。
      </span>

    </div>
  )
}

export default Login

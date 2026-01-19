"use client"

import { useActionState, useEffect } from "react"
// import { useRouter } from "next/navigation"
import Input from "@modules/common/components/input"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { signup } from "@lib/data/customer"
import { useAccount } from "@lib/context/account-context"

import { useParams } from "next/navigation"
import { accountTranslations } from "@/lib/translations"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Register = ({ setCurrentView }: Props) => {
  const [result, formAction] = useActionState(signup, null)
  // const router = useRouter()
  const { refreshCustomer } = useAccount()
  const params = useParams()
  const countryCode = (params?.countryCode as string) || 'tw'
  const t = accountTranslations[countryCode as keyof typeof accountTranslations] || accountTranslations.tw

  // 處理註冊成功
  useEffect(() => {
    if (result && typeof result === 'object' && result.id) {
      // 註冊成功，result 是客戶對象
      // console.log("🎉 註冊成功，刷新客戶狀態並重定向")

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

  // 錯誤訊息：如果 result 是字符串，那就是錯誤訊息
  const errorMessage = typeof result === 'string' ? result : null

  return (
    <div
      className="max-w-sm flex flex-col items-center"
      data-testid="register-page"
    >
      <h1 className="text-large-semi uppercase mb-6">
        {t.becomeAMember}
      </h1>
      <p className="text-center text-base-regular text-ui-fg-base mb-4">
        {t.registerDescription}
      </p>
      <form className="w-full flex flex-col" action={formAction}>
        <div className="flex flex-col w-full gap-y-2">
          <Input
            label={t.firstName}
            name="first_name"
            required
            autoComplete="given-name"
            data-testid="first-name-input"
          />
          <Input
            label={t.lastName}
            name="last_name"
            required
            autoComplete="family-name"
            data-testid="last-name-input"
          />
          <Input
            label={t.email}
            name="email"
            required
            type="email"
            autoComplete="email"
            data-testid="email-input"
          />
          <Input
            label={t.phone}
            name="phone"
            type="tel"
            autoComplete="tel"
            data-testid="phone-input"
          />
          <Input
            label={t.password}
            name="password"
            required
            type="password"
            autoComplete="new-password"
            data-testid="password-input"
          />
        </div>
        <ErrorMessage error={errorMessage} data-testid="register-error" />
        {result && typeof result === 'object' && result.id && (
          <div className="text-center text-green-600 text-small-regular mt-4">
            {t.registerSuccess}
          </div>
        )}
        <span className="text-center text-ui-fg-base text-small-regular mt-6">
          {t.agreeToTerms}{" "}
          <LocalizedClientLink
            href="/content/privacy-policy"
            className="underline"
          >
            {t.privacyPolicy}
          </LocalizedClientLink>{" "}
          {t.and}{" "}
          <LocalizedClientLink
            href="/content/terms-of-use"
            className="underline"
          >
            {t.termsOfUse}
          </LocalizedClientLink>
          。
        </span>
        <SubmitButton className="w-full mt-6" data-testid="register-button">
          {t.join}
        </SubmitButton>
      </form>
      <span className="text-center text-ui-fg-base text-small-regular mt-6">
        {t.alreadyAMember}{" "}
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
          className="underline"
        >
          {t.signInNow}
        </button>
        。
      </span>
    </div>
  )
}

export default Register

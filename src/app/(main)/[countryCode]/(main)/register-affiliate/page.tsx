"use client"

import { useActionState } from 'react'
import { useParams } from 'next/navigation'
import { affiliateSignup } from '@lib/data/affiliate-auth'
import Input from '@components/common/components/input'
import { SubmitButton } from '@features/ecommerce/checkout/components/submit-button'
import ErrorMessage from '@features/ecommerce/checkout/components/error-message'
import LocalizedClientLink from '@components/common/components/localized-client-link'

export default function RegitsterAffiliatePage() {
  const [message, formAction] = useActionState(affiliateSignup, null)
  const params = useParams<{ countryCode: string }>()

  return (
    <div className="mx-auto w-full max-w-md py-10 px-4">
      <h1 className="mb-6 text-2xl font-semibold">申請成為聯盟夥伴</h1>
      <form className="flex flex-col gap-3" action={formAction}>
        <input type="hidden" name="countryCode" value={(params?.countryCode as string) || 'tw'} />
        <Input label="顯示名稱" name="displayName" required />
        <Input label="網站（選填）" name="website" />
        <Input label="電子郵件" name="email" type="email" required />
        <Input label="密碼" name="password" type="password" required />
        <ErrorMessage error={message} />
        <SubmitButton className="mt-2 w-full">送出申請</SubmitButton>
      </form>
      <div className="mt-4 text-sm">
        已是聯盟夥伴？
        <LocalizedClientLink className="ml-1 underline" href="/login-affiliate">
          前往登入
        </LocalizedClientLink>
      </div>
      <p className="mt-3 text-xs text-gray-600">申請送出後將進入審核流程，通過後即可登入使用聯盟後台。</p>
    </div>
  )
}

"use client"

import { useActionState } from 'react'
import { useParams } from 'next/navigation'
import { affiliateLogin } from '@lib/data/affiliate-auth'
import Input from '@modules/common/components/input'
import { SubmitButton } from '@modules/checkout/components/submit-button'
import ErrorMessage from '@modules/checkout/components/error-message'
import LocalizedClientLink from '@modules/common/components/localized-client-link'

export default function AffiliateLoginPage() {
  const [message, formAction] = useActionState(affiliateLogin, null)
  const params = useParams<{ countryCode: string }>()

  return (
    <div className="mx-auto w-full max-w-md py-10 px-4">
      <h1 className="mb-6 text-2xl font-semibold">聯盟登入</h1>
      <form className="flex flex-col gap-3" action={formAction}>
        <input type="hidden" name="countryCode" value={(params?.countryCode as string) || 'tw'} />
        <Input label="電子郵件" name="email" type="email" required />
        <Input label="密碼" name="password" type="password" required />
        <ErrorMessage error={message} />
        <SubmitButton className="mt-2 w-full">登入</SubmitButton>
      </form>
      <div className="mt-4 text-sm">
        還不是聯盟夥伴？
        <LocalizedClientLink className="ml-1 underline" href="/regitster-affiliate">
          立即申請
        </LocalizedClientLink>
      </div>
    </div>
  )
}

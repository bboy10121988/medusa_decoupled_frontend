import LocalizedClientLink from '@components/common/components/localized-client-link'

export default function AffiliatePendingPage() {
  return (
    <div className="mx-auto w-full max-w-2xl py-10 px-4">
      <h1 className="mb-4 text-2xl font-semibold">審核中</h1>
      <p className="mb-6 text-gray-700">您的聯盟夥伴申請已送出，目前正在審核中。審核通過後即可使用聯盟後台功能。</p>
      <LocalizedClientLink className="underline" href="/login-affiliate">返回登入</LocalizedClientLink>
    </div>
  )
}

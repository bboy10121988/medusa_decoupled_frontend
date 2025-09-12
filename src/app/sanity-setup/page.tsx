import SanityTokenGuide from '@/components/SanityTokenGuide'

export const metadata = {
  title: 'Sanity Token 設定指南',
  description: '學習如何設定 Sanity API Token 以使用 GrapesJS 編輯器'
}

export default function SanitySetupPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <SanityTokenGuide />
    </div>
  )
}
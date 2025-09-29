import { Metadata } from "next"
import "@/styles/globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  // 預設的fallback metadata
  title: {
    template: '%s | Tim\'s Fantasy World',
    default: 'Tim\'s Fantasy World - 專業美髮沙龍與造型產品'
  },
  description: '專業美髮沙龍服務，提供剪髮、染髮、燙髮等服務。銷售優質美髮產品，包含洗髮精、護髮乳、造型產品等。',
  keywords: '美髮沙龍, 剪髮, 染髮, 燙髮, 造型, 洗髮精, 護髮乳, 造型產品, 美髮用品',
  authors: [{ name: 'Tim\'s Fantasy World' }],
  creator: 'Tim\'s Fantasy World',
  publisher: 'Tim\'s Fantasy World',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW" data-mode="light" suppressHydrationWarning>
      <body className="theme-lv">
        <main className="relative">{children}</main>
      </body>
    </html>
  )
}

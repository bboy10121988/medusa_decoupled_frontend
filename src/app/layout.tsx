import { Metadata } from "next"
import Script from "next/script"
import "@/styles/globals.css"

import { getHeader } from "@lib/sanity"

export async function generateMetadata(): Promise<Metadata> {
  const headerData = await getHeader()
  const faviconUrl = headerData?.favicon?.url || '/favicon.ico'
  const storeName = headerData?.storeName || 'Tim\'s Fantasy World'

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
    title: {
      template: `%s | ${storeName}`,
      default: `${storeName} - 專業美髮沙龍與造型產品`
    },
    description: '專業美髮沙龍服務，提供剪髮、染髮、燙髮等服務。銷售優質美髮產品，包含洗髮精、護髮乳、造型產品等。',
    keywords: '美髮沙龍, 剪髮, 染髮, 燙髮, 造型, 洗髮精, 護髮乳, 造型產品, 美髮用品',
    authors: [{ name: storeName }],
    creator: storeName,
    publisher: storeName,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
    },
    icons: {
      icon: faviconUrl,
      shortcut: faviconUrl,
      apple: faviconUrl,
    }
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
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-700130047"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'AW-700130047');
          `}
        </Script>
        <div className="relative" style={{ margin: 0, padding: 0, border: 'none', outline: 'none' }}>{children}</div>
      </body>
    </html>
  )
}

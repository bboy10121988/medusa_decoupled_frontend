import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import "styles/globals.css"
// 導入錯誤處理器以處理 Sanity AbortError
import "../lib/error-handler"
// 導入 AbortController polyfill 修復 RxJS 問題
import "../lib/abort-controller-polyfill"
// 導入 Turbopack 專用的錯誤抑制器
import "../lib/turbopack-error-suppressor.js"
// 導入新的 AbortError 處理工具
import "../lib/abort-error-setup"
// 導入購物車診斷工具（僅開發環境）
import "../lib/cart-diagnostics"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="light">
      <body>
        <main className="relative">{props.children}</main>
      </body>
    </html>
  )
}

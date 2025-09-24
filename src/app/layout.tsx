import { Metadata } from "next"
import "@/styles/globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-mode="light" suppressHydrationWarning>
      <body className="theme-lv">
        <main className="relative">{children}</main>
      </body>
    </html>
  )
}

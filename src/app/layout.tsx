import { Metadata } from "next"
import "styles/globals.css"
import "../styles/theme-lv.css"

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
}

import { ThemeProvider } from '../context/ThemeContext';
import ThemeSwitcher from '../components/ThemeSwitcher';

// ... existing code ...

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-mode="light">
      <body>
        <ThemeProvider>
          <main className="relative">{children}</main>
          <ThemeSwitcher />
        </ThemeProvider>
      </body>
    </html>
  )
}

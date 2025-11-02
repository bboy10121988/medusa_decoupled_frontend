"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface AuthGuardProps {
  children: React.ReactNode
  redirectTo?: string
  showLoginPrompt?: boolean
}

export function AuthGuard({ 
  children, 
  redirectTo = '/tw/account',
  showLoginPrompt = true 
}: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [isChecking, setIsChecking] = useState(true)
  const router = useRouter()

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/check', {
        credentials: 'include',
        cache: 'no-cache'
      })
      
      const result = await response.json()
      
      // console.log('🔍 認證檢查結果:', result)
      
      setIsAuthenticated(result.authenticated)
      
      if (!result.authenticated && redirectTo) {
        // console.log('❌ 未認證，重定向到:', redirectTo)
        router.push(redirectTo)
      }
      
    } catch (error) {
      // console.error('❌ 認證檢查失敗:', error)
      setIsAuthenticated(false)
      
      if (redirectTo) {
        router.push(redirectTo)
      }
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  // 載入中狀態
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">檢查認證狀態...</p>
        </div>
      </div>
    )
  }

  // 未認證狀態
  if (isAuthenticated === false && showLoginPrompt) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <div className="text-red-500 text-5xl mb-4">🔒</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">需要登入</h2>
            <p className="text-gray-600">您的登入狀態已過期，請重新登入</p>
          </div>
          
          <div className="space-y-3">
            <button 
              onClick={() => router.push(redirectTo)}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              前往登入頁面
            </button>
            <button 
              onClick={checkAuth}
              className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            >
              重新檢查
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 已認證，顯示內容
  return <>{children}</>
}

export default AuthGuard
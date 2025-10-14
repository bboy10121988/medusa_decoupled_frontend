"use client"

import { useState, useEffect, useCallback, createContext, useContext, ReactNode, useMemo } from 'react'
import { useRouter } from 'next/navigation'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          revoke: (email: string, callback: () => void) => Promise<void>
        }
      }
    }
  }
}

interface User {
  email?: string
  [key: string]: any
}

interface AuthContextType {
  isAuthenticated: boolean | null
  isLoading: boolean
  user: User | null
  checkAuth: () => Promise<void>
  logout: () => Promise<void>
  login: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true)
      
      const response = await fetch('/api/auth/check', {
        credentials: 'include',
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const result = await response.json()
      
      console.log('🔍 認證狀態檢查:', {
        authenticated: result.authenticated,
        user: result.user,
        timestamp: new Date().toISOString()
      })
      
      setIsAuthenticated(result.authenticated)
      setUser(result.user || null)
      
    } catch (error) {
      console.error('❌ 認證檢查失敗:', error)
      setIsAuthenticated(false)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      setIsLoading(true)
      
      // 1. 清理 Google OAuth
      if (typeof window !== 'undefined' && window.google?.accounts && user?.email) {
        try {
          await window.google.accounts.id.revoke(user.email, () => {
            console.log('🟢 Google OAuth 已撤銷')
          })
        } catch (error) {
          console.warn('⚠️ Google OAuth 撤銷失敗:', error)
        }
      }
      
      // 2. 呼叫後端登出
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
      
      // 3. 清理本地狀態
      setIsAuthenticated(false)
      setUser(null)
      
      // 4. 清理 localStorage 和 sessionStorage
      if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()
      }
      
      console.log('🟢 登出完成')
      
      // 5. 重定向到首頁
      router.push('/')
      
    } catch (error) {
      console.error('❌ 登出失敗:', error)
    } finally {
      setIsLoading(false)
    }
  }, [user, router])

  const login = useCallback(async () => {
    try {
      setIsLoading(true)
      
      // 登入後重新檢查認證狀態
      await checkAuth()
      
    } catch (error) {
      console.error('❌ 登入失敗:', error)
      setIsAuthenticated(false)
      setUser(null)
    }
  }, [checkAuth])

  // 初始化時檢查認證狀態
  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  // 定期檢查認證狀態（每5分鐘）
  useEffect(() => {
    const interval = setInterval(() => {
      if (isAuthenticated) {
        checkAuth()
      }
    }, 5 * 60 * 1000) // 5分鐘

    return () => clearInterval(interval)
  }, [isAuthenticated, checkAuth])

  const value: AuthContextType = useMemo(() => ({
    isAuthenticated,
    isLoading,
    user,
    checkAuth,
    logout,
    login
  }), [isAuthenticated, isLoading, user, checkAuth, logout, login])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth 必須在 AuthProvider 內使用')
  }
  return context
}

export default AuthProvider
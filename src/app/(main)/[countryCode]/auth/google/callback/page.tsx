"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter, useParams } from "next/navigation"

/**
 * Google OAuth Callback 頁面
 * 
 * 後端會將用戶重定向到此頁面,並附帶以下參數:
 * - success=true: 登入成功
 * - error=<message>: 登入失敗,包含錯誤訊息
 * 
 * Flow:
 * 1. 用戶點擊 Google 登入按鈕 → 導向後端
 * 2. 後端處理 OAuth → Google 授權 → 後端創建 session
 * 3. 後端重定向回此頁面 (已設定 cookie)
 * 4. 根據參數顯示結果並跳轉
 */

function GoogleCallbackContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const params = useParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  const countryCode = (params.countryCode as string) || 'tw'

  useEffect(() => {
    const success = searchParams.get('success')
    const error = searchParams.get('error')

    console.log('=== Google OAuth Callback ===')
    console.log('Success:', success)
    console.log('Error:', error)

    if (success === 'true') {
      setStatus('success')
      console.log('✅ Google 登入成功!')
      
      // 1 秒後跳轉到會員中心
      setTimeout(() => {
        router.push(`/${countryCode}/account`)
      }, 1000)
      
    } else if (error) {
      setStatus('error')
      console.error('❌ Google 登入失敗:', error)
      
      // 3 秒後返回登入頁
      setTimeout(() => {
        router.push(`/${countryCode}/account`)
      }, 3000)
    }
  }, [searchParams, router, countryCode])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md w-full">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">處理登入中...</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <svg className="w-16 h-16 text-green-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <h1 className="mt-4 text-2xl font-bold text-gray-900">登入成功!</h1>
            <p className="mt-2 text-gray-600">正在跳轉到會員中心...</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <svg className="w-16 h-16 text-red-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <h1 className="mt-4 text-2xl font-bold text-gray-900">登入失敗</h1>
            <p className="mt-2 text-gray-600 break-words">
              {searchParams.get('error') || '發生未知錯誤'}
            </p>
            <p className="mt-4 text-sm text-gray-500">正在返回帳戶頁面...</p>
          </>
        )}
      </div>
    </div>
  )
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">處理登入中...</p>
        </div>
      </div>
    }>
      <GoogleCallbackContent />
    </Suspense>
  )
}
        
        // 檢查 cookie 是否存在（僅供 debug，httpOnly cookie 無法從 JS 讀取）
        console.log("Cookies:", document.cookie.split(';').map(c => c.trim().split('=')[0]))
        
        // 登入成功，重導向到帳戶頁面
        // console.log("🚀 登入成功，正在重導向到帳戶頁面...")
        // 使用 window.location.href 進行完整頁面重載，確保所有 context 和狀態都刷新
        window.location.href = `/${countryCode}/account`
      } catch (error) {
        console.error("❌ 驗證回調過程中發生錯誤:", error)
        console.error("Error details:", {
          message: error instanceof Error ? error.message : "Unknown error",
          response: (error as any).response?.data,
          status: (error as any).response?.status
        })
        const errorMessage = error instanceof Error ? error.message : "發生未知錯誤"
        setError(`登入失敗: ${errorMessage}`)
      } finally {
        setLoading(false)
      }
    }

    if (!loading) {
      return
    }

    // 確保我們在客戶端環境並且有查詢參數
    if (typeof window !== 'undefined' && Object.keys(queryParams).length > 0) {
      validateCallback()
    }
    // 移除 validateCallback 依賴，因為它現在在 useEffect 內部定義
  }, [loading, queryParams, router, countryCode])

  // 渲染不同的內容根據當前狀態
  const renderContent = () => {
    // 統一返回一致的消息，等待客戶端邏輯接管
    if (!error) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full text-center">
            <p className="text-gray-600 mb-4">正在驗證您的 Google 身份，請稍候...</p>
            <div className="animate-pulse flex space-x-4 justify-center">
              <div className="h-3 w-3 bg-blue-400 rounded-full"></div>
              <div className="h-3 w-3 bg-blue-400 rounded-full"></div>
              <div className="h-3 w-3 bg-blue-400 rounded-full"></div>
            </div>
          </div>
        </div>
      )
    }
    
    // 顯示錯誤訊息
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
          <p className="text-red-500 mb-4 text-center font-medium">認證處理中遇到問題</p>
          <p className="text-gray-700 bg-red-50 p-3 rounded text-sm">{error}</p>
          <div className="mt-4 flex justify-center space-x-4">
            <button 
              onClick={() => router.push(`/${countryCode}/account`)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              返回登入頁面
            </button>
          </div>
        </div>
      </div>
    )
  }
  
  return renderContent()
}
"use client"

import { useState } from "react"
import Input from "@modules/common/components/input"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import ErrorMessage from "@modules/checkout/components/error-message"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      setError("請輸入電子郵件地址")
      return
    }

    setLoading(true)
    setError("")
    setMessage("")

    try {
      // 呼叫自定義密碼重設 API
      const response = await fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/auth/customer/emailpass/reset-password-custom`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier: email }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '發送失敗')
      }
      
      setMessage("密碼重設連結已發送到您的電子郵件信箱，請檢查郵件並點擊連結重設密碼。")
      
    } catch (error: any) {
      // console.error("發送重設郵件失敗:", error)
      setError(error.message || "發送失敗，請確認電子郵件地址是否正確或稍後重試")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            忘記密碼
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            請輸入您的電子郵件地址，我們將發送密碼重設連結給您
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-8">
          {message ? (
            <div className="text-center">
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-700">{message}</p>
              </div>
              <button
                onClick={() => window.location.href = '/tw/account'}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                返回登入頁面
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="電子郵件"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
              
              <ErrorMessage error={error} />
              
              <SubmitButton className="w-full">
                {loading ? "發送中..." : "發送重設連結"}
              </SubmitButton>
              
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => window.location.href = '/tw/account'}
                  className="text-sm text-gray-600 hover:text-gray-800 underline"
                >
                  返回登入頁面
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
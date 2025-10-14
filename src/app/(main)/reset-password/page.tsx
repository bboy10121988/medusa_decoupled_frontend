"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Input from "@modules/common/components/input"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import ErrorMessage from "@modules/checkout/components/error-message"

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  
  const token = searchParams.get("token")
  const email = searchParams.get("email")

  useEffect(() => {
    if (!token || !email) {
      setError("無效的重設連結")
    }
  }, [token, email])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!token || !email) {
      setError("無效的重設連結")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("密碼不匹配")
      return
    }

    if (formData.password.length < 8) {
      setError("密碼長度至少需要 8 個字元")
      return
    }

    setLoading(true)
    setError("")

    try {
      // 呼叫 Medusa API 重設密碼
      const response = await fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/auth/customer/emailpass/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          token,
          password: formData.password,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '密碼重設失敗')
      }

      setMessage("密碼重設成功！您現在可以使用新密碼登入。")
      
      // 3 秒後重導向到登入頁面
      setTimeout(() => {
        window.location.href = "/tw/account"
      }, 3000)

    } catch (error: any) {
      console.error("密碼重設失敗:", error)
      setError(error.message || "密碼重設失敗，請重試或聯繫客服")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  if (!token || !email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">無效的重設連結</h2>
            <p className="mt-2 text-gray-600">
              此連結可能已過期或無效，請重新申請密碼重設。
            </p>
            <button
              onClick={() => window.location.href = '/tw/forgot-password'}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              重新申請密碼重設
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            重設密碼
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            為帳戶 {email} 設置新密碼
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-8">
          {message ? (
            <div className="text-center">
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-700">{message}</p>
              </div>
              <p className="text-sm text-gray-600">
                正在自動跳轉到登入頁面...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="新密碼"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                autoComplete="new-password"
              />
              
              <Input
                label="確認新密碼"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                autoComplete="new-password"
              />
              
              <div className="text-sm text-gray-600">
                <p>密碼要求：</p>
                <ul className="list-disc list-inside mt-1">
                  <li>至少 8 個字元</li>
                  <li>建議包含大小寫字母、數字和特殊符號</li>
                </ul>
              </div>
              
              <ErrorMessage error={error} />
              
              <SubmitButton className="w-full">
                {loading ? "重設中..." : "重設密碼"}
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
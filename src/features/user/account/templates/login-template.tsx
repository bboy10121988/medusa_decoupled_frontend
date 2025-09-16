"use client"

import { useState } from "react"
import GoogleLoginButton from "@features/user/account/components/google-login-button"
import Register from "@features/user/account/components/register"
import Login from "@features/user/account/components/login"

export enum LOGIN_VIEW {
  SIGN_IN = "sign-in",
  REGISTER = "register",
}

const LoginTemplate = () => {
  const [currentView, setCurrentView] = useState("sign-in")

  return (
    <div className="w-full flex justify-center px-8 py-8">
      <div className="w-full max-w-md mx-4">
        <div className="max-w-sm w-full flex flex-col items-center mx-4">
          {/* 標題區域 */}
          <h1 className="text-large-semi uppercase mb-6">
            {currentView === "sign-in" ? "歡迎回來" : "成為會員"}
          </h1>
          <p className="text-center text-base-regular text-ui-fg-base mb-8">
            {currentView === "sign-in" 
              ? "登入以享受更好的購物體驗。" 
              : "建立您的會員資料，享受更好的購物體驗。"
            }
          </p>
          
          {/* 共用的 Google 登入按鈕 - 在切換時保持不變 */}
          <div className="w-full mb-6">
            <GoogleLoginButton />
          </div>
          
          {/* 分隔線 */}
          <div className="relative mb-6 w-full">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">或</span>
            </div>
          </div>
          
          {/* 動態內容區域 - 只渲染表單部分，不包含 Google 按鈕 */}
          {currentView === "sign-in" ? (
            <Login setCurrentView={setCurrentView} />
          ) : (
            <Register setCurrentView={setCurrentView} />
          )}
        </div>
      </div>
    </div>
  )
}

export default LoginTemplate

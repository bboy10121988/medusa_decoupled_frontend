"use client"

import { useState } from "react"
import Register from "@modules/account/components/register"
import Login from "@modules/account/components/login"


export enum LOGIN_VIEW {
  SIGN_IN = "sign-in",
  REGISTER = "register",
}

interface LoginTemplateProps {
  countryCode?: string
}

const LoginTemplate = ({ countryCode: _countryCode = 'tw' }: LoginTemplateProps) => {
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

          {/* 登入/註冊表單 */}
          {currentView === "sign-in" ? (
            <>
              <Login setCurrentView={setCurrentView} />
            </>
          ) : (
            <Register setCurrentView={setCurrentView} />
          )}
        </div>
      </div>
    </div>
  )
}

export default LoginTemplate

import GoogleLoginButton from "@modules/account/components/google-login-button"

export default function TestGoogleLogin() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-center mb-6">測試 Google 登入</h1>
          <p className="text-gray-600 text-center mb-6">
            點擊下方按鈕測試 Google OAuth 流程
          </p>
          <GoogleLoginButton />
        </div>
      </div>
    </div>
  )
}
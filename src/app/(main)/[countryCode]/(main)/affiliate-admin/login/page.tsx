"use client"

import { useActionState } from 'react'
import { useParams } from 'next/navigation'
import { affiliateAdminLogin } from '@lib/data/affiliate-admin-auth'
import Input from '@components/common/components/input'
import { SubmitButton } from '@features/ecommerce/checkout/components/submit-button'
import ErrorMessage from '@features/ecommerce/checkout/components/error-message'

export default function AffiliateAdminLogin() {
  const [message, formAction] = useActionState(affiliateAdminLogin, null)
  const params = useParams<{ countryCode: string }>()
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-blue-100">
            <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="mt-6 text-3xl font-bold text-gray-900">聯盟管理員登入</h1>
          <p className="mt-2 text-sm text-gray-600">
            請使用您的管理員帳號登入系統
          </p>
        </div>
        
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <form className="space-y-6" action={formAction}>
            <input type="hidden" name="countryCode" value={(params?.countryCode as string) || 'tw'} />
            
            <div>
              <Input 
                label="電子郵件" 
                name="email" 
                type="email" 
                required 
                autoComplete="email"
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              />
            </div>
            
            <div>
              <Input 
                label="密碼" 
                name="password" 
                type="password" 
                required 
                autoComplete="current-password"
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              />
            </div>

            <ErrorMessage error={message} />

            <div>
              <SubmitButton className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <svg className="h-5 w-5 text-blue-500 group-hover:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                </span>
                登入
              </SubmitButton>
            </div>
          </form>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            遇到問題？請聯繫系統管理員
          </p>
        </div>
      </div>
    </div>
  )
}


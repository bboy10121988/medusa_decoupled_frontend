'use client'

import { useState, useEffect } from 'react'

type AffiliateSettings = {
  email?: string
  displayName: string
  website?: string
  payoutMethod: 'bank_transfer' | 'paypal' | 'stripe'
  paypalEmail?: string
  bankAccount?: {
    bankName: string
    accountName: string
    accountNumber: string
    branch?: string
  }
  stripeAccountId?: string
  notifications: {
    emailOnNewOrder: boolean
    emailOnPayment: boolean
    emailOnCommissionUpdate: boolean
  }
  profile: {
    company?: string
    phone?: string
    address?: string
    taxId?: string
  }
}

export default function AffiliateSettingsPage() {
  const [settings, setSettings] = useState<AffiliateSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'payment' | 'notifications'>('profile')

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/affiliate/settings')

      if (!response.ok) {
        throw new Error('獲取設定失敗')
      }

      const data = await response.json()
      setSettings(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '發生未知錯誤')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!settings) return

    try {
      setSaving(true)
      setError(null)

      const response = await fetch('/api/affiliate/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      })

      if (!response.ok) {
        throw new Error('保存設定失敗')
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失敗')
    } finally {
      setSaving(false)
    }
  }

  const updateSettings = (updates: Partial<AffiliateSettings>) => {
    if (!settings) return
    setSettings(prev => prev ? { ...prev, ...updates } : null)
  }

  const updateNestedSettings = <T,>(path: keyof AffiliateSettings, updates: Partial<T>) => {
    if (!settings) return
    setSettings(prev => prev ? {
      ...prev,
      [path]: { ...(prev[path] as any), ...updates }
    } : null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">載入中...</div>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 p-4">
        <div className="text-red-800">{error || '無法載入設定'}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 頁面標題 */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-medium">帳戶設定</h2>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? '保存中...' : '保存設定'}
        </button>
      </div>

      {/* 成功提示 */}
      {success && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-4">
          <div className="text-green-800">✅ 設定已保存成功</div>
        </div>
      )}

      {/* 錯誤提示 */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <div className="text-red-800">❌ {error}</div>
        </div>
      )}

      {/* 標籤導航 */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'profile', label: '基本資料', icon: '👤' },
            { key: 'payment', label: '收款設定', icon: '💳' },
            { key: 'notifications', label: '通知設定', icon: '🔔' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.key
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* 標籤內容 */}
      <div className="space-y-6">
        {/* 基本資料標籤 */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4">個人資料</h3>
              <div className="grid grid-cols-1 gap-6 small:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    顯示名稱 *
                  </label>
                  <input
                    type="text"
                    value={settings.displayName}
                    onChange={(e) => updateSettings({ displayName: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="請輸入顯示名稱"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    帳號信箱 (通知將發送至此)
                  </label>
                  <input
                    type="email"
                    value={settings.email || ''}
                    disabled
                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    公司名稱
                  </label>
                  <input
                    type="text"
                    value={settings.profile.company || ''}
                    onChange={(e) => updateNestedSettings('profile', { company: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="請輸入公司名稱"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    網站網址
                  </label>
                  <input
                    type="url"
                    value={settings.website || ''}
                    onChange={(e) => updateSettings({ website: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="https://example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    聯絡電話
                  </label>
                  <input
                    type="tel"
                    value={settings.profile.phone || ''}
                    onChange={(e) => updateNestedSettings('profile', { phone: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="請輸入聯絡電話"
                  />
                </div>
                <div className="small:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    地址
                  </label>
                  <textarea
                    value={settings.profile.address || ''}
                    onChange={(e) => updateNestedSettings('profile', { address: e.target.value })}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="請輸入地址"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    統一編號
                  </label>
                  <input
                    type="text"
                    value={settings.profile.taxId || ''}
                    onChange={(e) => updateNestedSettings('profile', { taxId: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="請輸入統一編號（如適用）"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 收款設定標籤 */}
        {activeTab === 'payment' && (
          <div className="space-y-6">
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4">收款方式</h3>

              {/* 收款方式選擇 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  選擇收款方式 *
                </label>
                <div className="grid grid-cols-1 gap-4 small:grid-cols-3">
                  {[
                    { key: 'bank_transfer', label: '銀行轉帳', icon: '🏦', desc: '直接轉帳到銀行帳戶' },
                    { key: 'paypal', label: 'PayPal', icon: '💙', desc: '透過 PayPal 接收款項' },
                    { key: 'stripe', label: 'Stripe', icon: '💜', desc: '透過 Stripe 接收款項' },
                  ].map((method) => (
                    <label
                      key={method.key}
                      className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${settings.payoutMethod === method.key
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300'
                        }`}
                    >
                      <input
                        type="radio"
                        value={method.key}
                        checked={settings.payoutMethod === method.key}
                        onChange={(e) => updateSettings({ payoutMethod: e.target.value as any })}
                        className="sr-only"
                      />
                      <div className="flex flex-col flex-1">
                        <div className="flex items-center">
                          <span className="text-xl mr-2">{method.icon}</span>
                          <span className="block text-sm font-medium text-gray-900">
                            {method.label}
                          </span>
                        </div>
                        <span className="mt-1 text-xs text-gray-500">{method.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* 銀行轉帳設定 */}
              {settings.payoutMethod === 'bank_transfer' && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">銀行帳戶資訊</h4>
                  <div className="grid grid-cols-1 gap-4 small:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        銀行名稱 *
                      </label>
                      <input
                        type="text"
                        value={settings.bankAccount?.bankName || ''}
                        onChange={(e) => updateNestedSettings('bankAccount', { bankName: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="例：台灣銀行"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        帳戶名稱 *
                      </label>
                      <input
                        type="text"
                        value={settings.bankAccount?.accountName || ''}
                        onChange={(e) => updateNestedSettings('bankAccount', { accountName: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="請輸入帳戶名稱"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        帳戶號碼 *
                      </label>
                      <input
                        type="text"
                        value={settings.bankAccount?.accountNumber || ''}
                        onChange={(e) => updateNestedSettings('bankAccount', { accountNumber: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="請輸入帳戶號碼"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        分行名稱
                      </label>
                      <input
                        type="text"
                        value={settings.bankAccount?.branch || ''}
                        onChange={(e) => updateNestedSettings('bankAccount', { branch: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="請輸入分行名稱"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* PayPal 設定 */}
              {settings.payoutMethod === 'paypal' && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">PayPal 帳戶資訊</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      PayPal 電子郵件 *
                    </label>
                    <input
                      type="email"
                      value={settings.paypalEmail || ''}
                      onChange={(e) => updateSettings({ paypalEmail: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="請輸入 PayPal 註冊的電子郵件"
                      required
                    />
                    <div className="mt-2 text-xs text-gray-500">
                      請確保此電子郵件已註冊 PayPal 帳戶
                    </div>
                  </div>
                </div>
              )}

              {/* Stripe 設定 */}
              {settings.payoutMethod === 'stripe' && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Stripe 帳戶資訊</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stripe 帳戶 ID
                    </label>
                    <input
                      type="text"
                      value={settings.stripeAccountId || ''}
                      onChange={(e) => updateSettings({ stripeAccountId: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="acct_xxxxxxxxxxxxxxxxxxxx"
                    />
                    <div className="mt-2 text-xs text-gray-500">
                      如果沒有 Stripe 帳戶，我們會協助您設定
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 通知設定標籤 */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4">電子郵件通知</h3>
              <div className="space-y-4">
                {[
                  { key: 'emailOnNewOrder', label: '新訂單通知', desc: '當有新訂單通過您的推廣連結時發送通知' },
                  { key: 'emailOnPayment', label: '結算通知', desc: '當佣金結算完成時發送通知' },
                  { key: 'emailOnCommissionUpdate', label: '佣金更新通知', desc: '當佣金狀態有變更時發送通知' },
                ].map((notification) => (
                  <div key={notification.key} className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        type="checkbox"
                        checked={settings.notifications[notification.key as keyof typeof settings.notifications]}
                        onChange={(e) => updateNestedSettings('notifications', { [notification.key]: e.target.checked })}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label className="font-medium text-gray-900">
                        {notification.label}
                      </label>
                      <div className="text-gray-500">{notification.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

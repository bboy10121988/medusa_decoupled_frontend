"use client"

import { useState, useEffect } from "react"
import { Button, Input, Label } from "@medusajs/ui"
import React from "react"

interface FormData {
  first_name: string;
  last_name: string;
  phone: string;
  city: string;
  address_1: string;
  address_2: string;
  postal_code: string;
}

interface ConfirmedFormData extends FormData {
  confirmed: boolean;
}

const initialFormData: FormData = {
  first_name: "",
  last_name: "",
  phone: "",
  city: "",
  address_1: "",
  address_2: "",
  postal_code: ""
}

type DeliveryAddressFormProps = {
  onSubmit: (addressData: FormData) => void;
  initialData?: Partial<FormData>;
  isSubmitting?: boolean;
}

const STORAGE_KEY = "delivery_address_data"

// 台灣手機號碼驗證
const isValidTWPhone = (phone: string): boolean => {
  return /^09\d{8}$/.test(phone)
}

// 郵遞區號驗證
const isValidPostalCode = (code: string): boolean => {
  return /^\d{3,6}$/.test(code)
}

const DeliveryAddressForm = ({ 
  onSubmit,
  initialData = {},
  isSubmitting = false
}: DeliveryAddressFormProps): React.ReactElement => {
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [isFormConfirmed, setIsFormConfirmed] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const cities = [
    "臺北市", "新北市", "基隆市", "桃園市", "新竹市", "新竹縣",
    "苗栗縣", "臺中市", "彰化縣", "南投縣", "雲林縣", "嘉義市",
    "嘉義縣", "臺南市", "高雄市", "屏東縣", "宜蘭縣", "花蓮縣",
    "臺東縣", "澎湖縣", "金門縣", "連江縣"
  ]

  // 從 localStorage 載入儲存的資料
  useEffect(() => {
    const loadStoredData = () => {
      const storedData = localStorage.getItem(STORAGE_KEY)
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData)
          setFormData(prev => ({
            ...prev,
            ...parsedData,
            ...initialData
          }))
        } catch (e) {
          console.error('無法解析儲存的收件資訊:', e)
        }
      } else if (initialData && Object.keys(initialData).length > 0) {
        setFormData(prev => ({
          ...prev,
          ...initialData
        }))
      }
    }

    loadStoredData()
  }, [initialData])

  // 儲存資料到 localStorage
  const saveToStorage = (data: FormData): void => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (e) {
      console.error('無法儲存收件資訊:', e)
    }
  }

  // 表單驗證
  const validateFormData = (data: FormData) => {
    const newErrors: Record<string, string> = {}
    
    // 姓氏驗證
    if (!data.last_name.trim()) {
      newErrors.last_name = "請輸入姓氏"
    } else if (data.last_name.length > 25) {
      newErrors.last_name = "姓氏過長"
    }

    // 名字驗證
    if (!data.first_name.trim()) {
      newErrors.first_name = "請輸入名字"
    } else if (data.first_name.length > 25) {
      newErrors.first_name = "名字過長"
    }

    // 電話驗證
    if (!data.phone.trim()) {
      newErrors.phone = "請輸入聯絡電話"
    } else if (!isValidTWPhone(data.phone)) {
      newErrors.phone = "請輸入正確的手機號碼格式"
    }

    // 地址驗證
    if (!data.city) {
      newErrors.city = "請選擇縣市"
    }

    if (!data.address_1.trim()) {
      newErrors.address_1 = "請輸入詳細地址"
    } else if (data.address_1.length > 100) {
      newErrors.address_1 = "地址過長"
    }

    // 郵遞區號驗證
    if (!data.postal_code.trim()) {
      newErrors.postal_code = "請輸入郵遞區號"
    } else if (!isValidPostalCode(data.postal_code)) {
      newErrors.postal_code = "請輸入有效的郵遞區號"
    }

    return newErrors
  }

  // 處理欄位變更
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setIsFormConfirmed(false) // 當欄位變更時，重設確認狀態
    
    // 即時驗證
    const fieldErrors = validateFormData({ ...formData, [name]: value })
    if (fieldErrors[name]) {
      setErrors(prev => ({ ...prev, [name]: fieldErrors[name] }))
    } else {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  // 處理表單提交
  const handleSubmit = (e?: React.FormEvent | React.MouseEvent) => {
    if (e) {
      e.preventDefault()
    }
    
    const newErrors = validateFormData(formData)
    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      // 儲存到 localStorage
      saveToStorage(formData)
      
      // 設置表單為已確認狀態
      setIsFormConfirmed(true)
      
      // 調用父元件的 onSubmit，包含 country_code
      const addressData = {
        ...formData,
        country_code: 'TW'
      }
      onSubmit(addressData)
    } else {
      // 滾動到第一個錯誤欄位
      const firstErrorField = document.querySelector(
        `[name="${Object.keys(newErrors)[0]}"]`
      )
      firstErrorField?.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }

  return (
    <div className="space-y-6">
      {/* 姓名 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="last_name" className="mb-2 block">
            姓氏 <span className="text-rose-500">*</span>
          </Label>
          <Input
            id="last_name"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            className={errors.last_name ? "border-rose-500" : ""}
            placeholder="請輸入姓氏"
            required
          />
          {errors.last_name && (
            <p className="mt-1 text-rose-500 text-sm">{errors.last_name}</p>
          )}
        </div>
        <div>
          <Label htmlFor="first_name" className="mb-2 block">
            名字 <span className="text-rose-500">*</span>
          </Label>
          <Input
            id="first_name"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            className={errors.first_name ? "border-rose-500" : ""}
            placeholder="請輸入名字"
            required
          />
          {errors.first_name && (
            <p className="mt-1 text-rose-500 text-sm">{errors.first_name}</p>
          )}
        </div>
      </div>

      {/* 電話 */}
      <div>
        <Label htmlFor="phone" className="mb-2 block">
          聯絡電話 <span className="text-rose-500">*</span>
        </Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          className={errors.phone ? "border-rose-500" : ""}
          placeholder="請輸入手機號碼"
          required
        />
        {errors.phone && (
          <p className="mt-1 text-rose-500 text-sm">{errors.phone}</p>
        )}
      </div>

      {/* 縣市 */}
      <div>
        <Label htmlFor="city" className="mb-2 block">
          縣市 <span className="text-rose-500">*</span>
        </Label>
        <select
          id="city"
          name="city"
          value={formData.city}
          onChange={handleChange}
          className={`w-full h-10 bg-white border rounded-md px-4 py-2 focus:outline-none focus:ring-2 ${
            errors.city ? "border-rose-500" : "border-gray-200"
          }`}
          style={{
            '--tw-ring-color': 'var(--color-primary)',
          } as React.CSSProperties}
          required
        >
          <option value="">請選擇縣市</option>
          {cities.map(city => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
        {errors.city && (
          <p className="mt-1 text-rose-500 text-sm">{errors.city}</p>
        )}
      </div>

      {/* 地址 */}
      <div>
        <Label htmlFor="address_1" className="mb-2 block">
          詳細地址 <span className="text-rose-500">*</span>
        </Label>
        <Input
          id="address_1"
          name="address_1"
          value={formData.address_1}
          onChange={handleChange}
          className={errors.address_1 ? "border-rose-500" : ""}
          placeholder="請輸入詳細地址"
          required
        />
        {errors.address_1 && (
          <p className="mt-1 text-rose-500 text-sm">{errors.address_1}</p>
        )}
      </div>

      {/* 郵遞區號 */}
      <div>
        <Label htmlFor="postal_code" className="mb-2 block">
          郵遞區號 <span className="text-rose-500">*</span>
        </Label>
        <Input
          id="postal_code"
          name="postal_code"
          value={formData.postal_code}
          onChange={handleChange}
          className={errors.postal_code ? "border-rose-500" : ""}
          placeholder="請輸入郵遞區號"
          required
        />
        {errors.postal_code && (
          <p className="mt-1 text-rose-500 text-sm">{errors.postal_code}</p>
        )}
      </div>

      {/* 確認表單內容與付款按鈕 */}
      {isFormConfirmed ? (
        <div className="space-y-4">
          {/* 已確認的收件資訊 */}
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <h3 className="text-green-800 font-medium">已確認的收件資訊</h3>
            </div>
            <dl className="space-y-1 text-sm text-green-700">
              <div className="grid grid-cols-3">
                <dt className="font-medium">收件人：</dt>
                <dd className="col-span-2">{formData.last_name}{formData.first_name}</dd>
              </div>
              <div className="grid grid-cols-3">
                <dt className="font-medium">聯絡電話：</dt>
                <dd className="col-span-2">{formData.phone}</dd>
              </div>
              <div className="grid grid-cols-3">
                <dt className="font-medium">收件地址：</dt>
                <dd className="col-span-2">{formData.city} {formData.address_1}</dd>
              </div>
              <div className="grid grid-cols-3">
                <dt className="font-medium">郵遞區號：</dt>
                <dd className="col-span-2">{formData.postal_code}</dd>
              </div>
            </dl>
          </div>

          {/* 修改按鈕 */}
          <div className="mt-4">
            <Button 
              type="button"
              variant="secondary"
              onClick={() => setIsFormConfirmed(false)}
              className="w-full"
            >
              修改收件資料
            </Button>
          </div>
        </div>
      ) : (
        <Button 
          type="button"
          variant="primary"
          disabled={isSubmitting}
          className="w-full"
          onClick={(e) => {
            e.preventDefault()
            handleSubmit(e)
          }}
        >
          確認收件資訊
        </Button>
      )}
    </div>
  )
}

export default DeliveryAddressForm

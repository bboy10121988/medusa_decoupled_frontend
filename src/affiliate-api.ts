// API utility functions for affiliate system
const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

export interface AffiliatePartner {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  website?: string
  socialMedia?: string
  address?: string
  accountName?: string
  bankCode?: string
  accountNumber?: string
  taxId?: string
  referralCode: string
  referral_link: string
  status: 'active' | 'pending' | 'suspended'
  commission_rate: number
  createdAt: string
  updatedAt: string
}

export interface AffiliateStats {
  totalClicks: number
  totalConversions: number
  totalReferrals: number
  totalCommissions: number
  monthlyCommissions: number
  conversionRate: number
  totalEarnings: number
  pendingEarnings: number
  thisMonthEarnings: number
}

export interface AffiliateEarning {
  id: string
  partnerId: string
  orderId: string
  orderNumber: string
  customerEmail: string
  productName: string
  orderAmount: number
  commissionAmount: number
  commissionRate: number
  status: 'pending' | 'paid' | 'cancelled'
  createdAt: string
  paidAt?: string
}

class AffiliateAPI {
  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${BACKEND_URL}${endpoint}`
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...(PUBLISHABLE_KEY && { 'x-publishable-api-key': PUBLISHABLE_KEY })
    }

    console.log('發送 API 請求:', url, {
      method: options.method || 'GET',
      headers: { ...defaultHeaders, ...options.headers },
      body: options.body
    })

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers
        }
      })

      console.log('API 回應狀態:', response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.log('API 錯誤回應:', errorText)
        
        // 嘗試解析 JSON 錯誤訊息
        try {
          const errorData = JSON.parse(errorText)
          if (errorData.message || errorData.error) {
            // 不拋出錯誤，而是返回錯誤訊息
            return {
              success: false,
              message: errorData.message || errorData.error,
              hint: errorData.hint // 包含測試帳號提示
            }
          }
        } catch (parseError) {
          // 如果不是 JSON 格式，使用原始錯誤
        }
        
        return {
          success: false,
          message: `API Error: ${response.status} - ${errorText}`
        }
      }

      const result = await response.json()
      console.log('API 成功回應:', result)
      return result
    } catch (error) {
      console.error('API 請求失敗:', error)
      throw error
    }
  }

  async getAllPartners(): Promise<{ partners: AffiliatePartner[] }> {
    return this.makeRequest('/store/affiliate/partners')
  }

  async checkEmailExists(email: string): Promise<{ exists: boolean; partner?: AffiliatePartner }> {
    return this.makeRequest(`/store/affiliate/partners?email=${encodeURIComponent(email)}`)
  }

  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    return this.makeRequest('/store/affiliate/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    })
  }

  async loginPartner(email: string, password: string): Promise<{ success: boolean; partner?: AffiliatePartner; message?: string; hint?: string }> {
    try {
      const response = await this.makeRequest('/store/affiliate/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      })

      if (response.success && response.partner) {
        // 轉換後端資料格式為前端介面格式
        const transformedPartner: AffiliatePartner = {
          id: response.partner.id,
          name: response.partner.name,
          email: response.partner.email,
          phone: response.partner.phone,
          website: response.partner.website,
          referralCode: response.partner.uniqueCode || response.partner.referralCode,
          referral_link: `http://localhost:8000/tw?ref=${response.partner.uniqueCode || response.partner.referralCode}`,
          status: response.partner.status === 'approved' ? 'active' : response.partner.status,
          commission_rate: response.partner.commissionRate || response.partner.commission_rate || 0.05,
          createdAt: response.partner.createdAt,
          updatedAt: response.partner.updatedAt
        }

        return {
          success: true,
          partner: transformedPartner,
          message: response.message || "Login successful"
        }
      } else {
        return {
          success: false,
          message: response.message || "Login failed",
          hint: response.hint // 傳遞 hint 訊息
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      return {
        success: false,
        message: "Login failed"
      }
    }
  }

  async createPartner(data: {
    name: string
    email: string
    password: string
    phone?: string
    company?: string
  }): Promise<{ partner: AffiliatePartner }> {
    const response = await this.makeRequest('/store/affiliate/partners', {
      method: 'POST',
      body: JSON.stringify(data)
    })
    
    if (response.success && response.partner) {
      // 轉換後端資料格式為前端介面格式
      const transformedPartner: AffiliatePartner = {
        id: response.partner.id,
        name: response.partner.name,
        email: response.partner.email,
        phone: response.partner.phone,
        website: response.partner.website,
        referralCode: response.partner.uniqueCode || response.partner.referralCode,
        referral_link: `http://localhost:8000/tw?ref=${response.partner.uniqueCode || response.partner.referralCode}`,
        status: response.partner.status === 'approved' ? 'active' : response.partner.status,
        commission_rate: response.partner.commissionRate || response.partner.commission_rate || 0.05,
        createdAt: response.partner.createdAt,
        updatedAt: response.partner.updatedAt
      }
      
      return { partner: transformedPartner }
    }
    
    throw new Error(response.message || '創建合作夥伴失敗')
  }

  async trackClick(affiliateCode: string, productId?: string): Promise<void> {
    return this.makeRequest('/store/affiliate/track', {
      method: 'POST',
      body: JSON.stringify({
        affiliate_code: affiliateCode,
        product_id: productId
      })
    })
  }

  // Get real partner stats from backend
  async getPartnerStats(partnerId: string): Promise<AffiliateStats> {
    try {
      const response = await this.makeRequest(`/store/affiliate/partners/${partnerId}/stats`)
      
      if (response.success && response.stats) {
        return {
          totalClicks: response.stats.totalClicks || 0,
          totalConversions: response.stats.totalConversions || 0,
          totalReferrals: response.stats.totalReferrals || 0,
          totalCommissions: response.stats.totalCommissions || 0,
          monthlyCommissions: response.stats.monthlyCommissions || 0,
          conversionRate: response.stats.conversionRate || 0,
          totalEarnings: response.stats.totalEarnings || 0,
          pendingEarnings: response.stats.pendingEarnings || 0,
          thisMonthEarnings: response.stats.thisMonthEarnings || 0
        }
      }

      // 如果沒有數據，返回空統計
      return {
        totalClicks: 0,
        totalConversions: 0,
        totalReferrals: 0,
        totalCommissions: 0,
        monthlyCommissions: 0,
        conversionRate: 0,
        totalEarnings: 0,
        pendingEarnings: 0,
        thisMonthEarnings: 0
      }
      
    } catch (error) {
      console.error('Failed to fetch partner stats:', error)
      throw error
    }
  }

  // Authentication and profile methods using real API
  async isAuthenticated(): Promise<boolean> {
    if (typeof window === 'undefined') return false
    const token = localStorage.getItem('affiliate_token')
    if (!token) return false
    
    try {
      // 嘗試獲取 profile 來驗證 token 是否有效
      await this.getProfile()
      return true
    } catch (error) {
      // Token 無效，清除它
      localStorage.removeItem('affiliate_token')
      return false
    }
  }

  async getProfile(): Promise<AffiliatePartner> {
    if (typeof window === 'undefined') {
      throw new Error('無法在服務器端獲取 profile')
    }
    
    const token = localStorage.getItem('affiliate_token')
    const partnerData = localStorage.getItem('affiliate_partner')
    
    if (!token) {
      throw new Error('未找到認證 token')
    }
    
    // 嘗試從 localStorage 獲取暫存資料
    if (partnerData) {
      try {
        const partner = JSON.parse(partnerData) as AffiliatePartner
        
        // 嘗試從 API 更新最新資料
        try {
          const response = await this.makeRequest(`/store/affiliate/profile?partnerId=${partner.id}`)
          if (response.success && response.partner) {
            const updatedPartner = this.transformPartnerData(response.partner)
            localStorage.setItem('affiliate_partner', JSON.stringify(updatedPartner))
            return updatedPartner
          }
        } catch (apiError) {
          console.warn('無法從 API 獲取最新資料，使用暫存資料:', apiError)
        }
        
        return partner
      } catch (error) {
        console.error('解析 partner 資料失敗:', error)
      }
    }
    
    throw new Error('找不到合作夥伴資料，請重新登入')
  }

  private transformPartnerData(partnerData: any): AffiliatePartner {
    return {
      id: partnerData.id,
      name: partnerData.name,
      email: partnerData.email,
      phone: partnerData.phone,
      company: partnerData.company,
      website: partnerData.website,
      socialMedia: partnerData.socialMedia,
      address: partnerData.address,
      accountName: partnerData.accountName,
      bankCode: partnerData.bankCode,
      accountNumber: partnerData.accountNumber,
      taxId: partnerData.taxId,
      referralCode: partnerData.uniqueCode || partnerData.referralCode,
      referral_link: partnerData.referral_link || `http://localhost:8000/tw?ref=${partnerData.uniqueCode || partnerData.referralCode}`,
      status: partnerData.status === 'approved' ? 'active' : partnerData.status,
      commission_rate: partnerData.commissionRate || partnerData.commission_rate || 0.05,
      createdAt: partnerData.createdAt,
      updatedAt: partnerData.updatedAt
    }
  }

  async login(email: string, password: string): Promise<{ success: boolean; partner?: AffiliatePartner; message?: string; hint?: string }> {
    try {
      const response = await this.loginPartner(email, password)
      
      if (response.success && response.partner) {
        // 儲存 token 和 partner 資料到 localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('affiliate_token', 'token-' + response.partner.id)
          localStorage.setItem('affiliate_partner', JSON.stringify(response.partner))
        }
        
        return { 
          success: true, 
          partner: response.partner, 
          message: response.message || '登入成功！' 
        }
      } else {
        return { 
          success: false, 
          message: response.message || '電子郵件或密碼錯誤',
          hint: response.hint // 傳遞 hint
        }
      }
    } catch (error: any) {
      console.error('Login error:', error)
      return { 
        success: false, 
        message: error.message || '登入過程中發生錯誤' 
      }
    }
  }

  async register(data: {
    name: string
    email: string
    password: string
    phone?: string
    website?: string
  }): Promise<{ success: boolean; partner?: AffiliatePartner; message?: string }> {
    try {
      const response = await this.createPartner({
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone,
        company: data.website // 將 website 作為 company 傳送
      })

      if (response.partner) {
        // 儲存 token 和 partner 資料到 localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('affiliate_token', 'temp-token-' + response.partner.id)
          localStorage.setItem('affiliate_partner', JSON.stringify(response.partner))
        }
        
        return { 
          success: true, 
          partner: response.partner, 
          message: '註冊成功！' 
        }
      } else {
        return { 
          success: false, 
          message: '註冊失敗，請稍後再試' 
        }
      }
    } catch (error: any) {
      console.error('Registration error:', error)
      return { 
        success: false, 
        message: error.message || '註冊過程中發生錯誤' 
      }
    }
  }

  async updateProfile(data: Partial<AffiliatePartner>): Promise<AffiliatePartner> {
    try {
      const currentProfile = await this.getProfile()
      
      const response = await this.makeRequest('/store/affiliate/profile', {
        method: 'PUT',
        body: JSON.stringify({
          partnerId: currentProfile.id,
          name: data.name,
          phone: data.phone,
          website: data.website,
          socialMedia: data.socialMedia,
          address: data.address
        })
      })

      if (response.success && response.partner) {
        const updatedPartner = this.transformPartnerData(response.partner)
        
        // 更新 localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('affiliate_partner', JSON.stringify(updatedPartner))
        }
        
        return updatedPartner
      } else {
        throw new Error(response.message || '更新個人資料失敗')
      }
    } catch (error: any) {
      console.error('更新個人資料錯誤:', error)
      throw new Error(error.message || '更新個人資料失敗')
    }
  }

  async updatePassword(data: { currentPassword: string; newPassword: string }): Promise<{ success: boolean; message?: string }> {
    try {
      const currentProfile = await this.getProfile()
      
      const response = await this.makeRequest('/store/affiliate/password', {
        method: 'PUT',
        body: JSON.stringify({
          partnerId: currentProfile.id,
          currentPassword: data.currentPassword,
          newPassword: data.newPassword
        })
      })

      if (response.success) {
        return { 
          success: true, 
          message: response.message || '密碼更新成功' 
        }
      } else {
        return { 
          success: false, 
          message: response.message || '密碼更新失敗'
        }
      }
    } catch (error: any) {
      console.error('更新密碼錯誤:', error)
      return { 
        success: false, 
        message: error.message || '更新密碼失敗' 
      }
    }
  }

  async updatePaymentInfo(data: {
    accountName: string
    bankCode: string
    accountNumber: string
    taxId?: string
  }): Promise<AffiliatePartner> {
    try {
      const currentProfile = await this.getProfile()
      
      const response = await this.makeRequest('/store/affiliate/payment', {
        method: 'PUT',
        body: JSON.stringify({
          partnerId: currentProfile.id,
          accountName: data.accountName,
          bankCode: data.bankCode,
          accountNumber: data.accountNumber,
          taxId: data.taxId
        })
      })

      if (response.success && response.partner) {
        const updatedPartner = this.transformPartnerData(response.partner)
        
        // 更新 localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('affiliate_partner', JSON.stringify(updatedPartner))
        }
        
        return updatedPartner
      } else {
        throw new Error(response.message || '更新付款資訊失敗')
      }
    } catch (error: any) {
      console.error('更新付款資訊錯誤:', error)
      throw new Error(error.message || '更新付款資訊失敗')
    }
  }

  async getEarnings(
    page: number = 1, 
    limit: number = 20,
    type: 'all' | 'self' | 'referral' = 'all',
    month: string = 'all'
  ): Promise<{
    earnings: AffiliateEarning[]
    total: number
    totalPages: number
  }> {
    try {
      // 獲取當前合作夥伴信息
      const partnerData = await this.getProfile()
      if (!partnerData?.id) {
        throw new Error('未找到合作夥伴信息，請重新登入')
      }

      // 調用真實的後端 API，添加 type 和 month 參數
      let apiUrl = `/store/affiliate/earnings?partnerId=${partnerData.id}&page=${page}&limit=${limit}&type=${type}`
      if (month !== 'all') {
        apiUrl += `&month=${month}`
      }
      const response = await this.makeRequest(apiUrl)
      
      if (response.success && response.data && response.data.earnings) {
        return {
          earnings: response.data.earnings.map((earning: any) => ({
            id: earning.id || earning.orderId || `earning_${Date.now()}`,
            partnerId: earning.partnerId || partnerData.id,
            orderId: earning.orderId || '',
            orderNumber: earning.orderNumber || earning.order_number || '',
            customerEmail: earning.customerEmail || earning.customer_email || '客戶信息保密',
            productName: earning.productName || earning.product_name || '商品信息',
            orderAmount: typeof earning.orderAmount === 'number' ? earning.orderAmount : (earning.order_amount || 0),
            commissionAmount: typeof earning.commissionAmount === 'number' ? earning.commissionAmount : (earning.commission_amount || 0),
            commissionRate: earning.commissionRate || earning.commission_rate || 0.05,
            status: earning.status || 'pending',
            createdAt: earning.createdAt || earning.created_at || new Date().toISOString(),
            paidAt: earning.paidAt || earning.paid_at
          })),
          total: response.data.total || 0,
          totalPages: response.data.totalPages || 1
        }
      } else {
        throw new Error('API 未返回收益數據')
      }

    } catch (error) {
      console.error('獲取收益歷史失敗:', error)
      throw error // 直接拋出錯誤，不再使用備用數據
    }
  }

  async logout(): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('affiliate_token')
      localStorage.removeItem('affiliate_partner')
    }
  }
}

export const affiliateAPI = new AffiliateAPI()

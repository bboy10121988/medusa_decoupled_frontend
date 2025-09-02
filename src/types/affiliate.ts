export type AffiliateStatPoint = {
  date: string
  clicks: number
  conversions: number
  revenue: number
  commission: number
}

export type AffiliateStatsSummary = {
  period: string
  totalClicks: number
  totalConversions: number
  totalRevenue: number
  totalCommission: number
  trend: AffiliateStatPoint[]
}

export type AffiliateLink = {
  id: string
  name: string
  url: string
  createdAt: string
  clicks: number
  conversions: number
}

export type AffiliatePayout = {
  id: string
  amount: number
  currency: string
  status: 'pending' | 'processing' | 'paid' | 'failed'
  requestedAt: string
  paidAt?: string
}

export type AffiliateSettings = {
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


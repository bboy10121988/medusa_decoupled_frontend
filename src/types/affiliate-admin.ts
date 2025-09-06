export type AffiliateApplication = {
  id: string
  email: string
  displayName: string
  website?: string
  created_at: string
}

export type AffiliateOrder = {
  date: string
  orderValue: number
  commission: number
  orderId: string
  products?: Array<{
    id: string
    title: string
    quantity: number
    price: number
  }>
}

export type AffiliateStats = {
  orders: AffiliateOrder[]
  totalOrders: number
  totalRevenue: number
  totalCommission: number
}

export type AffiliateSettings = {
  profile?: {
    displayName?: string
    email?: string
    website?: string
  }
  commissionRate?: number
  status?: 'active' | 'inactive' | 'pending'
}

export type AffiliateStatsData = {
  affiliateStats: Record<string, AffiliateStats>
}

export type AffiliateSettingsData = {
  settings: Record<string, AffiliateSettings>
}

export type AffiliatePerformance = {
  id: string
  name: string
  orders: number
  revenue: number
  commission: number
  conversionRate: number
}

export type ProductPerformance = {
  id: string
  title: string
  sales: number
  revenue: number
  affiliateCount: number
  orders: number
}

export type AnalyticsResponse = {
  overview: {
    totalRevenue: number
    totalCommission: number
    totalOrders: number
    averageOrderValue: number
    conversionRate: number
    topPerformingAffiliate: string
  }
  trends: Array<{
    date: string
    revenue: number
    orders: number
    commission: number
  }>
  topAffiliates: AffiliatePerformance[]
  topProducts: ProductPerformance[]
}


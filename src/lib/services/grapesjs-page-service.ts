import { createClient } from '@sanity/client'

// 檢查是否在客戶端環境中
const isClient = typeof window !== 'undefined'

// 創建寫入客戶端的函數
function getWriteClient() {
  // 檢查 token 是否有效
  const token = process.env.NEXT_PUBLIC_SANITY_TOKEN || process.env.SANITY_API_TOKEN
  const hasValidToken = token && token !== 'your_sanity_write_token_here' && token.length > 10
  
  // 如果在 Sanity Studio 環境中，嘗試使用 Studio 的客戶端
  if (isClient && typeof window !== 'undefined' && (window as any).__sanityStudioClient) {
    return (window as any).__sanityStudioClient
  }

  // 創建標準的客戶端
  return createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01",
    useCdn: false, // 寫入操作不使用 CDN
    token: hasValidToken ? token : undefined,
    withCredentials: isClient && !hasValidToken, // 只有在沒有 token 時才使用 credentials
  })
}

// 使用唯讀客戶端進行讀取操作
import { client as readClient } from '@/lib/sanity'

export interface GrapesJSPageData {
  _id?: string
  _type: 'grapesJSPageV2'
  title: string
  slug: {
    current: string
  }
  description?: string
  status: 'draft' | 'preview' | 'published' | 'archived'
  publishedAt?: string
  version: number
  grapesHtml?: string
  grapesCss?: string
  grapesComponents?: string // JSON string
  grapesStyles?: string // JSON string
  homeModules?: any[]
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string[]
  ogImage?: any
  customCSS?: string
  customJS?: string
  viewport: 'responsive' | 'desktop' | 'tablet' | 'mobile'
  lastModified?: string
  editHistory?: any[]
}

export interface SavePageParams {
  title: string
  slug: string
  description?: string
  status?: 'draft' | 'preview' | 'published' | 'archived'
  grapesHtml: string
  grapesCss: string
  grapesComponents: any // GrapesJS components object
  grapesStyles: any // GrapesJS styles object
  homeModules?: any[]
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string[]
  customCSS?: string
  customJS?: string
  viewport?: 'responsive' | 'desktop' | 'tablet' | 'mobile'
}

export interface UpdatePageParams extends Partial<SavePageParams> {
  _id: string
  version?: number
}

class GrapesJSPageService {
  
  /**
   * 獲取所有 GrapesJS 頁面列表
   */
  async getAllPages(): Promise<GrapesJSPageData[]> {
    try {
      const response = await fetch('/api/pages/list')
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || '載入頁面列表失敗')
      }
      
      return result.pages || []
    } catch (error) {
      console.error('載入頁面列表失敗:', error)
      throw error
    }
  }

  /**
   * 根據 ID 獲取特定頁面
   */
  async getPageById(id: string): Promise<GrapesJSPageData | null> {
    const query = `
      *[_type == "grapesJSPageV2" && _id == $id][0] {
        _id,
        _type,
        title,
        slug,
        description,
        status,
        publishedAt,
        version,
        grapesHtml,
        grapesCss,
        grapesComponents,
        grapesStyles,
        homeModules,
        seoTitle,
        seoDescription,
        seoKeywords,
        ogImage,
        customCSS,
        customJS,
        viewport,
        lastModified,
        editHistory
      }
    `
    
    return await readClient.fetch(query, { id })
  }

  /**
   * 根據 slug 獲取特定頁面
   */
  async getPageBySlug(slug: string): Promise<GrapesJSPageData | null> {
    const query = `
      *[_type == "grapesJSPageV2" && slug.current == $slug][0] {
        _id,
        _type,
        title,
        slug,
        description,
        status,
        publishedAt,
        version,
        grapesHtml,
        grapesCss,
        grapesComponents,
        grapesStyles,
        homeModules,
        seoTitle,
        seoDescription,
        seoKeywords,
        ogImage,
        customCSS,
        customJS,
        viewport,
        lastModified,
        editHistory
      }
    `
    
    return await readClient.fetch(query, { slug })
  }

  /**
   * 創建新頁面
   */
  async createPage(params: SavePageParams): Promise<GrapesJSPageData> {
    try {
      const now = new Date().toISOString()
      
      const pageData = {
        _type: 'grapesJSPageV2',
        title: params.title,
        slug: {
          current: params.slug
        },
        description: params.description,
        status: params.status || 'draft',
        version: 1,
        grapesHtml: params.grapesHtml,
        grapesCss: params.grapesCss,
        grapesComponents: params.grapesComponents,
        grapesStyles: params.grapesStyles,
        homeModules: params.homeModules || [],
        seoTitle: params.seoTitle,
        seoDescription: params.seoDescription,
        seoKeywords: params.seoKeywords || [],
        customCSS: params.customCSS,
        customJS: params.customJS,
        viewport: params.viewport || 'responsive',
        createdAt: now,
        updatedAt: now
      }

      const response = await fetch('/api/pages/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pageId: params.slug,
          pageData
        })
      })

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || '創建頁面失敗')
      }
      
      return result.data
    } catch (error: any) {
      console.error('創建頁面失敗:', error)
      throw error
    }
  }

  /**
   * 更新現有頁面
   */
  async updatePage(params: UpdatePageParams): Promise<GrapesJSPageData> {
    try {
      const writeClient = getWriteClient()
      const now = new Date().toISOString()
      
      // 取得當前頁面以比較變更
      const currentPage = await this.getPageById(params._id)
      if (!currentPage) {
        throw new Error('Page not found')
      }

      // 準備更新數據
      const updateData: any = {
        lastModified: now,
        version: (currentPage.version || 1) + 1
      }

      // 只更新有提供的欄位
      if (params.title) updateData.title = params.title
      if (params.slug) updateData.slug = { current: params.slug }
      if (params.description !== undefined) updateData.description = params.description
      if (params.status) updateData.status = params.status
      if (params.grapesHtml) updateData.grapesHtml = params.grapesHtml
      if (params.grapesCss) updateData.grapesCss = params.grapesCss
      if (params.grapesComponents) updateData.grapesComponents = JSON.stringify(params.grapesComponents)
      if (params.grapesStyles) updateData.grapesStyles = JSON.stringify(params.grapesStyles)
      if (params.homeModules) updateData.homeModules = params.homeModules
      if (params.seoTitle !== undefined) updateData.seoTitle = params.seoTitle
      if (params.seoDescription !== undefined) updateData.seoDescription = params.seoDescription
      if (params.seoKeywords) updateData.seoKeywords = params.seoKeywords
      if (params.customCSS !== undefined) updateData.customCSS = params.customCSS
      if (params.customJS !== undefined) updateData.customJS = params.customJS
      if (params.viewport) updateData.viewport = params.viewport

      // 發布狀態變更處理
      if (params.status === 'published' && currentPage.status !== 'published') {
        updateData.publishedAt = now
      }

      // 添加編輯歷史
      const newHistoryEntry = {
        timestamp: now,
        action: 'updated',
        editor: 'GrapesJS Editor',
        changes: this.generateChangesSummary(currentPage, params)
      }

      updateData.editHistory = [
        ...(currentPage.editHistory || []),
        newHistoryEntry
      ]

      const result = await writeClient
        .patch(params._id)
        .set(updateData)
        .commit()

      return result as unknown as GrapesJSPageData
    } catch (error: any) {
      console.error('更新頁面失敗:', error)
      
      if (error.message?.includes('Insufficient permissions') || error.message?.includes('Unauthorized')) {
        throw new Error('❌ Sanity 寫入權限不足。請確認您的 token 設定或在 Sanity Studio 中操作。')
      }
      
      throw new Error('更新頁面失敗: ' + error.message)
    }
  }

  /**
   * 刪除頁面
   */
  async deletePage(id: string): Promise<void> {
    const writeClient = getWriteClient()
    await writeClient.delete(id)
  }

  /**
   * 複製頁面
   */
  async duplicatePage(id: string, newTitle: string, newSlug: string): Promise<GrapesJSPageData> {
    const originalPage = await this.getPageById(id)
    if (!originalPage) {
      throw new Error('Original page not found')
    }

    const duplicateParams: SavePageParams = {
      title: newTitle,
      slug: newSlug,
      description: originalPage.description,
      status: 'draft', // 複製的頁面總是從草稿開始
      grapesHtml: originalPage.grapesHtml || '',
      grapesCss: originalPage.grapesCss || '',
      grapesComponents: originalPage.grapesComponents ? JSON.parse(originalPage.grapesComponents) : {},
      grapesStyles: originalPage.grapesStyles ? JSON.parse(originalPage.grapesStyles) : {},
      homeModules: originalPage.homeModules || [],
      seoTitle: originalPage.seoTitle,
      seoDescription: originalPage.seoDescription,
      seoKeywords: originalPage.seoKeywords || [],
      customCSS: originalPage.customCSS,
      customJS: originalPage.customJS,
      viewport: originalPage.viewport
    }

    return await this.createPage(duplicateParams)
  }

  /**
   * 獲取已發布的頁面（用於前端顯示）
   */
  async getPublishedPages(): Promise<GrapesJSPageData[]> {
    const query = `
      *[_type == "grapesJSPageV2" && status == "published"] | order(publishedAt desc) {
        _id,
        _type,
        title,
        slug,
        description,
        grapesHtml,
        grapesCss,
        seoTitle,
        seoDescription,
        seoKeywords,
        ogImage,
        customCSS,
        customJS,
        viewport,
        publishedAt
      }
    `
    
    return await readClient.fetch(query)
  }

  /**
   * 搜尋頁面
   */
  async searchPages(searchTerm: string): Promise<GrapesJSPageData[]> {
    const query = `
      *[_type == "grapesJSPageV2" && (
        title match $searchTerm ||
        description match $searchTerm ||
        seoTitle match $searchTerm ||
        seoDescription match $searchTerm
      )] | order(lastModified desc) {
        _id,
        _type,
        title,
        slug,
        description,
        status,
        publishedAt,
        version,
        lastModified,
        seoTitle,
        seoDescription
      }
    `
    
    return await readClient.fetch(query, { 
      searchTerm: `*${searchTerm}*` 
    })
  }

  /**
   * 生成變更摘要
   */
  private generateChangesSummary(current: GrapesJSPageData, updates: UpdatePageParams): string {
    const changes: string[] = []
    
    if (updates.title && updates.title !== current.title) {
      changes.push(`標題: "${current.title}" → "${updates.title}"`)
    }
    if (updates.status && updates.status !== current.status) {
      changes.push(`狀態: "${current.status}" → "${updates.status}"`)
    }
    if (updates.grapesHtml && updates.grapesHtml !== current.grapesHtml) {
      changes.push('HTML 內容已更新')
    }
    if (updates.grapesCss && updates.grapesCss !== current.grapesCss) {
      changes.push('CSS 樣式已更新')
    }
    if (updates.grapesComponents) {
      changes.push('頁面組件已更新')
    }
    if (updates.homeModules) {
      changes.push('首頁模組配置已更新')
    }
    
    return changes.length > 0 ? changes.join(', ') : '一般更新'
  }

  /**
   * 檢查 slug 是否可用
   */
  async isSlugAvailable(slug: string, excludeId?: string): Promise<boolean> {
    let query = `count(*[_type == "grapesJSPageV2" && slug.current == $slug`
    const params: any = { slug }
    
    if (excludeId) {
      query += ` && _id != $excludeId`
      params.excludeId = excludeId
    }
    
    query += `])`
    
    const count = await readClient.fetch(query, params)
    return count === 0
  }
}

// 匯出單例實例
export const grapesJSPageService = new GrapesJSPageService()
export default grapesJSPageService
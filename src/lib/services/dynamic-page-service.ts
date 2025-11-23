import { createClient } from '@sanity/client'

// 檢查是否在客戶端環境中
const isClient = typeof window !== 'undefined'

// 創建寫入客戶端的函數
function getWriteClient() {
  // 檢查 token 是否有效
  const token = process.env.NEXT_PUBLIC_SANITY_TOKEN || process.env.SANITY_API_TOKEN
  const hasValidToken = token && token !== 'your_sanity_write_token_here' && token.length > 10
  
  if (!hasValidToken) {
    // console.error('Sanity write token is missing or invalid. Please check your environment variables.')
    throw new Error('Sanity write token is required for write operations')
  }
  
  // 如果在 Sanity Studio 環境中，嘗試使用 Studio 的客戶端
  if (isClient && typeof window !== 'undefined' && (window as any).__sanityStudioClient) {
    return (window as any).__sanityStudioClient
  }

  // 創建標準的客戶端
  return createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || '',
    apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01",
    useCdn: false, // 寫入操作不使用 CDN
    ...(token ? { token } : {}),
    withCredentials: false,
  })
}

// 使用唯讀客戶端進行讀取操作
import { client as readClient } from '@/lib/sanity'

export interface DynamicPageData {
  _id?: string
  _type: 'dynamicPage'
  _createdAt?: string
  _updatedAt?: string
  title: string
  slug: {
    current: string
  }
  description?: string
  status: 'draft' | 'preview' | 'published' | 'archived'
  publishedAt?: string
  version: number
  pageContent?: any[]
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

class DynamicPageService {
  
  /**
   * 獲取所有動態頁面列表
   */
  async getAllPages(): Promise<DynamicPageData[]> {
    try {
      const pages = await readClient.fetch(`
        *[_type == "dynamicPage"] | order(_createdAt desc) {
          _id,
          _type,
          _createdAt,
          _updatedAt,
          title,
          slug,
          description,
          status,
          publishedAt,
          version,
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
      `)
      
      return pages || []
    } catch (error) {
      // console.error('載入頁面列表失敗:', error)
      throw error
    }
  }

  /**
   * 根據 ID 獲取特定頁面
   */
  async getPageById(id: string): Promise<DynamicPageData | null> {
    try {
      // 驗證參數
      if (!id || id.trim() === '') {
        // console.warn('getPageById: ID 參數為空')
        return null
      }

      const query = `
        *[_type == "dynamicPage" && _id == $id][0] {
          _id,
          _type,
          title,
          slug,
          description,
          status,
          publishedAt,
          version,
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
    } catch (error) {
      // console.error('獲取頁面失敗:', error)
      throw error
    }
  }

  /**
   * 根據 slug 獲取特定頁面
   */
  async getPageBySlug(slug: string): Promise<DynamicPageData | null> {
    try {
      // 驗證參數
      if (!slug || slug.trim() === '') {
        // console.warn('getPageBySlug: slug 參數為空')
        return null
      }

      const query = `
        *[_type == "dynamicPage" && slug.current == $slug][0] {
          _id,
          _type,
          title,
          slug,
          description,
          status,
          publishedAt,
          version,
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
    } catch (error) {
      // console.error('根據slug獲取頁面失敗:', error)
      throw error
    }
  }

  /**
   * 創建新頁面
   */
  async createPage(params: SavePageParams): Promise<DynamicPageData> {
    try {
      const writeClient = getWriteClient()
      const now = new Date().toISOString()
      
      const pageData = {
        _type: 'dynamicPage',
        title: params.title,
        slug: {
          current: params.slug
        },
        description: params.description,
        status: params.status || 'draft',
        version: 1,
        homeModules: params.homeModules || [],
        seoTitle: params.seoTitle,
        seoDescription: params.seoDescription,
        seoKeywords: params.seoKeywords || [],
        customCSS: params.customCSS,
        customJS: params.customJS,
        viewport: params.viewport || 'responsive',
        createdAt: now,
        lastModified: now,
        editHistory: [{
          timestamp: now,
          action: 'created',
          editor: 'Editor',
          changes: 'Page created'
        }]
      }

      const result = await writeClient.create(pageData)
      // console.log('頁面創建成功:', result._id)
      return result as unknown as DynamicPageData
      
    } catch (error: any) {
      // console.error('創建頁面失敗:', error)
      
      if (error.message?.includes('Insufficient permissions') || error.message?.includes('Unauthorized')) {
        throw new Error('❌ Sanity 寫入權限不足。請確認您的 token 設定或在 Sanity Studio 中操作。')
      }
      
      if (error.details?.length > 0) {
        const detailMessages = error.details.map((d: any) => d.message).join(', ')
        throw new Error('創建頁面失敗: ' + detailMessages)
      }
      
      throw new Error('創建頁面失敗: ' + error.message)
    }
  }

  /**
   * 更新現有頁面
   */
  async updatePage(params: UpdatePageParams): Promise<DynamicPageData> {
    try {
      // console.log('🔄 updatePage 開始執行:', {
        // pageId: params._id,
        // title: params.title,
        // status: params.status,
      // })
      
      // 輸入驗證 - 檢查必要參數
      if (!params._id || params._id.trim() === '') {
        throw new Error('必須提供有效的頁面 ID')
      }
      
      // 獲取並驗證客戶端
      const writeClient = getWriteClient()
      if (!writeClient) {
        throw new Error('無法創建 Sanity 寫入客戶端，請檢查配置和權限')
      }
      
      const now = new Date().toISOString()
      
      // 取得當前頁面以比較變更，包含錯誤處理
      // console.log('🔍 正在檢查頁面是否存在:', params._id)
      let currentPage: DynamicPageData | null = null
      
      try {
        currentPage = await this.getPageById(params._id)
      } catch (queryError) {
        // console.error('查詢頁面失敗:', queryError)
        throw new Error(`無法讀取頁面信息: ${queryError instanceof Error ? queryError.message : '未知錯誤'}`)
      }
      
      if (!currentPage) {
        // console.error('❌ 頁面不存在:', params._id)
        throw new Error(`找不到 ID 為 ${params._id} 的頁面`)
      }
      
      // console.log('✅ 頁面存在，當前狀態:', currentPage.status)

      // 準備更新數據
      const updateData: any = {
        lastModified: now,
        version: (currentPage.version || 1) + 1
      }

      // 只更新有提供的欄位，並進行額外驗證
      if (params.title) {
        if (typeof params.title !== 'string' || params.title.trim() === '') {
          // console.warn('忽略無效的標題值')
        } else {
          updateData.title = params.title.trim()
        }
      }
      
      if (params.slug) {
        if (typeof params.slug !== 'string' || params.slug.trim() === '') {
          // console.warn('忽略無效的 slug 值')
        } else {
          updateData.slug = { current: params.slug.trim() }
        }
      }
      
      if (params.description !== undefined) updateData.description = params.description
      if (params.status) {
        if (['draft', 'preview', 'published', 'archived'].includes(params.status)) {
          updateData.status = params.status
        } else {
          // console.warn(`忽略無效的狀態值: ${params.status}`)
        }
      }
      
      if (params.homeModules !== undefined) updateData.homeModules = params.homeModules
      if (params.seoTitle !== undefined) updateData.seoTitle = params.seoTitle
      if (params.seoDescription !== undefined) updateData.seoDescription = params.seoDescription
      if (params.seoKeywords) updateData.seoKeywords = params.seoKeywords
      if (params.customCSS !== undefined) updateData.customCSS = params.customCSS
      if (params.customJS !== undefined) updateData.customJS = params.customJS
      if (params.viewport) {
        if (['responsive', 'desktop', 'tablet', 'mobile'].includes(params.viewport)) {
          updateData.viewport = params.viewport
        } else {
          // console.warn(`忽略無效的視口值: ${params.viewport}`)
        }
      }

      // 發布狀態變更處理
      if (params.status === 'published' && currentPage.status !== 'published') {
        updateData.publishedAt = now
      }

      // 添加編輯歷史
      const newHistoryEntry = {
        timestamp: now,
        action: 'updated',
        editor: 'Editor',
        changes: this.generateChangesSummary(currentPage, params)
      }

      updateData.editHistory = [
        ...(currentPage.editHistory || []),
        newHistoryEntry
      ]
      
      // 實現重試邏輯
      const maxRetries = 3
      let retryCount = 0
      let lastError = null
      
      while (retryCount < maxRetries) {
        try {
          // console.log(`嘗試提交更新到 Sanity (嘗試 ${retryCount + 1}/${maxRetries})`)
          
          // 設定超時
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('操作超時')), 15000)
          })
          
          // 執行 Sanity 更新請求
          const updatePromise = writeClient
            .patch(params._id)
            .set(updateData)
            .commit()
          
          // 使用 Promise.race 實現超時處理
          const result = await Promise.race([
            updatePromise,
            timeoutPromise
          ])

          // console.log('✅ Sanity 更新成功:', {
            // pageId: params._id,
            // newStatus: updateData.status,
            // version: updateData.version
          // })

          return result as unknown as DynamicPageData
          
        } catch (error: any) {
          lastError = error
          retryCount++
          
          // console.error(`Sanity 更新失敗 (嘗試 ${retryCount}/${maxRetries}):`, error)
          // console.error('錯誤詳細信息:', {
            // message: error.message,
            // name: error.name,
            // stack: error.stack,
            // details: error.details || 'No details'
          // })
          
          // 如果是權限錯誤，立即失敗不重試
          if (error.message?.includes('permission') || error.message?.includes('Unauthoriz')) {
            throw new Error('❌ Sanity 寫入權限不足。請確認您的 token 設定或在 Sanity Studio 中操作。')
          }
          
          // 如果不是最後一次重試，等待後重試
          if (retryCount < maxRetries) {
            const delay = 1000 * Math.pow(2, retryCount - 1)
            // console.log(`等待 ${delay}ms 後重試...`)
            await new Promise(resolve => setTimeout(resolve, delay))
          }
        }
      }
      
      // 所有重試都失敗
      // console.error('達到最大重試次數，更新失敗')
      throw lastError || new Error('更新頁面失敗，請稍後重試')
      
    } catch (error: any) {
      // console.error('更新頁面失敗:', error)
      
      // 提供更詳細的錯誤信息
      if (error.message?.includes('Insufficient permissions') || error.message?.includes('Unauthorized')) {
        throw new Error('❌ Sanity 寫入權限不足。請確認您的 token 設定或在 Sanity Studio 中操作。')
      } else if (error.message?.includes('timeout') || error.message?.includes('Timeout')) {
        throw new Error('❌ 更新頁面請求超時。請檢查您的網絡連接並稍後重試。')
      } else if (error.message?.includes('network') || error.message?.includes('Network')) {
        throw new Error('❌ 網絡連接問題。請檢查您的網絡連接並稍後重試。')
      } else if (error.details?.length > 0) {
        const detailMessages = error.details.map((d: any) => d.message).join(', ')
        throw new Error('更新頁面失敗: ' + detailMessages)
      } else {
        throw new Error('更新頁面失敗: ' + error.message)
      }
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
  async duplicatePage(id: string, newTitle: string, newSlug: string): Promise<DynamicPageData> {
    const originalPage = await this.getPageById(id)
    if (!originalPage) {
      throw new Error('Original page not found')
    }

    const duplicateParams: SavePageParams = {
      title: newTitle,
      slug: newSlug,
      ...(originalPage.description ? { description: originalPage.description } : {}),
      status: 'draft', // 複製的頁面總是從草稿開始
      homeModules: originalPage.homeModules || [],
      ...(originalPage.seoTitle ? { seoTitle: originalPage.seoTitle } : {}),
      ...(originalPage.seoDescription ? { seoDescription: originalPage.seoDescription } : {}),
      seoKeywords: originalPage.seoKeywords || [],
      ...(originalPage.customCSS ? { customCSS: originalPage.customCSS } : {}),
      ...(originalPage.customJS ? { customJS: originalPage.customJS } : {}),
      viewport: originalPage.viewport
    }

    return await this.createPage(duplicateParams)
  }

  /**
   * 獲取已發布的頁面（用於前端顯示）
   */
  async getPublishedPages(): Promise<DynamicPageData[]> {
    const query = `
      *[_type == "dynamicPage" && status == "published"] | order(publishedAt desc) {
        _id,
        _type,
        title,
        slug,
        description,
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
  async searchPages(searchTerm: string): Promise<DynamicPageData[]> {
    const query = `
      *[_type == "dynamicPage" && (
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
  private generateChangesSummary(current: DynamicPageData, updates: UpdatePageParams): string {
    const changes: string[] = []
    
    if (updates.title && updates.title !== current.title) {
      changes.push(`標題: "${current.title}" → "${updates.title}"`)
    }
    if (updates.status && updates.status !== current.status) {
      changes.push(`狀態: "${current.status}" → "${updates.status}"`)
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
    let query = `count(*[_type == "dynamicPage" && slug.current == $slug`
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
export const dynamicPageService = new DynamicPageService()
export default dynamicPageService

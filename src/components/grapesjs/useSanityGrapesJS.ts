import { useEffect, useState } from 'react'
import { createClient } from '@sanity/client'
import type { Editor } from 'grapesjs'

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  useCdn: false,
  token: process.env.NEXT_PUBLIC_SANITY_TOKEN,
})

interface SanityPage {
  _id: string
  _type: string
  title: string
  slug: { current: string }
  grapesHtml?: string
  grapesCss?: string
  grapesComponents?: any
  grapesStyles?: any
  status: 'draft' | 'published'
  _createdAt: string
  _updatedAt: string
}

export interface UseSanityGrapesJSProps {
  editor: Editor | null
  pageId?: string
  autoSave?: boolean
  autoSaveInterval?: number
}

export const useSanityGrapesJS = ({
  editor,
  pageId,
  autoSave = true,
  autoSaveInterval = 5000
}: UseSanityGrapesJSProps) => {
  const [currentPage, setCurrentPage] = useState<SanityPage | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // 載入頁面數據
  const loadPage = async (id: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const page = await sanityClient.fetch(`
        *[_type == "grapesJSPage" && _id == $id][0] {
          _id,
          _type,
          title,
          slug,
          grapesHtml,
          grapesCss,
          grapesComponents,
          grapesStyles,
          status,
          _createdAt,
          _updatedAt
        }
      `, { id })

      if (!page) {
        throw new Error('頁面不存在')
      }

      setCurrentPage(page)

      // 載入到編輯器
      if (editor) {
        if (page.grapesComponents) {
          editor.loadProjectData({
            components: page.grapesComponents,
            styles: page.grapesStyles || []
          })
        } else if (page.grapesHtml) {
          editor.setComponents(page.grapesHtml)
          if (page.grapesCss) {
            editor.setStyle(page.grapesCss)
          }
        }
      }

      setHasUnsavedChanges(false)
      return page
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '載入頁面失敗'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // 保存頁面數據
  const savePage = async (data?: Partial<SanityPage>) => {
    if (!editor || !currentPage) {
      throw new Error('編輯器或頁面數據不存在')
    }

    try {
      setIsSaving(true)
      setError(null)

      // 獲取編輯器數據
      const projectData = editor.getProjectData()
      const html = editor.getHtml()
      const css = editor.getCss()

      const updateData = {
        grapesHtml: html,
        grapesCss: css,
        grapesComponents: projectData.components,
        grapesStyles: projectData.styles,
        _id: currentPage._id,
        ...data
      }

      const updatedPage = await sanityClient
        .patch(currentPage._id)
        .set(updateData)
        .commit()

      setCurrentPage(prev => prev ? { ...prev, ...updatedPage } : null)
      setHasUnsavedChanges(false)
      
      return updatedPage
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '保存失敗'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }

  // 創建新頁面
  const createPage = async (title: string, slug: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const newPage = await sanityClient.create({
        _type: 'grapesJSPage',
        title,
        slug: { current: slug },
        grapesHtml: '',
        grapesCss: '',
        grapesComponents: [],
        grapesStyles: [],
        status: 'draft' as const
      })

      setCurrentPage(newPage as SanityPage)
      return newPage
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '創建頁面失敗'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // 監聽編輯器變化
  useEffect(() => {
    if (!editor) return

    const handleChange = () => {
      setHasUnsavedChanges(true)
    }

    // 監聽各種變化事件
    editor.on('component:add', handleChange)
    editor.on('component:remove', handleChange)
    editor.on('component:update', handleChange)
    editor.on('component:styleUpdate', handleChange)
    editor.on('style:add', handleChange)
    editor.on('style:remove', handleChange)
    editor.on('style:update', handleChange)

    return () => {
      editor.off('component:add', handleChange)
      editor.off('component:remove', handleChange)
      editor.off('component:update', handleChange)
      editor.off('component:styleUpdate', handleChange)
      editor.off('style:add', handleChange)
      editor.off('style:remove', handleChange)
      editor.off('style:update', handleChange)
    }
  }, [editor])

  // 自動保存
  useEffect(() => {
    if (!autoSave || !hasUnsavedChanges || !currentPage) return

    const timer = setTimeout(async () => {
      try {
        await savePage()
        console.log('✅ 自動保存完成')
      } catch (error) {
        console.error('❌ 自動保存失敗:', error)
      }
    }, autoSaveInterval)

    return () => clearTimeout(timer)
  }, [hasUnsavedChanges, autoSave, autoSaveInterval, currentPage])

  // 頁面載入
  useEffect(() => {
    if (pageId && editor) {
      loadPage(pageId)
    }
  }, [pageId, editor])

  return {
    currentPage,
    isLoading,
    isSaving,
    error,
    hasUnsavedChanges,
    loadPage,
    savePage,
    createPage,
    setError
  }
}

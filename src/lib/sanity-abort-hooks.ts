/**
 * Sanity 請求的 AbortError 安全處理
 * 專門用於處理 Sanity CMS 請求中的 AbortError
 */
'use client'
import { useEffect, useMemo } from 'react'
import { isAbortError } from './abort-utils'

/**
 * 安全的 Sanity 請求 Hook
 * 自動處理組件卸載時的請求取消
 */
export function useSanityRequest<T>(
  requestFn: (signal: AbortSignal) => Promise<T>,
  deps: any[] = []
): {
  execute: () => Promise<T | null>
  controller: AbortController
} {
  const controller = useMemo(() => new AbortController(), deps)
  
  useEffect(() => {
    return () => {
      if (!controller.signal.aborted) {
        controller.abort('Component unmounted')
      }
    }
  }, [controller])
  
  const execute = async (): Promise<T | null> => {
    try {
      if (controller.signal.aborted) {
        console.log('🔄 Request skipped - already aborted')
        return null
      }
      
      const result = await requestFn(controller.signal)
      return result
    } catch (error) {
      if (isAbortError(error)) {
        console.log('🔄 Sanity request cancelled (normal behavior)')
        return null
      }
      throw error // 重新拋出非 AbortError
    }
  }
  
  return { execute, controller }
}

/**
 * 防抖的 Sanity 搜索 Hook
 * 避免快速輸入導致的多重請求
 */
export function useDebouncedSanitySearch<T>(
  searchFn: (query: string, signal: AbortSignal) => Promise<T>,
  delay: number = 300
) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  // 防抖查詢
  const debouncedQuery = useMemo(() => {
    const timeoutId = setTimeout(() => query, delay)
    return () => clearTimeout(timeoutId)
  }, [query, delay])
  
  const { execute } = useSanityRequest(
    (signal) => searchFn(query, signal),
    [query]
  )
  
  useEffect(() => {
    if (query.trim()) {
      setIsLoading(true)
      execute()
        .then(result => {
          setResults(result)
          setIsLoading(false)
        })
        .catch(error => {
          if (!isAbortError(error)) {
            console.error('Search error:', error)
          }
          setIsLoading(false)
        })
    } else {
      setResults(null)
      setIsLoading(false)
    }
  }, [debouncedQuery, execute])
  
  return {
    query,
    setQuery,
    results,
    isLoading
  }
}

// 需要動態導入 useState
function useState<T>(initialState: T) {
  try {
    return require('react').useState(initialState)
  } catch {
    // SSR fallback
    return [initialState, () => {}]
  }
}

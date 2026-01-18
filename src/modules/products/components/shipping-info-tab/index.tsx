"use client"

import { useEffect, useState } from 'react'

type ShippingInfoTabProps = {
  product?: any
  countryCode?: string
}

interface ReturnPageData {
  htmlContent: string
  cssContent: string
  title: string
}

// 將 pageContent (Portable Text) 轉換為 HTML
const convertPageContentToHtml = (pageContent: any[]): string => {
  let html = ''
  let currentList: string[] = []
  // let currentListLevel = 0

  pageContent.forEach((item: any) => {
    if (item._type === 'textBlock' && item.content) {
      item.content.forEach((block: any) => {
        if (block._type === 'block') {
          const text = block.children?.map((child: any) => {
            const childText = child.text || ''
            if (child.marks?.includes('strong')) {
              return `<strong>${childText}</strong>`
            }
            return childText
          }).join('') || ''

          // 處理標題
          if (block.style === 'h2') {
            // 如果有未完成的列表，先結束它
            if (currentList.length > 0) {
              html += `<ol>\n${currentList.join('')}</ol>\n`
              currentList = []
            }
            html += `<h2>${text}</h2>\n`
          }
          // 處理列表項目
          else if (block.style === 'normal' && block.listItem === 'number') {
            currentList.push(`  <li>${text}</li>\n`)
          }
          // 處理普通段落
          else if (block.style === 'normal') {
            // 如果有未完成的列表，先結束它
            if (currentList.length > 0) {
              html += `<ol>\n${currentList.join('')}</ol>\n`
              currentList = []
            }
            if (text.trim()) {
              html += `<p>${text}</p>\n`
            }
          }
        }
      })
    }
  })

  // 處理最後可能未完成的列表
  if (currentList.length > 0) {
    html += `<ol>\n${currentList.join('')}</ol>\n`
  }

  return html
  return html
}

const getLocalizedFallback = (countryCode: string) => {
  if (countryCode === 'us') {
    return {
      title: 'Return Policy',
      htmlContent: `
        <div class="return-policy-content">
          <h2>Return Policy</h2>
          <div class="policy-section">
            <h3>Return Conditions</h3>
            <ul>
              <li>7-day appreciation period</li>
              <li>Items must be in new condition</li>
              <li>Personal hygiene items cannot be returned</li>
              <li>Customized items cannot be returned</li>
            </ul>
          </div>
          <div class="policy-section">
            <h3>Return Process</h3>
            <ol>
              <li>Contact customer service to request a return</li>
              <li>Fill out the return application form</li>
              <li>Send back the item and wait for inspection</li>
              <li>Refund will be processed after approval</li>
            </ol>
          </div>
        </div>
      `
    }
  }
  if (countryCode === 'jp') {
    return {
      title: '返品・交換ポリシー',
      htmlContent: `
        <div class="return-policy-content">
          <h2>返品・交換ポリシー</h2>
          <div class="policy-section">
            <h3>返品条件</h3>
            <ul>
              <li>7日間の鑑賞期間（クーリングオフ）</li>
              <li>商品は未使用の状態である必要があります</li>
              <li>個人衛生用品は返品・交換できません</li>
              <li>カスタマイズ商品は返品・交換の対象外です</li>
            </ul>
          </div>
          <div class="policy-section">
            <h3>返品プロセス</h3>
            <ol>
              <li>カスタマーサービスに連絡して返品を申請</li>
              <li>返品申請フォームに記入</li>
              <li>商品を返送し、検品をお待ちください</li>
              <li>承認後、返金処理が行われます</li>
            </ol>
          </div>
        </div>
      `
    }
  }
  // Default TW
  return {
    title: '退換貨規則',
    htmlContent: `
      <div class="return-policy-content">
        <h2>退換貨規則</h2>
        <div class="policy-section">
          <h3>退貨條件</h3>
          <ul>
            <li>商品享有7天鑑賞期</li>
            <li>退貨商品須保持全新狀態</li>
            <li>個人衛生用品不可退換貨</li>
            <li>客製化商品不適用退換貨</li>
          </ul>
        </div>
        <div class="policy-section">
          <h3>退貨流程</h3>
          <ol>
            <li>聯繫客服申請退貨</li>
            <li>填寫退貨申請表</li>
            <li>寄回商品並等待檢驗</li>
            <li>審核通過後進行退款</li>
          </ol>
        </div>
      </div>
    `
  }
}

const ShippingInfoTab = ({ product, countryCode = 'tw' }: ShippingInfoTabProps) => {
  const [returnPageData, setReturnPageData] = useState<ReturnPageData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReturnPage = async () => {
      try {
        // console.log('正在從 Sanity CMS 獲取退換貨規則內容...')

        // 直接從動態頁面 API 獲取內容
        const response = await fetch('/api/pages/return')
        // console.log('API 回應狀態:', response.status)

        if (response.ok) {
          const pageData = await response.json()
          // console.log('頁面資料:', pageData.title)

          // 處理動態頁面內容
          let htmlContent = pageData.htmlContent || ''

          // 如果沒有 htmlContent 但有 pageContent，轉換 pageContent 為 HTML
          if (!htmlContent && pageData.pageContent && pageData.pageContent.length > 0) {
            // console.log('🔄 轉換 pageContent 為 HTML...')
            htmlContent = convertPageContentToHtml(pageData.pageContent)
          }

          if (htmlContent || pageData.homeModules) {
            setReturnPageData({
              htmlContent: htmlContent,
              cssContent: pageData.cssContent || '',
              title: pageData.title || '退換貨規則'
            })
            // console.log('✅ 成功載入退換貨規則')
          } else {
            // console.warn('⚠️ 動態頁面內容為空')
            setReturnPageData({
              htmlContent: `
                <div class="return-policy-fallback">
                  <h2>退換貨政策</h2>
                  <p>請聯繫客服獲取詳細的退換貨規則資訊。</p>
                </div>
              `,
              cssContent: '.return-policy-fallback { padding: 20px; }',
              title: '退換貨規則'
            })
          }
        } else {
          // console.error('API 回應錯誤:', response.status)

          // 提供預設的退換貨規則內容
          const fallback = getLocalizedFallback(countryCode)
          setReturnPageData({
            htmlContent: fallback.htmlContent,
            cssContent: `
              .return-policy-content { padding: 20px; font-family: Arial, sans-serif; }
              .return-policy-content h2 { color: #333; margin-bottom: 20px; }
              .return-policy-content h3 { color: #555; margin: 15px 0 10px 0; }
              .policy-section { margin-bottom: 20px; }
              .policy-section ul, .policy-section ol { padding-left: 20px; }
              .policy-section li { margin-bottom: 5px; line-height: 1.6; }
            `,
            title: fallback.title
          })
        }
      } catch (error) {
        // console.error('獲取 return 頁面失敗:', error)

        // 錯誤時也提供預設內容
        const fallback = getLocalizedFallback(countryCode)
        setReturnPageData({
          htmlContent: fallback.htmlContent,
          cssContent: `
            .return-policy-content { padding: 20px; font-family: Arial, sans-serif; }
            .return-policy-content h2 { color: #333; margin-bottom: 20px; }
            .return-policy-content h3 { color: #555; margin: 15px 0 10px 0; }
            .policy-section { margin-bottom: 20px; }
            .policy-section ul, .policy-section ol { padding-left: 20px; }
            .policy-section li { margin-bottom: 5px; line-height: 1.6; }
          `,
          title: fallback.title
        })
      } finally {
        setLoading(false)
      }
    }

    fetchReturnPage()
  }, [])



  if (loading) {
    return (
      <div className="text-small-regular py-8 max-h-96 overflow-y-auto">
        <div className="animate-pulse flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-300 rounded-full animate-bounce"></div>
          <span>載入退換貨規則中...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="text-small-regular py-8 max-h-96 overflow-y-auto">
      {returnPageData ? (
        <div>
          {/* 嵌入 return 頁面的 CSS */}
          {returnPageData.cssContent && (
            <style dangerouslySetInnerHTML={{ __html: returnPageData.cssContent }} />
          )}

          {/* 確保字體樣式一致的額外 CSS */}
          <style dangerouslySetInnerHTML={{
            __html: `
            .return-page-content {
              font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              font-size: 14px;
              line-height: 1.6;
              color: #374151;
            }
            .return-page-content h2 {
              font-family: inherit;
              font-weight: 600;
              font-size: 1.25rem;
              color: #111827;
              margin-top: 1.5rem;
              margin-bottom: 1rem;
              border-bottom: 1px solid #e5e7eb;
              padding-bottom: 0.5rem;
            }
            .return-page-content p {
              font-family: inherit;
              font-size: 14px;
              line-height: 1.6;
              color: #374151;
              margin-bottom: 0.75rem;
            }
            .return-page-content ol {
              margin: 1rem 0;
              padding-left: 1.5rem;
            }
            .return-page-content li {
              font-family: inherit;
              font-size: 14px;
              line-height: 1.6;
              color: #374151;
              margin-bottom: 0.5rem;
            }
          ` }} />

          {/* 嵌入 return 頁面的 HTML 內容 */}
          <div
            dangerouslySetInnerHTML={{ __html: returnPageData.htmlContent }}
            className="return-page-content prose prose-gray max-w-none
                       [&>h2]:text-xl [&>h2]:font-semibold [&>h2]:text-gray-900 [&>h2]:mb-4 [&>h2]:mt-6 [&>h2]:border-b [&>h2]:border-gray-200 [&>h2]:pb-2
                       [&>p]:text-gray-700 [&>p]:leading-relaxed [&>p]:mb-3 [&>p]:text-sm
                       [&>ol]:pl-6 [&>ol]:space-y-2 [&>ol]:my-4
                       [&>li]:text-gray-700 [&>li]:leading-relaxed [&>li]:text-sm [&>li]:mb-2
                       [&>h3]:text-lg [&>h3]:font-medium [&>h3]:text-gray-800 [&>h3]:mb-3 [&>h3]:mt-4"
            style={{ minHeight: '100px', fontFamily: 'inherit' }}
          />

        </div>
      ) : (
        <div className="text-center text-gray-500 py-8">
          <p>退換貨規則內容載入失敗</p>
          <p className="text-sm mt-2">請聯繫客服獲取詳細資訊</p>
          <p className="text-xs mt-4">客服電話：0800-123-456</p>
        </div>
      )}
    </div>
  )
}

export default ShippingInfoTab

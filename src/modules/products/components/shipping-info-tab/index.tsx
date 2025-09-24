"use client"

import { useEffect, useState } from 'react'

type ShippingInfoTabProps = {
  product?: any
}

interface ReturnPageData {
  grapesHtml: string
  grapesCss: string
  title: string
}



const ShippingInfoTab = ({ product }: ShippingInfoTabProps) => {
  const [returnPageData, setReturnPageData] = useState<ReturnPageData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReturnPage = async () => {
      try {
        console.log('正在從 Sanity CMS 獲取退換貨規則內容...')
        
        // 直接從 API 獲取純內容，不載入完整頁面
        const response = await fetch('/api/pages/return')
        console.log('API 回應狀態:', response.status)
        
        if (response.ok) {
          const pageData = await response.json()
          console.log('完整的頁面資料:', JSON.stringify(pageData, null, 2))
          
          // 檢查數據結構並提取內容
          let htmlContent = pageData.grapesHtml || pageData.html || pageData.content || ''
          const cssContent = pageData.grapesCss || pageData.css || ''
          const titleContent = pageData.title || '退換貨規則'
          
          // 如果沒有直接的 HTML 內容，但有 homeModules，處理結構化內容
          if (!htmlContent && pageData.homeModules && pageData.homeModules.length > 0) {
            console.log('🔄 處理 homeModules 結構化內容...')
            
            pageData.homeModules.forEach((module: any) => {
              if (module.moduleType === 'contentSection' && module.settings?.content) {
                module.settings.content.forEach((block: any) => {
                  if (block._type === 'block' && block.children) {
                    const text = block.children.map((child: any) => child.text || '').join('')
                    
                    if (block.style === 'h2') {
                      htmlContent += `<h2>${text}</h2>\n`
                    } else if (block.style === 'normal') {
                      if (block.listItem === 'number') {
                        htmlContent += `<li>${text}</li>\n`
                      } else {
                        htmlContent += `<p>${text}</p>\n`
                      }
                    }
                  }
                })
              }
            })
            
            // 將連續的 li 元素包裝在 ol 標籤中
            htmlContent = htmlContent.replace(/(<li>.*?<\/li>\n)+/g, (match) => `<ol>\n${match}</ol>\n`)
          }
          
          console.log('提取的內容:', {
            html: htmlContent.substring(0, 200) + '...', // 只顯示前200個字符
            htmlLength: htmlContent.length,
            css: cssContent,
            title: titleContent,
            hasHomeModules: pageData.homeModules?.length > 0
          })
          
          if (htmlContent) {
            setReturnPageData({
              grapesHtml: htmlContent,
              grapesCss: cssContent,
              title: titleContent
            })
            console.log('✅ 成功設置 returnPageData，HTML 長度:', htmlContent.length)
          } else {
            console.warn('⚠️ 沒有找到有效的 HTML 內容')
            // 使用預設內容
            setReturnPageData({
              grapesHtml: `
                <div class="return-policy-default">
                  <h2>退換貨政策</h2>
                  <p>抱歉，無法載入詳細的退換貨規則。請聯繫客服獲取完整資訊。</p>
                </div>
              `,
              grapesCss: '.return-policy-default { padding: 20px; }',
              title: '退換貨規則'
            })
          }
        } else {
          const errorData = await response.json().catch(() => null)
          console.error('API 回應錯誤:', response.status, errorData)
          
          // 如果 API 失敗，提供預設的退換貨規則內容
          setReturnPageData({
            grapesHtml: `
              <div class="return-policy-content">
                <h2>退換貨政策</h2>
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
            `,
            grapesCss: `
              .return-policy-content { padding: 20px; font-family: Arial, sans-serif; }
              .return-policy-content h2 { color: #333; margin-bottom: 20px; }
              .return-policy-content h3 { color: #555; margin: 15px 0 10px 0; }
              .policy-section { margin-bottom: 20px; }
              .policy-section ul, .policy-section ol { padding-left: 20px; }
              .policy-section li { margin-bottom: 5px; line-height: 1.6; }
            `,
            title: '退換貨規則'
          })
        }
      } catch (error) {
        console.error('獲取 return 頁面失敗:', error)
        
        // 錯誤時也提供預設內容
        setReturnPageData({
          grapesHtml: `
            <div class="error-message">
              <h3>無法載入退換貨規則</h3>
              <p>請聯繫客服獲取詳細資訊</p>
              <p>客服電話：0800-123-456</p>
              <p>客服信箱：service@example.com</p>
            </div>
          `,
          grapesCss: `
            .error-message { padding: 20px; text-align: center; color: #666; }
            .error-message h3 { color: #e74c3c; margin-bottom: 15px; }
            .error-message p { margin: 8px 0; }
          `,
          title: '退換貨規則'
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
          {returnPageData.grapesCss && (
            <style dangerouslySetInnerHTML={{ __html: returnPageData.grapesCss }} />
          )}
          
          {/* 確保字體樣式一致的額外 CSS */}
          <style dangerouslySetInnerHTML={{ __html: `
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
            dangerouslySetInnerHTML={{ __html: returnPageData.grapesHtml }}
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

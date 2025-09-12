import { Editor } from 'grapesjs'

export default function homePageModulesPlugin(editor: Editor) {
  const blockManager = editor.BlockManager
  const domComponents = editor.DomComponents

  // 添加自定義樣式
  const moduleStyles = `
    <style>
      .homepage-module {
        background: #f8f9fa;
        border: 2px dashed #dee2e6;
        padding: 20px;
        text-align: center;
        min-height: 200px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        position: relative;
      }
      .module-preview {
        background: white;
        border-radius: 8px;
        padding: 15px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        max-width: 300px;
      }
      .module-title {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 8px;
        color: #495057;
      }
      .module-description {
        font-size: 14px;
        color: #6c757d;
        margin-bottom: 10px;
      }
      .module-config-hint {
        font-size: 12px;
        color: #007bff;
        font-style: italic;
      }
    </style>
  `

  // 1. 主橫幅模組
  blockManager.add('home-hero-section', {
    label: '🎯 主橫幅',
    category: '首頁模組',
    content: {
      type: 'hero-section-component',
      content: `
        ${moduleStyles}
        <div class="homepage-module hero-section" data-module-type="mainBanner">
          <div class="module-preview">
            <div class="module-title">🎯 主橫幅區塊</div>
            <div class="module-description">輪播圖片橫幅，支援多張幻燈片</div>
            <div class="module-config-hint">點擊右側面板配置內容</div>
          </div>
        </div>
      `
    }
  })

  // 2. 服務卡片模組
  blockManager.add('home-service-cards', {
    label: '💼 服務卡片',
    category: '首頁模組',
    content: {
      type: 'service-cards-component',
      content: `
        ${moduleStyles}
        <div class="homepage-module service-cards" data-module-type="serviceCardSection">
          <div class="module-preview">
            <div class="module-title">💼 服務卡片區塊</div>
            <div class="module-description">展示美髮服務，支援設計師篩選</div>
            <div class="module-config-hint">點擊右側面板配置內容</div>
          </div>
        </div>
      `
    }
  })

  // 3. 圖文區塊模組
  blockManager.add('home-image-text', {
    label: '🖼️ 圖文區塊',
    category: '首頁模組',
    content: {
      type: 'image-text-component',
      content: `
        ${moduleStyles}
        <div class="homepage-module image-text" data-module-type="imageTextBlock">
          <div class="module-preview">
            <div class="module-title">🖼️ 圖文區塊</div>
            <div class="module-description">圖片與文字組合，多種布局</div>
            <div class="module-config-hint">點擊右側面板配置內容</div>
          </div>
        </div>
      `
    }
  })

  // 4. 精選商品模組
  blockManager.add('home-featured-products', {
    label: '🛍️ 精選商品',
    category: '首頁模組',
    content: {
      type: 'featured-products-component',
      content: `
        ${moduleStyles}
        <div class="homepage-module featured-products" data-module-type="featuredProducts">
          <div class="module-preview">
            <div class="module-title">🛍️ 精選商品區塊</div>
            <div class="module-description">展示特定商品集合</div>
            <div class="module-config-hint">點擊右側面板配置內容</div>
          </div>
        </div>
      `
    }
  })

  // 5. Blog 文章模組
  blockManager.add('home-blog-section', {
    label: '📝 Blog 文章',
    category: '首頁模組',
    content: {
      type: 'blog-section-component',
      content: `
        ${moduleStyles}
        <div class="homepage-module blog-section" data-module-type="blogSection">
          <div class="module-preview">
            <div class="module-title">📝 Blog 文章區塊</div>
            <div class="module-description">顯示最新或特定分類文章</div>
            <div class="module-config-hint">點擊右側面板配置內容</div>
          </div>
        </div>
      `
    }
  })

  // 6. YouTube 影片模組
  blockManager.add('home-youtube-section', {
    label: '📺 YouTube 影片',
    category: '首頁模組',
    content: {
      type: 'youtube-section-component',
      content: `
        ${moduleStyles}
        <div class="homepage-module youtube-section" data-module-type="youtubeSection">
          <div class="module-preview">
            <div class="module-title">📺 YouTube 影片區塊</div>
            <div class="module-description">嵌入 YouTube 影片播放器</div>
            <div class="module-config-hint">點擊右側面板配置內容</div>
          </div>
        </div>
      `
    }
  })

  // 7. 內容區塊模組
  blockManager.add('home-content-section', {
    label: '📄 內容區塊',
    category: '首頁模組',
    content: {
      type: 'content-section-component',
      content: `
        ${moduleStyles}
        <div class="homepage-module content-section" data-module-type="contentSection">
          <div class="module-preview">
            <div class="module-title">📄 內容區塊</div>
            <div class="module-description">純文字內容，支援富文本</div>
            <div class="module-config-hint">點擊右側面板配置內容</div>
          </div>
        </div>
      `
    }
  })

  // 定義主橫幅組件
  domComponents.addType('hero-section-component', {
    model: {
      defaults: {
        tagName: 'div',
        attributes: { 'data-module-type': 'mainBanner' },
        traits: [
          {
            type: 'checkbox',
            name: 'isActive',
            label: '啟用區塊',
            value: true
          },
          {
            type: 'text',
            name: 'heading',
            label: '主標題',
            placeholder: '輸入橫幅主標題'
          },
          {
            type: 'checkbox',
            name: 'autoplay',
            label: '自動播放',
            value: true
          },
          {
            type: 'number',
            name: 'autoplaySpeed',
            label: '播放速度 (毫秒)',
            value: 5000,
            min: 1000,
            max: 10000
          },
          {
            type: 'checkbox',
            name: 'showArrows',
            label: '顯示箭頭',
            value: true
          },
          {
            type: 'checkbox',
            name: 'showDots',
            label: '顯示指示點',
            value: true
          }
        ]
      }
    }
  })

  // 定義服務卡片組件
  domComponents.addType('service-cards-component', {
    model: {
      defaults: {
        tagName: 'div',
        attributes: { 'data-module-type': 'serviceCardSection' },
        traits: [
          {
            type: 'checkbox',
            name: 'isActive',
            label: '啟用區塊',
            value: true
          },
          {
            type: 'text',
            name: 'heading',
            label: '區塊標題',
            placeholder: '輸入服務區塊標題'
          },
          {
            type: 'select',
            name: 'cardsPerRow',
            label: '每列卡片數',
            options: [
              { id: '2', value: '2', name: '2 張' },
              { id: '3', value: '3', name: '3 張' },
              { id: '4', value: '4', name: '4 張' }
            ],
            value: '4'
          }
        ]
      }
    }
  })

  // 定義圖文區塊組件
  domComponents.addType('image-text-component', {
    model: {
      defaults: {
        tagName: 'div',
        attributes: { 'data-module-type': 'imageTextBlock' },
        traits: [
          {
            type: 'checkbox',
            name: 'isActive',
            label: '啟用區塊',
            value: true
          },
          {
            type: 'text',
            name: 'heading',
            label: '區塊標題',
            placeholder: '輸入區塊標題'
          },
          {
            type: 'checkbox',
            name: 'hideTitle',
            label: '隱藏標題',
            value: false
          },
          {
            type: 'select',
            name: 'layout',
            label: '布局樣式',
            options: [
              { id: 'imageLeft', value: 'imageLeft', name: '左圖右文' },
              { id: 'imageRight', value: 'imageRight', name: '右圖左文' },
              { id: 'imageLeftImageRight', value: 'imageLeftImageRight', name: '雙圖雙文' },
              { id: 'centerText', value: 'centerText', name: '居中文字' }
            ],
            value: 'imageLeft'
          },
          {
            type: 'textarea',
            name: 'content',
            label: '文字內容',
            placeholder: '輸入文字內容...'
          }
        ]
      }
    }
  })

  // 定義精選商品組件
  domComponents.addType('featured-products-component', {
    model: {
      defaults: {
        tagName: 'div',
        attributes: { 'data-module-type': 'featuredProducts' },
        traits: [
          {
            type: 'checkbox',
            name: 'isActive',
            label: '啟用區塊',
            value: true
          },
          {
            type: 'text',
            name: 'heading',
            label: '區塊標題',
            placeholder: '輸入商品區塊標題'
          },
          {
            type: 'checkbox',
            name: 'showHeading',
            label: '顯示標題',
            value: true
          },
          {
            type: 'text',
            name: 'collection_id',
            label: '商品集合 ID',
            placeholder: '輸入 Medusa 商品集合 ID'
          }
        ]
      }
    }
  })

  // 定義 Blog 文章組件
  domComponents.addType('blog-section-component', {
    model: {
      defaults: {
        tagName: 'div',
        attributes: { 'data-module-type': 'blogSection' },
        traits: [
          {
            type: 'checkbox',
            name: 'isActive',
            label: '啟用區塊',
            value: true
          },
          {
            type: 'text',
            name: 'title',
            label: '區塊標題',
            placeholder: '輸入 Blog 區塊標題'
          },
          {
            type: 'text',
            name: 'category',
            label: '文章分類',
            placeholder: '輸入文章分類（可選）'
          },
          {
            type: 'number',
            name: 'limit',
            label: '顯示文章數量',
            value: 6,
            min: 1,
            max: 20
          },
          {
            type: 'select',
            name: 'postsPerRow',
            label: '每列文章數',
            options: [
              { id: '2', value: '2', name: '2 篇' },
              { id: '3', value: '3', name: '3 篇' },
              { id: '4', value: '4', name: '4 篇' }
            ],
            value: '3'
          }
        ]
      }
    }
  })

  // 定義 YouTube 影片組件
  domComponents.addType('youtube-section-component', {
    model: {
      defaults: {
        tagName: 'div',
        attributes: { 'data-module-type': 'youtubeSection' },
        traits: [
          {
            type: 'checkbox',
            name: 'isActive',
            label: '啟用區塊',
            value: true
          },
          {
            type: 'text',
            name: 'heading',
            label: '區塊標題',
            placeholder: '輸入影片區塊標題'
          },
          {
            type: 'text',
            name: 'videoUrl',
            label: 'YouTube 影片網址',
            placeholder: 'https://www.youtube.com/watch?v=...'
          },
          {
            type: 'textarea',
            name: 'description',
            label: '影片描述',
            placeholder: '輸入影片描述...'
          },
          {
            type: 'checkbox',
            name: 'fullWidth',
            label: '全寬顯示',
            value: true
          }
        ]
      }
    }
  })

  // 定義內容區塊組件
  domComponents.addType('content-section-component', {
    model: {
      defaults: {
        tagName: 'div',
        attributes: { 'data-module-type': 'contentSection' },
        traits: [
          {
            type: 'checkbox',
            name: 'isActive',
            label: '啟用區塊',
            value: true
          },
          {
            type: 'text',
            name: 'heading',
            label: '區塊標題',
            placeholder: '輸入內容區塊標題'
          },
          {
            type: 'textarea',
            name: 'content',
            label: '文字內容',
            placeholder: '輸入內容區塊文字...'
          }
        ]
      }
    }
  })

  // 添加導出為 Sanity 格式的命令
  editor.Commands.add('export-to-sanity', {
    run: (editor: Editor) => {
      const components = editor.DomComponents.getComponents()
      const sections: any[] = []

      components.forEach((component: any) => {
        const moduleType = component.get('attributes')['data-module-type']
        if (moduleType) {
          const traits = component.get('traits')
          const sectionData: any = {
            _type: moduleType,
            isActive: true
          }

          // 從 traits 提取配置
          traits.forEach((trait: any) => {
            const value = trait.get('value')
            if (value !== undefined && value !== '') {
              sectionData[trait.get('name')] = value
            }
          })

          sections.push(sectionData)
        }
      })

      const sanityData = {
        _type: 'homePage',
        title: '由 GrapesJS 編輯器生成的首頁',
        mainSections: sections
      }

      console.log('Sanity 格式數據：', JSON.stringify(sanityData, null, 2))
      
      // 複製到剪貼簿
      navigator.clipboard.writeText(JSON.stringify(sanityData, null, 2)).then(() => {
        alert('Sanity 格式數據已複製到剪貼簿！')
      }).catch(() => {
        // 如果剪貼簿API不可用，顯示在新視窗
        const newWindow = window.open()
        newWindow!.document.write(`<pre>${JSON.stringify(sanityData, null, 2)}</pre>`)
      })
    }
  })

  // 添加導出按鈕到工具列
  editor.Panels.addButton('options', [
    {
      id: 'export-to-sanity',
      className: 'btn-export-sanity',
      label: '📤',
      command: 'export-to-sanity',
      attributes: { title: '導出為 Sanity 格式' }
    }
  ])
}
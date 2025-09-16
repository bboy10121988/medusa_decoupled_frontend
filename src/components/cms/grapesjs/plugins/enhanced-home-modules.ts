import { Editor } from 'grapesjs'

export default function enhancedHomeModulesPlugin(editor: Editor) {
  const blockManager = editor.BlockManager
  const domComponents = editor.DomComponents

  // 添加模組專用樣式（避免重複注入）
  const styleKey = '__enhancedHomeModulesStyleAdded__'
  const anyEditor = editor as unknown as { [k: string]: any }
  if (!anyEditor[styleKey]) {
    editor.CssComposer.add(`
    .homepage-module {
      background: #f8f9fa;
      border: 2px dashed #dee2e6;
      padding: 30px;
      text-align: center;
      min-height: 250px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      position: relative;
      transition: all 0.3s ease;
      border-radius: 8px;
      margin: 10px 0;
    }
    
    .homepage-module:hover {
      border-color: #007bff;
      background: #e8f4fd;
    }
    
    .homepage-module.selected {
      border-color: #007bff;
      background: #e8f4fd;
      box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
    }
    
    .module-preview {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.1);
      max-width: 350px;
      width: 100%;
    }
    
    .module-icon {
      font-size: 48px;
      margin-bottom: 15px;
      display: block;
    }
    
    .module-title {
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 10px;
      color: #495057;
    }
    
    .module-description {
      font-size: 14px;
      color: #6c757d;
      margin-bottom: 15px;
      line-height: 1.5;
    }
    
    .module-config-hint {
      font-size: 12px;
      color: #007bff;
      font-style: italic;
      padding: 8px 12px;
      background: #e8f4fd;
      border-radius: 20px;
      border: 1px solid #bee5eb;
    }
    
    .module-status {
      position: absolute;
      top: 10px;
      right: 10px;
      background: #28a745;
      color: white;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 10px;
      font-weight: bold;
    }
    
    .module-inactive .module-status {
      background: #dc3545;
    }
    
    /* 特定模組的預覽樣式 */
    .hero-section-preview {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px 20px;
      border-radius: 8px;
    }
    
    .service-cards-preview {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-top: 15px;
    }
    
    .service-card-mini {
      background: #f8f9fa;
      padding: 10px;
      border-radius: 6px;
      text-align: center;
      font-size: 10px;
    }
    
    .featured-products-preview {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      margin-top: 15px;
    }
    
    .product-mini {
      background: #e9ecef;
      aspect-ratio: 1;
      border-radius: 4px;
    }
    `)
    anyEditor[styleKey] = true
  }

  // 1. 主橫幅模組
  if (!blockManager.get('home-hero-section')) blockManager.add('home-hero-section', {
    label: '主橫幅',
    category: '首頁模組',
    content: {
      type: 'hero-section-component',
      content: `
        <div class="homepage-module hero-section" data-module-type="mainBanner">
          <div class="module-status">啟用</div>
          <div class="module-preview">
            <span class="module-icon">主</span>
            <div class="module-title">主橫幅區塊</div>
            <div class="module-description">輪播圖片橫幅，支援自動播放、多張幻燈片、導航控制</div>
            <div class="hero-section-preview">
              <h3 style="margin: 0 0 10px 0; font-size: 16px;">歡迎來到 Tim's Fantasy World</h3>
              <p style="margin: 0; font-size: 12px; opacity: 0.9;">專業美髮沙龍服務</p>
            </div>
            <div class="module-config-hint">點擊右側面板配置橫幅內容</div>
          </div>
        </div>
      `
    }
  })

  // 2. 服務卡片模組
  if (!blockManager.get('home-service-cards')) blockManager.add('home-service-cards', {
    label: '💼 服務卡片',
    category: '首頁模組',
    content: {
      type: 'service-cards-component',
      content: `
        <div class="homepage-module service-cards" data-module-type="serviceCardSection">
          <div class="module-status">啟用</div>
          <div class="module-preview">
            <span class="module-icon">💼</span>
            <div class="module-title">服務卡片區塊</div>
            <div class="module-description">展示美髮服務項目，支援設計師篩選、價格顯示、Instagram 連結</div>
            <div class="service-cards-preview">
              <div class="service-card-mini">男士理髮</div>
              <div class="service-card-mini">染髮服務</div>
              <div class="service-card-mini">燙髮造型</div>
            </div>
            <div class="module-config-hint">點擊右側面板配置服務內容</div>
          </div>
        </div>
      `
    }
  })

  // 3. 圖文區塊模組
  if (!blockManager.get('home-image-text')) blockManager.add('home-image-text', {
    label: '圖文區塊',
    category: '首頁模組',
    content: {
      type: 'image-text-component',
      content: `
        <div class="homepage-module image-text" data-module-type="imageTextBlock">
          <div class="module-status">啟用</div>
          <div class="module-preview">
            <span class="module-icon">圖</span>
            <div class="module-title">圖文區塊</div>
            <div class="module-description">圖片與文字的靈活組合，支援左圖右文、右圖左文、雙圖雙文等多種布局</div>
            <div style="display: flex; align-items: center; gap: 10px; margin-top: 15px;">
              <div style="width: 40px; height: 30px; background: #dee2e6; border-radius: 4px;"></div>
              <div style="flex: 1;">
                <div style="height: 8px; background: #e9ecef; margin-bottom: 4px; border-radius: 2px;"></div>
                <div style="height: 6px; background: #f8f9fa; border-radius: 2px;"></div>
              </div>
            </div>
            <div class="module-config-hint">點擊右側面板配置圖文內容</div>
          </div>
        </div>
      `
    }
  })

  // 4. 精選商品模組
  if (!blockManager.get('home-featured-products')) blockManager.add('home-featured-products', {
    label: '精選商品',
    category: '首頁模組',
    content: {
      type: 'featured-products-component',
      content: `
        <div class="homepage-module featured-products" data-module-type="featuredProducts">
          <div class="module-status">啟用</div>
          <div class="module-preview">
            <span class="module-icon">商</span>
            <div class="module-title">精選商品區塊</div>
            <div class="module-description">展示特定商品集合，與 Medusa 電商系統整合，支援商品篩選</div>
            <div class="featured-products-preview">
              <div class="product-mini"></div>
              <div class="product-mini"></div>
              <div class="product-mini"></div>
              <div class="product-mini"></div>
            </div>
            <div class="module-config-hint">點擊右側面板配置商品集合</div>
          </div>
        </div>
      `
    }
  })

  // 5. Blog 文章模組
  if (!blockManager.get('home-blog-section')) blockManager.add('home-blog-section', {
    label: '📝 Blog 文章',
    category: '首頁模組',
    content: {
      type: 'blog-section-component',
      content: `
        <div class="homepage-module blog-section" data-module-type="blogSection">
          <div class="module-status">啟用</div>
          <div class="module-preview">
            <span class="module-icon">📝</span>
            <div class="module-title">Blog 文章區塊</div>
            <div class="module-description">顯示最新或特定分類的部落格文章，支援分類篩選和數量控制</div>
            <div style="margin-top: 15px;">
              <div style="display: flex; gap: 8px; margin-bottom: 8px;">
                <div style="width: 24px; height: 18px; background: #dee2e6; border-radius: 2px;"></div>
                <div style="flex: 1;">
                  <div style="height: 6px; background: #e9ecef; margin-bottom: 2px; border-radius: 1px;"></div>
                  <div style="height: 4px; background: #f8f9fa; border-radius: 1px; width: 70%;"></div>
                </div>
              </div>
              <div style="display: flex; gap: 8px;">
                <div style="width: 24px; height: 18px; background: #dee2e6; border-radius: 2px;"></div>
                <div style="flex: 1;">
                  <div style="height: 6px; background: #e9ecef; margin-bottom: 2px; border-radius: 1px;"></div>
                  <div style="height: 4px; background: #f8f9fa; border-radius: 1px; width: 80%;"></div>
                </div>
              </div>
            </div>
            <div class="module-config-hint">點擊右側面板配置文章內容</div>
          </div>
        </div>
      `
    }
  })

  // 6. YouTube 影片模組
  if (!blockManager.get('home-youtube-section')) blockManager.add('home-youtube-section', {
    label: '📺 YouTube 影片',
    category: '首頁模組',
    content: {
      type: 'youtube-section-component',
      content: `
        <div class="homepage-module youtube-section" data-module-type="youtubeSection">
          <div class="module-status">啟用</div>
          <div class="module-preview">
            <span class="module-icon">📺</span>
            <div class="module-title">YouTube 影片區塊</div>
            <div class="module-description">嵌入 YouTube 影片播放器，支援自動繼續播放和時間記憶功能</div>
            <div style="margin-top: 15px;">
              <div style="width: 100%; height: 60px; background: #000; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px;">
                ▶
              </div>
            </div>
            <div class="module-config-hint">點擊右側面板配置影片網址</div>
          </div>
        </div>
      `
    }
  })

  // 7. 內容區塊模組
  if (!blockManager.get('home-content-section')) blockManager.add('home-content-section', {
    label: '內容區塊',
    category: '首頁模組',
    content: {
      type: 'content-section-component',
      content: `
        <div class="homepage-module content-section" data-module-type="contentSection">
          <div class="module-status">啟用</div>
          <div class="module-preview">
            <span class="module-icon">內</span>
            <div class="module-title">內容區塊</div>
            <div class="module-description">純文字內容區塊，支援 Portable Text 富文本格式編輯</div>
            <div style="margin-top: 15px; text-align: left;">
              <div style="height: 8px; background: #343a40; margin-bottom: 6px; border-radius: 2px; width: 60%;"></div>
              <div style="height: 4px; background: #e9ecef; margin-bottom: 3px; border-radius: 1px;"></div>
              <div style="height: 4px; background: #e9ecef; margin-bottom: 3px; border-radius: 1px; width: 85%;"></div>
              <div style="height: 4px; background: #e9ecef; border-radius: 1px; width: 70%;"></div>
            </div>
            <div class="module-config-hint">點擊右側面板編輯文字內容</div>
          </div>
        </div>
      `
    }
  })

  // 定義所有組件類型 (保持原有的 trait 配置)
  
  // 主橫幅組件
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
            value: true,
            changeProp: true
          },
          // 輪播設定
          {
            type: 'checkbox',
            name: 'autoplay',
            label: '自動播放',
            value: true
          },
          {
            type: 'number',
            name: 'autoplaySpeed',
            label: '自動播放間隔 (秒)',
            value: 5,
            min: 1,
            max: 30
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
          },
          // 幻燈片 1
          {
            type: 'text',
            name: 'slide1_heading',
            label: '幻燈片 1 - 主標題',
            placeholder: '輸入第一張幻燈片標題',
            value: '歡迎來到 Tim\'s Fantasy World'
          },
          {
            type: 'image-url',
            name: 'slide1_backgroundImage',
            label: '幻燈片 1 - 背景圖片',
            placeholder: '輸入第一張幻燈片背景圖片網址'
          },
          {
            type: 'text',
            name: 'slide1_backgroundImageAlt',
            label: '幻燈片 1 - 圖片替代文字',
            placeholder: '用於無障礙和 SEO 優化'
          },
          {
            type: 'text',
            name: 'slide1_buttonText',
            label: '幻燈片 1 - 按鈕文字',
            placeholder: '例如：立即預約',
            value: '立即預約'
          },
          {
            type: 'text',
            name: 'slide1_buttonLink',
            label: '幻燈片 1 - 按鈕連結',
            placeholder: '輸入按鈕連結網址',
            value: 'https://page.line.me/timsfantasyworld'
          },
          // 幻燈片 2
          {
            type: 'text',
            name: 'slide2_heading',
            label: '幻燈片 2 - 主標題',
            placeholder: '輸入第二張幻燈片標題（可選）'
          },
          {
            type: 'image-url',
            name: 'slide2_backgroundImage',
            label: '幻燈片 2 - 背景圖片',
            placeholder: '輸入第二張幻燈片背景圖片網址（可選）'
          },
          {
            type: 'text',
            name: 'slide2_backgroundImageAlt',
            label: '幻燈片 2 - 圖片替代文字',
            placeholder: '用於無障礙和 SEO 優化'
          },
          {
            type: 'text',
            name: 'slide2_buttonText',
            label: '幻燈片 2 - 按鈕文字',
            placeholder: '例如：了解更多'
          },
          {
            type: 'text',
            name: 'slide2_buttonLink',
            label: '幻燈片 2 - 按鈕連結',
            placeholder: '輸入按鈕連結網址'
          },
          // 幻燈片 3
          {
            type: 'text',
            name: 'slide3_heading',
            label: '幻燈片 3 - 主標題',
            placeholder: '輸入第三張幻燈片標題（可選）'
          },
          {
            type: 'image-url',
            name: 'slide3_backgroundImage',
            label: '幻燈片 3 - 背景圖片',
            placeholder: '輸入第三張幻燈片背景圖片網址（可選）'
          },
          {
            type: 'text',
            name: 'slide3_backgroundImageAlt',
            label: '幻燈片 3 - 圖片替代文字',
            placeholder: '用於無障礙和 SEO 優化'
          },
          {
            type: 'text',
            name: 'slide3_buttonText',
            label: '幻燈片 3 - 按鈕文字',
            placeholder: '例如：查看服務'
          },
          {
            type: 'text',
            name: 'slide3_buttonLink',
            label: '幻燈片 3 - 按鈕連結',
            placeholder: '輸入按鈕連結網址'
          }
      ]
    }
  },
    view: {
      onRender() {
        this.updateStatus()
      },
      updateStatus() {
        const isActive = this.model.get('isActive')
        const el = this.el
        const statusEl = el.querySelector('.module-status')
        
        if (statusEl) {
          statusEl.textContent = isActive ? '啟用' : '停用'
          el.classList.toggle('module-inactive', !isActive)
        }
      }
    }
  })

  // 監聽 isActive 變更，及時更新模組外觀狀態
  editor.on('component:update:isActive', (component: any) => {
    const el: HTMLElement | undefined = component?.view?.el
    if (!el) return
    const statusEl = el.querySelector('.module-status') as HTMLElement | null
    if (statusEl) {
      const active = !!component.get('isActive')
      statusEl.textContent = active ? '啟用' : '停用'
      el.classList.toggle('module-inactive', !active)
    }
  })

  // 服務卡片組件
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
            value: true,
            changeProp: true
          },
          {
            type: 'text',
            name: 'heading',
            label: '區塊標題',
            value: '我們的服務',
            placeholder: '輸入服務區塊標題'
          },
          {
            type: 'select',
            name: 'cardsPerRow',
            label: '每列卡片數',
            value: '3',
            options: [
              { id: '1', value: '1', name: '1 張' },
              { id: '2', value: '2', name: '2 張' },
              { id: '3', value: '3', name: '3 張' },
              { id: '4', value: '4', name: '4 張' },
              { id: '5', value: '5', name: '5 張' },
              { id: '6', value: '6', name: '6 張' }
            ]
          },
          // 說明：以下為示範用的第一張服務卡片配置
          // 實際使用時，服務卡片數據應從 Sanity CMS 管理
          {
            type: 'text',
            name: 'card1_title',
            label: '卡片 1 - 服務名稱',
            placeholder: '例如：男士理髮',
            value: '男士理髮'
          },
          {
            type: 'text',
            name: 'card1_englishTitle',
            label: '卡片 1 - 英文名稱',
            placeholder: '例如：Men\'s Haircut',
            value: 'Men\'s Haircut'
          },
          {
            type: 'text',
            name: 'card1_stylist1_name',
            label: '卡片 1 - 設計師 1 名稱',
            placeholder: '例如：Tim',
            value: 'Tim'
          },
          {
            type: 'text',
            name: 'card1_stylist1_level',
            label: '卡片 1 - 設計師 1 等級',
            placeholder: '例如：資深設計師',
            value: '資深設計師'
          },
          {
            type: 'number',
            name: 'card1_stylist1_price',
            label: '卡片 1 - 設計師 1 價格',
            placeholder: '例如：800',
            value: 800,
            min: 0
          },
          {
            type: 'select',
            name: 'card1_stylist1_priceType',
            label: '卡片 1 - 設計師 1 價格類型',
            value: 'up',
            options: [
              { id: 'up', value: 'up', name: '起價 (顯示「起」)' },
              { id: 'fixed', value: 'fixed', name: '固定價格' }
            ]
          },
          {
            type: 'checkbox',
            name: 'card1_stylist1_isDefault',
            label: '卡片 1 - 設計師 1 為預設',
            value: true
          },
          {
            type: 'image-url',
            name: 'card1_stylist1_cardImage',
            label: '卡片 1 - 設計師 1 圖片網址',
            placeholder: '輸入設計師圖片網址'
          },
          {
            type: 'text',
            name: 'card1_stylist1_cardImageAlt',
            label: '卡片 1 - 設計師 1 圖片替代文字',
            placeholder: '例如：Tim 設計師照片'
          },
          {
            type: 'text',
            name: 'card1_stylist1_instagramUrl',
            label: '卡片 1 - 設計師 1 Instagram',
            placeholder: '輸入 Instagram 網址'
          },
          // 第二張卡片
          {
            type: 'text',
            name: 'card2_title',
            label: '卡片 2 - 服務名稱',
            placeholder: '例如：染髮服務'
          },
          {
            type: 'text',
            name: 'card2_englishTitle',
            label: '卡片 2 - 英文名稱',
            placeholder: '例如：Hair Coloring'
          },
          {
            type: 'text',
            name: 'card2_stylist1_name',
            label: '卡片 2 - 設計師 1 名稱',
            placeholder: '例如：Tim'
          },
          {
            type: 'text',
            name: 'card2_stylist1_level',
            label: '卡片 2 - 設計師 1 等級',
            placeholder: '例如：資深設計師'
          },
          {
            type: 'number',
            name: 'card2_stylist1_price',
            label: '卡片 2 - 設計師 1 價格',
            placeholder: '例如：1200',
            min: 0
          },
          {
            type: 'select',
            name: 'card2_stylist1_priceType',
            label: '卡片 2 - 設計師 1 價格類型',
            value: 'up',
            options: [
              { id: 'up', value: 'up', name: '起價 (顯示「起」)' },
              { id: 'fixed', value: 'fixed', name: '固定價格' }
            ]
          },
          {
            type: 'checkbox',
            name: 'card2_stylist1_isDefault',
            label: '卡片 2 - 設計師 1 為預設',
            value: true
          },
          {
            type: 'image-url',
            name: 'card2_stylist1_cardImage',
            label: '卡片 2 - 設計師 1 圖片網址',
            placeholder: '輸入設計師圖片網址'
          },
          {
            type: 'text',
            name: 'card2_stylist1_instagramUrl',
            label: '卡片 2 - 設計師 1 Instagram',
            placeholder: '輸入 Instagram 網址'
          },
          // 第三張卡片
          {
            type: 'text',
            name: 'card3_title',
            label: '卡片 3 - 服務名稱',
            placeholder: '例如：燙髮造型'
          },
          {
            type: 'text',
            name: 'card3_englishTitle',
            label: '卡片 3 - 英文名稱',
            placeholder: '例如：Hair Perm'
          },
          {
            type: 'text',
            name: 'card3_stylist1_name',
            label: '卡片 3 - 設計師 1 名稱',
            placeholder: '例如：Tim'
          },
          {
            type: 'text',
            name: 'card3_stylist1_level',
            label: '卡片 3 - 設計師 1 等級',
            placeholder: '例如：資深設計師'
          },
          {
            type: 'number',
            name: 'card3_stylist1_price',
            label: '卡片 3 - 設計師 1 價格',
            placeholder: '例如：1500',
            min: 0
          },
          {
            type: 'select',
            name: 'card3_stylist1_priceType',
            label: '卡片 3 - 設計師 1 價格類型',
            value: 'up',
            options: [
              { id: 'up', value: 'up', name: '起價 (顯示「起」)' },
              { id: 'fixed', value: 'fixed', name: '固定價格' }
            ]
          },
          {
            type: 'checkbox',
            name: 'card3_stylist1_isDefault',
            label: '卡片 3 - 設計師 1 為預設',
            value: true
          },
          {
            type: 'image-url',
            name: 'card3_stylist1_cardImage',
            label: '卡片 3 - 設計師 1 圖片網址',
            placeholder: '輸入設計師圖片網址'
          },
          {
            type: 'text',
            name: 'card3_stylist1_instagramUrl',
            label: '卡片 3 - 設計師 1 Instagram',
            placeholder: '輸入 Instagram 網址'
          }
        ]
      }
    },
    view: {
      onRender() {
        this.updateStatus()
      },
      updateStatus() {
        const isActive = this.model.get('isActive')
        const el = this.el
        const statusEl = el.querySelector('.module-status')
        
        if (statusEl) {
          statusEl.textContent = isActive ? '啟用' : '停用'
          el.classList.toggle('module-inactive', !isActive)
        }
      }
    }
  })

  // 圖文區塊組件
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
            value: true,
            changeProp: true
          },
          {
            type: 'text',
            name: 'heading',
            label: '區塊標題',
            placeholder: '輸入圖文區塊標題'
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
            label: '版面配置',
            value: 'imageLeft',
            options: [
              { id: 'imageLeft', value: 'imageLeft', name: '圖片在左' },
              { id: 'imageRight', value: 'imageRight', name: '圖片在右' },
              { id: 'imageLeftImageRight', value: 'imageLeftImageRight', name: '左右圖片' },
              { id: 'textLeftTextRight', value: 'textLeftTextRight', name: '左右文字' },
              { id: 'centerText', value: 'centerText', name: '置中文字' }
            ]
          },
          // 單圖布局 (imageLeft/imageRight) 圖片設定
          {
            type: 'image-url',
            name: 'imageUrl',
            label: '主要圖片網址',
            placeholder: '輸入圖片網址'
          },
          {
            type: 'text',
            name: 'imageAlt',
            label: '主要圖片替代文字',
            placeholder: '用於無障礙和 SEO 優化'
          },
          // 雙圖布局 (imageLeftImageRight) 圖片設定
          {
            type: 'image-url',
            name: 'leftImageUrl',
            label: '左側圖片網址',
            placeholder: '輸入左側圖片網址'
          },
          {
            type: 'text',
            name: 'leftImageAlt',
            label: '左側圖片替代文字',
            placeholder: '左側圖片的替代文字'
          },
          {
            type: 'image-url',
            name: 'rightImageUrl',
            label: '右側圖片網址',
            placeholder: '輸入右側圖片網址'
          },
          {
            type: 'text',
            name: 'rightImageAlt',
            label: '右側圖片替代文字',
            placeholder: '右側圖片的替代文字'
          },
          // 內容設定
          {
            type: 'textarea',
            name: 'content',
            label: '主要內容 (HTML)',
            placeholder: '輸入 HTML 內容，支援富文本格式'
          },
          // 雙文布局 (textLeftTextRight) 內容設定
          {
            type: 'textarea',
            name: 'leftContent',
            label: '左側內容 (HTML)',
            placeholder: '輸入左側 HTML 內容'
          },
          {
            type: 'textarea',
            name: 'rightContent',
            label: '右側內容 (HTML)',
            placeholder: '輸入右側 HTML 內容'
          }
        ]
      }
    },
    view: {
      onRender() {
        this.updateStatus()
      },
      updateStatus() {
        const isActive = this.model.get('isActive')
        const el = this.el
        const statusEl = el.querySelector('.module-status')
        
        if (statusEl) {
          statusEl.textContent = isActive ? '啟用' : '停用'
          el.classList.toggle('module-inactive', !isActive)
        }
      }
    }
  })

  // 精選商品組件
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
            value: true,
            changeProp: true
          },
          {
            type: 'text',
            name: 'heading',
            label: '區塊標題',
            placeholder: '輸入精選商品標題'
          },
          {
            type: 'text',
            name: 'collection_id',
            label: '商品系列 ID',
            placeholder: '請輸入 Medusa 商品系列的 ID'
          },
          {
            type: 'checkbox',
            name: 'showHeading',
            label: '顯示標題',
            value: true
          },
          {
            type: 'checkbox',
            name: 'showSubheading',
            label: '顯示副標題',
            value: true
          }
        ]
      }
    },
    view: {
      onRender() {
        this.updateStatus()
      },
      updateStatus() {
        const isActive = this.model.get('isActive')
        const el = this.el
        const statusEl = el.querySelector('.module-status')
        
        if (statusEl) {
          statusEl.textContent = isActive ? '啟用' : '停用'
          el.classList.toggle('module-inactive', !isActive)
        }
      }
    }
  })

  // 部落格文章組件
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
            value: true,
            changeProp: true
          },
          {
            type: 'text',
            name: 'title',
            label: '區塊標題',
            placeholder: '輸入部落格區塊標題'
          },
          {
            type: 'text',
            name: 'category',
            label: '文章分類 ID',
            placeholder: '輸入 Sanity 分類 ID'
          },
          {
            type: 'number',
            name: 'limit',
            label: '顯示文章數量',
            value: 6,
            min: 1,
            max: 12
          },
          {
            type: 'select',
            name: 'postsPerRow',
            label: '每行文章數量',
            value: '3',
            options: [
              { id: '1', value: '1', name: '1 篇' },
              { id: '2', value: '2', name: '2 篇' },
              { id: '3', value: '3', name: '3 篇' },
              { id: '4', value: '4', name: '4 篇' }
            ]
          }
        ]
      }
    },
    view: {
      onRender() {
        this.updateStatus()
      },
      updateStatus() {
        const isActive = this.model.get('isActive')
        const el = this.el
        const statusEl = el.querySelector('.module-status')
        
        if (statusEl) {
          statusEl.textContent = isActive ? '啟用' : '停用'
          el.classList.toggle('module-inactive', !isActive)
        }
      }
    }
  })

  // YouTube 影片組件
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
            value: true,
            changeProp: true
          },
          {
            type: 'text',
            name: 'videoUrl',
            label: 'YouTube 影片網址',
            placeholder: '請輸入完整的 YouTube 影片網址'
          },
          {
            type: 'text',
            name: 'heading',
            label: '影片標題',
            placeholder: '輸入影片區塊標題'
          },
          {
            type: 'textarea',
            name: 'description',
            label: '影片描述',
            placeholder: '輸入影片描述'
          },
          {
            type: 'checkbox',
            name: 'fullWidth',
            label: '全寬顯示',
            value: true
          }
        ]
      }
    },
    view: {
      onRender() {
        this.updateStatus()
      },
      updateStatus() {
        const isActive = this.model.get('isActive')
        const el = this.el
        const statusEl = el.querySelector('.module-status')
        
        if (statusEl) {
          statusEl.textContent = isActive ? '啟用' : '停用'
          el.classList.toggle('module-inactive', !isActive)
        }
      }
    }
  })

  // 內容區塊組件
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
            value: true,
            changeProp: true
          },
          {
            type: 'text',
            name: 'title',
            label: '區塊標題',
            placeholder: '輸入內容區塊標題'
          },
          {
            type: 'checkbox',
            name: 'hideTitle',
            label: '隱藏標題',
            value: false
          },
          {
            type: 'textarea',
            name: 'content',
            label: '文字內容',
            placeholder: '輸入文字內容'
          }
        ]
      }
    },
    view: {
      onRender() {
        this.updateStatus()
      },
      updateStatus() {
        const isActive = this.model.get('isActive')
        const el = this.el
        const statusEl = el.querySelector('.module-status')
        
        if (statusEl) {
          statusEl.textContent = isActive ? '啟用' : '停用'
          el.classList.toggle('module-inactive', !isActive)
        }
      }
    }
  })

  // 其他組件定義... (為簡潔起見，這裡只展示核心結構)
  
  // 添加從 Sanity 匯入的命令
  editor.Commands.add('import-from-sanity', {
    run: (editor: Editor) => {
      const sanityData = prompt('請貼上 Sanity 首頁數據 (JSON 格式):')
      if (!sanityData) return

      try {
        const data = JSON.parse(sanityData)
        if (data._type === 'homePage' && data.mainSections) {
          // 清空當前內容
          editor.DomComponents.clear()
          
          // 根據 Sanity 數據添加組件
          data.mainSections.forEach((section: any) => {
            let blockId = ''
            switch (section._type) {
              case 'mainBanner':
                blockId = 'home-hero-section'
                break
              case 'serviceCardSection':
                blockId = 'home-service-cards'
                break
              case 'imageTextBlock':
                blockId = 'home-image-text'
                break
              case 'featuredProducts':
                blockId = 'home-featured-products'
                break
              case 'blogSection':
                blockId = 'home-blog-section'
                break
              case 'youtubeSection':
                blockId = 'home-youtube-section'
                break
              case 'contentSection':
                blockId = 'home-content-section'
                break
            }
            
            if (blockId) {
              const block = editor.BlockManager.get(blockId)
              if (block && block.get('content')) {
                const content = block.get('content')
                if (content) {
                  const component = editor.DomComponents.addComponent(content)
                  
                  // 設置 traits 值 (如果是單個組件)
                  if (!Array.isArray(component)) {
                    Object.keys(section).forEach(key => {
                      if (key !== '_type') {
                        const trait = component.getTrait(key)
                        if (trait) {
                          trait.set('value', section[key])
                        }
                      }
                    })
                  }
                }
              }
            }
          })
          
          alert('Sanity 數據匯入成功！')
        } else {
          alert('無效的 Sanity 首頁數據格式')
        }
      } catch (error) {
        console.error('Import error:', error)
        alert('JSON 格式錯誤，請檢查數據格式')
      }
    }
  })

  // 導出為 Sanity 格式命令
  editor.Commands.add('export-to-sanity', {
    run: (editor: Editor) => {
      const components = editor.DomComponents.getComponents()
      const sections: any[] = []

      components.each((component: any) => {
        const moduleType = component.get('attributes')?.['data-module-type']
        if (moduleType) {
          const traits = component.get('traits')
          const sectionData: any = {
            _type: moduleType,
            isActive: true
          }

          // 從 traits 提取配置
          const traitValues: any = {}
          traits.each((trait: any) => {
            const name = trait.get('name')
            const value = trait.get('value')
            if (value !== undefined && value !== '' && name !== 'isActive') {
              traitValues[name] = value
            }
          })

          // 特殊處理主橫幅的多個幻燈片
          if (moduleType === 'mainBanner') {
            const slides: any[] = []
            
            // 處理幻燈片 1-3
            for (let i = 1; i <= 3; i++) {
              const heading = traitValues[`slide${i}_heading`]
              const backgroundImage = traitValues[`slide${i}_backgroundImage`]
              const backgroundImageAlt = traitValues[`slide${i}_backgroundImageAlt`]
              const buttonText = traitValues[`slide${i}_buttonText`]
              const buttonLink = traitValues[`slide${i}_buttonLink`]
              
              if (heading || backgroundImage) {
                slides.push({
                  heading: heading || '',
                  backgroundImage: backgroundImage || '',
                  backgroundImageAlt: backgroundImageAlt || '',
                  buttonText: buttonText || '',
                  buttonLink: buttonLink || ''
                })
              }
            }

            // 如果沒有任何幻燈片，創建一個預設的
            if (slides.length === 0) {
              slides.push({
                heading: '歡迎來到 Tim\'s Fantasy World',
                backgroundImage: '',
                backgroundImageAlt: '',
                buttonText: '立即預約',
                buttonLink: 'https://page.line.me/timsfantasyworld'
              })
            }

            sectionData.slides = slides
            sectionData.settings = {
              autoplay: traitValues.autoplay !== false,
              autoplaySpeed: parseInt(traitValues.autoplaySpeed) || 5,
              showArrows: traitValues.showArrows !== false,
              showDots: traitValues.showDots !== false
            }

            // 清除幻燈片相關的個別欄位
            Object.keys(traitValues).forEach(key => {
              if (key.startsWith('slide') || ['autoplay', 'autoplaySpeed', 'showArrows', 'showDots'].includes(key)) {
                delete traitValues[key]
              }
            })
          }
          // 特殊處理服務卡片的多張卡片
          else if (moduleType === 'serviceCardSection') {
            const cards: any[] = []
            
            // 處理卡片 1-3
            for (let i = 1; i <= 3; i++) {
              const title = traitValues[`card${i}_title`]
              if (title) {
                const stylists: any[] = []
                
                // 處理設計師資料
                if (traitValues[`card${i}_stylist1_name`]) {
                  stylists.push({
                    name: traitValues[`card${i}_stylist1_name`],
                    level: traitValues[`card${i}_stylist1_level`] || '設計師',
                    price: parseInt(traitValues[`card${i}_stylist1_price`]) || 0,
                    priceType: traitValues[`card${i}_stylist1_priceType`] || 'up',
                    isDefault: traitValues[`card${i}_stylist1_isDefault`] !== false,
                    cardImage: traitValues[`card${i}_stylist1_cardImage`] || '',
                    cardImageAlt: traitValues[`card${i}_stylist1_cardImageAlt`] || '',
                    instagramUrl: traitValues[`card${i}_stylist1_instagramUrl`] || ''
                  })
                }
                
                cards.push({
                  title,
                  englishTitle: traitValues[`card${i}_englishTitle`] || '',
                  stylists
                })
              }
            }
            
            sectionData.cards = cards
            
            // 清除卡片相關的個別欄位
            Object.keys(traitValues).forEach(key => {
              if (key.startsWith('card')) {
                delete traitValues[key]
              }
            })
          }
          // 特殊處理圖文區塊的圖片格式
          else if (moduleType === 'imageTextBlock') {
            // 處理主要圖片
            if (traitValues.imageUrl) {
              sectionData.image = {
                url: traitValues.imageUrl,
                alt: traitValues.imageAlt || ''
              }
              delete traitValues.imageUrl
              delete traitValues.imageAlt
            }
            
            // 處理左側圖片
            if (traitValues.leftImageUrl) {
              sectionData.leftImage = {
                url: traitValues.leftImageUrl,
                alt: traitValues.leftImageAlt || ''
              }
              delete traitValues.leftImageUrl
              delete traitValues.leftImageAlt
            }
            
            // 處理右側圖片
            if (traitValues.rightImageUrl) {
              sectionData.rightImage = {
                url: traitValues.rightImageUrl,
                alt: traitValues.rightImageAlt || ''
              }
              delete traitValues.rightImageUrl
              delete traitValues.rightImageAlt
            }
          }

          // 添加其餘的 trait 值
          Object.keys(traitValues).forEach(key => {
            // 處理數值類型
            if (['autoplaySpeed', 'limit', 'cardsPerRow', 'postsPerRow'].includes(key)) {
              sectionData[key] = parseInt(traitValues[key]) || traitValues[key]
            } else {
              sectionData[key] = traitValues[key]
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
        alert('Sanity 格式數據已複製到剪貼簿！\n\n您可以將此數據貼到 Sanity Studio 中使用。')
      }).catch(() => {
        // 如果剪貼簿API不可用，顯示在新視窗
        const newWindow = window.open('', '_blank')
        if (newWindow) {
          newWindow.document.write(`
            <html>
              <head><title>Sanity 數據導出</title></head>
              <body>
                <h2>複製以下 JSON 數據到 Sanity Studio：</h2>
                <textarea style="width: 100%; height: 400px; font-family: monospace;">${JSON.stringify(sanityData, null, 2)}</textarea>
              </body>
            </html>
          `)
        }
      })
    }
  })

  // 添加工具列按鈕
  editor.Panels.addButton('options', [
    {
      id: 'import-from-sanity',
      className: 'btn-import-sanity',
      label: '匯入',
      command: 'import-from-sanity',
      attributes: { title: '從 Sanity 匯入首頁模組' }
    },
    {
      id: 'export-to-sanity',
      className: 'btn-export-sanity',
      label: '📤',
      command: 'export-to-sanity',
      attributes: { title: '導出為 Sanity 格式' }
    }
  ])
}

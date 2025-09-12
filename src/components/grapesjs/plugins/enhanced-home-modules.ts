import { Editor } from 'grapesjs'

export default function enhancedHomeModulesPlugin(editor: Editor) {
  const blockManager = editor.BlockManager
  const domComponents = editor.DomComponents

  // 添加模組專用樣式
  editor.setStyle(`
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

  // 1. 主橫幅模組
  blockManager.add('home-hero-section', {
    label: '🎯 主橫幅',
    category: '首頁模組',
    content: {
      type: 'hero-section-component',
      content: `
        <div class="homepage-module hero-section" data-module-type="mainBanner">
          <div class="module-status">啟用</div>
          <div class="module-preview">
            <span class="module-icon">🎯</span>
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
  blockManager.add('home-service-cards', {
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
  blockManager.add('home-image-text', {
    label: '🖼️ 圖文區塊',
    category: '首頁模組',
    content: {
      type: 'image-text-component',
      content: `
        <div class="homepage-module image-text" data-module-type="imageTextBlock">
          <div class="module-status">啟用</div>
          <div class="module-preview">
            <span class="module-icon">🖼️</span>
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
  blockManager.add('home-featured-products', {
    label: '🛍️ 精選商品',
    category: '首頁模組',
    content: {
      type: 'featured-products-component',
      content: `
        <div class="homepage-module featured-products" data-module-type="featuredProducts">
          <div class="module-status">啟用</div>
          <div class="module-preview">
            <span class="module-icon">🛍️</span>
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
  blockManager.add('home-blog-section', {
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
  blockManager.add('home-youtube-section', {
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
                ▶️
              </div>
            </div>
            <div class="module-config-hint">點擊右側面板配置影片網址</div>
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
        <div class="homepage-module content-section" data-module-type="contentSection">
          <div class="module-status">啟用</div>
          <div class="module-preview">
            <span class="module-icon">📄</span>
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
          // 幻燈片內容
          {
            type: 'text',
            name: 'backgroundImage',
            label: '背景圖片網址',
            placeholder: '輸入圖片網址'
          },
          {
            type: 'text',
            name: 'backgroundImageAlt',
            label: '背景圖片替代文字',
            placeholder: '用於無障礙和 SEO 優化'
          },
          {
            type: 'text',
            name: 'heading',
            label: '主標題',
            placeholder: '輸入橫幅主標題'
          },
          {
            type: 'text',
            name: 'buttonText',
            label: '按鈕文字',
            placeholder: '輸入按鈕文字'
          },
          {
            type: 'text',
            name: 'buttonLink',
            label: '按鈕連結',
            placeholder: '輸入按鈕連結網址'
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
          // 服務卡片設定
          {
            type: 'text',
            name: 'serviceName',
            label: '服務名稱',
            placeholder: '例：男士理髮'
          },
          {
            type: 'text',
            name: 'serviceEnglishName',
            label: '英文名稱',
            placeholder: '例：Men\'s Haircut'
          },
          {
            type: 'text',
            name: 'stylistLevel',
            label: '設計師等級',
            placeholder: '例：資深設計師'
          },
          {
            type: 'number',
            name: 'servicePrice',
            label: '價格',
            placeholder: '例：800',
            min: 0
          },
          {
            type: 'select',
            name: 'priceType',
            label: '價格類型',
            value: 'up',
            options: [
              { id: 'up', value: 'up', name: '起價 (顯示「起」)' },
              { id: 'fixed', value: 'fixed', name: '固定價格' }
            ]
          },
          {
            type: 'text',
            name: 'stylistName',
            label: '設計師名稱',
            placeholder: '例：Tim'
          },
          {
            type: 'text',
            name: 'cardImage',
            label: '設計師圖片網址',
            placeholder: '輸入圖片網址'
          },
          {
            type: 'text',
            name: 'cardImageAlt',
            label: '圖片替代文字',
            placeholder: '例：Tim 設計師照片'
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
          {
            type: 'text',
            name: 'image',
            label: '主要圖片網址',
            placeholder: '輸入圖片網址'
          },
          {
            type: 'text',
            name: 'imageAlt',
            label: '主要圖片替代文字',
            placeholder: '用於無障礙和 SEO 優化'
          },
          {
            type: 'text',
            name: 'leftImage',
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
            type: 'text',
            name: 'rightImage',
            label: '右側圖片網址',
            placeholder: '輸入右側圖片網址'
          },
          {
            type: 'text',
            name: 'rightImageAlt',
            label: '右側圖片替代文字',
            placeholder: '右側圖片的替代文字'
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
          traits.each((trait: any) => {
            const name = trait.get('name')
            const value = trait.get('value')
            if (value !== undefined && value !== '' && name !== 'isActive') {
              // 處理數值類型
              if (name === 'autoplaySpeed' || name === 'limit' || name === 'cardsPerRow' || name === 'postsPerRow') {
                sectionData[name] = parseInt(value) || value
              } else {
                sectionData[name] = value
              }
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
      label: '📥',
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
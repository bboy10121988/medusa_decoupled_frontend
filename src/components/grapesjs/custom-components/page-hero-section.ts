/**
 * Page Hero Section Component for GrapesJS
 * 從 page.tsx 的 HeroSection 遷移到 GrapesJS 自定義組件
 * 支援標題、描述、按鈕、背景圖片、高度調整等功能
 */

export default (editor: any) => {
  const domComponents = editor.DomComponents;
  const blockManager = editor.BlockManager;

  // 註冊組件類型
  domComponents.addType('page-hero-section', {
    model: {
      defaults: {
        tagName: 'section',
        attributes: {
          class: 'page-hero-section w-full',
          'data-component': 'page-hero-section'
        },
        traits: [
          {
            type: 'text',
            name: 'heading',
            label: '主標題',
            placeholder: '輸入主標題'
          },
          {
            type: 'textarea',
            name: 'description',
            label: '描述',
            placeholder: '輸入描述內容'
          },
          {
            type: 'text',
            name: 'button-text',
            label: '按鈕文字',
            placeholder: '立即預約'
          },
          {
            type: 'text',
            name: 'button-link',
            label: '按鈕連結',
            placeholder: 'https://example.com'
          },
          {
            type: 'image-url',
            name: 'background-image',
            label: '背景圖片',
            placeholder: '選擇背景圖片'
          },
          {
            type: 'select',
            name: 'height',
            label: '區塊高度',
            options: [
              { id: 'small', name: '小 (400px)' },
              { id: 'medium', name: '中 (600px)' },
              { id: 'large', name: '大 (800px)' },
              { id: 'fullscreen', name: '全螢幕' }
            ],
            default: 'medium'
          },
          {
            type: 'select',
            name: 'text-align',
            label: '文字對齊',
            options: [
              { id: 'left', name: '靠左' },
              { id: 'center', name: '置中' },
              { id: 'right', name: '靠右' }
            ],
            default: 'center'
          },
          {
            type: 'checkbox',
            name: 'show-overlay',
            label: '顯示遮罩層',
            default: true
          }
        ],
        // 預設內容結構
        components: [
          {
            tagName: 'div',
            attributes: {
              class: 'hero-container relative w-full h-[600px] flex items-center justify-center bg-gray-900'
            },
            components: [
              // 背景圖片
              {
                tagName: 'div',
                attributes: {
                  class: 'hero-background absolute inset-0 bg-cover bg-center bg-no-repeat',
                  style: 'background-image: url("https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1200")'
                }
              },
              // 遮罩層
              {
                tagName: 'div',
                attributes: {
                  class: 'hero-overlay absolute inset-0 bg-black bg-opacity-50'
                }
              },
              // 內容區域
              {
                tagName: 'div',
                attributes: {
                  class: 'hero-content relative z-10 text-center text-white px-6 max-w-4xl mx-auto'
                },
                components: [
                  {
                    tagName: 'h1',
                    attributes: {
                      class: 'hero-title text-4xl md:text-6xl font-bold mb-6'
                    },
                    content: '歡迎來到 Tim\'s Fantasy World'
                  },
                  {
                    tagName: 'p',
                    attributes: {
                      class: 'hero-description text-xl md:text-2xl mb-8 text-gray-200'
                    },
                    content: '專業美髮沙龍與高級美髮產品'
                  },
                  {
                    tagName: 'a',
                    attributes: {
                      class: 'hero-button inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg transition-colors duration-300 text-lg',
                      href: 'https://page.line.me/timsfantasyworld',
                      target: '_blank',
                      rel: 'noopener noreferrer'
                    },
                    content: '立即預約 LINE 諮詢'
                  }
                ]
              }
            ]
          }
        ],
        style: {
          'min-height': '600px',
          position: 'relative',
          overflow: 'hidden'
        }
      },

      // 初始化方法
      init() {
        // 監聽 traits 變化
        (this as any).on('change:attributes', (this as any).updateComponent);
        
        // 設定響應式樣式
        (this as any).addClass('responsive-hero');
      },

      // 更新組件方法
      updateComponent() {
        const self = this as any;
        const attrs = self.getAttributes();
        const elements = {
          container: self.find('.hero-container')[0],
          title: self.find('.hero-title')[0],
          description: self.find('.hero-description')[0],
          button: self.find('.hero-button')[0],
          background: self.find('.hero-background')[0],
          overlay: self.find('.hero-overlay')[0],
          content: self.find('.hero-content')[0]
        };

        this.updateTextContent(attrs, elements);
        this.updateButtonContent(attrs, elements);
        this.updateBackground(attrs, elements);
        this.updateHeight(attrs, elements);
        this.updateTextAlign(attrs, elements);
        this.updateOverlay(attrs, elements);
      },

      // 更新文字內容
      updateTextContent(attrs: any, elements: any) {
        if (attrs.heading && elements.title) {
          elements.title.set('content', attrs.heading);
        }
        if (attrs.description && elements.description) {
          elements.description.set('content', attrs.description);
        }
      },

      // 更新按鈕內容
      updateButtonContent(attrs: any, elements: any) {
        if (attrs['button-text'] && elements.button) {
          elements.button.set('content', attrs['button-text']);
        }
        if (attrs['button-link'] && elements.button) {
          elements.button.setAttributes({ href: attrs['button-link'] });
        }
      },

      // 更新背景圖片
      updateBackground(attrs: any, elements: any) {
        if (attrs['background-image'] && elements.background) {
          elements.background.setStyle({
            'background-image': `url("${attrs['background-image']}")`
          });
        }
      },

      // 更新高度
      updateHeight(attrs: any, elements: any) {
        if (attrs.height && elements.container) {
          const heights: Record<string, string> = {
            small: '400px',
            medium: '600px',
            large: '800px',
            fullscreen: '100vh'
          };
          elements.container.setStyle({ 
            height: heights[attrs.height] || '600px' 
          });
        }
      },

      // 更新文字對齊
      updateTextAlign(attrs: any, elements: any) {
        if (attrs['text-align'] && elements.content) {
          elements.content.removeClass('text-left text-center text-right');
          elements.content.addClass(`text-${attrs['text-align']}`);
        }
      },

      // 更新遮罩層
      updateOverlay(attrs: any, elements: any) {
        if (elements.overlay) {
          const display = attrs['show-overlay'] === false ? 'none' : 'block';
          elements.overlay.setStyle({ display });
        }
      }
    },

    // 視圖 (可選，用於自定義編輯器中的行為)
    view: {
      onRender() {
        // 渲染完成後的處理
        console.log('Page Hero Section 渲染完成');
      }
    }
  });

  // 註冊區塊到區塊管理器
  blockManager.add('page-hero-section-block', {
    label: '🏆 Hero 區塊',
    content: {
      type: 'page-hero-section'
    },
    category: 'page-sections',
    media: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="6" width="20" height="12" rx="2" fill="#4A90E2"/>
      <rect x="6" y="10" width="12" height="2" fill="white"/>
      <rect x="8" y="13" width="8" height="1" fill="white" opacity="0.7"/>
    </svg>`,
    attributes: {
      title: 'Page Hero Section - 從原始 Hero 組件移植，支援完整的 traits 編輯功能'
    }
  });

  console.log('✅ Page Hero Section 組件已註冊');
};
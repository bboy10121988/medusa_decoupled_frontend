/**
 * Page Service Cards Component for GrapesJS
 * 從 page.tsx 的 ServiceCardsSection 遷移到 GrapesJS 自定義組件
 * 支持服務卡片展示，包含圖標、標題、描述和按鈕
 */

// 預設服務資料
const defaultServices = [
  {
    id: 1,
    title: '專業染髮',
    description: '使用頂級染髮產品，為您打造完美髮色',
    icon: '設計',
    link: 'https://page.line.me/timsfantasyworld'
  },
  {
    id: 2,
    title: '造型設計',
    description: '專業設計師為您量身打造獨特髮型',
    icon: '剪髮',
    link: 'https://page.line.me/timsfantasyworld'
  },
  {
    id: 3,
    title: '護髮療程',
    description: '深層護理，讓您的秀髮重現健康光澤',
    icon: '按摩',
    link: 'https://page.line.me/timsfantasyworld'
  }
];

export default (editor: any) => {
  const domComponents = editor.DomComponents;
  const blockManager = editor.BlockManager;

  // 註冊組件類型
  domComponents.addType('page-service-cards', {
    model: {
      defaults: {
        tagName: 'section',
        attributes: {
          class: 'page-service-cards w-full py-16 bg-gray-50',
          'data-component': 'page-service-cards'
        },
        traits: [
          {
            type: 'text',
            name: 'section-title',
            label: '區塊標題',
            placeholder: '我們的服務'
          },
          {
            type: 'textarea',
            name: 'section-description',
            label: '區塊描述',
            placeholder: '專業美髮服務，滿足您的所有需求'
          },
          {
            type: 'select',
            name: 'columns',
            label: '欄位數量',
            options: [
              { id: '1', name: '1 欄' },
              { id: '2', name: '2 欄' },
              { id: '3', name: '3 欄' },
              { id: '4', name: '4 欄' }
            ],
            default: '3'
          },
          {
            type: 'select',
            name: 'card-style',
            label: '卡片樣式',
            options: [
              { id: 'simple', name: '簡約' },
              { id: 'shadow', name: '陰影' },
              { id: 'border', name: '邊框' },
              { id: 'hover', name: '懸停效果' }
            ],
            default: 'shadow'
          },
          {
            type: 'select',
            name: 'background-color',
            label: '背景色彩',
            options: [
              { id: 'gray-50', name: '淺灰' },
              { id: 'white', name: '白色' },
              { id: 'blue-50', name: '淺藍' },
              { id: 'green-50', name: '淺綠' }
            ],
            default: 'gray-50'
          },
          {
            type: 'checkbox',
            name: 'show-icons',
            label: '顯示圖標',
            default: true
          }
        ],
        components: [
          {
            tagName: 'div',
            attributes: {
              class: 'service-cards-container max-w-7xl mx-auto px-6'
            },
            components: [
              // 標題區域
              {
                tagName: 'div',
                attributes: {
                  class: 'service-cards-header text-center mb-12'
                },
                components: [
                  {
                    tagName: 'h2',
                    attributes: {
                      class: 'section-title text-3xl md:text-4xl font-bold text-gray-900 mb-4'
                    },
                    content: '我們的服務'
                  },
                  {
                    tagName: 'p',
                    attributes: {
                      class: 'section-description text-xl text-gray-600 max-w-2xl mx-auto'
                    },
                    content: '專業美髮服務，滿足您的所有需求'
                  }
                ]
              },
              // 服務卡片網格
              {
                tagName: 'div',
                attributes: {
                  class: 'service-cards-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'
                },
                components: defaultServices.map((service) => ({
                  tagName: 'div',
                  attributes: {
                    class: 'service-card bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-2',
                    'data-service-id': service.id.toString()
                  },
                  components: [
                    // 圖標
                    {
                      tagName: 'div',
                      attributes: {
                        class: 'service-icon text-4xl mb-4 text-center'
                      },
                      content: service.icon
                    },
                    // 標題
                    {
                      tagName: 'h3',
                      attributes: {
                        class: 'service-title text-xl font-semibold text-gray-900 mb-3 text-center'
                      },
                      content: service.title
                    },
                    // 描述
                    {
                      tagName: 'p',
                      attributes: {
                        class: 'service-description text-gray-600 mb-4 text-center'
                      },
                      content: service.description
                    },
                    // 按鈕
                    {
                      tagName: 'div',
                      attributes: {
                        class: 'service-button-container text-center'
                      },
                      components: [
                        {
                          tagName: 'a',
                          attributes: {
                            class: 'service-button inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-300',
                            href: service.link,
                            target: '_blank',
                            rel: 'noopener noreferrer'
                          },
                          content: '了解更多'
                        }
                      ]
                    }
                  ]
                }))
              }
            ]
          }
        ],
        style: {
          'padding-top': '4rem',
          'padding-bottom': '4rem',
          'background-color': 'rgb(249 250 251)'
        }
      },

      init() {
        (this as any).on('change:attributes', (this as any).updateComponent);
      },

      updateComponent() {
        const self = this as any;
        const attrs = self.getAttributes();
        
        this.updateSectionContent(attrs, self);
        this.updateGridLayout(attrs, self);
        this.updateCardStyle(attrs, self);
        this.updateBackgroundColor(attrs, self);
        this.updateIconsVisibility(attrs, self);
      },

      updateSectionContent(attrs: any, self: any) {
        const title = self.find('.section-title')[0];
        const description = self.find('.section-description')[0];

        if (attrs['section-title'] && title) {
          title.set('content', attrs['section-title']);
        }
        if (attrs['section-description'] && description) {
          description.set('content', attrs['section-description']);
        }
      },

      updateGridLayout(attrs: any, self: any) {
        const grid = self.find('.service-cards-grid')[0];
        if (attrs.columns && grid) {
          const columnClasses = {
            '1': 'grid-cols-1',
            '2': 'grid-cols-1 md:grid-cols-2',
            '3': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
            '4': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
          };
          
          // 移除舊的網格類別
          grid.removeClass('grid-cols-1 md:grid-cols-2 lg:grid-cols-3 lg:grid-cols-4');
          // 添加新的網格類別
          grid.addClass(columnClasses[attrs.columns as keyof typeof columnClasses]);
        }
      },

      updateCardStyle(attrs: any, self: any) {
        const cards = self.find('.service-card');
        if (attrs['card-style'] && cards.length) {
          const styleClasses = {
            simple: 'bg-white rounded-lg p-6',
            shadow: 'bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-2',
            border: 'bg-white rounded-lg border-2 border-gray-200 p-6 hover:border-blue-300 transition-colors duration-300',
            hover: 'bg-white rounded-lg shadow-md p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300'
          };

          cards.forEach((card: any) => {
            // 清除所有樣式類別
            card.removeClass('shadow-lg shadow-md shadow-2xl border-2 border-gray-200 border-blue-300 hover:shadow-xl hover:shadow-2xl hover:-translate-y-2 hover:scale-105 hover:border-blue-300 transition-all transition-colors duration-300');
            // 添加新樣式
            card.addClass(styleClasses[attrs['card-style'] as keyof typeof styleClasses]);
          });
        }
      },

      updateBackgroundColor(attrs: any, self: any) {
        if (attrs['background-color']) {
          const bgClasses = {
            'gray-50': 'bg-gray-50',
            'white': 'bg-white',
            'blue-50': 'bg-blue-50',
            'green-50': 'bg-green-50'
          };
          
          // 移除舊背景色
          self.removeClass('bg-gray-50 bg-white bg-blue-50 bg-green-50');
          // 添加新背景色
          self.addClass(bgClasses[attrs['background-color'] as keyof typeof bgClasses]);
        }
      },

      updateIconsVisibility(attrs: any, self: any) {
        const icons = self.find('.service-icon');
        const showIcons = attrs['show-icons'] !== false;
        
        icons.forEach((icon: any) => {
          icon.setStyle({ display: showIcons ? 'block' : 'none' });
        });
      }
    },

    view: {
      onRender() {
        console.log('Service Cards 組件已渲染');
      }
    }
  });

  // 添加到區塊管理器
  blockManager.add('page-service-cards', {
    label: 'Service Cards',
    content: { type: 'page-service-cards' },
    media: `<svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z"/>
    </svg>`,
    category: 'Page Sections',
    attributes: { class: 'gjs-block-section' }
  });

  console.log('✅ Page Service Cards 組件已註冊');
};
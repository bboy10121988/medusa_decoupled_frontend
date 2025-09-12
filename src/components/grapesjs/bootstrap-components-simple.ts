/**
 * Bootstrap 元件庫 - 簡化版
 * 為 GrapesJS 編輯器提供精簡的 Bootstrap 5.3.8 元件
 */

// @ts-nocheck
export default function addBootstrapComponents(editor: any) {
  try {
    const blockManager = editor.BlockManager;
    
    if (!blockManager) {
      console.error('BlockManager 不可用');
      return;
    }

    console.log('開始添加 Bootstrap 元件...');

    // 確保 Bootstrap 和 Font Awesome 載入到主文檔和畫布
    const loadAssets = () => {
      // 載入到文檔的函數
      const loadToDocument = (doc: Document) => {
        // Bootstrap CSS
        if (!doc.querySelector('link[href*="bootstrap"]')) {
          const bootstrapCSS = doc.createElement('link');
          bootstrapCSS.rel = 'stylesheet';
          bootstrapCSS.href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css';
          bootstrapCSS.integrity = 'sha384-fQybjgWLrvvRgtW6bFlB7jaZrFsaBXjsOMm/tB9LTS58ONXgqbR9W8oWht/amnpF';
          bootstrapCSS.crossOrigin = 'anonymous';
          doc.head.appendChild(bootstrapCSS);
        }
        
        // Bootstrap JS
        if (!doc.querySelector('script[src*="bootstrap"]')) {
          const bootstrapJS = doc.createElement('script');
          bootstrapJS.src = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js';
          bootstrapJS.integrity = 'sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz';
          bootstrapJS.crossOrigin = 'anonymous';
          doc.head.appendChild(bootstrapJS);
        }
        
        // Font Awesome
        if (!doc.querySelector('link[href*="font-awesome"]')) {
          const fontAwesome = doc.createElement('link');
          fontAwesome.rel = 'stylesheet';
          fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
          doc.head.appendChild(fontAwesome);
        }
      };

      // 載入到主文檔
      loadToDocument(document);

      // 安全地載入到畫布
      const loadToCanvas = () => {
        try {
          // 多種方式嘗試獲取畫布
          let canvasFrame = null;
          
          if (editor?.Canvas?.getFrameEl) {
            canvasFrame = editor.Canvas.getFrameEl();
          } else if (editor?.Canvas?.getFrame) {
            canvasFrame = editor.Canvas.getFrame();
          } else if (editor?.getCanvas && editor.getCanvas().getFrameEl) {
            canvasFrame = editor.getCanvas().getFrameEl();
          }
          
          if (canvasFrame?.contentDocument) {
            loadToDocument(canvasFrame.contentDocument);
            console.log('Bootstrap CSS 已載入到畫布');
            return true;
          }
        } catch (error) {
          console.warn('無法載入 Bootstrap CSS 到畫布:', error);
        }
        return false;
      };

      // 延遲載入到畫布（確保畫布已經初始化）
      setTimeout(() => {
        loadToCanvas();
      }, 1500);

      // 監聽編輯器事件，當畫布準備好時再載入
      if (editor?.on) {
        editor.on('load', () => {
          setTimeout(loadToCanvas, 500);
        });
        
        editor.on('canvas:frame:load', () => {
          loadToCanvas();
        });
        
        // 監聽元件添加事件，確保新添加的元件有正確的樣式
        editor.on('component:add', () => {
          setTimeout(loadToCanvas, 100);
        });
      }
    };

    loadAssets();

        // 1. Alert 警告框
    blockManager.add('bootstrap-alert', {
      label: 'Alert',
      category: 'Bootstrap',
      content: {
        type: 'div',
        classes: ['alert', 'alert-primary'],
        attributes: {
          role: 'alert'
        },
        content: '這是一個 Bootstrap 警告框'
      },
      attributes: {
        class: 'fa fa-exclamation-triangle'
      }
    });

    // 2. Button 按鈕
    blockManager.add('bootstrap-button', {
      label: 'Button',
      category: 'Bootstrap',
      content: {
        type: 'button',
        classes: ['btn', 'btn-primary'],
        attributes: {
          type: 'button'
        },
        content: 'Bootstrap 按鈕'
      },
      attributes: {
        class: 'fa fa-hand-pointer'
      }
    });

    // 3. Card 卡片
    blockManager.add('bootstrap-card', {
      label: 'Card',
      category: 'Bootstrap',
      content: {
        type: 'div',
        classes: ['card'],
        style: { width: '18rem' },
        components: [
          {
            type: 'image',
            classes: ['card-img-top'],
            attributes: {
              src: 'https://via.placeholder.com/300x200',
              alt: '卡片圖片'
            }
          },
          {
            type: 'div',
            classes: ['card-body'],
            components: [
              {
                tagName: 'h5',
                classes: ['card-title'],
                content: '卡片標題'
              },
              {
                tagName: 'p',
                classes: ['card-text'],
                content: '這是一張示例卡片的簡短說明文字。'
              },
              {
                type: 'link',
                classes: ['btn', 'btn-primary'],
                attributes: {
                  href: 'javascript:void(0)'
                },
                content: '前往某處'
              }
            ]
          }
        ]
      },
      attributes: {
        class: 'fa fa-credit-card'
      }
    });

    // 4. Badge 徽章
    blockManager.add('bootstrap-badge', {
      label: 'Badge',
      category: 'Bootstrap',
      content: `
        <span class="badge bg-primary">徽章</span>
      `,
      attributes: {
        class: 'fa fa-tag'
      }
    });

    // 5. Progress Bar 進度條
    blockManager.add('bootstrap-progress', {
      label: 'Progress',
      category: 'Bootstrap',
      content: `
        <div class="progress" style="height: 20px;">
          <div class="progress-bar bg-success" role="progressbar" style="width: 25%" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">25%</div>
        </div>
      `,
      attributes: {
        class: 'fa fa-chart-line'
      }
    });

    // 6. List Group 列表群組
    blockManager.add('bootstrap-list-group', {
      label: 'List',
      category: 'Bootstrap',
      content: `
        <ul class="list-group">
          <li class="list-group-item">第一個項目</li>
          <li class="list-group-item">第二個項目</li>
          <li class="list-group-item">第三個項目</li>
        </ul>
      `,
      attributes: {
        class: 'fa fa-list'
      }
    });

    // 7. Modal 模態框
    blockManager.add('bootstrap-modal', {
      label: 'Modal',
      category: 'Bootstrap',
      content: `
        <div>
          <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModal">
            打開模態框
          </button>
          <div class="modal fade" id="exampleModal" tabindex="-1">
            <div class="modal-dialog">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title">模態框標題</h5>
                  <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                  模態框內容
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">關閉</button>
                  <button type="button" class="btn btn-primary">儲存</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      `,
      attributes: {
        class: 'fa fa-window-maximize'
      }
    });

    // 8. Carousel 輪播圖
    blockManager.add('bootstrap-carousel', {
      label: 'Carousel',
      category: 'Bootstrap',
      content: `
        <div id="carouselExample" class="carousel slide" data-bs-ride="carousel">
          <div class="carousel-inner">
            <div class="carousel-item active">
              <img src="https://via.placeholder.com/800x400/007bff/ffffff?text=第一張" class="d-block w-100" alt="第一張">
            </div>
            <div class="carousel-item">
              <img src="https://via.placeholder.com/800x400/28a745/ffffff?text=第二張" class="d-block w-100" alt="第二張">
            </div>
            <div class="carousel-item">
              <img src="https://via.placeholder.com/800x400/dc3545/ffffff?text=第三張" class="d-block w-100" alt="第三張">
            </div>
          </div>
          <button class="carousel-control-prev" type="button" data-bs-target="#carouselExample" data-bs-slide="prev">
            <span class="carousel-control-prev-icon"></span>
          </button>
          <button class="carousel-control-next" type="button" data-bs-target="#carouselExample" data-bs-slide="next">
            <span class="carousel-control-next-icon"></span>
          </button>
        </div>
      `,
      attributes: {
        class: 'fa fa-images'
      }
    });

    // 9. Accordion 手風琴
    blockManager.add('bootstrap-accordion', {
      label: 'Accordion',
      category: 'Bootstrap',
      content: `
        <div class="accordion" id="accordionExample">
          <div class="accordion-item">
            <h2 class="accordion-header">
              <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne">
                手風琴項目 #1
              </button>
            </h2>
            <div id="collapseOne" class="accordion-collapse collapse show" data-bs-parent="#accordionExample">
              <div class="accordion-body">
                這是第一個項目的手風琴正文。
              </div>
            </div>
          </div>
          <div class="accordion-item">
            <h2 class="accordion-header">
              <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo">
                手風琴項目 #2
              </button>
            </h2>
            <div id="collapseTwo" class="accordion-collapse collapse" data-bs-parent="#accordionExample">
              <div class="accordion-body">
                這是第二個項目的手風琴正文。
              </div>
            </div>
          </div>
        </div>
      `,
      attributes: {
        class: 'fa fa-list'
      }
    });

    // 10. Form 表單
    blockManager.add('bootstrap-form', {
      label: 'Form',
      category: 'Bootstrap',
      content: `
        <form onsubmit="return false;">
          <div class="mb-3">
            <label for="email" class="form-label">電子郵件</label>
            <input type="email" class="form-control" id="email">
          </div>
          <div class="mb-3">
            <label for="password" class="form-label">密碼</label>
            <input type="password" class="form-control" id="password">
          </div>
          <div class="mb-3 form-check">
            <input type="checkbox" class="form-check-input" id="check">
            <label class="form-check-label" for="check">
              記住我
            </label>
          </div>
          <button type="button" class="btn btn-primary" onclick="return false;">提交</button>
        </form>
      `,
      attributes: {
        class: 'fa fa-wpforms'
      }
    });

    console.log('✅ Bootstrap 簡化元件庫載入完成！');
    console.log('📦 已添加 10 個核心 Bootstrap 元件');

  } catch (error) {
    console.error('❌ Bootstrap 元件庫載入失敗:', error);
  }
}
/**
 * GrapesJS 元件庫懸停放大鏡預覽功能
 * 為左側元件面板添加互動式預覽體驗
 */

export interface BlockPreviewConfig {
  enabled: boolean;
  scale: number;
  delay: number;
  duration: number;
  offsetX: number;
  offsetY: number;
  maxWidth: number;
  maxHeight: number;
}

export const defaultPreviewConfig: BlockPreviewConfig = {
  enabled: true,
  scale: 1.5, // 放大倍數
  delay: 300, // 懸停延遲 (毫秒)
  duration: 200, // 動畫持續時間
  offsetX: 20, // X軸偏移
  offsetY: 10, // Y軸偏移
  maxWidth: 400, // 最大寬度
  maxHeight: 300 // 最大高度
};

/**
 * 元件預覽內容生成器
 */
class BlockPreviewGenerator {
  private config: BlockPreviewConfig;

  constructor(config: BlockPreviewConfig = defaultPreviewConfig) {
    this.config = config;
  }

  /**
   * 根據元件類型生成預覽HTML
   */
  generatePreviewContent(block: any): string {
    const { id, label, category } = block.attributes || block;
    const blockContent = block.get ? block.get('content') : block.content;
    
    // 根據不同元件類型生成真實的HTML預覽
    switch (id || label) {
      case 'text':
      case '文字區塊':
        return this.generateRealTextPreview();
      
      case 'image':
      case '圖片':
        return this.generateRealImagePreview();
      
      case 'link':
        return this.generateRealLinkPreview();
      
      case 'carousel':
      case '全寬輪播圖':
      case '輪播組件':
        return this.generateRealCarouselPreview();
      
      case 'countdown':
      case '倒計時器':
        return this.generateRealCountdownPreview();
      
      case 'tabs':
      case '分頁標籤':
        return this.generateRealTabsPreview();
      
      case 'form':
      case 'input':
      case 'textarea':
        return this.generateRealFormPreview();
      
      case 'video':
      case '影片':
        return this.generateRealVideoPreview();
      
      case 'map':
      case '地圖':
        return this.generateRealMapPreview();

      case 'column1':
      case '單列':
        return this.generateRealColumnPreview(1);

      case 'column2':
      case '雙列':
        return this.generateRealColumnPreview(2);

      case 'column3':
      case '三列':
        return this.generateRealColumnPreview(3);
      
      default:
        // 如果有真實的 HTML 內容，直接渲染
        if (blockContent && typeof blockContent === 'string') {
          return this.generateRealContentPreview(blockContent);
        }
        return this.generateGenericPreview(label || id, category, blockContent);
    }
  }

  private generateRealTextPreview(): string {
    return `
      <div class="block-preview-content" style="padding: 16px; max-width: 350px;">
        <div style="margin-bottom: 12px;">
          <h1 style="font-size: 24px; font-weight: bold; margin: 0 0 8px 0; color: #2c3e50;">這是主標題</h1>
          <h2 style="font-size: 20px; font-weight: 600; margin: 0 0 8px 0; color: #34495e;">這是副標題</h2>
          <h3 style="font-size: 16px; font-weight: 500; margin: 0 0 12px 0; color: #7f8c8d;">這是小標題</h3>
        </div>
        <p style="font-size: 14px; line-height: 1.6; color: #2c3e50; margin: 0 0 12px 0;">
          這是一個段落範例。您可以在這裡添加任何文字內容，包含 <strong>粗體</strong>、<em>斜體</em> 和 
          <u>底線</u> 等格式。文字會自動換行並適應容器寬度。
        </p>
        <blockquote style="border-left: 4px solid #3498db; padding-left: 16px; margin: 12px 0; font-style: italic; color: #7f8c8d;">
          這是一個引用文字的範例，常用於重點強調或引述他人的話。
        </blockquote>
        <ul style="padding-left: 20px; margin: 8px 0;">
          <li style="margin: 4px 0; color: #2c3e50;">無序清單項目一</li>
          <li style="margin: 4px 0; color: #2c3e50;">無序清單項目二</li>
        </ul>
      </div>
    `;
  }

  private generateRealImagePreview(): string {
    return `
      <div class="block-preview-content" style="padding: 16px; max-width: 350px;">
        <div style="margin-bottom: 12px;">
          <img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
               alt="美麗的山景" 
               style="width: 100%; height: 180px; object-fit: cover; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);" />
        </div>
        <div style="text-align: center;">
          <p style="margin: 8px 0 4px 0; font-size: 14px; color: #2c3e50; font-weight: 500;">響應式圖片元件</p>
          <p style="margin: 0; font-size: 12px; color: #7f8c8d;">自動適應容器大小，支援 lazy loading</p>
        </div>
      </div>
    `;
  }

  private generateRealLinkPreview(): string {
    return `
      <div class="block-preview-content" style="padding: 16px; max-width: 350px;">
        <div style="margin-bottom: 16px;">
          <a href="#" style="color: #007bff; text-decoration: none; font-size: 16px; font-weight: 500; border-bottom: 2px solid transparent; transition: border-color 0.2s;">
            這是一個連結範例
          </a>
          <p style="margin: 8px 0; font-size: 14px; color: #6c757d;">連結可以導向其他頁面或錨點</p>
        </div>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <a href="#" style="color: #28a745; text-decoration: underline; font-size: 14px;">綠色連結樣式</a>
          <a href="#" style="color: #dc3545; text-decoration: none; font-size: 14px; border: 1px solid #dc3545; padding: 4px 8px; border-radius: 4px;">按鈕式連結</a>
        </div>
      </div>
    `;
  }

  private generateRealCarouselPreview(): string {
    return `
      <div class="block-preview-content" style="padding: 16px; max-width: 350px;">
        <div style="position: relative; height: 200px; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
          <div style="position: absolute; width: 100%; height: 100%; background: linear-gradient(45deg, #ff6b6b, #ee5a24); display: flex; align-items: center; justify-content: center; color: white;">
            <div style="text-align: center;">
              <img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                   style="width: 120px; height: 80px; object-fit: cover; border-radius: 4px; margin-bottom: 8px;" />
              <div style="font-size: 14px; font-weight: 500;">幻燈片 1</div>
            </div>
          </div>
          
          <button style="position: absolute; left: 8px; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.5); color: white; border: none; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center;">‹</button>
          <button style="position: absolute; right: 8px; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.5); color: white; border: none; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center;">›</button>
          
          <div style="position: absolute; bottom: 12px; left: 50%; transform: translateX(-50%); display: flex; gap: 6px;">
            <div style="width: 8px; height: 8px; border-radius: 50%; background: white; opacity: 1;"></div>
            <div style="width: 8px; height: 8px; border-radius: 50%; background: white; opacity: 0.5;"></div>
            <div style="width: 8px; height: 8px; border-radius: 50%; background: white; opacity: 0.5;"></div>
          </div>
        </div>
        <div style="margin-top: 8px; text-align: center;">
          <p style="margin: 0; font-size: 12px; color: #7f8c8d;">自動播放、導航控制、指示點</p>
        </div>
      </div>
    `;
  }

  private generateRealCountdownPreview(): string {
    const days = 7;
    const hours = 12;
    const minutes = 34;
    const seconds = 56;
    
    return `
      <div class="block-preview-content" style="padding: 16px; max-width: 350px;">
        <div style="background: #2c3e50; color: white; padding: 20px; border-radius: 8px; text-align: center;">
          <h3 style="margin: 0 0 16px 0; font-size: 18px;">🎉 限時優惠倒計時</h3>
          
          <div style="display: flex; justify-content: center; gap: 12px; margin-bottom: 16px;">
            <div style="background: rgba(255,255,255,0.1); padding: 8px 12px; border-radius: 4px; min-width: 50px;">
              <div style="font-size: 24px; font-weight: bold; font-family: monospace;">${days.toString().padStart(2, '0')}</div>
              <div style="font-size: 10px; opacity: 0.8;">天</div>
            </div>
            <div style="background: rgba(255,255,255,0.1); padding: 8px 12px; border-radius: 4px; min-width: 50px;">
              <div style="font-size: 24px; font-weight: bold; font-family: monospace;">${hours.toString().padStart(2, '0')}</div>
              <div style="font-size: 10px; opacity: 0.8;">時</div>
            </div>
            <div style="background: rgba(255,255,255,0.1); padding: 8px 12px; border-radius: 4px; min-width: 50px;">
              <div style="font-size: 24px; font-weight: bold; font-family: monospace;">${minutes.toString().padStart(2, '0')}</div>
              <div style="font-size: 10px; opacity: 0.8;">分</div>
            </div>
            <div style="background: rgba(255,255,255,0.1); padding: 8px 12px; border-radius: 4px; min-width: 50px;">
              <div style="font-size: 24px; font-weight: bold; font-family: monospace;">${seconds.toString().padStart(2, '0')}</div>
              <div style="font-size: 10px; opacity: 0.8;">秒</div>
            </div>
          </div>
          
          <p style="margin: 0; font-size: 14px; opacity: 0.9;">優惠即將結束，把握機會！</p>
        </div>
      </div>
    `;
  }

  private generateRealTabsPreview(): string {
    return `
      <div class="block-preview-content" style="padding: 16px; max-width: 350px;">
        <div style="border: 1px solid #e1e5e9; border-radius: 8px; overflow: hidden; background: white;">
          <div style="display: flex; background: #f8f9fa; border-bottom: 1px solid #e1e5e9;">
            <div style="padding: 12px 20px; background: white; border-bottom: 2px solid #007bff; color: #007bff; font-size: 14px; font-weight: 500; cursor: pointer; border-right: 1px solid #e1e5e9;">產品介紹</div>
            <div style="padding: 12px 20px; color: #6c757d; font-size: 14px; cursor: pointer; border-right: 1px solid #e1e5e9;">規格參數</div>
            <div style="padding: 12px 20px; color: #6c757d; font-size: 14px; cursor: pointer;">用戶評價</div>
          </div>
          
          <div style="padding: 20px; min-height: 120px;">
            <h4 style="margin: 0 0 12px 0; font-size: 16px; color: #2c3e50;">產品特色</h4>
            <ul style="padding-left: 16px; margin: 0; color: #495057;">
              <li style="margin: 8px 0;">高品質材料製造</li>
              <li style="margin: 8px 0;">人體工學設計</li>
              <li style="margin: 8px 0;">一年保固服務</li>
            </ul>
            <p style="margin: 16px 0 0 0; font-size: 14px; color: #6c757d;">
              點擊不同標籤可切換內容，支援鍵盤導航和動畫效果。
            </p>
          </div>
        </div>
      </div>
    `;
  }

  private generateRealFormPreview(): string {
    return `
      <div class="block-preview-content" style="padding: 16px; max-width: 350px;">
        <form style="background: #f8f9fa; padding: 20px; border-radius: 8px; border: 1px solid #e9ecef;">
          <h3 style="margin: 0 0 16px 0; font-size: 18px; color: #2c3e50;">聯絡我們</h3>
          
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; color: #495057; margin-bottom: 6px; font-weight: 500;">姓名 *</label>
            <input type="text" 
                   placeholder="請輸入您的姓名" 
                   style="width: 100%; padding: 10px 12px; border: 1px solid #ced4da; border-radius: 4px; font-size: 14px; box-sizing: border-box;" />
          </div>
          
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; color: #495057; margin-bottom: 6px; font-weight: 500;">電子郵件 *</label>
            <input type="email" 
                   placeholder="example@email.com" 
                   style="width: 100%; padding: 10px 12px; border: 1px solid #ced4da; border-radius: 4px; font-size: 14px; box-sizing: border-box;" />
          </div>
          
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; color: #495057; margin-bottom: 6px; font-weight: 500;">訊息</label>
            <textarea placeholder="請輸入您的訊息..." 
                      rows="3"
                      style="width: 100%; padding: 10px 12px; border: 1px solid #ced4da; border-radius: 4px; font-size: 14px; resize: vertical; box-sizing: border-box;"></textarea>
          </div>
          
          <button type="submit" 
                  style="background: #007bff; color: white; border: none; padding: 10px 24px; border-radius: 4px; font-size: 14px; cursor: pointer; font-weight: 500; transition: background 0.2s;">
            送出訊息
          </button>
        </form>
      </div>
    `;
  }

  private generateRealVideoPreview(): string {
    return `
      <div class="block-preview-content" style="padding: 16px; max-width: 350px;">
        <div style="position: relative; width: 100%; height: 180px; background: #000; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
          <video style="width: 100%; height: 100%; object-fit: cover;" poster="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80">
            <source src="#" type="video/mp4">
            您的瀏覽器不支援影片播放
          </video>
          
          <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; cursor: pointer;">
            <div style="width: 60px; height: 60px; background: rgba(255,255,255,0.9); border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: transform 0.2s;">
              <div style="width: 0; height: 0; border-left: 20px solid #007bff; border-top: 12px solid transparent; border-bottom: 12px solid transparent; margin-left: 4px;"></div>
            </div>
          </div>
          
          <div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(0,0,0,0.7)); padding: 12px; display: flex; align-items: center; gap: 8px;">
            <div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
            <div style="flex: 1; height: 4px; background: rgba(255,255,255,0.3); border-radius: 2px;">
              <div style="width: 30%; height: 100%; background: #007bff; border-radius: 2px;"></div>
            </div>
            <span style="color: white; font-size: 12px;">1:23 / 4:56</span>
          </div>
        </div>
        
        <div style="margin-top: 8px; text-align: center;">
          <p style="margin: 0; font-size: 12px; color: #7f8c8d;">支援多種格式、自訂控制項、響應式設計</p>
        </div>
      </div>
    `;
  }

  private generateRealMapPreview(): string {
    return `
      <div class="block-preview-content" style="padding: 16px; max-width: 350px;">
        <div style="position: relative; width: 100%; height: 180px; background: #e8f4fd; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
          <svg width="100%" height="100%" viewBox="0 0 400 200" style="position: absolute;">
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#ddd" stroke-width="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            <path d="M0,80 Q100,60 200,80 T400,100" stroke="#ffc107" stroke-width="4" fill="none"/>
            <path d="M80,0 L80,200" stroke="#ffc107" stroke-width="3" fill="none"/>
            <path d="M200,0 L200,200" stroke="#ffc107" stroke-width="3" fill="none"/>
            
            <rect x="60" y="50" width="40" height="30" fill="#6c757d" rx="2"/>
            <rect x="180" y="40" width="50" height="40" fill="#495057" rx="2"/>
            <rect x="260" y="60" width="35" height="25" fill="#6c757d" rx="2"/>
            
            <circle cx="150" cy="140" r="25" fill="#28a745" opacity="0.6"/>
            <circle cx="320" cy="50" r="20" fill="#28a745" opacity="0.6"/>
          </svg>
          
          <div style="position: absolute; top: 70px; left: 180px; transform: translate(-50%, -100%);">
            <div style="width: 30px; height: 30px; background: #dc3545; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>
            <div style="position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; transform: rotate(45deg);">
              <span style="font-size: 10px; color: #dc3545;">📍</span>
            </div>
          </div>
          
          <div style="position: absolute; top: 12px; right: 12px; display: flex; flex-direction: column; gap: 4px;">
            <button style="width: 30px; height: 30px; background: white; border: 1px solid #ccc; border-radius: 4px; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">+</button>
            <button style="width: 30px; height: 30px; background: white; border: 1px solid #ccc; border-radius: 4px; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">−</button>
          </div>
          
          <div style="position: absolute; bottom: 12px; left: 12px; background: white; padding: 6px 10px; border-radius: 4px; box-shadow: 0 2px 6px rgba(0,0,0,0.15); font-size: 12px; color: #2c3e50;">
            📍 台北市信義區市府路1號
          </div>
        </div>
        
        <div style="margin-top: 8px; text-align: center;">
          <p style="margin: 0; font-size: 12px; color: #7f8c8d;">互動式地圖、自訂標記、街景整合</p>
        </div>
      </div>
    `;
  }

  private generateRealColumnPreview(columns: number): string {
    const columnsHtml = Array.from({ length: columns }, (_, i) => `
      <div style="flex: 1; min-height: 80px; background: ${i % 2 === 0 ? '#f8f9fa' : '#e9ecef'}; border: 2px dashed #adb5bd; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #6c757d; font-size: 14px;">
        第 ${i + 1} 欄
      </div>
    `).join('');

    return `
      <div class="block-preview-content" style="padding: 16px; max-width: 350px;">
        <div style="border: 1px solid #e9ecef; border-radius: 8px; padding: 16px; background: white;">
          <h4 style="margin: 0 0 12px 0; font-size: 16px; color: #2c3e50; text-align: center;">${columns} 欄佈局</h4>
          <div style="display: flex; gap: 12px; margin-bottom: 12px;">
            ${columnsHtml}
          </div>
          <p style="margin: 0; font-size: 12px; color: #6c757d; text-align: center;">
            響應式網格系統，支援拖拽調整欄寬
          </p>
        </div>
      </div>
    `;
  }

  private generateRealContentPreview(content: string): string {
    // 清理並限制HTML內容長度
    const cleanContent = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                                 .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
                                 .substring(0, 1000);
    
    return `
      <div class="block-preview-content" style="padding: 16px; max-width: 350px; max-height: 250px; overflow: hidden;">
        <div style="border: 1px solid #e9ecef; border-radius: 8px; padding: 12px; background: #f8f9fa;">
          <h4 style="margin: 0 0 8px 0; font-size: 14px; color: #495057;">HTML 預覽</h4>
          <div style="font-size: 12px; background: white; padding: 12px; border-radius: 4px; border: 1px solid #dee2e6; max-height: 180px; overflow: auto;">
            ${cleanContent}
          </div>
        </div>
      </div>
    `;
  }

  private generateGenericPreview(label: string, category?: string, content?: any): string {
    const emoji = this.getEmojiForComponent(label, category);
    const description = this.getDescriptionForComponent(label, category);
    
    return `
      <div class="block-preview-content generic-preview" style="padding: 16px; max-width: 300px;">
        <div style="text-align: center; margin-bottom: 12px;">
          <div style="font-size: 48px; margin-bottom: 8px;">${emoji}</div>
          <h3 style="color: #333; margin: 0 0 8px 0; font-size: 16px;">${label}</h3>
          ${category ? `<span style="color: #666; font-size: 12px; background: #f0f0f0; padding: 2px 6px; border-radius: 3px;">${category}</span>` : ''}
        </div>
        <p style="color: #666; margin: 0; font-size: 14px; line-height: 1.4; text-align: center;">
          ${description}
        </p>
        ${content ? `<div style="margin-top: 12px; padding: 8px; background: #f8f9fa; border-radius: 4px; font-size: 12px; color: #6c757d; max-height: 100px; overflow: hidden;">${content}</div>` : ''}
      </div>
    `;
  }

  private getEmojiForComponent(label: string, category?: string): string {
    const componentEmojis: Record<string, string> = {
      'text': '📝', 'image': '🖼️', 'button': '🔘', 'form': '📋',
      'video': '📹', 'map': '🗺️', 'carousel': '🎠', 'accordion': '📂',
      'tab': '📁', 'modal': '💬', 'alert': '⚠️', 'badge': '🏷️',
      'card': '🃏', 'list': '📄', 'table': '📊', 'chart': '📈',
      'icon': '✨', 'divider': '➖', 'column': '🏗️', 'container': '📦'
    };

    const lowerLabel = label.toLowerCase();
    
    // 直接匹配
    for (const [key, emoji] of Object.entries(componentEmojis)) {
      if (lowerLabel.includes(key)) return emoji;
    }

    // 中文匹配
    const chineseMatches: Record<string, string> = {
      '文字': '📝', '圖片': '🖼️', '按鈕': '🔘', '表單': '📋',
      '影片': '📹', '地圖': '🗺️', '輪播': '🎠', '摺疊': '📂',
      '標籤': '📁', '彈窗': '💬', '警告': '⚠️', '徽章': '🏷️'
    };

    for (const [key, emoji] of Object.entries(chineseMatches)) {
      if (lowerLabel.includes(key)) return emoji;
    }

    return '🧩'; // 默認圖標
  }

  private getDescriptionForComponent(label: string, category?: string): string {
    const lowerLabel = label.toLowerCase();

    const descriptions: Record<string, string> = {
      'text': '添加和編輯文字內容，支援豐富的格式選項',
      'image': '插入圖片，支援響應式設計和延遲載入',
      'button': '創建可點擊的按鈕，支援多種樣式和互動效果',
      'form': '構建互動表單，收集用戶輸入資料',
      'video': '嵌入影片播放器，支援多種影片格式',
      'map': '整合互動式地圖功能，顯示位置資訊',
      'carousel': '創建圖片或內容輪播展示',
      'column': '靈活的多欄佈局系統，適應各種螢幕尺寸'
    };

    for (const [key, desc] of Object.entries(descriptions)) {
      if (lowerLabel.includes(key)) return desc;
    }

    return `${label} 元件 - 點擊添加到頁面中進行編輯`;
  }
}

/**
 * 元件庫懸停預覽增強器主類
 */
class BlockPreviewEnhancer {
  private editor: any;
  private config: BlockPreviewConfig;
  private generator: BlockPreviewGenerator;
  private previewElement: HTMLElement | null = null;
  private hoverTimer: number | null = null;

  constructor(editor: any, config: BlockPreviewConfig = defaultPreviewConfig) {
    this.editor = editor;
    this.config = { ...defaultPreviewConfig, ...config };
    this.generator = new BlockPreviewGenerator(this.config);

    console.log('🚀 BlockPreviewEnhancer 構造函數被調用', { enabled: this.config.enabled });
    
    // 如果配置啟用，則初始化
    if (this.config.enabled) {
      this.init();
    }
  }

  /**
   * 初始化預覽功能
   */
  init(): void {
    console.log('� BlockPreviewEnhancer init() 被調用');
    console.log('�🔍 正在初始化元件庫預覽功能...');
    
    // 注入樣式
    this.injectStyles();
    
    // 等待編輯器完全載入
    this.editor.on('load', () => {
      console.log('✅ GrapesJS 編輯器載入事件觸發');
      // 增加延遲，確保 BlockManager 完全初始化
      setTimeout(() => {
        console.log('⏰ 開始設置預覽監聽器...');
        this.setupPreviewListenersWithRetry();
        console.log('✅ 元件庫預覽功能初始化完成');
      }, 2000); // 增加延遲到 2 秒
    });

    // 如果編輯器已經載入完成，立即設置監聽器
    if (this.editor?.getModel?.()) {
      console.log('⚡ 編輯器已載入，立即設置監聽器');
      setTimeout(() => {
        console.log('⏰ 立即設置預覽監聽器...');
        this.setupPreviewListeners();
      }, 2000);
    }
  }

  /**
   * 注入必要的CSS樣式
   */
  private injectStyles(): void {
    if (document.getElementById('grapesjs-block-preview-styles')) {
      return;
    }

    const styles = `
      .gjs-block-preview-tooltip {
        position: fixed;
        background: white;
        border: 1px solid #e1e5e9;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.12);
        z-index: 9999;
        max-width: ${this.config.maxWidth}px;
        max-height: ${this.config.maxHeight}px;
        overflow: hidden;
        opacity: 0;
        transform: scale(0.8) translateY(10px);
        transition: all ${this.config.duration}ms cubic-bezier(0.16, 1, 0.3, 1);
        pointer-events: none;
        backdrop-filter: blur(10px);
        background: rgba(255, 255, 255, 0.95);
        border: 1px solid rgba(255, 255, 255, 0.2);
      }
      
      .gjs-block-preview-tooltip.show {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
      
      .gjs-block-preview-tooltip::before {
        content: '';
        position: absolute;
        top: -6px;
        left: 20px;
        width: 12px;
        height: 12px;
        background: white;
        border: 1px solid #e1e5e9;
        border-bottom: none;
        border-right: none;
        transform: rotate(45deg);
        z-index: -1;
      }
      
      .gjs-block-preview-tooltip.tooltip-bottom::before {
        top: auto;
        bottom: -6px;
        border-top: none;
        border-left: none;
        border-bottom: 1px solid #e1e5e9;
        border-right: 1px solid #e1e5e9;
        transform: rotate(45deg);
      }
      
      .gjs-block-preview-tooltip .block-preview-content {
        position: relative;
        z-index: 1;
      }
      
      .gjs-block-preview-tooltip .block-preview-content h3 {
        color: #2c3e50;
        margin: 0 0 8px 0;
        font-size: 16px;
        font-weight: 600;
      }
      
      .gjs-block-preview-tooltip .block-preview-content p {
        color: #6c757d;
        margin: 0;
        font-size: 14px;
        line-height: 1.5;
      }
      
      .gjs-blocks-c .gjs-block:hover {
        background-color: rgba(0, 123, 255, 0.08);
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        transition: all 0.2s ease;
      }
      
      .gjs-blocks-c .gjs-block {
        transition: all 0.2s ease;
        border-radius: 6px;
      }
    `;

    const styleElement = document.createElement('style');
    styleElement.id = 'grapesjs-block-preview-styles';
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
  }

  /**
   * 帶重試機制的預覽監聽器設置
   */
  private setupPreviewListenersWithRetry(retryCount = 0, maxRetries = 5): void {
    if (!this.editor?.BlockManager) {
      if (retryCount < maxRetries) {
        console.log(`⏱️ BlockManager 尚未準備就緒，${1000 * (retryCount + 1)}ms 後重試 (${retryCount + 1}/${maxRetries})`);
        setTimeout(() => {
          this.setupPreviewListenersWithRetry(retryCount + 1, maxRetries);
        }, 1000 * (retryCount + 1)); // 逐漸增加延遲
        return;
      } else {
        console.error('⚠️ BlockManager 在多次重試後仍未準備就緒');
        return;
      }
    }

    console.log('✅ BlockManager 準備就緒，設置預覽監聽器');
    this.setupPreviewListeners();
  }

  /**
   * 設置預覽監聽器
   */
  private setupPreviewListeners(): void {
    if (!this.editor?.BlockManager) {
      console.warn('⚠️ 編輯器或 BlockManager 尚未準備就緒');
      return;
    }
    
    const blockManager = this.editor.BlockManager;
    
    // 嘗試多個可能的元件容器選擇器
    const possibleSelectors = [
      '.gjs-blocks-c',
      '.gjs-block-categories',
      '.gjs-blocks',
      '[data-type="blocks"]'
    ];
    
    let blockContainer: Element | null = null;
    
    for (const selector of possibleSelectors) {
      blockContainer = document.querySelector(selector);
      if (blockContainer) {
        console.log(`✅ 找到元件容器: ${selector}`);
        break;
      } else {
        console.log(`❌ 未找到元件容器: ${selector}`);
      }
    }
    
    if (!blockContainer) {
      console.warn('⚠️ 找不到元件容器，嘗試在 2 秒後重試...');
      setTimeout(() => this.setupPreviewListeners(), 2000);
      return;
    }

    // 檢查容器中的元件
    const blocks = blockContainer.querySelectorAll('.gjs-block');
    console.log(`📦 找到 ${blocks.length} 個元件`);
    
    if (blocks.length === 0) {
      console.warn('⚠️ 元件容器中沒有找到任何元件，嘗試在 2 秒後重試...');
      setTimeout(() => this.setupPreviewListeners(), 2000);
      return;
    }

    // 使用事件委託處理懸停事件
    blockContainer.addEventListener('mouseover', (e) => {
      const blockElement = (e.target as Element).closest('.gjs-block');
      if (blockElement) {
        this.handleBlockHover(blockElement as HTMLElement, blockManager);
      }
    });

    blockContainer.addEventListener('mouseout', (e) => {
      const blockElement = (e.target as Element).closest('.gjs-block');
      if (blockElement) {
        this.handleBlockLeave(blockElement as HTMLElement);
      }
    });

    console.log('✅ 預覽監聽器設置完成');
  }

  /**
   * 處理元件懸停事件
   */
  private handleBlockHover(blockElement: HTMLElement, blockManager: any): void {
    // 清除之前的計時器
    if (this.hoverTimer) {
      clearTimeout(this.hoverTimer);
    }

    // 延遲顯示預覽
    this.hoverTimer = window.setTimeout(() => {
      const blockId = blockElement.getAttribute('title') || blockElement.textContent?.trim();
      console.log(`🔍 懸停在元件上: ${blockId}`);
      
      if (!blockId) {
        console.warn('⚠️ 無法獲取元件ID');
        return;
      }

      // 確保 blockManager 存在
      if (!blockManager) {
        console.warn('⚠️ BlockManager 不存在');
        return;
      }

      // 從 BlockManager 獲取元件資料
      const block = blockManager.get(blockId) || this.findBlockByLabel(blockManager, blockId);
      if (!block) {
        console.log(`❌ 找不到元件: ${blockId}`);
        // 列出所有可用的元件來調試
        const allBlocks = blockManager.getAll();
        console.log('📋 可用元件列表:', allBlocks.models ? 
          allBlocks.models.map((b: any) => ({ id: b.get('id'), label: b.get('label') })) :
          allBlocks.map((b: any) => ({ id: b.id, label: b.label }))
        );
        return;
      }

      console.log(`✅ 找到元件，準備顯示預覽: ${blockId}`);
      this.showPreview(blockElement, block);
    }, this.config.delay);
  }

  /**
   * 根據標籤查找元件
   */
  private findBlockByLabel(blockManager: any, label: string): any {
    if (!blockManager) {
      return null;
    }
    
    try {
      const allBlocks = blockManager.getAll().models || blockManager.getAll();
      if (!allBlocks || !Array.isArray(allBlocks)) {
        return null;
      }
      
      return allBlocks.find((block: any) => {
        const blockData = block.attributes || block;
        return blockData.label === label || blockData.id === label;
      });
    } catch (error) {
      console.warn('⚠️ 查找元件時發生錯誤:', error);
      return null;
    }
  }

  /**
   * 處理元件離開事件
   */
  private handleBlockLeave(blockElement: HTMLElement): void {
    // 清除延遲顯示的計時器
    if (this.hoverTimer) {
      clearTimeout(this.hoverTimer);
      this.hoverTimer = null;
    }

    // 隱藏預覽
    if (this.previewElement) {
      this.previewElement.classList.remove('show');
      setTimeout(() => {
        if (this.previewElement && !this.previewElement.classList.contains('show')) {
          this.previewElement.remove();
          this.previewElement = null;
        }
      }, this.config.duration);
    }
  }

  /**
   * 顯示預覽tooltip
   */
  private showPreview(blockElement: HTMLElement, block: any): void {
    // 生成預覽內容
    const previewContent = this.generator.generatePreviewContent(block);
    
    // 創建tooltip元素
    if (this.previewElement) {
      this.previewElement.remove();
    }

    this.previewElement = document.createElement('div');
    this.previewElement.className = 'gjs-block-preview-tooltip';
    this.previewElement.innerHTML = previewContent;

    document.body.appendChild(this.previewElement);

    // 計算最佳位置
    const position = this.calculateOptimalPosition(blockElement);
    
    // 設置位置
    this.previewElement.style.left = `${position.x}px`;
    this.previewElement.style.top = `${position.y}px`;

    // 動畫顯示
    requestAnimationFrame(() => {
      if (this.previewElement) {
        this.previewElement.classList.add('show');
      }
    });
  }

  /**
   * 計算最佳顯示位置
   */
  private calculateOptimalPosition(element: HTMLElement): { x: number; y: number } {
    const rect = element.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    // 預設位置：元素右側
    let x = rect.right + scrollX + this.config.offsetX;
    let y = rect.top + scrollY + this.config.offsetY;

    // 假設預覽框的大小（用於邊界檢查）
    const previewWidth = this.config.maxWidth;
    const previewHeight = this.config.maxHeight;

    // 水平位置調整
    if (x + previewWidth > viewportWidth + scrollX) {
      // 如果右側放不下，嘗試放在左側
      x = rect.left + scrollX - previewWidth - this.config.offsetX;
      
      // 如果左側也放不下，就放在視窗內
      if (x < scrollX) {
        x = viewportWidth + scrollX - previewWidth - 20;
      }
    }

    // 垂直位置調整
    if (y + previewHeight > viewportHeight + scrollY) {
      // 如果下方放不下，向上調整
      y = rect.bottom + scrollY - previewHeight - this.config.offsetY;
      
      if (this.previewElement) {
        this.previewElement.classList.add('tooltip-bottom');
      }
    }

    // 確保不超出視窗邊界
    if (x < scrollX) {
      x = scrollX + this.config.offsetX;
    }

    return { x, y };
  }

  /**
   * 銷毀預覽功能
   */
  destroy(): void {
    if (this.hoverTimer) {
      clearTimeout(this.hoverTimer);
    }

    if (this.previewElement) {
      this.previewElement.remove();
      this.previewElement = null;
    }

    // 移除樣式
    const styleElement = document.getElementById('grapesjs-block-preview-styles');
    if (styleElement) {
      styleElement.remove();
    }

    console.log('🗑️ 元件庫預覽功能已清理');
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig: Partial<BlockPreviewConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.generator = new BlockPreviewGenerator(this.config);
    
    // 如果禁用了預覽功能，則銷毀
    if (!this.config.enabled) {
      this.destroy();
    }
  }
}

export default BlockPreviewEnhancer;
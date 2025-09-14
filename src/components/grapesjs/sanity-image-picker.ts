/**
 * 自定義 GrapesJS 圖片選擇器
 * 整合 Sanity 媒體庫功能
 */

import { getSanityImages, uploadImageToSanity, buildSanityImageUrl, type SanityImage } from '@/lib/services/sanity-media-service'

export interface ImagePickerOptions {
  onSelect: (imageUrl: string) => void
  onClose: () => void
  allowUpload?: boolean
}

export class SanityImagePicker {
  private modal: HTMLElement | null = null
  private images: SanityImage[] = []
  private options: ImagePickerOptions

  constructor(options: ImagePickerOptions) {
    this.options = options
  }

  async show() {
    await this.loadImages()
    this.createModal()
    this.attachEvents()
  }

  private async loadImages() {
    this.images = await getSanityImages()
  }

  private createModal() {
    // 移除現有的模態框
    const existingModal = document.querySelector('.sanity-image-picker-modal')
    if (existingModal) {
      existingModal.remove()
    }

    this.modal = document.createElement('div')
    this.modal.className = 'sanity-image-picker-modal'
    this.modal.innerHTML = `
      <div class="sanity-image-picker-overlay">
        <div class="sanity-image-picker-content">
          <div class="sanity-image-picker-header">
            <h3>選擇圖片</h3>
            <button class="sanity-image-picker-close" aria-label="關閉">&times;</button>
          </div>
          
          ${this.options.allowUpload !== false ? `
            <div class="sanity-image-picker-upload">
              <input type="file" id="sanity-image-upload" accept="image/*" style="display: none;">
              <button class="sanity-upload-btn" onclick="document.getElementById('sanity-image-upload').click()">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7,10 12,15 17,10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                上傳新圖片
              </button>
              <div class="upload-progress" style="display: none;">
                <div class="upload-progress-bar"></div>
              </div>
            </div>
          ` : ''}
          
          <div class="sanity-image-picker-grid">
            ${this.renderImageGrid()}
          </div>
          
          ${this.images.length === 0 ? `
            <div class="sanity-image-picker-empty">
              <p>沒有找到圖片</p>
              <p class="text-small">請先在 Sanity Studio 中上傳一些圖片</p>
            </div>
          ` : ''}
        </div>
      </div>
    `

    // 添加樣式
    this.addStyles()
    
    document.body.appendChild(this.modal)
    
    // 淡入動畫
    setTimeout(() => {
      this.modal?.classList.add('show')
    }, 10)
  }

  private renderImageGrid(): string {
    if (this.images.length === 0) return ''
    
    return this.images.map(image => {
      const thumbnailUrl = buildSanityImageUrl(image, 300, 200, 80)
      const fullUrl = buildSanityImageUrl(image, 1200, 800, 90)
      
      return `
        <div class="sanity-image-item" data-url="${fullUrl}">
          <img src="${thumbnailUrl}" alt="${image.originalFilename || 'Image'}" loading="lazy">
          <div class="sanity-image-overlay">
            <div class="sanity-image-info">
              <p class="sanity-image-name">${image.originalFilename || 'Untitled'}</p>
              <p class="sanity-image-size">${image.metadata.dimensions.width}×${image.metadata.dimensions.height}</p>
            </div>
            <button class="sanity-select-btn">選擇</button>
          </div>
        </div>
      `
    }).join('')
  }

  private attachEvents() {
    if (!this.modal) return

    // 關閉按鈕
    const closeBtn = this.modal.querySelector('.sanity-image-picker-close')
    closeBtn?.addEventListener('click', () => this.close())

    // 點擊覆蓋層關閉
    const overlay = this.modal.querySelector('.sanity-image-picker-overlay')
    overlay?.addEventListener('click', (e) => {
      if (e.target === overlay) this.close()
    })

    // ESC 鍵關閉
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.close()
        document.removeEventListener('keydown', handleKeydown)
      }
    }
    document.addEventListener('keydown', handleKeydown)

    // 圖片選擇
    const imageItems = this.modal.querySelectorAll('.sanity-image-item')
    imageItems.forEach(item => {
      item.addEventListener('click', () => {
        const url = item.getAttribute('data-url')
        if (url) {
          this.options.onSelect(url)
          this.close()
        }
      })
    })

    // 上傳功能
    if (this.options.allowUpload !== false) {
      const uploadInput = this.modal.querySelector('#sanity-image-upload') as HTMLInputElement
      uploadInput?.addEventListener('change', (e) => this.handleFileUpload(e))
    }
  }

  private async handleFileUpload(e: Event) {
    const input = e.target as HTMLInputElement
    const file = input.files?.[0]
    if (!file) return

    const progressEl = this.modal?.querySelector('.upload-progress') as HTMLElement
    const progressBarEl = this.modal?.querySelector('.upload-progress-bar') as HTMLElement
    
    if (progressEl) progressEl.style.display = 'block'

    try {
      // 模擬進度（實際上 Sanity 上傳沒有進度回調）
      let progress = 0
      const progressInterval = setInterval(() => {
        progress += Math.random() * 30
        if (progress > 90) progress = 90
        if (progressBarEl) progressBarEl.style.width = progress + '%'
      }, 200)

      const uploadedImage = await uploadImageToSanity(file)
      
      clearInterval(progressInterval)
      if (progressBarEl) progressBarEl.style.width = '100%'

      if (uploadedImage) {
        // 選擇剛上傳的圖片
        const imageUrl = buildSanityImageUrl(uploadedImage, 1200, 800, 90)
        setTimeout(() => {
          this.options.onSelect(imageUrl)
          this.close()
        }, 500)
      } else {
        alert('上傳失敗，請重試')
        if (progressEl) progressEl.style.display = 'none'
      }
    } catch (error) {
      console.error('上傳錯誤:', error)
      alert('上傳失敗，請重試')
      if (progressEl) progressEl.style.display = 'none'
    }

    // 清除選擇
    input.value = ''
  }

  private addStyles() {
    if (document.querySelector('#sanity-image-picker-styles')) return

    const style = document.createElement('style')
    style.id = 'sanity-image-picker-styles'
    style.textContent = `
      .sanity-image-picker-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 10000;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.3s ease, visibility 0.3s ease;
      }
      
      .sanity-image-picker-modal.show {
        opacity: 1;
        visibility: visible;
      }
      
      .sanity-image-picker-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.75);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
      }
      
      .sanity-image-picker-content {
        background: white;
        border-radius: 12px;
        max-width: 90vw;
        max-height: 90vh;
        width: 800px;
        display: flex;
        flex-direction: column;
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
        transform: scale(0.95);
        transition: transform 0.3s ease;
      }
      
      .sanity-image-picker-modal.show .sanity-image-picker-content {
        transform: scale(1);
      }
      
      .sanity-image-picker-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 24px;
        border-bottom: 1px solid #e5e7eb;
      }
      
      .sanity-image-picker-header h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #1f2937;
      }
      
      .sanity-image-picker-close {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #6b7280;
        padding: 4px;
        line-height: 1;
        transition: color 0.2s ease;
      }
      
      .sanity-image-picker-close:hover {
        color: #374151;
      }
      
      .sanity-image-picker-upload {
        padding: 16px 24px;
        border-bottom: 1px solid #f3f4f6;
      }
      
      .sanity-upload-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        background: #3b82f6;
        color: white;
        border: none;
        padding: 10px 16px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: background-color 0.2s ease;
      }
      
      .sanity-upload-btn:hover {
        background: #2563eb;
      }
      
      .upload-progress {
        margin-top: 12px;
        background: #f3f4f6;
        border-radius: 6px;
        height: 6px;
        overflow: hidden;
      }
      
      .upload-progress-bar {
        height: 100%;
        background: #3b82f6;
        width: 0%;
        transition: width 0.3s ease;
      }
      
      .sanity-image-picker-grid {
        padding: 20px 24px;
        max-height: 500px;
        overflow-y: auto;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 16px;
      }
      
      .sanity-image-item {
        position: relative;
        border-radius: 8px;
        overflow: hidden;
        cursor: pointer;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        background: #f9fafb;
      }
      
      .sanity-image-item:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
      }
      
      .sanity-image-item img {
        width: 100%;
        height: 120px;
        object-fit: cover;
        display: block;
      }
      
      .sanity-image-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.8) 100%);
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        padding: 12px;
        opacity: 0;
        transition: opacity 0.2s ease;
      }
      
      .sanity-image-item:hover .sanity-image-overlay {
        opacity: 1;
      }
      
      .sanity-image-info {
        color: white;
        margin-bottom: 8px;
      }
      
      .sanity-image-name {
        font-size: 12px;
        font-weight: 500;
        margin: 0 0 2px 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .sanity-image-size {
        font-size: 11px;
        color: rgba(255, 255, 255, 0.8);
        margin: 0;
      }
      
      .sanity-select-btn {
        background: #10b981;
        color: white;
        border: none;
        padding: 6px 12px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.2s ease;
      }
      
      .sanity-select-btn:hover {
        background: #059669;
      }
      
      .sanity-image-picker-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 60px 20px;
        color: #6b7280;
        text-align: center;
      }
      
      .sanity-image-picker-empty p {
        margin: 0 0 8px 0;
      }
      
      .sanity-image-picker-empty .text-small {
        font-size: 14px;
        color: #9ca3af;
      }
      
      /* 響應式設計 */
      @media (max-width: 640px) {
        .sanity-image-picker-content {
          width: 95vw;
          max-height: 85vh;
        }
        
        .sanity-image-picker-grid {
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 12px;
          padding: 16px;
        }
        
        .sanity-image-picker-header {
          padding: 16px 20px;
        }
        
        .sanity-image-picker-upload {
          padding: 12px 20px;
        }
      }
    `
    
    document.head.appendChild(style)
  }

  private close() {
    if (this.modal) {
      this.modal.classList.remove('show')
      setTimeout(() => {
        this.modal?.remove()
        this.options.onClose()
      }, 300)
    }
  }
}

/**
 * 顯示 Sanity 圖片選擇器
 */
export function showSanityImagePicker(options: ImagePickerOptions): SanityImagePicker {
  const picker = new SanityImagePicker(options)
  picker.show()
  return picker
}
/**
 * 靜態輪播組件 - 適用於 GrapesJS 和靜態 HTML 渲染
 * 使用純 CSS 動畫和客戶端 JavaScript 增強
 */

export const StaticCarouselComponent = (editor: any) => {
  editor.DomComponents.addType('static-carousel', {
    model: {
      defaults: {
        tagName: 'div',
        classes: ['static-carousel'],
        attributes: {
          'data-carousel': 'static'
        },
        style: {
          position: 'relative',
          width: '100%',
          height: '500px',
          overflow: 'hidden',
          borderRadius: '12px'
        },
        components: [
          // CSS 樣式定義（內聯樣式）
          {
            tagName: 'style',
            content: `
              .static-carousel {
                --carousel-slide-duration: 0.8s;
                --carousel-autoplay-interval: 4s;
              }
              
              .carousel-slides-container {
                position: relative;
                width: 100%;
                height: 100%;
              }
              
              .static-carousel-slide {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                opacity: 0;
                transition: opacity var(--carousel-slide-duration) ease-in-out;
              }
              
              .static-carousel-slide.active {
                opacity: 1;
                z-index: 2;
              }
              
              .static-carousel-slide img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                object-position: center;
              }
              
              .slide-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.4) 100%);
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                text-align: center;
                padding: 2rem;
                color: white;
                z-index: 3;
              }
              
              .slide-title {
                font-size: clamp(1.5rem, 4vw, 3rem);
                font-weight: 700;
                margin-bottom: 1rem;
                text-shadow: 0 2px 4px rgba(0,0,0,0.5);
                line-height: 1.2;
              }
              
              .slide-description {
                font-size: clamp(1rem, 2vw, 1.25rem);
                margin-bottom: 2rem;
                text-shadow: 0 1px 2px rgba(0,0,0,0.5);
                max-width: 600px;
                line-height: 1.4;
              }
              
              .slide-button {
                display: inline-block;
                background: rgba(255, 255, 255, 0.9);
                color: #333;
                padding: 12px 24px;
                border-radius: 8px;
                text-decoration: none;
                font-weight: 600;
                transition: all 0.3s ease;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
              }
              
              .slide-button:hover {
                background: white;
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(0,0,0,0.3);
              }
              
              .carousel-nav {
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                background: rgba(255, 255, 255, 0.9);
                border: none;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                cursor: pointer;
                font-size: 24px;
                font-weight: bold;
                color: #374151;
                box-shadow: 0 2px 10px rgba(0,0,0,0.15);
                transition: all 0.3s ease;
                z-index: 5;
                user-select: none;
              }
              
              .carousel-nav:hover {
                background: white;
                transform: translateY(-50%) scale(1.1);
                box-shadow: 0 4px 15px rgba(0,0,0,0.25);
              }
              
              .carousel-nav.prev {
                left: 20px;
              }
              
              .carousel-nav.next {
                right: 20px;
              }
              
              .carousel-indicators {
                position: absolute;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                display: flex;
                gap: 8px;
                z-index: 5;
              }
              
              .carousel-indicator {
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.6);
                border: none;
                cursor: pointer;
                transition: all 0.3s ease;
              }
              
              .carousel-indicator.active {
                background: white;
                transform: scale(1.2);
              }
              
              /* 自動播放動畫 */
              @keyframes carousel-autoplay {
                0%, 25% { opacity: 1; }
                33%, 91.67% { opacity: 0; }
                100% { opacity: 1; }
              }
              
              .static-carousel.autoplay .static-carousel-slide:nth-child(1) {
                animation: carousel-autoplay calc(var(--carousel-autoplay-interval) * 3) infinite;
                animation-delay: 0s;
              }
              
              .static-carousel.autoplay .static-carousel-slide:nth-child(2) {
                animation: carousel-autoplay calc(var(--carousel-autoplay-interval) * 3) infinite;
                animation-delay: var(--carousel-autoplay-interval);
              }
              
              .static-carousel.autoplay .static-carousel-slide:nth-child(3) {
                animation: carousel-autoplay calc(var(--carousel-autoplay-interval) * 3) infinite;
                animation-delay: calc(var(--carousel-autoplay-interval) * 2);
              }
            `
          },
          
          // 輪播容器
          {
            tagName: 'div',
            classes: ['carousel-slides-container'],
            components: [
              // 第一張幻燈片
              {
                tagName: 'div',
                classes: ['static-carousel-slide', 'active'],
                attributes: { 'data-slide': '0' },
                components: [
                  {
                    type: 'image',
                    attributes: {
                      src: 'https://picsum.photos/1200/500?random=1',
                      alt: '主橫幅圖片 1',
                      draggable: 'false'
                    },
                    selectable: true,
                    editable: true
                  },
                  {
                    tagName: 'div',
                    classes: ['slide-overlay'],
                    components: [
                      {
                        tagName: 'h2',
                        classes: ['slide-title'],
                        content: '歡迎來到我們的網站',
                        editable: true
                      },
                      {
                        tagName: 'p',
                        classes: ['slide-description'],
                        content: '體驗最優質的服務和產品',
                        editable: true
                      },
                      {
                        tagName: 'a',
                        classes: ['slide-button'],
                        content: '了解更多',
                        attributes: { 
                          href: '#', 
                          role: 'button' 
                        },
                        editable: true
                      }
                    ]
                  }
                ]
              },
              
              // 第二張幻燈片
              {
                tagName: 'div',
                classes: ['static-carousel-slide'],
                attributes: { 'data-slide': '1' },
                components: [
                  {
                    type: 'image',
                    attributes: {
                      src: 'https://picsum.photos/1200/500?random=2',
                      alt: '主橫幅圖片 2',
                      draggable: 'false'
                    },
                    selectable: true,
                    editable: true
                  },
                  {
                    tagName: 'div',
                    classes: ['slide-overlay'],
                    components: [
                      {
                        tagName: 'h2',
                        classes: ['slide-title'],
                        content: '創新服務體驗',
                        editable: true
                      },
                      {
                        tagName: 'p',
                        classes: ['slide-description'],
                        content: '提供最優質的產品和解決方案',
                        editable: true
                      },
                      {
                        tagName: 'a',
                        classes: ['slide-button'],
                        content: '立即體驗',
                        attributes: { 
                          href: '#', 
                          role: 'button' 
                        },
                        editable: true
                      }
                    ]
                  }
                ]
              },
              
              // 第三張幻燈片
              {
                tagName: 'div',
                classes: ['static-carousel-slide'],
                attributes: { 'data-slide': '2' },
                components: [
                  {
                    type: 'image',
                    attributes: {
                      src: 'https://picsum.photos/1200/500?random=3',
                      alt: '主橫幅圖片 3',
                      draggable: 'false'
                    },
                    selectable: true,
                    editable: true
                  },
                  {
                    tagName: 'div',
                    classes: ['slide-overlay'],
                    components: [
                      {
                        tagName: 'h2',
                        classes: ['slide-title'],
                        content: '專業團隊支援',
                        editable: true
                      },
                      {
                        tagName: 'p',
                        classes: ['slide-description'],
                        content: '24小時全天候專業服務',
                        editable: true
                      },
                      {
                        tagName: 'a',
                        classes: ['slide-button'],
                        content: '聯絡我們',
                        attributes: { 
                          href: '#', 
                          role: 'button' 
                        },
                        editable: true
                      }
                    ]
                  }
                ]
              }
            ]
          },
          
          // 導航按鈕
          {
            tagName: 'button',
            classes: ['carousel-nav', 'prev'],
            content: '‹',
            attributes: { 
              type: 'button',
              'aria-label': '上一張',
              'onclick': 'prevSlide(this)'
            }
          },
          {
            tagName: 'button',
            classes: ['carousel-nav', 'next'],
            content: '›',
            attributes: { 
              type: 'button',
              'aria-label': '下一張',
              'onclick': 'nextSlide(this)'
            }
          },
          
          // 指示器
          {
            tagName: 'div',
            classes: ['carousel-indicators'],
            components: [
              {
                tagName: 'button',
                classes: ['carousel-indicator', 'active'],
                attributes: { 
                  type: 'button',
                  'data-slide-to': '0',
                  'onclick': 'goToSlide(this, 0)'
                }
              },
              {
                tagName: 'button',
                classes: ['carousel-indicator'],
                attributes: { 
                  type: 'button',
                  'data-slide-to': '1',
                  'onclick': 'goToSlide(this, 1)'
                }
              },
              {
                tagName: 'button',
                classes: ['carousel-indicator'],
                attributes: { 
                  type: 'button',
                  'data-slide-to': '2',
                  'onclick': 'goToSlide(this, 2)'
                }
              }
            ]
          },
          
          // JavaScript 功能（內聯）
          {
            tagName: 'script',
            content: `
              // 輪播功能初始化
              if (typeof window !== 'undefined' && !window.carouselInitialized) {
                window.carouselInitialized = true;
                
                window.currentSlide = 0;
                window.totalSlides = 3;
                window.autoplayInterval = null;
                
                // 顯示指定幻燈片
                window.showSlide = function(slideIndex) {
                  const carousel = document.querySelector('.static-carousel');
                  if (!carousel) return;
                  
                  const slides = carousel.querySelectorAll('.static-carousel-slide');
                  const indicators = carousel.querySelectorAll('.carousel-indicator');
                  
                  // 更新幻燈片
                  slides.forEach((slide, index) => {
                    if (index === slideIndex) {
                      slide.classList.add('active');
                    } else {
                      slide.classList.remove('active');
                    }
                  });
                  
                  // 更新指示器
                  indicators.forEach((indicator, index) => {
                    if (index === slideIndex) {
                      indicator.classList.add('active');
                    } else {
                      indicator.classList.remove('active');
                    }
                  });
                  
                  window.currentSlide = slideIndex;
                };
                
                // 下一張
                window.nextSlide = function(element) {
                  const nextIndex = (window.currentSlide + 1) % window.totalSlides;
                  window.showSlide(nextIndex);
                  window.stopAutoplay();
                  window.startAutoplay();
                };
                
                // 上一張
                window.prevSlide = function(element) {
                  const prevIndex = (window.currentSlide - 1 + window.totalSlides) % window.totalSlides;
                  window.showSlide(prevIndex);
                  window.stopAutoplay();
                  window.startAutoplay();
                };
                
                // 跳轉到指定幻燈片
                window.goToSlide = function(element, slideIndex) {
                  window.showSlide(slideIndex);
                  window.stopAutoplay();
                  window.startAutoplay();
                };
                
                // 開始自動播放
                window.startAutoplay = function() {
                  window.stopAutoplay();
                  window.autoplayInterval = setInterval(() => {
                    window.nextSlide();
                  }, 4000);
                };
                
                // 停止自動播放
                window.stopAutoplay = function() {
                  if (window.autoplayInterval) {
                    clearInterval(window.autoplayInterval);
                    window.autoplayInterval = null;
                  }
                };
                
                // 初始化輪播
                document.addEventListener('DOMContentLoaded', () => {
                  setTimeout(() => {
                    window.showSlide(0);
                    window.startAutoplay();
                    
                    // 鼠標懸停控制
                    const carousel = document.querySelector('.static-carousel');
                    if (carousel) {
                      carousel.addEventListener('mouseenter', window.stopAutoplay);
                      carousel.addEventListener('mouseleave', window.startAutoplay);
                    }
                  }, 100);
                });
                
                // 如果頁面已經載入完成
                if (document.readyState === 'complete') {
                  setTimeout(() => {
                    window.showSlide(0);
                    window.startAutoplay();
                    
                    const carousel = document.querySelector('.static-carousel');
                    if (carousel) {
                      carousel.addEventListener('mouseenter', window.stopAutoplay);
                      carousel.addEventListener('mouseleave', window.startAutoplay);
                    }
                  }, 100);
                }
              }
            `
          }
        ]
      }
    }
  });

  // 添加到區塊管理器
  editor.BlockManager.add('static-carousel', {
    label: '靜態輪播圖',
    category: '自訂組件',
    media: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="4" width="20" height="12" rx="2" stroke="currentColor" stroke-width="2"/>
      <circle cx="7" cy="7" r="1" fill="currentColor"/>
      <circle cx="12" cy="7" r="1" fill="currentColor"/>
      <circle cx="17" cy="7" r="1" fill="currentColor"/>
      <path d="m9 12 2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    content: { type: 'static-carousel' }
  });
};

export default StaticCarouselComponent;
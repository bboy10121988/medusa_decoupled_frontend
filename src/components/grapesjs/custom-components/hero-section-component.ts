/**
 * Hero Section 組件 - GrapesJS 版本
 * 基於現有的 Hero 組件，轉換為 GrapesJS 可用格式
 */

export const HeroSectionComponent = (editor: any) => {
  editor.DomComponents.addType('hero-section', {
    model: {
      defaults: {
        tagName: 'section',
        classes: ['hero-section'],
        attributes: {
          'data-component': 'hero-section'
        },
        style: {
          position: 'relative',
          width: '100%'
        },
        // 可編輯的屬性
        traits: [
          {
            type: 'checkbox',
            name: 'autoplay',
            label: '自動播放',
            changeProp: 1
          },
          {
            type: 'number',
            name: 'autoplaySpeed',
            label: '自動播放速度 (秒)',
            changeProp: 1
          },
          {
            type: 'checkbox',
            name: 'showArrows',
            label: '顯示箭頭',
            changeProp: 1
          },
          {
            type: 'checkbox',
            name: 'showDots',
            label: '顯示指示點',
            changeProp: 1
          }
        ],
        // 預設屬性值
        autoplay: true,
        autoplaySpeed: 3,
        showArrows: true,
        showDots: true,
        
        components: [
          // 內聯樣式
          {
            tagName: 'style',
            content: `
              .hero-section {
                position: relative;
                width: 100%;
              }
              
              .hero-carousel-container {
                position: relative;
                width: 100%;
                aspect-ratio: 16/11;
                overflow: hidden;
              }
              
              @media (min-width: 640px) {
                .hero-carousel-container {
                  aspect-ratio: 16/10;
                }
              }
              
              @media (min-width: 768px) {
                .hero-carousel-container {
                  aspect-ratio: 16/9;
                }
              }
              
              @media (min-width: 1024px) {
                .hero-carousel-container {
                  aspect-ratio: 21/9;
                }
              }
              
              .hero-slide {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                opacity: 0;
                transition: opacity 1s ease-in-out;
              }
              
              .hero-slide.active {
                opacity: 1;
                z-index: 2;
              }
              
              .hero-slide img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                object-position: center;
                cursor: pointer;
              }
              
              .hero-content-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10;
                display: flex;
                flex-direction: column;
                justify-content: end;
                align-items: center;
                text-align: center;
                padding: 1rem;
                padding-bottom: 4rem;
                gap: 0.75rem;
                background: linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.6) 100%);
              }
              
              @media (min-width: 640px) {
                .hero-content-overlay {
                  justify-content: center;
                  padding: 4rem;
                  gap: 1.5rem;
                }
              }
              
              @media (min-width: 768px) {
                .hero-content-overlay {
                  padding: 4rem;
                }
              }
              
              @media (min-width: 1024px) {
                .hero-content-overlay {
                  padding: 8rem;
                }
              }
              
              .hero-content {
                max-width: 90%;
                animation: fadeInContent 0.8s ease-out;
              }
              
              @media (min-width: 640px) {
                .hero-content {
                  max-width: 64rem;
                }
              }
              
              @keyframes fadeInContent {
                from {
                  opacity: 0;
                  transform: translateY(20px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
              
              .hero-title {
                color: white;
                font-weight: 600;
                font-size: 1.5rem;
                line-height: 1.2;
                letter-spacing: -0.025em;
                margin-bottom: 0.5rem;
                text-shadow: 0 2px 4px rgba(0,0,0,0.3);
              }
              
              @media (min-width: 640px) {
                .hero-title {
                  font-size: 1.875rem;
                  margin-bottom: 1.5rem;
                }
              }
              
              @media (min-width: 768px) {
                .hero-title {
                  font-size: 3rem;
                }
              }
              
              @media (min-width: 1024px) {
                .hero-title {
                  font-size: 3.75rem;
                }
              }
              
              .hero-button {
                display: inline-block;
                background: white;
                color: #1f2937;
                padding: 0.5rem 1rem;
                font-size: 0.875rem;
                font-weight: 500;
                border-radius: 0.5rem;
                text-decoration: none;
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
                transition: all 0.3s ease;
                letter-spacing: 0.025em;
              }
              
              @media (min-width: 640px) {
                .hero-button {
                  padding: 0.75rem 2rem;
                  font-size: 1rem;
                }
              }
              
              @media (min-width: 768px) {
                .hero-button {
                  font-size: 1.125rem;
                }
              }
              
              .hero-button:hover {
                background: rgba(255, 255, 255, 0.9);
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                transform: scale(1.02);
              }
              
              .hero-nav {
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
                z-index: 20;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              
              .hero-nav:hover {
                background: white;
                transform: translateY(-50%) scale(1.1);
                box-shadow: 0 4px 15px rgba(0,0,0,0.25);
              }
              
              .hero-nav.prev {
                left: 20px;
              }
              
              .hero-nav.next {
                right: 20px;
              }
              
              .hero-dots {
                position: absolute;
                bottom: 1rem;
                left: 50%;
                transform: translateX(-50%);
                display: flex;
                gap: 0.5rem;
                z-index: 20;
              }
              
              @media (min-width: 640px) {
                .hero-dots {
                  bottom: 1.5rem;
                  gap: 0.75rem;
                }
              }
              
              .hero-dot {
                width: 0.5rem;
                height: 0.5rem;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.6);
                border: none;
                cursor: pointer;
                transition: all 0.3s ease;
              }
              
              @media (min-width: 640px) {
                .hero-dot {
                  width: 0.75rem;
                  height: 0.75rem;
                }
              }
              
              .hero-dot.active {
                background: white;
                transform: scale(1.1);
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
              }
            `
          },
          
          // Hero 容器
          {
            tagName: 'div',
            classes: ['hero-carousel-container'],
            components: [
              // 第一張幻燈片
              {
                tagName: 'div',
                classes: ['hero-slide', 'active'],
                attributes: { 'data-slide': '0' },
                components: [
                  // 使用基本的 image 組件，讓它可以被單獨選擇和編輯
                  {
                    type: 'image',
                    attributes: {
                      src: 'https://picsum.photos/1200/600?random=1',
                      alt: 'Hero 圖片 1',
                      draggable: 'false'
                    },
                    // 重要：讓圖片組件可被選擇和編輯
                    selectable: true,
                    editable: true,
                    // 添加一些樣式讓圖片適合容器
                    style: {
                      width: '100%',
                      height: '100%',
                      'object-fit': 'cover',
                      'object-position': 'center',
                      cursor: 'pointer'
                    }
                  }
                ]
              },
              
              // 第二張幻燈片
              {
                tagName: 'div',
                classes: ['hero-slide'],
                attributes: { 'data-slide': '1' },
                components: [
                  {
                    type: 'image',
                    attributes: {
                      src: 'https://picsum.photos/1200/600?random=2',
                      alt: 'Hero 圖片 2',
                      draggable: 'false'
                    },
                    selectable: true,
                    editable: true,
                    style: {
                      width: '100%',
                      height: '100%',
                      'object-fit': 'cover',
                      'object-position': 'center',
                      cursor: 'pointer'
                    }
                  }
                ]
              },
              
              // 第三張幻燈片
              {
                tagName: 'div',
                classes: ['hero-slide'],
                attributes: { 'data-slide': '2' },
                components: [
                  {
                    type: 'image',
                    attributes: {
                      src: 'https://picsum.photos/1200/600?random=3',
                      alt: 'Hero 圖片 3',
                      draggable: 'false'
                    },
                    selectable: true,
                    editable: true,
                    style: {
                      width: '100%',
                      height: '100%',
                      'object-fit': 'cover',
                      'object-position': 'center',
                      cursor: 'pointer'
                    }
                  }
                ]
              }
            ]
          },
          
          // 內容覆蓋層
          {
            tagName: 'div',
            classes: ['hero-content-overlay'],
            components: [
              {
                tagName: 'div',
                classes: ['hero-content'],
                attributes: { 'data-slide-content': '0' },
                components: [
                  {
                    tagName: 'h1',
                    classes: ['hero-title'],
                    content: '歡迎來到我們的世界',
                    editable: true
                  },
                  {
                    tagName: 'a',
                    classes: ['hero-button'],
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
          
          // 導航按鈕 (只在 showArrows 為 true 時顯示)
          {
            tagName: 'button',
            classes: ['hero-nav', 'prev'],
            content: '‹',
            attributes: { 
              type: 'button',
              'aria-label': '上一張',
              'onclick': 'heroController.prevSlide(this)'
            }
          },
          {
            tagName: 'button',
            classes: ['hero-nav', 'next'],
            content: '›',
            attributes: { 
              type: 'button',
              'aria-label': '下一張',
              'onclick': 'heroController.nextSlide(this)'
            }
          },
          
          // 指示點 (只在 showDots 為 true 時顯示)
          {
            tagName: 'div',
            classes: ['hero-dots'],
            components: [
              {
                tagName: 'button',
                classes: ['hero-dot', 'active'],
                attributes: { 
                  type: 'button',
                  'data-slide-to': '0',
                  'onclick': 'heroController.goToSlide(this, 0)'
                }
              },
              {
                tagName: 'button',
                classes: ['hero-dot'],
                attributes: { 
                  type: 'button',
                  'data-slide-to': '1',
                  'onclick': 'heroController.goToSlide(this, 1)'
                }
              },
              {
                tagName: 'button',
                classes: ['hero-dot'],
                attributes: { 
                  type: 'button',
                  'data-slide-to': '2',
                  'onclick': 'heroController.goToSlide(this, 2)'
                }
              }
            ]
          },
          
          // JavaScript 控制器
          {
            tagName: 'script',
            content: `
              // Hero Section 控制器
              if (typeof window !== 'undefined' && !window.heroController) {
                window.heroController = {
                  currentSlide: 0,
                  totalSlides: 3,
                  autoplayInterval: null,
                  
                  // 顯示指定幻燈片
                  showSlide: function(slideIndex, heroSection) {
                    if (!heroSection) {
                      heroSection = document.querySelector('.hero-section');
                    }
                    if (!heroSection) return;
                    
                    const slides = heroSection.querySelectorAll('.hero-slide');
                    const dots = heroSection.querySelectorAll('.hero-dot');
                    const contents = heroSection.querySelectorAll('[data-slide-content]');
                    
                    // 更新幻燈片
                    slides.forEach((slide, index) => {
                      if (index === slideIndex) {
                        slide.classList.add('active');
                      } else {
                        slide.classList.remove('active');
                      }
                    });
                    
                    // 更新指示點
                    dots.forEach((dot, index) => {
                      if (index === slideIndex) {
                        dot.classList.add('active');
                      } else {
                        dot.classList.remove('active');
                      }
                    });
                    
                    // 更新內容 (如果有多個內容區域)
                    contents.forEach((content, index) => {
                      if (index === slideIndex) {
                        content.style.display = 'block';
                      } else if (contents.length > 1) {
                        content.style.display = 'none';
                      }
                    });
                    
                    this.currentSlide = slideIndex;
                  },
                  
                  // 下一張
                  nextSlide: function(element) {
                    const heroSection = element.closest('.hero-section');
                    const nextIndex = (this.currentSlide + 1) % this.totalSlides;
                    this.showSlide(nextIndex, heroSection);
                    this.stopAutoplay();
                    this.startAutoplay();
                  },
                  
                  // 上一張
                  prevSlide: function(element) {
                    const heroSection = element.closest('.hero-section');
                    const prevIndex = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
                    this.showSlide(prevIndex, heroSection);
                    this.stopAutoplay();
                    this.startAutoplay();
                  },
                  
                  // 跳轉到指定幻燈片
                  goToSlide: function(element, slideIndex) {
                    const heroSection = element.closest('.hero-section');
                    this.showSlide(slideIndex, heroSection);
                    this.stopAutoplay();
                    this.startAutoplay();
                  },
                  
                  // 開始自動播放
                  startAutoplay: function() {
                    this.stopAutoplay();
                    const heroSection = document.querySelector('.hero-section');
                    if (!heroSection) return;
                    
                    // 檢查是否啟用自動播放
                    const autoplay = heroSection.getAttribute('data-autoplay') !== 'false';
                    if (!autoplay) return;
                    
                    const speed = parseInt(heroSection.getAttribute('data-autoplay-speed') || '3', 10);
                    this.autoplayInterval = setInterval(() => {
                      this.nextSlide(heroSection);
                    }, speed * 1000);
                  },
                  
                  // 停止自動播放
                  stopAutoplay: function() {
                    if (this.autoplayInterval) {
                      clearInterval(this.autoplayInterval);
                      this.autoplayInterval = null;
                    }
                  },
                  
                  // 初始化
                  init: function() {
                    const heroSections = document.querySelectorAll('.hero-section');
                    heroSections.forEach((heroSection, index) => {
                      // 設置鼠標懸停控制
                      heroSection.addEventListener('mouseenter', () => this.stopAutoplay());
                      heroSection.addEventListener('mouseleave', () => this.startAutoplay());
                      
                      // 初始化第一張幻燈片
                      this.showSlide(0, heroSection);
                    });
                    
                    // 啟動自動播放
                    this.startAutoplay();
                  }
                };
                
                // 頁面載入完成後初始化
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', () => {
                    setTimeout(() => window.heroController.init(), 100);
                  });
                } else {
                  setTimeout(() => window.heroController.init(), 100);
                }
              }
            `
          }
        ]
      }
    }
  });

  // 添加到區塊管理器
  editor.BlockManager.add('hero-section', {
    label: 'Hero 區塊',
    category: '頁面區塊',
    media: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="4" width="20" height="12" rx="2" stroke="currentColor" stroke-width="2"/>
      <rect x="4" y="6" width="4" height="3" rx="1" fill="currentColor"/>
      <path d="m14 11 2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="18" cy="8" r="1" fill="currentColor"/>
    </svg>`,
    content: { type: 'hero-section' }
  });
};

export default HeroSectionComponent;
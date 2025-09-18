/**
 * 完整功能的旋轉木馬組件
 * 包含真正的輪播功能和指示點
 */

// 聲明全局 Swiper 類型
declare global {
  interface Window {
    Swiper: any;
  }
}

/**
 * 註冊所有旋轉木馬組件
 */
export const registerEnhancedCarouselComponents = (editor: any) => {
  console.log('🎠 註冊增強版旋轉木馬組件...');

  // 1. 真正的 Hero 輪播組件
  editor.Components.addType('enhanced-hero-carousel', {
    model: {
      defaults: {
        tagName: 'div',
        classes: ['enhanced-hero-carousel'],
        attributes: {
          'data-carousel-type': 'hero'
        },
        traits: [
          {
            type: 'checkbox',
            label: '自動播放',
            name: 'autoplay',
            changeProp: 1,
            value: true
          },
          {
            type: 'number',
            label: '播放間隔 (毫秒)',
            name: 'autoplayDelay',
            changeProp: 1,
            value: 3000,
            min: 1000,
            max: 10000
          },
          {
            type: 'checkbox',
            label: '循環播放',
            name: 'loop',
            changeProp: 1,
            value: true
          },
          {
            type: 'checkbox',
            label: '顯示導航箭頭',
            name: 'navigation',
            changeProp: 1,
            value: true
          },
          {
            type: 'checkbox',
            label: '顯示指示點',
            name: 'pagination',
            changeProp: 1,
            value: true
          },
          {
            type: 'select',
            label: '轉換效果',
            name: 'effect',
            changeProp: 1,
            value: 'slide',
            options: [
              { value: 'slide', name: '滑動' },
              { value: 'fade', name: '淡入淡出' },
              { value: 'cube', name: '立方體' },
              { value: 'coverflow', name: '封面流' },
              { value: 'flip', name: '翻轉' }
            ]
          },
          {
            type: 'number',
            label: '高度 (px)',
            name: 'height',
            changeProp: 1,
            value: 500,
            min: 200,
            max: 800
          }
        ],
        style: {
          'width': '100%',
          'height': '500px',
          'position': 'relative',
          'overflow': 'hidden',
          'background': '#f8f9fa',
          'border-radius': '8px'
        }
      }
    },
    view: {
      onRender() {
        this.updateCarousel();
      },
      
      updateCarousel() {
        const model = this.model;
        const autoplay = model.get('autoplay');
        const autoplayDelay = model.get('autoplayDelay') || 3000;
        const loop = model.get('loop');
        const navigation = model.get('navigation');
        const pagination = model.get('pagination');
        const effect = model.get('effect') || 'slide';
        const height = model.get('height') || 500;

        // 更新容器高度
        this.el.style.height = `${height}px`;

        // 生成唯一 ID 以避免衝突
        const uniqueId = 'hero-carousel-' + Math.random().toString(36).substr(2, 9);

        const carouselHTML = `
          <div class="${uniqueId} swiper-container" style="width: 100%; height: 100%; position: relative;">
            <div class="swiper-wrapper">
              <div class="swiper-slide" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white;">
                <div style="text-align: center; padding: 40px; max-width: 600px;">
                  <h1 style="font-size: 3rem; margin-bottom: 20px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">歡迎來到我們的網站</h1>
                  <p style="font-size: 1.3rem; margin-bottom: 30px; opacity: 0.95; line-height: 1.6;">體驗最優質的服務和產品</p>
                  <button style="background: rgba(255,255,255,0.9); border: none; color: #333; padding: 15px 40px; border-radius: 30px; font-size: 1.1rem; font-weight: 600; cursor: pointer; transition: all 0.3s; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">立即開始</button>
                </div>
              </div>
              <div class="swiper-slide" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); display: flex; align-items: center; justify-content: center; color: white;">
                <div style="text-align: center; padding: 40px; max-width: 600px;">
                  <h1 style="font-size: 3rem; margin-bottom: 20px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">創新科技解決方案</h1>
                  <p style="font-size: 1.3rem; margin-bottom: 30px; opacity: 0.95; line-height: 1.6;">為您的業務帶來突破性成長</p>
                  <button style="background: rgba(255,255,255,0.9); border: none; color: #333; padding: 15px 40px; border-radius: 30px; font-size: 1.1rem; font-weight: 600; cursor: pointer; transition: all 0.3s; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">了解詳情</button>
                </div>
              </div>
              <div class="swiper-slide" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); display: flex; align-items: center; justify-content: center; color: white;">
                <div style="text-align: center; padding: 40px; max-width: 600px;">
                  <h1 style="font-size: 3rem; margin-bottom: 20px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">專業團隊支援</h1>
                  <p style="font-size: 1.3rem; margin-bottom: 30px; opacity: 0.95; line-height: 1.6;">24/7 全天候為您提供優質服務</p>
                  <button style="background: rgba(255,255,255,0.9); border: none; color: #333; padding: 15px 40px; border-radius: 30px; font-size: 1.1rem; font-weight: 600; cursor: pointer; transition: all 0.3s; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">聯絡我們</button>
                </div>
              </div>
            </div>
            ${pagination ? `<div class="swiper-pagination swiper-pagination-${uniqueId}"></div>` : ''}
            ${navigation ? `<div class="swiper-button-next swiper-button-next-${uniqueId}"></div><div class="swiper-button-prev swiper-button-prev-${uniqueId}"></div>` : ''}
          </div>
        `;

        this.el.innerHTML = carouselHTML;

        // 延遲初始化 Swiper 確保 DOM 載入完成
        setTimeout(() => {
          this.initSwiper(uniqueId, {
            effect: effect,
            loop: loop,
            autoplay: autoplay ? {
              delay: autoplayDelay,
              disableOnInteraction: false,
              pauseOnMouseEnter: true
            } : false,
            pagination: pagination ? {
              el: `.swiper-pagination-${uniqueId}`,
              clickable: true,
              renderBullet: function (index: number, className: string) {
                return '<span class="' + className + '" style="background: rgba(255,255,255,0.5); width: 12px; height: 12px; border-radius: 50%; margin: 0 4px; cursor: pointer; transition: all 0.3s;"></span>';
              }
            } : false,
            navigation: navigation ? {
              nextEl: `.swiper-button-next-${uniqueId}`,
              prevEl: `.swiper-button-prev-${uniqueId}`
            } : false,
            keyboard: { enabled: true },
            mousewheel: { forceToAxis: true },
            slidesPerView: 1,
            spaceBetween: 0
          });
        }, 100);
      },

      initSwiper(uniqueId: string, config: any) {
        if (typeof window.Swiper !== 'undefined') {
          try {
            const swiperElement = this.el.querySelector(`.${uniqueId}`);
            if (swiperElement) {
              // 清理之前的實例
              if (swiperElement.swiper) {
                swiperElement.swiper.destroy(true, true);
              }
              // 創建新實例
              new window.Swiper(swiperElement, config);
              console.log(`✅ Hero 輪播 ${uniqueId} 初始化成功`);
            }
          } catch (error) {
            console.error('❌ Hero 輪播初始化失敗:', error);
          }
        } else {
          console.warn('⚠️ Swiper 未載入，嘗試重新初始化...');
          setTimeout(() => this.initSwiper(uniqueId, config), 500);
        }
      }
    }
  });

  // 2. 產品輪播組件
  editor.Components.addType('enhanced-product-carousel', {
    model: {
      defaults: {
        tagName: 'div',
        classes: ['enhanced-product-carousel'],
        attributes: {
          'data-carousel-type': 'product'
        },
        traits: [
          {
            type: 'number',
            label: '每頁顯示數量',
            name: 'slidesPerView',
            changeProp: 1,
            value: 3,
            min: 1,
            max: 6
          },
          {
            type: 'number',
            label: '項目間距 (px)',
            name: 'spaceBetween',
            changeProp: 1,
            value: 20,
            min: 0,
            max: 50
          },
          {
            type: 'checkbox',
            label: '自動播放',
            name: 'autoplay',
            changeProp: 1,
            value: true
          },
          {
            type: 'checkbox',
            label: '循環播放',
            name: 'loop',
            changeProp: 1,
            value: true
          },
          {
            type: 'checkbox',
            label: '顯示導航箭頭',
            name: 'navigation',
            changeProp: 1,
            value: true
          },
          {
            type: 'checkbox',
            label: '顯示指示點',
            name: 'pagination',
            changeProp: 1,
            value: true
          }
        ],
        style: {
          'width': '100%',
          'height': '400px',
          'padding': '20px',
          'background': '#f8f9fa',
          'border-radius': '12px'
        }
      }
    },
    view: {
      onRender() {
        this.updateCarousel();
      },
      
      updateCarousel() {
        const model = this.model;
        const slidesPerView = model.get('slidesPerView') || 3;
        const spaceBetween = model.get('spaceBetween') || 20;
        const autoplay = model.get('autoplay');
        const loop = model.get('loop');
        const navigation = model.get('navigation');
        const pagination = model.get('pagination');

        const uniqueId = 'product-carousel-' + Math.random().toString(36).substr(2, 9);

        const carouselHTML = `
          <div class="${uniqueId} swiper-container" style="width: 100%; height: 100%; position: relative; padding: 20px;">
            <div class="swiper-wrapper">
              <div class="swiper-slide" style="background: white; border-radius: 8px; padding: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); text-align: center; height: auto;">
                <div style="width: 100%; height: 150px; background: linear-gradient(45deg, #ff6b6b, #ee5a52); border-radius: 6px; margin-bottom: 15px; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.2rem; font-weight: bold;">產品 1</div>
                <h3 style="margin: 0 0 10px; color: #333; font-size: 1.1rem;">精選產品 A</h3>
                <p style="margin: 0 0 15px; color: #666; font-size: 0.9rem;">這是產品描述文字，突出產品特色和優勢。</p>
                <div style="color: #007bff; font-size: 1.2rem; font-weight: bold;">NT$ 1,999</div>
              </div>
              <div class="swiper-slide" style="background: white; border-radius: 8px; padding: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); text-align: center; height: auto;">
                <div style="width: 100%; height: 150px; background: linear-gradient(45deg, #4ecdc4, #44a08d); border-radius: 6px; margin-bottom: 15px; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.2rem; font-weight: bold;">產品 2</div>
                <h3 style="margin: 0 0 10px; color: #333; font-size: 1.1rem;">精選產品 B</h3>
                <p style="margin: 0 0 15px; color: #666; font-size: 0.9rem;">這是產品描述文字，突出產品特色和優勢。</p>
                <div style="color: #007bff; font-size: 1.2rem; font-weight: bold;">NT$ 2,499</div>
              </div>
              <div class="swiper-slide" style="background: white; border-radius: 8px; padding: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); text-align: center; height: auto;">
                <div style="width: 100%; height: 150px; background: linear-gradient(45deg, #a8edea, #fed6e3); border-radius: 6px; margin-bottom: 15px; display: flex; align-items: center; justify-content: center; color: #333; font-size: 1.2rem; font-weight: bold;">產品 3</div>
                <h3 style="margin: 0 0 10px; color: #333; font-size: 1.1rem;">精選產品 C</h3>
                <p style="margin: 0 0 15px; color: #666; font-size: 0.9rem;">這是產品描述文字，突出產品特色和優勢。</p>
                <div style="color: #007bff; font-size: 1.2rem; font-weight: bold;">NT$ 1,799</div>
              </div>
              <div class="swiper-slide" style="background: white; border-radius: 8px; padding: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); text-align: center; height: auto;">
                <div style="width: 100%; height: 150px; background: linear-gradient(45deg, #ffecd2, #fcb69f); border-radius: 6px; margin-bottom: 15px; display: flex; align-items: center; justify-content: center; color: #333; font-size: 1.2rem; font-weight: bold;">產品 4</div>
                <h3 style="margin: 0 0 10px; color: #333; font-size: 1.1rem;">精選產品 D</h3>
                <p style="margin: 0 0 15px; color: #666; font-size: 0.9rem;">這是產品描述文字，突出產品特色和優勢。</p>
                <div style="color: #007bff; font-size: 1.2rem; font-weight: bold;">NT$ 3,299</div>
              </div>
              <div class="swiper-slide" style="background: white; border-radius: 8px; padding: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); text-align: center; height: auto;">
                <div style="width: 100%; height: 150px; background: linear-gradient(45deg, #667eea, #764ba2); border-radius: 6px; margin-bottom: 15px; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.2rem; font-weight: bold;">產品 5</div>
                <h3 style="margin: 0 0 10px; color: #333; font-size: 1.1rem;">精選產品 E</h3>
                <p style="margin: 0 0 15px; color: #666; font-size: 0.9rem;">這是產品描述文字，突出產品特色和優勢。</p>
                <div style="color: #007bff; font-size: 1.2rem; font-weight: bold;">NT$ 2,899</div>
              </div>
            </div>
            ${pagination ? `<div class="swiper-pagination swiper-pagination-${uniqueId}" style="position: relative; margin-top: 20px;"></div>` : ''}
            ${navigation ? `<div class="swiper-button-next swiper-button-next-${uniqueId}" style="color: #007bff;"></div><div class="swiper-button-prev swiper-button-prev-${uniqueId}" style="color: #007bff;"></div>` : ''}
          </div>
        `;

        this.el.innerHTML = carouselHTML;

        setTimeout(() => {
          this.initSwiper(uniqueId, {
            slidesPerView: slidesPerView,
            spaceBetween: spaceBetween,
            loop: loop,
            autoplay: autoplay ? {
              delay: 3000,
              disableOnInteraction: false
            } : false,
            pagination: pagination ? {
              el: `.swiper-pagination-${uniqueId}`,
              clickable: true
            } : false,
            navigation: navigation ? {
              nextEl: `.swiper-button-next-${uniqueId}`,
              prevEl: `.swiper-button-prev-${uniqueId}`
            } : false,
            breakpoints: {
              320: { slidesPerView: 1, spaceBetween: 10 },
              640: { slidesPerView: 2, spaceBetween: 15 },
              1024: { slidesPerView: slidesPerView, spaceBetween: spaceBetween }
            }
          });
        }, 100);
      },

      initSwiper(uniqueId: string, config: any) {
        if (typeof window.Swiper !== 'undefined') {
          try {
            const swiperElement = this.el.querySelector(`.${uniqueId}`);
            if (swiperElement) {
              if (swiperElement.swiper) {
                swiperElement.swiper.destroy(true, true);
              }
              new window.Swiper(swiperElement, config);
              console.log(`✅ 產品輪播 ${uniqueId} 初始化成功`);
            }
          } catch (error) {
            console.error('❌ 產品輪播初始化失敗:', error);
          }
        } else {
          console.warn('⚠️ Swiper 未載入，嘗試重新初始化...');
          setTimeout(() => this.initSwiper(uniqueId, config), 500);
        }
      }
    }
  });

  // 3. 圖片畫廊輪播組件
  editor.Components.addType('enhanced-gallery-carousel', {
    model: {
      defaults: {
        tagName: 'div',
        classes: ['enhanced-gallery-carousel'],
        attributes: {
          'data-carousel-type': 'gallery'
        },
        traits: [
          {
            type: 'checkbox',
            label: '顯示縮略圖',
            name: 'showThumbs',
            changeProp: 1,
            value: true
          },
          {
            type: 'checkbox',
            label: '循環播放',
            name: 'loop',
            changeProp: 1,
            value: true
          }
        ],
        style: {
          'width': '100%',
          'height': '600px',
          'background': '#fff',
          'border-radius': '8px',
          'overflow': 'hidden'
        }
      }
    },
    view: {
      onRender() {
        this.updateCarousel();
      },
      
      updateCarousel() {
        const model = this.model;
        const showThumbs = model.get('showThumbs');
        const loop = model.get('loop');

        const uniqueId = 'gallery-carousel-' + Math.random().toString(36).substr(2, 9);

        const carouselHTML = `
          <div style="width: 100%; height: 100%; position: relative;">
            <!-- 主輪播 -->
            <div class="gallery-main-${uniqueId} swiper-container" style="width: 100%; height: ${showThumbs ? '80%' : '100%'};">
              <div class="swiper-wrapper">
                <div class="swiper-slide" style="background: linear-gradient(45deg, #ff9a9e, #fecfef); display: flex; align-items: center; justify-content: center; color: white; font-size: 2rem; font-weight: bold;">圖片 1</div>
                <div class="swiper-slide" style="background: linear-gradient(45deg, #a8edea, #fed6e3); display: flex; align-items: center; justify-content: center; color: #333; font-size: 2rem; font-weight: bold;">圖片 2</div>
                <div class="swiper-slide" style="background: linear-gradient(45deg, #d299c2, #fef9d7); display: flex; align-items: center; justify-content: center; color: #333; font-size: 2rem; font-weight: bold;">圖片 3</div>
                <div class="swiper-slide" style="background: linear-gradient(45deg, #89f7fe, #66a6ff); display: flex; align-items: center; justify-content: center; color: white; font-size: 2rem; font-weight: bold;">圖片 4</div>
              </div>
            </div>
            
            ${showThumbs ? `
            <!-- 縮略圖輪播 -->
            <div class="gallery-thumbs-${uniqueId} swiper-container" style="width: 100%; height: 20%; box-sizing: border-box; padding: 10px 0;">
              <div class="swiper-wrapper">
                <div class="swiper-slide" style="width: 25%; height: 100%; opacity: 0.4; cursor: pointer; border-radius: 6px; overflow: hidden; background: linear-gradient(45deg, #ff9a9e, #fecfef); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">1</div>
                <div class="swiper-slide" style="width: 25%; height: 100%; opacity: 0.4; cursor: pointer; border-radius: 6px; overflow: hidden; background: linear-gradient(45deg, #a8edea, #fed6e3); display: flex; align-items: center; justify-content: center; color: #333; font-weight: bold;">2</div>
                <div class="swiper-slide" style="width: 25%; height: 100%; opacity: 0.4; cursor: pointer; border-radius: 6px; overflow: hidden; background: linear-gradient(45deg, #d299c2, #fef9d7); display: flex; align-items: center; justify-content: center; color: #333; font-weight: bold;">3</div>
                <div class="swiper-slide" style="width: 25%; height: 100%; opacity: 0.4; cursor: pointer; border-radius: 6px; overflow: hidden; background: linear-gradient(45deg, #89f7fe, #66a6ff); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">4</div>
              </div>
            </div>
            ` : ''}
          </div>
        `;

        this.el.innerHTML = carouselHTML;

        setTimeout(() => {
          this.initGallery(uniqueId, { loop, showThumbs });
        }, 100);
      },

      initGallery(uniqueId: string, options: any) {
        if (typeof window.Swiper !== 'undefined') {
          try {
            let galleryThumbs: any = null;
            
            if (options.showThumbs) {
              // 初始化縮略圖輪播
              galleryThumbs = new window.Swiper(`.gallery-thumbs-${uniqueId}`, {
                spaceBetween: 10,
                slidesPerView: 4,
                freeMode: true,
                watchSlidesProgress: true,
              });
            }

            // 初始化主輪播
            const galleryMain = new window.Swiper(`.gallery-main-${uniqueId}`, {
              spaceBetween: 10,
              loop: options.loop,
              thumbs: options.showThumbs ? {
                swiper: galleryThumbs,
              } : undefined,
              keyboard: { enabled: true },
              mousewheel: { forceToAxis: true },
            });

            console.log(`✅ 圖片畫廊 ${uniqueId} 初始化成功`);
          } catch (error) {
            console.error('❌ 圖片畫廊初始化失敗:', error);
          }
        } else {
          console.warn('⚠️ Swiper 未載入，嘗試重新初始化...');
          setTimeout(() => this.initGallery(uniqueId, options), 500);
        }
      }
    }
  });

  // 註冊區塊到編輯器
  editor.BlockManager.add('enhanced-hero-carousel', {
    label: '🎠 Hero 輪播',
    category: '增強輪播組件',
    media: '<i class="fa fa-images"></i>',
    content: { type: 'enhanced-hero-carousel' }
  });

  editor.BlockManager.add('enhanced-product-carousel', {
    label: '🛒 產品輪播',
    category: '增強輪播組件', 
    media: '<i class="fa fa-shopping-cart"></i>',
    content: { type: 'enhanced-product-carousel' }
  });

  editor.BlockManager.add('enhanced-gallery-carousel', {
    label: '📸 圖片畫廊',
    category: '增強輪播組件',
    media: '<i class="fa fa-camera"></i>',
    content: { type: 'enhanced-gallery-carousel' }
  });

  console.log('✅ 增強版旋轉木馬組件註冊完成');
};

/**
 * 載入 Swiper 資源
 */
export const loadEnhancedSwiperAssets = async () => {
  console.log('🔄 載入增強版 Swiper 資源...');
  
  // 載入 Swiper CSS
  if (!document.querySelector('#swiper-enhanced-css')) {
    const link = document.createElement('link');
    link.id = 'swiper-enhanced-css';
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css';
    document.head.appendChild(link);
  }

  // 載入自定義樣式
  if (!document.querySelector('#carousel-enhanced-styles')) {
    const customCSS = `
      /* 增強版輪播樣式 */
      .enhanced-hero-carousel,
      .enhanced-product-carousel,
      .enhanced-gallery-carousel {
        position: relative;
      }
      
      .swiper-container {
        width: 100%;
        height: 100%;
      }
      
      .swiper-slide {
        text-align: center;
        font-size: 18px;
        background: #fff;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      
      /* 導航按鈕樣式 */
      .swiper-button-next,
      .swiper-button-prev {
        color: #fff !important;
        background: rgba(0, 0, 0, 0.5) !important;
        width: 44px !important;
        height: 44px !important;
        border-radius: 50% !important;
        transition: all 0.3s ease !important;
      }
      
      .swiper-button-next:hover,
      .swiper-button-prev:hover {
        background: rgba(0, 0, 0, 0.7) !important;
        transform: scale(1.1);
      }
      
      .swiper-button-next:after,
      .swiper-button-prev:after {
        font-size: 18px !important;
        font-weight: bold !important;
      }
      
      /* 分頁指示器樣式 */
      .swiper-pagination-bullet {
        width: 12px !important;
        height: 12px !important;
        background: rgba(255, 255, 255, 0.5) !important;
        opacity: 1 !important;
        transition: all 0.3s ease !important;
        border-radius: 50% !important;
        margin: 0 4px !important;
      }
      
      .swiper-pagination-bullet-active {
        background: #fff !important;
        transform: scale(1.3) !important;
      }
      
      /* 產品輪播特殊樣式 */
      .enhanced-product-carousel .swiper-pagination-bullet {
        background: rgba(0, 123, 255, 0.3) !important;
      }
      
      .enhanced-product-carousel .swiper-pagination-bullet-active {
        background: #007bff !important;
      }
      
      .enhanced-product-carousel .swiper-button-next,
      .enhanced-product-carousel .swiper-button-prev {
        color: #007bff !important;
        background: rgba(0, 123, 255, 0.1) !important;
      }
      
      .enhanced-product-carousel .swiper-button-next:hover,
      .enhanced-product-carousel .swiper-button-prev:hover {
        background: rgba(0, 123, 255, 0.2) !important;
      }
      
      /* 縮略圖樣式 */
      .swiper-slide-thumb-active {
        opacity: 1 !important;
        border: 2px solid #007bff !important;
      }
    `;

    const styleSheet = document.createElement('style');
    styleSheet.id = 'carousel-enhanced-styles';
    styleSheet.type = 'text/css';
    styleSheet.innerHTML = customCSS;
    document.head.appendChild(styleSheet);
  }

  // 載入 Swiper JS
  return new Promise<void>((resolve) => {
    if (window.Swiper) {
      console.log('✅ Swiper 已存在');
      resolve();
      return;
    }

    if (document.querySelector('#swiper-enhanced-js')) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.id = 'swiper-enhanced-js';
    script.src = 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js';
    
    script.onload = () => {
      console.log('✅ Swiper.js 載入完成');
      resolve();
    };
    
    script.onerror = () => {
      console.error('❌ Swiper.js 載入失敗');
      resolve();
    };
    
    document.head.appendChild(script);
  });
};
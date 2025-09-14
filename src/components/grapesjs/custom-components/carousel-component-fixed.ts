/**
 * 主要橫幅輪播組件 - 修復版
 * 支援自動播放、觸控操作和響應式設計
 */

export const CarouselComponent = (editor: any) => {
  editor.DomComponents.addType('main-banner-carousel', {
    model: {
      defaults: {
        tagName: 'div',
        classes: ['main-banner-carousel'],
        attributes: {
          'data-carousel': 'true'
        },
        style: {
          position: 'relative',
          width: '100%',
          height: '500px',
          overflow: 'hidden',
          borderRadius: '12px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
        },
        components: [
          // 輪播容器
          {
            tagName: 'div',
            classes: ['carousel-slides'],
            style: {
              position: 'relative',
              width: '100%',
              height: '100%'
            },
            components: [
              // 幻燈片 1
              {
                tagName: 'div',
                classes: ['carousel-slide', 'active'],
                attributes: { 'data-slide': '0' },
                style: {
                  position: 'absolute',
                  top: '0',
                  left: '0',
                  width: '100%',
                  height: '100%',
                  opacity: '1',
                  transition: 'opacity 0.8s ease-in-out, transform 0.8s ease-in-out',
                  transform: 'translateX(0%)'
                },
                components: [
                  {
                    type: 'image',
                    attributes: {
                      src: 'https://picsum.photos/1200/500?random=1',
                      alt: '主橫幅圖片 1',
                      draggable: 'false'
                    },
                    style: {
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'center',
                      cursor: 'pointer'
                    },
                    selectable: true,
                    editable: true,
                    removable: false,
                    copyable: false,
                    draggable: false
                  },
                  {
                    tagName: 'div',
                    classes: ['slide-overlay'],
                    style: {
                      position: 'absolute',
                      top: '0',
                      left: '0',
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(135deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.4) 100%)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      textAlign: 'center',
                      padding: '2rem',
                      color: 'white'
                    },
                    components: [
                      {
                        tagName: 'h2',
                        content: '歡迎來到我們的網站',
                        style: {
                          fontSize: 'clamp(1.5rem, 4vw, 3rem)',
                          fontWeight: '700',
                          marginBottom: '1rem',
                          textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                          lineHeight: '1.2'
                        }
                      },
                      {
                        tagName: 'p',
                        content: '探索我們的精彩內容和服務',
                        style: {
                          fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
                          marginBottom: '2rem',
                          textShadow: '0 1px 3px rgba(0,0,0,0.5)',
                          maxWidth: '600px',
                          lineHeight: '1.6'
                        }
                      },
                      {
                        tagName: 'a',
                        content: '立即開始',
                        attributes: { href: '#', class: 'carousel-cta-btn' },
                        style: {
                          display: 'inline-block',
                          backgroundColor: '#ffffff',
                          color: '#1f2937',
                          padding: '0.75rem 2rem',
                          fontSize: '1.1rem',
                          fontWeight: '600',
                          borderRadius: '50px',
                          textDecoration: 'none',
                          boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                          transition: 'all 0.3s ease'
                        }
                      }
                    ]
                  }
                ]
              },
              // 幻燈片 2
              {
                tagName: 'div',
                classes: ['carousel-slide'],
                attributes: { 'data-slide': '1' },
                style: {
                  position: 'absolute',
                  top: '0',
                  left: '0',
                  width: '100%',
                  height: '100%',
                  opacity: '0',
                  transition: 'opacity 0.8s ease-in-out, transform 0.8s ease-in-out',
                  transform: 'translateX(100%)'
                },
                components: [
                  {
                    type: 'image',
                    attributes: {
                      src: 'https://picsum.photos/1200/500?random=2',
                      alt: '主橫幅圖片 2',
                      draggable: 'false'
                    },
                    style: {
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'center',
                      cursor: 'pointer'
                    },
                    selectable: true,
                    editable: true,
                    removable: false,
                    copyable: false,
                    draggable: false
                  },
                  {
                    tagName: 'div',
                    classes: ['slide-overlay'],
                    style: {
                      position: 'absolute',
                      top: '0',
                      left: '0',
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(45deg, rgba(74,144,226,0.6) 0%, rgba(147,51,234,0.6) 100%)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      textAlign: 'center',
                      padding: '2rem',
                      color: 'white'
                    },
                    components: [
                      {
                        tagName: 'h2',
                        content: '創新服務體驗',
                        style: {
                          fontSize: 'clamp(1.5rem, 4vw, 3rem)',
                          fontWeight: '700',
                          marginBottom: '1rem',
                          textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                          lineHeight: '1.2'
                        }
                      },
                      {
                        tagName: 'p',
                        content: '提供最優質的產品和解決方案',
                        style: {
                          fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
                          marginBottom: '2rem',
                          textShadow: '0 1px 3px rgba(0,0,0,0.5)',
                          maxWidth: '600px',
                          lineHeight: '1.6'
                        }
                      },
                      {
                        tagName: 'a',
                        content: '了解更多',
                        attributes: { href: '#', class: 'carousel-cta-btn' },
                        style: {
                          display: 'inline-block',
                          backgroundColor: '#ffffff',
                          color: '#1f2937',
                          padding: '0.75rem 2rem',
                          fontSize: '1.1rem',
                          fontWeight: '600',
                          borderRadius: '50px',
                          textDecoration: 'none',
                          boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                          transition: 'all 0.3s ease'
                        }
                      }
                    ]
                  }
                ]
              },
              // 幻燈片 3
              {
                tagName: 'div',
                classes: ['carousel-slide'],
                attributes: { 'data-slide': '2' },
                style: {
                  position: 'absolute',
                  top: '0',
                  left: '0',
                  width: '100%',
                  height: '100%',
                  opacity: '0',
                  transition: 'opacity 0.8s ease-in-out, transform 0.8s ease-in-out',
                  transform: 'translateX(100%)'
                },
                components: [
                  {
                    type: 'image',
                    attributes: {
                      src: 'https://picsum.photos/1200/500?random=3',
                      alt: '主橫幅圖片 3',
                      draggable: 'false'
                    },
                    style: {
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'center',
                      cursor: 'pointer'
                    },
                    selectable: true,
                    editable: true,
                    removable: false,
                    copyable: false,
                    draggable: false
                  },
                  {
                    tagName: 'div',
                    classes: ['slide-overlay'],
                    style: {
                      position: 'absolute',
                      top: '0',
                      left: '0',
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(315deg, rgba(255,107,107,0.6) 0%, rgba(255,142,83,0.6) 100%)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      textAlign: 'center',
                      padding: '2rem',
                      color: 'white'
                    },
                    components: [
                      {
                        tagName: 'h2',
                        content: '專業團隊支援',
                        style: {
                          fontSize: 'clamp(1.5rem, 4vw, 3rem)',
                          fontWeight: '700',
                          marginBottom: '1rem',
                          textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                          lineHeight: '1.2'
                        }
                      },
                      {
                        tagName: 'p',
                        content: '24/7 全天候客戶服務與技術支援',
                        style: {
                          fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
                          marginBottom: '2rem',
                          textShadow: '0 1px 3px rgba(0,0,0,0.5)',
                          maxWidth: '600px',
                          lineHeight: '1.6'
                        }
                      },
                      {
                        tagName: 'a',
                        content: '聯絡我們',
                        attributes: { href: '#', class: 'carousel-cta-btn' },
                        style: {
                          display: 'inline-block',
                          backgroundColor: '#ffffff',
                          color: '#1f2937',
                          padding: '0.75rem 2rem',
                          fontSize: '1.1rem',
                          fontWeight: '600',
                          borderRadius: '50px',
                          textDecoration: 'none',
                          boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                          transition: 'all 0.3s ease'
                        }
                      }
                    ]
                  }
                ]
              }
            ]
          },
          // 導航箭頭
          {
            tagName: 'button',
            classes: ['carousel-nav-btn', 'carousel-prev'],
            attributes: { type: 'button', 'aria-label': '上一張' },
            content: '‹',
            style: {
              position: 'absolute',
              left: '20px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '50px',
              height: '50px',
              backgroundColor: 'rgba(255,255,255,0.9)',
              border: 'none',
              borderRadius: '50%',
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#374151',
              cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
              transition: 'all 0.3s ease',
              zIndex: '10'
            }
          },
          {
            tagName: 'button',
            classes: ['carousel-nav-btn', 'carousel-next'],
            attributes: { type: 'button', 'aria-label': '下一張' },
            content: '›',
            style: {
              position: 'absolute',
              right: '20px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '50px',
              height: '50px',
              backgroundColor: 'rgba(255,255,255,0.9)',
              border: 'none',
              borderRadius: '50%',
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#374151',
              cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
              transition: 'all 0.3s ease',
              zIndex: '10'
            }
          },
          // 指示器
          {
            tagName: 'div',
            classes: ['carousel-indicators'],
            style: {
              position: 'absolute',
              bottom: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: '10px',
              zIndex: '10'
            },
            components: [
              {
                tagName: 'button',
                classes: ['carousel-indicator', 'active'],
                attributes: { type: 'button', 'data-slide-to': '0' },
                style: {
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  border: 'none',
                  backgroundColor: '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  opacity: '1',
                  transform: 'scale(1.2)'
                }
              },
              {
                tagName: 'button',
                classes: ['carousel-indicator'],
                attributes: { type: 'button', 'data-slide-to': '1' },
                style: {
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  border: 'none',
                  backgroundColor: 'rgba(255,255,255,0.6)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  opacity: '0.7'
                }
              },
              {
                tagName: 'button',
                classes: ['carousel-indicator'],
                attributes: { type: 'button', 'data-slide-to': '2' },
                style: {
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  border: 'none',
                  backgroundColor: 'rgba(255,255,255,0.6)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  opacity: '0.7'
                }
              }
            ]
          }
        ]
      }
    },
    view: {
      onRender() {
        const self = this as any
        // 使用 setTimeout 確保 DOM 元素已經渲染
        setTimeout(() => {
          self.initCarousel()
        }, 100)
      },
      
      initCarousel() {
        const self = this as any
        const el = self.el as HTMLElement
        
        if (!el || el.dataset.carouselInit) return
        el.dataset.carouselInit = 'true'
        
        let currentSlide = 0
        const slides = el.querySelectorAll('.carousel-slide') as NodeListOf<HTMLElement>
        const indicators = el.querySelectorAll('.carousel-indicator') as NodeListOf<HTMLElement>
        const prevBtn = el.querySelector('.carousel-prev') as HTMLButtonElement
        const nextBtn = el.querySelector('.carousel-next') as HTMLButtonElement
        
        if (!slides.length) return
        
        let autoplayInterval: number
        const autoplayDelay = 4000
        let isTransitioning = false
        
        // 顯示指定幻燈片
        const showSlide = (index: number) => {
          if (isTransitioning || index === currentSlide) return
          isTransitioning = true
          
          // 隱藏當前幻燈片
          slides[currentSlide].style.opacity = '0'
          slides[currentSlide].style.transform = 'translateX(-100%)'
          
          // 顯示目標幻燈片
          slides[index].style.opacity = '1'
          slides[index].style.transform = 'translateX(0%)'
          
          // 更新指示器
          indicators.forEach((indicator, i) => {
            if (i === index) {
              indicator.classList.add('active')
              indicator.style.backgroundColor = '#ffffff'
              indicator.style.opacity = '1'
              indicator.style.transform = 'scale(1.2)'
            } else {
              indicator.classList.remove('active')
              indicator.style.backgroundColor = 'rgba(255,255,255,0.6)'
              indicator.style.opacity = '0.7'
              indicator.style.transform = 'scale(1)'
            }
          })
          
          currentSlide = index
          
          setTimeout(() => {
            isTransitioning = false
          }, 800)
        }
        
        // 下一張
        const nextSlide = () => {
          const next = (currentSlide + 1) % slides.length
          showSlide(next)
        }
        
        // 上一張
        const prevSlide = () => {
          const prev = (currentSlide - 1 + slides.length) % slides.length
          showSlide(prev)
        }
        
        // 自動播放
        const startAutoplay = () => {
          if (autoplayInterval) clearInterval(autoplayInterval)
          autoplayInterval = window.setInterval(nextSlide, autoplayDelay)
        }
        
        const stopAutoplay = () => {
          if (autoplayInterval) clearInterval(autoplayInterval)
        }
        
        // 事件綁定
        nextBtn?.addEventListener('click', () => {
          nextSlide()
          stopAutoplay()
          setTimeout(startAutoplay, 5000)
        })
        
        prevBtn?.addEventListener('click', () => {
          prevSlide()
          stopAutoplay()
          setTimeout(startAutoplay, 5000)
        })
        
        indicators.forEach((indicator, index) => {
          indicator.addEventListener('click', () => {
            showSlide(index)
            stopAutoplay()
            setTimeout(startAutoplay, 5000)
          })
        })
        
        // 鼠標懸停控制
        el.addEventListener('mouseenter', stopAutoplay)
        el.addEventListener('mouseleave', startAutoplay)
        
        // 初始化第一張幻燈片
        showSlide(0)
        
        // 啟動自動播放
        startAutoplay()
        
        // 清理函數
        ;(el as any)._carouselCleanup = () => {
          stopAutoplay()
        }
      }
    }
  })

  // 添加到區塊管理器
  editor.BlockManager.add('main-banner-carousel', {
    label: '主要橫幅輪播',
    category: '自訂組件',
    media: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="4" width="20" height="12" rx="2" stroke="currentColor" stroke-width="2"/>
      <circle cx="7" cy="7" r="1" fill="currentColor"/>
      <circle cx="12" cy="7" r="1" fill="currentColor"/>
      <circle cx="17" cy="7" r="1" fill="currentColor"/>
    </svg>`,
    content: { type: 'main-banner-carousel' }
  })
}

export default CarouselComponent
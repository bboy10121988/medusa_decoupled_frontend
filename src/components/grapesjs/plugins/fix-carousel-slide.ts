/**
 * 修復 GrapesJS Carousel 組件的 slide 拖拉問題
 * 解決 carousel slide 無法從組件面板拖拉到編輯器的問題
 */

import { Editor } from 'grapesjs'

export default function fixCarouselSlide(editor: Editor) {
  console.log('🔧 正在載入 Carousel Slide 修復插件...')

  editor.on('load', () => {
    const domc = editor.DomComponents
    
    // 確保 carousel-slide 組件可以被拖拉
    const carouselSlideType = domc.getType('carousel-slide')
    
    if (carouselSlideType) {
      console.log('✅ 找到 carousel-slide 組件類型，正在應用修復...')
      
      // 修復 carousel-slide 的可拖拉性
      domc.addType('carousel-slide', {
        extend: 'default',
        model: {
          defaults: {
            tagName: 'div',
            draggable: true, // 確保可拖拉
            droppable: true, // 確保可放置其他元素
            attributes: {
              class: 'splide__slide'
            },
            traits: [
              {
                type: 'text',
                name: 'data-splide-index',
                label: 'Slide Index'
              }
            ]
          }
        },
        view: {
          tagName: 'div',
          events: {
            // 確保拖拉事件正常工作
            dragstart: 'handleDragStart',
            dragend: 'handleDragEnd'
          },
          
          handleDragStart(e: DragEvent) {
            console.log('🎯 Carousel slide 開始拖拉')
          },
          
          handleDragEnd(e: DragEvent) {
            console.log('✅ Carousel slide 拖拉結束')
          }
        }
      })
      
      console.log('✅ Carousel slide 修復完成')
    } else {
      console.warn('⚠️ 未找到 carousel-slide 組件類型')
    }
  })

  // 監聽組件添加事件
  editor.on('component:add', (component) => {
    const componentType = component.get('type')
    if (componentType === 'carousel-slide') {
      console.log('🎯 檢測到 carousel-slide 組件被添加')
      
      // 確保組件具有正確的屬性
      if (!component.get('attributes').class?.includes('splide__slide')) {
        component.addAttributes({
          class: (component.get('attributes').class || '') + ' splide__slide'
        })
      }
    }
  })

  console.log('✅ Carousel Slide 修復插件載入完成')
}
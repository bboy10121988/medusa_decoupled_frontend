// 手機版手勢滑動測試腳本
// 在瀏覽器開發者工具的控制台中運行此腳本來測試手勢滑動

function testMobileSwipeGestures() {
  console.log('🧪 開始測試 Main Banner 手機版手勢滑動功能')
  
  // 查找 hero 容器
  const heroContainer = document.querySelector('.hero-image-container')
  
  if (!heroContainer) {
    console.error('❌ 找不到 .hero-image-container 元素')
    return
  }
  
  console.log('✅ 找到 hero 容器:', heroContainer)
  
  // 模擬觸摸事件
  function simulateSwipe(direction, distance = 100) {
    const startX = 200
    const endX = direction === 'left' ? startX - distance : startX + distance
    
    console.log(`🖱️ 模擬 ${direction === 'left' ? '左' : '右'}滑 ${distance}px`)
    
    // TouchStart 事件
    const touchStartEvent = new TouchEvent('touchstart', {
      bubbles: true,
      touches: [{
        clientX: startX,
        clientY: 100,
        identifier: 0
      }]
    })
    
    // TouchMove 事件
    const touchMoveEvent = new TouchEvent('touchmove', {
      bubbles: true,
      touches: [{
        clientX: startX + (endX - startX) * 0.5, // 中間位置
        clientY: 100,
        identifier: 0
      }]
    })
    
    // TouchEnd 事件
    const touchEndEvent = new TouchEvent('touchend', {
      bubbles: true,
      changedTouches: [{
        clientX: endX,
        clientY: 100,
        identifier: 0
      }]
    })
    
    // 按順序觸發事件
    heroContainer.dispatchEvent(touchStartEvent)
    
    setTimeout(() => {
      heroContainer.dispatchEvent(touchMoveEvent)
    }, 50)
    
    setTimeout(() => {
      heroContainer.dispatchEvent(touchEndEvent)
    }, 150)
    
    console.log(`✅ ${direction === 'left' ? '左' : '右'}滑手勢已模擬`)
  }
  
  // 測試左滑（下一張）
  console.log('\n📱 測試左滑手勢（下一張）')
  simulateSwipe('left', 80)
  
  // 測試右滑（上一張）
  setTimeout(() => {
    console.log('\n📱 測試右滑手勢（上一張）')
    simulateSwipe('right', 80)
  }, 2000)
  
  // 檢查事件監聽器
  console.log('\n🔍 檢查觸摸事件監聽器:')
  console.log('- onTouchStart:', heroContainer.ontouchstart !== null ? '✅ 已設置' : '❌ 未設置')
  console.log('- onTouchMove:', heroContainer.ontouchmove !== null ? '✅ 已設置' : '❌ 未設置') 
  console.log('- onTouchEnd:', heroContainer.ontouchend !== null ? '✅ 已設置' : '❌ 未設置')
  
  // 檢查當前幻燈片
  const currentSlide = document.querySelector('.opacity-100')
  if (currentSlide) {
    console.log('✅ 當前顯示的幻燈片:', currentSlide)
  }
  
  return {
    testLeftSwipe: () => simulateSwipe('left', 80),
    testRightSwipe: () => simulateSwipe('right', 80),
    heroContainer
  }
}

// 自動運行測試
if (typeof window !== 'undefined') {
  testMobileSwipeGestures()
} else {
  console.log('此腳本需要在瀏覽器環境中運行')
}
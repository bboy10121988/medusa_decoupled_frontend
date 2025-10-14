// Main Banner 手勢滑動調試工具
// 在瀏覽器控制台中運行: debugMobileSwipe()

window.debugMobileSwipe = function() {
  console.log('🔧 啟動 Main Banner 手勢滑動調試模式')
  
  // 找到 hero 容器
  const heroContainer = document.querySelector('.hero-image-container')
  
  if (!heroContainer) {
    console.error('❌ 找不到 .hero-image-container')
    return
  }
  
  console.log('✅ 找到 hero 容器:', heroContainer)
  
  // 添加視覺化指示器
  const indicator = document.createElement('div')
  indicator.id = 'swipe-debug-indicator'
  indicator.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 10px;
    border-radius: 5px;
    font-family: monospace;
    font-size: 12px;
    z-index: 9999;
    pointer-events: none;
  `
  indicator.textContent = '手勢調試啟動'
  document.body.appendChild(indicator)
  
  // 監聽觸摸事件
  let startX, startTime, isTracking = false
  
  heroContainer.addEventListener('touchstart', function(e) {
    if (e.touches.length !== 1) return
    startX = e.touches[0].clientX
    startTime = Date.now()
    isTracking = true
    
    indicator.textContent = `開始: X=${Math.round(startX)}`
    indicator.style.background = 'rgba(0, 100, 200, 0.8)'
    
    console.log('👆 TouchStart:', {
      x: startX,
      time: startTime,
      touches: e.touches.length
    })
  })
  
  heroContainer.addEventListener('touchmove', function(e) {
    if (!isTracking || e.touches.length !== 1) return
    
    const currentX = e.touches[0].clientX
    const diffX = startX - currentX
    
    indicator.textContent = `移動: ΔX=${Math.round(diffX)}`
    indicator.style.background = Math.abs(diffX) > 5 ? 'rgba(200, 100, 0, 0.8)' : 'rgba(0, 100, 200, 0.8)'
    
    console.log('👋 TouchMove:', {
      currentX,
      diffX,
      isSignificant: Math.abs(diffX) > 5
    })
  })
  
  heroContainer.addEventListener('touchend', function(e) {
    if (!isTracking || !e.changedTouches || e.changedTouches.length === 0) return
    
    const endX = e.changedTouches[0].clientX
    const diffX = startX - endX
    const diffTime = Date.now() - startTime
    const speed = Math.abs(diffX) / diffTime * 1000
    
    const isValidSwipe = Math.abs(diffX) > 30 && diffTime < 800 && speed > 37.5
    const direction = diffX > 0 ? '左滑 (下一張)' : '右滑 (上一張)'
    
    indicator.textContent = `${isValidSwipe ? '✅' : '❌'} ${direction}`
    indicator.style.background = isValidSwipe ? 'rgba(0, 200, 0, 0.8)' : 'rgba(200, 0, 0, 0.8)'
    
    console.log('🏁 TouchEnd:', {
      endX,
      diffX,
      diffTime,
      speed: speed.toFixed(1) + 'px/s',
      direction: diffX > 0 ? 'left' : 'right',
      isValidSwipe,
      criteria: {
        distance: `${Math.abs(diffX)} > 30: ${Math.abs(diffX) > 30}`,
        time: `${diffTime} < 800: ${diffTime < 800}`,
        speed: `${speed.toFixed(1)} > 37.5: ${speed > 37.5}`
      }
    })
    
    isTracking = false
    
    // 3秒後重置指示器
    setTimeout(() => {
      indicator.textContent = '等待手勢...'
      indicator.style.background = 'rgba(0, 0, 0, 0.8)'
    }, 3000)
  })
  
  console.log('✅ 手勢調試已啟動，請在手機版或開發者工具的觸摸模擬模式下測試')
  console.log('📱 觸摸右上角的指示器將顯示手勢狀態')
  
  return {
    stop() {
      document.getElementById('swipe-debug-indicator')?.remove()
      console.log('🔧 手勢調試已停止')
    }
  }
}

console.log('🔧 手勢滑動調試工具已載入')
console.log('📱 運行 debugMobileSwipe() 來啟動調試模式')
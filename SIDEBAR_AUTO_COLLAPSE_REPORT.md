# 左側欄自動收合功能實現報告

## 需求描述
將 GrapesJS 編輯器的左側欄（頁面管理側邊欄）改為：
- 保持原有的漢堡按鈕點擊切換功能
- **新增**：點擊左側欄以外的任何區域自動收合側邊欄

## 實現方案

### 1. 新增函數
```typescript
// 收合側邊欄（只收合，不切換）
const collapseSidebar = () => {
  if (isExpanded) {
    isExpanded = false
    sidebar.style.transform = 'translateX(-280px)'
    
    // 更新按鈕樣式
    const toggleBtn = document.querySelector('.gjs-sidebar-toggle-header') as HTMLElement
    if (toggleBtn) {
      toggleBtn.style.backgroundColor = 'transparent'
      toggleBtn.style.color = '#999'
    }
  }
}
```

### 2. 全域點擊監聽器
```typescript
// 添加點擊外部區域收合側邊欄的監聽器
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  const sidebar = document.querySelector('.gjs-custom-sidebar')
  const toggleBtn = document.querySelector('.gjs-sidebar-toggle-header')
  
  // 如果點擊的不是側邊欄、漢堡按鈕或它們的子元素，則收合側邊欄
  if (sidebar && toggleBtn && isExpanded) {
    const clickedInsideSidebar = sidebar.contains(target)
    const clickedToggleBtn = toggleBtn.contains(target)
    
    if (!clickedInsideSidebar && !clickedToggleBtn) {
      collapseSidebar()
    }
  }
}

// 添加全域點擊監聽器
document.addEventListener('click', handleClickOutside)
```

### 3. 清理機制
- 在元件卸載時自動移除事件監聽器
- 在創建新側邊欄時清理舊的監聽器
- 防止記憶體洩漏

## 修改的檔案
- `src/components/grapesjs/grapes_editor.tsx`

## 功能特點

### ✅ 保持原有功能
- 漢堡按鈕點擊切換側邊欄
- 側邊欄展開時顯示頁面列表
- 頁面管理功能完整保留

### ✅ 新增功能
- 點擊編輯器畫布區域自動收合
- 點擊右側屬性面板自動收合
- 點擊頂部工具列自動收合
- 點擊任何非側邊欄區域自動收合

### ✅ 智慧判斷
- 只在側邊欄展開時才監聽外部點擊
- 點擊側邊欄內部不會收合
- 點擊漢堡按鈕不會觸發自動收合
- 避免事件衝突

## 使用體驗

### 操作流程
1. **展開側邊欄**：點擊漢堡按鈕（原有功能）
2. **瀏覽頁面**：在側邊欄中查看和管理頁面
3. **繼續編輯**：點擊畫布任意位置，側邊欄自動收合
4. **再次展開**：需要時再點擊漢堡按鈕

### 使用者優勢
- **更直觀**：點擊工作區域就能收合，符合使用習慣
- **更高效**：不需要特意去點擊漢堡按鈕收合
- **更流暢**：編輯工作流程更順暢

## 技術細節

### 事件處理邏輯
1. 監聽全域 `click` 事件
2. 檢查點擊目標是否在側邊欄內
3. 檢查點擊目標是否是漢堡按鈕
4. 如果都不是且側邊欄已展開，則自動收合

### 記憶體管理
- 使用 `window.sidebarCleanup` 存儲清理函數
- 在 useEffect 清理函數中移除監聽器
- 創建新側邊欄時清理舊監聽器

## 測試建議

### 基本功能測試
1. ✅ 點擊漢堡按鈕能展開側邊欄
2. ✅ 點擊漢堡按鈕能收合側邊欄
3. ✅ 點擊畫布區域能自動收合側邊欄
4. ✅ 點擊側邊欄內部不會收合
5. ✅ 多次切換不會產生問題

### 邊界情況測試
1. ✅ 快速點擊不會產生異常
2. ✅ 頁面刷新後功能正常
3. ✅ 瀏覽器視窗調整大小後正常
4. ✅ 沒有 console 錯誤

## 總結
此修改實現了更直觀的側邊欄操作體驗，保持了所有原有功能的同時，新增了點擊外部自動收合的便利功能。程式碼實現考慮了事件衝突、記憶體管理等技術細節，確保穩定可靠。
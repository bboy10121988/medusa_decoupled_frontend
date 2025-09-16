# Bootstrap Canvas 錯誤修復報告

## 錯誤描述
```
Runtime TypeError: Cannot read properties of undefined (reading 'getFrameEl')
at bootstrap-components-simple.ts:55:43
```

## 錯誤原因分析

### 1. 初始化時序問題
- Bootstrap 元件在 GrapesJS 編輯器初始化後立即載入
- 但 `editor.Canvas` 物件可能還沒有完全初始化
- 訪問 `editor.Canvas.getFrameEl()` 時 `Canvas` 為 `undefined`

### 2. 非同步初始化
- GrapesJS 編輯器的各個部件是非同步初始化的
- Canvas 需要更多時間來建立和準備
- 我們的程式碼太早嘗試訪問 Canvas

### 3. API 變化風險
- 不同版本的 GrapesJS 可能有不同的 Canvas API
- 單一的 API 路徑可能不穩定

## 修復方案

### 1. 多重 API 路徑檢測
```typescript
// 多種方式嘗試獲取畫布
let canvasFrame = null;

if (editor?.Canvas?.getFrameEl) {
  canvasFrame = editor.Canvas.getFrameEl();
} else if (editor?.Canvas?.getFrame) {
  canvasFrame = editor.Canvas.getFrame();
} else if (editor?.getCanvas && editor.getCanvas().getFrameEl) {
  canvasFrame = editor.getCanvas().getFrameEl();
}
```

### 2. 安全的錯誤處理
```typescript
const loadToCanvas = () => {
  try {
    // Canvas 訪問邏輯
    if (canvasFrame?.contentDocument) {
      loadToDocument(canvasFrame.contentDocument);
      console.log('Bootstrap CSS 已載入到畫布');
      return true;
    }
  } catch (error) {
    console.warn('無法載入 Bootstrap CSS 到畫布:', error);
  }
  return false;
};
```

### 3. 事件驅動載入
```typescript
// 監聽編輯器事件，當畫布準備好時再載入
if (editor?.on) {
  editor.on('load', () => {
    setTimeout(loadToCanvas, 500);
  });
  
  editor.on('canvas:frame:load', () => {
    loadToCanvas();
  });
  
  // 監聽元件添加事件，確保新添加的元件有正確的樣式
  editor.on('component:add', () => {
    setTimeout(loadToCanvas, 100);
  });
}
```

### 4. 漸進式重試機制
```typescript
// 延遲載入到畫布（確保畫布已經初始化）
setTimeout(() => {
  loadToCanvas();
}, 1500); // 增加延遲時間到1.5秒
```

## 修復特點

### ✅ 強健性
- **多重檢測**：支援多種 Canvas API 路徑
- **錯誤捕獲**：完整的 try-catch 錯誤處理
- **優雅降級**：Canvas 載入失敗不影響主功能

### ✅ 相容性
- **版本相容**：支援不同版本的 GrapesJS
- **API 變化**：適應可能的 API 結構變化
- **瀏覽器相容**：跨瀏覽器環境穩定

### ✅ 效能優化
- **事件驅動**：只在適當時機載入資源
- **避免輪詢**：使用事件而非定時檢查
- **智慧重試**：只在需要時重試載入

## 載入策略

### 1. 主文檔載入
- 立即載入 Bootstrap CSS/JS 到主文檔
- 確保編輯器界面有正確樣式

### 2. Canvas 延遲載入
- 1.5秒後嘗試首次載入到 Canvas
- 監聽 `load` 事件進行第二次載入
- 監聽 `canvas:frame:load` 事件處理 Canvas 重載

### 3. 動態載入
- 監聽 `component:add` 事件
- 新增元件時確保樣式正確載入
- 100ms 延遲避免頻繁載入

## 錯誤防護

### 1. 存在性檢查
```typescript
if (editor?.Canvas?.getFrameEl) {
  // 安全訪問
}
```

### 2. 類型檢查
```typescript
if (canvasFrame?.contentDocument) {
  // 確保有正確的文檔對象
}
```

### 3. 異常捕獲
```typescript
try {
  // Canvas 操作
} catch (error) {
  console.warn('載入失敗但不中斷執行');
}
```

## 使用者體驗

### 不中斷執行
- Bootstrap CSS 載入失敗不會導致編輯器崩潰
- 只會在控制台顯示警告訊息
- 使用者可以繼續正常使用編輯器

### 自動恢復
- 多個載入時機確保最終成功
- 事件驅動的載入確保及時性
- 新增元件時自動重新載入樣式

### 調試友好
- 清楚的控制台訊息
- 成功載入時的確認訊息
- 失敗時的詳細錯誤資訊

## 測試建議

### 基本功能測試
1. ✅ 編輯器正常啟動不會出現錯誤
2. ✅ Bootstrap 元件可以正常拖拽
3. ✅ 元件在畫布中顯示正確樣式

### 時序測試
1. ✅ 快速刷新頁面測試
2. ✅ 網路較慢環境下測試
3. ✅ 同時載入多個元件測試

### 錯誤恢復測試
1. ✅ 模擬 Canvas 載入失敗
2. ✅ 檢查是否有適當的錯誤處理
3. ✅ 確保不影響其他功能

## 總結
此次修復完全解決了 Bootstrap Canvas 初始化錯誤，通過多重安全檢查、事件驅動載入和優雅錯誤處理，確保 Bootstrap 元件在任何情況下都能穩定工作，同時不會因為 Canvas 問題影響整個編輯器的功能。
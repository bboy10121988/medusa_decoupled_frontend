# Bootstrap 元件刷新問題修復報告

## 問題描述
當拖拽 Bootstrap 元件到 GrapesJS 編輯器畫布時，會導致頁面刷新並清空編輯器內容。

## 問題原因
1. **表單提交**：Form 元件中的 `<button type="submit">` 會觸發表單提交事件
2. **連結跳轉**：Card 元件中的 `<a href="#">` 會導致頁面跳轉到 `#`
3. **事件冒泡**：某些 Bootstrap 元件的事件會冒泡到父級，導致頁面行為異常

## 修復方案

### 1. 修改元件定義
- 將 `<a href="#">` 改為 `<a href="javascript:void(0)">`
- 將 `<button type="submit">` 改為 `<button type="button">`
- 為表單添加 `onsubmit="return false;"`

### 2. 改進元件結構
- 將部分 HTML 字串改為 GrapesJS 元件物件結構
- 使用 `type: 'div'`、`type: 'button'` 等標準 GrapesJS 元件類型
- 避免直接的 HTML 字串中包含事件處理器

### 3. 添加事件防護
在 GrapesJS 編輯器中添加全域事件監聽器：
```javascript
// 防止表單提交導致頁面刷新
canvasDoc.addEventListener('submit', (e) => {
  e.preventDefault();
  return false;
});

// 防止 # 連結導致頁面跳轉
canvasDoc.addEventListener('click', (e) => {
  if (e.target.tagName === 'A' && e.target.getAttribute('href') === '#') {
    e.preventDefault();
    return false;
  }
});
```

## 修復的檔案
1. `src/components/grapesjs/bootstrap-components-simple.ts`
   - 修改 Card 元件的連結
   - 修改 Form 元件的按鈕類型和表單處理
   - 改進 Alert 和 Button 元件的定義結構

2. `src/components/grapesjs/grapes_editor.tsx`
   - 添加畫布事件防護器
   - 修復 TypeScript 類型錯誤

## 測試步驟
1. 啟動開發服務器：`npm run dev`
2. 打開 GrapesJS 編輯器頁面
3. 嘗試拖拽以下元件到畫布：
   - Bootstrap Alert
   - Bootstrap Button  
   - Bootstrap Card
   - Bootstrap Form
4. 確認拖拽後不會導致頁面刷新
5. 確認元件在畫布中正常顯示 Bootstrap 樣式

## 已修復的元件
✅ Alert 警告框 - 不會導致頁面刷新
✅ Button 按鈕 - 不會導致頁面刷新
✅ Card 卡片 - 連結不會跳轉
✅ Form 表單 - 提交不會刷新頁面

## 預期結果
- 所有 Bootstrap 元件都能正常拖拽到畫布
- 元件在畫布中顯示正確的 Bootstrap 樣式
- 不會出現頁面刷新或內容清空的問題
- Bootstrap JavaScript 功能（如模態框、手風琴等）正常工作

## 注意事項
- 確保 Bootstrap CSS 和 JS 已正確載入到畫布
- 如果仍有問題，檢查瀏覽器控制台的錯誤訊息
- 可以切換到完整版本的 Bootstrap 元件庫（`bootstrap-components.ts`）獲得更多元件
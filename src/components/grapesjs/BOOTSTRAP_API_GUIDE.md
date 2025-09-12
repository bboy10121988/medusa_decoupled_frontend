# Bootstrap 5.3.8 元件 API 總覽

此專案已成功整合 Bootstrap 5.3.8，並提供完整的元件庫 API 參考。

## 📁 檔案結構

```
src/components/grapesjs/
├── bootstrap-components-api.ts    # Bootstrap API 完整參考
├── grapes_editor.tsx             # GrapesJS 編輯器主檔案
├── ReactStudioEditor.tsx         # React Studio 編輯器
├── grapes-editor.css            # 編輯器樣式
└── responsive-editor.css        # 響應式編輯器樣式
```

## 🎯 可用的 Bootstrap JavaScript 元件

### 1. Alert (警告框)
- **API**: `AlertAPI`
- **初始化**: `new bootstrap.Alert(element)`
- **方法**: `close()`, `dispose()`
- **事件**: `close.bs.alert`, `closed.bs.alert`

### 2. Button (按鈕)
- **API**: `ButtonAPI`
- **初始化**: `new bootstrap.Button(element)`
- **方法**: `toggle()`, `dispose()`

### 3. Carousel (輪播圖)
- **API**: `CarouselAPI`
- **初始化**: `new bootstrap.Carousel(element, options)`
- **選項**: `interval`, `keyboard`, `pause`, `ride`, `wrap`, `touch`
- **方法**: `cycle()`, `pause()`, `prev()`, `next()`, `to(index)`
- **事件**: `slide.bs.carousel`, `slid.bs.carousel`

### 4. Collapse (摺疊/手風琴)
- **API**: `CollapseAPI`
- **初始化**: `new bootstrap.Collapse(element, options)`
- **選項**: `parent`, `toggle`
- **方法**: `toggle()`, `show()`, `hide()`
- **事件**: `show.bs.collapse`, `shown.bs.collapse`, `hide.bs.collapse`, `hidden.bs.collapse`

### 5. Dropdown (下拉選單)
- **API**: `DropdownAPI`
- **初始化**: `new bootstrap.Dropdown(element, options)`
- **選項**: `boundary`, `reference`, `display`, `offset`, `autoClose`, `popperConfig`
- **方法**: `toggle()`, `show()`, `hide()`, `update()`
- **事件**: `show.bs.dropdown`, `shown.bs.dropdown`, `hide.bs.dropdown`, `hidden.bs.dropdown`

### 6. Modal (模態框)
- **API**: `ModalAPI`
- **初始化**: `new bootstrap.Modal(element, options)`
- **選項**: `backdrop`, `keyboard`, `focus`
- **方法**: `toggle()`, `show()`, `hide()`, `handleUpdate()`
- **事件**: `show.bs.modal`, `shown.bs.modal`, `hide.bs.modal`, `hidden.bs.modal`, `hidePrevented.bs.modal`

### 7. Offcanvas (側邊欄)
- **API**: `OffcanvasAPI`
- **初始化**: `new bootstrap.Offcanvas(element, options)`
- **選項**: `backdrop`, `keyboard`, `scroll`
- **方法**: `toggle()`, `show()`, `hide()`
- **事件**: `show.bs.offcanvas`, `shown.bs.offcanvas`, `hide.bs.offcanvas`, `hidden.bs.offcanvas`

### 8. Toast (吐司通知)
- **API**: `ToastAPI`
- **初始化**: `new bootstrap.Toast(element, options)`
- **選項**: `animation`, `autohide`, `delay`
- **方法**: `show()`, `hide()`, `isShown()`
- **事件**: `show.bs.toast`, `shown.bs.toast`, `hide.bs.toast`, `hidden.bs.toast`

### 9. Tooltip (工具提示)
- **API**: `TooltipAPI`
- **初始化**: `new bootstrap.Tooltip(element, options)`
- **選項**: `animation`, `container`, `delay`, `html`, `placement`, `title`, `trigger`, 等等
- **方法**: `show()`, `hide()`, `toggle()`, `enable()`, `disable()`, `update()`
- **事件**: `show.bs.tooltip`, `shown.bs.tooltip`, `hide.bs.tooltip`, `hidden.bs.tooltip`, `inserted.bs.tooltip`

## 🎨 CSS 元件

### 基礎元件
- **Alert**: `alert`, `alert-*` (primary, secondary, success, danger, warning, info, light, dark)
- **Badge**: `badge`, `bg-*`, `rounded-pill`
- **Button**: `btn`, `btn-*`, `btn-outline-*`, `btn-lg`, `btn-sm`
- **Card**: `card`, `card-header`, `card-body`, `card-footer`, `card-title`, `card-text`

### 表單元件
- **Form Control**: `form-control`, `form-label`, `form-text`, `form-select`
- **Form Check**: `form-check`, `form-check-input`, `form-check-label`, `form-switch`
- **Input Group**: `input-group`, `input-group-text`
- **Validation**: `is-valid`, `is-invalid`, `valid-feedback`, `invalid-feedback`

### 導航元件
- **Nav**: `nav`, `nav-tabs`, `nav-pills`, `nav-item`, `nav-link`
- **Navbar**: `navbar`, `navbar-brand`, `navbar-nav`, `navbar-toggler`
- **Breadcrumb**: `breadcrumb`, `breadcrumb-item`
- **Pagination**: `pagination`, `page-item`, `page-link`

### 其他元件
- **List Group**: `list-group`, `list-group-item`, `list-group-item-action`
- **Progress**: `progress`, `progress-bar`, `progress-bar-striped`, `progress-bar-animated`
- **Spinner**: `spinner-border`, `spinner-grow`
- **Table**: `table`, `table-striped`, `table-hover`, `table-bordered`

## 📋 使用方式

### 1. 匯入 API 參考
```typescript
import BootstrapAPI, { CarouselAPI, ModalAPI, TooltipAPI } from './bootstrap-components-api';
```

### 2. 初始化元件
```javascript
// 輪播圖
const carousel = new bootstrap.Carousel(document.getElementById('myCarousel'), {
  interval: 3000,
  wrap: true
});

// 模態框
const modal = new bootstrap.Modal(document.getElementById('myModal'));
modal.show();

// 工具提示（批量初始化）
const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
const tooltipList = tooltipTriggerList.map(el => new bootstrap.Tooltip(el));
```

### 3. 事件監聽
```javascript
// 監聽模態框事件
document.getElementById('myModal').addEventListener('shown.bs.modal', function () {
  console.log('模態框已顯示');
});

// 監聽輪播圖事件
document.getElementById('myCarousel').addEventListener('slid.bs.carousel', function () {
  console.log('輪播完成');
});
```

## 🔗 載入方式

專案使用 CDN 載入 Bootstrap：
- **CSS**: `https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css`
- **JS**: `https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js`

## 📖 參考資源

- [Bootstrap 5.3 官方文件](https://getbootstrap.com/docs/5.3/)
- [Bootstrap JavaScript API](https://getbootstrap.com/docs/5.3/getting-started/javascript/)
- [Bootstrap CSS Classes](https://getbootstrap.com/docs/5.3/utilities/api/)

---

**專案狀態**: ✅ Bootstrap 已成功整合並可正常使用
**最後更新**: 2025年9月12日
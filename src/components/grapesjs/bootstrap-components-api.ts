/**
 * Bootstrap 5.3.8 元件 API 參考
 * 
 * 這個文件提供 Bootstrap 所有元件的完整 API 參考
 * 分為 JavaScript 元件和 CSS 元件兩大類
 */

// ============================================
// Bootstrap JavaScript 元件 API
// ============================================

/**
 * Alert 警告框元件
 */
export const AlertAPI = {
  // 初始化
  init: 'new bootstrap.Alert(element)',
  
  // 實例方法
  methods: {
    close: '關閉警告框',
    dispose: '銷毀實例'
  },
  
  // 靜態方法
  static: {
    getInstance: '獲取實例',
    getOrCreateInstance: '獲取或創建實例'
  },
  
  // 事件
  events: {
    'close.bs.alert': '關閉前觸發',
    'closed.bs.alert': '關閉後觸發'
  },
  
  // HTML 結構
  html: `
    <div class="alert alert-warning alert-dismissible fade show" role="alert">
      <strong>警告！</strong> 這是一個警告訊息。
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  `
};

/**
 * Button 按鈕元件
 */
export const ButtonAPI = {
  // 初始化
  init: 'new bootstrap.Button(element)',
  
  // 實例方法
  methods: {
    toggle: '切換按鈕狀態',
    dispose: '銷毀實例'
  },
  
  // HTML 結構
  html: `
    <button type="button" class="btn btn-primary" data-bs-toggle="button">
      切換按鈕
    </button>
  `
};

/**
 * Carousel 輪播圖元件
 */
export const CarouselAPI = {
  // 初始化
  init: 'new bootstrap.Carousel(element, options)',
  
  // 配置選項
  options: {
    interval: '自動播放間隔（毫秒），預設 5000，false 則不自動播放',
    keyboard: '是否響應鍵盤事件，預設 true',
    pause: '滑鼠懸停時是否暫停，預設 "hover"',
    ride: '是否自動開始播放，預設 false',
    wrap: '是否循環播放，預設 true',
    touch: '是否支援觸控滑動，預設 true'
  },
  
  // 實例方法
  methods: {
    cycle: '開始自動播放',
    pause: '暫停自動播放',
    prev: '上一張',
    next: '下一張',
    nextWhenVisible: '當可見時播放下一張',
    to: '跳轉到指定索引 carousel.to(index)',
    dispose: '銷毀實例'
  },
  
  // 事件
  events: {
    'slide.bs.carousel': '滑動開始前觸發',
    'slid.bs.carousel': '滑動完成後觸發'
  },
  
  // HTML 結構
  html: `
    <div id="myCarousel" class="carousel slide" data-bs-ride="carousel">
      <div class="carousel-indicators">
        <button type="button" data-bs-target="#myCarousel" data-bs-slide-to="0" class="active"></button>
        <button type="button" data-bs-target="#myCarousel" data-bs-slide-to="1"></button>
      </div>
      <div class="carousel-inner">
        <div class="carousel-item active">
          <img src="..." class="d-block w-100" alt="...">
        </div>
        <div class="carousel-item">
          <img src="..." class="d-block w-100" alt="...">
        </div>
      </div>
      <button class="carousel-control-prev" type="button" data-bs-target="#myCarousel" data-bs-slide="prev">
        <span class="carousel-control-prev-icon"></span>
      </button>
      <button class="carousel-control-next" type="button" data-bs-target="#myCarousel" data-bs-slide="next">
        <span class="carousel-control-next-icon"></span>
      </button>
    </div>
  `
};

/**
 * Collapse 摺疊/手風琴元件
 */
export const CollapseAPI = {
  // 初始化
  init: 'new bootstrap.Collapse(element, options)',
  
  // 配置選項
  options: {
    parent: '父容器選擇器，用於手風琴效果',
    toggle: '初始化時是否切換狀態，預設 true'
  },
  
  // 實例方法
  methods: {
    toggle: '切換顯示/隱藏',
    show: '顯示內容',
    hide: '隱藏內容',
    dispose: '銷毀實例'
  },
  
  // 事件
  events: {
    'show.bs.collapse': '展開前觸發',
    'shown.bs.collapse': '展開後觸發',
    'hide.bs.collapse': '收合前觸發',
    'hidden.bs.collapse': '收合後觸發'
  },
  
  // HTML 結構
  html: `
    <button class="btn btn-primary" type="button" data-bs-toggle="collapse" data-bs-target="#collapseExample">
      按鈕
    </button>
    <div class="collapse" id="collapseExample">
      <div class="card card-body">
        摺疊內容
      </div>
    </div>
  `
};

/**
 * Dropdown 下拉選單元件
 */
export const DropdownAPI = {
  // 初始化
  init: 'new bootstrap.Dropdown(element, options)',
  
  // 配置選項
  options: {
    boundary: '邊界約束，預設 "clippingParents"',
    reference: '參考元素，預設 "toggle"',
    display: '顯示方式，預設 "dynamic"',
    offset: '偏移量 [x, y]',
    autoClose: '自動關閉設定，預設 true',
    popperConfig: 'Popper.js 配置'
  },
  
  // 實例方法
  methods: {
    toggle: '切換顯示/隱藏',
    show: '顯示下拉選單',
    hide: '隱藏下拉選單',
    update: '更新位置',
    dispose: '銷毀實例'
  },
  
  // 事件
  events: {
    'show.bs.dropdown': '顯示前觸發',
    'shown.bs.dropdown': '顯示後觸發',
    'hide.bs.dropdown': '隱藏前觸發',
    'hidden.bs.dropdown': '隱藏後觸發'
  },
  
  // HTML 結構
  html: `
    <div class="dropdown">
      <button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
        下拉選單
      </button>
      <ul class="dropdown-menu">
        <li><a class="dropdown-item" href="#">項目 1</a></li>
        <li><a class="dropdown-item" href="#">項目 2</a></li>
        <li><hr class="dropdown-divider"></li>
        <li><a class="dropdown-item" href="#">項目 3</a></li>
      </ul>
    </div>
  `
};

/**
 * Modal 模態框元件
 */
export const ModalAPI = {
  // 初始化
  init: 'new bootstrap.Modal(element, options)',
  
  // 配置選項
  options: {
    backdrop: '背景遮罩，預設 true',
    keyboard: 'ESC 鍵關閉，預設 true',
    focus: '自動聚焦，預設 true'
  },
  
  // 實例方法
  methods: {
    toggle: '切換顯示/隱藏',
    show: '顯示模態框',
    hide: '隱藏模態框',
    handleUpdate: '更新位置',
    dispose: '銷毀實例'
  },
  
  // 事件
  events: {
    'show.bs.modal': '顯示前觸發',
    'shown.bs.modal': '顯示後觸發',
    'hide.bs.modal': '隱藏前觸發',
    'hidden.bs.modal': '隱藏後觸發',
    'hidePrevented.bs.modal': '阻止隱藏時觸發'
  },
  
  // HTML 結構
  html: `
    <div class="modal fade" id="exampleModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">模態框標題</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            模態框內容
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">關閉</button>
            <button type="button" class="btn btn-primary">儲存</button>
          </div>
        </div>
      </div>
    </div>
  `
};

/**
 * Offcanvas 側邊欄元件
 */
export const OffcanvasAPI = {
  // 初始化
  init: 'new bootstrap.Offcanvas(element, options)',
  
  // 配置選項
  options: {
    backdrop: '背景遮罩，預設 true',
    keyboard: 'ESC 鍵關閉，預設 true',
    scroll: '允許背景滾動，預設 false'
  },
  
  // 實例方法
  methods: {
    toggle: '切換顯示/隱藏',
    show: '顯示側邊欄',
    hide: '隱藏側邊欄',
    dispose: '銷毀實例'
  },
  
  // 事件
  events: {
    'show.bs.offcanvas': '顯示前觸發',
    'shown.bs.offcanvas': '顯示後觸發',
    'hide.bs.offcanvas': '隱藏前觸發',
    'hidden.bs.offcanvas': '隱藏後觸發'
  },
  
  // HTML 結構
  html: `
    <div class="offcanvas offcanvas-start" tabindex="-1" id="offcanvasExample">
      <div class="offcanvas-header">
        <h5 class="offcanvas-title">側邊欄標題</h5>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
      </div>
      <div class="offcanvas-body">
        側邊欄內容
      </div>
    </div>
  `
};

/**
 * Toast 吐司通知元件
 */
export const ToastAPI = {
  // 初始化
  init: 'new bootstrap.Toast(element, options)',
  
  // 配置選項
  options: {
    animation: '動畫效果，預設 true',
    autohide: '自動隱藏，預設 true',
    delay: '延遲時間（毫秒），預設 5000'
  },
  
  // 實例方法
  methods: {
    show: '顯示通知',
    hide: '隱藏通知',
    isShown: '檢查是否顯示',
    dispose: '銷毀實例'
  },
  
  // 事件
  events: {
    'show.bs.toast': '顯示前觸發',
    'shown.bs.toast': '顯示後觸發',
    'hide.bs.toast': '隱藏前觸發',
    'hidden.bs.toast': '隱藏後觸發'
  },
  
  // HTML 結構
  html: `
    <div class="toast" role="alert">
      <div class="toast-header">
        <strong class="me-auto">通知標題</strong>
        <small>剛剛</small>
        <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
      </div>
      <div class="toast-body">
        通知內容
      </div>
    </div>
  `
};

/**
 * Tooltip 工具提示元件
 */
export const TooltipAPI = {
  // 初始化
  init: 'new bootstrap.Tooltip(element, options)',
  
  // 配置選項
  options: {
    animation: '動畫效果，預設 true',
    container: '容器元素',
    delay: '延遲顯示/隱藏（毫秒）',
    html: '是否允許 HTML 內容，預設 false',
    placement: '位置 top|bottom|left|right|auto，預設 top',
    selector: '委派選擇器',
    template: 'HTML 模板',
    title: '提示文字內容',
    trigger: '觸發方式 click|hover|focus|manual，預設 hover focus',
    offset: '偏移量 [x, y]',
    boundary: '邊界約束',
    customClass: '自定義 CSS 類名',
    sanitize: '清理 HTML 內容，預設 true',
    popperConfig: 'Popper.js 配置'
  },
  
  // 實例方法
  methods: {
    show: '顯示提示',
    hide: '隱藏提示',
    toggle: '切換提示',
    enable: '啟用提示',
    disable: '禁用提示',
    toggleEnabled: '切換啟用狀態',
    update: '更新位置',
    dispose: '銷毀實例'
  },
  
  // 事件
  events: {
    'show.bs.tooltip': '顯示前觸發',
    'shown.bs.tooltip': '顯示後觸發',
    'hide.bs.tooltip': '隱藏前觸發',
    'hidden.bs.tooltip': '隱藏後觸發',
    'inserted.bs.tooltip': '插入到 DOM 後觸發'
  },
  
  // HTML 結構
  html: `
    <button type="button" class="btn btn-secondary" data-bs-toggle="tooltip" data-bs-placement="top" title="提示文字">
      懸停看提示
    </button>
  `
};

// ============================================
// CSS 元件（不需要 JavaScript）
// ============================================

/**
 * CSS 元件類名參考
 */
export const CSSComponents = {
  // 警告框
  alert: {
    base: 'alert',
    variants: [
      'alert-primary', 'alert-secondary', 'alert-success', 'alert-danger',
      'alert-warning', 'alert-info', 'alert-light', 'alert-dark'
    ],
    dismissible: 'alert-dismissible',
    fade: 'fade show'
  },
  
  // 徽章
  badge: {
    base: 'badge',
    colors: [
      'bg-primary', 'bg-secondary', 'bg-success', 'bg-danger',
      'bg-warning', 'bg-info', 'bg-light', 'bg-dark'
    ],
    pill: 'rounded-pill'
  },
  
  // 按鈕
  button: {
    base: 'btn',
    variants: [
      'btn-primary', 'btn-secondary', 'btn-success', 'btn-danger',
      'btn-warning', 'btn-info', 'btn-light', 'btn-dark', 'btn-link'
    ],
    outline: [
      'btn-outline-primary', 'btn-outline-secondary', 'btn-outline-success',
      'btn-outline-danger', 'btn-outline-warning', 'btn-outline-info',
      'btn-outline-light', 'btn-outline-dark'
    ],
    sizes: ['btn-lg', 'btn-sm'],
    states: ['active', 'disabled'],
    group: 'btn-group',
    toolbar: 'btn-toolbar'
  },
  
  // 卡片
  card: {
    base: 'card',
    header: 'card-header',
    body: 'card-body',
    footer: 'card-footer',
    title: 'card-title',
    subtitle: 'card-subtitle',
    text: 'card-text',
    link: 'card-link',
    image: ['card-img-top', 'card-img-bottom'],
    overlay: 'card-img-overlay',
    group: 'card-group'
  },
  
  // 表單
  form: {
    group: 'mb-3',
    control: 'form-control',
    label: 'form-label',
    text: 'form-text',
    select: 'form-select',
    check: 'form-check',
    checkInput: 'form-check-input',
    checkLabel: 'form-check-label',
    switch: 'form-switch',
    range: 'form-range',
    floating: 'form-floating',
    validation: {
      valid: 'is-valid',
      invalid: 'is-invalid',
      feedback: ['valid-feedback', 'invalid-feedback']
    }
  },
  
  // 列表群組
  listGroup: {
    base: 'list-group',
    item: 'list-group-item',
    active: 'active',
    disabled: 'disabled',
    action: 'list-group-item-action',
    variants: [
      'list-group-item-primary', 'list-group-item-secondary',
      'list-group-item-success', 'list-group-item-danger',
      'list-group-item-warning', 'list-group-item-info',
      'list-group-item-light', 'list-group-item-dark'
    ],
    flush: 'list-group-flush',
    horizontal: 'list-group-horizontal'
  },
  
  // 導航
  nav: {
    base: 'nav',
    item: 'nav-item',
    link: 'nav-link',
    active: 'active',
    disabled: 'disabled',
    tabs: 'nav-tabs',
    pills: 'nav-pills',
    fill: 'nav-fill',
    justified: 'nav-justified'
  },
  
  // 分頁
  pagination: {
    base: 'pagination',
    item: 'page-item',
    link: 'page-link',
    active: 'active',
    disabled: 'disabled',
    sizes: ['pagination-lg', 'pagination-sm']
  },
  
  // 進度條
  progress: {
    base: 'progress',
    bar: 'progress-bar',
    striped: 'progress-bar-striped',
    animated: 'progress-bar-animated',
    colors: [
      'bg-primary', 'bg-secondary', 'bg-success', 'bg-danger',
      'bg-warning', 'bg-info', 'bg-light', 'bg-dark'
    ]
  },
  
  // 載入器
  spinner: {
    border: 'spinner-border',
    grow: 'spinner-grow',
    sizes: ['spinner-border-sm', 'spinner-grow-sm'],
    colors: [
      'text-primary', 'text-secondary', 'text-success', 'text-danger',
      'text-warning', 'text-info', 'text-light', 'text-dark'
    ]
  },
  
  // 表格
  table: {
    base: 'table',
    variants: [
      'table-primary', 'table-secondary', 'table-success', 'table-danger',
      'table-warning', 'table-info', 'table-light', 'table-dark'
    ],
    striped: 'table-striped',
    hover: 'table-hover',
    bordered: 'table-bordered',
    borderless: 'table-borderless',
    small: 'table-sm',
    responsive: 'table-responsive'
  }
};

// ============================================
// 使用範例
// ============================================

/**
 * JavaScript 元件使用範例
 */
export const UsageExamples = {
  // 輪播圖
  carousel: `
    // 基本初始化
    const carousel = new bootstrap.Carousel(document.getElementById('myCarousel'));
    
    // 帶選項初始化
    const carousel = new bootstrap.Carousel(document.getElementById('myCarousel'), {
      interval: 3000,
      wrap: true,
      touch: true
    });
    
    // 控制方法
    carousel.next();        // 下一張
    carousel.prev();        // 上一張
    carousel.to(2);         // 跳到第3張
    carousel.cycle();       // 開始自動播放
    carousel.pause();       // 暫停
  `,
  
  // 模態框
  modal: `
    // 初始化
    const modal = new bootstrap.Modal(document.getElementById('myModal'), {
      backdrop: 'static',
      keyboard: false
    });
    
    // 顯示/隱藏
    modal.show();
    modal.hide();
    modal.toggle();
    
    // 事件監聽
    document.getElementById('myModal').addEventListener('shown.bs.modal', function () {
      console.log('模態框已顯示');
    });
  `,
  
  // 工具提示批量初始化
  tooltip: `
    // 批量初始化所有工具提示
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl);
    });
  `,
  
  // 吐司通知
  toast: `
    // 初始化並顯示
    const toastEl = document.getElementById('myToast');
    const toast = new bootstrap.Toast(toastEl);
    toast.show();
    
    // 自動顯示所有吐司
    const toastElList = [].slice.call(document.querySelectorAll('.toast'));
    const toastList = toastElList.map(function (toastEl) {
      return new bootstrap.Toast(toastEl);
    });
    toastList.forEach(toast => toast.show());
  `
};

// 導出所有 API
export default {
  AlertAPI,
  ButtonAPI,
  CarouselAPI,
  CollapseAPI,
  DropdownAPI,
  ModalAPI,
  OffcanvasAPI,
  ToastAPI,
  TooltipAPI,
  CSSComponents,
  UsageExamples
};
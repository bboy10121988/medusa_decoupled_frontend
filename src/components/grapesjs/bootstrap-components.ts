/**
 * Bootstrap 元件庫 - 為 GrapesJS 編輯器提供 Bootstrap 5.3.8 元件
 */

// @ts-nocheck
export default function addBootstrapComponents(editor: any) {
  const blockManager = editor.BlockManager;
  
  // 確保 Bootstrap CSS 和 JS 已載入
  const loadBootstrap = () => {
    // 載入 Bootstrap CSS
    if (!document.querySelector('link[href*="bootstrap"]')) {
      const bootstrapCSS = document.createElement('link');
      bootstrapCSS.rel = 'stylesheet';
      bootstrapCSS.href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css';
      document.head.appendChild(bootstrapCSS);
    }
    
    // 載入 Bootstrap JS
    if (!document.querySelector('script[src*="bootstrap"]')) {
      const bootstrapJS = document.createElement('script');
      bootstrapJS.src = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js';
      document.head.appendChild(bootstrapJS);
    }
    
    // 載入 Font Awesome 圖標
    if (!document.querySelector('link[href*="font-awesome"]')) {
      const fontAwesome = document.createElement('link');
      fontAwesome.rel = 'stylesheet';
      fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
      document.head.appendChild(fontAwesome);
    }
  };
  
  // 執行載入
  loadBootstrap();

  // ============================================
  // Bootstrap 元件定義
  // ============================================

  // 1. Alert 警告框
  blockManager.add('bootstrap-alert', {
    label: 'Alert',
    category: 'Bootstrap',
    content: `
      <div class="alert alert-primary alert-dismissible fade show" role="alert">
        <strong>注意！</strong> 這是一個重要的警告訊息。
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    `,
    attributes: {
      class: 'fa fa-exclamation-triangle'
    }
  });

  // 2. Button 按鈕
  blockManager.add('bootstrap-button', {
    label: 'Button',
    category: 'Bootstrap',
    content: `
      <button type="button" class="btn btn-primary">主要按鈕</button>
    `,
    attributes: {
      class: 'fa fa-hand-pointer'
    }
  });

  // 3. Button Group 按鈕群組
  blockManager.add('bootstrap-button-group', {
    label: 'Button Group',
    category: 'Bootstrap',
    content: `
      <div class="btn-group" role="group" aria-label="Basic example">
        <button type="button" class="btn btn-primary">左</button>
        <button type="button" class="btn btn-primary">中</button>
        <button type="button" class="btn btn-primary">右</button>
      </div>
    `,
    attributes: {
      class: 'fa fa-object-group'
    }
  });

  // 4. Card 卡片
  blockManager.add('bootstrap-card', {
    label: 'Card',
    category: 'Bootstrap',
    content: `
      <div class="card" style="width: 18rem;">
        <img src="https://via.placeholder.com/400x200" class="card-img-top" alt="卡片圖片">
        <div class="card-body">
          <h5 class="card-title">卡片標題</h5>
          <p class="card-text">這是卡片的內容描述，可以放置任何需要的文字內容。</p>
          <a href="#" class="btn btn-primary">前往連結</a>
        </div>
      </div>
    `,
    attributes: {
      class: 'fa fa-credit-card'
    }
  });

  // 5. Carousel 輪播圖
  blockManager.add('bootstrap-carousel', {
    label: 'Carousel',
    category: 'Bootstrap',
    content: `
      <div id="carouselExample" class="carousel slide" data-bs-ride="carousel">
        <div class="carousel-indicators">
          <button type="button" data-bs-target="#carouselExample" data-bs-slide-to="0" class="active" aria-current="true" aria-label="Slide 1"></button>
          <button type="button" data-bs-target="#carouselExample" data-bs-slide-to="1" aria-label="Slide 2"></button>
          <button type="button" data-bs-target="#carouselExample" data-bs-slide-to="2" aria-label="Slide 3"></button>
        </div>
        <div class="carousel-inner">
          <div class="carousel-item active">
            <img src="https://via.placeholder.com/800x400/007bff/ffffff?text=第一張" class="d-block w-100" alt="第一張">
            <div class="carousel-caption d-none d-md-block">
              <h5>第一張標題</h5>
              <p>第一張圖片的描述內容。</p>
            </div>
          </div>
          <div class="carousel-item">
            <img src="https://via.placeholder.com/800x400/28a745/ffffff?text=第二張" class="d-block w-100" alt="第二張">
            <div class="carousel-caption d-none d-md-block">
              <h5>第二張標題</h5>
              <p>第二張圖片的描述內容。</p>
            </div>
          </div>
          <div class="carousel-item">
            <img src="https://via.placeholder.com/800x400/dc3545/ffffff?text=第三張" class="d-block w-100" alt="第三張">
            <div class="carousel-caption d-none d-md-block">
              <h5>第三張標題</h5>
              <p>第三張圖片的描述內容。</p>
            </div>
          </div>
        </div>
        <button class="carousel-control-prev" type="button" data-bs-target="#carouselExample" data-bs-slide="prev">
          <span class="carousel-control-prev-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Previous</span>
        </button>
        <button class="carousel-control-next" type="button" data-bs-target="#carouselExample" data-bs-slide="next">
          <span class="carousel-control-next-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Next</span>
        </button>
      </div>
    `,
    attributes: {
      class: 'fa fa-images'
    }
  });

  // 6. Accordion 手風琴
  blockManager.add('bootstrap-accordion', {
    label: 'Accordion',
    category: 'Bootstrap',
    content: `
      <div class="accordion" id="accordionExample">
        <div class="accordion-item">
          <h2 class="accordion-header">
            <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
              第一個項目
            </button>
          </h2>
          <div id="collapseOne" class="accordion-collapse collapse show" data-bs-parent="#accordionExample">
            <div class="accordion-body">
              這是第一個手風琴項目的內容。您可以在這裡添加任何文字、圖片或其他元素。
            </div>
          </div>
        </div>
        <div class="accordion-item">
          <h2 class="accordion-header">
            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
              第二個項目
            </button>
          </h2>
          <div id="collapseTwo" class="accordion-collapse collapse" data-bs-parent="#accordionExample">
            <div class="accordion-body">
              這是第二個手風琴項目的內容。每個項目都可以獨立展開和收合。
            </div>
          </div>
        </div>
        <div class="accordion-item">
          <h2 class="accordion-header">
            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
              第三個項目
            </button>
          </h2>
          <div id="collapseThree" class="accordion-collapse collapse" data-bs-parent="#accordionExample">
            <div class="accordion-body">
              這是第三個手風琴項目的內容。手風琴是展示FAQ或分組內容的好方式。
            </div>
          </div>
        </div>
      </div>
    `,
    attributes: {
      class: 'fa fa-list'
    }
  });

  // 7. Modal 模態框
  blockManager.add('bootstrap-modal', {
    label: 'Modal',
    category: 'Bootstrap',
    content: `
      <div>
        <!-- 觸發按鈕 -->
        <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModal">
          打開模態框
        </button>

        <!-- 模態框 -->
        <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h1 class="modal-title fs-5" id="exampleModalLabel">模態框標題</h1>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                這裡是模態框的內容。您可以在這裡放置任何需要的內容，如表單、圖片或文字。
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">關閉</button>
                <button type="button" class="btn btn-primary">確認</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,
    attributes: {
      class: 'fa fa-window-maximize'
    }
  });

  // 8. Dropdown 下拉選單
  blockManager.add('bootstrap-dropdown', {
    label: 'Dropdown',
    category: 'Bootstrap',
    content: `
      <div class="dropdown">
        <button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
          下拉選單
        </button>
        <ul class="dropdown-menu">
          <li><a class="dropdown-item" href="#">選項 1</a></li>
          <li><a class="dropdown-item" href="#">選項 2</a></li>
          <li><a class="dropdown-item" href="#">選項 3</a></li>
          <li><hr class="dropdown-divider"></li>
          <li><a class="dropdown-item" href="#">分隔選項</a></li>
        </ul>
      </div>
    `,
    attributes: {
      class: 'fa fa-chevron-down'
    }
  });

  // 9. Nav Tabs 導航標籤
  blockManager.add('bootstrap-nav-tabs', {
    label: 'Nav Tabs',
    category: 'Bootstrap',
    content: `
      <div>
        <ul class="nav nav-tabs" id="myTab" role="tablist">
          <li class="nav-item" role="presentation">
            <button class="nav-link active" id="home-tab" data-bs-toggle="tab" data-bs-target="#home-tab-pane" type="button" role="tab" aria-controls="home-tab-pane" aria-selected="true">首頁</button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" id="profile-tab" data-bs-toggle="tab" data-bs-target="#profile-tab-pane" type="button" role="tab" aria-controls="profile-tab-pane" aria-selected="false">個人資料</button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" id="contact-tab" data-bs-toggle="tab" data-bs-target="#contact-tab-pane" type="button" role="tab" aria-controls="contact-tab-pane" aria-selected="false">聯絡方式</button>
          </li>
        </ul>
        <div class="tab-content" id="myTabContent">
          <div class="tab-pane fade show active" id="home-tab-pane" role="tabpanel" aria-labelledby="home-tab" tabindex="0">
            <div class="p-3">這是首頁標籤的內容。</div>
          </div>
          <div class="tab-pane fade" id="profile-tab-pane" role="tabpanel" aria-labelledby="profile-tab" tabindex="0">
            <div class="p-3">這是個人資料標籤的內容。</div>
          </div>
          <div class="tab-pane fade" id="contact-tab-pane" role="tabpanel" aria-labelledby="contact-tab" tabindex="0">
            <div class="p-3">這是聯絡方式標籤的內容。</div>
          </div>
        </div>
      </div>
    `,
    attributes: {
      class: 'fa fa-folder-open'
    }
  });

  // 10. List Group 列表群組
  blockManager.add('bootstrap-list-group', {
    label: 'List Group',
    category: 'Bootstrap',
    content: `
      <ul class="list-group">
        <li class="list-group-item active" aria-current="true">目前選中的項目</li>
        <li class="list-group-item">第二個項目</li>
        <li class="list-group-item">第三個項目</li>
        <li class="list-group-item">第四個項目</li>
        <li class="list-group-item">第五個項目</li>
      </ul>
    `,
    attributes: {
      class: 'fa fa-list-ul'
    }
  });

  // 11. Badge 徽章
  blockManager.add('bootstrap-badge', {
    label: 'Badge',
    category: 'Bootstrap',
    content: `
      <div>
        <span class="badge bg-primary">主要</span>
        <span class="badge bg-secondary">次要</span>
        <span class="badge bg-success">成功</span>
        <span class="badge bg-danger">危險</span>
        <span class="badge bg-warning text-dark">警告</span>
        <span class="badge bg-info text-dark">資訊</span>
        <span class="badge bg-light text-dark">淺色</span>
        <span class="badge bg-dark">深色</span>
      </div>
    `,
    attributes: {
      class: 'fa fa-tag'
    }
  });

  // 12. Progress Bar 進度條
  blockManager.add('bootstrap-progress', {
    label: 'Progress Bar',
    category: 'Bootstrap',
    content: `
      <div>
        <div class="progress mb-3" role="progressbar" aria-label="基本進度條" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">
          <div class="progress-bar" style="width: 25%">25%</div>
        </div>
        <div class="progress mb-3" role="progressbar" aria-label="成功進度條" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100">
          <div class="progress-bar bg-success" style="width: 50%">50%</div>
        </div>
        <div class="progress mb-3" role="progressbar" aria-label="條紋進度條" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100">
          <div class="progress-bar progress-bar-striped bg-warning" style="width: 75%">75%</div>
        </div>
      </div>
    `,
    attributes: {
      class: 'fa fa-chart-line'
    }
  });

  // 13. Form Elements 表單元素
  blockManager.add('bootstrap-form', {
    label: 'Form',
    category: 'Bootstrap',
    content: `
      <form>
        <div class="mb-3">
          <label for="email" class="form-label">電子郵件</label>
          <input type="email" class="form-control" id="email" placeholder="name@example.com">
        </div>
        <div class="mb-3">
          <label for="password" class="form-label">密碼</label>
          <input type="password" class="form-control" id="password">
        </div>
        <div class="mb-3">
          <label for="message" class="form-label">訊息</label>
          <textarea class="form-control" id="message" rows="3"></textarea>
        </div>
        <div class="mb-3">
          <select class="form-select" aria-label="預設選擇">
            <option selected>請選擇選項</option>
            <option value="1">選項 1</option>
            <option value="2">選項 2</option>
            <option value="3">選項 3</option>
          </select>
        </div>
        <div class="mb-3 form-check">
          <input type="checkbox" class="form-check-input" id="check">
          <label class="form-check-label" for="check">
            同意條款
          </label>
        </div>
        <button type="submit" class="btn btn-primary">提交</button>
      </form>
    `,
    attributes: {
      class: 'fa fa-wpforms'
    }
  });

  // 14. Toast 吐司通知
  blockManager.add('bootstrap-toast', {
    label: 'Toast',
    category: 'Bootstrap',
    content: `
      <div>
        <button type="button" class="btn btn-primary" id="liveToastBtn">顯示通知</button>
        
        <div class="toast-container position-fixed bottom-0 end-0 p-3">
          <div id="liveToast" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header">
              <img src="https://via.placeholder.com/20x20" class="rounded me-2" alt="圖標">
              <strong class="me-auto">Bootstrap</strong>
              <small>剛剛</small>
              <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
              Hello, world! 這是一個吐司訊息。
            </div>
          </div>
        </div>
      </div>
    `,
    attributes: {
      class: 'fa fa-comment'
    }
  });

  // 15. Offcanvas 側邊欄
  blockManager.add('bootstrap-offcanvas', {
    label: 'Offcanvas',
    category: 'Bootstrap',
    content: `
      <div>
        <button class="btn btn-primary" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasExample" aria-controls="offcanvasExample">
          打開側邊欄
        </button>

        <div class="offcanvas offcanvas-start" tabindex="-1" id="offcanvasExample" aria-labelledby="offcanvasExampleLabel">
          <div class="offcanvas-header">
            <h5 class="offcanvas-title" id="offcanvasExampleLabel">側邊欄</h5>
            <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
          </div>
          <div class="offcanvas-body">
            <div>
              這是側邊欄的內容。您可以在這裡放置導航選單、設定選項或其他內容。
            </div>
            <div class="dropdown mt-3">
              <button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                下拉選單按鈕
              </button>
              <ul class="dropdown-menu">
                <li><a class="dropdown-item" href="#">選項 1</a></li>
                <li><a class="dropdown-item" href="#">選項 2</a></li>
                <li><a class="dropdown-item" href="#">選項 3</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    `,
    attributes: {
      class: 'fa fa-bars'
    }
  });

  // 16. Navbar 導航欄
  blockManager.add('bootstrap-navbar', {
    label: 'Navbar',
    category: 'Bootstrap',
    content: `
      <nav class="navbar navbar-expand-lg bg-body-tertiary">
        <div class="container-fluid">
          <a class="navbar-brand" href="#">品牌名稱</a>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarSupportedContent">
            <ul class="navbar-nav me-auto mb-2 mb-lg-0">
              <li class="nav-item">
                <a class="nav-link active" aria-current="page" href="#">首頁</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="#">關於我們</a>
              </li>
              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  服務項目
                </a>
                <ul class="dropdown-menu">
                  <li><a class="dropdown-item" href="#">服務 1</a></li>
                  <li><a class="dropdown-item" href="#">服務 2</a></li>
                  <li><hr class="dropdown-divider"></li>
                  <li><a class="dropdown-item" href="#">其他服務</a></li>
                </ul>
              </li>
              <li class="nav-item">
                <a class="nav-link disabled" aria-disabled="true">暫停</a>
              </li>
            </ul>
            <form class="d-flex" role="search">
              <input class="form-control me-2" type="search" placeholder="搜尋" aria-label="Search">
              <button class="btn btn-outline-success" type="submit">搜尋</button>
            </form>
          </div>
        </div>
      </nav>
    `,
    attributes: {
      class: 'fa fa-navicon'
    }
  });

  // 17. Table 表格
  blockManager.add('bootstrap-table', {
    label: 'Table',
    category: 'Bootstrap',
    content: `
      <table class="table table-striped table-hover">
        <thead class="table-dark">
          <tr>
            <th scope="col">#</th>
            <th scope="col">姓名</th>
            <th scope="col">職位</th>
            <th scope="col">部門</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">1</th>
            <td>張小明</td>
            <td>前端工程師</td>
            <td>技術部</td>
          </tr>
          <tr>
            <th scope="row">2</th>
            <td>李小華</td>
            <td>後端工程師</td>
            <td>技術部</td>
          </tr>
          <tr>
            <th scope="row">3</th>
            <td>王小美</td>
            <td>UI/UX 設計師</td>
            <td>設計部</td>
          </tr>
        </tbody>
      </table>
    `,
    attributes: {
      class: 'fa fa-table'
    }
  });

  // 18. Pagination 分頁
  blockManager.add('bootstrap-pagination', {
    label: 'Pagination',
    category: 'Bootstrap',
    content: `
      <nav aria-label="頁面導航">
        <ul class="pagination justify-content-center">
          <li class="page-item disabled">
            <a class="page-link">上一頁</a>
          </li>
          <li class="page-item active" aria-current="page">
            <a class="page-link" href="#">1</a>
          </li>
          <li class="page-item"><a class="page-link" href="#">2</a></li>
          <li class="page-item"><a class="page-link" href="#">3</a></li>
          <li class="page-item">
            <a class="page-link" href="#">下一頁</a>
          </li>
        </ul>
      </nav>
    `,
    attributes: {
      class: 'fa fa-ellipsis-h'
    }
  });

  // 19. Breadcrumb 麵包屑導航
  blockManager.add('bootstrap-breadcrumb', {
    label: 'Breadcrumb',
    category: 'Bootstrap',
    content: `
      <nav style="--bs-breadcrumb-divider: '>';" aria-label="breadcrumb">
        <ol class="breadcrumb">
          <li class="breadcrumb-item"><a href="#">首頁</a></li>
          <li class="breadcrumb-item"><a href="#">類別</a></li>
          <li class="breadcrumb-item active" aria-current="page">當前頁面</li>
        </ol>
      </nav>
    `,
    attributes: {
      class: 'fa fa-chevron-right'
    }
  });

  // 20. Spinner 載入器
  blockManager.add('bootstrap-spinner', {
    label: 'Spinner',
    category: 'Bootstrap',
    content: `
      <div class="text-center">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">載入中...</span>
        </div>
        <div class="spinner-border text-secondary" role="status">
          <span class="visually-hidden">載入中...</span>
        </div>
        <div class="spinner-border text-success" role="status">
          <span class="visually-hidden">載入中...</span>
        </div>
        <div class="spinner-border text-danger" role="status">
          <span class="visually-hidden">載入中...</span>
        </div>
        <div class="spinner-border text-warning" role="status">
          <span class="visually-hidden">載入中...</span>
        </div>
        <div class="spinner-border text-info" role="status">
          <span class="visually-hidden">載入中...</span>
        </div>
      </div>
    `,
    attributes: {
      class: 'fa fa-spinner'
    }
  });

  console.log('✅ Bootstrap 元件庫已成功載入！');
  console.log('📦 已添加 20 個 Bootstrap 元件到編輯器');
}
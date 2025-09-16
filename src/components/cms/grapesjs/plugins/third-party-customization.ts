/**
 * 第三方插件微調工具
 * 提供對 GrapesJS 第三方插件的深度客製化功能
 */

export interface PluginCustomizationOptions {
  blockManager?: any;
  componentManager?: any;
  editor?: any;
}

/**
 * 客製化 grapesjs-blocks-basic 插件
 */
export const customizeBasicBlocks = (options: PluginCustomizationOptions) => {
  const { blockManager, editor } = options;


  // 客製化圖片區塊
  const imageBlock = blockManager.get('image');
  if (imageBlock) {
    imageBlock.set({
      label: 'image',
      category: 'Basic',
      content: {
        type: 'image',
        style: {
          'max-width': '100%',
          'height': 'auto',
          'border-radius': '8px',
          'box-shadow': '0 4px 8px rgba(0,0,0,0.1)'
        },
        attributes: {
          src: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNTAgMTAwTDEyNSA3NUgxNzVMMTUwIDEwMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPGNpcmNsZSBjeD0iMTIwIiBjeT0iNjAiIHI9IjEwIiBmaWxsPSIjOUNBM0FGIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTMwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2Qjc3ODUiPuWclueCueS9jeaUtOiZlTwvdGV4dD4KPC9zdmc+',
          alt: '圖片描述'
        }
      }
    });
  }

  // 優化列佈局
  const rowBlock = blockManager.get('row');
  if (rowBlock) {
    rowBlock.set({
      label: '📐 彈性列佈局',
      category: '佈局結構',
      content: `
        <div class="gjs-row" style="display: flex; flex-wrap: wrap; min-height: 50px; margin: 0 -15px; background: linear-gradient(90deg, transparent 0%, rgba(0,150,255,0.05) 50%, transparent 100%); border-radius: 8px;">
          <div class="gjs-column" style="flex: 1 1 100%; padding: 0 15px; min-height: 50px; border: 2px dashed rgba(0,150,255,0.3); border-radius: 4px; margin: 5px 0;">
            <div style="padding: 20px; text-align: center; color: #666; font-size: 14px;">拖拽內容到此處</div>
          </div>
        </div>
      `
    });
  }
};

/**
 * 客製化表單插件
 */
export const customizeFormBlocks = (options: PluginCustomizationOptions) => {
  const { blockManager, componentManager } = options;

  // 增強表單輸入框
  const inputBlock = blockManager.get('input');
  if (inputBlock) {
    inputBlock.set({
      label: '📝 智能輸入框',
      content: {
        type: 'input',
        classes: ['form-input', 'enhanced-input'],
        attributes: {
          placeholder: '請輸入內容...',
          'data-validation': 'required'
        },
        style: {
          'border-radius': '8px',
          'border': '2px solid #e1e5e9',
          'padding': '12px 16px',
          'transition': 'all 0.3s ease',
          'width': '100%'
        }
      }
    });
  }

  // 客製化提交按鈕
  const buttonBlock = blockManager.get('button');
  if (buttonBlock) {
    buttonBlock.set({
      label: '動效按鈕',
      content: {
        type: 'button',
        content: '提交表單',
        classes: ['form-button', 'enhanced-button'],
        style: {
          'background': 'linear-gradient(45deg, #007bff, #0056b3)',
          'color': 'white',
          'border': 'none',
          'padding': '12px 24px',
          'border-radius': '8px',
          'cursor': 'pointer',
          'transition': 'all 0.3s ease',
          'font-weight': '600'
        }
      }
    });
  }
};

/**
 * 客製化倒計時插件
 */
export const customizeCountdownBlocks = (options: PluginCustomizationOptions) => {
  const { blockManager } = options;

  // 尋找倒計時區塊
  const countdownBlock = blockManager.get('countdown') || blockManager.get('component-countdown');
  if (countdownBlock) {
    countdownBlock.set({
      label: '⏰ 精美倒計時',
      content: `
        <div class="countdown-container" style="text-align: center; padding: 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px; color: white; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
          <h3 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 300;">限時優惠</h3>
          <div class="countdown-timer" data-countdown="2024-12-31T23:59:59" style="display: flex; justify-content: center; gap: 20px; flex-wrap: wrap;">
            <div class="time-unit" style="text-align: center; min-width: 70px;">
              <div class="time-value" style="font-size: 36px; font-weight: bold; line-height: 1; margin-bottom: 5px;">00</div>
              <div class="time-label" style="font-size: 12px; opacity: 0.8; text-transform: uppercase;">天</div>
            </div>
            <div class="time-unit" style="text-align: center; min-width: 70px;">
              <div class="time-value" style="font-size: 36px; font-weight: bold; line-height: 1; margin-bottom: 5px;">00</div>
              <div class="time-label" style="font-size: 12px; opacity: 0.8; text-transform: uppercase;">時</div>
            </div>
            <div class="time-unit" style="text-align: center; min-width: 70px;">
              <div class="time-value" style="font-size: 36px; font-weight: bold; line-height: 1; margin-bottom: 5px;">00</div>
              <div class="time-label" style="font-size: 12px; opacity: 0.8; text-transform: uppercase;">分</div>
            </div>
            <div class="time-unit" style="text-align: center; min-width: 70px;">
              <div class="time-value" style="font-size: 36px; font-weight: bold; line-height: 1; margin-bottom: 5px;">00</div>
              <div class="time-label" style="font-size: 12px; opacity: 0.8; text-transform: uppercase;">秒</div>
            </div>
          </div>
          <p style="margin: 20px 0 0 0; opacity: 0.9; font-size: 16px;">機會難得，立即行動！</p>
        </div>
      `
    });
  }
};

/**
 * 客製化標籤頁插件
 */
export const customizeTabsBlocks = (options: PluginCustomizationOptions) => {
  const { blockManager } = options;

  const tabsBlock = blockManager.get('tabs');
  if (tabsBlock) {
    tabsBlock.set({
      label: '📑 現代標籤頁',
      content: `
        <div class="tabs-container" style="margin: 20px 0;">
          <div class="tab-nav" style="display: flex; background: #f8f9fa; border-radius: 12px 12px 0 0; overflow: hidden; border-bottom: 3px solid #dee2e6;">
            <button class="tab-nav-item active" data-tab="1" style="flex: 1; padding: 16px 20px; background: white; border: none; cursor: pointer; font-weight: 600; color: #007bff; position: relative;">
              標籤一
              <span style="position: absolute; bottom: -3px; left: 0; right: 0; height: 3px; background: #007bff;"></span>
            </button>
            <button class="tab-nav-item" data-tab="2" style="flex: 1; padding: 16px 20px; background: #f8f9fa; border: none; cursor: pointer; font-weight: 500; color: #6c757d;">標籤二</button>
            <button class="tab-nav-item" data-tab="3" style="flex: 1; padding: 16px 20px; background: #f8f9fa; border: none; cursor: pointer; font-weight: 500; color: #6c757d;">標籤三</button>
          </div>
          <div class="tab-content active" data-content="1" style="background: white; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #dee2e6; border-top: none; min-height: 200px;">
            <h4 style="margin-top: 0; color: #007bff;">標籤內容一</h4>
            <p style="color: #6c757d; line-height: 1.6;">這裡是第一個標籤的內容。您可以添加任何HTML內容，包括文字、圖片、按鈕等。</p>
          </div>
          <div class="tab-content" data-content="2" style="background: white; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #dee2e6; border-top: none; min-height: 200px; display: none;">
            <h4 style="margin-top: 0; color: #28a745;">標籤內容二</h4>
            <p style="color: #6c757d; line-height: 1.6;">這裡是第二個標籤的內容。可以包含不同的資訊和佈局。</p>
          </div>
          <div class="tab-content" data-content="3" style="background: white; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #dee2e6; border-top: none; min-height: 200px; display: none;">
            <h4 style="margin-top: 0; color: #ffc107;">標籤內容三</h4>
            <p style="color: #6c757d; line-height: 1.6;">這裡是第三個標籤的內容。展示更多功能特色。</p>
          </div>
        </div>
      `
    });
  }
};

/**
 * 客製化輪播組件
 */
export const customizeCarouselBlocks = (options: PluginCustomizationOptions) => {
  const { blockManager } = options;

  const carouselBlock = blockManager.get('carousel') || blockManager.get('grapesjs-carousel-component');
  if (carouselBlock) {
    carouselBlock.set({
      label: '全寬響應式輪播',
      content: `
        <div class="carousel-container full-width" style="position: relative; width: 100vw; left: 50%; right: 50%; margin-left: -50vw; margin-right: -50vw; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.1);">
          <div class="carousel-slides" style="position: relative; height: 60vh; min-height: 400px;">
            <div class="carousel-slide active" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(45deg, #667eea, #764ba2); display: flex; align-items: center; justify-content: center; color: white; font-size: 3rem; font-weight: 300; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">
              全寬輪播 1
            </div>
            <div class="carousel-slide" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(45deg, #f093fb, #f5576c); display: flex; align-items: center; justify-content: center; color: white; font-size: 3rem; font-weight: 300; text-shadow: 2px 2px 4px rgba(0,0,0,0.5); opacity: 0;">
              全寬輪播 2
            </div>
            <div class="carousel-slide" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(45deg, #4facfe, #00f2fe); display: flex; align-items: center; justify-content: center; color: white; font-size: 3rem; font-weight: 300; text-shadow: 2px 2px 4px rgba(0,0,0,0.5); opacity: 0;">
              全寬輪播 3
            </div>
          </div>
          
          <button class="carousel-arrow prev" style="position: absolute; left: 30px; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,0.9); border: none; width: 60px; height: 60px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 24px; color: #333; box-shadow: 0 4px 16px rgba(0,0,0,0.3); z-index: 10;">❮</button>
          <button class="carousel-arrow next" style="position: absolute; right: 30px; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,0.9); border: none; width: 60px; height: 60px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 24px; color: #333; box-shadow: 0 4px 16px rgba(0,0,0,0.3); z-index: 10;">❯</button>
          
          <div class="carousel-indicators" style="position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%); display: flex; gap: 15px; z-index: 10;">
            <button class="carousel-dot active" data-slide="0" style="width: 16px; height: 16px; border-radius: 50%; border: none; background: white; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.4); transition: all 0.3s ease;"></button>
            <button class="carousel-dot" data-slide="1" style="width: 16px; height: 16px; border-radius: 50%; border: none; background: rgba(255,255,255,0.6); cursor: pointer; transition: all 0.3s ease;"></button>
            <button class="carousel-dot" data-slide="2" style="width: 16px; height: 16px; border-radius: 50%; border: none; background: rgba(255,255,255,0.6); cursor: pointer; transition: all 0.3s ease;"></button>
          </div>
        </div>
      `
    });
  }
};

/**
 * 統一執行所有第三方插件客製化
 */
export const applyAllPluginCustomizations = (editor: any) => {
  const blockManager = editor.BlockManager;
  const componentManager = editor.ComponentManager;
  
  const options = {
    blockManager,
    componentManager,
    editor
  };

  // 應用所有客製化
  customizeBasicBlocks(options);
  customizeFormBlocks(options);
  customizeCountdownBlocks(options);
  customizeTabsBlocks(options);
  customizeCarouselBlocks(options);

  // 添加全寬輪播的專用樣式到頁面
  const style = editor.getModel().get('style');
  const fullWidthCarouselCSS = `
    .carousel-container.full-width {
      width: 100vw !important;
      left: 50% !important;
      right: 50% !important;
      margin-left: -50vw !important;
      margin-right: -50vw !important;
      position: relative !important;
      border-radius: 0 !important;
    }
    
    .carousel-container.full-width .carousel-slides {
      height: 60vh;
      min-height: 400px;
    }
    
    @media (max-width: 768px) {
      .carousel-container.full-width .carousel-slides {
        height: 50vh;
        min-height: 300px;
      }
    }
  `;
  
  // 將CSS添加到編輯器的樣式中
  editor.setStyle(style + fullWidthCarouselCSS);

  console.log('✅ 所有第三方插件客製化已套用，包含全寬輪播功能');
};

/**
 * 動態修改插件區塊屬性
 */
export const modifyPluginBlock = (editor: any, blockId: string, modifications: any) => {
  // 檢查 editor 和 BlockManager 是否存在
  if (!editor?.BlockManager) {
    console.warn(`⚠️  Editor 或 BlockManager 未初始化`);
    return false;
  }
  
  const blockManager = editor.BlockManager;
  const block = blockManager.get(blockId);
  
  if (block) {
    block.set(modifications);
    console.log(`✅ 已修改插件區塊: ${blockId}`);
    return true;
  } else {
    console.warn(`⚠️  找不到插件區塊: ${blockId}`);
    return false;
  }
};

/**
 * 獲取所有第三方插件區塊列表
 */
export const getThirdPartyBlocks = (editor: any) => {
  // 檢查 editor 和 BlockManager 是否存在
  if (!editor?.BlockManager) {
    console.warn(`⚠️  Editor 或 BlockManager 未初始化`);
    return [];
  }
  
  const blockManager = editor.BlockManager;
  const allBlocks = blockManager.getAll();
  
  const thirdPartyBlocks = allBlocks.filter((block: any) => {
    const id = block.get('id');
    // 根據區塊ID判斷是否為第三方插件區塊
    return !id.startsWith('home-') && !id.startsWith('bootstrap-') && !id.includes('custom-');
  });

  return thirdPartyBlocks.map((block: any) => ({
    id: block.get('id'),
    label: block.get('label'),
    category: block.get('category'),
    attributes: block.attributes
  }));
};
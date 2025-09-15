/**
 * GrapesJS 第三方插件配置
 * 統一管理所有第三方插件的配置選項
 */

export interface PluginConfig {
  [pluginName: string]: any;
}

/**
 * 獲取第三方插件配置選項
 * 已針對效能和相容性進行最佳化
 */
export const getPluginsOptions = (): PluginConfig => {
  return {
    // ============================================
    // 1. grapesjs-preset-webpage - 網頁預設模板
    // ============================================
    'grapesjs-preset-webpage': {
      modalImportTitle: '匯入模板',
      modalImportLabel: '<div style="margin-bottom: 10px; font-size: 13px;">在此貼上您的 HTML/CSS 代碼，然後點擊匯入</div>',
      modalImportContent: function(editor: any) {
        return editor.getHtml() + '<style>' + editor.getCss() + '</style>'
      },
      importViewerOptions: {
        enableImport: true
      },
      // 性能優化選項
      formsOpts: {
        category: '表單元件'
      },
      countdownOpts: {
        category: '互動元件'
      },
      exportOpts: {
        addExportBtn: true,
        filename: 'grapesjs_page',
        root: {
          css: {
            'font-family': '"Helvetica Neue", Helvetica, Arial, sans-serif'
          }
        }
      }
    },

    // ============================================
    // 2. grapesjs-blocks-basic - 基本佈局區塊
    // ============================================
    'grapesjs-blocks-basic': {
      flexGrid: 1, // 啟用 flexbox 網格
      stylePrefix: 'gjs-', // CSS 前綴
      addBasicStyle: true, // 添加基本樣式
      category: '基本佈局', // 分類名稱
      labelColumn1: '單列',
      labelColumn2: '雙列', 
      labelColumn3: '三列',
      labelText: '文字區塊',
      labelImage: '圖片',
      labelVideo: '影片',
      labelMap: '地圖',
      // 優化設定
      rowHeight: 75,
      justifyContent: true,
      alignItems: true,
      flexDirection: true,
      flexWrap: true,
      // 預設樣式改進
      defaultStyle: {
        'min-height': '50px',
        'padding': '10px'
      }
    },

    // ============================================
    // 3. grapesjs-plugin-forms - 表單元件
    // ============================================
    'grapesjs-plugin-forms': {
      category: '表單元件', // 自訂分類
      stylePrefix: 'form-', // CSS 前綴
      block: {
        category: '表單元件'
      },
      // 表單驗證和樣式增強
      formOpts: {
        method: 'POST',
        action: '/api/form-submit'
      },
      inputOpts: {
        placeholder: '請輸入...'
      },
      textareaOpts: {
        placeholder: '請輸入詳細內容...',
        rows: 4
      },
      selectOpts: {
        placeholder: '請選擇...'
      }
    },

    // ============================================
    // 4. grapesjs-component-countdown - 倒計時器
    // ============================================
    'grapesjs-component-countdown': {
      category: '互動元件',
      block: {
        label: '倒計時器',
        content: '<div data-gjs-type="countdown" data-gjs-countdown="2024-12-31T23:59:59" style="text-align:center;padding:20px;font-size:2em;background:#f8f9fa;border:2px solid #dee2e6;border-radius:8px;color:#495057;">剩餘時間: <span class="countdown-timer">計算中...</span></div>',
        media: '<i class="fa fa-clock"></i>'
      },
      startTime: new Date().toISOString(),
      endText: '🎉 時間結束！',
      dateInputType: 'datetime-local',
      // 增強功能
      updateInterval: 1000, // 1秒更新一次
      format: 'DD天 HH:MM:SS',
      timezone: 'Asia/Taipei',
      autostart: true
    },

    // ============================================
    // 5. grapesjs-tabs - 標籤頁組件
    // ============================================
    'grapesjs-tabs': {
      category: '版面配置',
      block: {
        label: '分頁標籤',
        media: '<i class="fa fa-folder-o"></i>',
        content: {
          type: 'tabs',
          style: {
            'min-height': '200px'
          }
        }
      },
      stylePrefix: 'tab-',
      // 標籤頁增強設定
      tabsOpts: {
        animation: 'fade',
        duration: 300
      },
      defaultTabs: [
        { title: '標籤 1', content: '<p>這是第一個標籤的內容</p>' },
        { title: '標籤 2', content: '<p>這是第二個標籤的內容</p>' }
      ]
    },

    // ============================================
    // 6. grapesjs-custom-code - 自訂代碼編輯器
    // ============================================
    'grapesjs-custom-code': {
      category: '進階功能',
      block: {
        label: '自訂代碼',
        media: '<i class="fa fa-code"></i>'
      },
      stylePrefix: 'cc-',
      modalTitle: '自訂代碼編輯器',
      codeViewOptions: {
        theme: 'material-darker', // 更現代的主題
        autoBeautify: true,
        autoCloseTags: true,
        autoCloseBrackets: true,
        lineNumbers: true,
        foldGutter: true,
        matchBrackets: true,
        autoRefresh: true,
        lineWrapping: true
      },
      buttonLabel: '📝 編輯代碼',
      commandCustomCode: 'custom-code:open-modal',
      // 代碼驗證和錯誤檢查
      validateCode: true,
      showErrors: true
    },

    // ============================================
    // 7. grapesjs-tooltip - 提示框組件
    // ============================================
    'grapesjs-tooltip': {
      category: '互動元件',
      block: {
        label: '提示框',
        media: '<i class="fa fa-comment"></i>'
      },
      stylePrefix: 'tooltip-',
      // 提示框增強設定
      placement: 'top',
      trigger: 'hover',
      delay: { show: 500, hide: 100 },
      animation: true,
      html: true,
      template: '<div class="tooltip custom-tooltip" role="tooltip"><div class="arrow"></div><div class="tooltip-inner"></div></div>'
    },

    // ============================================
    // 8. grapesjs-typed - 打字效果組件
    // ============================================
    'grapesjs-typed': {
      category: '互動元件', 
      block: {
        label: '打字效果',
        media: '<i class="fa fa-keyboard-o"></i>'
      },
      stylePrefix: 'typed-',
      // 打字效果增強設定
      typeSpeed: 70,
      startDelay: 1000,
      backSpeed: 30,
      backDelay: 2000,
      loop: true,
      loopCount: Infinity,
      showCursor: true,
      cursorChar: '|',
      smartBackspace: true,
      shuffle: false
    },

    // ============================================
    // 9. grapesjs-carousel-component - 輪播組件
    // ============================================
    'grapesjs-carousel-component': {
      category: '版面配置',
      block: {
        label: '全寬輪播圖',
        media: '<i class="fa fa-images"></i>',
        content: {
          type: 'carousel',
          classes: ['full-width-carousel'],
          style: {
            'width': '100vw',
            'margin-left': '-50vw',
            'margin-right': '-50vw',
            'left': '50%',
            'right': '50%',
            'position': 'relative',
            'border-radius': '8px',
            'overflow': 'hidden'
          }
        }
      },
      stylePrefix: 'carousel-',
      // 輪播組件增強設定
      carouselOpts: {
        type: 'slide',
        autoplay: true,
        interval: 4000,
        pauseOnHover: true,
        arrows: true,
        pagination: true,
        keyboard: true,
        drag: true,
        breakpoints: {
          768: {
            arrows: false,
            pagination: true
          }
        }
      },
      // 預設幻燈片
      defaultSlides: [
        {
          image: '/api/placeholder/800/400/1',
          title: '幻燈片 1',
          description: '這是第一張幻燈片的描述'
        },
        {
          image: '/api/placeholder/800/400/2', 
          title: '幻燈片 2',
          description: '這是第二張幻燈片的描述'
        }
      ]
    }
  };
};

/**
 * 獲取特定插件的配置
 */
export const getPluginConfig = (pluginName: string): any => {
  const options = getPluginsOptions();
  return options[pluginName] || {};
};

/**
 * 更新特定插件的配置
 */
export const updatePluginConfig = (pluginName: string, config: any): PluginConfig => {
  const options = getPluginsOptions();
  return {
    ...options,
    [pluginName]: {
      ...options[pluginName],
      ...config
    }
  };
};

/**
 * 獲取所有插件的名稱列表
 */
export const getPluginNames = (): string[] => {
  return Object.keys(getPluginsOptions());
};

/**
 * 檢查插件是否已配置
 */
export const hasPluginConfig = (pluginName: string): boolean => {
  return pluginName in getPluginsOptions();
};

/**
 * 插件配置預設值
 */
export const defaultPluginConfig = {
  stylePrefix: 'gjs-',
  category: '其他',
  block: {
    label: '插件組件',
    media: '<i class="fa fa-cube"></i>'
  }
};

/**
 * 合併插件配置（用於擴展現有配置）
 */
export const mergePluginConfig = (
  pluginName: string, 
  additionalConfig: any
): any => {
  const baseConfig = getPluginConfig(pluginName);
  return {
    ...defaultPluginConfig,
    ...baseConfig,
    ...additionalConfig
  };
};
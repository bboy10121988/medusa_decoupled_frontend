import type grapesjs from 'grapesjs'

// 以繁體中文覆蓋 GrapesJS 介面字串
export function applyZhTW(editor: grapesjs.Editor) {
  const i18n = editor.I18n

  i18n.addMessages({
    'zh-TW': {
      styleManager: {
        empty: '請選取一個元件以編輯樣式',
        layer: '圖層',
        fileButton: '選擇圖片',
      },
      traitManager: {
        empty: '請選取一個元件以編輯屬性',
        label: '元件屬性',
        traits: {
          // 常見 trait 類型
          id: 'ID',
          title: '標題',
          href: '連結',
          alt: '替代文字',
          target: '開啟方式',
          src: '來源',
        },
      },
      deviceManager: {
        device: '裝置',
        devices: {
          desktop: '桌機',
          tablet: '平板',
          mobilePortrait: '手機',
        },
      },
      selectorManager: {
        label: '樣式選擇器',
        selected: '已選取',
        emptyState: '- 未選取任何元件 -',
      },
      layers: {
        title: '圖層',
      },
      blockManager: {
        labels: {
          // 常見分類翻譯（實際分類由外部插件決定）
          Basic: '基礎',
          Forms: '表單',
          Typography: '排版',
          Media: '媒體',
          Extra: '進階',
          Layout: '佈局',
        },
        categories: {
          // 可依專案客製
        },
      },
      assetManager: {
        addButton: '新增資產',
        inputPlh: '在此貼上圖片 URL',
        modalTitle: '資產管理',
        uploadTitle: '拖曳檔案至此或點擊上傳',
        uploadBtn: '選擇檔案',
        dropFiles: '將檔案拖曳到這裡',
        choose: '選擇',
        remove: '刪除',
      },
      panels: {
        buttons: {
          // 內建按鈕多為 icon，仍補上標題
          openBlocks: '開啟區塊',
          openSm: '開啟樣式',
          openTm: '開啟屬性',
          openLayers: '開啟圖層',
          preview: '預覽',
          fullscreen: '全螢幕',
          exportTemplate: '匯出',
          undo: '復原',
          redo: '重做',
          import: '匯入',
        },
      },
      notifications: {
        info: '訊息',
        warning: '警告',
        success: '成功',
        error: '錯誤',
      },
    },
  })

  i18n.setLocale('zh-TW')

  // 進一步覆蓋樣式面板常見分組與屬性名稱與選項
  try {
    const sm = editor.StyleManager
    const translateAll = () => {
      // 區塊分組標題
      const sectorMap: Record<string, string> = {
        general: '一般',
        dimension: '尺寸與間距',
        typography: '文字排版',
        decorations: '外觀裝飾',
        extra: '其他',
        // 一些主題/插件可能使用的替代名稱
        General: '一般',
        Dimension: '尺寸與間距',
        Typography: '文字排版',
        Decorations: '外觀裝飾',
        Extra: '其他',
      }
      sm.getSectors().each((s: any) => {
        const name = s.get('name')
        if (name && sectorMap[name]) s.set('name', sectorMap[name])
        const id = s.getId?.() || s.id
        if (id && sectorMap[id]) s.set('name', sectorMap[id])
      })

      // 常見屬性翻譯
      const propMap: Record<string, string> = {
        display: '顯示',
        position: '定位',
        top: '上', right: '右', bottom: '下', left: '左',
        width: '寬度', height: '高度',
        'min-width': '最小寬度', 'min-height': '最小高度',
        'max-width': '最大寬度', 'max-height': '最大高度',
        margin: '外距', padding: '內距',
        float: '浮動', 'z-index': '層級',
        color: '文字顏色',
        'background-color': '背景顏色', 'background-image': '背景圖片',
        'background-repeat': '背景重複', 'background-position': '背景位置', 'background-size': '背景尺寸',
        opacity: '不透明度', 'box-shadow': '陰影', 'border-radius': '圓角', border: '邊框',
        'border-top': '上邊框', 'border-right': '右邊框', 'border-bottom': '下邊框', 'border-left': '左邊框',
        'font-family': '字體', 'font-size': '字號', 'font-weight': '字重', 'letter-spacing': '字距', 'line-height': '行高',
        'text-align': '對齊', 'text-decoration': '文字裝飾', 'text-shadow': '文字陰影',
      }

      const sectorIds = ['general', 'dimension', 'typography', 'decorations', 'extra', 'General', 'Dimension', 'Typography', 'Decorations', 'Extra']
      sectorIds.forEach((sectorId) => {
        Object.keys(propMap).forEach((prop) => {
          try {
            const p = sm.getProperty(sectorId as any, prop)
            if (p) p.set('label', propMap[prop])
          } catch { /* 不同主題可能無此屬性，忽略 */ }
        })
      })

      // 選項翻譯（Display / Float / Position / Text-align / Background-repeat）
      const optionMap: Record<string, Record<string, string>> = {
        display: {
          block: '區塊', inline: '行內', 'inline-block': '行內區塊', flex: '彈性盒', none: '隱藏',
        },
        float: { none: '無', left: '左', right: '右' },
        position: { static: '靜態', relative: '相對', absolute: '絕對', fixed: '固定', sticky: '黏附' },
        'text-align': { left: '靠左', center: '置中', right: '靠右', justify: '對齊' },
        'background-repeat': { repeat: '重複', 'repeat-x': '水平重複', 'repeat-y': '垂直重複', 'no-repeat': '不重複' },
      }

      const translateOptions = (propName: string) => {
        const map = optionMap[propName]
        if (!map) return
        sectorIds.some((sid) => {
          try {
            const p = sm.getProperty(sid as any, propName)
            if (!p) return false
            const opts = p.get('options') || []
            if (Array.isArray(opts) && opts.length) {
              p.set('options', opts.map((o: any) => ({ ...o, name: map[o.id || o.value] || o.name })))
            }
            return true
          } catch { return false }
        })
      }

      Object.keys(optionMap).forEach(translateOptions)

      // 複合屬性：Margin / Padding 子欄位 Top/Right/Bottom/Left
      const translateComposite = (propId: string, label: string, subMap: Record<string, string>) => {
        const trySector = (sid: string) => {
          try {
            const prop = sm.getProperty(sid as any, propId)
            if (!prop) return false
            // 父屬性標籤
            prop.set('label', label)
            // 子屬性集合可能為集合或陣列
            const children = (prop.get?.('properties')) || (prop as any).properties
            const each = (list: any) => {
              if (!list) return
              if (typeof list.each === 'function') {
                list.each((p: any) => {
                  const id = p.get('property') || p.get('id') || p.id
                  if (id && subMap[id]) p.set('name', subMap[id])
                })
              } else if (Array.isArray(list)) {
                list.forEach((p: any) => {
                  const id = (p.get && (p.get('property') || p.get('id'))) || p.property || p.id
                  const set = (key: string, val: string) => (p.set ? p.set(key, val) : (p[key] = val))
                  if (id && subMap[id]) set('name', subMap[id])
                })
              }
            }
            each(children)
            return true
          } catch {
            return false
          }
        }
        // 嘗試於多個 sector Id 中尋找屬性
        const sids = ['dimension', 'Dimension']
        sids.some(trySector)
      }

      translateComposite('margin', '外距', {
        'margin-top': '上', 'margin-right': '右', 'margin-bottom': '下', 'margin-left': '左',
      })
      translateComposite('padding', '內距', {
        'padding-top': '上', 'padding-right': '右', 'padding-bottom': '下', 'padding-left': '左',
      })
    }

    // 立即翻譯一次
    translateAll()
    // 當分組/屬性被動態新增時再翻譯
    editor.on('styleManager:sector:add', translateAll)
    editor.on('styleManager:property:add', translateAll)
  } catch {}
}

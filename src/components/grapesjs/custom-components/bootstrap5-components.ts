/*
 * Bootstrap 5 Components for GrapesJS
 * 重新建構的版本，專注於常用元件與穩定的 Carousel 行為。
 */

import type { Editor } from 'grapesjs'

const uniqueId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 10)}`

const updateManagedClasses = (
  model: any,
  required: string[],
  optionGroups: string[][],
  active: Array<string | undefined>
) => {
  const removable = new Set<string>()
  optionGroups.forEach((group) => {
    group.forEach((cls) => {
      if (cls) removable.add(cls)
    })
  })
  required.forEach((cls) => removable.add(cls))

  const keepClasses = (model.getClasses?.() || []).filter((cls: string) => !removable.has(cls))
  const nextClasses = [...keepClasses, ...required, ...active.filter(Boolean)]

  model.setClass(Array.from(new Set(nextClasses)))
}

const containerOptions = [
  { value: 'container', name: '固定寬度' },
  { value: 'container-fluid', name: '流體寬度' },
  { value: 'container-sm', name: 'SM 斷點' },
  { value: 'container-md', name: 'MD 斷點' },
  { value: 'container-lg', name: 'LG 斷點' },
  { value: 'container-xl', name: 'XL 斷點' },
  { value: 'container-xxl', name: 'XXL 斷點' }
]

const rowJustifyOptions = [
  { value: '', name: '預設' },
  { value: 'justify-content-start', name: '左對齊' },
  { value: 'justify-content-center', name: '置中' },
  { value: 'justify-content-end', name: '右對齊' },
  { value: 'justify-content-between', name: '左右分散' },
  { value: 'justify-content-around', name: '平均分佈' },
  { value: 'justify-content-evenly', name: '等距分佈' }
]

const colSizeOptions = [
  { value: 'col', name: '自動' },
  { value: 'col-1', name: '1/12' },
  { value: 'col-2', name: '2/12' },
  { value: 'col-3', name: '3/12' },
  { value: 'col-4', name: '4/12' },
  { value: 'col-5', name: '5/12' },
  { value: 'col-6', name: '6/12' },
  { value: 'col-7', name: '7/12' },
  { value: 'col-8', name: '8/12' },
  { value: 'col-9', name: '9/12' },
  { value: 'col-10', name: '10/12' },
  { value: 'col-11', name: '11/12' },
  { value: 'col-12', name: '12/12' }
]

const buttonVariantOptions = [
  'btn-primary',
  'btn-secondary',
  'btn-success',
  'btn-danger',
  'btn-warning',
  'btn-info',
  'btn-light',
  'btn-dark',
  'btn-link'
]

const buttonSizeOptions = ['', 'btn-sm', 'btn-lg']
const buttonSizeManaged = buttonSizeOptions.filter((value) => value)

const alertVariantOptions = [
  'alert-primary',
  'alert-secondary',
  'alert-success',
  'alert-danger',
  'alert-warning',
  'alert-info',
  'alert-light',
  'alert-dark'
]

const badgeVariantOptions = [
  'bg-primary',
  'bg-secondary',
  'bg-success',
  'bg-danger',
  'bg-warning',
  'bg-info',
  'bg-light',
  'bg-dark'
]

const navbarThemeOptions = [
  { value: 'navbar-light bg-light', name: '淺色主題' },
  { value: 'navbar-dark bg-dark', name: '深色主題' },
  { value: 'navbar-dark bg-primary', name: '品牌主題' }
]

export const BOOTSTRAP_SCRIPT_URL = '/vendor/bootstrap.bundle.min.js'
export const BOOTSTRAP_SCRIPT_ID = 'gjs-bootstrap-bundle'

export const ensureBootstrapInFrame = (doc: Document | null, win: any): Promise<any> => {
  if (!doc || !win) return Promise.resolve(null)
  if (win.bootstrap?.Carousel && win.bootstrap?.Collapse) return Promise.resolve(win.bootstrap)

  return new Promise((resolve) => {
    const onReady = () => resolve(win.bootstrap || null)

    let script = doc.getElementById(BOOTSTRAP_SCRIPT_ID) as HTMLScriptElement | null
    if (script?.dataset.loaded === 'true') {
      onReady()
      return
    }

    const attachListeners = (target: HTMLScriptElement) => {
      const handleLoad = () => {
        target.dataset.loaded = 'true'
        onReady()
      }
      target.addEventListener('load', handleLoad, { once: true })
      target.addEventListener('error', () => resolve(null), { once: true })
    }

    if (!script) {
      script = doc.createElement('script')
      script.id = BOOTSTRAP_SCRIPT_ID
      script.src = BOOTSTRAP_SCRIPT_URL
      attachListeners(script)
      doc.head?.appendChild(script)
    } else {
      attachListeners(script)
    }
  })
}

const carouselTemplate = () => `
  <div class="carousel-indicators">
    <button type="button" data-bs-target="#__ID__" data-bs-slide-to="0" class="active" aria-current="true" aria-label="投影片 1"></button>
    <button type="button" data-bs-target="#__ID__" data-bs-slide-to="1" aria-label="投影片 2"></button>
    <button type="button" data-bs-target="#__ID__" data-bs-slide-to="2" aria-label="投影片 3"></button>
  </div>
  <div class="carousel-inner">
    <div class="carousel-item active">
      <img src="https://via.placeholder.com/800x400/0d6efd/ffffff?text=Slide+1" class="d-block w-100" alt="投影片 1">
      <div class="carousel-caption d-none d-md-block">
        <h5>投影片標題一</h5>
        <p>您可以在這裡放任何內容。</p>
      </div>
    </div>
    <div class="carousel-item">
      <img src="https://via.placeholder.com/800x400/198754/ffffff?text=Slide+2" class="d-block w-100" alt="投影片 2">
      <div class="carousel-caption d-none d-md-block">
        <h5>投影片標題二</h5>
        <p>也可以替換圖片和文字。</p>
      </div>
    </div>
    <div class="carousel-item">
      <img src="https://via.placeholder.com/800x400/d63384/ffffff?text=Slide+3" class="d-block w-100" alt="投影片 3">
      <div class="carousel-caption d-none d-md-block">
        <h5>投影片標題三</h5>
        <p>最後一張示意內容。</p>
      </div>
    </div>
  </div>
  <button class="carousel-control-prev" type="button" data-bs-target="#__ID__" data-bs-slide="prev">
    <span class="carousel-control-prev-icon" aria-hidden="true"></span>
    <span class="visually-hidden">上一張</span>
  </button>
  <button class="carousel-control-next" type="button" data-bs-target="#__ID__" data-bs-slide="next">
    <span class="carousel-control-next-icon" aria-hidden="true"></span>
    <span class="visually-hidden">下一張</span>
  </button>
`

const accordionTemplate = () => `
  <div class="accordion-item">
    <h2 class="accordion-header" id="__ID__-headingOne">
      <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#__ID__-collapseOne" aria-expanded="true" aria-controls="__ID__-collapseOne">
        Accordion Item #1
      </button>
    </h2>
    <div id="__ID__-collapseOne" class="accordion-collapse collapse show" aria-labelledby="__ID__-headingOne" data-bs-parent="#__ID__">
      <div class="accordion-body">
        在這裡放第一段內容。
      </div>
    </div>
  </div>
  <div class="accordion-item">
    <h2 class="accordion-header" id="__ID__-headingTwo">
      <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#__ID__-collapseTwo" aria-expanded="false" aria-controls="__ID__-collapseTwo">
        Accordion Item #2
      </button>
    </h2>
    <div id="__ID__-collapseTwo" class="accordion-collapse collapse" aria-labelledby="__ID__-headingTwo" data-bs-parent="#__ID__">
      <div class="accordion-body">
        第二段內容也能任意編輯。
      </div>
    </div>
  </div>
`

export const registerBootstrap5Components = (editor: Editor | any) => {
  const domc = editor?.DomComponents
  const blockManager = editor?.BlockManager

  if (!domc || !blockManager) {
    console.warn('Bootstrap 5 components skipped: DomComponents 或 BlockManager 不存在')
    return
  }

  // Container
  domc.addType('bs5-container', {
    model: {
      defaults: {
        tagName: 'div',
        classes: ['container'],
        bsContainerVariant: 'container',
        droppable: true,
        traits: [
          {
            type: 'select',
            name: 'bsContainerVariant',
            label: '容器類型',
            changeProp: 1,
            options: containerOptions
          }
        ]
      },
      init() {
        this.on('change:bsContainerVariant', this.updateContainerClass)
        this.updateContainerClass()
      },
      updateContainerClass(this: any) {
        const value = this.get('bsContainerVariant') || 'container'
        updateManagedClasses(this, [], [containerOptions.map((opt) => opt.value)], [value])
      }
    }
  })

  // Row
  domc.addType('bs5-row', {
    model: {
      defaults: {
        tagName: 'div',
        classes: ['row', 'g-3'],
        bsRowJustify: '',
        droppable: '[data-gjs-type="bs5-col"], .col',
        traits: [
          {
            type: 'select',
            name: 'bsRowJustify',
            label: '對齊方式',
            changeProp: 1,
            options: rowJustifyOptions
          }
        ]
      },
      init() {
        this.on('change:bsRowJustify', this.updateRowClass)
        this.updateRowClass()
      },
      updateRowClass(this: any) {
        const value = this.get('bsRowJustify') || ''
        updateManagedClasses(this, ['row', 'g-3'], [rowJustifyOptions.map((opt) => opt.value)], [value])
      }
    }
  })

  // Column
  domc.addType('bs5-col', {
    model: {
      defaults: {
        tagName: 'div',
        classes: ['col'],
        bsColSize: 'col',
        droppable: true,
        traits: [
          {
            type: 'select',
            name: 'bsColSize',
            label: '欄寬',
            changeProp: 1,
            options: colSizeOptions
          }
        ]
      },
      init() {
        this.on('change:bsColSize', this.updateColClass)
        this.updateColClass()
      },
      updateColClass(this: any) {
        const size = this.get('bsColSize') || 'col'
        updateManagedClasses(this, [], [colSizeOptions.map((opt) => opt.value)], [size])
      }
    }
  })

  // Button
  domc.addType('bs5-button', {
    model: {
      defaults: {
        tagName: 'button',
        classes: ['btn', 'btn-primary'],
        content: '按鈕',
        bsButtonVariant: 'btn-primary',
        bsButtonSize: '',
        traits: [
          {
            type: 'select',
            name: 'bsButtonVariant',
            label: '按鈕樣式',
            changeProp: 1,
            options: buttonVariantOptions.map((value) => ({ value, name: value.replace('btn-', '').toUpperCase() }))
          },
          {
            type: 'select',
            name: 'bsButtonSize',
            label: '按鈕大小',
            changeProp: 1,
            options: [
              { value: '', name: '標準' },
              { value: 'btn-sm', name: '小型' },
              { value: 'btn-lg', name: '大型' }
            ]
          }
        ]
      },
      init() {
        this.on('change:bsButtonVariant', this.updateButtonClass)
        this.on('change:bsButtonSize', this.updateButtonClass)
        this.updateButtonClass()
      },
      updateButtonClass(this: any) {
        const variant = this.get('bsButtonVariant') || 'btn-primary'
        const size = this.get('bsButtonSize') || ''
        updateManagedClasses(this, ['btn'], [buttonVariantOptions, buttonSizeManaged], [variant, size])
      }
    }
  })

  // Card
  domc.addType('bs5-card', {
    model: {
      defaults: {
        tagName: 'div',
        classes: ['card', 'shadow-sm'],
        droppable: '.card-body',
        content: `
          <div class="card-body">
            <h5 class="card-title mb-3">卡片標題</h5>
            <p class="card-text">這裡是卡片內容，您可以自由編輯。</p>
            <a class="btn btn-primary" href="#">了解更多</a>
          </div>
        `
      }
    }
  })

  // Alert
  domc.addType('bs5-alert', {
    model: {
      defaults: {
        tagName: 'div',
        classes: ['alert', 'alert-primary'],
        content: '這是一個 Bootstrap 5 警告訊息。',
        bsAlertVariant: 'alert-primary',
        traits: [
          {
            type: 'select',
            name: 'bsAlertVariant',
            label: '顏色',
            changeProp: 1,
            options: alertVariantOptions.map((value) => ({ value, name: value.replace('alert-', '').toUpperCase() }))
          }
        ]
      },
      init() {
        this.on('change:bsAlertVariant', this.updateAlertClass)
        this.updateAlertClass()
      },
      updateAlertClass(this: any) {
        const variant = this.get('bsAlertVariant') || 'alert-primary'
        updateManagedClasses(this, ['alert'], [alertVariantOptions], [variant])
      }
    }
  })

  // Badge
  domc.addType('bs5-badge', {
    model: {
      defaults: {
        tagName: 'span',
        classes: ['badge', 'bg-primary'],
        content: '徽章',
        bsBadgeVariant: 'bg-primary',
        traits: [
          {
            type: 'select',
            name: 'bsBadgeVariant',
            label: '顏色',
            changeProp: 1,
            options: badgeVariantOptions.map((value) => ({ value, name: value.replace('bg-', '').toUpperCase() }))
          }
        ]
      },
      init() {
        this.on('change:bsBadgeVariant', this.updateBadgeClass)
        this.updateBadgeClass()
      },
      updateBadgeClass(this: any) {
        const variant = this.get('bsBadgeVariant') || 'bg-primary'
        updateManagedClasses(this, ['badge'], [badgeVariantOptions], [variant])
      }
    }
  })

  // Form input
  domc.addType('bs5-form-input', {
    model: {
      defaults: {
        tagName: 'div',
        classes: ['mb-3'],
        bsLabelText: '標籤',
        bsInputPlaceholder: '請輸入內容',
        bsInputType: 'text',
        droppable: false,
        traits: [
          { type: 'text', name: 'bsLabelText', label: '標籤', changeProp: 1 },
          { type: 'text', name: 'bsInputPlaceholder', label: '佔位符', changeProp: 1 },
          {
            type: 'select',
            name: 'bsInputType',
            label: '輸入類型',
            changeProp: 1,
            options: [
              { value: 'text', name: '文字' },
              { value: 'email', name: 'Email' },
              { value: 'password', name: '密碼' },
              { value: 'number', name: '數字' },
              { value: 'tel', name: '電話' },
              { value: 'url', name: '網址' }
            ]
          }
        ],
        content: `
          <label class="form-label">標籤</label>
          <input class="form-control" type="text" placeholder="請輸入內容" />
        `
      },
      init() {
        this.on('change:bsLabelText', this.updateFormInput)
        this.on('change:bsInputPlaceholder', this.updateFormInput)
        this.on('change:bsInputType', this.updateFormInput)
        this.updateFormInput()
      },
      updateFormInput(this: any) {
        const labelComp = this.find('label')?.[0]
        const inputComp = this.find('input')?.[0]
        if (labelComp) labelComp.set('content', this.get('bsLabelText') || '標籤')
        if (inputComp) {
          inputComp.addAttributes({
            placeholder: this.get('bsInputPlaceholder') || '請輸入內容',
            type: this.get('bsInputType') || 'text'
          })
        }
      }
    }
  })

  // Form select
  domc.addType('bs5-form-select', {
    model: {
      defaults: {
        tagName: 'div',
        classes: ['mb-3'],
        bsSelectLabel: '選擇選項',
        droppable: false,
        traits: [{ type: 'text', name: 'bsSelectLabel', label: '標籤', changeProp: 1 }],
        content: `
          <label class="form-label">選擇選項</label>
          <select class="form-select">
            <option value="" selected>請選擇...</option>
            <option value="option-1">選項 1</option>
            <option value="option-2">選項 2</option>
          </select>
        `
      },
      init() {
        this.on('change:bsSelectLabel', this.updateSelectLabel)
        this.updateSelectLabel()
      },
      updateSelectLabel(this: any) {
        const labelComp = this.find('label')?.[0]
        if (labelComp) labelComp.set('content', this.get('bsSelectLabel') || '選擇選項')
      }
    }
  })

  // Table
  domc.addType('bs5-table', {
    model: {
      defaults: {
        tagName: 'table',
        classes: ['table', 'table-striped'],
        droppable: true,
        content: `
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">標題 A</th>
              <th scope="col">標題 B</th>
              <th scope="col">標題 C</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">1</th>
              <td>內容 1</td>
              <td>內容 2</td>
              <td>內容 3</td>
            </tr>
            <tr>
              <th scope="row">2</th>
              <td>內容 4</td>
              <td>內容 5</td>
              <td>內容 6</td>
            </tr>
          </tbody>
        `
      }
    }
  })

  // Navbar
  domc.addType('bs5-navbar', {
    model: {
      defaults: {
        tagName: 'nav',
        classes: ['navbar', 'navbar-expand-lg', 'navbar-light', 'bg-light'],
        bsNavbarTheme: 'navbar-light bg-light',
        droppable: '.navbar-nav',
        traits: [
          {
            type: 'select',
            name: 'bsNavbarTheme',
            label: '主題',
            changeProp: 1,
            options: navbarThemeOptions
          }
        ],
        content: `
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
                  <a class="nav-link" href="#">功能</a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" href="#">價格</a>
                </li>
              </ul>
            </div>
          </div>
        `
      },
      init() {
        this.on('change:bsNavbarTheme', this.updateNavbarTheme)
        this.updateNavbarTheme()
      },
      updateNavbarTheme(this: any) {
        const value = this.get('bsNavbarTheme') || 'navbar-light bg-light'
        const themeClasses = navbarThemeOptions.flatMap((opt) => opt.value.split(' '))
        updateManagedClasses(this, ['navbar', 'navbar-expand-lg'], [themeClasses], value.split(' '))
      }
    }
  })

  // Accordion
  domc.addType('bs5-accordion', {
    model: {
      defaults: {
        tagName: 'div',
        classes: ['accordion'],
        attributes: { id: '' },
        droppable: false,
        components: [],
        script: '',
        content: accordionTemplate()
      },
      init() {
        const attrs = this.getAttributes?.() || {}
        if (!attrs.id) {
          this.addAttributes({ id: uniqueId('accordion') })
        }
      }
    },
    view: {
      onRender() {
        const view = this as any
        const model = view.model
        const element = view.el as HTMLElement
        const attrs = model.getAttributes?.() || {}
        let id = attrs.id as string
        if (!id) {
          id = uniqueId('accordion')
          model.addAttributes({ id })
        }
        element.id = id
        const html = element.innerHTML
        if (html.includes('__ID__')) {
          element.innerHTML = html.replace(/__ID__/g, id)
        }

        const frameDoc = element.ownerDocument
        const frameWin = frameDoc?.defaultView
        ensureBootstrapInFrame(frameDoc, frameWin).then((bootstrap) => {
          if (!bootstrap?.Collapse) {
            console.warn('Bootstrap Collapse 無法使用於 iframe')
            return
          }
          element.querySelectorAll('[data-bs-toggle="collapse"]').forEach((btn) => {
            const target = (btn as HTMLElement).getAttribute('data-bs-target')
            if (!target) return
            const targetEl = element.querySelector(target)
            if (!targetEl) return
            try {
              new bootstrap.Collapse(targetEl, { parent: `#${id}`, toggle: false })
            } catch (error) {
              console.warn('初始化 Bootstrap Collapse 失敗', error)
            }
          })
        })
      }
    }
  })

  // Carousel
  domc.addType('bs5-carousel', {
    model: {
      defaults: {
        tagName: 'div',
        classes: ['carousel', 'slide'],
        attributes: { id: '', 'data-bs-ride': 'carousel' },
        droppable: false,
        content: carouselTemplate(),
        bsCarouselInterval: 5000,
        traits: [
          {
            type: 'number',
            name: 'bsCarouselInterval',
            label: '輪播間隔 (ms)',
            changeProp: 1,
            placeholder: '5000'
          }
        ]
      },
      init() {
        const attrs = this.getAttributes?.() || {}
        if (!attrs.id) {
          this.addAttributes({ id: uniqueId('carousel') })
        }
      }
    },
    view: {
      onRender() {
        const view = this as any
        const model = view.model
        const element = view.el as HTMLElement
        const attrs = model.getAttributes?.() || {}
        let id = attrs.id as string
        if (!id) {
          id = uniqueId('carousel')
          model.addAttributes({ id })
        }
        element.id = id

        const updateTargets = () => {
          const currentHtml = element.innerHTML
          if (currentHtml.includes('__ID__')) {
            element.innerHTML = currentHtml.replace(/__ID__/g, id)
          }
          element.querySelectorAll('[data-bs-target]').forEach((btn) => {
            btn.setAttribute('data-bs-target', `#${id}`)
          })
        }

        const frameDoc = element.ownerDocument
        const frameWin = frameDoc?.defaultView

        const refresh = () => {
          ensureBootstrapInFrame(frameDoc, frameWin).then((bootstrap) => {
            if (!bootstrap?.Carousel) {
              console.warn('Bootstrap Carousel 無法使用於 iframe')
              return
            }
            updateTargets()
            const interval = Number(model.get('bsCarouselInterval') || 5000)
            try {
              const existing = bootstrap.Carousel.getInstance(element)
              if (existing) existing.dispose()
              const instance = new bootstrap.Carousel(element, {
                interval: Number.isFinite(interval) && interval > 0 ? interval : 5000,
                ride: 'carousel',
                pause: 'hover',
                wrap: true
              })
              instance.cycle()
            } catch (error) {
              console.warn('初始化 Bootstrap Carousel 失敗', error)
            }
          })
        }

        if (!view.__bsIntervalHandler && model?.on) {
          view.__bsIntervalHandler = refresh
          model.on('change:bsCarouselInterval', refresh)
        }

        refresh()
      },
      removed() {
        const view = this as any
        const handler = view.__bsIntervalHandler
        if (handler && view.model?.off) {
          view.model.off('change:bsCarouselInterval', handler)
        }
        view.__bsIntervalHandler = null
      }
    }
  })

  // Block definitions
  const category = 'Bootstrap 5'

  blockManager.add('bs5-container', {
    label: 'Container',
    category,
    content: { type: 'bs5-container' },
    media: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" stroke-width="2" fill="none"/><rect x="5" y="6" width="14" height="12" rx="1" fill="currentColor" opacity="0.2"/></svg>'
  })

  blockManager.add('bs5-row', {
    label: 'Row',
    category,
    content: { type: 'bs5-row' },
    media: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="8" width="18" height="8" rx="1" stroke="currentColor" stroke-width="2" fill="none"/><line x1="12" y1="8" x2="12" y2="16" stroke="currentColor" stroke-width="1"/></svg>'
  })

  blockManager.add('bs5-col', {
    label: 'Column',
    category,
    content: { type: 'bs5-col' },
    media: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="9" y="3" width="6" height="18" rx="1" stroke="currentColor" stroke-width="2" fill="none"/></svg>'
  })

  blockManager.add('bs5-button', {
    label: 'Button',
    category,
    content: { type: 'bs5-button' },
    media: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="9" width="16" height="6" rx="3" stroke="currentColor" stroke-width="2" fill="none"/><text x="12" y="13" text-anchor="middle" font-size="6" fill="currentColor">BTN</text></svg>'
  })

  blockManager.add('bs5-card', {
    label: 'Card',
    category,
    content: { type: 'bs5-card' },
    media: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" stroke-width="2" fill="none"/><rect x="3" y="4" width="18" height="6" rx="2" fill="currentColor" opacity="0.2"/><line x1="7" y1="13" x2="17" y2="13" stroke="currentColor" stroke-width="1"/><line x1="7" y1="16" x2="13" y2="16" stroke="currentColor" stroke-width="1"/></svg>'
  })

  blockManager.add('bs5-alert', {
    label: 'Alert',
    category,
    content: { type: 'bs5-alert' },
    media: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="9" width="18" height="8" rx="2" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="12" cy="13" r="1" fill="currentColor"/><line x1="12" y1="10" x2="12" y2="12" stroke="currentColor" stroke-width="2"/></svg>'
  })

  blockManager.add('bs5-badge', {
    label: 'Badge',
    category,
    content: { type: 'bs5-badge' },
    media: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="7" y="9" width="10" height="6" rx="3" stroke="currentColor" stroke-width="2" fill="none"/><text x="12" y="13" text-anchor="middle" font-size="5" fill="currentColor">99</text></svg>'
  })

  blockManager.add('bs5-form-input', {
    label: 'Input',
    category,
    content: { type: 'bs5-form-input' },
    media: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="9" width="16" height="6" rx="2" stroke="currentColor" stroke-width="2" fill="none"/><line x1="7" y1="12" x2="9" y2="12" stroke="currentColor" stroke-width="1"/></svg>'
  })

  blockManager.add('bs5-form-select', {
    label: 'Select',
    category,
    content: { type: 'bs5-form-select' },
    media: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="9" width="16" height="6" rx="2" stroke="currentColor" stroke-width="2" fill="none"/><polygon points="16,11 19,14 13,14" fill="currentColor"/></svg>'
  })

  blockManager.add('bs5-table', {
    label: 'Table',
    category,
    content: { type: 'bs5-table' },
    media: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="5" width="18" height="14" rx="1" stroke="currentColor" stroke-width="2" fill="none"/><line x1="3" y1="9" x2="21" y2="9" stroke="currentColor" stroke-width="2"/><line x1="9" y1="5" x2="9" y2="19" stroke="currentColor" stroke-width="1"/><line x1="15" y1="5" x2="15" y2="19" stroke="currentColor" stroke-width="1"/></svg>'
  })

  blockManager.add('bs5-navbar', {
    label: 'Navbar',
    category,
    content: { type: 'bs5-navbar' },
    media: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="6" width="18" height="4" rx="1" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="7" cy="8" r="1" fill="currentColor"/><rect x="11" y="7" width="8" height="2" rx="1" fill="currentColor"/></svg>'
  })

  blockManager.add('bs5-accordion', {
    label: 'Accordion',
    category,
    content: { type: 'bs5-accordion' },
    media: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" stroke-width="2" fill="none"/><line x1="7" y1="9" x2="17" y2="9" stroke="currentColor" stroke-width="1"/><line x1="7" y1="13" x2="17" y2="13" stroke="currentColor" stroke-width="1"/><line x1="7" y1="17" x2="17" y2="17" stroke="currentColor" stroke-width="1"/></svg>'
  })

  blockManager.add('bs5-carousel', {
    label: 'Carousel',
    category,
    content: { type: 'bs5-carousel' },
    media: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="5" width="18" height="12" rx="2" stroke="currentColor" stroke-width="2" fill="none"/><polygon points="11,9 15,11 11,13" fill="currentColor"/><circle cx="8" cy="18" r="1" fill="currentColor"/><circle cx="12" cy="18" r="1" fill="currentColor"/><circle cx="16" cy="18" r="1" fill="currentColor"/></svg>'
  })
}

export default registerBootstrap5Components

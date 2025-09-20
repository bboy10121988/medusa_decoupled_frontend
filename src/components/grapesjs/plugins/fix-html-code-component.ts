/**
 * 修復缺失的 HTML 代碼組件類型
 * 解決 "Component type 'html-code' not found" 錯誤
 */

import { Editor } from 'grapesjs'

export default function fixHtmlCodeComponent(editor: Editor) {
  console.log('🔧 正在載入 HTML 代碼組件修復插件...')

  editor.on('load', () => {
    const domc = editor.DomComponents

    // 添加缺失的 html-code 組件類型
    domc.addType('html-code', {
      model: {
        defaults: {
          tagName: 'div',
          draggable: true,
          droppable: true,
          editable: true,
          traits: [
            {
              type: 'textarea',
              name: 'content',
              label: 'HTML 內容',
              changeProp: true
            }
          ],
          style: {
            'min-height': '50px',
            'padding': '10px',
            'border': '1px dashed #ccc'
          }
        },

        init() {
          // 當 content trait 改變時更新組件內容
          this.on('change:content', this.updateContent)
        },

        updateContent() {
          const content = this.get('content') || ''
          this.set('content', content)
          this.view?.render()
        }
      },

      view: {
        onRender() {
          const model = this.model
          const content = model.get('content') || '<p>HTML 代碼區塊</p>'
          this.el.innerHTML = content
        }
      }
    })

    // 也添加一個通用的 code 組件類型
    domc.addType('code', {
      extend: 'html-code',
      model: {
        defaults: {
          tagName: 'div',
          attributes: { class: 'code-block' },
          content: '<code>程式碼區塊</code>',
          traits: [
            {
              type: 'select',
              name: 'language',
              label: '程式語言',
              options: [
                { value: 'html', name: 'HTML' },
                { value: 'css', name: 'CSS' },
                { value: 'javascript', name: 'JavaScript' },
                { value: 'typescript', name: 'TypeScript' },
                { value: 'json', name: 'JSON' }
              ]
            },
            {
              type: 'textarea',
              name: 'content',
              label: '程式碼',
              changeProp: true
            }
          ]
        }
      }
    })

    console.log('✅ HTML 代碼組件類型已註冊')
  })

  console.log('✅ HTML 代碼組件修復插件載入完成')
}
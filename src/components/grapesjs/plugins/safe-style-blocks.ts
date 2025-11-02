// 安全的樣式組件塊插件
// 使用內聯樣式避免與編輯器樣式衝突

export default function safeStyleBlocks(editor: any) {
  const blockManager = editor.BlockManager

  // 添加安全的樣式組件塊
  blockManager.add('safe-button-primary', {
    label: '主要按鈕',
    category: '樣式組件',
    attributes: { class: 'gjs-block-section' },
    content: `
      <button style="background-color: #3B82F6; color: white; font-weight: bold; padding: 8px 16px; border-radius: 4px; border: none; cursor: pointer; transition: background-color 0.3s;" onmouseover="this.style.backgroundColor='#1D4ED8'" onmouseout="this.style.backgroundColor='#3B82F6'">
        點擊按鈕
      </button>
    `
  })

  blockManager.add('safe-card', {
    label: '卡片',
    category: '樣式組件',
    attributes: { class: 'gjs-block-section' },
    content: `
      <div style="max-width: 384px; border-radius: 8px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); background-color: white; margin: 16px;">
        <img style="width: 100%; height: 200px; object-fit: cover;" src="https://via.placeholder.com/400x200" alt="卡片圖片">
        <div style="padding: 24px 24px 16px 24px;">
          <div style="font-weight: bold; font-size: 20px; margin-bottom: 8px; color: #1F2937;">卡片標題</div>
          <p style="color: #4B5563; font-size: 16px; line-height: 1.5;">
            這是卡片的描述內容。您可以在這裡添加任何文字。
          </p>
        </div>
        <div style="padding: 0 24px 16px 24px;">
          <span style="display: inline-block; background-color: #E5E7EB; border-radius: 9999px; padding: 4px 12px; font-size: 14px; font-weight: 600; color: #374151; margin-right: 8px; margin-bottom: 8px;">#標籤</span>
          <span style="display: inline-block; background-color: #E5E7EB; border-radius: 9999px; padding: 4px 12px; font-size: 14px; font-weight: 600; color: #374151; margin-right: 8px; margin-bottom: 8px;">#卡片</span>
        </div>
      </div>
    `
  })

  blockManager.add('safe-hero', {
    label: 'Hero 區塊',
    category: '樣式組件',
    attributes: { class: 'gjs-block-section' },
    content: `
      <div style="background: linear-gradient(to right, #3B82F6, #8B5CF6); color: white; padding: 80px 0; text-align: center;">
        <div style="max-width: 1200px; margin: 0 auto; padding: 0 24px;">
          <h1 style="font-size: 48px; font-weight: bold; margin-bottom: 24px; margin: 0 0 24px 0;">歡迎來到我們的網站</h1>
          <p style="font-size: 20px; margin-bottom: 32px; margin: 0 0 32px 0;">這是一個使用內聯樣式設計的 Hero 區塊</p>
          <button style="background-color: white; color: #3B82F6; font-weight: bold; padding: 12px 24px; border-radius: 8px; border: none; cursor: pointer; transition: background-color 0.3s;" onmouseover="this.style.backgroundColor='#F3F4F6'" onmouseout="this.style.backgroundColor='white'">
            立即開始
          </button>
        </div>
      </div>
    `
  })

  blockManager.add('safe-contact-form', {
    label: '聯絡表單',
    category: '樣式組件',
    attributes: { class: 'gjs-block-section' },
    content: `
      <div style="background-color: white; padding: 48px 0;">
        <div style="max-width: 448px; margin: 0 auto; background-color: white; border-radius: 8px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); padding: 24px;">
          <h2 style="font-size: 24px; font-weight: bold; color: #1F2937; margin-bottom: 24px; text-align: center; margin: 0 0 24px 0;">聯絡我們</h2>
          <form>
            <div style="margin-bottom: 16px;">
              <label style="display: block; color: #374151; font-size: 14px; font-weight: bold; margin-bottom: 8px;" for="name">
                姓名
              </label>
              <input style="box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1); border: 1px solid #D1D5DB; border-radius: 4px; width: 100%; padding: 8px 12px; color: #374151; box-sizing: border-box;" id="name" type="text" placeholder="請輸入您的姓名">
            </div>
            <div style="margin-bottom: 16px;">
              <label style="display: block; color: #374151; font-size: 14px; font-weight: bold; margin-bottom: 8px;" for="email">
                電子郵件
              </label>
              <input style="box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1); border: 1px solid #D1D5DB; border-radius: 4px; width: 100%; padding: 8px 12px; color: #374151; box-sizing: border-box;" id="email" type="email" placeholder="請輸入您的電子郵件">
            </div>
            <div style="margin-bottom: 24px;">
              <label style="display: block; color: #374151; font-size: 14px; font-weight: bold; margin-bottom: 8px;" for="message">
                訊息
              </label>
              <textarea style="box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1); border: 1px solid #D1D5DB; border-radius: 4px; width: 100%; padding: 8px 12px; color: #374151; height: 128px; box-sizing: border-box; resize: vertical;" id="message" placeholder="請輸入您的訊息"></textarea>
            </div>
            <div style="display: flex; align-items: center; justify-content: center;">
              <button style="background-color: #3B82F6; color: white; font-weight: bold; padding: 8px 16px; border-radius: 4px; border: none; cursor: pointer; width: 100%; transition: background-color 0.3s;" type="button" onmouseover="this.style.backgroundColor='#1D4ED8'" onmouseout="this.style.backgroundColor='#3B82F6'">
                發送訊息
              </button>
            </div>
          </form>
        </div>
      </div>
    `
  })

  // console.log('✅ 安全樣式組件塊插件已載入')
}

// 導出插件名稱用於配置
export const pluginName = 'safe-style-blocks'
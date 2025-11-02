/**
 * 安全的 Tailwind CSS 組件集合
 * 提供預製的 Tailwind 組件，使用 scoped 樣式避免衝突
 */

import { Editor } from 'grapesjs'

export default function safeTailwindComponents(editor: Editor) {
  // console.log('🎨 正在載入安全 Tailwind 組件...')

  editor.on('load', () => {
    const blockManager = editor.Blocks

    // 定義 Tailwind 組件類別，使用 scoped 類名
    const tailwindComponents = [
      {
        id: 'tw-button-primary',
        label: 'Primary Button',
        content: `
          <button class="tw-btn-primary" style="
            background-color: #3b82f6;
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 0.375rem;
            border: none;
            font-weight: 500;
            cursor: pointer;
            transition: background-color 0.2s;
          " onmouseover="this.style.backgroundColor='#2563eb'" onmouseout="this.style.backgroundColor='#3b82f6'">
            Primary Button
          </button>
        `,
        category: 'Tailwind Components',
        attributes: { class: 'fa fa-square' }
      },
      {
        id: 'tw-button-secondary',
        label: 'Secondary Button',
        content: `
          <button class="tw-btn-secondary" style="
            background-color: #6b7280;
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 0.375rem;
            border: none;
            font-weight: 500;
            cursor: pointer;
            transition: background-color 0.2s;
          " onmouseover="this.style.backgroundColor='#4b5563'" onmouseout="this.style.backgroundColor='#6b7280'">
            Secondary Button
          </button>
        `,
        category: 'Tailwind Components',
        attributes: { class: 'fa fa-square' }
      },
      {
        id: 'tw-card',
        label: 'Card',
        content: `
          <div class="tw-card" style="
            background-color: white;
            border-radius: 0.5rem;
            padding: 1.5rem;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
            border: 1px solid #e5e7eb;
            max-width: 24rem;
          ">
            <h3 style="
              font-size: 1.25rem;
              font-weight: 600;
              margin-bottom: 0.5rem;
              color: #111827;
            ">Card Title</h3>
            <p style="
              color: #6b7280;
              margin-bottom: 1rem;
            ">This is a card component with Tailwind-inspired styling.</p>
            <button style="
              background-color: #3b82f6;
              color: white;
              padding: 0.5rem 1rem;
              border-radius: 0.375rem;
              border: none;
              font-weight: 500;
              cursor: pointer;
            ">Learn More</button>
          </div>
        `,
        category: 'Tailwind Components',
        attributes: { class: 'fa fa-credit-card' }
      },
      {
        id: 'tw-hero-section',
        label: 'Hero Section',
        content: `
          <section class="tw-hero" style="
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 4rem 1rem;
            text-align: center;
            color: white;
          ">
            <div style="max-width: 48rem; margin: 0 auto;">
              <h1 style="
                font-size: 3rem;
                font-weight: 700;
                margin-bottom: 1rem;
                line-height: 1.2;
              ">Welcome to Your Website</h1>
              <p style="
                font-size: 1.25rem;
                margin-bottom: 2rem;
                opacity: 0.9;
              ">Build amazing experiences with our modern components.</p>
              <button style="
                background-color: white;
                color: #667eea;
                padding: 0.75rem 2rem;
                border-radius: 0.5rem;
                border: none;
                font-weight: 600;
                font-size: 1.1rem;
                cursor: pointer;
                transition: transform 0.2s;
              " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                Get Started
              </button>
            </div>
          </section>
        `,
        category: 'Tailwind Components',
        attributes: { class: 'fa fa-home' }
      },
      {
        id: 'tw-feature-grid',
        label: 'Feature Grid',
        content: `
          <div class="tw-feature-grid" style="
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            padding: 2rem;
            max-width: 72rem;
            margin: 0 auto;
          ">
            <div style="
              text-align: center;
              padding: 2rem;
              border-radius: 0.5rem;
              background-color: #f9fafb;
              border: 1px solid #e5e7eb;
            ">
              <div style="
                width: 4rem;
                height: 4rem;
                background-color: #3b82f6;
                border-radius: 50%;
                margin: 0 auto 1rem;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 1.5rem;
                font-weight: bold;
              ">1</div>
              <h3 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem;">Feature One</h3>
              <p style="color: #6b7280;">Description of your first amazing feature.</p>
            </div>
            <div style="
              text-align: center;
              padding: 2rem;
              border-radius: 0.5rem;
              background-color: #f9fafb;
              border: 1px solid #e5e7eb;
            ">
              <div style="
                width: 4rem;
                height: 4rem;
                background-color: #10b981;
                border-radius: 50%;
                margin: 0 auto 1rem;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 1.5rem;
                font-weight: bold;
              ">2</div>
              <h3 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem;">Feature Two</h3>
              <p style="color: #6b7280;">Description of your second amazing feature.</p>
            </div>
            <div style="
              text-align: center;
              padding: 2rem;
              border-radius: 0.5rem;
              background-color: #f9fafb;
              border: 1px solid #e5e7eb;
            ">
              <div style="
                width: 4rem;
                height: 4rem;
                background-color: #f59e0b;
                border-radius: 50%;
                margin: 0 auto 1rem;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 1.5rem;
                font-weight: bold;
              ">3</div>
              <h3 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem;">Feature Three</h3>
              <p style="color: #6b7280;">Description of your third amazing feature.</p>
            </div>
          </div>
        `,
        category: 'Tailwind Components',
        attributes: { class: 'fa fa-th' }
      },
      {
        id: 'tw-contact-form',
        label: 'Contact Form',
        content: `
          <form class="tw-contact-form" style="
            max-width: 32rem;
            margin: 0 auto;
            padding: 2rem;
            background-color: white;
            border-radius: 0.5rem;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          ">
            <h2 style="
              font-size: 1.5rem;
              font-weight: 600;
              margin-bottom: 1.5rem;
              text-align: center;
              color: #111827;
            ">Contact Us</h2>
            <div style="margin-bottom: 1rem;">
              <label style="
                display: block;
                font-weight: 500;
                margin-bottom: 0.5rem;
                color: #374151;
              ">Name</label>
              <input type="text" style="
                width: 100%;
                padding: 0.75rem;
                border: 1px solid #d1d5db;
                border-radius: 0.375rem;
                font-size: 1rem;
              " placeholder="Your name">
            </div>
            <div style="margin-bottom: 1rem;">
              <label style="
                display: block;
                font-weight: 500;
                margin-bottom: 0.5rem;
                color: #374151;
              ">Email</label>
              <input type="email" style="
                width: 100%;
                padding: 0.75rem;
                border: 1px solid #d1d5db;
                border-radius: 0.375rem;
                font-size: 1rem;
              " placeholder="your@email.com">
            </div>
            <div style="margin-bottom: 1.5rem;">
              <label style="
                display: block;
                font-weight: 500;
                margin-bottom: 0.5rem;
                color: #374151;
              ">Message</label>
              <textarea style="
                width: 100%;
                padding: 0.75rem;
                border: 1px solid #d1d5db;
                border-radius: 0.375rem;
                font-size: 1rem;
                min-height: 120px;
                resize: vertical;
              " placeholder="Your message..."></textarea>
            </div>
            <button type="submit" style="
              width: 100%;
              background-color: #3b82f6;
              color: white;
              padding: 0.75rem;
              border-radius: 0.375rem;
              border: none;
              font-weight: 500;
              font-size: 1rem;
              cursor: pointer;
              transition: background-color 0.2s;
            " onmouseover="this.style.backgroundColor='#2563eb'" onmouseout="this.style.backgroundColor='#3b82f6'">
              Send Message
            </button>
          </form>
        `,
        category: 'Tailwind Components',
        attributes: { class: 'fa fa-envelope' }
      }
    ]

    // 註冊所有組件到區塊管理器
    tailwindComponents.forEach(component => {
      blockManager.add(component.id, component)
    })

    // console.log('✅ Tailwind 組件已載入:', tailwindComponents.length, '個組件')
  })

  // console.log('✅ 安全 Tailwind 組件插件載入完成')
}
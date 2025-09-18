/**
 * 額外 UI 組件：Accordion 和 Tabs
 * 補充進階 UI 組件庫
 */

/**
 * 註冊額外的 UI 組件到 GrapesJS
 */
export const registerAdditionalUIComponents = (editor: any) => {
  console.log('🎨 註冊額外 UI 組件 (Accordion & Tabs)...');

  // 4. Accordion 摺疊面板組件
  editor.Components.addType('accordion-component', {
    model: {
      defaults: {
        tagName: 'div',
        type: 'accordion-component',
        name: '摺疊面板',
        draggable: true,
        droppable: false,
        traits: [
          {
            type: 'text',
            name: 'accordionTitle',
            label: '面板標題',
            changeProp: true,
            value: '摺疊面板標題'
          },
          {
            type: 'textarea',
            name: 'accordionContent',
            label: '面板內容',
            changeProp: true,
            value: '這裡是摺疊面板的內容...'
          },
          {
            type: 'color',
            name: 'headerColor',
            label: '標頭顏色',
            changeProp: true,
            value: '#f8f9fa'
          },
          {
            type: 'color',
            name: 'borderColor',
            label: '邊框顏色',
            changeProp: true,
            value: '#dee2e6'
          },
          {
            type: 'checkbox',
            name: 'defaultOpen',
            label: '預設展開',
            changeProp: true,
            value: false
          },
          {
            type: 'checkbox',
            name: 'showIcon',
            label: '顯示箭頭',
            changeProp: true,
            value: true
          }
        ],
        style: {
          'width': '100%',
          'max-width': '600px',
          'margin': '20px 0'
        }
      }
    },
    view: {
      onRender(this: any) {
        this.updateAccordion();
      },
      
      updateAccordion(this: any) {
        const model = this.model;
        const accordionTitle = model.get('accordionTitle') || '摺疊面板標題';
        const accordionContent = model.get('accordionContent') || '這裡是摺疊面板的內容...';
        const headerColor = model.get('headerColor') || '#f8f9fa';
        const borderColor = model.get('borderColor') || '#dee2e6';
        const defaultOpen = model.get('defaultOpen');
        const showIcon = model.get('showIcon');

        // 用 DOM 操作建立 Accordion
        this.el.innerHTML = '';
        
        const container = document.createElement('div');
        container.className = 'accordion-container';
        
        Object.assign(container.style, {
          width: '100%',
          border: `1px solid ${borderColor}`,
          borderRadius: '8px',
          overflow: 'hidden'
        });

        // Accordion 標頭
        const header = document.createElement('div');
        header.className = 'accordion-header';
        
        Object.assign(header.style, {
          background: headerColor,
          padding: '16px 20px',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: `1px solid ${borderColor}`,
          transition: 'all 0.3s ease',
          userSelect: 'none'
        });

        const titleEl = document.createElement('h6');
        titleEl.textContent = accordionTitle;
        titleEl.style.margin = '0';
        titleEl.style.fontSize = '16px';
        titleEl.style.fontWeight = '500';

        header.appendChild(titleEl);

        if (showIcon) {
          const iconEl = document.createElement('span');
          iconEl.className = 'accordion-icon';
          iconEl.innerHTML = '▼';
          iconEl.style.fontSize = '12px';
          iconEl.style.transition = 'transform 0.3s ease';
          iconEl.style.transform = defaultOpen ? 'rotate(180deg)' : 'rotate(0deg)';
          header.appendChild(iconEl);
        }

        // Accordion 內容
        const content = document.createElement('div');
        content.className = 'accordion-content';
        content.innerHTML = accordionContent;
        
        Object.assign(content.style, {
          padding: defaultOpen ? '20px' : '0 20px',
          maxHeight: defaultOpen ? '1000px' : '0',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          lineHeight: '1.6',
          color: '#495057'
        });

        // 添加點擊事件
        let isOpen = defaultOpen;
        header.addEventListener('click', () => {
          isOpen = !isOpen;
          
          if (isOpen) {
            content.style.maxHeight = '1000px';
            content.style.padding = '20px';
            if (showIcon) {
              const icon = header.querySelector('.accordion-icon') as HTMLElement;
              if (icon) icon.style.transform = 'rotate(180deg)';
            }
          } else {
            content.style.maxHeight = '0';
            content.style.padding = '0 20px';
            if (showIcon) {
              const icon = header.querySelector('.accordion-icon') as HTMLElement;
              if (icon) icon.style.transform = 'rotate(0deg)';
            }
          }
        });

        container.appendChild(header);
        container.appendChild(content);
        this.el.appendChild(container);
      }
    }
  });

  // 5. Tabs 頁籤組件
  editor.Components.addType('tabs-component', {
    model: {
      defaults: {
        tagName: 'div',
        type: 'tabs-component',
        name: '頁籤組件',
        draggable: true,
        droppable: false,
        traits: [
          {
            type: 'text',
            name: 'tab1Title',
            label: '頁籤1標題',
            changeProp: true,
            value: '頁籤一'
          },
          {
            type: 'textarea',
            name: 'tab1Content',
            label: '頁籤1內容',
            changeProp: true,
            value: '這是第一個頁籤的內容...'
          },
          {
            type: 'text',
            name: 'tab2Title',
            label: '頁籤2標題',
            changeProp: true,
            value: '頁籤二'
          },
          {
            type: 'textarea',
            name: 'tab2Content',
            label: '頁籤2內容',
            changeProp: true,
            value: '這是第二個頁籤的內容...'
          },
          {
            type: 'text',
            name: 'tab3Title',
            label: '頁籤3標題',
            changeProp: true,
            value: '頁籤三'
          },
          {
            type: 'textarea',
            name: 'tab3Content',
            label: '頁籤3內容',
            changeProp: true,
            value: '這是第三個頁籤的內容...'
          },
          {
            type: 'color',
            name: 'activeColor',
            label: '啟用顏色',
            changeProp: true,
            value: '#007bff'
          },
          {
            type: 'color',
            name: 'inactiveColor',
            label: '非啟用顏色',
            changeProp: true,
            value: '#6c757d'
          },
          {
            type: 'select',
            name: 'defaultTab',
            label: '預設頁籤',
            changeProp: true,
            options: [
              { value: '1', name: '頁籤1' },
              { value: '2', name: '頁籤2' },
              { value: '3', name: '頁籤3' }
            ],
            value: '1'
          }
        ],
        style: {
          'width': '100%',
          'max-width': '800px',
          'margin': '20px 0'
        }
      }
    },
    view: {
      onRender(this: any) {
        this.updateTabs();
      },
      
      updateTabs(this: any) {
        const model = this.model;
        const tab1Title = model.get('tab1Title') || '頁籤一';
        const tab1Content = model.get('tab1Content') || '這是第一個頁籤的內容...';
        const tab2Title = model.get('tab2Title') || '頁籤二';
        const tab2Content = model.get('tab2Content') || '這是第二個頁籤的內容...';
        const tab3Title = model.get('tab3Title') || '頁籤三';
        const tab3Content = model.get('tab3Content') || '這是第三個頁籤的內容...';
        const activeColor = model.get('activeColor') || '#007bff';
        const inactiveColor = model.get('inactiveColor') || '#6c757d';
        const defaultTab = model.get('defaultTab') || '1';

        // 用 DOM 操作建立 Tabs
        this.el.innerHTML = '';
        
        const container = document.createElement('div');
        container.className = 'tabs-container';
        container.style.width = '100%';

        // Tab 導航
        const tabNav = document.createElement('div');
        tabNav.className = 'tab-nav';
        
        Object.assign(tabNav.style, {
          display: 'flex',
          borderBottom: '2px solid #e9ecef',
          marginBottom: '20px'
        });

        // 創建頁籤按鈕
        const tabs = [
          { id: '1', title: tab1Title, content: tab1Content },
          { id: '2', title: tab2Title, content: tab2Content },
          { id: '3', title: tab3Title, content: tab3Content }
        ];

        const tabButtons: HTMLElement[] = [];
        const tabContents: HTMLElement[] = [];

        tabs.forEach(tab => {
          // 頁籤按鈕
          const tabBtn = document.createElement('button');
          tabBtn.className = 'tab-button';
          tabBtn.textContent = tab.title;
          tabBtn.setAttribute('data-tab', tab.id);
          
          const isActive = tab.id === defaultTab;
          Object.assign(tabBtn.style, {
            background: 'none',
            border: 'none',
            padding: '12px 24px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            color: isActive ? activeColor : inactiveColor,
            borderBottom: `2px solid ${isActive ? activeColor : 'transparent'}`,
            transition: 'all 0.3s ease'
          });

          tabButtons.push(tabBtn);
          tabNav.appendChild(tabBtn);

          // 頁籤內容
          const tabContent = document.createElement('div');
          tabContent.className = 'tab-content';
          tabContent.innerHTML = tab.content;
          tabContent.setAttribute('data-tab-content', tab.id);
          
          Object.assign(tabContent.style, {
            display: isActive ? 'block' : 'none',
            padding: '20px 0',
            lineHeight: '1.6',
            color: '#495057'
          });

          tabContents.push(tabContent);
        });

        // 添加頁籤切換事件
        const handleTabClick = (targetTab: string) => {
          // 更新按鈕樣式
          tabButtons.forEach(b => {
            b.style.color = inactiveColor;
            b.style.borderBottomColor = 'transparent';
          });
          
          const activeBtn = tabButtons.find(b => b.getAttribute('data-tab') === targetTab);
          if (activeBtn) {
            activeBtn.style.color = activeColor;
            activeBtn.style.borderBottomColor = activeColor;
          }
          
          // 更新內容顯示
          tabContents.forEach(content => {
            content.style.display = 'none';
          });
          
          const targetContent = tabContents.find(content => 
            content.getAttribute('data-tab-content') === targetTab
          );
          if (targetContent) {
            targetContent.style.display = 'block';
          }
        };

        tabButtons.forEach(btn => {
          btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            if (targetTab) {
              handleTabClick(targetTab);
            }
          });
        });

        container.appendChild(tabNav);
        tabContents.forEach(content => {
          container.appendChild(content);
        });

        this.el.appendChild(container);
      }
    }
  });

  // 添加組件到 Block Manager
  editor.BlockManager.add('accordion-component', {
    label: '摺疊面板',
    category: '進階 UI',
    media: '<i class="fa fa-list-ul"></i>',
    content: { type: 'accordion-component' }
  });

  editor.BlockManager.add('tabs-component', {
    label: '頁籤組件',
    category: '進階 UI',
    media: '<i class="fa fa-folder-open"></i>',
    content: { type: 'tabs-component' }
  });

  console.log('✅ 額外 UI 組件 (Accordion & Tabs) 註冊完成');
};
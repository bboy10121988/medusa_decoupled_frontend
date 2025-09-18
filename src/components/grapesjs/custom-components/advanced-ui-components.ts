/**
 * 進階 UI 組件庫 for GrapesJS
 * 包含 Modal、Tooltip、Accordion、Tabs、Progress Bar 等專業組件
 */

// 擴展 Window 類型
declare global {
  interface Window {
    bootstrap?: any;
  }
}

export interface AdvancedUIComponentConfig {
  name: string;
  label: string;
  category: string;
  content: any;
  component?: any;
  traits?: any[];
}

/**
 * 註冊進階 UI 組件到 GrapesJS
 */
export const registerAdvancedUIComponents = (editor: any) => {
  console.log('🎨 註冊進階 UI 組件...');

  // 1. Modal 對話框組件
  editor.Components.addType('modal-dialog', {
    model: {
      defaults: {
        tagName: 'div',
        type: 'modal-dialog',
        name: '模態對話框',
        draggable: true,
        droppable: false,
        attributes: {
          'data-component-type': 'modal',
          'class': 'modal-container'
        },
        traits: [
          {
            type: 'text',
            name: 'modalTitle',
            label: '標題',
            changeProp: true,
            value: '模態對話框標題'
          },
          {
            type: 'textarea',
            name: 'modalContent',
            label: '內容',
            changeProp: true,
            value: '這裡是模態對話框的內容...'
          },
          {
            type: 'select',
            name: 'modalSize',
            label: '尺寸',
            changeProp: true,
            options: [
              { value: 'sm', name: '小' },
              { value: 'md', name: '中' },
              { value: 'lg', name: '大' },
              { value: 'xl', name: '超大' }
            ],
            value: 'md'
          },
          {
            type: 'color',
            name: 'primaryColor',
            label: '主色調',
            changeProp: true,
            value: '#007bff'
          }
        ],
        style: {
          'position': 'relative',
          'display': 'inline-block',
          'margin': '10px'
        }
      }
    },
    view: {
      onRender(this: any) {
        this.updateModal();
      },
      
      updateModal(this: any) {
        const model = this.model;
        const modalTitle = model.get('modalTitle') || '模態對話框標題';
        const modalContent = model.get('modalContent') || '這裡是模態對話框的內容...';
        const modalSize = model.get('modalSize') || 'md';
        const primaryColor = model.get('primaryColor') || '#007bff';

        const modalId = 'modal-' + Math.random().toString(36).substr(2, 9);

        // 計算 Modal 寬度
        let modalWidth = '600px';
        if (modalSize === 'sm') modalWidth = '400px';
        else if (modalSize === 'lg') modalWidth = '800px';
        else if (modalSize === 'xl') modalWidth = '1200px';

        // 用 DOM 操作代替模板字符串
        this.el.innerHTML = '';
        
        const container = document.createElement('div');
        container.className = 'modal-demo-container';
        container.style.position = 'relative';

        const trigger = document.createElement('button');
        trigger.type = 'button';
        trigger.className = 'btn-modal-trigger';
        trigger.textContent = '開啟對話框';
        trigger.setAttribute('data-modal-target', modalId);
        
        // 設定按鈕樣式
        Object.assign(trigger.style, {
          background: primaryColor,
          color: 'white',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '500',
          transition: 'all 0.3s ease',
          boxShadow: '0 2px 8px rgba(0,123,255,0.3)'
        });

        // 創建 Modal 結構
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';
        modalOverlay.id = modalId;
        
        Object.assign(modalOverlay.style, {
          position: 'fixed',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'none',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: '9999',
          backdropFilter: 'blur(3px)'
        });

        const modalDialog = document.createElement('div');
        modalDialog.className = 'modal-dialog';
        
        Object.assign(modalDialog.style, {
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
          maxWidth: modalWidth,
          width: '90%',
          maxHeight: '90vh',
          overflowY: 'auto'
        });

        // Modal 標頭
        const modalHeader = document.createElement('div');
        modalHeader.className = 'modal-header';
        
        Object.assign(modalHeader.style, {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 24px',
          borderBottom: '1px solid #e9ecef'
        });

        const modalTitleEl = document.createElement('h5');
        modalTitleEl.className = 'modal-title';
        modalTitleEl.textContent = modalTitle;
        
        Object.assign(modalTitleEl.style, {
          margin: '0',
          fontSize: '18px',
          fontWeight: '600',
          color: '#333'
        });

        const closeBtn = document.createElement('button');
        closeBtn.type = 'button';
        closeBtn.className = 'modal-close';
        closeBtn.innerHTML = '&times;';
        closeBtn.setAttribute('data-modal-close', modalId);
        
        Object.assign(closeBtn.style, {
          background: 'none',
          border: 'none',
          fontSize: '24px',
          color: '#6c757d',
          cursor: 'pointer',
          padding: '0',
          width: '32px',
          height: '32px'
        });

        modalHeader.appendChild(modalTitleEl);
        modalHeader.appendChild(closeBtn);

        // Modal 內容
        const modalBody = document.createElement('div');
        modalBody.className = 'modal-body';
        modalBody.innerHTML = modalContent;
        
        Object.assign(modalBody.style, {
          padding: '24px',
          lineHeight: '1.6',
          color: '#495057'
        });

        // Modal 頁尾
        const modalFooter = document.createElement('div');
        modalFooter.className = 'modal-footer';
        
        Object.assign(modalFooter.style, {
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          padding: '16px 24px',
          borderTop: '1px solid #e9ecef',
          background: '#f8f9fa'
        });

        const cancelBtn = document.createElement('button');
        cancelBtn.type = 'button';
        cancelBtn.className = 'btn-secondary';
        cancelBtn.textContent = '取消';
        cancelBtn.setAttribute('data-modal-close', modalId);
        
        Object.assign(cancelBtn.style, {
          background: '#6c757d',
          color: 'white',
          border: 'none',
          padding: '8px 20px',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px'
        });

        const confirmBtn = document.createElement('button');
        confirmBtn.type = 'button';
        confirmBtn.className = 'btn-primary';
        confirmBtn.textContent = '確認';
        
        Object.assign(confirmBtn.style, {
          background: primaryColor,
          color: 'white',
          border: 'none',
          padding: '8px 20px',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px'
        });

        modalFooter.appendChild(cancelBtn);
        modalFooter.appendChild(confirmBtn);

        modalDialog.appendChild(modalHeader);
        modalDialog.appendChild(modalBody);
        modalDialog.appendChild(modalFooter);

        modalOverlay.appendChild(modalDialog);

        container.appendChild(trigger);
        container.appendChild(modalOverlay);

        this.el.appendChild(container);

        // 添加事件監聽器
        trigger.addEventListener('click', () => {
          modalOverlay.style.display = 'flex';
        });

        [closeBtn, cancelBtn].forEach(btn => {
          btn.addEventListener('click', () => {
            modalOverlay.style.display = 'none';
          });
        });

        modalOverlay.addEventListener('click', (e) => {
          if (e.target === modalOverlay) {
            modalOverlay.style.display = 'none';
          }
        });
      }
    }
  });

  // 2. Tooltip 提示組件
  editor.Components.addType('tooltip-component', {
    model: {
      defaults: {
        tagName: 'div',
        type: 'tooltip-component',
        name: '提示工具',
        draggable: true,
        droppable: false,
        traits: [
          {
            type: 'text',
            name: 'tooltipText',
            label: '提示內容',
            changeProp: true,
            value: '這是一個提示信息'
          },
          {
            type: 'text',
            name: 'triggerText',
            label: '觸發文字',
            changeProp: true,
            value: '懸停查看提示'
          },
          {
            type: 'select',
            name: 'position',
            label: '提示位置',
            changeProp: true,
            options: [
              { value: 'top', name: '上方' },
              { value: 'bottom', name: '下方' },
              { value: 'left', name: '左側' },
              { value: 'right', name: '右側' }
            ],
            value: 'top'
          }
        ],
        style: {
          'position': 'relative',
          'display': 'inline-block',
          'margin': '20px'
        }
      }
    },
    view: {
      onRender(this: any) {
        this.updateTooltip();
      },
      
      updateTooltip(this: any) {
        const model = this.model;
        const tooltipText = model.get('tooltipText') || '這是一個提示信息';
        const triggerText = model.get('triggerText') || '懸停查看提示';
        const position = model.get('position') || 'top';

        const tooltipId = 'tooltip-' + Math.random().toString(36).substr(2, 9);

        // 用 DOM 操作建立 Tooltip
        this.el.innerHTML = '';
        
        const wrapper = document.createElement('div');
        wrapper.className = 'tooltip-wrapper';
        wrapper.style.position = 'relative';
        wrapper.style.display = 'inline-block';

        const triggerEl = document.createElement('span');
        triggerEl.className = 'tooltip-trigger';
        triggerEl.textContent = triggerText;
        
        Object.assign(triggerEl.style, {
          background: '#667eea',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '500',
          display: 'inline-block'
        });

        const tooltipContent = document.createElement('div');
        tooltipContent.className = 'tooltip-content';
        tooltipContent.id = tooltipId;
        tooltipContent.textContent = tooltipText;

        // 設定位置樣式
        if (position === 'top') {
          Object.assign(tooltipContent.style, {
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginBottom: '8px'
          });
        } else if (position === 'bottom') {
          Object.assign(tooltipContent.style, {
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginTop: '8px'
          });
        } else if (position === 'left') {
          Object.assign(tooltipContent.style, {
            right: '100%',
            top: '50%',
            transform: 'translateY(-50%)',
            marginRight: '8px'
          });
        } else {
          Object.assign(tooltipContent.style, {
            left: '100%',
            top: '50%',
            transform: 'translateY(-50%)',
            marginLeft: '8px'
          });
        }

        Object.assign(tooltipContent.style, {
          position: 'absolute',
          background: '#333',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '6px',
          fontSize: '12px',
          whiteSpace: 'nowrap',
          zIndex: '1000',
          opacity: '0',
          visibility: 'hidden',
          transition: 'all 0.3s ease'
        });

        // 添加 hover 效果
        wrapper.addEventListener('mouseenter', () => {
          tooltipContent.style.opacity = '1';
          tooltipContent.style.visibility = 'visible';
        });

        wrapper.addEventListener('mouseleave', () => {
          tooltipContent.style.opacity = '0';
          tooltipContent.style.visibility = 'hidden';
        });

        wrapper.appendChild(triggerEl);
        wrapper.appendChild(tooltipContent);
        this.el.appendChild(wrapper);
      }
    }
  });

  // 3. Progress Bar 進度條
  editor.Components.addType('progress-bar', {
    model: {
      defaults: {
        tagName: 'div',
        type: 'progress-bar',
        name: '進度條',
        draggable: true,
        droppable: false,
        traits: [
          {
            type: 'number',
            name: 'progress',
            label: '進度百分比',
            changeProp: true,
            value: 75,
            min: 0,
            max: 100
          },
          {
            type: 'text',
            name: 'label',
            label: '標籤文字',
            changeProp: true,
            value: '進度'
          },
          {
            type: 'color',
            name: 'barColor',
            label: '進度條顏色',
            changeProp: true,
            value: '#28a745'
          },
          {
            type: 'color',
            name: 'bgColor',
            label: '背景色',
            changeProp: true,
            value: '#e9ecef'
          },
          {
            type: 'checkbox',
            name: 'showPercent',
            label: '顯示百分比',
            changeProp: true,
            value: true
          },
          {
            type: 'checkbox',
            name: 'animated',
            label: '動畫效果',
            changeProp: true,
            value: true
          }
        ],
        style: {
          'width': '100%',
          'max-width': '400px',
          'margin': '20px 0'
        }
      }
    },
    view: {
      onRender(this: any) {
        this.updateProgressBar();
      },
      
      updateProgressBar(this: any) {
        const model = this.model;
        const progress = model.get('progress') || 75;
        const label = model.get('label') || '進度';
        const barColor = model.get('barColor') || '#28a745';
        const bgColor = model.get('bgColor') || '#e9ecef';
        const showPercent = model.get('showPercent');
        const animated = model.get('animated');

        // 用 DOM 操作建立進度條
        this.el.innerHTML = '';
        
        const container = document.createElement('div');
        container.className = 'progress-container';
        container.style.width = '100%';

        // 標籤行
        const labelRow = document.createElement('div');
        labelRow.className = 'progress-label';
        
        Object.assign(labelRow.style, {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px',
          fontSize: '14px',
          fontWeight: '500',
          color: '#333'
        });

        const labelText = document.createElement('span');
        labelText.textContent = label;
        labelRow.appendChild(labelText);

        if (showPercent) {
          const percentText = document.createElement('span');
          percentText.textContent = progress + '%';
          labelRow.appendChild(percentText);
        }

        // 進度軌道
        const progressTrack = document.createElement('div');
        progressTrack.className = 'progress-track';
        
        Object.assign(progressTrack.style, {
          width: '100%',
          height: '12px',
          background: bgColor,
          borderRadius: '6px',
          overflow: 'hidden',
          position: 'relative'
        });

        // 進度填充
        const progressFill = document.createElement('div');
        progressFill.className = 'progress-fill';
        
        Object.assign(progressFill.style, {
          width: progress + '%',
          height: '100%',
          background: barColor,
          borderRadius: '6px',
          transition: 'width 0.5s ease',
          position: 'relative',
          overflow: 'hidden'
        });

        if (animated) {
          // 創建動畫樣式
          const style = document.createElement('style');
          style.textContent = `
            @keyframes progress-shimmer {
              0% { background-position: -200px 0; }
              100% { background-position: 200px 0; }
            }
          `;
          document.head.appendChild(style);

          progressFill.style.background = `linear-gradient(
            90deg,
            ${barColor} 0%,
            ${barColor}dd 20%,
            ${barColor}ff 50%,
            ${barColor}dd 80%,
            ${barColor} 100%
          )`;
          progressFill.style.backgroundSize = '200px 100%';
          progressFill.style.animation = 'progress-shimmer 2s infinite';
        }

        progressTrack.appendChild(progressFill);

        container.appendChild(labelRow);
        container.appendChild(progressTrack);

        this.el.appendChild(container);
      }
    }
  });

  // 添加組件到 Block Manager
  editor.BlockManager.add('modal-dialog', {
    label: '模態對話框',
    category: '進階 UI',
    media: '<i class="fa fa-window-maximize"></i>',
    content: { type: 'modal-dialog' }
  });

  editor.BlockManager.add('tooltip-component', {
    label: '提示工具',
    category: '進階 UI',
    media: '<i class="fa fa-comment"></i>',
    content: { type: 'tooltip-component' }
  });

  editor.BlockManager.add('progress-bar', {
    label: '進度條',
    category: '進階 UI',
    media: '<i class="fa fa-tasks"></i>',
    content: { type: 'progress-bar' }
  });

  console.log('✅ 進階 UI 組件註冊完成');
};
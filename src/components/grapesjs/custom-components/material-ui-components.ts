/**
 * Material UI 組件整合到 GrapesJS
 * 將常用的 Material UI 組件包裝成 GrapesJS 可用的組件
 */

import React from 'react';

export interface MaterialUIComponentConfig {
  name: string;
  label: string;
  category: string;
  content: any;
  component?: any;
  traits?: any[];
}

// GrapesJS 視圖介面
interface GrapesJSView {
  model: any;
  el: HTMLElement;
  onRender(): void;
  updateContent(): void;
}

/**
 * 註冊 Material UI 組件到 GrapesJS
 */
export const registerMaterialUIComponents = (editor: any) => {
  console.log('🎨 註冊 Material UI 組件...');

  // 1. Material UI Button
  editor.Components.addType('mui-button', {
    model: {
      defaults: {
        tagName: 'div',
        type: 'mui-button',
        name: 'MUI Button',
        draggable: true,
        droppable: false,
        attributes: {
          'data-mui-component': 'Button'
        },
        traits: [
          {
            type: 'select',
            name: 'variant',
            label: '按鈕樣式',
            changeProp: true,
            options: [
              { value: 'contained', name: 'Contained (實心)' },
              { value: 'outlined', name: 'Outlined (外框)' },
              { value: 'text', name: 'Text (文字)' }
            ]
          },
          {
            type: 'select',
            name: 'color',
            label: '顏色',
            changeProp: true,
            options: [
              { value: 'primary', name: 'Primary' },
              { value: 'secondary', name: 'Secondary' },
              { value: 'success', name: 'Success' },
              { value: 'error', name: 'Error' },
              { value: 'warning', name: 'Warning' },
              { value: 'info', name: 'Info' }
            ]
          },
          {
            type: 'select',
            name: 'size',
            label: '大小',
            changeProp: true,
            options: [
              { value: 'small', name: 'Small' },
              { value: 'medium', name: 'Medium' },
              { value: 'large', name: 'Large' }
            ]
          },
          {
            type: 'text',
            name: 'text',
            label: '按鈕文字',
            changeProp: true,
            placeholder: '點擊我'
          },
          {
            type: 'checkbox',
            name: 'disabled',
            label: '禁用',
            changeProp: true
          }
        ],
        style: {
          'min-width': '64px',
          'min-height': '36px',
          'margin': '8px',
        }
      }
    },
    view: {
      onRender() {
        this.updateContent();
      },
      updateContent() {
        const model = this.model;
        const variant = model.get('variant') || 'contained';
        const color = model.get('color') || 'primary';
        const size = model.get('size') || 'medium';
        const text = model.get('text') || '按鈕';
        const disabled = model.get('disabled') || false;

        // 生成 Material UI Button 的 HTML 結構
        const buttonHTML = `
          <button 
            class="MuiButton-root MuiButton-${variant} MuiButton-${variant}${color.charAt(0).toUpperCase() + color.slice(1)} MuiButton-size${size.charAt(0).toUpperCase() + size.slice(1)}"
            ${disabled ? 'disabled' : ''}
            style="
              ${variant === 'contained' ? `
                background-color: ${getColorValue(color)};
                color: white;
                box-shadow: 0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12);
              ` : ''}
              ${variant === 'outlined' ? `
                border: 1px solid ${getColorValue(color)};
                color: ${getColorValue(color)};
                background-color: transparent;
              ` : ''}
              ${variant === 'text' ? `
                color: ${getColorValue(color)};
                background-color: transparent;
              ` : ''}
              border-radius: 4px;
              padding: ${getSizePadding(size)};
              font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif;
              font-weight: 500;
              font-size: ${getSizeFontSize(size)};
              line-height: 1.75;
              letter-spacing: 0.02857em;
              text-transform: uppercase;
              min-width: 64px;
              cursor: ${disabled ? 'default' : 'pointer'};
              opacity: ${disabled ? '0.3' : '1'};
              transition: background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, border-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
              border: ${variant === 'outlined' ? `1px solid ${getColorValue(color)}` : 'none'};
            "
            onmouseover="if (!this.disabled) { 
              ${variant === 'contained' ? `this.style.backgroundColor = '${getColorValueHover(color)}';` : ''}
              ${variant === 'outlined' ? `this.style.backgroundColor = '${getColorValue(color)}08';` : ''}
              ${variant === 'text' ? `this.style.backgroundColor = '${getColorValue(color)}08';` : ''}
            }"
            onmouseout="if (!this.disabled) { 
              ${variant === 'contained' ? `this.style.backgroundColor = '${getColorValue(color)}';` : ''}
              ${variant === 'outlined' ? 'this.style.backgroundColor = "transparent";' : ''}
              ${variant === 'text' ? 'this.style.backgroundColor = "transparent";' : ''}
            }"
          >
            <span class="MuiButton-label">${text}</span>
          </button>
        `;
        
        this.el.innerHTML = buttonHTML;
      }
    }
  });

  // 2. Material UI TextField
  editor.Components.addType('mui-textfield', {
    model: {
      defaults: {
        tagName: 'div',
        type: 'mui-textfield',
        name: 'MUI TextField',
        draggable: true,
        droppable: false,
        attributes: {
          'data-mui-component': 'TextField'
        },
        traits: [
          {
            type: 'select',
            name: 'variant',
            label: '樣式',
            changeProp: true,
            options: [
              { value: 'outlined', name: 'Outlined' },
              { value: 'filled', name: 'Filled' },
              { value: 'standard', name: 'Standard' }
            ]
          },
          {
            type: 'text',
            name: 'label',
            label: '標籤',
            changeProp: true,
            placeholder: '輸入標籤'
          },
          {
            type: 'text',
            name: 'placeholder',
            label: '提示文字',
            changeProp: true,
            placeholder: '輸入提示文字'
          },
          {
            type: 'select',
            name: 'size',
            label: '大小',
            changeProp: true,
            options: [
              { value: 'small', name: 'Small' },
              { value: 'medium', name: 'Medium' }
            ]
          },
          {
            type: 'checkbox',
            name: 'required',
            label: '必填',
            changeProp: true
          },
          {
            type: 'checkbox',
            name: 'disabled',
            label: '禁用',
            changeProp: true
          },
          {
            type: 'checkbox',
            name: 'fullWidth',
            label: '全寬',
            changeProp: true
          }
        ],
        style: {
          'margin': '8px',
          'min-width': '200px'
        }
      }
    },
    view: {
      onRender() {
        this.updateContent();
      },
      updateContent() {
        const model = this.model;
        const variant = model.get('variant') || 'outlined';
        const label = model.get('label') || '輸入欄位';
        const placeholder = model.get('placeholder') || '';
        const size = model.get('size') || 'medium';
        const required = model.get('required') || false;
        const disabled = model.get('disabled') || false;
        const fullWidth = model.get('fullWidth') || false;

        // 生成 Material UI TextField 的 HTML 結構
        const textFieldHTML = `
          <div class="MuiFormControl-root ${fullWidth ? 'MuiFormControl-fullWidth' : ''}" 
               style="display: inline-flex; flex-direction: column; position: relative; min-width: 0; padding: 0; margin: 0; border: 0; vertical-align: top; ${fullWidth ? 'width: 100%;' : ''}">
            <label class="MuiInputLabel-root MuiInputLabel-formControl MuiInputLabel-animated MuiInputLabel-shrink ${variant === 'outlined' ? 'MuiInputLabel-outlined' : ''}"
                   style="color: rgba(0, 0, 0, 0.6); font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif; font-weight: 400; font-size: 1rem; line-height: 1.4375em; letter-spacing: 0.00938em; padding: 0; display: block; transform-origin: top left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: calc(100% - 24px); position: absolute; left: 0; top: 0; transform: translate(${variant === 'outlined' ? '14px, -9px' : '0, -1.5px'}) scale(0.75); transition: color 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms,transform 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms,max-width 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms; z-index: 1; pointer-events: none;">
              ${label}${required ? ' *' : ''}
            </label>
            <div class="MuiInputBase-root MuiOutlinedInput-root ${size === 'small' ? 'MuiInputBase-sizeSmall MuiOutlinedInput-sizeSmall' : ''} ${disabled ? 'Mui-disabled' : ''}"
                 style="font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif; font-weight: 400; font-size: 1rem; line-height: 1.4375em; letter-spacing: 0.00938em; color: rgba(0, 0, 0, 0.87); box-sizing: border-box; cursor: text; display: inline-flex; align-items: center; position: relative; border-radius: 4px; ${disabled ? 'color: rgba(0, 0, 0, 0.38); cursor: default;' : ''}">
              <input 
                type="text" 
                placeholder="${placeholder}"
                ${required ? 'required' : ''}
                ${disabled ? 'disabled' : ''}
                class="MuiInputBase-input MuiOutlinedInput-input ${size === 'small' ? 'MuiOutlinedInput-inputSizeSmall' : ''}"
                style="font: inherit; letter-spacing: inherit; color: currentColor; padding: ${size === 'small' ? '8.5px 14px' : '16.5px 14px'}; border: 0; box-sizing: content-box; background: none; height: 1.4375em; margin: 0; display: block; min-width: 0; width: 100%; -webkit-tap-highlight-color: transparent; ${disabled ? 'opacity: 1; -webkit-text-fill-color: rgba(0, 0, 0, 0.38);' : ''}"
              />
              <fieldset 
                class="MuiOutlinedInput-notchedOutline"
                style="text-align: left; position: absolute; bottom: 0; right: 0; top: -5px; left: 0; margin: 0; padding: 0 8px; pointer-events: none; border-radius: inherit; border-style: solid; border-width: ${disabled ? '1px' : '2px'}; overflow: hidden; min-width: 0%; border-color: ${disabled ? 'rgba(0, 0, 0, 0.23)' : 'rgba(0, 0, 0, 0.23)'}; transition: border-color 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;"
              >
                <legend style="float: unset; width: auto; overflow: hidden; display: block; padding: 0; height: 11px; font-size: 0.75em; visibility: hidden; max-width: 0.01px; transition: max-width 50ms cubic-bezier(0.0, 0, 0.2, 1) 0ms; white-space: nowrap;">
                  <span>${label}${required ? ' *' : ''}</span>
                </legend>
              </fieldset>
            </div>
          </div>
        `;
        
        this.el.innerHTML = textFieldHTML;
      }
    }
  });

  // 3. Material UI Card
  editor.Components.addType('mui-card', {
    model: {
      defaults: {
        tagName: 'div',
        type: 'mui-card',
        name: 'MUI Card',
        draggable: true,
        droppable: true,
        attributes: {
          'data-mui-component': 'Card'
        },
        traits: [
          {
            type: 'checkbox',
            name: 'raised',
            label: '提升效果',
            changeProp: true
          },
          {
            type: 'select',
            name: 'variant',
            label: '樣式',
            changeProp: true,
            options: [
              { value: 'elevation', name: 'Elevation (陰影)' },
              { value: 'outlined', name: 'Outlined (邊框)' }
            ]
          }
        ],
        style: {
          'margin': '16px',
          'min-height': '200px',
          'width': '300px'
        }
      }
    },
    view: {
      onRender() {
        this.updateContent();
      },
      updateContent() {
        const model = this.model;
        const raised = model.get('raised') || false;
        const variant = model.get('variant') || 'elevation';

        const cardStyle = variant === 'outlined' 
          ? 'border: 1px solid rgba(0, 0, 0, 0.12);'
          : `box-shadow: ${raised ? '0px 8px 10px -5px rgba(0,0,0,0.2), 0px 16px 24px 2px rgba(0,0,0,0.14), 0px 6px 30px 5px rgba(0,0,0,0.12)' : '0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)'};`;

        // 生成 Material UI Card 的 HTML 結構
        const cardHTML = `
          <div class="MuiPaper-root MuiPaper-elevation1 MuiCard-root ${variant === 'outlined' ? 'MuiPaper-outlined' : ''}"
               style="background-color: #fff; color: rgba(0, 0, 0, 0.87); transition: box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms; border-radius: 4px; ${cardStyle} overflow: hidden;">
            <div class="card-content" style="padding: 16px; min-height: 120px;">
              <h6 style="font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif; font-weight: 500; font-size: 1.25rem; line-height: 1.6; letter-spacing: 0.0075em; margin: 0 0 8px 0; color: rgba(0, 0, 0, 0.87);">
                卡片標題
              </h6>
              <p style="font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif; font-weight: 400; font-size: 0.875rem; line-height: 1.43; letter-spacing: 0.01071em; margin: 0; color: rgba(0, 0, 0, 0.6);">
                這是卡片內容區域。您可以在此處添加任何內容，如文字、圖片或其他組件。
              </p>
            </div>
          </div>
        `;
        
        this.el.innerHTML = cardHTML;
      }
    }
  });

  // 4. Material UI Chip
  editor.Components.addType('mui-chip', {
    model: {
      defaults: {
        tagName: 'div',
        type: 'mui-chip',
        name: 'MUI Chip',
        draggable: true,
        droppable: false,
        attributes: {
          'data-mui-component': 'Chip'
        },
        traits: [
          {
            type: 'text',
            name: 'label',
            label: '標籤文字',
            changeProp: true,
            placeholder: '標籤'
          },
          {
            type: 'select',
            name: 'variant',
            label: '樣式',
            changeProp: true,
            options: [
              { value: 'filled', name: 'Filled (實心)' },
              { value: 'outlined', name: 'Outlined (外框)' }
            ]
          },
          {
            type: 'select',
            name: 'color',
            label: '顏色',
            changeProp: true,
            options: [
              { value: 'default', name: 'Default' },
              { value: 'primary', name: 'Primary' },
              { value: 'secondary', name: 'Secondary' },
              { value: 'success', name: 'Success' },
              { value: 'error', name: 'Error' },
              { value: 'warning', name: 'Warning' },
              { value: 'info', name: 'Info' }
            ]
          },
          {
            type: 'select',
            name: 'size',
            label: '大小',
            changeProp: true,
            options: [
              { value: 'small', name: 'Small' },
              { value: 'medium', name: 'Medium' }
            ]
          },
          {
            type: 'checkbox',
            name: 'clickable',
            label: '可點擊',
            changeProp: true
          },
          {
            type: 'checkbox',
            name: 'deletable',
            label: '可刪除',
            changeProp: true
          }
        ],
        style: {
          'margin': '4px',
          'display': 'inline-block'
        }
      }
    },
    view: {
      onRender() {
        this.updateContent();
      },
      updateContent() {
        const model = this.model;
        const label = model.get('label') || '標籤';
        const variant = model.get('variant') || 'filled';
        const color = model.get('color') || 'default';
        const size = model.get('size') || 'medium';
        const clickable = model.get('clickable') || false;
        const deletable = model.get('deletable') || false;

        const chipHTML = `
          <div class="MuiChip-root ${variant === 'outlined' ? 'MuiChip-outlined' : 'MuiChip-filled'} ${clickable ? 'MuiChip-clickable' : ''} ${deletable ? 'MuiChip-deletable' : ''}"
               style="
                 max-width: 100%;
                 font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif;
                 font-size: ${size === 'small' ? '0.8125rem' : '0.875rem'};
                 display: inline-flex;
                 align-items: center;
                 justify-content: center;
                 height: ${size === 'small' ? '24px' : '32px'};
                 color: ${variant === 'outlined' ? getColorValue(color) : (color === 'default' ? 'rgba(0, 0, 0, 0.87)' : 'white')};
                 background-color: ${variant === 'outlined' ? 'transparent' : (color === 'default' ? '#e0e0e0' : getColorValue(color))};
                 border-radius: 16px;
                 white-space: nowrap;
                 transition: background-color 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
                 cursor: ${clickable ? 'pointer' : 'default'};
                 outline: 0;
                 text-decoration: none;
                 border: ${variant === 'outlined' ? `1px solid ${color === 'default' ? 'rgba(0, 0, 0, 0.23)' : getColorValue(color)}` : '0'};
                 padding: 0;
                 vertical-align: middle;
                 box-sizing: border-box;
               ">
            <span class="MuiChip-label" style="overflow: hidden; text-overflow: ellipsis; padding-left: ${size === 'small' ? '8px' : '12px'}; padding-right: ${deletable ? '0px' : (size === 'small' ? '8px' : '12px')}; white-space: nowrap;">
              ${label}
            </span>
            ${deletable ? `
              <svg class="MuiSvgIcon-root MuiChip-deleteIcon" focusable="false" aria-hidden="true" viewBox="0 0 24 24" 
                   style="font-size: ${size === 'small' ? '16px' : '18px'}; margin-left: 5px; margin-right: ${size === 'small' ? '5px' : '8px'}; color: ${variant === 'outlined' ? getColorValue(color) : (color === 'default' ? 'rgba(0, 0, 0, 0.26)' : 'rgba(255, 255, 255, 0.7)')}; cursor: pointer;">
                <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"></path>
              </svg>
            ` : ''}
          </div>
        `;
        
        this.el.innerHTML = chipHTML;
      }
    }
  });

  // 5. Material UI Alert
  editor.Components.addType('mui-alert', {
    model: {
      defaults: {
        tagName: 'div',
        type: 'mui-alert',
        name: 'MUI Alert',
        draggable: true,
        droppable: false,
        attributes: {
          'data-mui-component': 'Alert'
        },
        traits: [
          {
            type: 'select',
            name: 'severity',
            label: '類型',
            changeProp: true,
            options: [
              { value: 'success', name: 'Success (成功)' },
              { value: 'info', name: 'Info (資訊)' },
              { value: 'warning', name: 'Warning (警告)' },
              { value: 'error', name: 'Error (錯誤)' }
            ]
          },
          {
            type: 'select',
            name: 'variant',
            label: '樣式',
            changeProp: true,
            options: [
              { value: 'filled', name: 'Filled (實心)' },
              { value: 'outlined', name: 'Outlined (外框)' },
              { value: 'standard', name: 'Standard (標準)' }
            ]
          },
          {
            type: 'text',
            name: 'title',
            label: '標題',
            changeProp: true,
            placeholder: '警告標題'
          },
          {
            type: 'text',
            name: 'message',
            label: '訊息',
            changeProp: true,
            placeholder: '警告訊息內容'
          },
          {
            type: 'checkbox',
            name: 'closable',
            label: '可關閉',
            changeProp: true
          }
        ],
        style: {
          'margin': '16px 0',
          'width': '100%'
        }
      }
    },
    view: {
      onRender() {
        this.updateContent();
      },
      updateContent() {
        const model = this.model;
        const severity = model.get('severity') || 'info';
        const variant = model.get('variant') || 'standard';
        const title = model.get('title') || '';
        const message = model.get('message') || '這是一個警告訊息';
        const closable = model.get('closable') || false;

        const severityColors = {
          success: { main: '#2e7d32', light: '#4caf50', bg: '#f1f8e9', border: '#c8e6c9' },
          info: { main: '#0288d1', light: '#03a9f4', bg: '#e3f2fd', border: '#bbdefb' },
          warning: { main: '#ed6c02', light: '#ff9800', bg: '#fff3e0', border: '#ffcc02' },
          error: { main: '#d32f2f', light: '#f44336', bg: '#ffebee', border: '#ffcdd2' }
        };

        const color = severityColors[severity as keyof typeof severityColors];
        
        let bgColor, textColor, borderColor;
        
        if (variant === 'filled') {
          bgColor = color.main;
          textColor = '#fff';
          borderColor = color.main;
        } else if (variant === 'outlined') {
          bgColor = 'transparent';
          textColor = color.main;
          borderColor = color.main;
        } else {
          bgColor = color.bg;
          textColor = color.main;
          borderColor = 'transparent';
        }

        const iconPath = {
          success: 'M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M11,16.5L18,9.5L16.5,8L11,13.5L7.5,10L6,11.5L11,16.5Z',
          info: 'M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z',
          warning: 'M13,14H11V10H13M13,18H11V16H13M1,21H23L12,2L1,21Z',
          error: 'M13,14H11V10H13M13,18H11V16H13M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2Z'
        };

        const alertHTML = `
          <div class="MuiAlert-root MuiAlert-${variant} MuiAlert-${severity}"
               style="
                 font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif;
                 display: flex;
                 padding: 6px 16px;
                 color: ${textColor};
                 background-color: ${bgColor};
                 border: 1px solid ${borderColor};
                 border-radius: 4px;
                 align-items: flex-start;
               ">
            <div class="MuiAlert-icon" style="margin-right: 12px; padding: 7px 0; display: flex; align-items: center;">
              <svg class="MuiSvgIcon-root" focusable="false" aria-hidden="true" viewBox="0 0 24 24" 
                   style="font-size: 22px; fill: currentColor;">
                <path d="${iconPath[severity as keyof typeof iconPath]}"></path>
              </svg>
            </div>
            <div class="MuiAlert-message" style="padding: 8px 0; min-width: 0; overflow: hidden; flex: 1;">
              ${title ? `<div class="MuiAlert-title" style="font-weight: 500; margin: -2px 0 0.35em; font-size: 1rem; line-height: 1.5;">${title}</div>` : ''}
              <div style="font-size: 0.875rem; line-height: 1.43;">${message}</div>
            </div>
            ${closable ? `
              <div class="MuiAlert-action" style="display: flex; align-items: flex-start; padding: 4px 0 0 16px; margin-left: auto; margin-right: -8px;">
                <button class="MuiButtonBase-root MuiIconButton-root" style="color: currentColor; background: transparent; border: none; cursor: pointer; padding: 5px; border-radius: 50%;">
                  <svg class="MuiSvgIcon-root" focusable="false" aria-hidden="true" viewBox="0 0 24 24" style="font-size: 18px;">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
                  </svg>
                </button>
              </div>
            ` : ''}
          </div>
        `;
        
        this.el.innerHTML = alertHTML;
      }
    }
  });

  // 6. Material UI Avatar
  editor.Components.addType('mui-avatar', {
    model: {
      defaults: {
        tagName: 'div',
        type: 'mui-avatar',
        name: 'MUI Avatar',
        draggable: true,
        droppable: false,
        attributes: {
          'data-mui-component': 'Avatar'
        },
        traits: [
          {
            type: 'select',
            name: 'variant',
            label: '樣式',
            changeProp: true,
            options: [
              { value: 'circular', name: 'Circular (圓形)' },
              { value: 'rounded', name: 'Rounded (圓角)' },
              { value: 'square', name: 'Square (方形)' }
            ]
          },
          {
            type: 'select',
            name: 'size',
            label: '大小',
            changeProp: true,
            options: [
              { value: 'small', name: 'Small (24px)' },
              { value: 'medium', name: 'Medium (40px)' },
              { value: 'large', name: 'Large (56px)' }
            ]
          },
          {
            type: 'text',
            name: 'src',
            label: '圖片網址',
            changeProp: true,
            placeholder: '輸入圖片網址'
          },
          {
            type: 'text',
            name: 'alt',
            label: '替代文字',
            changeProp: true,
            placeholder: '替代文字'
          },
          {
            type: 'text',
            name: 'children',
            label: '文字內容',
            changeProp: true,
            placeholder: '用戶名首字母'
          },
          {
            type: 'color',
            name: 'bgcolor',
            label: '背景顏色',
            changeProp: true
          }
        ],
        style: {
          'margin': '8px',
          'display': 'inline-block'
        }
      }
    },
    view: {
      onRender() {
        this.updateContent();
      },
      updateContent() {
        const model = this.model;
        const variant = model.get('variant') || 'circular';
        const size = model.get('size') || 'medium';
        const src = model.get('src') || '';
        const alt = model.get('alt') || '';
        const children = model.get('children') || 'U';
        const bgcolor = model.get('bgcolor') || '#bdbdbd';

        const sizeMap = {
          small: '24px',
          medium: '40px',
          large: '56px'
        };

        const borderRadius = variant === 'circular' ? '50%' : variant === 'rounded' ? '8px' : '0px';
        const avatarSize = sizeMap[size as keyof typeof sizeMap];

        const avatarHTML = `
          <div class="MuiAvatar-root MuiAvatar-${variant} MuiAvatar-${size}"
               style="
                 position: relative;
                 display: flex;
                 align-items: center;
                 justify-content: center;
                 flex-shrink: 0;
                 width: ${avatarSize};
                 height: ${avatarSize};
                 font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif;
                 font-size: ${size === 'small' ? '0.875rem' : size === 'large' ? '1.25rem' : '1rem'};
                 line-height: 1;
                 border-radius: ${borderRadius};
                 overflow: hidden;
                 user-select: none;
                 background-color: ${src ? 'transparent' : bgcolor};
                 color: #fff;
               ">
            ${src ? `
              <img class="MuiAvatar-img" 
                   src="${src}" 
                   alt="${alt}"
                   style="width: 100%; height: 100%; text-align: center; object-fit: cover; color: transparent; text-indent: 10000px;" />
            ` : `
              <span style="font-weight: 400;">${children}</span>
            `}
          </div>
        `;
        
        this.el.innerHTML = avatarHTML;
      }
    }
  });

  // 7. Material UI Badge
  editor.Components.addType('mui-badge', {
    model: {
      defaults: {
        tagName: 'span',
        type: 'mui-badge',
        name: 'MUI Badge',
        draggable: true,
        droppable: false,
        attributes: {
          'data-mui-component': 'Badge'
        },
        traits: [
          {
            type: 'text',
            name: 'badgeContent',
            label: '徽章內容',
            changeProp: true,
            placeholder: '4'
          },
          {
            type: 'select',
            name: 'color',
            label: '顏色',
            changeProp: true,
            options: [
              { value: 'default', name: 'Default' },
              { value: 'primary', name: 'Primary' },
              { value: 'secondary', name: 'Secondary' },
              { value: 'error', name: 'Error' },
              { value: 'info', name: 'Info' },
              { value: 'success', name: 'Success' },
              { value: 'warning', name: 'Warning' }
            ]
          },
          {
            type: 'select',
            name: 'variant',
            label: '樣式',
            changeProp: true,
            options: [
              { value: 'standard', name: 'Standard (標準)' },
              { value: 'dot', name: 'Dot (點)' }
            ]
          },
          {
            type: 'text',
            name: 'children',
            label: '子內容',
            changeProp: true,
            placeholder: '郵件'
          },
          {
            type: 'checkbox',
            name: 'invisible',
            label: '隱藏',
            changeProp: true
          }
        ],
        style: {
          'margin': '16px',
          'display': 'inline-block'
        }
      }
    },
    view: {
      onRender() {
        this.updateContent();
      },
      updateContent() {
        const model = this.model;
        const badgeContent = model.get('badgeContent') || '4';
        const color = model.get('color') || 'default';
        const variant = model.get('variant') || 'standard';
        const children = model.get('children') || '📧';
        const invisible = model.get('invisible') || false;

        const colorMap = {
          default: '#424242',
          primary: '#1976d2',
          secondary: '#dc004e',
          error: '#d32f2f',
          info: '#0288d1',
          success: '#2e7d32',
          warning: '#ed6c02'
        };

        const badgeColor = colorMap[color as keyof typeof colorMap];

        const badgeHTML = `
          <span class="MuiBadge-root" style="position: relative; display: inline-flex; vertical-align: middle; flex-shrink: 0;">
            <span style="font-size: 2rem; display: inline-block;">${children}</span>
            ${!invisible ? `
              <span class="MuiBadge-badge MuiBadge-${variant} MuiBadge-anchorOriginTopRight"
                    style="
                      display: flex;
                      flex-direction: row;
                      flex-wrap: wrap;
                      justify-content: center;
                      align-content: center;
                      align-items: center;
                      position: absolute;
                      box-sizing: border-box;
                      font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif;
                      font-weight: 500;
                      font-size: 0.75rem;
                      min-width: ${variant === 'dot' ? '6px' : '20px'};
                      line-height: 1;
                      padding: ${variant === 'dot' ? '0' : '0 6px'};
                      height: ${variant === 'dot' ? '6px' : '20px'};
                      border-radius: ${variant === 'dot' ? '3px' : '10px'};
                      z-index: 1;
                      transition: transform 225ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
                      background-color: ${badgeColor};
                      color: #fff;
                      transform: scale(1) translate(50%, -50%);
                      transform-origin: 100% 0%;
                      top: 0;
                      right: 0;
                    ">
                ${variant === 'standard' ? badgeContent : ''}
              </span>
            ` : ''}
          </span>
        `;
        
        this.el.innerHTML = badgeHTML;
      }
    }
  });

  // 8. Material UI Switch
  editor.Components.addType('mui-switch', {
    model: {
      defaults: {
        tagName: 'span',
        type: 'mui-switch',
        name: 'MUI Switch',
        draggable: true,
        droppable: false,
        attributes: {
          'data-mui-component': 'Switch'
        },
        traits: [
          {
            type: 'checkbox',
            name: 'checked',
            label: '選中狀態',
            changeProp: true
          },
          {
            type: 'checkbox',
            name: 'disabled',
            label: '禁用',
            changeProp: true
          },
          {
            type: 'select',
            name: 'color',
            label: '顏色',
            changeProp: true,
            options: [
              { value: 'default', name: 'Default' },
              { value: 'primary', name: 'Primary' },
              { value: 'secondary', name: 'Secondary' }
            ]
          },
          {
            type: 'select',
            name: 'size',
            label: '大小',
            changeProp: true,
            options: [
              { value: 'small', name: 'Small' },
              { value: 'medium', name: 'Medium' }
            ]
          }
        ],
        style: {
          'margin': '8px',
          'display': 'inline-block'
        }
      }
    },
    view: {
      onRender() {
        this.updateContent();
      },
      updateContent() {
        const model = this.model;
        const checked = model.get('checked') || false;
        const disabled = model.get('disabled') || false;
        const color = model.get('color') || 'primary';
        const size = model.get('size') || 'medium';

        const switchSize = size === 'small' ? '35px' : '58px';
        const switchHeight = size === 'small' ? '20px' : '38px';
        const thumbSize = size === 'small' ? '16px' : '20px';

        const colorMap = {
          default: '#fafafa',
          primary: '#1976d2',
          secondary: '#dc004e'
        };

        const activeColor = checked ? colorMap[color as keyof typeof colorMap] : '#fafafa';
        const trackColor = checked ? (disabled ? 'rgba(0, 0, 0, 0.12)' : activeColor + '80') : (disabled ? 'rgba(0, 0, 0, 0.12)' : 'rgba(0, 0, 0, 0.38)');

        const switchHTML = `
          <span class="MuiSwitch-root MuiSwitch-size${size.charAt(0).toUpperCase() + size.slice(1)} ${disabled ? 'Mui-disabled' : ''}"
                style="
                  display: inline-flex;
                  width: ${switchSize};
                  height: ${switchHeight};
                  overflow: hidden;
                  padding: 12px;
                  box-sizing: border-box;
                  position: relative;
                  flex-shrink: 0;
                  z-index: 0;
                  vertical-align: middle;
                  outline: 0;
                  border: 0;
                  margin: 0;
                  border-radius: 0;
                  cursor: ${disabled ? 'default' : 'pointer'};
                  background-color: transparent;
                  -webkit-tap-highlight-color: transparent;
                ">
            <span class="MuiSwitch-switchBase ${checked ? 'Mui-checked' : ''} ${disabled ? 'Mui-disabled' : ''}"
                  style="
                    top: 0;
                    left: 0;
                    z-index: 1;
                    color: #fff;
                    position: absolute;
                    transition: left 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, transform 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
                    padding: 9px;
                    transform: translateX(${checked ? (size === 'small' ? '14px' : '22px') : '0px'});
                  ">
              <span class="MuiSwitch-thumb"
                    style="
                      width: ${thumbSize};
                      height: ${thumbSize};
                      background-color: ${disabled ? '#bdbdbd' : (checked ? activeColor : '#fafafa')};
                      border-radius: 50%;
                      box-shadow: 0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12);
                    ">
              </span>
            </span>
            <span class="MuiSwitch-track"
                  style="
                    height: 100%;
                    width: 100%;
                    border-radius: ${size === 'small' ? '10px' : '19px'};
                    z-index: -1;
                    transition: opacity 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, background-color 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
                    background-color: ${trackColor};
                    opacity: ${disabled ? '0.12' : '1'};
                  ">
            </span>
          </span>
        `;
        
        this.el.innerHTML = switchHTML;
      }
    }
  });

  // 添加 Material UI 區塊到區塊管理器
  editor.Blocks.add('mui-button', {
    label: `
      <div style="display: flex; flex-direction: column; align-items: center; font-size: 11px;">
        <div style="width: 32px; height: 20px; background: #1976d2; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: white; font-size: 8px; margin-bottom: 4px;">BTN</div>
        <span>MUI 按鈕</span>
      </div>
    `,
    category: 'Material UI',
    content: { type: 'mui-button' },
    attributes: { class: 'gjs-block-mui' }
  });

  editor.Blocks.add('mui-textfield', {
    label: `
      <div style="display: flex; flex-direction: column; align-items: center; font-size: 11px;">
        <div style="width: 32px; height: 20px; border: 2px solid #1976d2; border-radius: 4px; display: flex; align-items: center; justify-content: center; background: white; margin-bottom: 4px;">
          <div style="width: 20px; height: 1px; background: #1976d2;"></div>
        </div>
        <span>MUI 輸入框</span>
      </div>
    `,
    category: 'Material UI',
    content: { type: 'mui-textfield' },
    attributes: { class: 'gjs-block-mui' }
  });

  editor.Blocks.add('mui-card', {
    label: `
      <div style="display: flex; flex-direction: column; align-items: center; font-size: 11px;">
        <div style="width: 32px; height: 24px; background: white; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.2); display: flex; flex-direction: column; padding: 2px; margin-bottom: 4px;">
          <div style="width: 100%; height: 4px; background: #e0e0e0; border-radius: 1px; margin-bottom: 2px;"></div>
          <div style="width: 80%; height: 2px; background: #e0e0e0; border-radius: 1px; margin-bottom: 1px;"></div>
          <div style="width: 60%; height: 2px; background: #e0e0e0; border-radius: 1px;"></div>
        </div>
        <span>MUI 卡片</span>
      </div>
    `,
    category: 'Material UI',
    content: { type: 'mui-card' },
    attributes: { class: 'gjs-block-mui' }
  });

  editor.Blocks.add('mui-chip', {
    label: `
      <div style="display: flex; flex-direction: column; align-items: center; font-size: 11px;">
        <div style="width: 32px; height: 16px; background: #e0e0e0; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 8px; margin-bottom: 4px;">標籤</div>
        <span>MUI 標籤</span>
      </div>
    `,
    category: 'Material UI',
    content: { type: 'mui-chip' },
    attributes: { class: 'gjs-block-mui' }
  });

  editor.Blocks.add('mui-alert', {
    label: `
      <div style="display: flex; flex-direction: column; align-items: center; font-size: 11px;">
        <div style="width: 32px; height: 18px; background: #e3f2fd; border: 1px solid #bbdefb; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 8px; color: #0288d1; margin-bottom: 4px;">ℹ️</div>
        <span>MUI 警告</span>
      </div>
    `,
    category: 'Material UI',
    content: { type: 'mui-alert' },
    attributes: { class: 'gjs-block-mui' }
  });

  editor.Blocks.add('mui-avatar', {
    label: `
      <div style="display: flex; flex-direction: column; align-items: center; font-size: 11px;">
        <div style="width: 24px; height: 24px; background: #bdbdbd; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 8px; color: white; margin-bottom: 4px;">U</div>
        <span>MUI 頭像</span>
      </div>
    `,
    category: 'Material UI',
    content: { type: 'mui-avatar' },
    attributes: { class: 'gjs-block-mui' }
  });

  editor.Blocks.add('mui-badge', {
    label: `
      <div style="display: flex; flex-direction: column; align-items: center; font-size: 11px;">
        <div style="position: relative; width: 24px; height: 24px; margin-bottom: 4px;">
          <div style="width: 16px; height: 16px; background: #f0f0f0; border-radius: 4px;"></div>
          <div style="position: absolute; top: -4px; right: -4px; width: 12px; height: 12px; background: #d32f2f; border-radius: 50%; font-size: 6px; color: white; display: flex; align-items: center; justify-content: center;">4</div>
        </div>
        <span>MUI 徽章</span>
      </div>
    `,
    category: 'Material UI',
    content: { type: 'mui-badge' },
    attributes: { class: 'gjs-block-mui' }
  });

  editor.Blocks.add('mui-switch', {
    label: `
      <div style="display: flex; flex-direction: column; align-items: center; font-size: 11px;">
        <div style="width: 32px; height: 16px; background: #1976d2; border-radius: 8px; position: relative; margin-bottom: 4px; opacity: 0.5;">
          <div style="position: absolute; top: 2px; right: 2px; width: 12px; height: 12px; background: white; border-radius: 50%; box-shadow: 0 1px 3px rgba(0,0,0,0.3);"></div>
        </div>
        <span>MUI 開關</span>
      </div>
    `,
    category: 'Material UI',
    content: { type: 'mui-switch' },
    attributes: { class: 'gjs-block-mui' }
  });

  // 9. Material UI Checkbox
  editor.Components.addType('mui-checkbox', {
    model: {
      defaults: {
        tagName: 'span',
        type: 'mui-checkbox',
        name: 'MUI Checkbox',
        draggable: true,
        droppable: false,
        attributes: {
          'data-mui-component': 'Checkbox'
        },
        traits: [
          {
            type: 'checkbox',
            name: 'checked',
            label: '選中狀態',
            changeProp: true
          },
          {
            type: 'checkbox',
            name: 'disabled',
            label: '禁用',
            changeProp: true
          },
          {
            type: 'select',
            name: 'color',
            label: '顏色',
            changeProp: true,
            options: [
              { value: 'default', name: 'Default' },
              { value: 'primary', name: 'Primary' },
              { value: 'secondary', name: 'Secondary' }
            ]
          },
          {
            type: 'select',
            name: 'size',
            label: '大小',
            changeProp: true,
            options: [
              { value: 'small', name: 'Small' },
              { value: 'medium', name: 'Medium' }
            ]
          },
          {
            type: 'text',
            name: 'label',
            label: '標籤',
            changeProp: true,
            placeholder: '選項標籤'
          }
        ],
        style: {
          'margin': '8px',
          'display': 'inline-flex'
        }
      }
    },
    view: {
      onRender() {
        this.updateContent();
      },
      updateContent() {
        const model = this.model;
        const checked = model.get('checked') || false;
        const disabled = model.get('disabled') || false;
        const color = model.get('color') || 'primary';
        const size = model.get('size') || 'medium';
        const label = model.get('label') || '選項';

        const colorMap = {
          default: 'rgba(0, 0, 0, 0.6)',
          primary: '#1976d2',
          secondary: '#dc004e'
        };

        const checkboxSize = size === 'small' ? '18px' : '24px';
        const iconSize = size === 'small' ? '16px' : '20px';
        const activeColor = colorMap[color as keyof typeof colorMap];

        const checkboxHTML = `
          <label class="MuiFormControlLabel-root" style="display: inline-flex; align-items: center; cursor: ${disabled ? 'default' : 'pointer'}; vertical-align: middle; margin-left: -11px; margin-right: 16px;">
            <span class="MuiButtonBase-root MuiCheckbox-root ${checked ? 'Mui-checked' : ''} ${disabled ? 'Mui-disabled' : ''} MuiCheckbox-color${color.charAt(0).toUpperCase() + color.slice(1)}"
                  style="
                    color: ${checked ? activeColor : 'rgba(0, 0, 0, 0.6)'};
                    padding: 9px;
                    border-radius: 0;
                    position: relative;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    box-sizing: border-box;
                    background-color: transparent;
                    outline: 0;
                    border: 0;
                    margin: 0;
                    cursor: ${disabled ? 'default' : 'pointer'};
                    user-select: none;
                    vertical-align: middle;
                    text-decoration: none;
                    opacity: ${disabled ? '0.38' : '1'};
                  ">
              <input type="checkbox" 
                     ${checked ? 'checked' : ''} 
                     ${disabled ? 'disabled' : ''}
                     style="position: absolute; opacity: 0; width: 100%; height: 100%; margin: 0; padding: 0; z-index: 1;" />
              <span class="MuiSvgIcon-root" style="user-select: none; width: 1em; height: 1em; display: inline-block; fill: currentColor; flex-shrink: 0; transition: fill 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms; font-size: ${iconSize};">
                ${checked ? `
                  <svg focusable="false" aria-hidden="true" viewBox="0 0 24 24">
                    <path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path>
                  </svg>
                ` : `
                  <svg focusable="false" aria-hidden="true" viewBox="0 0 24 24">
                    <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"></path>
                  </svg>
                `}
              </span>
            </span>
            <span class="MuiFormControlLabel-label" style="font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif; font-size: 1rem; line-height: 1.5; letter-spacing: 0.00938em; color: ${disabled ? 'rgba(0, 0, 0, 0.38)' : 'rgba(0, 0, 0, 0.87)'};">
              ${label}
            </span>
          </label>
        `;
        
        this.el.innerHTML = checkboxHTML;
      }
    }
  });

  // 10. Material UI Radio
  editor.Components.addType('mui-radio', {
    model: {
      defaults: {
        tagName: 'span',
        type: 'mui-radio',
        name: 'MUI Radio',
        draggable: true,
        droppable: false,
        attributes: {
          'data-mui-component': 'Radio'
        },
        traits: [
          {
            type: 'checkbox',
            name: 'checked',
            label: '選中狀態',
            changeProp: true
          },
          {
            type: 'checkbox',
            name: 'disabled',
            label: '禁用',
            changeProp: true
          },
          {
            type: 'select',
            name: 'color',
            label: '顏色',
            changeProp: true,
            options: [
              { value: 'default', name: 'Default' },
              { value: 'primary', name: 'Primary' },
              { value: 'secondary', name: 'Secondary' }
            ]
          },
          {
            type: 'select',
            name: 'size',
            label: '大小',
            changeProp: true,
            options: [
              { value: 'small', name: 'Small' },
              { value: 'medium', name: 'Medium' }
            ]
          },
          {
            type: 'text',
            name: 'label',
            label: '標籤',
            changeProp: true,
            placeholder: '選項標籤'
          },
          {
            type: 'text',
            name: 'name',
            label: '群組名稱',
            changeProp: true,
            placeholder: 'radioGroup'
          }
        ],
        style: {
          'margin': '8px',
          'display': 'inline-flex'
        }
      }
    },
    view: {
      onRender() {
        this.updateContent();
      },
      updateContent() {
        const model = this.model;
        const checked = model.get('checked') || false;
        const disabled = model.get('disabled') || false;
        const color = model.get('color') || 'primary';
        const size = model.get('size') || 'medium';
        const label = model.get('label') || '選項';
        const name = model.get('name') || 'radioGroup';

        const colorMap = {
          default: 'rgba(0, 0, 0, 0.6)',
          primary: '#1976d2',
          secondary: '#dc004e'
        };

        const iconSize = size === 'small' ? '16px' : '20px';
        const activeColor = colorMap[color as keyof typeof colorMap];

        const radioHTML = `
          <label class="MuiFormControlLabel-root" style="display: inline-flex; align-items: center; cursor: ${disabled ? 'default' : 'pointer'}; vertical-align: middle; margin-left: -11px; margin-right: 16px;">
            <span class="MuiButtonBase-root MuiRadio-root ${checked ? 'Mui-checked' : ''} ${disabled ? 'Mui-disabled' : ''} MuiRadio-color${color.charAt(0).toUpperCase() + color.slice(1)}"
                  style="
                    color: ${checked ? activeColor : 'rgba(0, 0, 0, 0.6)'};
                    padding: 9px;
                    border-radius: 0;
                    position: relative;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    box-sizing: border-box;
                    background-color: transparent;
                    outline: 0;
                    border: 0;
                    margin: 0;
                    cursor: ${disabled ? 'default' : 'pointer'};
                    user-select: none;
                    vertical-align: middle;
                    text-decoration: none;
                    opacity: ${disabled ? '0.38' : '1'};
                  ">
              <input type="radio" 
                     name="${name}"
                     ${checked ? 'checked' : ''} 
                     ${disabled ? 'disabled' : ''}
                     style="position: absolute; opacity: 0; width: 100%; height: 100%; margin: 0; padding: 0; z-index: 1;" />
              <span class="MuiSvgIcon-root" style="user-select: none; width: 1em; height: 1em; display: inline-block; fill: currentColor; flex-shrink: 0; transition: fill 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms; font-size: ${iconSize};">
                ${checked ? `
                  <svg focusable="false" aria-hidden="true" viewBox="0 0 24 24">
                    <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"></path>
                  </svg>
                ` : `
                  <svg focusable="false" aria-hidden="true" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"></path>
                  </svg>
                `}
              </span>
            </span>
            <span class="MuiFormControlLabel-label" style="font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif; font-size: 1rem; line-height: 1.5; letter-spacing: 0.00938em; color: ${disabled ? 'rgba(0, 0, 0, 0.38)' : 'rgba(0, 0, 0, 0.87)'};">
              ${label}
            </span>
          </label>
        `;
        
        this.el.innerHTML = radioHTML;
      }
    }
  });

  // 繼續添加區塊
  editor.Blocks.add('mui-checkbox', {
    label: `
      <div style="display: flex; flex-direction: column; align-items: center; font-size: 11px;">
        <div style="width: 18px; height: 18px; border: 2px solid #1976d2; border-radius: 2px; display: flex; align-items: center; justify-content: center; background: #1976d2; color: white; margin-bottom: 4px; font-size: 10px;">✓</div>
        <span>MUI 勾選框</span>
      </div>
    `,
    category: 'Material UI',
    content: { type: 'mui-checkbox' },
    attributes: { class: 'gjs-block-mui' }
  });

  editor.Blocks.add('mui-radio', {
    label: `
      <div style="display: flex; flex-direction: column; align-items: center; font-size: 11px;">
        <div style="width: 18px; height: 18px; border: 2px solid #1976d2; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 4px;">
          <div style="width: 8px; height: 8px; background: #1976d2; border-radius: 50%;"></div>
        </div>
        <span>MUI 單選框</span>
      </div>
    `,
    category: 'Material UI',
    content: { type: 'mui-radio' },
    attributes: { class: 'gjs-block-mui' }
  });

  console.log('✅ Material UI 組件註冊完成');
};

// 輔助函數：取得顏色值
function getColorValue(color: string): string {
  const colors = {
    primary: '#1976d2',
    secondary: '#dc004e',
    success: '#2e7d32',
    error: '#d32f2f',
    warning: '#ed6c02',
    info: '#0288d1'
  };
  return colors[color as keyof typeof colors] || '#1976d2';
}

// 輔助函數：取得 hover 顏色值
function getColorValueHover(color: string): string {
  const colors = {
    primary: '#1565c0',
    secondary: '#c51162',
    success: '#1b5e20',
    error: '#c62828',
    warning: '#e65100',
    info: '#0277bd'
  };
  return colors[color as keyof typeof colors] || '#1565c0';
}

// 輔助函數：取得按鈕尺寸 padding
function getSizePadding(size: string): string {
  const paddings = {
    small: '4px 10px',
    medium: '6px 16px',
    large: '8px 22px'
  };
  return paddings[size as keyof typeof paddings] || '6px 16px';
}

// 輔助函數：取得按鈕尺寸字體大小
function getSizeFontSize(size: string): string {
  const fontSizes = {
    small: '0.8125rem',
    medium: '0.875rem',
    large: '0.9375rem'
  };
  return fontSizes[size as keyof typeof fontSizes] || '0.875rem';
}
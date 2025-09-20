/**
 * GrapesJS Custom Components Registry
 * 統一管理所有自定義組件的註冊和初始化
 */

import { registerPageComponents } from './page-components-group';
import { registerMaterialUIComponents } from './material-ui-components';

// 組件註冊介面
export interface CustomComponent {
  name: string;
  register: (editor: any) => void;
  description?: string;
  category?: string;
}

// 所有可用的自定義組件
export const customComponents: CustomComponent[] = [
  {
    name: 'page-components',
    register: registerPageComponents,
    description: '頁面組件群組 - 包含所有從 page.tsx 遷移的組件，如 Hero Section、Service Cards 等',
    category: 'Page Sections'
  },
  {
    name: 'material-ui',
    register: registerMaterialUIComponents,
    description: 'Material UI 組件 - 包含常用的 Material Design 組件如 Button、TextField、Card 等',
    category: 'Material UI'
  }
  // 未來可以在這裡添加更多組件或外掛
];

/**
 * 註冊所有自定義組件
 * @param editor GrapesJS 編輯器實例
 */
export const registerCustomComponents = (editor: any) => {
  console.log('🎨 註冊自定義組件...');
  
  customComponents.forEach((component) => {
    try {
      component.register(editor);
      console.log(`✅ 已註冊組件: ${component.name}`);
    } catch (error) {
      console.error(`❌ 註冊組件失敗 ${component.name}:`, error);
    }
  });
  
  console.log(`🎯 共註冊了 ${customComponents.length} 個自定義組件`);
};

/**
 * 取得組件清單資訊
 */
export const getComponentsList = () => {
  return customComponents.map(component => ({
    name: component.name,
    description: component.description || 'No description provided'
  }));
};

/**
 * 檢查組件是否已註冊
 */
export const isComponentRegistered = (componentName: string): boolean => {
  return customComponents.some(component => component.name === componentName);
};

export default registerCustomComponents;
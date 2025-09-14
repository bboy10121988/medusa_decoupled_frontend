/**
 * GrapesJS Custom Components Registry
 * 統一管理所有自定義組件的註冊和初始化
 */

import CarouselComponent from './carousel-component-fixed';
import StaticCarouselComponent from './static-carousel-component';
import HeroSectionComponent from './hero-section-component';

// 組件註冊介面
export interface CustomComponent {
  name: string;
  register: (editor: any) => void;
  description?: string;
}

// 所有可用的自定義組件
export const customComponents: CustomComponent[] = [
  {
    name: 'carousel',
    register: CarouselComponent,
    description: '主要橫幅輪播組件 - 支援自動播放、觸控操作和響應式設計（修復版）'
  },
  {
    name: 'static-carousel',
    register: StaticCarouselComponent,
    description: '靜態輪播組件 - 適用於前端頁面渲染，使用純 CSS 和內聯 JavaScript'
  },
  {
    name: 'hero-section',
    register: HeroSectionComponent,
    description: 'Hero 區塊組件 - 基於現有 Hero 組件的 GrapesJS 版本，支援響應式設計'
  }
  // 未來可以在這裡添加更多組件
  // {
  //   name: 'hero-section',
  //   register: HeroSectionComponent,
  //   description: '英雄區塊組件'
  // },
  // {
  //   name: 'testimonials',
  //   register: TestimonialsComponent,
  //   description: '客戶評價組件'
  // }
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
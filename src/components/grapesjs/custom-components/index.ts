/**
 * Custom Components Index
 * 統一導出所有自定義組件
 */

export { default as CarouselComponent } from './carousel-component-fixed';
export { 
  default as registerCustomComponents,
  customComponents,
  getComponentsList,
  isComponentRegistered 
} from './components-registry';

export type { CustomComponent } from './components-registry';
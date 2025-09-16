/**
 * Custom Components Index
 * 統一導出所有自定義組件
 */

export { 
  default as registerCustomComponents,
  customComponents,
  getComponentsList,
  isComponentRegistered 
} from './components-registry';

export type { CustomComponent } from './components-registry';

// 導出頁面組件相關
export {
  registerPageComponents,
  pageComponents,
  getPageComponentsList,
  isPageComponentRegistered,
  getPageComponentsByDataSource
} from './page-components-group';

export type { PageComponent } from './page-components-group';
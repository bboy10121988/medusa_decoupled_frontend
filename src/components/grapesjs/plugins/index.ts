/**
 * 自定義組件插件管理器
 * 統一管理所有自定義 GrapesJS 組件
 */

// 插件類型定義
type GrapesJSPlugin = (editor: any) => void

// 插件註冊表
export const customPlugins: GrapesJSPlugin[] = [
  // 將會匯入現成的外掛
]

// 插件載入器 - 批量載入所有自定義插件
import type { Editor } from 'grapesjs';

export interface CustomPlugin {
  name: string;
  plugin: (editor: Editor, options?: any) => void;
  options?: any;
}

export const loadCustomPlugins = (): CustomPlugin[] => {
  // Return empty array for now - ready for external plugin imports
  return [];
};

export default loadCustomPlugins
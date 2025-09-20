/**
 * 自定義組件插件管理器
 * 統一管理所有自定義 GrapesJS 組件
 */

import type { Editor } from 'grapesjs';
import safeStyleBlocks, { pluginName as safeStyleBlocksName } from './safe-style-blocks';

export interface CustomPlugin {
  name: string;
  plugin: (editor: Editor, options?: any) => void;
  options?: any;
}

export const loadCustomPlugins = (): CustomPlugin[] => {
  const plugins: CustomPlugin[] = [
    {
      name: safeStyleBlocksName,
      plugin: safeStyleBlocks,
      options: {}
    }
  ];
  
  return plugins;
};

export default loadCustomPlugins
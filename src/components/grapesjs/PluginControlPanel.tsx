/**
 * 第三方插件控制面板
 * 提供可視化介面來管理和微調第三方插件
 */

import React, { useState, useEffect, useRef } from 'react';

interface PluginBlock {
  id: string;
  label: string;
  category: string;
  attributes: any;
}

interface PluginControlPanelProps {
  editor: any;
  isVisible: boolean;
  onClose: () => void;
}

export const PluginControlPanel: React.FC<PluginControlPanelProps> = ({
  editor,
  isVisible,
  onClose
}) => {
  const [pluginBlocks, setPluginBlocks] = useState<PluginBlock[]>([]);
  const [activePlugin, setActivePlugin] = useState<string>('');
  const [modifications, setModifications] = useState<any>({});
  const originalsRef = useRef<Record<string, any>>({});
  const [cssEnabled, setCssEnabled] = useState<boolean>(true);

  useEffect(() => {
    if (editor && isVisible) {
      loadPluginBlocks();
      // 初次開啟時，強制將覆寫樣式注入到 Canvas（可關閉）
      if (cssEnabled) {
        const id = 'third-party-overrides';
        const doc = editor?.Canvas?.getDocument?.();
        if (doc && !doc.getElementById(id)) {
          const style = doc.createElement('style');
          style.id = id;
          style.textContent = thirdPartyCanvasCSS;
          doc.head.appendChild(style);
        }
      }
    }
  }, [editor, isVisible, cssEnabled]);

  // 安全檢查：確保 editor 是有效的對象且面板可見
  if (!editor || typeof editor !== 'object' || !isVisible) {
    return null;
  }

  const loadPluginBlocks = () => {
    try {
      const blockManager = editor.BlockManager;
      const thirdPartyBlocks = blockManager.getAll()
        .filter((block: any) => {
          const id = block.get('id');
          return ['countdown', 'tabs', 'custom-code', 'tooltip', 'typed', 'forms', 'carousel', 'navbar', 'section', 'column1', 'column2', 'column3', 'text', 'image', 'video', 'map', 'button', 'divider'].includes(id) || 
                 (id && (id.includes('gjs-') || id.includes('form-') || id.includes('navbar-') || id.includes('carousel-')));
        })
        .map((block: any) => ({
          id: block.get('id'),
          label: block.get('label') || block.get('id'),
          category: block.get('category') || '其他',
          attributes: block.get('attributes') || {}
        }));

      setPluginBlocks(thirdPartyBlocks);

      // 初始化原始設定
      thirdPartyBlocks.forEach((b: any) => {
        if (!originalsRef.current[b.id]) {
          const block = blockManager.get(b.id);
          originalsRef.current[b.id] = {
            label: block?.get('label'),
            category: block?.get('category'),
            attributes: { ...block?.get('attributes') },
            content: block?.get('content')
          };
        }
      });
    } catch (error) {
      console.warn('載入插件區塊失敗:', error);
    }
  };

  const applyModifications = (blockId: string, mods: any) => {
    const blockManager = editor.BlockManager;
    const block = blockManager.get(blockId);

    if (block) {
      block.set(mods);
      setModifications((prev: any) => ({ ...prev, [blockId]: mods }));
      console.log(`套用修改到區塊 ${blockId}:`, mods);
    }
  };

  const resetBlock = (blockId: string) => {
    const blockManager = editor.BlockManager;
    const block = blockManager.get(blockId);
    const original = originalsRef.current[blockId];

    if (block && original) {
      block.set(original);
      setModifications((prev: any) => {
        const newMods = { ...prev };
        delete newMods[blockId];
        return newMods;
      });
      console.log(`重置區塊 ${blockId} 到原始狀態`);
    }
  };

  const exportConfiguration = () => {
    const config = {
      modifications,
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };
    
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'third-party-plugins-config.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const selectedBlock = pluginBlocks.find(b => b.id === activePlugin);

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${
      isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
    } transition-opacity`}>
      <div className="bg-white rounded-lg w-[90vw] h-[80vh] max-w-6xl shadow-xl">
        {/* 標題列 */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-100 rounded-t-lg">
          <h2 className="text-xl font-bold text-gray-800">第三方插件控制面板</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="flex h-[600px]">
          {/* 側邊欄 - 插件列表 */}
          <div className="w-1/3 border-r bg-gray-50 overflow-y-auto">
            <div className="p-4">
              <h3 className="font-semibold mb-3 text-gray-700">插件區塊列表</h3>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-600">套用第三方樣式到畫布</span>
                <label className="inline-flex items-center cursor-pointer" aria-label="套用第三方樣式到畫布開關">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={cssEnabled}
                    onChange={(e) => {
                      const enabled = e.target.checked;
                      setCssEnabled(enabled);
                      const id = 'third-party-overrides';
                      const doc = editor?.Canvas?.getDocument?.();
                      if (doc) {
                        const existing = doc.getElementById(id);
                        if (existing) existing.remove();
                        if (enabled) {
                          const style = doc.createElement('style');
                          style.id = id;
                          style.textContent = thirdPartyCanvasCSS;
                          doc.head.appendChild(style);
                        }
                      }
                    }}
                  />
                  <span className="w-10 h-5 bg-gray-300 rounded-full peer-checked:bg-blue-600 relative">
                    <span className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-all peer-checked:left-5" />
                  </span>
                </label>
              </div>
              {pluginBlocks.map((block) => (
                <button
                  key={block.id}
                  type="button"
                  className={`p-3 mb-2 rounded cursor-pointer border transition-all w-full text-left ${
                    activePlugin === block.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                  onClick={() => setActivePlugin(block.id)}
                >
                  <div className="font-medium">{String(block.label || block.id)}</div>
                  <div className="text-sm text-gray-500">{String(block.category)}</div>
                  <div className="text-xs text-gray-400 mt-1">ID: {String(block.id)}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 右側面板 - 編輯區域 */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activePlugin ? (
              <div>
                <div className="mb-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800">
                      編輯插件: {String(selectedBlock?.label || activePlugin)}
                    </h3>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {String(selectedBlock?.category || '未知')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    ID: <code className="bg-gray-100 px-1 rounded">{String(activePlugin)}</code>
                  </p>
                </div>

                {/* 快捷操作 */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3 text-gray-700">快捷操作</h4>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => applyModifications(activePlugin, {
                        attributes: {
                          style: 'box-shadow: 0 4px 12px rgba(0,0,0,0.15); border-radius: 8px; transition: all 0.3s ease;'
                        }
                      })}
                      className="px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                    >
                      添加陰影效果
                    </button>

                    <button
                      onClick={() => resetBlock(activePlugin)}
                      className="px-3 py-2 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                    >
                      重置設定
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                請選擇左側的插件區塊進行編輯
              </div>
            )}
          </div>
        </div>

        {/* 底部操作列 */}
        <div className="border-t p-4 bg-gray-50 flex justify-between">
          <div className="text-sm text-gray-600">
            共找到 {pluginBlocks.length} 個第三方插件區塊
          </div>
          <div className="space-x-2">
            <button
              onClick={exportConfiguration}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              匯出設定
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              關閉
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 僅供編輯器畫布使用的精簡覆寫（避免與全域 CSS 重複過多）
const thirdPartyCanvasCSS = `
.gjs-row { display:flex; flex-wrap:wrap; margin:0 -15px; min-height:50px; }
.gjs-column { padding:0 15px; min-height:50px; border:2px dashed rgba(0,150,255,0.3); border-radius:4px; }
.form-input, .form-textarea, .form-select { border-radius:6px; border:2px solid #e1e5e9; padding:12px 16px; width:100%; }
.form-input:focus, .form-textarea:focus, .form-select:focus { outline:none; border-color:#007bff; box-shadow:0 0 0 3px rgba(0,123,255,0.25); }
.form-button { background:linear-gradient(45deg,#007bff,#0056b3); color:#fff; border:none; padding:12px 24px; border-radius:6px; font-weight:600; }
.carousel-arrow { position:absolute; top:50%; transform:translateY(-50%); background:rgba(0,0,0,.5); color:#fff; border:none; width:50px; height:50px; border-radius:50%; }
`;

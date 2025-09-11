'use client';

import { useEffect, useState } from 'react';
import SanityGrapesJSEditor from '@/components/grapesjs/SanityGrapesJSEditor';
import { client as sanityClient } from '@/sanity-client';

interface GrapesJSContent {
  html: string;
  css: string;
  components: string;
}

export default function StudioPage() {
  const [currentPage, setCurrentPage] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // 載入現有頁面
  useEffect(() => {
    const loadPage = async () => {
      try {
        setLoading(true);
        // 這裡可以根據需求載入特定頁面
        const pageQuery = `*[_type == "grapesJSPage"][0]{
          _id,
          title,
          slug,
          grapesContent
        }`;
        
        const page = await sanityClient.fetch(pageQuery);
        setCurrentPage(page);
      } catch (error) {
        console.error('載入頁面失敗:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPage();
  }, []);

  // 儲存到 Sanity
  const handleSave = async (content: GrapesJSContent) => {
    try {
      setSaving(true);
      
      const pageData = {
        _type: 'grapesJSPage',
        title: currentPage?.title || '新頁面',
        slug: {
          current: currentPage?.slug?.current || 'new-page'
        },
        grapesContent: {
          html: content.html,
          css: content.css,
          components: content.components
        }
      };

      if (currentPage?._id) {
        // 更新現有頁面
        await sanityClient
          .patch(currentPage._id)
          .set({ grapesContent: pageData.grapesContent })
          .commit();
        console.log('頁面已更新');
      } else {
        // 創建新頁面
        const result = await sanityClient.create(pageData);
        setCurrentPage(result);
        console.log('新頁面已創建');
      }

    } catch (error) {
      console.error('儲存到 Sanity 失敗:', error);
      alert('儲存失敗，請檢查 Sanity 設定');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* 頂部工具列 */}
      <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            🎨 Sanity + GrapesJS Studio
          </h1>
          <p className="text-sm text-gray-600">
            {currentPage ? `編輯: ${currentPage.title}` : '創建新頁面'}
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {saving && (
            <span className="text-sm text-yellow-600">儲存中...</span>
          )}
          
          <div className="text-sm text-gray-500">
            {currentPage ? `ID: ${currentPage._id.slice(-8)}` : '新頁面'}
          </div>
          
          <button
            onClick={() => window.open('/studio', '_blank')}
            className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
          >
            開啟 Sanity Studio
          </button>
        </div>
      </div>

      {/* 編輯器區域 */}
      <div className="flex-1">
        <SanityGrapesJSEditor
          onSave={handleSave}
          initialData={currentPage?.grapesContent || {}}
        />
      </div>

      {/* 狀態列 */}
      <div className="h-8 bg-gray-50 border-t border-gray-200 flex items-center justify-between px-6 text-xs text-gray-600">
        <div className="flex items-center space-x-4">
          <span>📝 Sanity CMS 整合</span>
          <span>🎨 GrapesJS 視覺編輯器</span>
          <span>⚡ 即時儲存</span>
        </div>
        <div>
          準備就緒 ✓
        </div>
      </div>
    </div>
  );
}

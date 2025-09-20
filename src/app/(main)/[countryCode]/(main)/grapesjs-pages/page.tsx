'use client';

import { useEffect, useState } from 'react';
import { client as sanityClient } from '@/sanity-client';
import SimplePageRenderer from '@/components/grapesjs/SimplePageRenderer';

interface PageData {
  _id: string;
  title: string;
  slug: { current: string };
  grapesContent?: {
    html: string;
    css: string;
    components: string;
  };
}

export default function GrapesJSPagesPage() {
  const [pages, setPages] = useState<PageData[]>([]);
  const [selectedPage, setSelectedPage] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);

  // 載入所有 GrapesJS 頁面
  useEffect(() => {
    const loadPages = async () => {
      try {
        setLoading(true);
        const pagesQuery = `*[_type == "grapesJSPage"]{
          _id,
          title,
          slug,
          grapesContent
        }`;
        
        const fetchedPages = await sanityClient.fetch(pagesQuery);
        setPages(fetchedPages);
        
        if (fetchedPages.length > 0) {
          setSelectedPage(fetchedPages[0]);
        }
      } catch (error) {
        console.error('載入頁面失敗:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPages();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">載入頁面中...</p>
        </div>
      </div>
    );
  }

  if (pages.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">📄</div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">沒有找到頁面</h2>
          <p className="text-gray-600 mb-6">請先在 Studio 中創建一些頁面</p>
          <a
            href="/tw/studio"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            前往 Studio 創建頁面
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 頂部導航 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                🎨 GrapesJS 頁面預覽
              </h1>
              <span className="ml-3 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                {pages.length} 個頁面
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={selectedPage?._id || ''}
                onChange={(e) => {
                  const page = pages.find(p => p._id === e.target.value);
                  setSelectedPage(page || null);
                }}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">選擇頁面</option>
                {pages.map(page => (
                  <option key={page._id} value={page._id}>
                    {page.title}
                  </option>
                ))}
              </select>
              
              <a
                href="/tw/studio"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
              >
                編輯頁面
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 主要內容 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedPage ? (
          <div className="space-y-6">
            {/* 頁面資訊 */}
            <div className="bg-white rounded-lg shadow-sm p-6 border">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">
                    {selectedPage.title}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    路徑: /{selectedPage.slug?.current}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">頁面 ID</div>
                  <div className="font-mono text-xs text-gray-700">
                    {selectedPage._id}
                  </div>
                </div>
              </div>
            </div>

            {/* 頁面內容預覽 */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="bg-gray-50 px-6 py-3 border-b">
                <h3 className="font-medium text-gray-900">頁面預覽</h3>
              </div>
              
              {selectedPage.grapesContent ? (
                <SimplePageRenderer 
                  htmlContent={selectedPage.grapesContent.html || '<p>頁面內容為空</p>'} 
                  cssContent={selectedPage.grapesContent.css}
                />
              ) : (
                <div className="p-12 text-center">
                  <div className="text-gray-400 text-4xl mb-4">📄</div>
                  <p className="text-gray-600">此頁面還沒有內容</p>
                  <a
                    href="/tw/studio"
                    className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    編輯頁面
                  </a>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">請選擇要預覽的頁面</p>
          </div>
        )}
      </div>
    </div>
  );
}

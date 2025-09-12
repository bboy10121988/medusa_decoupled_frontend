'use client';

import dynamic from 'next/dynamic';

// 動態導入 GrapesEditor，禁用 SSR
const GrapesEditor = dynamic(() => import('@/components/grapesjs/grapes_editor'), {
  ssr: false,
  loading: () => <div>載入編輯器中...</div>
});

export default function StudioTestPage() {
  const handleSave = (content: string) => {
    console.log('保存的完整頁面內容:', content);
    // 這裡可以添加保存到後端的邏輯
    // content 已經是完整的 HTML 頁面，包含 CSS
  };

  return (
    <div style={{ height: '100vh' }}>
      <GrapesEditor onSave={handleSave} />
    </div>
  );
}
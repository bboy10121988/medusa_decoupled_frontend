import React from 'react';

export default function PagesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="pages-editor-layout" style={{
      isolation: 'isolate', // 創建新的層疊上下文，避免 CSS 衝突
      position: 'relative',
      width: '100%',
      height: '100vh',
      color: '#000', // 確保文字顏色
      backgroundColor: '#fff' // 確保背景顏色
    }}>
      {children}
    </div>
  )
}

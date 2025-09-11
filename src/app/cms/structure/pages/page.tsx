'use client'

import ReactStudioEditor from '@/components/grapesjs/ReactStudioEditor';

export default function PagesEditorPage() {
  return (
    <div className="w-full h-screen">
      <div className="bg-gray-800 text-white p-4 border-b">
        <h1 className="text-xl font-bold">Page Editor - GrapesJS Studio</h1>
        <p className="text-gray-300 text-sm">Create and edit pages with visual editor</p>
      </div>
      <div className="w-full" style={{ height: 'calc(100vh - 80px)' }}>
        <ReactStudioEditor />
      </div>
    </div>
  );
}

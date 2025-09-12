import GrapesEditorWithSanity from '@/components/grapesjs/grapes_editor_with_sanity'
import { type GrapesJSPageData } from '@/lib/services/grapesjs-page-service'

export default function TestGrapesJSWithSanity() {
  const handleSave = (pageData: GrapesJSPageData) => {
    console.log('頁面已儲存:', pageData)
  }

  const handlePageChange = (pageId: string) => {
    console.log('切換到頁面:', pageId)
  }

  return (
    <div className="w-full h-screen">
      <GrapesEditorWithSanity 
        onSave={handleSave}
        onPageChange={handlePageChange}
      />
    </div>
  )
}
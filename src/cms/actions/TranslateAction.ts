
import { DocumentActionComponent, DocumentActionProps } from 'sanity'

export function TranslateAction(props: DocumentActionProps) {
    return {
        label: '重翻所有語言 (Re-translate All)',
        onHandle: async () => {
            try {
                // Toast not easily available here, using alert or console
                console.log('Triggering translation...')

                // Optional: Notify user start
                // window.alert('開始翻譯... (Starting translation)')

                const response = await fetch('/api/admin/translate-content', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        documentId: props.id,
                        type: props.type
                    })
                })

                const data = await response.json()
                if (!response.ok) {
                    console.error('Translation failed:', data)
                    window.alert(`翻譯失敗 (Translation Failed): ${data.error || 'Unknown error'}`)
                } else {
                    console.log('Translation success:', data)
                    window.alert('翻譯請求已發送！請稍等數秒後重新整理頁面查看結果。\n(Translation request sent! Please refresh in a few seconds.)')
                }

            } catch (error) {
                console.error('Translation trigger error:', error)
                window.alert('翻譯觸發錯誤 (Trigger Error)')
            }
        }
    }
}

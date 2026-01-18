import { DocumentActionComponent, DocumentActionDescription, DocumentActionProps, useDocumentOperation } from 'sanity'

export function PublishWithTranslation(originalPublishAction: DocumentActionComponent) {
    const PublishWithTranslationAction = (props: DocumentActionProps) => {
        const originalResult = originalPublishAction(props) as DocumentActionDescription | null
        const { patch, publish } = useDocumentOperation(props.id, props.type)

        if (!originalResult) {
            return null
        }

        return {
            ...originalResult,
            label: '發布並翻譯 (Publish & Translate)',
            onHandle: async () => {
                // 1. Execute original publish logic
                if (originalResult.onHandle) {
                    originalResult.onHandle()
                }

                // 2. Trigger Translation API
                // We use a short delay to ensure Sanity has processed the publish (if async)
                // Though ideally we listen to the mutation.
                // Simple fire-and-forget or await?
                // Use toast to notify.

                try {
                    // Toast: "Translating..."
                    console.log('Triggering translation...')

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
                        // We can't easily show toast here without useToast hook which might need correct scope
                    } else {
                        console.log('Translation success:', data)
                    }

                } catch (error) {
                    console.error('Translation trigger error:', error)
                }
            }
        }
    }
    return PublishWithTranslationAction
}

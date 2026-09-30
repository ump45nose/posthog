import { useActions, useValues } from 'kea'

import { Text } from '@posthog/quill'

import { CanvasComposer } from '../../scene/CanvasComposer'
import { canvasSceneLogic } from '../../scene/canvasSceneLogic'
import { canvasChatLogic } from './canvasChatLogic'

/** Sends a follow-up to the viewer's run, or starts one when they have none. */
export function CanvasChatComposer(): JSX.Element {
    const { draft, chatState, sendError } = useValues(canvasChatLogic)
    const { setDraft, sendMessage } = useActions(canvasChatLogic)
    const { generationStarting } = useValues(canvasSceneLogic)
    const live = chatState === 'running' || chatState === 'starting'

    return (
        <div className="flex flex-col gap-1.5 border-t border-border p-3">
            {sendError && (
                <Text size="xs" variant="destructive" role="alert">
                    Couldn't send your message. {sendError}
                </Text>
            )}
            <CanvasComposer
                value={draft}
                onChange={setDraft}
                onSubmit={sendMessage}
                submitting={generationStarting || chatState === 'starting'}
                placeholder={live ? 'Send the agent a message' : 'Ask for a change'}
                ariaLabel="Message the agent"
                submitLabel="Send"
                emptyHint="Write a message first"
                rows={3}
                dataAttr="canvas-chat"
            />
        </div>
    )
}

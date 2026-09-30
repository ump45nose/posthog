import { useActions, useValues } from 'kea'
import { useEffect, useRef, useState } from 'react'

import { Heading, Item, ItemContent, ItemDescription, ItemMedia, ItemTitle, Text } from '@posthog/quill'

import { newCanvasDialogLogic } from '../newCanvas/newCanvasDialogLogic'
import { CanvasComposer } from './CanvasComposer'
import { CANVAS_GENERATE_SUGGESTIONS } from './canvasGenerateSuggestions'
import { canvasSceneLogic } from './canvasSceneLogic'

/** The composer for a canvas with nothing to render: describe it and an agent builds it. */
export function CanvasGenerateHero({ notice }: { notice?: string }): JSX.Element {
    const { canvas, generationStarting, generationError } = useValues(canvasSceneLogic)
    const { generateCanvas } = useActions(canvasSceneLogic)
    const { pendingComposerFocusId } = useValues(newCanvasDialogLogic)
    const { composerFocused } = useActions(newCanvasDialogLogic)
    const [instruction, setInstruction] = useState('')
    const [fromSuggestion, setFromSuggestion] = useState(false)
    // quill's textarea does not forward refs, so focus goes through its form.
    const formRef = useRef<HTMLFormElement>(null)
    const focusComposer = (): void => formRef.current?.querySelector('textarea')?.focus()

    // A canvas made from the new canvas dialog opens with the composer focused.
    useEffect(() => {
        if (canvas && pendingComposerFocusId === canvas.id) {
            focusComposer()
            composerFocused()
        }
        // oxlint-disable-next-line react-hooks/exhaustive-deps -- focusComposer only reads a ref
    }, [canvas, pendingComposerFocusId, composerFocused])

    const submit = (): void => generateCanvas(instruction, fromSuggestion)

    return (
        <div className="flex h-full w-full flex-col items-center overflow-y-auto px-4 py-10">
            <div className="flex w-full max-w-160 flex-col gap-5">
                <div className="flex flex-col items-center gap-1 text-center">
                    <Heading render={<h2 />} size="lg">
                        Build a canvas
                    </Heading>
                    <Text size="sm" variant="muted">
                        Describe what you want and an agent builds it.
                    </Text>
                    {notice && (
                        <Text size="sm" variant="muted">
                            {notice}
                        </Text>
                    )}
                </div>
                <CanvasComposer
                    formRef={formRef}
                    value={instruction}
                    onChange={(value) => {
                        setInstruction(value)
                        setFromSuggestion(false)
                    }}
                    onSubmit={submit}
                    submitting={generationStarting}
                    placeholder="A chart of daily signups for the last 30 days, with the total at the top"
                    ariaLabel="Describe the canvas"
                    submitLabel="Build canvas"
                    emptyHint="Describe the canvas first"
                    rows={4}
                    dataAttr="canvas-generate"
                />
                {generationError && !generationStarting && (
                    <Text size="sm" variant="destructive" role="alert">
                        The agent didn't start. {generationError}
                    </Text>
                )}
                <div className="flex flex-col gap-2">
                    <Text size="xs" variant="muted" weight="medium">
                        Suggestions
                    </Text>
                    <div className="@container/canvas-suggestions">
                        <div className="grid grid-cols-1 gap-2 @min-[28rem]/canvas-suggestions:grid-cols-2">
                            {CANVAS_GENERATE_SUGGESTIONS.map((suggestion) => (
                                <Item
                                    key={suggestion.label}
                                    variant="pressable"
                                    size="sm"
                                    render={
                                        <button
                                            type="button"
                                            className="text-left"
                                            onClick={() => {
                                                setInstruction(suggestion.prompt)
                                                setFromSuggestion(true)
                                                focusComposer()
                                            }}
                                            data-attr="canvas-generate-suggestion"
                                        />
                                    }
                                >
                                    <ItemMedia variant="icon">
                                        <suggestion.icon />
                                    </ItemMedia>
                                    <ItemContent>
                                        <ItemTitle>{suggestion.label}</ItemTitle>
                                        <ItemDescription>{suggestion.description}</ItemDescription>
                                    </ItemContent>
                                </Item>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

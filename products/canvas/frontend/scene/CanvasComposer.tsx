import { ChangeEvent, KeyboardEvent, Ref } from 'react'

import { IconSend } from '@posthog/icons'
import {
    Button,
    InputGroup,
    InputGroupAddon,
    InputGroupTextarea,
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@posthog/quill'

export interface CanvasComposerProps {
    value: string
    onChange: (value: string) => void
    onSubmit: () => void
    /** A send is in flight. The send button shows a spinner and the text stays put. */
    submitting: boolean
    placeholder: string
    ariaLabel: string
    submitLabel: string
    emptyHint: string
    rows: number
    /** Prefix for the `-input` and `-submit` data-attr values. */
    dataAttr: string
    /** quill's textarea does not forward refs, so a caller focuses it through the form. */
    formRef?: Ref<HTMLFormElement>
}

/** The text box that tells an agent what to build or change on a canvas. Enter sends, Shift+Enter adds a line. */
export function CanvasComposer({
    value,
    onChange,
    onSubmit,
    submitting,
    placeholder,
    ariaLabel,
    submitLabel,
    emptyHint,
    rows,
    dataAttr,
    formRef,
}: CanvasComposerProps): JSX.Element {
    const submit = (): void => {
        if (value.trim() && !submitting) {
            onSubmit()
        }
    }

    return (
        <form
            ref={formRef}
            onSubmit={(event) => {
                event.preventDefault()
                submit()
            }}
        >
            <InputGroup>
                <InputGroupTextarea
                    aria-label={ariaLabel}
                    placeholder={placeholder}
                    rows={rows}
                    value={value}
                    disabled={submitting}
                    onChange={(event: ChangeEvent<HTMLTextAreaElement>) => onChange(event.target.value)}
                    onKeyDown={(event: KeyboardEvent<HTMLTextAreaElement>) => {
                        if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                            event.preventDefault()
                            submit()
                        }
                    }}
                    data-attr={`${dataAttr}-input`}
                />
                <InputGroupAddon align="block-end" className="justify-end">
                    <Tooltip>
                        <TooltipTrigger
                            render={
                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="icon-sm"
                                    aria-label={submitLabel}
                                    loading={submitting}
                                    disabled={!value.trim()}
                                    data-attr={`${dataAttr}-submit`}
                                />
                            }
                        >
                            <IconSend />
                        </TooltipTrigger>
                        <TooltipContent>{value.trim() ? submitLabel : emptyHint}</TooltipContent>
                    </Tooltip>
                </InputGroupAddon>
            </InputGroup>
        </form>
    )
}

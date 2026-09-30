import { useActions, useValues } from 'kea'

import { IconSidebarOpen } from '@posthog/icons'
import {
    Button,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@posthog/quill'

import { canvasEditLogic } from '../editing/canvasEditLogic'
import { CANVAS_PANEL_TABS, CanvasPanelTab } from './canvasPanelTabs'
import { canvasSidePanelLogic } from './canvasSidePanelLogic'
import { CanvasSidePanelTabBody } from './CanvasSidePanelTabBody'
import { canvasCommentsLogic } from './comments/canvasCommentsLogic'

/** The canvas's right-hand panel: the agent chat, the blocks editor while editing, comment threads, and version timeline. */
export function CanvasSidePanel({ canvasId }: { canvasId: string }): JSX.Element {
    const { tab } = useValues(canvasSidePanelLogic)
    const { selectTab, setCollapsed } = useActions(canvasSidePanelLogic)
    const { commentsEnabled } = useValues(canvasCommentsLogic)
    const { editing } = useValues(canvasEditLogic)
    const visibleTab: CanvasPanelTab =
        (tab === 'comments' && !commentsEnabled) || (tab === 'blocks' && !editing) ? 'chat' : tab

    return (
        <Tabs
            value={visibleTab}
            onValueChange={(value: CanvasPanelTab) => selectTab(value, canvasId)}
            className="flex h-full min-h-0 flex-col gap-0"
        >
            <div className="flex min-h-12 shrink-0 items-center gap-1 border-b border-border bg-chrome px-2 py-1.5">
                <TabsList aria-label="Canvas panel" className="min-w-0">
                    {CANVAS_PANEL_TABS.filter(({ key }) => key !== 'blocks' || editing).map(({ key, label, Icon }) => (
                        <TabsTrigger
                            key={key}
                            value={key}
                            disabled={key === 'comments' && !commentsEnabled}
                            data-attr={`canvas-panel-tab-${key}`}
                        >
                            <Icon />
                            {label}
                        </TabsTrigger>
                    ))}
                </TabsList>
                <div className="flex-1" />
                <Tooltip>
                    <TooltipTrigger
                        delay={0}
                        render={
                            <Button
                                size="icon-sm"
                                variant="default"
                                aria-label="Hide panel"
                                onClick={() => setCollapsed(true, canvasId)}
                                data-attr="canvas-panel-hide"
                            />
                        }
                    >
                        <IconSidebarOpen />
                    </TooltipTrigger>
                    <TooltipContent>Hide panel</TooltipContent>
                </Tooltip>
            </div>
            <TabsContent value={visibleTab} className="min-h-0 flex-1">
                <CanvasSidePanelTabBody tab={visibleTab} canvasId={canvasId} />
            </TabsContent>
        </Tabs>
    )
}

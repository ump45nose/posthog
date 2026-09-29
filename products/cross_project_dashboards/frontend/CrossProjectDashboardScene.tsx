import { useActions, useValues } from 'kea'

import { IconPlus } from '@posthog/icons'
import { LemonButton, LemonSkeleton } from '@posthog/lemon-ui'

import { SceneExport } from 'scenes/sceneTypes'

import { SceneContent } from '~/layout/scenes/components/SceneContent'
import { SceneTitleSection } from '~/layout/scenes/components/SceneTitleSection'

import { addCrossProjectTileLogic } from './addCrossProjectTileLogic'
import { AddCrossProjectTileModal } from './AddCrossProjectTileModal'
import { crossProjectDashboardLogic } from './crossProjectDashboardLogic'
import { CrossProjectTile } from './CrossProjectTile'

export const scene: SceneExport = {
    component: CrossProjectDashboardScene,
    logic: crossProjectDashboardLogic,
    paramsToProps: ({ params: { id } }): (typeof crossProjectDashboardLogic)['props'] => ({ id }),
}

export function CrossProjectDashboardScene(): JSX.Element {
    const { dashboard, dashboardLoading, tiles } = useValues(crossProjectDashboardLogic)
    const { openModal } = useActions(
        addCrossProjectTileLogic({ dashboardId: dashboard?.id ?? '', existingTiles: tiles })
    )

    return (
        <SceneContent>
            <SceneTitleSection
                name={dashboard?.name ?? ''}
                description={dashboard?.description ?? null}
                resourceType={{ type: 'dashboard' }}
                actions={
                    dashboard ? (
                        <LemonButton
                            type="primary"
                            icon={<IconPlus />}
                            onClick={openModal}
                            data-attr="cross-project-add-tile"
                        >
                            Add insight
                        </LemonButton>
                    ) : undefined
                }
            />
            {dashboardLoading ? (
                <LemonSkeleton className="h-60 w-full" />
            ) : !dashboard ? (
                <p>This dashboard is not available.</p>
            ) : tiles.length === 0 ? (
                <p>No tiles yet. Add an insight from any project you can reach.</p>
            ) : (
                <div className="grid grid-cols-1 @lg/scene:grid-cols-2 gap-4">
                    {tiles.map((tile) => (
                        <CrossProjectTile
                            key={tile.id}
                            projectId={tile.project_id}
                            insightId={tile.insight_id}
                            filtersOverride={(dashboard.filters as Record<string, unknown> | undefined) ?? undefined}
                        />
                    ))}
                </div>
            )}
            {dashboard ? <AddCrossProjectTileModal dashboardId={dashboard.id} existingTiles={tiles} /> : null}
        </SceneContent>
    )
}
